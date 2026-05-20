"use client";

import React, { memo, useState, useRef, useEffect } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import {
  PipelineStep,
  PipelineStepType,
  STEP_TYPE_META,
  DbCollection,
} from "@/types/backend";
import {
  ShieldCheck,
  GitBranch,
  Variable,
  Send,
  Search,
  DatabaseZap,
  RefreshCw,
  Trash2,
  Lock,
  Inbox,
  ShieldOff,
  Type,
  Hash,
  ToggleLeft,
  Braces,
  TableProperties,
} from "lucide-react";

// ── Icons ─────────────────────────────────────────────────────────────
const STEP_ICONS: Record<string, React.ReactNode> = {
  request: <Inbox className="w-3.5 h-3.5" />,
  validate: <ShieldCheck className="w-3.5 h-3.5" />,
  condition: <GitBranch className="w-3.5 h-3.5" />,
  "set-variable": <Variable className="w-3.5 h-3.5" />,
  respond: <Send className="w-3.5 h-3.5" />,
  "db-query": <Search className="w-3.5 h-3.5" />,
  "db-insert": <DatabaseZap className="w-3.5 h-3.5" />,
  "db-update": <RefreshCw className="w-3.5 h-3.5" />,
  "db-delete": <Trash2 className="w-3.5 h-3.5" />,
  collection: <TableProperties className="w-3.5 h-3.5" />,
  hash: <Lock className="w-3.5 h-3.5" />,
  "hash-compare": <ShieldOff className="w-3.5 h-3.5" />,
  "string-literal": <Type className="w-3.5 h-3.5" />,
  "number-literal": <Hash className="w-3.5 h-3.5" />,
  "boolean-literal": <ToggleLeft className="w-3.5 h-3.5" />,
  "json-literal": <Braces className="w-3.5 h-3.5" />,
};

// ── Colors (Unreal Blueprint-inspired palette) ────────────────────────
const STEP_COLORS: Record<string, { bg: string; text: string; handle: string }> = {
  request:           { bg: "rgba(99,102,241,0.15)",  text: "#818cf8", handle: "#818cf8" },
  validate:          { bg: "rgba(245,158,11,0.15)",  text: "#fbbf24", handle: "#fbbf24" },
  condition:         { bg: "rgba(168,85,247,0.15)",  text: "#c084fc", handle: "#c084fc" },
  "set-variable":    { bg: "rgba(6,182,212,0.15)",   text: "#22d3ee", handle: "#22d3ee" },
  respond:           { bg: "rgba(16,185,129,0.15)",   text: "#34d399", handle: "#34d399" },
  "db-query":        { bg: "rgba(59,130,246,0.15)",   text: "#60a5fa", handle: "#60a5fa" },
  "db-insert":       { bg: "rgba(34,197,94,0.15)",    text: "#4ade80", handle: "#4ade80" },
  "db-update":       { bg: "rgba(249,115,22,0.15)",   text: "#fb923c", handle: "#fb923c" },
  "db-delete":       { bg: "rgba(239,68,68,0.15)",    text: "#f87171", handle: "#f87171" },
  collection:        { bg: "rgba(139,92,246,0.15)",   text: "#a78bfa", handle: "#a78bfa" },
  hash:              { bg: "rgba(236,72,153,0.15)",   text: "#f472b6", handle: "#f472b6" },
  "hash-compare":    { bg: "rgba(236,72,153,0.15)",   text: "#f472b6", handle: "#f472b6" },
  "string-literal":  { bg: "rgba(148,163,184,0.12)",  text: "#94a3b8", handle: "#94a3b8" },
  "number-literal":  { bg: "rgba(148,163,184,0.12)",  text: "#94a3b8", handle: "#94a3b8" },
  "boolean-literal": { bg: "rgba(148,163,184,0.12)",  text: "#94a3b8", handle: "#94a3b8" },
  "json-literal":    { bg: "rgba(148,163,184,0.12)",  text: "#94a3b8", handle: "#94a3b8" },
};

// ── Handle defs ───────────────────────────────────────────────────────
export interface HandleDef {
  id: string;
  label: string;
  type: "source" | "target";
  kind: "exec" | "data";
}

/**
 * Build handle definitions for a pipeline step.
 * Each configurable property gets its own data pin — no exec pins.
 *
 * @param step - The pipeline step to build handles for
 * @param dbSchema - All DB collections (used to derive field pins on DB nodes)
 * @param connectedCollectionName - Name of the collection wired into this node's collection input
 */
