/**
 * Endpoint Templates — pre-built, working backend configurations
 * for common use cases (auth, CRUD, etc.).
 *
 * Each template produces a complete ApiEndpoint with a fully-wired
 * pipeline, so users get a functional backend with one click.
 */

import { ApiEndpoint, PipelineStep } from "@/types/backend";
import { generateId } from "@/lib/utils";

export interface EndpointTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;       // Emoji
  category: "auth" | "crud" | "utility";
  /** Creates one or more fully-configured endpoints */
  create: () => ApiEndpoint[];
}

// ── Helpers ───────────────────────────────────────────────────────────

function makeStep(
  type: PipelineStep["type"],
  label: string,
  config: Partial<PipelineStep>
): PipelineStep {
  return {
    id: generateId(),
    type,
    label,
    isEnabled: true,
    ...config,
  };
}

function makeEndpoint(overrides: Partial<ApiEndpoint>): ApiEndpoint {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: "",
    path: "/",
    method: "GET",
    description: "",
    queryParams: [],
    requestBody: [],
    responseSchema: [],
    mockResponse: null,
    statusCode: 200,
    dataSource: "mock",
    isEnabled: true,
    createdAt: now,
    updatedAt: now,
    usePipeline: true,
    pipeline: [],
    ...overrides,
  };
}

// ── Templates ─────────────────────────────────────────────────────────

