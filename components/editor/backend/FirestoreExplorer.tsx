"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
  query,
  limit,
  Firestore,
} from "firebase/firestore";
import { db, getUserFirestore } from "@/lib/firebase";
import { DbCollection } from "@/types/backend";
import type { UserFirebaseConfig } from "@/types/editor";
import { CollectionSidebar } from "./firestore/CollectionSidebar";
import { DocumentList } from "./firestore/DocumentList";
import { DocumentDetail } from "./firestore/DocumentDetail";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FirestoreExplorerProps {
  projectId: string | null;
  dbSchema: DbCollection[];
  onDbSchemaChange: (schema: DbCollection[]) => void;
  firebaseConfig?: UserFirebaseConfig;
}

export function FirestoreExplorer({
  projectId,
  dbSchema,
  onDbSchemaChange,
  firebaseConfig,
}: FirestoreExplorerProps) {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isAddingDoc, setIsAddingDoc] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingCollection, setIsDeletingCollection] = useState(false);

  // Mapping from collection name -> document count (fetched lazily)
  const [collectionDocCounts, setCollectionDocCounts] = useState<Record<string, number>>({});

  // ── Resolve which Firestore and collection path strategy to use ──────
  // When user has their own Firebase config, data lives at root-level
  // collections in THEIR Firestore (matching how pipeline-delegates works).
  // Otherwise, fall back to Layr's Firestore at projects/{id}/data/{col}/records.
  const useUserFirebase = !!(firebaseConfig?.apiKey && firebaseConfig?.projectId && firebaseConfig?.appId);

  const firestoreDb: Firestore = useMemo(() => {
    if (useUserFirebase && projectId) {
      try {
        return getUserFirestore(firebaseConfig!, projectId);
      } catch (e) {
        console.warn("Failed to init user Firebase, falling back to Layr DB:", e);
        return db;
      }
    }
    return db;
  }, [useUserFirebase, firebaseConfig, projectId]);

  const getCollectionPath = useCallback((colName: string) => {
    if (useUserFirebase) {
      // User's Firebase: collections at root level (same as pipeline-delegates)
      return colName;
    }
    // Layr's Firebase: scoped under projects/{projectId}/data/{col}/records
    return `projects/${projectId}/data/${colName}/records`;
  }, [useUserFirebase, projectId]);

  // 1. Discover collections and fetch counts
  const fetchCounts = useCallback(async () => {
    if (!projectId) return;
    
    const schemaNames = dbSchema.map((c) => c.name).filter(Boolean);
    const commonNames = [
      ...new Set([
        ...schemaNames,
        "users",
        "posts",
        "products",
        "orders",
        "sessions",
        "comments",
        "items"
      ]),
    ];

    const counts: Record<string, number> = {};
    const missingFromSchema: DbCollection[] = [];

    // Import generateId dynamically or ensure it's available
    const { generateId } = await import("@/lib/utils");

    for (const name of commonNames) {
      if (!name) continue;
      try {
        const colPath = getCollectionPath(name);
        const colRef = collection(firestoreDb, colPath);
        const snap = await getDocs(query(colRef, limit(100)));
        
        if (!snap.empty || schemaNames.includes(name)) {
          counts[name] = snap.size;
          
          // If we found data for a collection not in the schema, add it to the schema
          if (!schemaNames.includes(name) && snap.size > 0) {
            missingFromSchema.push({
              id: generateId(),
              name,
              fields: [],
              description: "Discovered from database",
            });
          }
        }
      } catch {
        if (schemaNames.includes(name)) {
          counts[name] = 0;
        }
      }
    }

    setCollectionDocCounts(counts);

    // Auto-repair schema if we found orphaned collections
    if (missingFromSchema.length > 0) {
      onDbSchemaChange([...dbSchema, ...missingFromSchema]);
    }
  }, [projectId, dbSchema, onDbSchemaChange, firestoreDb, getCollectionPath]);

  useEffect(() => {
    fetchCounts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, useUserFirebase]); // Re-run when project loads or firebase config changes

  // 2. Fetch docs when collection selected
  const fetchDocuments = useCallback(async (colName: string) => {
    if (!projectId) return;
    setIsLoadingDocs(true);
    try {
      const colPath = getCollectionPath(colName);
      const colRef = collection(firestoreDb, colPath);
      const snap = await getDocs(colRef);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setDocuments(docs);
      
      // Update count
      setCollectionDocCounts((prev) => ({ ...prev, [colName]: docs.length }));
    } catch (error) {
      console.error(`Error loading ${colName}:`, error);
      setDocuments([]);
    } finally {
      setIsLoadingDocs(false);
    }
  }, [projectId, firestoreDb, getCollectionPath]);

  useEffect(() => {
    if (selectedCollection) {
      fetchDocuments(selectedCollection);
      setSelectedDocId(null);
      setIsAddingDoc(false);
    } else {
      setDocuments([]);
    }
  }, [selectedCollection, fetchDocuments]);

  // 3. Document CRUD
  const handleSaveDoc = async (docId: string, data: Record<string, any>) => {
    if (!projectId || !selectedCollection) return;
    try {
      const colPath = getCollectionPath(selectedCollection);
      const docRef = doc(firestoreDb, colPath, docId);
      
      // Add server timestamps
      const now = new Date().toISOString();
      const payload: Record<string, any> = {
        ...data,
        _updatedAt: now,
      };
      if (isAddingDoc) {
        payload._createdAt = now;
      }

      await setDoc(docRef, payload, { merge: true });
      
      // Refresh list
      await fetchDocuments(selectedCollection);
      
      setSelectedDocId(docId);
      setIsAddingDoc(false);
    } catch (error) {
      console.error("Error saving document:", error);
      alert("Failed to save document. Check console.");
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!projectId || !selectedCollection) return;
    try {
      const colPath = getCollectionPath(selectedCollection);
      const docRef = doc(firestoreDb, colPath, docId);
      await deleteDoc(docRef);
      
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      setCollectionDocCounts((prev) => ({
        ...prev,
        [selectedCollection]: Math.max(0, (prev[selectedCollection] || 1) - 1),
      }));
      
      if (selectedDocId === docId) {
        setSelectedDocId(null);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleBatchDelete = async (docIds: string[]) => {
    if (!projectId || !selectedCollection) return;
    try {
      const colPath = getCollectionPath(selectedCollection);
      // In a real app we'd use a batched write, but loop is fine for prototyping
      for (const id of docIds) {
        const docRef = doc(firestoreDb, colPath, id);
        await deleteDoc(docRef);
      }
      
      await fetchDocuments(selectedCollection);
      if (selectedDocId && docIds.includes(selectedDocId)) {
        setSelectedDocId(null);
      }
    } catch (error) {
      console.error("Error batch deleting:", error);
    }
  };

  const handleDeleteCollection = (id: string, name: string) => {
    setCollectionToDelete({ id, name });
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteCollection = async () => {
    if (!projectId || !collectionToDelete) return;

    setIsDeletingCollection(true);
    const { id, name } = collectionToDelete;

    try {
      // 1. Fetch all documents to delete them
      const colPath = getCollectionPath(name);
      const colRef = collection(firestoreDb, colPath);
      const snap = await getDocs(colRef);
      
      // 2. Delete all docs
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
      }

      // 3. Update the schema
      onDbSchemaChange(dbSchema.filter((c) => c.id !== id));

      if (selectedCollection === name) {
        setSelectedCollection(null);
      }

      // 4. Update counts
      setCollectionDocCounts((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });

      setDeleteConfirmOpen(false);
      setCollectionToDelete(null);

    } catch (error) {
      console.error("Error deleting collection:", error);
      alert("Failed to delete collection. Check console for details.");
    } finally {
      setIsDeletingCollection(false);
    }
  };

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/40">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p className="text-xs">No project selected.</p>
      </div>
    );
  }

  // Get current schema fields for the selected collection
  const currentSchema = dbSchema.find((c) => c.name === selectedCollection);
  const schemaFields = currentSchema?.fields || [];
  const schemaFieldNames = schemaFields.map((f) => f.name).filter(Boolean);

  const selectedDocData = selectedDocId
    ? documents.find((d) => d.id === selectedDocId) || null
    : null;

  return (
    <div className="flex h-full bg-[#0a0c18] overflow-hidden">
      {/* Left Panel: Collections (240px) */}
      <div className="w-[240px] flex-shrink-0 z-20">
        <CollectionSidebar
          schema={dbSchema}
          onChange={onDbSchemaChange}
          selectedCollection={selectedCollection}
          onSelect={setSelectedCollection}
          collectionDocCounts={collectionDocCounts}
          onDeleteCollection={handleDeleteCollection}
        />
      </div>

      {/* Center Panel: Document List */}
      <div className="flex-1 min-w-0 z-10 flex flex-col border-r border-[#2a2d42]">
        {selectedCollection ? (
          <DocumentList
            collectionName={selectedCollection}
            documents={documents}
            isLoading={isLoadingDocs}
            selectedDocId={selectedDocId}
            onSelectDoc={(id) => {
              setSelectedDocId(id);
              setIsAddingDoc(false);
            }}
            onAddDocument={() => {
              setIsAddingDoc(true);
              setSelectedDocId(null);
            }}
            onDeleteDoc={handleDeleteDoc}
            onBatchDelete={handleBatchDelete}
            schemaFields={schemaFieldNames}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 text-center text-white/20 text-xs">
            Select a collection to view documents
          </div>
        )}
      </div>

      {/* Right Panel: Document Detail (360px) */}
      {(selectedDocId || isAddingDoc) && selectedCollection && (
        <div className="w-[360px] flex-shrink-0 z-20 shadow-[-8px_0_24px_rgba(0,0,0,0.5)]">
          <DocumentDetail
            docData={selectedDocData}
            isNewDoc={isAddingDoc}
            schemaFields={schemaFields}
            onSave={handleSaveDoc}
            onDelete={handleDeleteDoc}
            onClose={() => {
              setSelectedDocId(null);
              setIsAddingDoc(false);
            }}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="dark text-foreground border-border">
          <DialogHeader>
            <DialogTitle>Delete Collection</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{collectionToDelete?.name}" and ALL its documents? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setCollectionToDelete(null);
              }}
              disabled={isDeletingCollection}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteCollection}
              disabled={isDeletingCollection}
            >
              {isDeletingCollection ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
