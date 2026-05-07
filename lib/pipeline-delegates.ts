/**
 * Pipeline Delegates — Phase 2
 *
 * Provides concrete implementations of database and hashing operations
 * that the pipeline executor calls via the PipelineDelegate interface.
 * This keeps the executor runtime-agnostic while still allowing
 * real Firestore and bcrypt operations in the server context.
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy as fsOrderBy,
  limit as fsLimit,
  WhereFilterOp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import bcrypt from "bcryptjs";

// ── Delegate Interface ────────────────────────────────────────────────

export interface DbFilter {
  field: string;
  operator: string;  // "==", "!=", ">", "<", ">=", "<=", "contains", "in"
  value: any;
}

/**
 * The delegate interface that the pipeline executor calls.
 * Implementations are injected at call time so the executor stays portable.
 */
export interface PipelineDelegate {
  dbQuery(
    collection: string,
    filters: DbFilter[],
    orderByField?: string,
    orderDirection?: "asc" | "desc",
    limitCount?: number
  ): Promise<any[]>;

  dbInsert(
    collection: string,
    data: Record<string, any>
  ): Promise<string>;

  dbUpdate(
    collection: string,
    docId: string,
    data: Record<string, any>
  ): Promise<void>;

  dbDelete(
    collection: string,
    docId: string
  ): Promise<void>;

  hashPassword(plaintext: string): Promise<string>;

  comparePassword(plaintext: string, hash: string): Promise<boolean>;
}

// ── Firestore + bcrypt Delegate ───────────────────────────────────────

/**
 * Creates a PipelineDelegate backed by Firestore and bcryptjs.
 * All collections are scoped under `projects/{projectId}/data/{collectionName}`
 * so each project is fully isolated.
 */
export function createFirestoreDelegate(projectId: string): PipelineDelegate {
  /** Resolve the full Firestore path for a user-defined collection.
   *  Firestore collection refs must have an odd number of segments.
   *  Path: projects/{projectId}/data/{collectionName}/records  (5 segments = valid) */
  const getCollectionPath = (collectionName: string) =>
    `projects/${projectId}/data/${collectionName}/records`;

  return {
    async dbQuery(
      collectionName: string,
      filters: DbFilter[],
      orderByField?: string,
      orderDirection: "asc" | "desc" = "asc",
      limitCount: number = 20
    ): Promise<any[]> {
      const colPath = getCollectionPath(collectionName);
      const colRef = collection(db, colPath);

      // Build query constraints
      const constraints: any[] = [];

      for (const f of filters) {
        // Map our operator names to Firestore WhereFilterOp
        let op: WhereFilterOp;
        switch (f.operator) {
          case "==":       op = "=="; break;
          case "!=":       op = "!="; break;
          case ">":        op = ">"; break;
          case "<":        op = "<"; break;
          case ">=":       op = ">="; break;
          case "<=":       op = "<="; break;
          case "contains": op = "array-contains"; break;
          case "in":       op = "in"; break;
          default:         op = "==";
        }
        constraints.push(where(f.field, op, f.value));
      }

      if (orderByField) {
        constraints.push(fsOrderBy(orderByField, orderDirection));
      }

      constraints.push(fsLimit(limitCount));

      const q = query(colRef, ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
    },

    async dbInsert(
      collectionName: string,
      data: Record<string, any>
    ): Promise<string> {
      const colPath = getCollectionPath(collectionName);
      const colRef = collection(db, colPath);

      const docRef = await addDoc(colRef, {
        ...data,
        _createdAt: Timestamp.now(),
      });

      return docRef.id;
    },

    async dbUpdate(
      collectionName: string,
      docId: string,
      data: Record<string, any>
    ): Promise<void> {
      const colPath = getCollectionPath(collectionName);
      const docRef = doc(db, colPath, docId);

      await updateDoc(docRef, {
        ...data,
        _updatedAt: Timestamp.now(),
      });
    },

    async dbDelete(
      collectionName: string,
      docId: string
    ): Promise<void> {
      const colPath = getCollectionPath(collectionName);
      const docRef = doc(db, colPath, docId);
      await deleteDoc(docRef);
    },

    async hashPassword(plaintext: string): Promise<string> {
      const salt = await bcrypt.genSalt(10);
      return bcrypt.hash(plaintext, salt);
    },

    async comparePassword(plaintext: string, hash: string): Promise<boolean> {
      return bcrypt.compare(plaintext, hash);
    },
  };
}
