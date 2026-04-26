"use client";

import React, { useState } from "react";
import {
  ApiEndpoint,
  BackendAction,
  METHOD_COLORS,
  ACTION_TRIGGERS,
  PAYLOAD_SOURCES,
  SUCCESS_ACTIONS,
  ActionTrigger,
  PayloadSource,
  ActionOnSuccess,
} from "@/types/backend";
import { Page } from "@/types/editor";
import {
  Database,
  X,
  ArrowRight,
  Unlink,
  Send,
  Plus,
  Clock,
  MousePointerClick,
  Upload,
  Zap,
  AlertCircle,
  Trash2,
} from "lucide-react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { generateId } from "@/lib/utils";

interface BackendActionSectionProps {
  props: Record<string, any>;
  updateProp: (key: string, value: any) => void;
  apiEndpoints: ApiEndpoint[];
  projectId: string | null;
  componentType: string;
  pages?: Page[];
}

const TRIGGER_ICONS: Record<string, React.ReactNode> = {
  submit: <Upload className="w-3 h-3" />,
  click: <MousePointerClick className="w-3 h-3" />,
  interval: <Clock className="w-3 h-3" />,
  mount: <Zap className="w-3 h-3" />,
};

/**
 * Get available request body fields from an endpoint's requestBody schema.
 */
function getEndpointBodyFields(endpoint: ApiEndpoint): string[] {
  const fields: string[] = [];
  for (const field of endpoint.requestBody || []) {
    if (field.name) fields.push(field.name);
  }
  for (const field of endpoint.queryParams || []) {
    if (field.name) fields.push(field.name);
  }
  return fields;
}