export function getStepHandles(
  step: PipelineStep,
  dbSchema?: DbCollection[],
  connectedCollectionName?: string,
): { inputs: HandleDef[]; outputs: HandleDef[] } {
  const inputs: HandleDef[] = [];
  const outputs: HandleDef[] = [];

  // Helper: get fields for a connected collection from schema
  const getSchemaFields = (): string[] => {
    if (!connectedCollectionName || !dbSchema) return [];
    const col = dbSchema.find((c) => c.name === connectedCollectionName);
    return col ? col.fields.map((f) => f.name) : [];
  };

  // Helper: add standard exec-in pin
  const addExecIn = () => inputs.push({ id: "exec-in", label: "▶", type: "target", kind: "exec" });
  // Helper: add standard exec-out pin
  const addExecOut = () => outputs.push({ id: "exec-out", label: "▶", type: "source", kind: "exec" });

  switch (step.type) {
    case "validate":
      addExecIn();
      inputs.push({ id: "validate-data", label: "data", type: "target", kind: "data" });
      outputs.push({ id: "exec-pass", label: "✓ pass", type: "source", kind: "exec" });
      outputs.push({ id: "exec-fail", label: "✗ fail", type: "source", kind: "exec" });
      break;

    case "condition":
      addExecIn();
      inputs.push({
        id: "cond-value",
        label: (step.conditionConfig?.field || "value").replace(/^(body\.|variables\.|query\.)/, ""),
        type: "target",
        kind: "data",
      });
      outputs.push({ id: "exec-true", label: "✓ true", type: "source", kind: "exec" });
      outputs.push({ id: "exec-false", label: "✗ false", type: "source", kind: "exec" });
      break;

    case "set-variable":
      addExecIn();
      if (!step.setVariableConfig?.isLiteral) {
        inputs.push({
          id: "var-input",
          label: step.setVariableConfig?.source?.replace(/^(body\.|query\.|variables\.)/, "") || "input",
          type: "target",
          kind: "data",
        });
      }
      addExecOut();
      outputs.push({
        id: "var-out",
        label: step.setVariableConfig?.name || "variable",
        type: "source",
        kind: "data",
      });
      break;

    case "respond":
      addExecIn();
      inputs.push({ id: "resp-status", label: "status", type: "target", kind: "data" });
      if (step.respondConfig?.bodyMode === "mapping" && step.respondConfig.bodyMapping) {
        Object.keys(step.respondConfig.bodyMapping).forEach((key) => {
          inputs.push({ id: `resp-${key}`, label: key, type: "target", kind: "data" });
        });
      } else {
        inputs.push({ id: "resp-body", label: "body", type: "target", kind: "data" });
      }
      // Respond is a terminal node — no exec out
      break;

    case "db-query": {
      addExecIn();
      inputs.push({ id: "q-collection", label: "collection", type: "target", kind: "data" });
      const qFields = getSchemaFields();
      if (qFields.length > 0) {
        qFields.forEach((fn) => {
          inputs.push({ id: `filter-${fn}`, label: fn, type: "target", kind: "data" });
        });
      } else {
        step.dbQueryConfig?.filters?.forEach((f, i) => {
          if (!f.isLiteral) {
            inputs.push({ id: `filter-${i}`, label: f.field || `filter${i}`, type: "target", kind: "data" });
          }
        });
      }
      inputs.push({ id: "q-orderBy", label: "orderBy", type: "target", kind: "data" });
      inputs.push({ id: "q-limit", label: "limit", type: "target", kind: "data" });
      addExecOut();
      outputs.push({
        id: "query-result",
        label: step.dbQueryConfig?.resultVariable || "result",
        type: "source",
        kind: "data",
      });
      // Per-field outputs so individual fields can be wired (e.g. .password → hash-compare)
      const qOutFields = getSchemaFields();
      if (qOutFields.length > 0) {
        qOutFields.forEach((fn) => {
          outputs.push({ id: `qf-${fn}`, label: `.${fn}`, type: "source", kind: "data" });
        });
      }
      break;
    }

    case "db-insert": {
      addExecIn();
      inputs.push({ id: "i-collection", label: "collection", type: "target", kind: "data" });
      const iFields = getSchemaFields();
      if (iFields.length > 0) {
        iFields.forEach((fn) => {
          inputs.push({ id: `field-${fn}`, label: fn, type: "target", kind: "data" });
        });
      } else if (step.dbInsertConfig?.fieldMapping) {
        Object.keys(step.dbInsertConfig.fieldMapping).forEach((fn) => {
          inputs.push({ id: `field-${fn}`, label: fn, type: "target", kind: "data" });
        });
      }
      addExecOut();
      outputs.push({
        id: "insert-result",
        label: step.dbInsertConfig?.resultVariable || "newId",
        type: "source",
        kind: "data",
      });
      break;
    }

    case "db-update": {
      addExecIn();
      inputs.push({ id: "u-collection", label: "collection", type: "target", kind: "data" });
      inputs.push({ id: "doc-id", label: "docId", type: "target", kind: "data" });
      const uFields = getSchemaFields();
      if (uFields.length > 0) {
        uFields.forEach((fn) => {
          inputs.push({ id: `field-${fn}`, label: fn, type: "target", kind: "data" });
        });
      } else if (step.dbUpdateConfig?.fieldMapping) {
        Object.keys(step.dbUpdateConfig.fieldMapping).forEach((fn) => {
          inputs.push({ id: `field-${fn}`, label: fn, type: "target", kind: "data" });
        });
      }
      addExecOut();
      break;
    }

    case "db-delete":
      addExecIn();
      inputs.push({ id: "d-collection", label: "collection", type: "target", kind: "data" });
      inputs.push({ id: "doc-id", label: "docId", type: "target", kind: "data" });
      addExecOut();
      break;

    case "collection":
      outputs.push({
        id: "collection-out",
        label: step.collectionConfig?.collectionName || "collection",
        type: "source",
        kind: "data",
      });
      break;

    case "hash":
      addExecIn();
      inputs.push({ id: "hash-input", label: "input", type: "target", kind: "data" });
      addExecOut();
      outputs.push({
        id: "hash-result",
        label: step.hashConfig?.resultVariable || "hashed",
        type: "source",
        kind: "data",
      });
      break;

    case "hash-compare":
      addExecIn();
      inputs.push({ id: "hc-plaintext", label: "plaintext", type: "target", kind: "data" });
      inputs.push({ id: "hc-storedHash", label: "storedHash", type: "target", kind: "data" });
      outputs.push({ id: "exec-match", label: "✓ match", type: "source", kind: "exec" });
      outputs.push({ id: "exec-mismatch", label: "✗ mismatch", type: "source", kind: "exec" });
      break;

    case "string-literal":
    case "number-literal":
    case "boolean-literal":
    case "json-literal":
      outputs.push({ id: "literal-value", label: "value", type: "source", kind: "data" });
      break;
  }

  return { inputs, outputs };
}

