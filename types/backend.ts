// ── Backend Editor Types ──────────────────────────────────────────────

/** Supported HTTP methods */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Basic field types for payload schema definitions */
export type FieldType = "string" | "number" | "boolean" | "array" | "object";

/** Data source for an endpoint — mock data now, Firestore later */
export type DataSource = "mock" | "firestore";

// ── Database Schema Types ─────────────────────────────────────────────

/** A field in a user-defined collection schema */
export interface DbCollectionField {
  id: string;
  name: string;               // e.g. "email", "password", "title"
  type: FieldType;
  required: boolean;
  unique?: boolean;           // Hint for validation (not enforced by Firestore)
  description?: string;
  defaultValue?: string;      // Context path or literal
  isRef?: boolean;            // True if this references another collection
  refCollection?: string;     // Which collection it references
}

/** A user-defined collection in the project's database */
export interface DbCollection {
  id: string;
  name: string;               // e.g. "users", "posts"
  fields: DbCollectionField[];
  description?: string;
}

/**
 * A single field in a request/response payload schema.
 * Kept intentionally simple: name + type + required.
 * Nested structures use the `children` array.
 */
export interface PayloadField {
  id: string;
  name: string;             // e.g. "email", "items", "userId"
  type: FieldType;
  required: boolean;
  description?: string;
  defaultValue?: any;
  children?: PayloadField[]; // For nested object/array item schemas
}

/**
 * Full API endpoint definition created by the user
 * in the Backend Editor.
 */
export interface ApiEndpoint {
  id: string;
  name: string;             // Human-readable, e.g. "Get All Products"
  path: string;             // URL path, e.g. "/products" (no /api/backend prefix)
  method: HttpMethod;
  description?: string;

  // ── Request shape ───────────────────────────
  requestBody?: PayloadField[];   // For POST / PUT / PATCH
  queryParams?: PayloadField[];   // For GET query string params

  // ── Response shape ──────────────────────────
  responseSchema?: PayloadField[];
  mockResponse?: any;             // Phase 1: JSON mock data the user provides
  statusCode?: number;            // Default: 200

  // ── Data source (Phase 2 prep) ──────────────
  dataSource: DataSource;         // "mock" for now
  firestoreCollection?: string;   // Phase 2: collection name for real data

  // ── Logic Pipeline ───────────────────────────
  pipeline?: PipelineStep[];  // Ordered list of logic steps
  usePipeline?: boolean;      // true = execute pipeline; false/undefined = mock mode
  nodeEdges?: PipelineEdge[]; // Edge connections for the node graph UI

