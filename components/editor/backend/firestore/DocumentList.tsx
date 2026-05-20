"use client";

import React from "react";
import { Timestamp } from "firebase/firestore";
import {
  FileText,
  Trash2,
  Loader2,
  Plus,
  FolderOpen,
  CheckSquare,
  Square,
  Trash,
} from "lucide-react";

interface DocumentListProps {
  collectionName: string;
  documents: any[];
  isLoading: boolean;
  selectedDocId: string | null;
  onSelectDoc: (docId: string | null) => void;
  onAddDocument: () => void;
  onDeleteDoc: (docId: string) => void;
  onBatchDelete: (docIds: string[]) => void;
  schemaFields: string[];
}

function formatCellValue(value: any): string {
  if (value === null || value === undefined) return "—";
  if (value instanceof Timestamp) return value.toDate().toLocaleDateString();
  if (typeof value === "object" && value.seconds && value.nanoseconds) {
    return new Date(value.seconds * 1000).toLocaleDateString();
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "object") return JSON.stringify(value).slice(0, 40);
  if (typeof value === "string" && value.length > 35) return value.slice(0, 35) + "…";
  if (typeof value === "string" && (value.startsWith("$2a$") || value.startsWith("$2b$"))) return "••••••••";
  return String(value);
}

function isSensitiveKey(key: string): boolean {
  const l = key.toLowerCase();
  return l.includes("password") || l.includes("hash") || l.includes("secret");
}

export function DocumentList({
  collectionName,
  documents,
  isLoading,
  selectedDocId,
  onSelectDoc,
  onAddDocument,
  onDeleteDoc,
  onBatchDelete,
  schemaFields,
}: DocumentListProps) {
  const [checkedIds, setCheckedIds] = React.useState<Set<string>>(new Set());

  const toggleCheck = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (checkedIds.size === documents.length) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(documents.map((d) => d.id)));
    }
  };

  const handleBatchDelete = () => {
    if (checkedIds.size === 0) return;
    onBatchDelete(Array.from(checkedIds));
    setCheckedIds(new Set());
  };

  // Determine display columns: use schema fields + any extra fields found in docs
  const docFieldKeys = new Set<string>();
  documents.forEach((d) => {
    Object.keys(d).forEach((k) => {
      if (k !== "id") docFieldKeys.add(k);
    });
  });
  const columns = [...new Set([...schemaFields, ...Array.from(docFieldKeys)])].filter(
    (k) => !k.startsWith("_")
  ).slice(0, 5); // max 5 columns visible

  return (
    <div className="h-full flex flex-col bg-[#13152480]">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-[#2a2d42]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white/80 font-mono">{collectionName}</span>
          <span className="text-[9px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
            {documents.length} document{documents.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {checkedIds.size > 0 && (
            <button
              onClick={handleBatchDelete}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-red-500/15 text-red-400 rounded hover:bg-red-500/25 transition-colors"
            >
              <Trash className="w-3 h-3" />
              Delete {checkedIds.size}
            </button>
          )}
          <button
            onClick={onAddDocument}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium bg-amber-500/15 text-amber-400 rounded hover:bg-amber-500/25 transition-colors border border-amber-500/20"
          >
            <Plus className="w-3 h-3" />
            Add document
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-white/20" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && documents.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FolderOpen className="w-10 h-10 mx-auto mb-3 text-white/10" />
            <p className="text-xs text-white/30 mb-1">No documents</p>
            <p className="text-[10px] text-white/20 mb-3">This collection is empty.</p>
            <button
              onClick={onAddDocument}
              className="px-3 py-1.5 text-[10px] font-medium bg-amber-500/15 text-amber-400 rounded hover:bg-amber-500/25 transition-colors"
            >
              Add first document
            </button>
          </div>
        </div>
      )}

      {/* Document table */}
      {!isLoading && documents.length > 0 && (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#1a1c2e] border-b border-[#2a2d42]">
                <th className="w-8 px-2 py-2">
                  <button onClick={toggleAll} className="text-white/25 hover:text-white/50">
                    {checkedIds.size === documents.length && documents.length > 0 ? (
                      <CheckSquare className="w-3.5 h-3.5" />
                    ) : (
                      <Square className="w-3.5 h-3.5" />
                    )}
                  </button>
                </th>
                <th className="text-left px-3 py-2 text-white/40 font-semibold uppercase tracking-wider text-[9px]">
                  Document ID
                </th>
                {columns.map((col) => (
                  <th key={col} className="text-left px-3 py-2 text-white/40 font-semibold uppercase tracking-wider text-[9px]">
                    {col}
                  </th>
                ))}
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((docData) => {
                const isSelected = selectedDocId === docData.id;
                const isChecked = checkedIds.has(docData.id);

                return (
                  <tr
                    key={docData.id}
                    onClick={() => onSelectDoc(docData.id)}
                    className={`cursor-pointer border-b border-[#2a2d42]/50 transition-colors ${
                      isSelected
                        ? "bg-amber-500/10"
                        : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <td className="px-2 py-2">
                      <button onClick={(e) => toggleCheck(docData.id, e)} className="text-white/25 hover:text-white/50">
                        {isChecked ? (
                          <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Square className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-white/20 flex-shrink-0" />
                        <span className="font-mono text-amber-400/80 truncate max-w-[140px]">
                          {docData.id}
                        </span>
                      </div>
                    </td>
                    {columns.map((col) => (
                      <td key={col} className="px-3 py-2 text-white/50 font-mono truncate max-w-[120px]">
                        {isSensitiveKey(col) ? "••••••••" : formatCellValue(docData[col])}
                      </td>
                    ))}
                    <td className="px-2 py-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteDoc(docData.id);
                        }}
                        className="p-0.5 text-white/10 hover:text-red-400 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