export function BackendActionSection({
  props,
  updateProp,
  apiEndpoints,
  projectId,
  componentType,
  pages = [],
}: BackendActionSectionProps) {
  const backendAction: BackendAction | undefined = props.backendAction;
  const [showStaticEditor, setShowStaticEditor] = useState(false);
  const [staticJson, setStaticJson] = useState(
    backendAction?.staticPayload
      ? JSON.stringify(backendAction.staticPayload, null, 2)
      : "{}"
  );

  // Only show POST/PUT/PATCH/DELETE endpoints for actions
  const writeEndpoints = apiEndpoints.filter(
    (ep) => ep.isEnabled && ep.method !== "GET"
  );

  const selectedEndpoint = backendAction
    ? apiEndpoints.find((ep) => ep.id === backendAction.endpointId)
    : null;

  const bodyFields = selectedEndpoint
    ? getEndpointBodyFields(selectedEndpoint)
    : [];

  const handleCreateAction = (endpointId: string) => {
    const endpoint = apiEndpoints.find((ep) => ep.id === endpointId);
    if (!endpoint) return;

    // For forms, auto-map fields that match by name
    const autoMapping: Record<string, string> = {};
    if (componentType === "Form" && props.fields) {
      const formFieldIds = (props.fields as { id: string }[]).map((f) => f.id);
      const endpointBodyFieldNames = [
        ...(endpoint.requestBody || []).map((f) => f.name),
        ...(endpoint.queryParams || []).map((f) => f.name),
      ];
      // Auto-map any matching names
      for (const fieldId of formFieldIds) {
        if (endpointBodyFieldNames.includes(fieldId)) {
          autoMapping[fieldId] = fieldId;
        }
      }
    }

    updateProp("backendAction", {
      id: generateId(),
      endpointId,
      endpointPath: endpoint.path,
      endpointMethod: endpoint.method,
      trigger: componentType === "Form" ? "submit" : "click",
      payloadSource: componentType === "Form" ? "form" : "static",
      payloadMapping: autoMapping,
      staticPayload: {},
      onSuccess: componentType === "Form" ? "reset" : "toast",
      successMessage: "Success!",
    } as BackendAction);
  };

  const handleRemoveAction = () => {
    updateProp("backendAction", undefined);
  };

  const handleUpdate = (updates: Partial<BackendAction>) => {
    if (!backendAction) return;
    updateProp("backendAction", { ...backendAction, ...updates });
  };

  const handleSetMapping = (sourceKey: string, targetKey: string) => {
    if (!backendAction) return;
    const newMapping = { ...backendAction.payloadMapping };
    if (targetKey) {
      newMapping[sourceKey] = targetKey;
    } else {
      delete newMapping[sourceKey];
    }
    handleUpdate({ payloadMapping: newMapping });
  };

  const handleSaveStaticPayload = () => {
    try {
      const parsed = JSON.parse(staticJson);
      handleUpdate({ staticPayload: parsed });
      setShowStaticEditor(false);
    } catch {
      // Invalid JSON — don't save
    }
  };

  // No write endpoints available
  if (writeEndpoints.length === 0 && !backendAction) {
    return (
      <AccordionItem
        value="backend-action"
        className="border-b-0 border-t border-border/50"
      >
        <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-muted-foreground" />
            Backend Action
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <div className="text-xs text-muted-foreground/60 text-center py-4 border border-dashed border-border rounded-md">
            <Send className="w-6 h-6 mx-auto mb-2 opacity-30" />
            <p>No POST/PUT/PATCH/DELETE endpoints.</p>
            <p className="mt-1">
              Create write endpoints in the{" "}
              <span className="text-blue-400 font-medium">Backend Editor</span>.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <AccordionItem
      value="backend-action"
      className="border-b-0 border-t border-border/50"
    >
      <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-blue-400" />
          <span>Backend Action</span>
          {backendAction && selectedEndpoint && (
            <span className="text-[9px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded-full font-normal normal-case">
              Active
            </span>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
        {/* ── Endpoint Selector ──────────────────────────── */}
        {!backendAction ? (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Send Data To
            </Label>
            <div className="space-y-1">
              {writeEndpoints.map((ep) => {
                const colors = METHOD_COLORS[ep.method];
                return (
                  <button
                    key={ep.id}
                    onClick={() => handleCreateAction(ep.id)}
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
          </div>
        ) : selectedEndpoint ? (
          <>
            {/* ── Selected Endpoint ──────────────────────── */}
            <div className="flex items-center justify-between p-2.5 bg-blue-500/5 border border-blue-500/20 rounded-lg">
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
                onClick={handleRemoveAction}
                className="flex-shrink-0 p-1 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                title="Remove action"
              >
                <Unlink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* ── Trigger ────────────────────────────────── */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Trigger
              </Label>
              <div className="grid grid-cols-2 gap-1.5">
                {ACTION_TRIGGERS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() =>
                      handleUpdate({ trigger: t.value as ActionTrigger })
                    }
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-md border text-[10px] font-medium transition-colors ${
                      backendAction.trigger === t.value
                        ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                        : "bg-muted/30 border-border text-muted-foreground/70 hover:bg-muted/50"
                    }`}
                  >
                    {TRIGGER_ICONS[t.value]}
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Interval config */}
              {backendAction.trigger === "interval" && (
                <div className="flex items-center gap-2 mt-2">
                  <Label className="text-[10px] text-muted-foreground/60 whitespace-nowrap">
                    Every
                  </Label>
                  <input
                    type="number"
                    value={backendAction.intervalMs || 5000}
                    onChange={(e) =>
                      handleUpdate({
                        intervalMs: Math.max(1000, parseInt(e.target.value) || 5000),
                      })
                    }
                    className="w-20 px-2 py-1 text-[10px] bg-muted/30 border border-border rounded outline-none focus:ring-1 focus:ring-blue-500/40 font-mono text-foreground"
                    min={1000}
                    step={1000}
                  />
                  <span className="text-[10px] text-muted-foreground/60">
                    ms
                  </span>
                </div>
              )}
            </div>

            {/* ── Payload Source ──────────────────────────── */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Payload
              </Label>
              <div className="space-y-1">
                {PAYLOAD_SOURCES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() =>
                      handleUpdate({
                        payloadSource: s.value as PayloadSource,
                      })
                    }
                    className={`w-full flex items-start gap-2 px-2.5 py-2 rounded-md border text-left transition-colors ${
                      backendAction.payloadSource === s.value
                        ? "bg-blue-500/10 border-blue-500/20"
                        : "bg-muted/30 border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="min-w-0">
                      <div
                        className={`text-[10px] font-medium ${
                          backendAction.payloadSource === s.value
                            ? "text-blue-400"
                            : "text-muted-foreground/70"
                        }`}
                      >
                        {s.label}
                      </div>
                      <div className="text-[9px] text-muted-foreground/40 mt-0.5">
                        {s.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Static Payload Editor ───────────────────── */}
            {backendAction.payloadSource === "static" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Static Payload (JSON)
                </Label>
                <textarea
                  value={staticJson}
                  onChange={(e) => setStaticJson(e.target.value)}
                  className="w-full h-24 px-3 py-2 bg-[#0d1117] text-emerald-300/70 text-[10px] font-mono rounded-md border border-border outline-none focus:ring-1 focus:ring-blue-500/40 resize-none leading-relaxed"
                  placeholder='{ "key": "value" }'
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px]"
                  onClick={handleSaveStaticPayload}
                >
                  Save Payload
                </Button>
              </div>
            )}

            {/* ── Field Mapping (for form/props) ─────────── */}
            {backendAction.payloadSource !== "static" &&
              bodyFields.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Field Mapping
                    </Label>
                    <span className="text-[10px] text-muted-foreground/40">
                      {Object.keys(backendAction.payloadMapping).length} mapped
                    </span>
                  </div>
                  <p className="text-[9px] text-muted-foreground/40">
                    {backendAction.payloadSource === "form"
                      ? "Map form fields → endpoint body fields"
                      : "Map component props → endpoint body fields"}
                  </p>
                  <div className="space-y-1.5">
                    {bodyFields.map((targetField) => {
                      // Find if any source key maps to this target
                      const sourceKey = Object.entries(
                        backendAction.payloadMapping
                      ).find(([, v]) => v === targetField)?.[0];

                      // Get available source fields
                      const formFields: { id: string; label: string }[] =
                        backendAction.payloadSource === "form" && props.fields
                          ? (props.fields as { id: string; label: string }[]).map((f) => ({
                              id: f.id,
                              label: f.label || f.id,
                            }))
                          : [];

                      return (
                        <div
                          key={targetField}
                          className="flex items-center gap-1.5 group"
                        >
                          {/* Source field — dropdown for forms, text for props */}
                          <div className="flex-1 min-w-0">
                            {backendAction.payloadSource === "form" && formFields.length > 0 ? (
                              <select
                                value={sourceKey || ""}
                                onChange={(e) => {
                                  const newMapping = {
                                    ...backendAction.payloadMapping,
                                  };
                                  for (const [k, v] of Object.entries(newMapping)) {
                                    if (v === targetField) delete newMapping[k];
                                  }
                                  if (e.target.value) {
                                    newMapping[e.target.value] = targetField;
                                  }
                                  handleUpdate({ payloadMapping: newMapping });
                                }}
                                className={`w-full text-[10px] font-mono px-2 py-1.5 rounded border outline-none appearance-none cursor-pointer ${
                                  sourceKey
                                    ? "bg-blue-500/10 border-blue-500/20 text-blue-300"
                                    : "bg-muted/30 border-border text-muted-foreground/50"
                                }`}
                              >
                                <option value="">— select field —</option>
                                {formFields.map((f) => (
                                  <option key={f.id} value={f.id}>
                                    {f.label} ({f.id})
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={sourceKey || ""}
                                onChange={(e) => {
                                  const newMapping = {
                                    ...backendAction.payloadMapping,
                                  };
                                  for (const [k, v] of Object.entries(newMapping)) {
                                    if (v === targetField) delete newMapping[k];
                                  }
                                  if (e.target.value) {
                                    newMapping[e.target.value] = targetField;
                                  }
                                  handleUpdate({ payloadMapping: newMapping });
                                }}
                                placeholder="prop name"
                                className={`w-full text-[10px] font-mono px-2 py-1.5 rounded border outline-none ${
                                  sourceKey
                                    ? "bg-blue-500/10 border-blue-500/20 text-blue-300"
                                    : "bg-muted/30 border-border text-muted-foreground/50 placeholder:text-muted-foreground/30"
                                }`}
                              />
                            )}
                          </div>

                          <ArrowRight
                            className={`w-3 h-3 flex-shrink-0 ${
                              sourceKey
                                ? "text-blue-400"
                                : "text-muted-foreground/30"
                            }`}
                          />

                          {/* Target field (from endpoint schema) */}
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-[10px] font-mono px-2 py-1.5 rounded border truncate ${
                                sourceKey
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                                  : "bg-muted/30 border-border text-muted-foreground/50"
                              }`}
                            >
                              {targetField}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* ── Success Behavior ────────────────────────── */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                On Success
              </Label>
              <div className="grid grid-cols-2 gap-1">
                {SUCCESS_ACTIONS.map((a) => (
                  <button
                    key={a.value}
                    onClick={() =>
                      handleUpdate({
                        onSuccess: a.value as ActionOnSuccess,
                      })
                    }
                    className={`px-2.5 py-1.5 rounded-md border text-[10px] font-medium transition-colors ${
                      backendAction.onSuccess === a.value
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-muted/30 border-border text-muted-foreground/70 hover:bg-muted/50"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>

              {/* Toast message */}
              {backendAction.onSuccess === "toast" && (
                <input
                  type="text"
                  value={backendAction.successMessage || ""}
                  onChange={(e) =>
                    handleUpdate({ successMessage: e.target.value })
                  }
                  placeholder="Success message..."
                  className="w-full px-2.5 py-1.5 text-[10px] bg-muted/30 border border-border rounded-md outline-none focus:ring-1 focus:ring-emerald-500/40 text-foreground placeholder:text-muted-foreground/30"
                />
              )}

              {/* Redirect — page dropdown */}
              {backendAction.onSuccess === "redirect" && (
                <select
                  value={backendAction.redirectUrl || ""}
                  onChange={(e) =>
                    handleUpdate({ redirectUrl: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 text-[10px] bg-muted/30 border border-border rounded-md outline-none focus:ring-1 focus:ring-emerald-500/40 text-foreground appearance-none cursor-pointer"
                >
                  <option value="">— select page —</option>
                  {pages.map((page) => (
                    <option key={page.id} value={`/${page.slug}`}>
                      {page.name} (/{page.slug})
                    </option>
                  ))}
                </select>
              )}
            </div>
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
              onClick={handleRemoveAction}
            >
              Remove Action
            </Button>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
