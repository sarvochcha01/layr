/**
 * Endpoint Templates — pre-built, working backend configurations
 * for common use cases (auth, CRUD, etc.).
 *
 * Each template produces a complete ApiEndpoint with a fully-wired
 * pipeline (exec + data edges), so users get a functional backend
 * with one click.
 */

import { ApiEndpoint, PipelineStep, PipelineEdge } from "@/types/backend";
import { generateId } from "@/lib/utils";

export interface EndpointTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "auth" | "crud" | "utility";
  create: () => ApiEndpoint[];
}

// ── Helpers ───────────────────────────────────────────────────────────

const REQUEST_NODE_ID = "__request__";
const COL_GAP = 320;
const ROW_GAP = 200;

function makeStep(
  type: PipelineStep["type"],
  label: string,
  config: Partial<PipelineStep>,
  position?: { x: number; y: number },
): PipelineStep {
  return {
    id: generateId(),
    type,
    label,
    isEnabled: true,
    position: position || { x: 0, y: 50 },
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
    nodeEdges: [],
    ...overrides,
  };
}

/** Create an exec wire */
function execEdge(sourceId: string, sourceHandle: string, targetId: string): PipelineEdge {
  return {
    id: `e-${generateId()}`,
    source: sourceId,
    sourceHandle,
    target: targetId,
    targetHandle: "exec-in",
    kind: "exec",
  };
}

