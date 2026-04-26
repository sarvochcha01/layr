// ── Backend Editor Types ──────────────────────────────────────────────

/** Supported HTTP methods */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Basic field types for payload schema definitions */
export type FieldType = "string" | "number" | "boolean" | "array" | "object";

/** Data source for an endpoint — mock data now, Firestore later */
export type DataSource = "mock" | "firestore";

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

  // ── Metadata ────────────────────────────────
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

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