export const ENDPOINT_TEMPLATES: EndpointTemplate[] = [
  // ─────────────────────────────── AUTH ────────────────────────────────
  {
    id: "auth-signup-login",
    name: "Auth: Signup + Login",
    description: "Complete email/password auth with hashed passwords, duplicate email check, and login verification.",
    icon: "🔐",
    category: "auth",
    create: () => {
      // ── POST /signup ────────────────────────────────────────────
      const signup = makeEndpoint({
        name: "Sign Up",
        path: "/signup",
        method: "POST",
        description: "Register a new user with email and password",
        pipeline: [
          // 1. Validate required fields (chained — one rule per validate node)
          makeStep("validate", "Email Required", {
            validateConfig: {
              rules: [
                { id: generateId(), field: "body.email", rule: "required", errorMessage: "Email is required" },
              ],
              failStatus: 400,
            },
          }),
          makeStep("validate", "Email Format", {
            validateConfig: {
              rules: [
                { id: generateId(), field: "body.email", rule: "email", errorMessage: "Invalid email format" },
              ],
              failStatus: 400,
            },
          }),
          makeStep("validate", "Password Required", {
            validateConfig: {
              rules: [
                { id: generateId(), field: "body.password", rule: "required", errorMessage: "Password is required" },
              ],
              failStatus: 400,
            },
          }),
          makeStep("validate", "Password Length", {
            validateConfig: {
              rules: [
                { id: generateId(), field: "body.password", rule: "minLength", value: "6", errorMessage: "Password must be at least 6 characters" },
              ],
              failStatus: 400,
            },
          }),

          // 2. Check for existing user with same email
          makeStep("db-query", "Check Existing User", {
            dbQueryConfig: {
              collection: "users",
              filters: [
                { id: generateId(), field: "email", operator: "==", value: "body.email", isLiteral: false },
              ],
              limit: 1,
              resultVariable: "existingUser",
            },
          }),

          // 3. If user already exists, respond with error
          makeStep("condition", "Email Already Taken?", {
            conditionConfig: {
              field: "variables.existingUser",
              operator: "notExists",
              onFail: "respond",
              failStatus: 409,
              failBody: { error: "An account with this email already exists" },
            },
          }),

          // 4. Hash the password
          makeStep("hash", "Hash Password", {
            hashConfig: {
              input: "body.password",
              resultVariable: "hashedPassword",
            },
          }),

          // 5. Insert user document
          makeStep("db-insert", "Create User", {
            dbInsertConfig: {
              collection: "users",
              fieldMapping: {
                email: "body.email",
                password: "hashedPassword",
              },
              resultVariable: "userId",
            },
          }),

          // 6. Respond with success
          makeStep("respond", "Return Success", {
            respondConfig: {
              status: 201,
              bodyMode: "mapping",
              bodyMapping: {
                success: "",
                message: "",
                userId: "variables.userId",
              },
              staticBody: { success: true, message: "Account created successfully" },
            },
          }),
        ],
      });

      // Fix the respond step — use static body for the success case
      // (the mapping mode has limitations for literal values, so use static for simplicity)
      const respondStep = signup.pipeline![signup.pipeline!.length - 1];
      respondStep.respondConfig = {
        status: 201,
        bodyMode: "static",
        staticBody: {
          success: true,
          message: "Account created successfully",
        },
      };

      // ── POST /login ─────────────────────────────────────────────
      const login = makeEndpoint({
        name: "Login",
        path: "/login",
        method: "POST",
        description: "Authenticate a user with email and password",
        pipeline: [
          // 1. Validate required fields (chained)
          makeStep("validate", "Email Required", {
            validateConfig: {
              rules: [
                { id: generateId(), field: "body.email", rule: "required", errorMessage: "Email is required" },
              ],
              failStatus: 400,
            },
          }),
          makeStep("validate", "Password Required", {
            validateConfig: {
              rules: [
                { id: generateId(), field: "body.password", rule: "required", errorMessage: "Password is required" },
              ],
              failStatus: 400,
            },
          }),

          // 2. Find user by email
          makeStep("db-query", "Find User", {
            dbQueryConfig: {
              collection: "users",
              filters: [
                { id: generateId(), field: "email", operator: "==", value: "body.email", isLiteral: false },
              ],
              limit: 1,
              resultVariable: "user",
            },
          }),

          // 3. Check user exists
          makeStep("condition", "User Exists?", {
            conditionConfig: {
              field: "variables.user",
              operator: "exists",
              onFail: "respond",
              failStatus: 401,
              failBody: { error: "Invalid email or password" },
            },
          }),

          // 4. Compare password
          makeStep("hash-compare", "Verify Password", {
            hashCompareConfig: {
              onFail: "respond",
              failStatus: 401,
              failBody: { error: "Invalid email or password" },
            },
          }),

          // 5. Respond with user data (excluding password)
          makeStep("respond", "Return User", {
            respondConfig: {
              status: 200,
              bodyMode: "mapping",
              bodyMapping: {
                success: "",
                userId: "variables.user.id",
                email: "variables.user.email",
              },
              staticBody: { success: true },
            },
          }),
        ],
      });

      // Fix respond — static body with a mapping-like approach
      const loginRespondStep = login.pipeline![login.pipeline!.length - 1];
      loginRespondStep.respondConfig = {
        status: 200,
        bodyMode: "mapping",
        bodyMapping: {
          userId: "variables.user.id",
          email: "variables.user.email",
        },
      };

      return [signup, login];
    },
  },

  // ─────────────────────────────── CRUD ────────────────────────────────
  {
    id: "crud-basic",
    name: "CRUD: Basic Collection",
    description: "Create, Read, Update, Delete endpoints for a collection. Customize the collection name after creating.",
    icon: "📦",
    category: "crud",
    create: () => {
      const collectionName = "items";

      // GET /items — list all
      const list = makeEndpoint({
        name: "List Items",
        path: `/${collectionName}`,
        method: "GET",
        description: `Retrieve all ${collectionName}`,
        pipeline: [
          makeStep("db-query", "Fetch All", {
            dbQueryConfig: {
              collection: collectionName,
              filters: [],
              limit: 50,
              resultVariable: "items",
            },
          }),
          makeStep("respond", "Return Items", {
            respondConfig: {
              status: 200,
              bodyMode: "mapping",
              bodyMapping: {
                items: "variables.items",
              },
            },
          }),
        ],
      });

      // POST /items — create
      const create = makeEndpoint({
        name: "Create Item",
        path: `/${collectionName}`,
        method: "POST",
        description: `Create a new ${collectionName.slice(0, -1)}`,
        pipeline: [
          makeStep("validate", "Validate Fields", {
            validateConfig: {
              rules: [
                { id: generateId(), field: "body.name", rule: "required", errorMessage: "Name is required" },
              ],
              failStatus: 400,
            },
          }),
          makeStep("db-insert", "Insert Document", {
            dbInsertConfig: {
              collection: collectionName,
              fieldMapping: {
                name: "body.name",
                description: "body.description",
              },
              resultVariable: "newId",
            },
          }),
          makeStep("respond", "Return Created", {
            respondConfig: {
              status: 201,
              bodyMode: "static",
              staticBody: { success: true, message: "Item created" },
            },
          }),
        ],
      });

      // DELETE /items — delete by ID (passed in body)
      const del = makeEndpoint({
        name: "Delete Item",
        path: `/${collectionName}`,
        method: "DELETE",
        description: `Delete a ${collectionName.slice(0, -1)} by ID`,
        pipeline: [
          makeStep("validate", "Validate ID", {
            validateConfig: {
              rules: [
                { id: generateId(), field: "body.id", rule: "required", errorMessage: "Document ID is required" },
              ],
              failStatus: 400,
            },
          }),
          makeStep("db-delete", "Delete Document", {
            dbDeleteConfig: {
              collection: collectionName,
              documentId: "body.id",
            },
          }),
          makeStep("respond", "Return Success", {
            respondConfig: {
              status: 200,
              bodyMode: "static",
              staticBody: { success: true, message: "Item deleted" },
            },
          }),
        ],
      });

      return [list, create, del];
    },
  },
];
