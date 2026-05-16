"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  limit,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DbCollection } from "@/types/backend";
import {
  Database,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Trash2,
  Loader2,
  FolderOpen,
  FileText,
  AlertCircle,
} from "lucide-react";

interface CollectionManagerProps {
  projectId: string | null;
  dbSchema?: DbCollection[];
}

interface CollectionInfo {
  name: string;
  docCount: number;
  docs: any[];
  isLoading: boolean;
}

/**
 * Collection Manager — lets users browse and inspect documents
 * stored in their project's database (under projects/{projectId}/data/*).
 */
export function CollectionManager({ projectId, dbSchema = [] }: CollectionManagerProps) {
  const [collections, setCollections] = useState<CollectionInfo[]>([]);
  const [expandedCollection, setExpandedCollection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [knownCollections, setKnownCollections] = useState<string[]>([]);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);

  // Scan for collections that endpoints reference
  const discoverCollections = useCallback(async () => {
    if (!projectId) return;

    setIsLoading(true);
    try {
      // We can't list sub-collections in client SDK, so we use a known-names approach.
      // Parse collection names from all known step configs in all endpoints.
      // Additionally, try a set of common names.
      const schemaNames = dbSchema.map((c) => c.name).filter(Boolean);
      const commonNames = [...new Set([...knownCollections, ...schemaNames, "users", "posts", "products", "orders", "sessions"])];

      const results: CollectionInfo[] = [];

      for (const name of commonNames) {
        try {
          const colRef = collection(db, `projects/${projectId}/data/${name}/records`);
          const q = query(colRef, limit(1));
          const snap = await getDocs(q);

          if (!snap.empty) {
            // Collection exists and has documents — get count and preview
            const countSnap = await getDocs(collection(db, `projects/${projectId}/data/${name}/records`));
            results.push({
              name,
              docCount: countSnap.size,
              docs: countSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
              isLoading: false,
            });
          }
        } catch {
          // Collection doesn't exist or access denied — skip
        }
      }

      setCollections(results);
    } catch (error) {
      console.error("Error discovering collections:", error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, knownCollections, dbSchema]);

  // Register a collection name (called externally or from the input)
  const addCollectionName = (name: string) => {
    if (name && !knownCollections.includes(name)) {
      setKnownCollections((prev) => [...prev, name]);
    }
  };

  // Load a specific collection's documents
  const loadCollectionDocs = async (collectionName: string) => {
    if (!projectId) return;

    setCollections((prev) =>
      prev.map((c) => (c.name === collectionName ? { ...c, isLoading: true } : c))
    );

    try {
      const colRef = collection(db, `projects/${projectId}/data/${collectionName}/records`);
      const snap = await getDocs(colRef);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      setCollections((prev) =>
        prev.map((c) =>
          c.name === collectionName
            ? { ...c, docs, docCount: docs.length, isLoading: false }
            : c
        )
      );
    } catch (error) {
      console.error(`Error loading ${collectionName}:`, error);
      setCollections((prev) =>
        prev.map((c) => (c.name === collectionName ? { ...c, isLoading: false } : c))
      );
    }
  };

  // Delete a document
  const handleDeleteDoc = async (collectionName: string, docId: string) => {
    if (!projectId) return;

    try {
      const docRef = doc(db, `projects/${projectId}/data/${collectionName}/records`, docId);
      await deleteDoc(docRef);
      // Refresh collection
      await loadCollectionDocs(collectionName);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  // Format a Firestore value for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "null";
    if (value instanceof Timestamp) return value.toDate().toLocaleString();
    if (typeof value === "object" && value.seconds && value.nanoseconds) {
      // Firestore Timestamp serialized as plain object
      return new Date(value.seconds * 1000).toLocaleString();
    }
    if (typeof value === "object") return JSON.stringify(value);
    if (typeof value === "string" && value.length > 60) return value.slice(0, 60) + "…";
    return String(value);
  };

  // Detect if a string looks like a bcrypt hash
  const isSensitive = (key: string, value: any): boolean => {
    if (typeof value !== "string") return false;
    if (key.toLowerCase().includes("password") || key.toLowerCase().includes("hash")) return true;
    if (value.startsWith("$2a$") || value.startsWith("$2b$")) return true;
    return false;
  };

  useEffect(() => {
    if (projectId) {
      discoverCollections();
    }
  }, [projectId, discoverCollections]);

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/40">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p className="text-xs">No project selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-semibold text-foreground">Collections</span>
          <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
            {collections.length}
          </span>
        </div>
        <button
          onClick={discoverCollections}
          disabled={isLoading}
          className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Add collection input */}
      <div className="flex gap-1.5">
        <input
          type="text"
          value={newCollectionName}
          onChange={(e) => setNewCollectionName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newCollectionName.trim()) {
              addCollectionName(newCollectionName.trim());
              setNewCollectionName("");
              // Trigger refresh after adding
              setTimeout(discoverCollections, 100);
            }
          }}
          placeholder="Search / add collection..."
          className="flex-1 px-2.5 py-1.5 text-[11px] bg-muted/30 border border-border rounded-md outline-none focus:ring-1 focus:ring-violet-500/40 text-foreground font-mono placeholder:text-muted-foreground/30"
        />
      </div>

      {/* Loading */}
      {isLoading && collections.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/30" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && collections.length === 0 && (
        <div className="text-center py-8 border border-dashed border-border rounded-lg">
          <FolderOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground/20" />
          <p className="text-xs text-muted-foreground/50">No collections found.</p>
          <p className="text-[10px] text-muted-foreground/30 mt-1">
            Data will appear once pipeline DB steps create documents.
          </p>
        </div>
      )}

      {/* Collection list */}
      <div className="space-y-1.5">
        {collections.map((col) => {
          const isExpanded = expandedCollection === col.name;

          return (
            <div
              key={col.name}
              className={`rounded-lg border transition-all ${
                isExpanded
                  ? "border-violet-500/20 bg-violet-500/5"
                  : "border-border bg-card/50 hover:bg-muted/30"
              }`}
            >
              {/* Collection header */}
              <div
                className="flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none"
                onClick={() => {
                  if (isExpanded) {
                    setExpandedCollection(null);
                  } else {
                    setExpandedCollection(col.name);
                    loadCollectionDocs(col.name);
                  }
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/40" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                )}
                <Database className="w-3.5 h-3.5 text-violet-400" />
                <span className="flex-1 text-xs font-semibold text-foreground">{col.name}</span>
                <span className="text-[9px] text-muted-foreground/50 bg-muted/50 px-1.5 py-0.5 rounded">
                  {col.docCount} doc{col.docCount !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Documents */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-border/50 space-y-1.5">
                  {col.isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/30" />
                    </div>
                  ) : col.docs.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground/40 text-center py-3">
                      No documents in this collection.
                    </p>
                  ) : (
                    col.docs.map((docData) => {
                      const isDocExpanded = expandedDocId === docData.id;
                      const fields = Object.entries(docData).filter(([k]) => k !== "id");

                      return (
                        <div
                          key={docData.id}
                          className={`rounded-md border transition-all ${
                            isDocExpanded
                              ? "border-border bg-muted/20"
                              : "border-transparent hover:border-border hover:bg-muted/10"
                          }`}
                        >
                          <div
                            className="flex items-center gap-2 px-2.5 py-2 cursor-pointer"
                            onClick={() => setExpandedDocId(isDocExpanded ? null : docData.id)}
                          >
                            <FileText className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                            <span className="flex-1 text-[10px] font-mono text-foreground/70 truncate">
                              {docData.id}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDoc(col.name, docData.id);
                              }}
                              className="p-0.5 text-muted-foreground/20 hover:text-red-400 rounded transition-colors"
                              title="Delete document"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {isDocExpanded && (
                            <div className="px-2.5 pb-2.5 space-y-1">
                              {fields.map(([key, value]) => (
                                <div key={key} className="flex items-start gap-2 text-[10px]">
                                  <span className="text-violet-400/70 font-medium min-w-[70px] shrink-0">
                                    {key}
                                  </span>
                                  <span className="text-foreground/60 font-mono break-all">
                                    {isSensitive(key, value)
                                      ? "••••••••"
                                      : formatValue(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