/**
 * Build handle definitions for the Request entry node.
 * Each body/query field gets its own output data pin.
 */
export function getRequestHandles(bodyFields: string[], queryFields: string[]): HandleDef[] {
  const handles: HandleDef[] = [];
  // Exec-out: the entry point of the pipeline execution
  handles.push({ id: "exec-out", label: "▶", type: "source", kind: "exec" });
  bodyFields.forEach((f) => {
    handles.push({ id: `body-${f}`, label: f, type: "source", kind: "data" });
  });
  queryFields.forEach((f) => {
    handles.push({ id: `query-${f}`, label: `?${f}`, type: "source", kind: "data" });
  });
  return handles;
}

// ── Node Data Types ───────────────────────────────────────────────────
export interface StepNodeData {
  step: PipelineStep;
  isSelected: boolean;
  onSelect: (stepId: string) => void;
  onStepChange: (stepId: string, updates: Partial<PipelineStep>) => void;
  /** All user-defined collections from the DB schema */
  dbSchema?: DbCollection[];
  /** Name of collection wired into this node's collection input (if any) */
  connectedCollectionName?: string;
  [key: string]: unknown;
}

export interface RequestNodeData {
  bodyFields: string[];
  queryFields: string[];
  [key: string]: unknown;
}

// ── Layout constants ──────────────────────────────────────────────────
const ROW_HEIGHT = 24;
const HEADER_HEIGHT = 36;
const BODY_PAD = 6;

// ── Handle style ──────────────────────────────────────────────────────

const dataHandleStyle = (color: string): React.CSSProperties => ({
  width: 9,
  height: 9,
  background: "hsl(var(--card))",
  border: `2.5px solid ${color}`,
  borderRadius: "50%",
  boxShadow: `0 0 4px ${color}33`,
});

