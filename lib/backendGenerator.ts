import fs from "fs";
import path from "path";
import { ApiEndpoint } from "@/types/backend";
import { UserFirebaseConfig } from "@/types/editor";

export function generateFirebaseConfig(config: UserFirebaseConfig): string {
  return `import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
`;
}

export function generateEnvFile(config: UserFirebaseConfig): string {
  return `# Firebase Configuration
FIREBASE_API_KEY=${config.apiKey || 'your-api-key'}
FIREBASE_AUTH_DOMAIN=${config.authDomain || 'your-auth-domain'}
FIREBASE_PROJECT_ID=${config.projectId || 'your-project-id'}
FIREBASE_STORAGE_BUCKET=${config.storageBucket || 'your-storage-bucket'}
FIREBASE_MESSAGING_SENDER_ID=${config.messagingSenderId || 'your-messaging-sender-id'}
FIREBASE_APP_ID=${config.appId || 'your-app-id'}
`;
}

export function generatePipelineExecutor(): string {
  const filePath = path.join(process.cwd(), "lib", "pipeline-executor.ts");
  let content = fs.readFileSync(filePath, "utf-8");
  // Replace absolute imports with relative imports
  content = content.replace(/@\/types\/backend/g, "../types/backend");
  content = content.replace(/@\/lib\/pipeline-delegates/g, "./pipeline-delegates");
  return content;
}

export function generatePipelineDelegate(): string {
  // A standalone version of pipeline-delegates that uses the direct Firebase instances
  return `import {
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
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { db, auth } from "./firebase";
import bcrypt from "bcryptjs";

export interface DbFilter {
  field: string;
  operator: string;
  value: any;
}

export interface PipelineDelegate {
  dbQuery(collection: string, filters: DbFilter[], orderByField?: string, orderDirection?: "asc" | "desc", limitCount?: number): Promise<any[]>;
  dbInsert(collection: string, data: Record<string, any>): Promise<string>;
  dbUpdate(collection: string, docId: string, data: Record<string, any>): Promise<void>;
  dbDelete(collection: string, docId: string): Promise<void>;
  hashPassword(plaintext: string): Promise<string>;
  comparePassword(plaintext: string, hash: string): Promise<boolean>;
  firebaseSignup(email: string, password: string): Promise<{ uid: string; email: string }>;
  firebaseLogin(email: string, password: string): Promise<{ uid: string; email: string; token: string }>;
  firebaseSignout(): Promise<void>;
  firebaseGetUser(): Promise<{ uid: string; email: string } | null>;
}

export function createFirestoreDelegate(): PipelineDelegate {
  return {
    async dbQuery(collectionName: string, filters: DbFilter[], orderByField?: string, orderDirection: "asc" | "desc" = "asc", limitCount: number = 20) {
      const colRef = collection(db, collectionName);
      const constraints: any[] = [];
      for (const f of filters) {
        let op: WhereFilterOp;
        switch (f.operator) {
          case "==": op = "=="; break;
          case "!=": op = "!="; break;
          case ">": op = ">"; break;
          case "<": op = "<"; break;
          case ">=": op = ">="; break;
          case "<=": op = "<="; break;
          case "contains": op = "array-contains"; break;
          case "in": op = "in"; break;
          default: op = "==";
        }
        constraints.push(where(f.field, op, f.value));
      }
      if (orderByField) constraints.push(fsOrderBy(orderByField, orderDirection));
      constraints.push(fsLimit(limitCount));
      const q = query(colRef, ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    async dbInsert(collectionName: string, data: Record<string, any>) {
      const colRef = collection(db, collectionName);
      const docRef = await addDoc(colRef, { ...data, _createdAt: Timestamp.now() });
      return docRef.id;
    },
    async dbUpdate(collectionName: string, docId: string, data: Record<string, any>) {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, { ...data, _updatedAt: Timestamp.now() });
    },
    async dbDelete(collectionName: string, docId: string) {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    },
    async hashPassword(plaintext: string) {
      const salt = await bcrypt.genSalt(10);
      return bcrypt.hash(plaintext, salt);
    },
    async comparePassword(plaintext: string, hash: string) {
      return bcrypt.compare(plaintext, hash);
    },
    async firebaseSignup(email: string, password: string) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { uid: userCredential.user.uid, email: userCredential.user.email || email };
    },
    async firebaseLogin(email: string, password: string) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      return { uid: userCredential.user.uid, email: userCredential.user.email || email, token };
    },
    async firebaseSignout() {
      await signOut(auth);
    },
    async firebaseGetUser() {
      const user = auth.currentUser;
      if (!user) return null;
      return { uid: user.uid, email: user.email || "" };
    },
  };
}
`;
}

export function generateBackendTypes(): string {
  const filePath = path.join(process.cwd(), "types", "backend.ts");
  let content = fs.readFileSync(filePath, "utf-8");
  return content;
}

export function generateApiRoute(endpoints: ApiEndpoint[]): string {
  let handlers = "";

  for (const endpoint of endpoints) {
    if (!endpoint.isEnabled) continue;

    const method = endpoint.method.toUpperCase();
    const pipelineStepsStr = JSON.stringify(endpoint.pipeline || [], null, 2);
    const nodeEdgesStr = JSON.stringify(endpoint.nodeEdges || [], null, 2);
    
    // Add 4-space indentation for better formatting
    const indent = "  ";
    const indentObj = (str: string) => str.split('\\n').map((line, i) => i === 0 ? line : indent + line).join('\\n');

    handlers += `
export async function ${method}(request: NextRequest) {
  try {
    let body: Record<string, any> = {};
    try {
      body = await request.json();
    } catch {
      // No body or invalid JSON
    }

    const query: Record<string, any> = {};
    request.nextUrl.searchParams.forEach((v, k) => { query[k] = v; });

    const headers: Record<string, string> = {};
    request.headers.forEach((v, k) => { headers[k] = v; });

    const pipelineSteps = ${indentObj(pipelineStepsStr)};
    const nodeEdges = ${indentObj(nodeEdgesStr)};

    const delegate = createFirestoreDelegate();

    const result = await executePipeline(
      pipelineSteps,
      { body, query, headers },
      delegate,
      nodeEdges
    );

    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
`;
  }

  return `import { NextRequest, NextResponse } from "next/server";
import { executePipeline } from "@/lib/pipeline-executor";
import { createFirestoreDelegate } from "@/lib/pipeline-delegates";
${handlers}`;
}

export function getBackendDependencies(): Record<string, string> {
  return {
    "firebase": "^10.8.0",
    "bcryptjs": "^2.4.3",
    "@types/bcryptjs": "^2.4.6"
  };
}
