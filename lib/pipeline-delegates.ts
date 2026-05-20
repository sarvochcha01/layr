/**
 * Pipeline Delegates — Phase 2 + Firebase Auth
 *
 * Provides concrete implementations of database, hashing, and
 * Firebase Auth operations that the pipeline executor calls via
 * the PipelineDelegate interface.
 *
 * When a user provides their own Firebase config:
 *   - DB operations use the user's Firestore (root-level collections)
 *   - Auth operations use the user's Firebase Auth
 *
 * When no user config is provided (backward compat):
 *   - DB operations use Layr's Firestore (scoped under projects/{projectId}/...)
 *   - Auth operations are unavailable (Firebase Auth nodes will fail gracefully)
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
  Firestore,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  Auth,
} from "firebase/auth";
import { db } from "@/lib/firebase";
import { getUserFirestore, getUserAuth } from "@/lib/firebase";
import bcrypt from "bcryptjs";
import type { UserFirebaseConfig } from "@/types/editor";

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

  // ── Firebase Auth operations ──────────────────────────────────────

  firebaseSignup(
    email: string,
    password: string
  ): Promise<{ uid: string; email: string }>;

  firebaseLogin(
    email: string,
    password: string
  ): Promise<{ uid: string; email: string; token: string }>;

  firebaseSignout(): Promise<void>;

  firebaseGetUser(): Promise<{ uid: string; email: string } | null>;
}

// ── Firestore + bcrypt + Firebase Auth Delegate ───────────────────────

/**
 * Creates a PipelineDelegate backed by Firestore, bcryptjs, and Firebase Auth.
 *
 * When `userFirebaseConfig` is provided:
 *   - DB operations use the user's Firestore (collections at root level)
 *   - Auth operations use the user's Firebase Auth
 *
 * When `userFirebaseConfig` is NOT provided (backward compat):
 *   - DB operations use Layr's Firestore (scoped under projects/{projectId}/data/...)
 *   - Auth operations throw helpful errors
 */
export function createFirestoreDelegate(
  projectId: string,
  userFirebaseConfig?: UserFirebaseConfig
): PipelineDelegate {
  // Resolve which Firestore & Auth to use
  let firestoreDb: Firestore;
  let firebaseAuth: Auth | null;
  let getCollectionPath: (collectionName: string) => string;

  if (userFirebaseConfig) {
    // User's Firebase — collections at root level (their DB, their rules)
    firestoreDb = getUserFirestore(userFirebaseConfig, projectId);
    firebaseAuth = getUserAuth(userFirebaseConfig, projectId);
    getCollectionPath = (collectionName: string) => collectionName;
  } else {
    // Layr's Firebase — scoped under projects/{projectId}/data/{collection}/records
    firestoreDb = db;
    firebaseAuth = null;
    getCollectionPath = (collectionName: string) =>
      `projects/${projectId}/data/${collectionName}/records`;
  }

  return {
    async dbQuery(
      collectionName: string,
      filters: DbFilter[],
      orderByField?: string,
      orderDirection: "asc" | "desc" = "asc",
      limitCount: number = 20
    ): Promise<any[]> {
      const colPath = getCollectionPath(collectionName);
      const colRef = collection(firestoreDb, colPath);

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
      const colRef = collection(firestoreDb, colPath);

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
      const docRef = doc(firestoreDb, colPath, docId);

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
      const docRef = doc(firestoreDb, colPath, docId);
      await deleteDoc(docRef);
    },

    async hashPassword(plaintext: string): Promise<string> {
      const salt = await bcrypt.genSalt(10);
      return bcrypt.hash(plaintext, salt);
    },

    async comparePassword(plaintext: string, hash: string): Promise<boolean> {
      return bcrypt.compare(plaintext, hash);
    },

    // ── Firebase Auth ──────────────────────────────────────────────────

    async firebaseSignup(
      email: string,
      password: string
    ): Promise<{ uid: string; email: string }> {
      if (!firebaseAuth) {
        throw new Error(
          "Firebase Auth is not available. Please configure your Firebase config in project settings."
        );
      }
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email || email,
      };
    },

    async firebaseLogin(
      email: string,
      password: string
    ): Promise<{ uid: string; email: string; token: string }> {
      if (!firebaseAuth) {
        throw new Error(
          "Firebase Auth is not available. Please configure your Firebase config in project settings."
        );
      }
      const userCredential = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );
      const token = await userCredential.user.getIdToken();
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email || email,
        token,
      };
    },

    async firebaseSignout(): Promise<void> {
      if (!firebaseAuth) {
        throw new Error(
          "Firebase Auth is not available. Please configure your Firebase config in project settings."
        );
      }
      await signOut(firebaseAuth);
    },

    async firebaseGetUser(): Promise<{ uid: string; email: string } | null> {
      if (!firebaseAuth) {
        throw new Error(
          "Firebase Auth is not available. Please configure your Firebase config in project settings."
        );
      }
      const user = firebaseAuth.currentUser;
      if (!user) return null;
      return {
        uid: user.uid,
        email: user.email || "",
      };
    },
  };
}