const execHandleStyle = (): React.CSSProperties => ({
  width: 10,
  height: 10,
  background: "hsl(var(--card))",
  border: "2.5px solid #e2e8f0",
  borderRadius: "2px",
  transform: "rotate(45deg)",
  boxShadow: "0 0 6px rgba(226,232,240,0.25)",
});

// ── Shared inline input style ─────────────────────────────────────────
const inlineInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "2px 6px",
  fontSize: 9,
  fontFamily: "ui-monospace, 'Cascadia Code', monospace",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid hsl(var(--border)/0.4)",
  borderRadius: 4,
  color: "hsl(var(--foreground))",
  outline: "none",
};

const RULE_TYPE_OPTIONS = [
  "required", "email", "minLength", "maxLength", "min", "max", "regex", "equals",
] as const;

// Extra height for inline edit areas
const VALIDATE_INLINE_HEIGHT = 52;
const LITERAL_INLINE_HEIGHT = 32;
const COLLECTION_INLINE_HEIGHT = 36;

// ── StepNode ──────────────────────────────────────────────────────────

function StepNodeComponent({ data, selected }: NodeProps) {
  const { step, onSelect, onStepChange, dbSchema, connectedCollectionName } = data as unknown as StepNodeData;
  const colors = STEP_COLORS[step.type] || STEP_COLORS.validate;
  const icon = STEP_ICONS[step.type];
  const meta = STEP_TYPE_META[step.type as PipelineStepType];
  const { inputs, outputs } = getStepHandles(step, dbSchema, connectedCollectionName);

  // ── Double-click rename ────────────────────────────────────────────
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(step.label);
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [isRenaming]);

  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== step.label) {
      onStepChange(step.id, { label: trimmed });
    } else {
      setRenameValue(step.label);
    }
    setIsRenaming(false);
  };

  const bodyRows = Math.max(inputs.length, outputs.length);
  const isValidate = step.type === "validate";
  const isLiteral = step.type.endsWith("-literal");
  const isCollection = step.type === "collection";
  const hasInlineArea = isValidate || isLiteral || isCollection;
  const inlineHeight = isValidate
    ? VALIDATE_INLINE_HEIGHT
    : isLiteral
    ? LITERAL_INLINE_HEIGHT
    : isCollection
    ? COLLECTION_INLINE_HEIGHT
    : 0;

  // ── Validate inline helpers ──
  const rule = step.validateConfig?.rules?.[0];

  const updateRule = (field: string, value: string) => {
    const existing = rule || { id: "r1", field: "body.", rule: "required" as const, errorMessage: "" };
    const updated = { ...existing, [field]: value };
    onStepChange(step.id, {
      validateConfig: { ...step.validateConfig!, rules: [updated], failStatus: step.validateConfig?.failStatus || 400 },
    });
  };

  // ── Literal inline helpers ──
  const updateLiteral = (val: any) => {
    switch (step.type) {
      case "string-literal":
        onStepChange(step.id, { stringLiteralConfig: { value: val } });
        break;
      case "number-literal":
        onStepChange(step.id, { numberLiteralConfig: { value: Number(val) || 0 } });
        break;
      case "boolean-literal":
        onStepChange(step.id, { booleanLiteralConfig: { value: val } });
        break;
      case "json-literal":
        onStepChange(step.id, { jsonLiteralConfig: { value: val } });
        break;
    }
  };

  const getLiteralValue = (): string => {
    switch (step.type) {
      case "string-literal": return step.stringLiteralConfig?.value ?? "";
      case "number-literal": return String(step.numberLiteralConfig?.value ?? 0);
      case "boolean-literal": return String(step.booleanLiteralConfig?.value ?? false);
      case "json-literal": return step.jsonLiteralConfig?.value ?? "{}";
      default: return "";
    }
  };

  return (
    <div
      style={{
        position: "relative",
        minWidth: isLiteral ? 140 : isCollection ? 180 : 200,
        maxWidth: 300,
        borderRadius: 10,
        border: `1px solid ${selected ? colors.handle : "hsl(var(--border))"}`,
        background: "hsl(var(--card))",
        boxShadow: selected
          ? `0 0 0 2px ${colors.handle}33, 0 6px 24px rgba(0,0,0,0.3)`
          : "0 4px 20px rgba(0,0,0,0.2)",
        fontSize: 11,
        opacity: step.isEnabled ? 1 : 0.45,
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "0 12px",
          height: HEADER_HEIGHT,
          borderBottom: (bodyRows > 0 || hasInlineArea) ? "1px solid hsl(var(--border)/0.5)" : "none",
          borderRadius: (bodyRows > 0 || hasInlineArea) ? "10px 10px 0 0" : "10px",
          fontWeight: 600,
          fontSize: 11,
          background: colors.bg,
          color: colors.text,
        }}
      >
        {icon}
        {isRenaming ? (
          <input
            ref={renameRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") { setRenameValue(step.label); setIsRenaming(false); }
              e.stopPropagation();
            }}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              borderBottom: "1px solid currentColor",
              outline: "none",
              color: "inherit",
              font: "inherit",
              fontWeight: 600,
              padding: 0,
              margin: 0,
              minWidth: 0,
            }}
          />
        ) : (
          <span
            style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "text" }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setRenameValue(step.label || meta?.label || step.type);
              setIsRenaming(true);
            }}
          >
            {step.label || meta?.label || step.type}
          </span>
        )}
        {!step.isEnabled && <span style={{ fontSize: 9, opacity: 0.5 }}>OFF</span>}
      </div>

      {/* ── Collection: inline collection picker ── */}
      {isCollection && (
        <div style={{ padding: "6px 10px", minHeight: COLLECTION_INLINE_HEIGHT, display: "flex", alignItems: "center" }}>
          <select
            value={step.collectionConfig?.collectionName || ""}
            onChange={(e) =>
              onStepChange(step.id, { collectionConfig: { collectionName: e.target.value } })
            }
            style={{
              ...inlineInputStyle,
              width: "100%",
              cursor: "pointer",
              color: step.collectionConfig?.collectionName ? colors.text : "rgba(255,255,255,0.25)",
              borderColor: step.collectionConfig?.collectionName ? `${colors.handle}66` : "hsl(var(--border)/0.4)",
            }}
            className="nodrag"
          >
            <option value="" disabled>select collection...</option>
            {(dbSchema || []).map((col) => (
              <option key={col.id} value={col.name}>{col.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* ── Validate: inline single-rule editor ── */}
      {isValidate && (
        <div
          style={{
            padding: "6px 10px",
            borderBottom: bodyRows > 0 ? "1px solid hsl(var(--border)/0.3)" : "none",
            display: "flex",
            flexDirection: "column",
            gap: 3,
            minHeight: VALIDATE_INLINE_HEIGHT,
          }}
        >
          <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
            <select
              value={rule?.rule || "required"}
              onChange={(e) => updateRule("rule", e.target.value)}
              style={{
                ...inlineInputStyle,
                width: "auto",
                flex: "0 0 auto",
                cursor: "pointer",
                appearance: "none" as const,
                paddingRight: 14,
              }}
              className="nodrag"
            >
              {RULE_TYPE_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {["minLength", "maxLength", "min", "max", "regex", "equals"].includes(rule?.rule || "") && (
              <input
                value={rule?.value ?? ""}
                onChange={(e) => updateRule("value", e.target.value)}
                placeholder="value"
                style={{ ...inlineInputStyle, flex: 1 }}
                className="nodrag"
              />
            )}
          </div>
          <input
            value={rule?.errorMessage || ""}
            onChange={(e) => updateRule("errorMessage", e.target.value)}
            placeholder="error message (optional)"
            style={{ ...inlineInputStyle, color: "rgba(255,255,255,0.4)" }}
            className="nodrag"
          />
        </div>
      )}

      {/* ── Literal: inline value editor ── */}
      {isLiteral && (
        <div style={{ padding: "6px 10px", minHeight: LITERAL_INLINE_HEIGHT, display: "flex", alignItems: "center" }}>
          {step.type === "boolean-literal" ? (
            <button
              onClick={() => updateLiteral(!step.booleanLiteralConfig?.value)}
              style={{
                ...inlineInputStyle,
                cursor: "pointer",
                textAlign: "center",
                fontWeight: 600,
                color: step.booleanLiteralConfig?.value ? "#4ade80" : "#f87171",
                background: step.booleanLiteralConfig?.value ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
                border: `1px solid ${step.booleanLiteralConfig?.value ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`,
              }}
              className="nodrag"
            >
              {step.booleanLiteralConfig?.value ? "true" : "false"}
            </button>
          ) : (
            <input
              type={step.type === "number-literal" ? "number" : "text"}
              value={getLiteralValue()}
              onChange={(e) => updateLiteral(e.target.value)}
              placeholder={step.type === "json-literal" ? '{ }' : step.type === "number-literal" ? "0" : "value..."}
              style={inlineInputStyle}
              className="nodrag"
            />
          )}
        </div>
      )}

      {/* ── Body: per-property pin rows ── */}
      {bodyRows > 0 && (
        <div style={{ padding: `${BODY_PAD}px 0` }}>
          {Array.from({ length: bodyRows }).map((_, i) => {
            const inp = inputs[i];
            const out = outputs[i];

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  height: ROW_HEIGHT,
                  padding: "0 12px",
                }}
              >
                <span style={{
                  fontSize: 10,
                  fontFamily: "ui-monospace, 'Cascadia Code', monospace",
                  color: inp ? "#9ca3af" : "transparent",
                }}>
                  {inp ? inp.label : ""}
                </span>

                <span style={{
                  fontSize: 10,
                  fontFamily: "ui-monospace, 'Cascadia Code', monospace",
                  fontWeight: 600,
                  color: out ? colors.text : "transparent",
                }}>
                  {out ? out.label : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Input handles */}
      {inputs.map((inp, i) => {
        const top = HEADER_HEIGHT + inlineHeight + BODY_PAD + i * ROW_HEIGHT + ROW_HEIGHT / 2;
        const style = inp.kind === "exec" ? execHandleStyle() : dataHandleStyle(colors.handle);
        return (
          <Handle
            key={inp.id}
            type="target"
            position={Position.Left}
            id={inp.id}
            style={{ ...style, top }}
          />
        );
      })}

      {/* Output handles */}
      {outputs.map((out, i) => {
        const top = HEADER_HEIGHT + inlineHeight + BODY_PAD + i * ROW_HEIGHT + ROW_HEIGHT / 2;
        const style = out.kind === "exec" ? execHandleStyle() : dataHandleStyle(colors.handle);
        return (
          <Handle
            key={out.id}
            type="source"
            position={Position.Right}
            id={out.id}
            style={{ ...style, top }}
          />
        );
      })}
    </div>
  );
}

export const StepNode = memo(StepNodeComponent);

// ── RequestNode ───────────────────────────────────────────────────────
function RequestNodeComponent({ data }: NodeProps) {
  const nodeData = data as unknown as RequestNodeData;
  const handles = getRequestHandles(nodeData.bodyFields || [], nodeData.queryFields || []);
  const colors = STEP_COLORS.request;

  return (
    <div
      style={{
        position: "relative",
        minWidth: 180,
        maxWidth: 300,
        borderRadius: 10,
        border: "1px solid hsl(var(--border))",
        background: "hsl(var(--card))",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        fontSize: 11,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "0 12px",
          height: HEADER_HEIGHT,
          borderBottom: handles.length > 0 ? "1px solid hsl(var(--border)/0.5)" : "none",
          borderRadius: handles.length > 0 ? "10px 10px 0 0" : "10px",
          fontWeight: 700,
          fontSize: 11,
          background: colors.bg,
          color: colors.text,
        }}
      >
        <Inbox className="w-3.5 h-3.5" />
        <span style={{ flex: 1 }}>Request</span>
      </div>

      {/* Data output pins */}
      {handles.length > 0 ? (
        <div style={{ padding: `${BODY_PAD}px 0` }}>
          {handles.map((h) => (
            <div
              key={h.id}
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                height: ROW_HEIGHT,
                padding: "0 12px",
              }}
            >
              <span style={{
                fontSize: 10,
                fontFamily: "ui-monospace, 'Cascadia Code', monospace",
                fontWeight: 600,
                color: colors.text,
              }}>
                {h.label}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: "8px 12px" }}>
          <span style={{
            color: "rgba(255,255,255,0.2)",
            fontSize: 10,
            fontStyle: "italic",
          }}>
            Add request body fields
          </span>
        </div>
      )}

      {/* Output handles */}
      {handles.map((h, i) => {
        const top = HEADER_HEIGHT + BODY_PAD + i * ROW_HEIGHT + ROW_HEIGHT / 2;
        const style = h.kind === "exec" ? execHandleStyle() : dataHandleStyle(colors.handle);
        return (
          <Handle
            key={h.id}
            type="source"
            position={Position.Right}
            id={h.id}
            style={{ ...style, top }}
          />
        );
      })}
    </div>
  );
}

export const RequestNode = memo(RequestNodeComponent);