  // ── Metadata ────────────────────────────────
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Logic Pipeline Types ──────────────────────────────────────────────

/** Available step types */
export type PipelineStepType =
  | "validate"
  | "condition"
  | "set-variable"
  | "respond"
  | "db-query"
  | "db-insert"
  | "db-update"
  | "db-delete"
  | "collection"
  | "hash"
  | "hash-compare"
  | "string-literal"
  | "number-literal"
  | "boolean-literal"
  | "json-literal";

/** Validation rule operators */
export type ValidationRuleType =
  | "required"
  | "minLength"
  | "maxLength"
  | "regex"
  | "email"
  | "equals"
  | "min"
  | "max";

/** A single validation rule applied to a request field */
export interface ValidationRule {
  id: string;
  field: string;              // Context path, e.g. "body.email"
  rule: ValidationRuleType;
  value?: any;                // e.g. 8 for minLength, regex pattern, etc.
  errorMessage?: string;      // Custom error shown on failure
}

/** Config for "validate" step type */
export interface ValidateStepConfig {
  rules: ValidationRule[];
  failStatus: number;         // HTTP status on validation failure (default: 400)
}

/** Comparison operators for condition steps */
export type ConditionOperator =
  | "equals"
  | "notEquals"
  | "exists"
  | "notExists"
  | "gt"
  | "lt"
  | "contains";

/** Config for "condition" step type */
export interface ConditionStepConfig {
  field: string;              // Context path to check, e.g. "variables.user"
  operator: ConditionOperator;
  value?: any;                // Comparison value (not needed for exists/notExists)
  onFail: "respond" | "skip"; // respond = short-circuit; skip = skip to next step
  failStatus?: number;        // HTTP status when condition fails (for "respond")
  failBody?: Record<string, any>; // Response body when condition fails
}

/** Config for "set-variable" step type */
export interface SetVariableStepConfig {
  name: string;               // Variable name, e.g. "token"
  source: string;             // Context path (e.g. "request.body.email") or literal value
  isLiteral?: boolean;        // If true, source is a literal string, not a context path
  transform?: "none" | "lowercase" | "uppercase" | "trim" | "timestamp" | "uuid";
}

/** Config for "respond" step type */
export interface RespondStepConfig {
  status: number;             // HTTP status code
  bodyMode: "mapping" | "static"; // How to build the response body
  bodyMapping?: Record<string, string>; // field → context path (for mapping mode)
  staticBody?: any;           // Raw JSON body (for static mode)
}

// ── Phase 2: Database & Hash Step Configs ─────────────────────────────

/** Firestore query filter operator */
export type DbFilterOperator = "==" | "!=" | ">" | "<" | ">=" | "<=" | "contains" | "in";

/** A single filter in a DB Query step */
export interface DbFilter {
  id: string;
  field: string;              // Document field name, e.g. "email"
  operator: DbFilterOperator;
  value: string;              // Context path OR literal (prefixed with '"')
  isLiteral?: boolean;        // If true, value is literal, not context path
}

/** Config for "db-query" step */
export interface DbQueryStepConfig {
  collection: string;         // e.g. "users"
  filters: DbFilter[];
  orderBy?: string;           // Field to sort by
  orderDirection?: "asc" | "desc";
  limit: number;              // Max docs (default: 20)
  resultVariable: string;     // Variable to store result (array or single doc if limit=1)
}

/** Config for "db-insert" step */
export interface DbInsertStepConfig {
  collection: string;
  fieldMapping: Record<string, string>;  // docField → context path
  resultVariable?: string;    // Variable to store created doc ID
}

/** Config for "db-update" step */
export interface DbUpdateStepConfig {
  collection: string;
  documentId: string;         // Context path to doc ID, e.g. "variables.user.id"
  fieldMapping: Record<string, string>;
}

/** Config for "db-delete" step */
export interface DbDeleteStepConfig {
  collection: string;
  documentId: string;         // Context path to doc ID
}

/** Config for "hash" step (hash-only mode) */
export interface HashStepConfig {
  input: string;              // Context path to plaintext, e.g. "body.password"
  resultVariable: string;     // Variable to store hashed value
}

/** Config for "hash-compare" step */
export interface HashCompareStepConfig {
  onFail: "respond" | "skip"; // What to do on mismatch
  failStatus?: number;        // HTTP status on mismatch
  failBody?: Record<string, any>;
}

/** Config for "collection" node — outputs a collection name to DB nodes */
export interface CollectionStepConfig {
  collectionName: string;    // e.g. "users"
}

/** Config for "string-literal" node */
export interface StringLiteralConfig {
  value: string;
}

/** Config for "number-literal" node */
export interface NumberLiteralConfig {
  value: number;
}

/** Config for "boolean-literal" node */
export interface BooleanLiteralConfig {
  value: boolean;
}

/** Config for "json-literal" node */
export interface JsonLiteralConfig {
  value: string; // Raw JSON string
}

/**
 * A single step in the Logic Pipeline.
 * Steps execute top-to-bottom. Each step reads from / writes to
 * a shared PipelineContext during execution.
 */
export interface PipelineStep {
  id: string;
  type: PipelineStepType;
  label: string;              // User-visible label, e.g. "Validate Login Fields"
  isEnabled: boolean;
  position?: { x: number; y: number }; // Node graph position

  // Runtime-only: resolved wire paths keyed by targetHandle (set by resolvePipelineFromGraph)
  inputWires?: Record<string, string>;

