"use client";

import React, { useState, useEffect } from "react";
import { Timestamp } from "firebase/firestore";
import { DbCollectionField, FieldType, FIELD_TYPE_OPTIONS } from "@/types/backend";
import {
  Save,
  X,
  Trash2,
  Plus,
  FileText,
  Copy,
  Check,
} from "lucide-react";

interface DocField {
  key: string;
  value: string;
  type: FieldType;
}

interface DocumentDetailProps {
  docData: any | null;
  isNewDoc: boolean;
  schemaFields: DbCollectionField[];
  onSave: (id: string, fields: Record<string, any>) => void;
  onDelete: (docId: string) => void;
  onClose: () => void;
}

function inferType(value: any): FieldType {
  if (value === null || value === undefined) return "string";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") return "object";
  return "string";
}

function serializeValue(value: any): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "object" && value.seconds && value.nanoseconds) {
    return new Date(value.seconds * 1000).toISOString();
  }
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

function parseValue(raw: string, type: FieldType): any {
  if (raw === "") return null;
  switch (type) {
    case "number": return Number(raw) || 0;
    case "boolean": return raw === "true";
    case "array":
    case "object":
      try { return JSON.parse(raw); } catch { return raw; }
    default: return raw;
  }
}

function generateAutoId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 20; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export function DocumentDetail({
  docData,
  isNewDoc,
  schemaFields,
  onSave,
  onDelete,
  onClose,
}: DocumentDetailProps) {
  const [docId, setDocId] = useState("");
  const [fields, setFields] = useState<DocField[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isNewDoc) {
      setDocId(generateAutoId());
      // Pre-populate from schema
      const f: DocField[] = schemaFields
        .filter((sf) => sf.name)
        .map((sf) => ({ key: sf.name, value: "", type: sf.type }));
      setFields(f.length > 0 ? f : [{ key: "", value: "", type: "string" }]);
    } else if (docData) {
      setDocId(docData.id);
      const entries = Object.entries(docData).filter(([k]) => k !== "id");
      setFields(
        entries.map(([key, value]) => ({
          key,
          value: serializeValue(value),
          type: inferType(value),
        }))
      );
    }
  }, [docData, isNewDoc, schemaFields]);

  const updateField = (index: number, updates: Partial<DocField>) => {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...updates } : f)));
  };

  const addField = () => {
    setFields((prev) => [...prev, { key: "", value: "", type: "string" }]);
  };

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const data: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.key.trim()) {
        data[f.key.trim()] = parseValue(f.value, f.type);
      }
    });
    onSave(docId, data);
  };

  const copyDocId = () => {
    navigator.clipboard.writeText(docId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isSensitive = (key: string) => {
    const l = key.toLowerCase();
    return l.includes("password") || l.includes("hash") || l.includes("secret");
  };

  return (
    <div className="h-full flex flex-col bg-[#0f1120]">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-[#2a2d42] flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-white/80">
            {isNewDoc ? "New Document" : "Document"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium bg-amber-500/20 text-amber-400 rounded hover:bg-amber-500/30 transition-colors border border-amber-500/20"
          >
            <Save className="w-3 h-3" />
            {isNewDoc ? "Create" : "Update"}
          </button>
          {!isNewDoc && (
            <button
              onClick={() => onDelete(docId)}
              className="flex items-center gap-1 px-2 py-1.5 text-[10px] font-medium bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
          <button onClick={onClose} className="p-1 text-white/30 hover:text-white/60 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Doc ID */}
      <div className="flex-shrink-0 px-4 py-2.5 border-b border-[#2a2d42]/50 bg-[#0d0f1a]">
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-wider text-white/30 font-semibold w-16">Doc ID</span>
          {isNewDoc ? (
            <input
              type="text"
              value={docId}
              onChange={(e) => setDocId(e.target.value)}
              className="flex-1 px-2 py-1 text-xs bg-transparent border border-[#2a2d42] rounded text-amber-400/80 font-mono outline-none focus:border-amber-500/40"
            />
          ) : (
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="text-xs text-amber-400/80 font-mono truncate">{docId}</span>
              <button onClick={copyDocId} className="p-0.5 text-white/20 hover:text-white/50 transition-colors flex-shrink-0">
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {fields.map((field, index) => (
          <div key={index} className="rounded-lg border border-[#2a2d42] bg-[#15172a]/50 p-3 group">
            <div className="flex items-center gap-2 mb-2">
              {/* Field name */}
              <input
                type="text"
                value={field.key}
                onChange={(e) => updateField(index, { key: e.target.value })}
                placeholder="field_name"
                className="flex-1 px-2 py-1 text-[11px] bg-transparent border-b border-transparent focus:border-amber-500/30 outline-none text-white/70 font-mono"
              />
              {/* Type selector */}
              <select
                value={field.type}
                onChange={(e) => updateField(index, { type: e.target.value as FieldType })}
                className="px-1.5 py-1 text-[10px] bg-[#0d0f1a] border border-[#2a2d42] rounded outline-none text-white/50 cursor-pointer"
              >
                {FIELD_TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {/* Delete field */}
              <button
                onClick={() => removeField(index)}
                className="p-0.5 text-white/10 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {/* Value input */}
            {field.type === "object" || field.type === "array" ? (
              <textarea
                value={isSensitive(field.key) && !isNewDoc ? "••••••••" : field.value}
                onChange={(e) => updateField(index, { value: e.target.value })}
                placeholder={field.type === "array" ? '["item1", "item2"]' : '{"key": "value"}'}
                rows={3}
                className="w-full px-2.5 py-2 text-[11px] bg-[#0a0c18] border border-[#2a2d42] rounded text-emerald-300/70 font-mono outline-none focus:border-amber-500/30 resize-none placeholder:text-white/15"
              />
            ) : field.type === "boolean" ? (
              <div className="flex items-center gap-3 px-2 py-1">
                <button
                  onClick={() => updateField(index, { value: "true" })}
                  className={`px-3 py-1 text-[10px] rounded transition-colors ${
                    field.value === "true"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-white/5 text-white/30 border border-[#2a2d42]"
                  }`}
                >
                  true
                </button>
                <button
                  onClick={() => updateField(index, { value: "false" })}
                  className={`px-3 py-1 text-[10px] rounded transition-colors ${
                    field.value === "false"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-white/5 text-white/30 border border-[#2a2d42]"
                  }`}
                >
                  false
                </button>
              </div>
            ) : (
              <input
                type={field.type === "number" ? "number" : "text"}
                value={isSensitive(field.key) && !isNewDoc ? "••••••••" : field.value}
                onChange={(e) => updateField(index, { value: e.target.value })}
                placeholder={`Enter ${field.type} value...`}
                className="w-full px-2.5 py-1.5 text-[11px] bg-[#0a0c18] border border-[#2a2d42] rounded text-white/70 font-mono outline-none focus:border-amber-500/30 placeholder:text-white/15"
              />
            )}
          </div>
        ))}

        {/* Add field */}
        <button
          onClick={addField}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-[#2a2d42] rounded-lg text-[10px] font-medium text-white/25 hover:text-amber-400 hover:border-amber-500/30 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add field
        </button>
      </div>
    </div>
  );
}
