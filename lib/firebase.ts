import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import type { UserFirebaseConfig } from "@/types/editor";

// ── Layr's own Firebase (default app) ─────────────────────────────────

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Layr's Firebase (default app)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };

// ── User's Firebase (named app per project) ───────────────────────────

/**
 * Cache for user Firebase app instances.
 * Key: projectId, Value: { app, db, auth }
 * Prevents re-initialization on every API call.
 */
const userAppCache = new Map<string, { app: FirebaseApp; db: Firestore; auth: Auth }>();

/**
 * Get or create a Firebase app instance for a user's project.
 * Uses a named app (keyed by projectId) so it doesn't conflict with Layr's default app.
 */
export function createUserFirebaseApp(config: UserFirebaseConfig, projectId: string): FirebaseApp {
    const cached = userAppCache.get(projectId);
    if (cached) return cached.app;

    const appName = `user-${projectId}`;

    // Check if this named app already exists (e.g. from a previous server request)
    let userApp: FirebaseApp;
    try {
        userApp = getApp(appName);
    } catch {
        userApp = initializeApp(
            {
                apiKey: config.apiKey,
                authDomain: config.authDomain,
                projectId: config.projectId,
                storageBucket: config.storageBucket,
                messagingSenderId: config.messagingSenderId,
                appId: config.appId,
            },
            appName
        );
    }

    const userDb = getFirestore(userApp);
    const userAuth = getAuth(userApp);
    userAppCache.set(projectId, { app: userApp, db: userDb, auth: userAuth });

    return userApp;
}

/**
 * Get a Firestore instance for the user's Firebase project.
 * Data is stored directly in the user's Firestore (no nesting under projects/).
 */
export function getUserFirestore(config: UserFirebaseConfig, projectId: string): Firestore {
    const cached = userAppCache.get(projectId);
    if (cached) return cached.db;

    createUserFirebaseApp(config, projectId);
    return userAppCache.get(projectId)!.db;
}

/**
 * Get a Firebase Auth instance for the user's Firebase project.
 * Used for signup/login/session in the user's built app.
 */
export function getUserAuth(config: UserFirebaseConfig, projectId: string): Auth {
    const cached = userAppCache.get(projectId);
    if (cached) return cached.auth;

    createUserFirebaseApp(config, projectId);
    return userAppCache.get(projectId)!.auth;
}
