/**
 * Pipeline Executor — Phase 1
 *
 * Executes an ordered list of PipelineSteps against a PipelineContext.
 * Designed to be runtime-agnostic: it receives a plain context object
 * and returns a plain result, so it can be reused in export targets later.
 */

import {
  PipelineStep,
  ValidationRule,
  ValidateStepConfig,
  ConditionStepConfig,
  ConditionOperator,
  SetVariableStepConfig,
  RespondStepConfig,
  DbQueryStepConfig,
  DbInsertStepConfig,
  DbUpdateStepConfig,
  DbDeleteStepConfig,
  HashStepConfig,
  HashCompareStepConfig,
} from "@/types/backend";
import type { PipelineDelegate } from "@/lib/pipeline-delegates";

// ── Context & Result types ────────────────────────────────────────────

/** The shared context passed through every pipeline step */
export interface PipelineContext {
  request: {
    body: Record<string, any>;
    query: Record<string, any>;
    headers: Record<string, string>;
  };
  variables: Record<string, any>;
  response: {
    status: number;
    body: any;
    ended: boolean; // true when a Respond step or short-circuit fires
  };
}

/** The result returned after pipeline execution */
export interface PipelineResult {
  status: number;
  body: any;
  trace: PipelineTraceEntry[]; // Step-by-step execution log (for debugging)
}

/** A single entry in the execution trace */
export interface PipelineTraceEntry {
  stepId: string;
  stepLabel: string;
  stepType: string;
  status: "ok" | "fail" | "skipped";
  detail?: string;
  durationMs: number;
}

// ── Helpers ───────────────────────────────────────────────────────────

/**
 * Resolve a dot-path like "body.email" or "variables.user.name"
 * against the pipeline context.
 *
 * Shorthand rules:
 *   "body.x"      → "request.body.x"
 *   "query.x"     → "request.query.x"
 *   "headers.x"   → "request.headers.x"
 *   "hashedPw"    → tries top-level first, falls back to "variables.hashedPw"
 */
function resolveContextPath(ctx: PipelineContext, path: string): any {
  // Support shorthand: "body.x" → "request.body.x"
  let normalizedPath = path;
  if (normalizedPath.startsWith("body.") || normalizedPath === "body") {
    normalizedPath = "request." + normalizedPath;
  }
  if (normalizedPath.startsWith("query.") || normalizedPath === "query") {
    normalizedPath = "request." + normalizedPath;
  }
  if (normalizedPath.startsWith("headers.") || normalizedPath === "headers") {
    normalizedPath = "request." + normalizedPath;
  }

  const resolve = (p: string): any => {
    const parts = p.split(".");
    let current: any = ctx;
    for (const part of parts) {
      if (current == null || typeof current !== "object") return undefined;
      current = current[part];
    }
    return current;
  };

  const result = resolve(normalizedPath);

  // Fallback: if the path didn't start with a known prefix and resolved to
  // undefined, try again under "variables." — this lets users write
  // "hashedPassword" instead of "variables.hashedPassword" in field mappings.
  if (
    result === undefined &&
    !path.startsWith("request.") &&
    !path.startsWith("body.") &&
    !path.startsWith("query.") &&
    !path.startsWith("headers.") &&
    !path.startsWith("variables.") &&
    !path.startsWith("response.")
  ) {
    const variableResult = resolve("variables." + normalizedPath);
    if (variableResult !== undefined) return variableResult;
  }

  return result;
}

/**
 * Simple email regex — good enough for validation, not for parsing.
 */
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Generate a v4-style UUID (crypto-safe when available, Math.random fallback).
 */
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ── Step executors ────────────────────────────────────────────────────

function executeValidateStep(
  ctx: PipelineContext,
  config: ValidateStepConfig
): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const rule of config.rules) {
    const value = resolveContextPath(ctx, rule.field);
    const failed = checkValidationRule(rule, value);
    if (failed) {
      errors.push(rule.errorMessage || failed);
    }
  }

  return { ok: errors.length === 0, errors };
}

