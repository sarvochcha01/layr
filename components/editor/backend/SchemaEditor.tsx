"use client";

import React, { useState } from "react";
import {
  DbCollection,
  DbCollectionField,
  FieldType,
  FIELD_TYPE_OPTIONS,
} from "@/types/backend";
import { generateId } from "@/lib/utils";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Database,
  Link2,
  Asterisk,
  Fingerprint,
  GripVertical,
  FolderPlus,
} from "lucide-react";

interface SchemaEditorProps {
  schema: DbCollection[];
  onChange: (schema: DbCollection[]) => void;
}

const inputClass =
  "w-full px-2.5 py-1.5 text-[11px] bg-muted/30 border border-border rounded-md outline-none focus:ring-1 focus:ring-violet-500/40 text-foreground font-mono placeholder:text-muted-foreground/30";
const selectClass =
  "px-2.5 py-1.5 text-[11px] bg-muted/30 border border-border rounded-md outline-none focus:ring-1 focus:ring-violet-500/40 text-foreground appearance-none cursor-pointer";

const TYPE_COLORS: Record<FieldType, string> = {
  string: "text-emerald-400",
  number: "text-blue-400",
  boolean: "text-amber-400",
  array: "text-purple-400",
  object: "text-orange-400",
};

export function SchemaEditor({ schema, onChange }: SchemaEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    schema.length > 0 ? schema[0].id : null
  );

  // ── Collection CRUD ─────────────────────────────────────────

  const addCollection = () => {
    const newCol: DbCollection = {
      id: generateId(),
      name: "",
      fields: [],
      description: "",
    };
    onChange([...schema, newCol]);
    setExpandedId(newCol.id);
  };

  const updateCollection = (id: string, updates: Partial<DbCollection>) => {
    onChange(schema.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const removeCollection = (id: string) => {
    onChange(schema.filter((c) => c.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  // ── Field CRUD ──────────────────────────────────────────────

  const addField = (collectionId: string) => {
    const col = schema.find((c) => c.id === collectionId);
    if (!col) return;

    const newField: DbCollectionField = {
      id: generateId(),
      name: "",
      type: "string",
      required: false,
    };

    updateCollection(collectionId, {
      fields: [...col.fields, newField],
    });
  };

  const updateField = (
    collectionId: string,
    fieldId: string,
    updates: Partial<DbCollectionField>
  ) => {
    const col = schema.find((c) => c.id === collectionId);
    if (!col) return;

    updateCollection(collectionId, {
      fields: col.fields.map((f) =>
        f.id === fieldId ? { ...f, ...updates } : f
      ),
    });
  };

  const removeField = (collectionId: string, fieldId: string) => {
    const col = schema.find((c) => c.id === collectionId);
    if (!col) return;

    updateCollection(collectionId, {
      fields: col.fields.filter((f) => f.id !== fieldId),
    });
  };

  // ── Render ──────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <Database className="w-4.5 h-4.5 text-violet-400" />
          <div>
            <h2 className="text-sm font-semibold text-foreground">Database Schema</h2>
            <p className="text-[10px] text-muted-foreground/50">
              Define your collections and fields. Pipeline steps will use these as dropdowns.
            </p>
          </div>
        </div>
        <button
          onClick={addCollection}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 rounded-md text-xs font-medium transition-colors border border-violet-500/20"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          New Collection
        </button>
      </div>

      {/* Collection list */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {schema.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border rounded-lg">
            <Database className="w-10 h-10 mx-auto mb-3 text-muted-foreground/15" />
            <p className="text-sm font-medium text-muted-foreground/50 mb-1">
              No collections defined yet
            </p>
            <p className="text-[10px] text-muted-foreground/30 mb-4 max-w-xs mx-auto">
              Collections define the structure of your project's database.
              Create one to get started — e.g. "users", "posts", "products".
            </p>
            <button
              onClick={addCollection}
              className="px-4 py-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 rounded-md text-xs font-semibold transition-colors border border-violet-500/20"
            >
              Create First Collection
            </button>
          </div>
        )}

        {schema.map((col) => {
          const isExpanded = expandedId === col.id;

          return (
            <div
              key={col.id}
              className={`rounded-lg border transition-all ${
                isExpanded
                  ? "border-violet-500/30 bg-violet-500/5"
                  : "border-border bg-card/50 hover:bg-muted/30"
              }`}
            >
              {/* Collection header */}
              <div
                className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none"
                onClick={() => setExpandedId(isExpanded ? null : col.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/40" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                )}

                <Database className="w-3.5 h-3.5 text-violet-400" />

                {isExpanded ? (
                  <input
                    type="text"
                    value={col.name}
                    onChange={(e) =>
                      updateCollection(col.id, { name: e.target.value })
                    }
                    onClick={(e) => e.stopPropagation()}
                    placeholder="collection_name"
                    className="flex-1 min-w-0 bg-transparent text-sm font-semibold text-foreground outline-none border-b border-transparent focus:border-violet-500/30 font-mono"
                  />
                ) : (
                  <span className="flex-1 min-w-0 text-sm font-semibold text-foreground font-mono truncate">
                    {col.name || "untitled"}
                  </span>
                )}

                <span className="text-[9px] text-muted-foreground/40 bg-muted/50 px-1.5 py-0.5 rounded">
                  {col.fields.length} field{col.fields.length !== 1 ? "s" : ""}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCollection(col.id);
                  }}
                  className="p-1 text-muted-foreground/30 hover:text-red-400 rounded transition-colors"
                  title="Delete collection"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Expanded — fields */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-border/50 space-y-2">
                  {/* Description */}
                  <input
                    type="text"
                    value={col.description || ""}
                    onChange={(e) =>
                      updateCollection(col.id, { description: e.target.value })
                    }
                    placeholder="Description (optional)..."
                    className="w-full px-2.5 py-1.5 text-[10px] bg-transparent border-none outline-none text-muted-foreground/50 placeholder:text-muted-foreground/20"
                  />

                  {/* Auto-fields info */}
                  <div className="flex items-center gap-4 px-2 py-1.5 rounded-md bg-muted/20 text-[9px] text-muted-foreground/40">
                    <span>Auto-generated:</span>
                    <code className="text-violet-400/50">id</code>
                    <code className="text-violet-400/50">_createdAt</code>
                    <code className="text-violet-400/50">_updatedAt</code>
                  </div>

                  {/* Field rows */}
                  {col.fields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-2 p-2.5 bg-muted/20 border border-border rounded-lg group"
                    >
                      <GripVertical className="w-3 h-3 text-muted-foreground/20 flex-shrink-0" />

                      {/* Name */}
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) =>
                          updateField(col.id, field.id, { name: e.target.value })
                        }
                        placeholder="field_name"
                        className="flex-1 min-w-0 px-2 py-1 text-[11px] bg-transparent border-b border-transparent focus:border-violet-500/30 outline-none text-foreground font-mono"
                      />

                      {/* Type */}
                      <select
                        value={field.type}
                        onChange={(e) =>
                          updateField(col.id, field.id, {
                            type: e.target.value as FieldType,
                          })
                        }
                        className={`${selectClass} text-[10px] ${TYPE_COLORS[field.type]}`}
                      >
                        {FIELD_TYPE_OPTIONS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>

                      {/* Required toggle */}
                      <button
                        onClick={() =>
                          updateField(col.id, field.id, {
                            required: !field.required,
                          })
                        }
                        className={`p-1 rounded transition-colors ${
                          field.required
                            ? "text-red-400/70 hover:text-red-400"
                            : "text-muted-foreground/20 hover:text-muted-foreground/50"
                        }`}
                        title={field.required ? "Required" : "Optional"}
                      >
                        <Asterisk className="w-3 h-3" />
                      </button>

                      {/* Unique toggle */}
                      <button
                        onClick={() =>
                          updateField(col.id, field.id, {
                            unique: !field.unique,
                          })
                        }
                        className={`p-1 rounded transition-colors ${
                          field.unique
                            ? "text-amber-400/70 hover:text-amber-400"
                            : "text-muted-foreground/20 hover:text-muted-foreground/50"
                        }`}
                        title={field.unique ? "Unique" : "Not unique"}
                      >
                        <Fingerprint className="w-3 h-3" />
                      </button>

                      {/* Ref toggle */}
                      <button
                        onClick={() =>
                          updateField(col.id, field.id, {
                            isRef: !field.isRef,
                          })
                        }
                        className={`p-1 rounded transition-colors ${
                          field.isRef
                            ? "text-blue-400/70 hover:text-blue-400"
                            : "text-muted-foreground/20 hover:text-muted-foreground/50"
                        }`}
                        title={field.isRef ? "References another collection" : "Not a reference"}
                      >
                        <Link2 className="w-3 h-3" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => removeField(col.id, field.id)}
                        className="p-1 text-muted-foreground/20 hover:text-red-400 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove field"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Ref collection selector — shown if any field has isRef */}
                  {col.fields
                    .filter((f) => f.isRef)
                    .map((field) => (
                      <div
                        key={`ref-${field.id}`}
                        className="flex items-center gap-2 pl-8 text-[10px]"
                      >
                        <Link2 className="w-3 h-3 text-blue-400/50" />
                        <span className="text-muted-foreground/50 font-mono">
                          {field.name}
                        </span>
                        <span className="text-muted-foreground/30">→</span>
                        <select
                          value={field.refCollection || ""}
                          onChange={(e) =>
                            updateField(col.id, field.id, {
                              refCollection: e.target.value,
                            })
                          }
                          className={selectClass + " text-[10px] flex-1"}
                        >
                          <option value="">— select collection —</option>
                          {schema
                            .filter((c) => c.id !== col.id)
                            .map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name || "untitled"}
                              </option>
                            ))}
                        </select>
                      </div>
                    ))}

                  {/* Add field button */}
                  <button
                    onClick={() => addField(col.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-border rounded-lg text-[10px] font-medium text-muted-foreground/40 hover:text-violet-400 hover:border-violet-500/30 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Field
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
