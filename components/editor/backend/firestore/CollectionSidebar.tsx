"use client";

import React, { useState } from "react";
import { DbCollection, DbCollectionField, FieldType, FIELD_TYPE_OPTIONS } from "@/types/backend";
import { generateId } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Database,
  Settings2,
  ChevronDown,
  ChevronRight,
  Asterisk,
  Fingerprint,
  Link2,
  GripVertical,
  FolderPlus,
} from "lucide-react";

interface CollectionSidebarProps {
  schema: DbCollection[];
  onChange: (schema: DbCollection[]) => void;
  selectedCollection: string | null;
  onSelect: (name: string | null) => void;
  collectionDocCounts: Record<string, number>;
  onDeleteCollection: (id: string, name: string) => void;
}

const TYPE_COLORS: Record<FieldType, string> = {
  string: "text-emerald-400",
  number: "text-blue-400",
  boolean: "text-amber-400",
  array: "text-purple-400",
  object: "text-orange-400",
};

export function CollectionSidebar({
  schema,
  onChange,
  selectedCollection,
  onSelect,
  collectionDocCounts,
  onDeleteCollection,
}: CollectionSidebarProps) {
  const [schemaOpenFor, setSchemaOpenFor] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const addCollection = () => {
    if (!newName.trim()) return;
    const newCol: DbCollection = {
      id: generateId(),
      name: newName.trim(),
      fields: [],
      description: "",
    };
    onChange([...schema, newCol]);
    onSelect(newCol.name);
    setNewName("");
    setIsAdding(false);
  };

  const removeCollection = (id: string, name: string) => {
    onDeleteCollection(id, name);
  };

  const updateCollection = (id: string, updates: Partial<DbCollection>) => {
    onChange(schema.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const addField = (colId: string) => {
    const col = schema.find((c) => c.id === colId);
    if (!col) return;
    const f: DbCollectionField = { id: generateId(), name: "", type: "string", required: false };
    updateCollection(colId, { fields: [...col.fields, f] });
  };

  const updateField = (colId: string, fId: string, u: Partial<DbCollectionField>) => {
    const col = schema.find((c) => c.id === colId);
    if (!col) return;
    updateCollection(colId, { fields: col.fields.map((f) => (f.id === fId ? { ...f, ...u } : f)) });
  };

  const removeField = (colId: string, fId: string) => {
    const col = schema.find((c) => c.id === colId);
    if (!col) return;
    updateCollection(colId, { fields: col.fields.filter((f) => f.id !== fId) });
  };

  return (
    <div className="h-full flex flex-col bg-[#1a1c2e] border-r border-[#2a2d42]">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-[#2a2d42]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">
              Collections
            </span>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="p-1 hover:bg-white/5 rounded transition-colors text-white/40 hover:text-amber-400"
            title="Add collection"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add collection input */}
      {isAdding && (
        <div className="px-3 py-2 border-b border-[#2a2d42] bg-[#15172a]">
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addCollection();
              if (e.key === "Escape") { setIsAdding(false); setNewName(""); }
            }}
            placeholder="Collection name..."
            className="w-full px-2.5 py-1.5 text-xs bg-[#0d0f1a] border border-[#2a2d42] rounded text-white/90 font-mono outline-none focus:border-amber-500/40 placeholder:text-white/20"
          />
          <div className="flex gap-1.5 mt-1.5">
            <button onClick={addCollection} className="flex-1 py-1 text-[10px] font-medium bg-amber-500/20 text-amber-400 rounded hover:bg-amber-500/30 transition-colors">
              Create
            </button>
            <button onClick={() => { setIsAdding(false); setNewName(""); }} className="flex-1 py-1 text-[10px] font-medium bg-white/5 text-white/40 rounded hover:bg-white/10 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Collection list */}
      <div className="flex-1 overflow-y-auto">
        {schema.length === 0 && !isAdding && (
          <div className="px-4 py-8 text-center">
            <Database className="w-8 h-8 mx-auto mb-2 text-white/10" />
            <p className="text-[11px] text-white/30 mb-3">No collections yet</p>
            <button
              onClick={() => setIsAdding(true)}
              className="px-3 py-1.5 text-[10px] font-medium bg-amber-500/15 text-amber-400 rounded hover:bg-amber-500/25 transition-colors border border-amber-500/20"
            >
              <FolderPlus className="w-3 h-3 inline mr-1" />
              Start a collection
            </button>
          </div>
        )}

        {schema.map((col) => {
          const isSelected = selectedCollection === col.name;
          const isSchemaOpen = schemaOpenFor === col.id;
          const docCount = collectionDocCounts[col.name] || 0;

          return (
            <div key={col.id}>
              {/* Collection row */}
              <div
                className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-all group border-l-2 ${
                  isSelected
                    ? "bg-amber-500/10 border-l-amber-400 text-white"
                    : "border-l-transparent text-white/60 hover:bg-white/[0.03] hover:text-white/80"
                }`}
                onClick={() => onSelect(col.name)}
              >
                <Database className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-amber-400" : "text-white/25"}`} />
                <span className="flex-1 text-xs font-medium font-mono truncate">
                  {col.name || "untitled"}
                </span>
                <span className="text-[9px] text-white/25 bg-white/5 px-1.5 py-0.5 rounded">
                  {docCount}
                </span>

                {/* Schema toggle */}
                <button
                  onClick={(e) => { e.stopPropagation(); setSchemaOpenFor(isSchemaOpen ? null : col.id); }}
                  className={`p-0.5 rounded transition-colors opacity-0 group-hover:opacity-100 ${
                    isSchemaOpen ? "text-amber-400 opacity-100" : "text-white/30 hover:text-white/60"
                  }`}
                  title="Edit schema"
                >
                  <Settings2 className="w-3 h-3" />
                </button>

                {/* Delete */}
                <button
                  onClick={(e) => { e.stopPropagation(); removeCollection(col.id, col.name); }}
                  className="p-0.5 rounded transition-colors opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400"
                  title="Delete collection"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* Inline schema editor */}
              {isSchemaOpen && (
                <div className="px-3 py-2 bg-[#12142480] border-y border-[#2a2d42]/50 space-y-1.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] uppercase tracking-wider text-white/30 font-semibold">Schema Fields</span>
                  </div>

                  {/* Auto fields hint */}
                  <div className="flex gap-3 px-2 py-1 rounded bg-white/[0.02] text-[9px] text-white/25">
                    <span>Auto:</span>
                    <code className="text-amber-400/40">id</code>
                    <code className="text-amber-400/40">_createdAt</code>
                    <code className="text-amber-400/40">_updatedAt</code>
                  </div>

                  {col.fields.map((field) => (
                    <div key={field.id} className="flex items-center gap-1.5 py-1 group/field">
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateField(col.id, field.id, { name: e.target.value })}
                        placeholder="field_name"
                        className="flex-1 min-w-0 px-1.5 py-1 text-[10px] bg-transparent border-b border-transparent focus:border-amber-500/30 outline-none text-white/70 font-mono"
                      />
                      <select
                        value={field.type}
                        onChange={(e) => updateField(col.id, field.id, { type: e.target.value as FieldType })}
                        className={`px-1.5 py-1 text-[10px] bg-transparent border border-[#2a2d42] rounded outline-none cursor-pointer ${TYPE_COLORS[field.type]}`}
                      >
                        {FIELD_TYPE_OPTIONS.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => updateField(col.id, field.id, { required: !field.required })}
                        className={`p-0.5 rounded ${field.required ? "text-red-400/70" : "text-white/15"}`}
                        title={field.required ? "Required" : "Optional"}
                      >
                        <Asterisk className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={() => updateField(col.id, field.id, { unique: !field.unique })}
                        className={`p-0.5 rounded ${field.unique ? "text-amber-400/70" : "text-white/15"}`}
                        title={field.unique ? "Unique" : "Not unique"}
                      >
                        <Fingerprint className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={() => removeField(col.id, field.id)}
                        className="p-0.5 text-white/10 hover:text-red-400 rounded opacity-0 group-hover/field:opacity-100 transition-colors"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => addField(col.id)}
                    className="w-full py-1 text-[10px] font-medium text-white/25 hover:text-amber-400 border border-dashed border-[#2a2d42] rounded hover:border-amber-500/30 transition-colors"
                  >
                    + Add Field
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