  // Type-specific config — only one will be populated
  validateConfig?: ValidateStepConfig;
  conditionConfig?: ConditionStepConfig;
  setVariableConfig?: SetVariableStepConfig;
  respondConfig?: RespondStepConfig;
  dbQueryConfig?: DbQueryStepConfig;
  dbInsertConfig?: DbInsertStepConfig;
  dbUpdateConfig?: DbUpdateStepConfig;
  dbDeleteConfig?: DbDeleteStepConfig;
  collectionConfig?: CollectionStepConfig;
  hashConfig?: HashStepConfig;
  hashCompareConfig?: HashCompareStepConfig;
  stringLiteralConfig?: StringLiteralConfig;
  numberLiteralConfig?: NumberLiteralConfig;
  booleanLiteralConfig?: BooleanLiteralConfig;
  jsonLiteralConfig?: JsonLiteralConfig;
}

/** An edge connection between nodes in the pipeline graph */
export interface PipelineEdge {
  id: string;
  source: string;       // Source node ID
  sourceHandle: string; // Output handle ID
  target: string;       // Target node ID
  targetHandle: string; // Input handle ID
  kind?: "exec" | "data"; // "exec" = execution flow wire, "data" = data wire (default)
}

/** Display metadata for each step type — used in the UI */
export const STEP_TYPE_META: Record<PipelineStepType, {
  label: string;
  description: string;
  icon: string;       // Lucide icon name
  color: string;      // Tailwind color class prefix
}> = {
  "validate": {
    label: "Validate",
    description: "Check request fields against rules",
    icon: "ShieldCheck",
    color: "amber",
  },
  "condition": {
    label: "Condition",
    description: "Branch logic based on a value",
    icon: "GitBranch",
    color: "purple",
  },
  "set-variable": {
    label: "Set Variable",
    description: "Store a value for later steps",
    icon: "Variable",
    color: "cyan",
  },
  "respond": {
    label: "Respond",
    description: "Return a response to the client",
    icon: "Send",
    color: "emerald",
  },
  "db-query": {
    label: "DB Query",
    description: "Find documents in a collection",
    icon: "Search",
    color: "blue",
  },
  "db-insert": {
    label: "DB Insert",
    description: "Create a new document",
    icon: "DatabaseZap",
    color: "green",
  },
  "db-update": {
    label: "DB Update",
    description: "Update an existing document",
    icon: "RefreshCw",
    color: "orange",
  },
  "db-delete": {
    label: "DB Delete",
    description: "Delete a document",
    icon: "Trash2",
    color: "red",
  },
  "collection": {
    label: "Collection",
    description: "Select a database collection",
    icon: "TableProperties",
    color: "violet",
  },
  "hash": {
    label: "Hash",
    description: "Hash a password",
    icon: "Lock",
    color: "pink",
  },
  "hash-compare": {
    label: "Compare Hash",
    description: "Compare plaintext against a hash",
    icon: "ShieldCheck",
    color: "pink",
  },
  "string-literal": {
    label: "String",
    description: "A literal string value",
    icon: "Type",
    color: "slate",
  },
  "number-literal": {
    label: "Number",
    description: "A literal number value",
    icon: "Hash",
    color: "slate",
  },
  "boolean-literal": {
    label: "Boolean",
    description: "A literal true/false value",
    icon: "ToggleLeft",
    color: "slate",
  },
  "json-literal": {
    label: "JSON",
    description: "A raw JSON value",
    icon: "Braces",
    color: "slate",
  },
};

/**
 * Method badge color mapping — used by UI components
 * to visually distinguish HTTP methods.
 */
export const METHOD_COLORS: Record<HttpMethod, { bg: string; text: string; border: string }> = {
  GET:    { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
  POST:   { bg: "bg-blue-500/15",    text: "text-blue-400",    border: "border-blue-500/30" },
  PUT:    { bg: "bg-amber-500/15",   text: "text-amber-400",   border: "border-amber-500/30" },
  PATCH:  { bg: "bg-orange-500/15",  text: "text-orange-400",  border: "border-orange-500/30" },
  DELETE: { bg: "bg-red-500/15",     text: "text-red-400",     border: "border-red-500/30" },
};

/** Default field types for quick-add in the UI */
export const FIELD_TYPE_OPTIONS: { value: FieldType; label: string }[] = [
  { value: "string",  label: "String" },
  { value: "number",  label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "array",   label: "Array" },
  { value: "object",  label: "Object" },
];

// ── Backend Action Types ──────────────────────────────────────────────

/** When the action fires */
export type ActionTrigger = "submit" | "click" | "interval" | "mount";

/** Where the payload data comes from */
export type PayloadSource = "form" | "static" | "props";

/** What happens after a successful action */
export type ActionOnSuccess = "toast" | "redirect" | "reset" | "none";

/** What happens after a failed action */
export type ActionOnFail = "toast" | "redirect" | "none";

/**
 * A backend action attached to a component.
 * Defines how and when to send data to a backend endpoint.
 */
export interface BackendAction {
  id: string;
  endpointId: string;           // Which backend endpoint to call
  endpointPath: string;         // Resolved path, e.g. "/login"
  endpointMethod: HttpMethod;   // Resolved method, e.g. "POST"
  trigger: ActionTrigger;       // When to fire
  intervalMs?: number;          // For "interval" trigger (default: 5000)
  payloadSource: PayloadSource; // Where data comes from
  payloadMapping: Record<string, string>;  // sourceKey → requestBodyKey
  staticPayload?: Record<string, any>;     // For "static" source
  onSuccess: ActionOnSuccess;   // What to do on success
  successMessage?: string;      // Toast message
  redirectUrl?: string;         // Redirect URL
  onFail?: ActionOnFail;        // What to do on failure
  failMessage?: string;         // Error toast message (default: show server error)
  failRedirectUrl?: string;     // Redirect on failure
}

/** Trigger display info for the UI */
export const ACTION_TRIGGERS: { value: ActionTrigger; label: string; description: string }[] = [
  { value: "submit",   label: "Form Submit",  description: "When a form is submitted" },
  { value: "click",    label: "Click",        description: "When the component is clicked" },
  { value: "interval", label: "Interval",     description: "Periodically on a timer" },
  { value: "mount",    label: "On Load",      description: "When the component first appears" },
];

export const PAYLOAD_SOURCES: { value: PayloadSource; label: string; description: string }[] = [
  { value: "form",   label: "Form Fields",   description: "Collect data from form inputs" },
  { value: "static", label: "Static JSON",   description: "Send a fixed payload" },
  { value: "props",  label: "Component Props", description: "Send current prop values" },
];

export const SUCCESS_ACTIONS: { value: ActionOnSuccess; label: string }[] = [
  { value: "toast",    label: "Show Toast" },
  { value: "redirect", label: "Redirect" },
  { value: "reset",    label: "Reset Form" },
  { value: "none",     label: "Do Nothing" },
];

export const FAIL_ACTIONS: { value: ActionOnFail; label: string }[] = [
  { value: "toast",    label: "Show Error" },
  { value: "redirect", label: "Redirect" },
  { value: "none",     label: "Do Nothing" },
];
