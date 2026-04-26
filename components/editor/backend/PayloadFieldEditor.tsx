"use client";

import { useState } from "react";
import { PayloadField, FieldType, FIELD_TYPE_OPTIONS } from "@/types/backend";
import { generateId } from "@/lib/utils";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical,
} from "lucide-react";

interface PayloadFieldEditorProps {
  fields: PayloadField[];
  onChange: (fields: PayloadField[]) => void;
  label?: string;
  depth?: number;
}

export function PayloadFieldEditor({
  fields,
  onChange,
  label,
  depth = 0,
}: PayloadFieldEditorProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addField = () => {
    const newField: PayloadField = {
      id: generateId(),
      name: "",
      type: "string",
      required: false,
    };
    onChange([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<PayloadField>) => {
    onChange(
      fields.map((f) => {
        if (f.id === id) {
          const updated = { ...f, ...updates };
          // Clear children if changing from object/array to a primitive type
          if (
            updates.type &&
            updates.type !== "object" &&
            updates.type !== "array"
          ) {
            updated.children = undefined;
          }
          // Initialize children array if changing to object/array
          if (
            updates.type &&
            (updates.type === "object" || updates.type === "array") &&
            !updated.children
          ) {
            updated.children = [];
          }
          return updated;
        }
        return f;
      })
    );
  };

  const removeField = (id: string) => {
    onChange(fields.filter((f) => f.id !== id));
  };

  const updateChildren = (parentId: string, children: PayloadField[]) => {
    onChange(
      fields.map((f) => (f.id === parentId ? { ...f, children } : f))
    );
  };

  const hasChildren = (field: PayloadField) =>
    (field.type === "object" || field.type === "array") &&
    field.children &&
    field.children.length > 0;

  const canHaveChildren = (field: PayloadField) =>
    field.type === "object" || field.type === "array";

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {label}
          </span>
          <button
            onClick={addField}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Field
          </button>
        </div>
      )}

      {fields.length === 0 && (
        <div className="text-xs text-muted-foreground/60 italic py-3 text-center border border-dashed border-border rounded-md">
          No fields defined.{" "}
          <button
            onClick={addField}
            className="text-primary hover:underline"
          >
            Add one
          </button>
        </div>
      )}

      {fields.map((field) => (
        <div key={field.id} className="group">
          <div
            className="flex items-center gap-1.5 py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors"
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            {/* Expand toggle for object/array */}
            {canHaveChildren(field) ? (
              <button
                onClick={() => toggleExpanded(field.id)}
                className="p-0.5 text-muted-foreground hover:text-foreground"
              >
                {expandedIds.has(field.id) ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            ) : (
              <div className="w-4" />
            )}

            {/* Field name */}
            <input
              type="text"
              value={field.name}
              onChange={(e) => updateField(field.id, { name: e.target.value })}
              placeholder="fieldName"
              className="flex-1 min-w-0 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 font-mono outline-none border-b border-transparent focus:border-primary/50 py-0.5 px-1"
            />

            {/* Type selector */}
            <select
              value={field.type}
              onChange={(e) =>
                updateField(field.id, { type: e.target.value as FieldType })
              }
              className="text-[10px] bg-muted/50 border border-border rounded px-1.5 py-0.5 text-foreground outline-none focus:ring-1 focus:ring-primary/50 appearance-none cursor-pointer"
            >
              {FIELD_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Required toggle */}
            <button
              onClick={() =>
                updateField(field.id, { required: !field.required })
              }
              className={`text-[10px] px-1.5 py-0.5 rounded font-medium transition-colors ${
                field.required
                  ? "bg-red-500/15 text-red-400 border border-red-500/30"
                  : "bg-muted/30 text-muted-foreground/50 border border-transparent hover:border-border"
              }`}
              title={field.required ? "Required" : "Optional"}
            >
              {field.required ? "req" : "opt"}
            </button>

            {/* Delete */}
            <button
              onClick={() => removeField(field.id)}
              className="p-0.5 text-muted-foreground/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              title="Remove field"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          {/* Nested children for object/array */}
          {canHaveChildren(field) && expandedIds.has(field.id) && (
            <div className="ml-2 border-l border-border/50 pl-1">
              <PayloadFieldEditor
                fields={field.children || []}
                onChange={(children) => updateChildren(field.id, children)}
                depth={depth + 1}
              />
              {/* Add child button */}
              <button
                onClick={() => {
                  const newChild: PayloadField = {
                    id: generateId(),
                    name: "",
                    type: "string",
                    required: false,
                  };
                  updateChildren(field.id, [
                    ...(field.children || []),
                    newChild,
                  ]);
                }}
                className="flex items-center gap-1 ml-4 mt-1 mb-2 px-2 py-0.5 text-[10px] text-primary/60 hover:text-primary hover:bg-primary/5 rounded transition-colors"
                style={{ marginLeft: `${(depth + 1) * 16 + 8}px` }}
              >
                <Plus className="w-2.5 h-2.5" />
                Add {field.type === "array" ? "item field" : "property"}
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Bottom add button — only at root level when there are existing fields
           (nested editors get their "Add property" button from the parent) */}
    </div>
  );
}