/** Create a data wire */
function dataEdge(
  sourceId: string, sourceHandle: string,
  targetId: string, targetHandle: string,
): PipelineEdge {
  return {
    id: `e-${generateId()}`,
    source: sourceId,
    sourceHandle,
    target: targetId,
    targetHandle,
    kind: "data",
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
      // ── POST /signup ──────────────────────────────────────────────

      // One rule per validate node for full transparency
      const sValEmailReq = makeStep("validate", "Email Required", {
        validateConfig: {
          rules: [
            { id: generateId(), field: "body.email", rule: "required", errorMessage: "Email is required" },
          ],
          failStatus: 400,
        },
      }, { x: COL_GAP, y: 50 });

      const sValEmailFmt = makeStep("validate", "Email Format", {
        validateConfig: {
          rules: [
            { id: generateId(), field: "body.email", rule: "email", errorMessage: "Invalid email format" },
          ],
          failStatus: 400,
        },
      }, { x: COL_GAP * 2, y: 50 });

      const sValPwReq = makeStep("validate", "Password Required", {
        validateConfig: {
          rules: [
            { id: generateId(), field: "body.password", rule: "required", errorMessage: "Password is required" },
          ],
          failStatus: 400,
        },
      }, { x: COL_GAP * 3, y: 50 });

      const sValPwLen = makeStep("validate", "Password Min 6", {
        validateConfig: {
          rules: [
            { id: generateId(), field: "body.password", rule: "minLength", value: "6", errorMessage: "Password must be at least 6 characters" },
          ],
          failStatus: 400,
        },
      }, { x: COL_GAP * 4, y: 50 });

      const sCollection = makeStep("collection", "Users Collection", {
        collectionConfig: { collectionName: "users" },
      }, { x: COL_GAP * 5, y: 350 });

      const sCheckUser = makeStep("db-query", "Check Existing User", {
        dbQueryConfig: {
          collection: "users",
          filters: [
            { id: generateId(), field: "email", operator: "==", value: "body.email", isLiteral: false },
          ],
          limit: 1,
          resultVariable: "existingUser",
        },
      }, { x: COL_GAP * 5, y: 50 });

      const sCondition = makeStep("condition", "Email Already Taken?", {
        conditionConfig: {
          field: "variables.existingUser",
          operator: "exists",
          onFail: "skip",
        },
      }, { x: COL_GAP * 6, y: 50 });

      const sRespondDup = makeStep("respond", "Email Exists Error", {
        respondConfig: {
          status: 409,
          bodyMode: "static",
          staticBody: { error: "An account with this email already exists" },
        },
      }, { x: COL_GAP * 7, y: ROW_GAP + 50 });

      const sHash = makeStep("hash", "Hash Password", {
        hashConfig: {
          input: "body.password",
          resultVariable: "hashedPassword",
        },
      }, { x: COL_GAP * 7, y: 50 });

      const sInsert = makeStep("db-insert", "Create User", {
        dbInsertConfig: {
          collection: "users",
          fieldMapping: {},
          resultVariable: "userId",
        },
      }, { x: COL_GAP * 8, y: 50 });

      const sRespondOk = makeStep("respond", "Return Success", {
        respondConfig: {
          status: 201,
          bodyMode: "static",
          staticBody: { success: true, message: "Account created successfully" },
        },
      }, { x: COL_GAP * 9, y: 50 });

      const signupPipeline = [sValEmailReq, sValEmailFmt, sValPwReq, sValPwLen, sCollection, sCheckUser, sCondition, sRespondDup, sHash, sInsert, sRespondOk];
      const signupEdges: PipelineEdge[] = [
        // Exec flow: Request → EmailReq → EmailFmt → PwReq → PwLen → CheckUser → Condition → Hash → Insert → Respond OK
        execEdge(REQUEST_NODE_ID, "exec-out", sValEmailReq.id),
        execEdge(sValEmailReq.id, "exec-pass", sValEmailFmt.id),
        execEdge(sValEmailFmt.id, "exec-pass", sValPwReq.id),
        execEdge(sValPwReq.id, "exec-pass", sValPwLen.id),
        execEdge(sValPwLen.id, "exec-pass", sCheckUser.id),
        execEdge(sCheckUser.id, "exec-out", sCondition.id),
        execEdge(sCondition.id, "exec-true", sRespondDup.id),
        execEdge(sCondition.id, "exec-false", sHash.id),
        execEdge(sHash.id, "exec-out", sInsert.id),
        execEdge(sInsert.id, "exec-out", sRespondOk.id),

        // Data wires
        dataEdge(REQUEST_NODE_ID, "body-email", sValEmailReq.id, "validate-data"),
        dataEdge(REQUEST_NODE_ID, "body-email", sValEmailFmt.id, "validate-data"),
        dataEdge(REQUEST_NODE_ID, "body-password", sValPwReq.id, "validate-data"),
        dataEdge(REQUEST_NODE_ID, "body-password", sValPwLen.id, "validate-data"),
        dataEdge(REQUEST_NODE_ID, "body-email", sCheckUser.id, "filter-email"),
        dataEdge(sCollection.id, "collection-out", sCheckUser.id, "q-collection"),
        dataEdge(REQUEST_NODE_ID, "body-password", sHash.id, "hash-input"),
        dataEdge(sCollection.id, "collection-out", sInsert.id, "i-collection"),
        dataEdge(REQUEST_NODE_ID, "body-email", sInsert.id, "field-email"),
        dataEdge(sHash.id, "hash-result", sInsert.id, "field-password"),
      ];

      const signup = makeEndpoint({
        name: "Sign Up",
        path: "/signup",
        method: "POST",
        description: "Register a new user with email and password",
        requestBody: [
          { id: generateId(), name: "email", type: "string", required: true },
          { id: generateId(), name: "password", type: "string", required: true },
        ],
        pipeline: signupPipeline,
        nodeEdges: signupEdges,
      });

      // ── POST /login ───────────────────────────────────────────────

      const lValEmail = makeStep("validate", "Validate Email", {
        validateConfig: {
          rules: [
            { id: generateId(), field: "body.email", rule: "required", errorMessage: "Email is required" },
          ],
          failStatus: 400,
        },
      }, { x: COL_GAP, y: 50 });

      const lValPw = makeStep("validate", "Validate Password", {
        validateConfig: {
          rules: [
            { id: generateId(), field: "body.password", rule: "required", errorMessage: "Password is required" },
          ],
          failStatus: 400,
        },
      }, { x: COL_GAP * 2, y: 50 });

      const lCollection = makeStep("collection", "Users Collection", {
        collectionConfig: { collectionName: "users" },
      }, { x: COL_GAP * 3, y: 300 });

      const lFindUser = makeStep("db-query", "Find User", {
        dbQueryConfig: {
          collection: "users",
          filters: [
            { id: generateId(), field: "email", operator: "==", value: "body.email", isLiteral: false },
          ],
          limit: 1,
          resultVariable: "user",
        },
      }, { x: COL_GAP * 3, y: 50 });

      const lCondition = makeStep("condition", "User Exists?", {
        conditionConfig: {
          field: "variables.user",
          operator: "exists",
          onFail: "skip",
        },
      }, { x: COL_GAP * 4, y: 50 });

      const lRespondNotFound = makeStep("respond", "User Not Found", {
        respondConfig: {
          status: 401,
          bodyMode: "static",
          staticBody: { error: "Invalid email or password" },
        },
      }, { x: COL_GAP * 5, y: ROW_GAP + 50 });

      const lHashCompare = makeStep("hash-compare", "Verify Password", {
        hashCompareConfig: {
          onFail: "skip",
          failStatus: 401,
          failBody: { error: "Invalid email or password" },
        },
      }, { x: COL_GAP * 5, y: 50 });

      const lRespondWrongPw = makeStep("respond", "Wrong Password", {
        respondConfig: {
          status: 401,
          bodyMode: "static",
          staticBody: { error: "Invalid email or password" },
        },
      }, { x: COL_GAP * 6, y: ROW_GAP + 50 });

      const lRespondOk = makeStep("respond", "Return User", {
        respondConfig: {
          status: 200,
          bodyMode: "mapping",
          bodyMapping: {
            userId: "variables.user.id",
            email: "variables.user.email",
          },
        },
      }, { x: COL_GAP * 6, y: 50 });

      const loginPipeline = [lValEmail, lValPw, lCollection, lFindUser, lCondition, lRespondNotFound, lHashCompare, lRespondWrongPw, lRespondOk];
      const loginEdges: PipelineEdge[] = [
        // Exec: Request → ValEmail → ValPw → FindUser → Condition → (true) HashCompare → (match) Respond OK
        //                                                                              → (mismatch) Respond WrongPw
        //                                              → (false) Respond NotFound
        execEdge(REQUEST_NODE_ID, "exec-out", lValEmail.id),
        execEdge(lValEmail.id, "exec-pass", lValPw.id),
        execEdge(lValPw.id, "exec-pass", lFindUser.id),
        execEdge(lFindUser.id, "exec-out", lCondition.id),
        execEdge(lCondition.id, "exec-true", lHashCompare.id),
        execEdge(lCondition.id, "exec-false", lRespondNotFound.id),
        execEdge(lHashCompare.id, "exec-match", lRespondOk.id),
        execEdge(lHashCompare.id, "exec-mismatch", lRespondWrongPw.id),

        // Data wires
        dataEdge(REQUEST_NODE_ID, "body-email", lValEmail.id, "validate-data"),
        dataEdge(REQUEST_NODE_ID, "body-password", lValPw.id, "validate-data"),
        dataEdge(REQUEST_NODE_ID, "body-email", lFindUser.id, "filter-email"),
        dataEdge(lCollection.id, "collection-out", lFindUser.id, "q-collection"),

        // Hash compare: plaintext from Request, storedHash = .password field from query
        dataEdge(REQUEST_NODE_ID, "body-password", lHashCompare.id, "hc-plaintext"),
        dataEdge(lFindUser.id, "qf-password", lHashCompare.id, "hc-storedHash"),
      ];

      const login = makeEndpoint({
        name: "Login",
        path: "/login",
        method: "POST",
        description: "Authenticate a user with email and password",
        requestBody: [
          { id: generateId(), name: "email", type: "string", required: true },
          { id: generateId(), name: "password", type: "string", required: true },
        ],
        pipeline: loginPipeline,
        nodeEdges: loginEdges,
      });

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

      // ── GET /items — List All ─────────────────────────────────────

      const listCollection = makeStep("collection", "Items Collection", {
        collectionConfig: { collectionName },
      }, { x: COL_GAP, y: 250 });

      const listQuery = makeStep("db-query", "Fetch All", {
        dbQueryConfig: {
          collection: collectionName,
          filters: [],
          limit: 50,
          resultVariable: "items",
        },
      }, { x: COL_GAP, y: 50 });

      const listRespond = makeStep("respond", "Return Items", {
        respondConfig: {
          status: 200,
          bodyMode: "mapping",
          bodyMapping: {
            items: "variables.items",
          },
        },
      }, { x: COL_GAP * 2, y: 50 });

      const list = makeEndpoint({
        name: "List Items",
        path: `/${collectionName}`,
        method: "GET",
        description: `Retrieve all ${collectionName}`,
        pipeline: [listCollection, listQuery, listRespond],
        nodeEdges: [
          execEdge(REQUEST_NODE_ID, "exec-out", listQuery.id),
          execEdge(listQuery.id, "exec-out", listRespond.id),
          dataEdge(listCollection.id, "collection-out", listQuery.id, "q-collection"),
          dataEdge(listQuery.id, "query-result", listRespond.id, "resp-body"),
        ],
      });

      // ── POST /items — Create ──────────────────────────────────────

      const cValidate = makeStep("validate", "Validate Fields", {
        validateConfig: {
          rules: [
            { id: generateId(), field: "body.name", rule: "required", errorMessage: "Name is required" },
          ],
          failStatus: 400,
        },
      }, { x: COL_GAP, y: 50 });

      const cRespondFail = makeStep("respond", "Validation Error", {
        respondConfig: {
          status: 400,
          bodyMode: "static",
          staticBody: { error: "Validation failed" },
        },
      }, { x: COL_GAP * 2, y: ROW_GAP + 50 });

      const cCollection = makeStep("collection", "Items Collection", {
        collectionConfig: { collectionName },
      }, { x: COL_GAP * 2, y: 300 });

      const cInsert = makeStep("db-insert", "Insert Document", {
        dbInsertConfig: {
          collection: collectionName,
          fieldMapping: {},
          resultVariable: "newId",
        },
      }, { x: COL_GAP * 2, y: 50 });

      const cRespond = makeStep("respond", "Return Created", {
        respondConfig: {
          status: 201,
          bodyMode: "static",
          staticBody: { success: true, message: "Item created" },
        },
      }, { x: COL_GAP * 3, y: 50 });

      const create = makeEndpoint({
        name: "Create Item",
        path: `/${collectionName}`,
        method: "POST",
        description: `Create a new ${collectionName.slice(0, -1)}`,
        requestBody: [
          { id: generateId(), name: "name", type: "string", required: true },
          { id: generateId(), name: "description", type: "string", required: false },
        ],
        pipeline: [cValidate, cRespondFail, cCollection, cInsert, cRespond],
        nodeEdges: [
          execEdge(REQUEST_NODE_ID, "exec-out", cValidate.id),
          execEdge(cValidate.id, "exec-pass", cInsert.id),
          execEdge(cValidate.id, "exec-fail", cRespondFail.id),
          execEdge(cInsert.id, "exec-out", cRespond.id),
          dataEdge(REQUEST_NODE_ID, "body-name", cValidate.id, "validate-data"),
          dataEdge(cCollection.id, "collection-out", cInsert.id, "i-collection"),
          dataEdge(REQUEST_NODE_ID, "body-name", cInsert.id, "field-name"),
          dataEdge(REQUEST_NODE_ID, "body-description", cInsert.id, "field-description"),
        ],
      });

      // ── DELETE /items — Delete by ID ──────────────────────────────

      const dValidate = makeStep("validate", "Validate ID", {
        validateConfig: {
          rules: [
            { id: generateId(), field: "body.id", rule: "required", errorMessage: "Document ID is required" },
          ],
          failStatus: 400,
        },
      }, { x: COL_GAP, y: 50 });

      const dRespondFail = makeStep("respond", "Validation Error", {
        respondConfig: {
          status: 400,
          bodyMode: "static",
          staticBody: { error: "Document ID is required" },
        },
      }, { x: COL_GAP * 2, y: ROW_GAP + 50 });

      const dCollection = makeStep("collection", "Items Collection", {
        collectionConfig: { collectionName },
      }, { x: COL_GAP * 2, y: 300 });

      const dDelete = makeStep("db-delete", "Delete Document", {
        dbDeleteConfig: {
          collection: collectionName,
          documentId: "body.id",
        },
      }, { x: COL_GAP * 2, y: 50 });

      const dRespond = makeStep("respond", "Return Success", {
        respondConfig: {
          status: 200,
          bodyMode: "static",
          staticBody: { success: true, message: "Item deleted" },
        },
      }, { x: COL_GAP * 3, y: 50 });

      const del = makeEndpoint({
        name: "Delete Item",
        path: `/${collectionName}`,
        method: "DELETE",
        description: `Delete a ${collectionName.slice(0, -1)} by ID`,
        requestBody: [
          { id: generateId(), name: "id", type: "string", required: true },
        ],
        pipeline: [dValidate, dRespondFail, dCollection, dDelete, dRespond],
        nodeEdges: [
          execEdge(REQUEST_NODE_ID, "exec-out", dValidate.id),
          execEdge(dValidate.id, "exec-pass", dDelete.id),
          execEdge(dValidate.id, "exec-fail", dRespondFail.id),
          execEdge(dDelete.id, "exec-out", dRespond.id),
          dataEdge(REQUEST_NODE_ID, "body-id", dValidate.id, "validate-data"),
          dataEdge(dCollection.id, "collection-out", dDelete.id, "d-collection"),
          dataEdge(REQUEST_NODE_ID, "body-id", dDelete.id, "doc-id"),
        ],
      });

      return [list, create, del];
    },
  },
];
