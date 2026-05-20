/**
 * Pipeline Executor — Graph-Driven
 *
 * Executes pipeline steps by following exec wires (like Unreal Blueprints).
 * Data only flows between nodes that are physically connected by data wires.
 * Nodes without exec wires are NOT executed.
 */

import {
  PipelineStep,
  PipelineEdge,
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
    ended: boolean;
  };
}

/** The result returned after pipeline execution */
export interface PipelineResult {
  status: number;
  body: any;
  trace: PipelineTraceEntry[];
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

// ── Graph structures ──────────────────────────────────────────────────

/** Exec adjacency: which step(s) to run next from a given exec-out handle */
interface ExecAdjacency {
  [sourceHandle: string]: string; // sourceHandle → target stepId
}

/** Data wire: what source feeds a given input pin */
interface DataWireSource {
  sourceStepId: string;
  sourceHandle: string;
}

/** Per-step stored outputs keyed by output handle ID */
type StepOutputs = Map<string, Map<string, any>>;

// ── Exec handle IDs ───────────────────────────────────────────────────

const EXEC_HANDLES = new Set([
  "exec-in", "exec-out", "exec-pass", "exec-fail",
  "exec-true", "exec-false", "exec-match", "exec-mismatch",
]);

// ── Helpers ───────────────────────────────────────────────────────────

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Resolve a dot-path against the pipeline context.
 * Shorthand: "body.x" → "request.body.x", etc.
 */
function resolveContextPath(ctx: PipelineContext, path: string): any {
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

// ── Graph building ────────────────────────────────────────────────────

const REQUEST_NODE_ID = "__request__";

/**
 * Build adjacency maps from edges:
 * - execAdj: stepId → { execHandleId → nextStepId }
 * - dataWires: targetStepId → { targetHandle → { sourceStepId, sourceHandle } }
 */
function buildGraphMaps(edges: PipelineEdge[]) {
  const execAdj = new Map<string, ExecAdjacency>();
  const dataWires = new Map<string, Map<string, DataWireSource>>();

  for (const edge of edges) {
    const isExec =
      edge.kind === "exec" ||
      EXEC_HANDLES.has(edge.sourceHandle) ||
      EXEC_HANDLES.has(edge.targetHandle);

    if (isExec) {
      // Exec edge: source's exec-out handle → target step
      if (!execAdj.has(edge.source)) execAdj.set(edge.source, {});
      execAdj.get(edge.source)![edge.sourceHandle] = edge.target;
    } else {
      // Data edge: target's input handle ← source's output handle
      if (!dataWires.has(edge.target)) dataWires.set(edge.target, new Map());
      dataWires.get(edge.target)!.set(edge.targetHandle, {
        sourceStepId: edge.source,
        sourceHandle: edge.sourceHandle,
      });
    }
  }

  return { execAdj, dataWires };
}

/**
 * Resolve a data input for a step by tracing back through data wires.
 * Returns the value from the source step's output, or undefined if no wire.
 */
function resolveDataInput(
  targetStepId: string,
  targetHandle: string,
  dataWires: Map<string, Map<string, DataWireSource>>,
  stepOutputs: StepOutputs,
): any {
  const wires = dataWires.get(targetStepId);
  if (!wires) return undefined;
  const wire = wires.get(targetHandle);
  if (!wire) return undefined;

  const sourceOutputs = stepOutputs.get(wire.sourceStepId);
  if (!sourceOutputs) return undefined;
  return sourceOutputs.get(wire.sourceHandle);
}

// ── Step executors ────────────────────────────────────────────────────

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

// ── Main executor ─────────────────────────────────────────────────────

/**
 * Execute a pipeline by walking the exec-wire graph.
 * Only nodes reachable via exec wires from the Request node are executed.
 * Data only flows through connected data wires.
 */
export async function executePipeline(
  steps: PipelineStep[],
  request: {
    body: Record<string, any>;
    query: Record<string, any>;
    headers: Record<string, string>;
  },
  delegate?: PipelineDelegate,
  nodeEdges?: PipelineEdge[]
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
  const edges = nodeEdges || [];

  // If no edges at all, nothing to execute
  if (edges.length === 0) {
    return { status: ctx.response.status, body: ctx.response.body, trace };
  }

  const stepMap = new Map(steps.map((s) => [s.id, s]));
  const { execAdj, dataWires } = buildGraphMaps(edges);

  // Per-step output storage: stepId → Map<handleId, value>
  const stepOutputs: StepOutputs = new Map();

  // ── Seed the Request node's outputs ──────────────────────────────
  const requestOutputs = new Map<string, any>();
  for (const [key, val] of Object.entries(request.body || {})) {
    requestOutputs.set(`body-${key}`, val);
  }
  for (const [key, val] of Object.entries(request.query || {})) {
    requestOutputs.set(`query-${key}`, val);
  }
  stepOutputs.set(REQUEST_NODE_ID, requestOutputs);

  // ── Seed literal & collection node outputs (pure data, no exec needed) ──
  for (const step of steps) {
    if (step.type === "string-literal") {
      const out = new Map<string, any>();
      out.set("literal-value", step.stringLiteralConfig?.value ?? "");
      stepOutputs.set(step.id, out);
    } else if (step.type === "number-literal") {
      const out = new Map<string, any>();
      out.set("literal-value", step.numberLiteralConfig?.value ?? 0);
      stepOutputs.set(step.id, out);
    } else if (step.type === "boolean-literal") {
      const out = new Map<string, any>();
      out.set("literal-value", step.booleanLiteralConfig?.value ?? false);
      stepOutputs.set(step.id, out);
    } else if (step.type === "json-literal") {
      const out = new Map<string, any>();
      try {
        out.set("literal-value", JSON.parse(step.jsonLiteralConfig?.value || "{}"));
      } catch {
        out.set("literal-value", {});
      }
      stepOutputs.set(step.id, out);
    } else if (step.type === "collection") {
      const out = new Map<string, any>();
      out.set("collection-out", step.collectionConfig?.collectionName || "");
      stepOutputs.set(step.id, out);
    }
  }

  // ── Walk exec graph starting from Request node ──────────────────
  // Find first step: Request's exec-out target
  const requestExec = execAdj.get(REQUEST_NODE_ID);
  let currentStepId: string | undefined = requestExec?.["exec-out"];

  // Safety: max 200 steps to prevent infinite loops
  let safetyCounter = 0;
  const MAX_STEPS = 200;

  while (currentStepId && safetyCounter < MAX_STEPS) {
    safetyCounter++;
    const step = stepMap.get(currentStepId);
    if (!step) break;

    // Skip disabled steps — follow exec-out if available
    if (!step.isEnabled) {
      trace.push({
        stepId: step.id, stepLabel: step.label, stepType: step.type,
        status: "skipped", detail: "Step is disabled", durationMs: 0,
      });
      const adj = execAdj.get(step.id);
      currentStepId = adj?.["exec-out"];
      continue;
    }

    if (ctx.response.ended) {
      trace.push({
        stepId: step.id, stepLabel: step.label, stepType: step.type,
        status: "skipped", detail: "Pipeline already responded", durationMs: 0,
      });
      break;
    }

    const startTime = performance.now();
    const outputs = new Map<string, any>();

    // Helper to resolve data for a specific input handle of this step
    const getInput = (handle: string): any =>
      resolveDataInput(step.id, handle, dataWires, stepOutputs);

    // Helper to resolve collection name from data wire
    const getCollectionName = (handle: string): string => {
      const val = getInput(handle);
      return typeof val === "string" ? val : "";
    };

    // Helper to build field mapping from data wires
    const buildFieldMapping = (): Record<string, any> => {
      const mapping: Record<string, any> = {};
      const wires = dataWires.get(step.id);
      if (wires) {
        for (const [targetHandle, _source] of wires) {
          if (targetHandle.startsWith("field-")) {
            const fieldName = targetHandle.slice(6);
            const val = getInput(targetHandle);
            if (val !== undefined) mapping[fieldName] = val;
          }
        }
      }
      return mapping;
    };

    // What exec handle to follow after this step
    let nextExecHandle = "exec-out";

    try {
      switch (step.type) {
        case "validate": {
          if (!step.validateConfig) break;
          const inputData = getInput("validate-data");
          const errors: string[] = [];

          for (const rule of step.validateConfig.rules) {
            // The value to validate: if data is wired in, validate that value
            // using the rule's field as context path relative to the input
            let value: any;
            if (inputData !== undefined) {
              // If a single value was wired in, validate it directly
              if (typeof inputData !== "object" || inputData === null) {
                value = inputData;
              } else {
                // If an object was wired in, resolve field within it
                const fieldParts = rule.field.replace(/^body\./, "").split(".");
                value = inputData;
                for (const p of fieldParts) {
                  if (value && typeof value === "object") value = value[p];
                  else { value = undefined; break; }
                }
              }
            } else {
              // Fallback: resolve from context (backward compat)
              value = resolveContextPath(ctx, rule.field);
            }
            const failed = checkValidationRule(rule, value);
            if (failed) errors.push(failed);
          }

          if (errors.length > 0) {
            // Validation failed — follow exec-fail
            nextExecHandle = "exec-fail";
            // Also set context response for convenience
            ctx.response.status = step.validateConfig.failStatus || 400;
            ctx.response.body = { error: "Validation failed", details: errors };
            trace.push({
              stepId: step.id, stepLabel: step.label, stepType: step.type,
              status: "fail", detail: `Failed: ${errors.join("; ")}`,
              durationMs: Math.round(performance.now() - startTime),
            });
          } else {
            nextExecHandle = "exec-pass";
          }
          break;
        }

        case "condition": {
          if (!step.conditionConfig) break;
          const value = getInput("cond-value") ?? resolveContextPath(ctx, step.conditionConfig.field);
          const passed = evaluateCondition(value, step.conditionConfig.operator, step.conditionConfig.value);
          nextExecHandle = passed ? "exec-true" : "exec-false";

          if (!passed) {
            trace.push({
              stepId: step.id, stepLabel: step.label, stepType: step.type,
              status: "fail",
              detail: `Condition failed: ${step.conditionConfig.field} ${step.conditionConfig.operator}`,
              durationMs: Math.round(performance.now() - startTime),
            });
          }
          break;
        }

        case "set-variable": {
          if (!step.setVariableConfig) break;
          const cfg = step.setVariableConfig;
          let value: any;

          if (cfg.isLiteral) {
            value = cfg.source;
          } else {
            value = getInput("var-input") ?? resolveContextPath(ctx, cfg.source);
          }

          switch (cfg.transform) {
            case "lowercase": if (typeof value === "string") value = value.toLowerCase(); break;
            case "uppercase": if (typeof value === "string") value = value.toUpperCase(); break;
            case "trim": if (typeof value === "string") value = value.trim(); break;
            case "timestamp": value = new Date().toISOString(); break;
            case "uuid": value = generateUUID(); break;
          }

          ctx.variables[cfg.name] = value;
          outputs.set("var-out", value);
          break;
        }

        case "respond": {
          if (!step.respondConfig) break;
          const cfg = step.respondConfig;
          const statusInput = getInput("resp-status");
          ctx.response.status = statusInput != null ? Number(statusInput) : cfg.status;

          if (cfg.bodyMode === "static") {
            const bodyInput = getInput("resp-body");
            ctx.response.body = bodyInput !== undefined ? bodyInput : (cfg.staticBody ?? {});
          } else {
            const body: Record<string, any> = {};
            for (const [key, sourcePath] of Object.entries(cfg.bodyMapping || {})) {
              const wiredVal = getInput(`resp-${key}`);
              body[key] = wiredVal !== undefined ? wiredVal : resolveContextPath(ctx, sourcePath);
            }
            ctx.response.body = body;
          }
          ctx.response.ended = true;
          break;
        }

        case "db-query": {
          if (!step.dbQueryConfig || !delegate) break;
          const cfg = step.dbQueryConfig;
          const collection = getCollectionName("q-collection") || cfg.collection;

          if (!collection) throw new Error("Collection name is missing");

          const resolvedFilters = cfg.filters.map((f) => ({
            field: f.field,
            operator: f.operator,
            value: f.isLiteral ? f.value : (getInput(`filter-${f.field}`) ?? resolveContextPath(ctx, f.value)),
          }));

          const docs = await delegate.dbQuery(
            collection, resolvedFilters, cfg.orderBy, cfg.orderDirection, cfg.limit
          );

          const result = cfg.limit === 1 ? (docs[0] || null) : docs;
          ctx.variables[cfg.resultVariable] = result;
          outputs.set("query-result", result);
          // Output individual fields so they can be wired to specific inputs
          if (result && typeof result === "object" && !Array.isArray(result)) {
            for (const [key, val] of Object.entries(result)) {
              outputs.set(`qf-${key}`, val);
            }
          }
          break;
        }

        case "db-insert": {
          if (!step.dbInsertConfig || !delegate) break;
          const cfg = step.dbInsertConfig;
          const collection = getCollectionName("i-collection") || cfg.collection;

          if (!collection) throw new Error("Collection name is missing");

          // Build data from wired field inputs
          const data = buildFieldMapping();
          // Also include any fieldMapping from config as fallback
          for (const [docField, sourcePath] of Object.entries(cfg.fieldMapping)) {
            if (data[docField] === undefined) {
              const val = resolveContextPath(ctx, sourcePath);
              if (val !== undefined) data[docField] = val;
            }
          }

          const newId = await delegate.dbInsert(collection, data);
          if (cfg.resultVariable) ctx.variables[cfg.resultVariable] = newId;
          outputs.set("insert-result", newId);
          break;
        }

        case "db-update": {
          if (!step.dbUpdateConfig || !delegate) break;
          const cfg = step.dbUpdateConfig;
          const collection = getCollectionName("u-collection") || cfg.collection;
          const docId = getInput("doc-id") ?? resolveContextPath(ctx, cfg.documentId);

          if (!collection) throw new Error("Collection name is missing");
          if (!docId) throw new Error("Document ID resolved to null/undefined");

          const data = buildFieldMapping();
          for (const [docField, sourcePath] of Object.entries(cfg.fieldMapping)) {
            if (data[docField] === undefined) {
              const val = resolveContextPath(ctx, sourcePath);
              if (val !== undefined) data[docField] = val;
            }
          }

          await delegate.dbUpdate(collection, String(docId), data);
          break;
        }

        case "db-delete": {
          if (!step.dbDeleteConfig || !delegate) break;
          const cfg = step.dbDeleteConfig;
          const collection = getCollectionName("d-collection") || cfg.collection;
          const docId = getInput("doc-id") ?? resolveContextPath(ctx, cfg.documentId);

          if (!collection) throw new Error("Collection name is missing");
          if (!docId) throw new Error("Document ID resolved to null/undefined");

          await delegate.dbDelete(collection, String(docId));
          break;
        }

        case "hash": {
          if (!step.hashConfig || !delegate) break;
          const cfg = step.hashConfig;
          const plaintext = getInput("hash-input") ?? resolveContextPath(ctx, cfg.input);
          const hashed = await delegate.hashPassword(String(plaintext || ""));
          if (cfg.resultVariable) ctx.variables[cfg.resultVariable] = hashed;
          outputs.set("hash-result", hashed);
          break;
        }

        case "hash-compare": {
          if (!step.hashCompareConfig || !delegate) break;
          const cfg = step.hashCompareConfig;
          const plaintext = getInput("hc-plaintext") || "";
          const storedHash = getInput("hc-storedHash") || "";
          const match = await delegate.comparePassword(String(plaintext), String(storedHash));

          if (match) {
            nextExecHandle = "exec-match";
          } else {
            nextExecHandle = "exec-mismatch";
            trace.push({
              stepId: step.id, stepLabel: step.label, stepType: step.type,
              status: "fail", detail: "Password mismatch",
              durationMs: Math.round(performance.now() - startTime),
            });
          }
          break;
        }

        // ── Firebase Auth steps ─────────────────────────────────────────

        case "firebase-signup": {
          if (!step.firebaseSignupConfig || !delegate) break;
          const cfg = step.firebaseSignupConfig;
          const email = getInput("auth-email") ?? resolveContextPath(ctx, "body.email");
          const password = getInput("auth-password") ?? resolveContextPath(ctx, "body.password");

          if (!email || !password) {
            throw new Error("Email and password are required for Firebase signup");
          }

          const result = await delegate.firebaseSignup(String(email), String(password));
          if (cfg.resultVariable) ctx.variables[cfg.resultVariable] = result;
          outputs.set("auth-user", result);
          outputs.set("auth-uid", result.uid);
          outputs.set("auth-email", result.email);
          break;
        }

        case "firebase-login": {
          if (!step.firebaseLoginConfig || !delegate) break;
          const cfg = step.firebaseLoginConfig;
          const email = getInput("auth-email") ?? resolveContextPath(ctx, "body.email");
          const password = getInput("auth-password") ?? resolveContextPath(ctx, "body.password");

          if (!email || !password) {
            throw new Error("Email and password are required for Firebase login");
          }

          try {
            const result = await delegate.firebaseLogin(String(email), String(password));
            if (cfg.resultVariable) ctx.variables[cfg.resultVariable] = result;
            outputs.set("auth-user", result);
            outputs.set("auth-uid", result.uid);
            outputs.set("auth-email", result.email);
            outputs.set("auth-token", result.token);
            nextExecHandle = "exec-out";
          } catch (loginError: any) {
            // Firebase auth errors (wrong password, user not found, etc.)
            nextExecHandle = "exec-fail";
            trace.push({
              stepId: step.id, stepLabel: step.label, stepType: step.type,
              status: "fail", detail: `Auth failed: ${loginError.message || loginError}`,
              durationMs: Math.round(performance.now() - startTime),
            });
          }
          break;
        }

        case "firebase-signout": {
          if (!delegate) break;
          await delegate.firebaseSignout();
          break;
        }

        case "firebase-get-user": {
          if (!step.firebaseGetUserConfig || !delegate) break;
          const cfg = step.firebaseGetUserConfig;
          const result = await delegate.firebaseGetUser();
          if (cfg.resultVariable) ctx.variables[cfg.resultVariable] = result;
          outputs.set("auth-user", result);
          if (result) {
            outputs.set("auth-uid", result.uid);
            outputs.set("auth-email", result.email);
          }
          break;
        }

        // Literal & collection nodes are pure data — already seeded, skip
        case "collection":
        case "string-literal":
        case "number-literal":
        case "boolean-literal":
        case "json-literal":
          break;
      }

      // Store outputs for downstream data wires
      if (outputs.size > 0) {
        stepOutputs.set(step.id, outputs);
      }

      // Add trace entry (if not already added by branching logic)
      if (!trace.some((t) => t.stepId === step.id)) {
        trace.push({
          stepId: step.id, stepLabel: step.label, stepType: step.type,
          status: "ok", durationMs: Math.round(performance.now() - startTime),
        });
      }
    } catch (error) {
      const errMsg = (error as Error).message || String(error);
      console.error(`[Pipeline] Step "${step.label}" (${step.type}) failed:`, errMsg);
      trace.push({
        stepId: step.id, stepLabel: step.label, stepType: step.type,
        status: "fail", detail: `Error: ${errMsg}`,
        durationMs: Math.round(performance.now() - startTime),
      });
      ctx.response.status = 500;
      ctx.response.body = { error: "Pipeline execution error", step: step.label, detail: errMsg };
      ctx.response.ended = true;
      break;
    }

    // Follow the exec wire to the next step
    const adj = execAdj.get(currentStepId);
    currentStepId = adj?.[nextExecHandle];
  }

  return {
    status: ctx.response.status,
    body: ctx.response.body,
    trace,
  };
}