function checkValidationRule(rule: ValidationRule, value: any): string | null {
  switch (rule.rule) {
    case "required":
      if (value === undefined || value === null || value === "") {
        return `${rule.field} is required`;
      }
      return null;

    case "email":
      if (typeof value !== "string" || !isValidEmail(value)) {
        return `${rule.field} must be a valid email`;
      }
      return null;

    case "minLength":
      if (typeof value !== "string" || value.length < Number(rule.value || 0)) {
        return `${rule.field} must be at least ${rule.value} characters`;
      }
      return null;

    case "maxLength":
      if (typeof value !== "string" || value.length > Number(rule.value || Infinity)) {
        return `${rule.field} must be at most ${rule.value} characters`;
      }
      return null;

    case "min":
      if (typeof value !== "number" || value < Number(rule.value || 0)) {
        return `${rule.field} must be at least ${rule.value}`;
      }
      return null;

    case "max":
      if (typeof value !== "number" || value > Number(rule.value || Infinity)) {
        return `${rule.field} must be at most ${rule.value}`;
      }
      return null;

    case "regex": {
      try {
        const re = new RegExp(String(rule.value || ""));
        if (typeof value !== "string" || !re.test(value)) {
          return `${rule.field} does not match the required pattern`;
        }
      } catch {
        return `${rule.field}: invalid regex pattern`;
      }
      return null;
    }

    case "equals":
      // eslint-disable-next-line eqeqeq
      if (value != rule.value) {
        return `${rule.field} must equal ${rule.value}`;
      }
      return null;

    default:
      return null;
  }
}

function executeConditionStep(
  ctx: PipelineContext,
  config: ConditionStepConfig
): { passed: boolean } {
  const value = resolveContextPath(ctx, config.field);
  const passed = evaluateCondition(value, config.operator, config.value);
  return { passed };
}

function evaluateCondition(
  value: any,
  operator: ConditionOperator,
  compareValue?: any
): boolean {
  switch (operator) {
    case "exists":
      return value !== undefined && value !== null;
    case "notExists":
      return value === undefined || value === null;
    case "equals":
      // eslint-disable-next-line eqeqeq
      return value == compareValue;
    case "notEquals":
      // eslint-disable-next-line eqeqeq
      return value != compareValue;
    case "gt":
      return Number(value) > Number(compareValue);
    case "lt":
      return Number(value) < Number(compareValue);
    case "contains":
      if (typeof value === "string") return value.includes(String(compareValue ?? ""));
      if (Array.isArray(value)) return value.includes(compareValue);
      return false;
    default:
      return true;
  }
}

function executeSetVariableStep(
  ctx: PipelineContext,
  config: SetVariableStepConfig
): void {
  let value: any;

  if (config.isLiteral) {
    value = config.source;
  } else {
    value = resolveContextPath(ctx, config.source);
  }

  // Apply transform
  switch (config.transform) {
    case "lowercase":
      if (typeof value === "string") value = value.toLowerCase();
      break;
    case "uppercase":
      if (typeof value === "string") value = value.toUpperCase();
      break;
    case "trim":
      if (typeof value === "string") value = value.trim();
      break;
    case "timestamp":
      value = new Date().toISOString();
      break;
    case "uuid":
      value = generateUUID();
      break;
    // "none" or undefined — leave as-is
  }

  ctx.variables[config.name] = value;
}

function executeRespondStep(
  ctx: PipelineContext,
  config: RespondStepConfig
): void {
  ctx.response.status = config.status;

  if (config.bodyMode === "static") {
    ctx.response.body = config.staticBody ?? {};
  } else {
    // Mapping mode — build body from context paths
    const body: Record<string, any> = {};
    for (const [key, sourcePath] of Object.entries(config.bodyMapping || {})) {
      body[key] = resolveContextPath(ctx, sourcePath);
    }
    ctx.response.body = body;
  }

  ctx.response.ended = true;
}

// ── Main executor ─────────────────────────────────────────────────────

/**
 * Execute a pipeline of steps against a request context.
 *
 * Returns a PipelineResult with the final status, body, and
 * an execution trace for debugging.
 */
