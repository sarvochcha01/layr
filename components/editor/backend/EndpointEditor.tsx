"use client";

import { useState, useEffect } from "react";
import {
  ApiEndpoint,
  HttpMethod,
  METHOD_COLORS,
  PayloadField,
  DbCollection,
} from "@/types/backend";
import { PayloadFieldEditor } from "./PayloadFieldEditor";
import { MockDataEditor } from "./MockDataEditor";
import { NodePipelineEditor } from "./NodePipelineEditor";
import {
  ChevronDown,
  ChevronRight,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Copy,
  Globe,
} from "lucide-react";

interface EndpointEditorProps {
  endpoint: ApiEndpoint;
  onChange: (updates: Partial<ApiEndpoint>) => void;
  projectId: string | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  allEndpoints: ApiEndpoint[];
  dbSchema?: DbCollection[];
}

const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export function EndpointEditor({
  endpoint,
  onChange,
  projectId,
  activeTab,
  onTabChange,
  allEndpoints,
  dbSchema = [],
}: EndpointEditorProps) {
  const activeSection = activeTab;

  // Check for duplicate path
  const isDuplicatePath = allEndpoints.some(
    (ep) => ep.id !== endpoint.id && ep.path === endpoint.path && ep.method === endpoint.method
  );
  const [testResult, setTestResult] = useState<{
    status: number;
    data: any;
    time: number;
    trace?: any[];
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [testBody, setTestBody] = useState<string>("");
  const [testQuery, setTestQuery] = useState<string>("");

  // Auto-generate a sample body when switching to Test tab or endpoint changes
  useEffect(() => {
    if (hasBody && endpoint.requestBody && endpoint.requestBody.length > 0) {
      const sample: Record<string, any> = {};
      endpoint.requestBody.forEach((field) => {
        sample[field.name] = field.defaultValue ?? getSampleValue(field.type);
      });
      setTestBody(JSON.stringify(sample, null, 2));
    } else {
      setTestBody("");
    }
  }, [endpoint.id, endpoint.requestBody?.length]);

  const methodColors = METHOD_COLORS[endpoint.method];
  const hasBody = ["POST", "PUT", "PATCH"].includes(endpoint.method);

  const sections = [
    { id: "general", label: "General" },
    { id: "request", label: "Request" },
    { id: "logic", label: "Logic" },
    { id: "response", label: "Response" },
    { id: "test", label: "Test" },
  ];

  const handleTest = async () => {
    if (!projectId) return;

    setIsTesting(true);
    setTestResult(null);
    setTestError(null);

    const startTime = performance.now();

    try {
      let basePath = endpoint.path.startsWith("/") ? endpoint.path : `/${endpoint.path}`;
      // Append query string if provided
      if (testQuery.trim()) {
        const sep = basePath.includes("?") ? "&" : "?";
        basePath += sep + testQuery.trim();
      }
      const url = `/api/backend${basePath}`;

      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          "Content-Type": "application/json",
          "x-project-id": projectId,
        },
      };

      // Use the user-edited body
      if (hasBody && testBody.trim()) {
        try {
          JSON.parse(testBody); // validate
          options.body = testBody;
        } catch {
          setTestError("Invalid JSON in request body");
          setIsTesting(false);
          return;
        }
      }

      const response = await fetch(url, options);
      const data = await response.json();
      const time = Math.round(performance.now() - startTime);

      // Extract pipeline trace from response header
      let trace: any[] | undefined;
      try {
        const traceHeader = response.headers.get("x-layr-pipeline-trace");
        if (traceHeader) trace = JSON.parse(traceHeader);
      } catch { /* ignore */ }

      setTestResult({ status: response.status, data, time, trace });
    } catch (err) {
      setTestError((err as Error).message);
    } finally {
      setIsTesting(false);
    }
  };

  const getSampleValue = (type: string): any => {
    switch (type) {
      case "string": return "test";
      case "number": return 0;
      case "boolean": return false;
      case "array": return [];
      case "object": return {};
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Endpoint header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-card/50">
        <div className="flex items-center gap-3 mb-3">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${methodColors.bg} ${methodColors.text} border ${methodColors.border}`}
          >
            {endpoint.method}
          </span>
          <span className="text-sm font-mono text-foreground">
            {endpoint.path || "/"}
          </span>
          {!endpoint.isEnabled && (
            <span className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
              Disabled
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Globe className="w-3 h-3" />
          <span className="font-mono">
            /api/backend{endpoint.path.startsWith("/") ? endpoint.path : `/${endpoint.path}`}
          </span>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex-shrink-0 flex border-b border-border bg-card/30">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onTabChange(section.id)}
            className={`flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors relative ${
              activeSection === section.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {section.label}
            {activeSection === section.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />
            )}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div className={`flex-1 ${
        activeSection === "logic" 
          ? "flex flex-col overflow-hidden" 
          : "overflow-y-auto p-6 space-y-6"
      }`}>
        {/* ── General ──────────────────────────────────────── */}
        {activeSection === "general" && (
          <>
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Endpoint Name
              </label>
              <input
                type="text"
                value={endpoint.name}
                onChange={(e) => onChange({ name: e.target.value })}
                placeholder="e.g. Get All Products"
                className="w-full px-3 py-2 bg-muted/30 border border-border rounded-md text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 placeholder:text-muted-foreground/40"
              />
            </div>

            {/* Method + Path */}
            <div className="grid grid-cols-[auto,1fr] gap-2">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Method
                </label>
                <select
                  value={endpoint.method}
                  onChange={(e) =>
                    onChange({ method: e.target.value as HttpMethod })
                  }
                  className="px-3 py-2 bg-muted/30 border border-border rounded-md text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/40 appearance-none cursor-pointer font-mono font-semibold"
                  style={{ minWidth: 100 }}
                >
                  {HTTP_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Path
                </label>
                <div className={`flex items-center bg-muted/30 border rounded-md focus-within:ring-1 focus-within:ring-primary/40 focus-within:border-primary/50 ${isDuplicatePath ? "border-amber-500/50" : "border-border"}`}>
                  <span className="px-3 py-2 text-xs text-muted-foreground/60 font-mono border-r border-border">
                    /api/backend
                  </span>
                  <input
                    type="text"
                    value={endpoint.path}
                    onChange={(e) => {
                      let path = e.target.value;
                      // Ensure path starts with /
                      if (path && !path.startsWith("/")) path = "/" + path;
                      onChange({ path });
                    }}
                    placeholder="/products"
                    className="flex-1 px-3 py-2 bg-transparent text-sm text-foreground outline-none font-mono placeholder:text-muted-foreground/40"
                  />
                </div>
                {isDuplicatePath && (
                  <p className="text-[10px] text-amber-400 mt-1 flex items-center gap-1">
                    ⚠ Another {endpoint.method} endpoint uses this path
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Description
              </label>
              <textarea
                value={endpoint.description || ""}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder="What does this endpoint do?"
                rows={3}
                className="w-full px-3 py-2 bg-muted/30 border border-border rounded-md text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 resize-none placeholder:text-muted-foreground/40"
              />
            </div>

            {/* Status Code */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Response Status Code
              </label>
              <input
                type="number"
                value={endpoint.statusCode ?? 200}
                onChange={(e) =>
                  onChange({ statusCode: parseInt(e.target.value) || 200 })
                }
                className="w-24 px-3 py-2 bg-muted/30 border border-border rounded-md text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/40 font-mono"
              />
            </div>

            {/* Data Source (Phase 2 indicator) */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Data Source
              </label>
              <div className="flex items-center gap-3">
                <button
                  className={`px-4 py-2 text-xs font-medium rounded-md border transition-colors ${
                    endpoint.dataSource === "mock"
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/50"
                  }`}
                  onClick={() => onChange({ dataSource: "mock" })}
                >
                  Mock Data
                </button>
                <button
                  disabled
                  className="px-4 py-2 text-xs font-medium rounded-md border bg-muted/20 text-muted-foreground/40 border-border cursor-not-allowed"
                  title="Coming soon — connect to Firestore collections"
                >
                  Firestore (Coming Soon)
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Request ──────────────────────────────────────── */}
        {activeSection === "request" && (
          <>
            {/* Query Parameters */}
            <div>
              <PayloadFieldEditor
                fields={endpoint.queryParams || []}
                onChange={(fields) => onChange({ queryParams: fields })}
                label="Query Parameters"
              />
            </div>

            {/* Request Body (only for POST/PUT/PATCH) */}
            {hasBody ? (
              <div className="pt-4 border-t border-border">
                <PayloadFieldEditor
                  fields={endpoint.requestBody || []}
                  onChange={(fields) => onChange({ requestBody: fields })}
                  label="Request Body"
                />
              </div>
            ) : (
              <div className="pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground/50 italic text-center py-4">
                  {endpoint.method} requests don&apos;t have a request body.
                  <br />
                  Switch to POST, PUT, or PATCH to define a body schema.
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Logic ──────────────────────────────────────────── */}
        {activeSection === "logic" && (
          <div className="flex-1 min-h-0">
            <NodePipelineEditor endpoint={endpoint} onChange={onChange} dbSchema={dbSchema} />
          </div>
        )}

        {/* ── Response ─────────────────────────────────────── */}
        {activeSection === "response" && (
          <>
            {/* Response Schema */}
            <div>
              <PayloadFieldEditor
                fields={endpoint.responseSchema || []}
                onChange={(fields) => onChange({ responseSchema: fields })}
                label="Response Schema"
              />
            </div>

            {/* Mock Data Editor */}
            <div className="pt-4 border-t border-border">
              <MockDataEditor
                value={endpoint.mockResponse}
                onChange={(value) => onChange({ mockResponse: value })}
                responseSchema={endpoint.responseSchema}
              />
            </div>
          </>
        )}

        {/* ── Test ─────────────────────────────────────────── */}
        {activeSection === "test" && (
          <>
            {/* Header + Send Button */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Test Endpoint
                </h4>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  Send a request to{" "}
                  <span className="font-mono text-primary/70">
                    /api/backend{endpoint.path}
                  </span>
                  {endpoint.usePipeline && (
                    <span className="ml-2 text-[9px] px-1.5 py-0.5 bg-primary/15 text-primary rounded-full font-medium">
                      Pipeline
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={handleTest}
                disabled={isTesting || !projectId}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTesting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                {isTesting ? "Sending..." : "Send Request"}
              </button>
            </div>

            {/* Query Params */}
            {(endpoint.queryParams && endpoint.queryParams.length > 0 || endpoint.method === "GET") && (
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Query String
                </label>
                <input
                  type="text"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  placeholder="key=value&key2=value2"
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-md text-xs text-foreground outline-none focus:ring-1 focus:ring-primary/40 font-mono placeholder:text-muted-foreground/30"
                />
              </div>
            )}

            {/* Request Body Editor */}
            {hasBody && (
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Request Body (JSON)
                </label>
                <textarea
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 bg-[#0d1117] text-emerald-300/80 text-xs font-mono rounded-md border border-border outline-none focus:ring-1 focus:ring-primary/40 resize-none leading-relaxed"
                  placeholder='{\n  "email": "user@example.com",\n  "password": "secret123"\n}'
                  spellCheck={false}
                />
              </div>
            )}

            {/* Test result */}
            {testResult && (
              <div className="space-y-3 p-4 bg-muted/20 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {testResult.status >= 200 && testResult.status < 300 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span
                      className={`text-sm font-mono font-semibold ${
                        testResult.status >= 200 && testResult.status < 300
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {testResult.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {testResult.time}ms
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        JSON.stringify(testResult.data, null, 2)
                      )
                    }
                    className="flex items-center gap-1 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>

                <pre className="bg-[#0d1117] text-emerald-300 text-xs font-mono p-4 rounded-lg overflow-auto max-h-[300px] leading-relaxed border border-border">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>

                {/* Pipeline Trace */}
                {testResult.trace && testResult.trace.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Pipeline Trace
                    </p>
                    <div className="space-y-1">
                      {testResult.trace.map((entry: any, i: number) => (
                        <div
                          key={i}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-[10px] font-mono ${
                            entry.status === "ok"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : entry.status === "fail"
                                ? "bg-red-500/10 text-red-400"
                                : "bg-muted/30 text-muted-foreground/50"
                          }`}
                        >
                          <span className="w-3 text-center">
                            {entry.status === "ok" ? "✓" : entry.status === "fail" ? "✗" : "–"}
                          </span>
                          <span className="font-semibold">{entry.stepLabel}</span>
                          <span className="text-muted-foreground/40 ml-auto">
                            {entry.durationMs}ms
                          </span>
                          {entry.detail && (
                            <span className="text-muted-foreground/40 max-w-[200px] truncate" title={entry.detail}>
                              {entry.detail}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {testError && (
              <div className="flex items-start gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-red-400">
                    Request Failed
                  </p>
                  <p className="text-xs text-red-400/70 mt-1">{testError}</p>
                </div>
              </div>
            )}

            {!testResult && !testError && !isTesting && (
              <div className="text-center py-8 text-muted-foreground/40">
                <Send className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-xs">
                  {hasBody
                    ? "Edit the request body above, then click \"Send Request\""
                    : "Click \"Send Request\" to test this endpoint"}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
