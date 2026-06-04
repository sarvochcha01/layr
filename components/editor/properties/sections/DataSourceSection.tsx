"use client";

import React, { useState, useEffect } from "react";
import { ApiEndpoint, METHOD_COLORS } from "@/types/backend";
import {
  Database,
  ChevronDown,
  X,
  ArrowRight,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Unlink,
  Link2,
} from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { COMPONENT_SCHEMAS } from "../registry";

export interface DataSourceBinding {
  /** The endpoint ID from apiEndpoints */
  endpointId: string;
  /** Map of: componentPropKey → responsePath (dot-notation) */
  fieldMappings: Record<string, string>;
  /** Auto-fetch on mount? */
  autoFetch: boolean;
}

interface DataSourceSectionProps {
  props: Record<string, any>;
  updateProp: (key: string, value: any) => void;
  apiEndpoints: ApiEndpoint[];
  projectId: string | null;
  componentType: string;
}

/** 
 * Get bindable content props from the COMPONENT_SCHEMAS registry.
 * Only returns text/textarea/link-editor type fields — these are the
 * actual content props that make sense to populate from backend data.
 * Excludes style/layout fields like size, weight, alignment, variant, theme, etc.
 */
function getBindableProps(componentType: string): { key: string; label: string }[] {
  const schema = COMPONENT_SCHEMAS[componentType];
  if (!schema) return [];

  const bindable: { key: string; label: string }[] = [];
  
  // Keys to always exclude — these are style/config, not content
  const excludeKeys = new Set([
    "themeStyle", "variant", "size", "weight", "align", "alignment",
    "tag", "objectFit", "rounded", "loading", "fullWidth", "disabled",
    "external", "sticky", "shadow", "display", "flexDirection", "flexWrap",
    "justifyContent", "alignItems", "gap", "maxWidth", "padding", "margin",
    "responsive", "equalHeight", "columns", "gapCustom", "showScrollIndicator",
    "ctaExternal",
  ]);

  for (const section of schema.sections) {
    for (const field of section.fields) {
      // Only include text/textarea/link-editor fields (actual content)
      if (
        (field.type === "text" || field.type === "textarea" || field.type === "link-editor") &&
        !excludeKeys.has(field.key)
      ) {
        bindable.push({ key: field.key, label: field.label });
      }
    }
  }

  return bindable;
}

/**
 * Extract available response fields from an endpoint's mockResponse
 * as dot-notation paths (e.g., "name", "items[0].title", "[0].name")
 */
function extractResponsePaths(data: any, prefix = ""): string[] {
  if (data === null || data === undefined) return [];

  const paths: string[] = [];

  if (Array.isArray(data)) {
    // Handle array at any level (including root)
    if (data.length > 0) {
      const arrayPath = prefix ? `${prefix}[0]` : "[0]";
      
      if (typeof data[0] === "object" && data[0] !== null) {
        // Recursively extract paths from first array item
        paths.push(...extractResponsePaths(data[0], arrayPath));
      } else {
        // Primitive array item
        paths.push(arrayPath);
      }
    }
  } else if (typeof data === "object") {
    // Handle object
    for (const [key, value] of Object.entries(data)) {
      const path = prefix ? `${prefix}.${key}` : key;
      
      if (value !== null && typeof value === "object") {
        // Recursively handle nested objects/arrays
        paths.push(...extractResponsePaths(value, path));
      } else {
        // Leaf value (string, number, boolean, null)
        paths.push(path);
      }
    }
  }

  return paths;
}