export async function executePipeline(
  steps: PipelineStep[],
  request: {
    body: Record<string, any>;
    query: Record<string, any>;
    headers: Record<string, string>;
  },
  delegate?: PipelineDelegate
): Promise<PipelineResult> {
  const ctx: PipelineContext = {
    request,
    variables: {},
    response: {
      status: 200,
      body: { message: "OK" },
      ended: false,
    },
  };

  const trace: PipelineTraceEntry[] = [];

  for (const step of steps) {
    // Skip disabled steps
    if (!step.isEnabled) {
      trace.push({
        stepId: step.id,
        stepLabel: step.label,
        stepType: step.type,
        status: "skipped",
        detail: "Step is disabled",
        durationMs: 0,
      });
      continue;
    }

    // If a previous step ended the response, skip remaining steps
    if (ctx.response.ended) {
      trace.push({
        stepId: step.id,
        stepLabel: step.label,
        stepType: step.type,
        status: "skipped",
        detail: "Pipeline already responded",
        durationMs: 0,
      });
      continue;
    }

    const startTime = performance.now();

    try {
      switch (step.type) {
        case "validate": {
          if (!step.validateConfig) break;
          const result = executeValidateStep(ctx, step.validateConfig);
          if (!result.ok) {
            ctx.response.status = step.validateConfig.failStatus || 400;
            ctx.response.body = {
              error: "Validation failed",
              details: result.errors,
            };
            ctx.response.ended = true;
            trace.push({
              stepId: step.id,
              stepLabel: step.label,
              stepType: step.type,
              status: "fail",
              detail: `Failed: ${result.errors.join("; ")}`,
              durationMs: Math.round(performance.now() - startTime),
            });
            continue;
          }
          break;
        }

        case "condition": {
          if (!step.conditionConfig) break;
          const { passed } = executeConditionStep(ctx, step.conditionConfig);
          if (!passed) {
            if (step.conditionConfig.onFail === "respond") {
              ctx.response.status = step.conditionConfig.failStatus || 400;
              ctx.response.body = step.conditionConfig.failBody || {
                error: "Condition not met",
              };
              ctx.response.ended = true;
            }
            // "skip" → just continue to next step (condition didn't pass, but pipeline continues)
            trace.push({
              stepId: step.id,
              stepLabel: step.label,
              stepType: step.type,
              status: "fail",
              detail: `Condition failed: ${step.conditionConfig.field} ${step.conditionConfig.operator}${step.conditionConfig.value !== undefined ? " " + step.conditionConfig.value : ""}`,
              durationMs: Math.round(performance.now() - startTime),
            });
            continue;
          }
          break;
        }

        case "set-variable": {
          if (!step.setVariableConfig) break;
          executeSetVariableStep(ctx, step.setVariableConfig);
          break;
        }

        case "respond": {
          if (!step.respondConfig) break;
          executeRespondStep(ctx, step.respondConfig);
          break;
        }

        // ── Phase 2: Database steps ──────────────────────

        case "db-query": {
          if (!step.dbQueryConfig || !delegate) break;
          const cfg = step.dbQueryConfig;

          // Resolve filter values from context
          const resolvedFilters = cfg.filters.map((f) => ({
            field: f.field,
            operator: f.operator,
            value: f.isLiteral ? f.value : resolveContextPath(ctx, f.value),
          }));

          const docs = await delegate.dbQuery(
            cfg.collection,
            resolvedFilters,
            cfg.orderBy,
            cfg.orderDirection,
            cfg.limit
          );

          // Store as single doc (if limit=1) or array
          ctx.variables[cfg.resultVariable] = cfg.limit === 1 ? (docs[0] || null) : docs;
          break;
        }

        case "db-insert": {
          if (!step.dbInsertConfig || !delegate) break;
          const cfg = step.dbInsertConfig;

          if (!cfg.collection) {
            throw new Error("Collection name is missing");
          }

          // Build document data from field mapping
          const data: Record<string, any> = {};
          for (const [docField, sourcePath] of Object.entries(cfg.fieldMapping)) {
            const val = resolveContextPath(ctx, sourcePath);
            if (val !== undefined) {
              data[docField] = val;
            }
          }

          const newId = await delegate.dbInsert(cfg.collection, data);
          if (cfg.resultVariable) {
            ctx.variables[cfg.resultVariable] = newId;
          }
          break;
        }

        case "db-update": {
          if (!step.dbUpdateConfig || !delegate) break;
          const cfg = step.dbUpdateConfig;
          const docId = resolveContextPath(ctx, cfg.documentId);

          if (!cfg.collection) {
            throw new Error("Collection name is missing");
          }

          if (!docId) {
            throw new Error("Document ID resolved to null/undefined");
          }

          const data: Record<string, any> = {};
          for (const [docField, sourcePath] of Object.entries(cfg.fieldMapping)) {
            const val = resolveContextPath(ctx, sourcePath);
            if (val !== undefined) {
              data[docField] = val;
            }
          }

          await delegate.dbUpdate(cfg.collection, String(docId), data);
          break;
        }

        case "db-delete": {
          if (!step.dbDeleteConfig || !delegate) break;
          const cfg = step.dbDeleteConfig;
          const docId = resolveContextPath(ctx, cfg.documentId);

          if (!cfg.collection) {
            throw new Error("Collection name is missing");
          }

          if (!docId) {
            throw new Error("Document ID resolved to null/undefined");
          }

          await delegate.dbDelete(cfg.collection, String(docId));
          break;
        }

        // ── Phase 2: Hash step ───────────────────────────

        case "hash": {
          if (!step.hashConfig || !delegate) break;
          const cfg = step.hashConfig;
          const plaintext = resolveContextPath(ctx, cfg.input);
          const hashed = await delegate.hashPassword(String(plaintext || ""));
          if (cfg.resultVariable) {
            ctx.variables[cfg.resultVariable] = hashed;
          }
          break;
        }

        case "hash-compare": {
          if (!step.hashCompareConfig || !delegate) break;
          const cfg = step.hashCompareConfig;
          // plaintext and storedHash come from connected pins / context
          // For now, we expect them to be pre-resolved via edges or context
          // The executor uses the connected edge data
          const plaintext = ctx.variables["__hc_plaintext"] || "";
          const storedHash = ctx.variables["__hc_storedHash"] || "";
          const match = await delegate.comparePassword(
            String(plaintext),
            String(storedHash)
          );

          if (!match) {
            if (cfg.onFail === "respond") {
              ctx.response.status = cfg.failStatus || 401;
              ctx.response.body = cfg.failBody || { error: "Invalid credentials" };
              ctx.response.ended = true;
            }
            trace.push({
              stepId: step.id,
              stepLabel: step.label,
              stepType: step.type,
              status: "fail",
              detail: "Password mismatch",
              durationMs: Math.round(performance.now() - startTime),
            });
            continue;
          }
          break;
        }

        // ── Literal nodes ── store their value as a variable
        case "string-literal": {
          const val = step.stringLiteralConfig?.value ?? "";
          ctx.variables[step.label || step.id] = val;
          break;
        }
        case "number-literal": {
          const val = step.numberLiteralConfig?.value ?? 0;
          ctx.variables[step.label || step.id] = val;
          break;
        }
        case "boolean-literal": {
          const val = step.booleanLiteralConfig?.value ?? false;
          ctx.variables[step.label || step.id] = val;
          break;
        }
        case "json-literal": {
          try {
            const val = JSON.parse(step.jsonLiteralConfig?.value || "{}");
            ctx.variables[step.label || step.id] = val;
          } catch {
            ctx.variables[step.label || step.id] = {};
          }
          break;
        }
      }

      trace.push({
        stepId: step.id,
        stepLabel: step.label,
        stepType: step.type,
        status: "ok",
        durationMs: Math.round(performance.now() - startTime),
      });
    } catch (error) {
      const errMsg = (error as Error).message || String(error);
      console.error(`[Pipeline] Step "${step.label}" (${step.type}) failed:`, errMsg);
      trace.push({
        stepId: step.id,
        stepLabel: step.label,
        stepType: step.type,
        status: "fail",
        detail: `Error: ${errMsg}`,
        durationMs: Math.round(performance.now() - startTime),
      });
      // On error, short-circuit with 500
      ctx.response.status = 500;
      ctx.response.body = {
        error: "Pipeline execution error",
        step: step.label,
        detail: errMsg,
      };
      ctx.response.ended = true;
    }
  }

  return {
    status: ctx.response.status,
    body: ctx.response.body,
    trace,
  };
}