export function DataSourceSection({
  props,
  updateProp,
  apiEndpoints,
  projectId,
  componentType,
}: DataSourceSectionProps) {
  const dataSource: DataSourceBinding | undefined = props.dataSource;
  const [previewData, setPreviewData] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [manualInputMode, setManualInputMode] = useState<Record<string, boolean>>({});

  const selectedEndpoint = dataSource
    ? apiEndpoints.find((ep) => ep.id === dataSource.endpointId)
    : null;

  const bindableProps = getBindableProps(componentType);
  
  // Use mockResponse if available, otherwise use previewData (for Firebase/pipeline endpoints)
  const dataForPaths = selectedEndpoint?.mockResponse || previewData;
  const responsePaths = dataForPaths ? extractResponsePaths(dataForPaths) : [];

  // Filter to leaf-level paths (no parent objects that have children)
  // For arrays, we want to show [0].field paths, not just [0]
  const leafPaths = responsePaths.filter((path) => {
    // Check if any other path starts with this path followed by . or [
    return !responsePaths.some(
      (other) => other !== path && (
        other.startsWith(path + ".") || 
        other.startsWith(path + "[")
      )
    );
  });

  const handleSelectEndpoint = (endpointId: string) => {
    updateProp("dataSource", {
      endpointId,
      fieldMappings: {},
      autoFetch: true,
    } as DataSourceBinding);
  };

  // Auto-fetch preview data when endpoint is selected and has no mockResponse
  useEffect(() => {
    if (selectedEndpoint && !selectedEndpoint.mockResponse && !previewData && !isFetching && projectId) {
      // Automatically fetch to discover fields
      handleFetchPreview();
    }
  }, [selectedEndpoint?.id, projectId]);

  const handleRemoveBinding = () => {
    updateProp("dataSource", undefined);
    setPreviewData(null);
    setFetchError(null);
  };

  const handleSetMapping = (propKey: string, responsePath: string) => {
    if (!dataSource) return;
    const newMappings = { ...dataSource.fieldMappings };
    if (responsePath) {
      newMappings[propKey] = responsePath;
    } else {
      delete newMappings[propKey];
    }
    updateProp("dataSource", { ...dataSource, fieldMappings: newMappings });
  };

  const handleFetchPreview = async () => {
    if (!selectedEndpoint || !projectId) return;

    setIsFetching(true);
    setFetchError(null);

    try {
      const url = `/api/backend${selectedEndpoint.path.startsWith("/") ? selectedEndpoint.path : `/${selectedEndpoint.path}`}`;
      const response = await fetch(url, {
        method: selectedEndpoint.method,
        headers: {
          "Content-Type": "application/json",
          "x-project-id": projectId,
        },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setPreviewData(data);
    } catch (err) {
      setFetchError((err as Error).message);
    } finally {
      setIsFetching(false);
    }
  };

  const handleApplyData = () => {
    if (!previewData || !dataSource) return;

    // Apply mapped fields to component props
    for (const [propKey, responsePath] of Object.entries(dataSource.fieldMappings)) {
      const value = getNestedValue(previewData, responsePath);
      if (value !== undefined) {
        updateProp(propKey, typeof value === "object" ? JSON.stringify(value) : String(value));
      }
    }
  };

  // If no endpoints exist, show a message
  if (apiEndpoints.length === 0) {
    return (
      <AccordionItem
        value="data-source"
        className="border-b-0 border-t border-border/50"
      >
        <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-muted-foreground" />
            Data Source
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <div className="text-xs text-muted-foreground/60 text-center py-4 border border-dashed border-border rounded-md">
            <Database className="w-6 h-6 mx-auto mb-2 opacity-30" />
            <p>No backend endpoints defined.</p>
            <p className="mt-1">
              Open the{" "}
              <span className="text-violet-400 font-medium">
                Backend Editor
              </span>{" "}
              to create endpoints.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <AccordionItem
      value="data-source"
      className="border-b-0 border-t border-border/50"
    >
      <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-violet-400" />
          <span>Data Source</span>
          {dataSource && selectedEndpoint && (
            <span className="text-[9px] bg-violet-500/15 text-violet-400 px-1.5 py-0.5 rounded-full font-normal normal-case">
              Bound
            </span>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
        {/* ── Endpoint Selector ─────────────────────────── */}
        {!dataSource ? (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Connect to Endpoint
            </Label>
            <div className="space-y-1">
              {apiEndpoints
                .filter((ep) => ep.isEnabled)
                .map((ep) => {
                  const colors = METHOD_COLORS[ep.method];
                  return (
                    <button
                      key={ep.id}
                      onClick={() => handleSelectEndpoint(ep.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md border border-border hover:bg-muted/60 hover:border-primary/30 transition-colors text-left"
                    >
                      <span
                        className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} border ${colors.border}`}
                      >
                        {ep.method}
                      </span>
                      <span className="text-xs font-mono text-foreground truncate flex-1">
                        {ep.path}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50 truncate max-w-[80px]">
                        {ep.name}
                      </span>
                    </button>
                  );
                })}
            </div>
            {apiEndpoints.filter((ep) => ep.isEnabled).length === 0 && (
              <p className="text-[10px] text-muted-foreground/50 text-center py-2">
                All endpoints are disabled. Enable them in the Backend Editor.
              </p>
            )}
          </div>
        ) : selectedEndpoint ? (
          <>
            {/* ── Selected Endpoint ──────────────────────── */}
            <div className="flex items-center justify-between p-2.5 bg-violet-500/5 border border-violet-500/20 rounded-lg">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`flex-shrink-0 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${METHOD_COLORS[selectedEndpoint.method].bg} ${METHOD_COLORS[selectedEndpoint.method].text} border ${METHOD_COLORS[selectedEndpoint.method].border}`}
                >
                  {selectedEndpoint.method}
                </span>
                <span className="text-xs font-mono text-foreground truncate">
                  {selectedEndpoint.path}
                </span>
              </div>
              <button
                onClick={handleRemoveBinding}
                className="flex-shrink-0 p-1 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                title="Disconnect endpoint"
              >
                <Unlink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* ── Field Mappings ─────────────────────────── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground">
                  Field Mappings
                </Label>
                <span className="text-[10px] text-muted-foreground/40">
                  {Object.keys(dataSource.fieldMappings).length} mapped
                </span>
              </div>

              {/* Array response helper */}
              {leafPaths.length > 0 && leafPaths[0].startsWith("[0]") && (
                <div className="text-[10px] text-amber-400/70 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1.5 flex items-start gap-1.5">
                  <span className="flex-shrink-0 mt-0.5">💡</span>
                  <span>
                    Array response detected. Mapping to <code className="text-amber-300">[0]</code> will use the first item.
                  </span>
                </div>
              )}

              {/* Firebase/Pipeline mode helper */}
              {selectedEndpoint && !selectedEndpoint.mockResponse && leafPaths.length === 0 && !isFetching && (
                <div className="text-[10px] text-blue-400/70 bg-blue-500/10 border border-blue-500/20 rounded px-2 py-1.5 flex items-start gap-1.5">
                  <span className="flex-shrink-0 mt-0.5">ℹ️</span>
                  <span>
                    No mock response defined. Click <strong>Fetch Preview</strong> below to discover available fields from your Firebase data.
                  </span>
                </div>
              )}

              {bindableProps.length === 0 ? (
                <p className="text-[10px] text-muted-foreground/50 italic py-2">
                  No bindable properties found for this component type.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {bindableProps.map(({ key, label }) => {
                    const currentMapping = dataSource.fieldMappings[key];
                    return (
                      <div
                        key={key}
                        className="flex items-center gap-1.5 group"
                      >
                        {/* Component prop */}
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-[10px] font-mono px-2 py-1.5 rounded border truncate ${
                              currentMapping
                                ? "bg-violet-500/10 border-violet-500/20 text-violet-300"
                                : "bg-muted/30 border-border text-muted-foreground/70"
                            }`}
                          >
                            {label}
                          </div>
                        </div>

                        {/* Arrow */}
                        <ArrowRight
                          className={`w-3 h-3 flex-shrink-0 ${
                            currentMapping
                              ? "text-violet-400"
                              : "text-muted-foreground/30"
                          }`}
                        />

                        {/* Response field selector */}
                        <div className="flex-1 min-w-0 relative">
                          {manualInputMode[key] ? (
                            <input
                              type="text"
                              value={currentMapping || ""}
                              onChange={(e) => handleSetMapping(key, e.target.value)}
                              placeholder="e.g., [0].name"
                              className={`w-full text-[10px] font-mono px-2 py-1.5 rounded border outline-none ${
                                currentMapping
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                                  : "bg-muted/30 border-border text-muted-foreground/50"
                              }`}
                            />
                          ) : (
                            <select
                              value={currentMapping || ""}
                              onChange={(e) =>
                                handleSetMapping(key, e.target.value)
                              }
                              className={`w-full text-[10px] font-mono px-2 py-1.5 rounded border outline-none appearance-none cursor-pointer truncate ${
                                currentMapping
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                                  : "bg-muted/30 border-border text-muted-foreground/50"
                              }`}
                            >
                              <option value="">— none —</option>
                              {leafPaths.map((path) => (
                                <option key={path} value={path}>
                                  {path}
                                </option>
                              ))}
                              {leafPaths.length === 0 && (
                                <option value="" disabled>
                                  Click "Fetch Preview" to discover fields
                                </option>
                              )}
                            </select>
                          )}
                        </div>

                        {/* Toggle manual input */}
                        <button
                          onClick={() => setManualInputMode(prev => ({ ...prev, [key]: !prev[key] }))}
                          className="p-0.5 text-muted-foreground/40 hover:text-blue-400 transition-all"
                          title={manualInputMode[key] ? "Switch to dropdown" : "Type custom path"}
                        >
                          {manualInputMode[key] ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <span className="text-[10px] font-mono">✏️</span>
                          )}
                        </button>

                        {/* Clear mapping */}
                        {currentMapping && (
                          <button
                            onClick={() => handleSetMapping(key, "")}
                            className="p-0.5 text-muted-foreground/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Actions ────────────────────────────────── */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-[10px] gap-1.5"
                onClick={handleFetchPreview}
                disabled={isFetching}
              >
                {isFetching ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                {isFetching ? "Fetching..." : "Fetch Preview"}
              </Button>

              {previewData &&
                Object.keys(dataSource.fieldMappings).length > 0 && (
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 h-7 text-[10px] gap-1.5 bg-violet-600 hover:bg-violet-700"
                    onClick={handleApplyData}
                  >
                    <Link2 className="w-3 h-3" />
                    Apply Data
                  </Button>
                )}
            </div>

            {/* ── Preview result ──────────────────────────── */}
            {previewData && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-medium">
                    Data fetched successfully
                  </span>
                </div>
                <pre className="bg-[#0d1117] text-emerald-300/70 text-[10px] font-mono p-3 rounded-md overflow-auto max-h-[150px] leading-relaxed border border-border">
                  {JSON.stringify(previewData, null, 2)}
                </pre>
              </div>
            )}

            {fetchError && (
              <div className="flex items-start gap-1.5 p-2 bg-red-500/10 border border-red-500/20 rounded text-[10px]">
                <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-red-400">{fetchError}</span>
              </div>
            )}
          </>
        ) : (
          // Endpoint was deleted
          <div className="text-xs text-muted-foreground/50 text-center py-3">
            <AlertCircle className="w-5 h-5 mx-auto mb-2 text-amber-400/50" />
            <p>The connected endpoint no longer exists.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 h-7 text-[10px]"
              onClick={handleRemoveBinding}
            >
              Remove Binding
            </Button>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

/** Access a nested value using dot-notation path (e.g., "items[0].name") */
function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;

  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }

  return current;
}
