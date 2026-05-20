"use client";

import { useState, useEffect, useCallback } from "react";
import { ApiEndpoint, DbCollection } from "@/types/backend";
import type { UserFirebaseConfig } from "@/types/editor";
import { EndpointList } from "./EndpointList";
import { EndpointEditor } from "./EndpointEditor";
import { FirestoreExplorer } from "./FirestoreExplorer";
import { FirebaseConfigEditor } from "./FirebaseConfigEditor";
import { generateId } from "@/lib/utils";
import { ENDPOINT_TEMPLATES } from "@/lib/endpoint-templates";
import {
  ArrowLeft,
  Save,
  Database,
  Loader2,
  Zap,
  Layers,
  BookTemplate,
  Flame,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface BackendEditorLayoutProps {
  endpoints: ApiEndpoint[];
  onEndpointsChange: (endpoints: ApiEndpoint[]) => void;
  dbSchema: DbCollection[];
  onDbSchemaChange: (schema: DbCollection[]) => void;
  firebaseConfig?: UserFirebaseConfig;
  onFirebaseConfigChange?: (config: UserFirebaseConfig | undefined) => void;
  projectId: string | null;
  projectName: string;
  onSave?: () => void;
  isSaving?: boolean;
}

type ViewMode = "endpoints" | "schema" | "firebase";

export function BackendEditorLayout({
  endpoints,
  onEndpointsChange,
  dbSchema,
  onDbSchemaChange,
  firebaseConfig,
  onFirebaseConfigChange,
  projectId,
  projectName,
  onSave,
  isSaving = false,
}: BackendEditorLayoutProps) {
  const router = useRouter();
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(
    endpoints.length > 0 ? endpoints[0].id : null
  );
  // Track which tab is active in the endpoint editor (lifted state)
  const [activeTab, setActiveTab] = useState<string>("general");

  const [viewMode, setViewMode] = useState<ViewMode>("endpoints");
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  const selectedEndpoint = endpoints.find((e) => e.id === selectedEndpointId);

  const handleCreate = useCallback(() => {
    const now = new Date().toISOString();

    // Auto-increment path to avoid duplicates
    let basePath = "/new-endpoint";
    let baseName = "New Endpoint";
    let suffix = 1;
    const existingPaths = new Set(endpoints.map((e) => e.path));
    while (existingPaths.has(basePath)) {
      suffix++;
      basePath = `/new-endpoint-${suffix}`;
      baseName = `New Endpoint ${suffix}`;
    }

    const newEndpoint: ApiEndpoint = {
      id: generateId(),
      name: baseName,
      path: basePath,
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
    };

    onEndpointsChange([...endpoints, newEndpoint]);
    setSelectedEndpointId(newEndpoint.id);
    setActiveTab("general");
  }, [endpoints, onEndpointsChange]);

  const handleApplyTemplate = useCallback((templateId: string) => {
    const template = ENDPOINT_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    const newEndpoints = template.create();

    // Check for duplicate paths and skip those
    const existingPaths = new Set(endpoints.map((e) => `${e.method}:${e.path}`));
    const uniqueNew = newEndpoints.filter(
      (ep) => !existingPaths.has(`${ep.method}:${ep.path}`)
    );

    if (uniqueNew.length === 0) {
      return; // All endpoints already exist
    }

    // Also create a schema entry for "users" if the auth template is used
    if (template.category === "auth" && dbSchema.length === 0) {
      onDbSchemaChange([
        ...dbSchema,
        {
          id: generateId(),
          name: "users",
          description: "User accounts",
          fields: [
            { id: generateId(), name: "email", type: "string", required: true, unique: true },
            { id: generateId(), name: "password", type: "string", required: true },
          ],
        },
      ]);
    }

    // Create ecommerce collection schemas
    if (template.category === "ecommerce") {
      const existingNames = new Set(dbSchema.map((c) => c.name));
      const newCollections: DbCollection[] = [];

      if (!existingNames.has("products")) {
        newCollections.push({
          id: generateId(),
          name: "products",
          description: "Product catalog",
          fields: [
            { id: generateId(), name: "name", type: "string", required: true },
            { id: generateId(), name: "price", type: "number", required: true },
            { id: generateId(), name: "description", type: "string", required: false },
            { id: generateId(), name: "image", type: "string", required: false },
            { id: generateId(), name: "category", type: "string", required: false },
          ],
        });
      }
      if (!existingNames.has("carts")) {
        newCollections.push({
          id: generateId(),
          name: "carts",
          description: "User shopping carts",
          fields: [
            { id: generateId(), name: "userId", type: "string", required: true },
            { id: generateId(), name: "productId", type: "string", required: true },
            { id: generateId(), name: "name", type: "string", required: false },
            { id: generateId(), name: "price", type: "number", required: false },
            { id: generateId(), name: "quantity", type: "number", required: false },
            { id: generateId(), name: "image", type: "string", required: false },
          ],
        });
      }
      if (!existingNames.has("orders")) {
        newCollections.push({
          id: generateId(),
          name: "orders",
          description: "Customer orders",
          fields: [
            { id: generateId(), name: "userId", type: "string", required: true },
            { id: generateId(), name: "items", type: "array", required: true },
            { id: generateId(), name: "total", type: "number", required: true },
            { id: generateId(), name: "shippingAddress", type: "object", required: false },
            { id: generateId(), name: "status", type: "string", required: false },
          ],
        });
      }

      if (newCollections.length > 0) {
        onDbSchemaChange([...dbSchema, ...newCollections]);
      }
    }

    onEndpointsChange([...endpoints, ...uniqueNew]);
    setSelectedEndpointId(uniqueNew[0].id);
    setActiveTab("logic");
    setShowTemplatePicker(false);
  }, [endpoints, onEndpointsChange, dbSchema, onDbSchemaChange]);

  const handleDelete = (id: string) => {
    const updated = endpoints.filter((e) => e.id !== id);
    onEndpointsChange(updated);
    if (selectedEndpointId === id) {
      setSelectedEndpointId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleToggleEnabled = (id: string) => {
    onEndpointsChange(
      endpoints.map((e) =>
        e.id === id ? { ...e, isEnabled: !e.isEnabled } : e
      )
    );
  };

  const handleUpdateEndpoint = (updates: Partial<ApiEndpoint>) => {
    if (!selectedEndpointId) return;
    onEndpointsChange(
      endpoints.map((e) =>
        e.id === selectedEndpointId
          ? { ...e, ...updates, updatedAt: new Date().toISOString() }
          : e
      )
    );
  };

  const handleAddField = useCallback(() => {
    if (!selectedEndpointId) return;
    const endpoint = endpoints.find((e) => e.id === selectedEndpointId);
    if (!endpoint) return;

    const newField: import("@/types/backend").PayloadField = {
      id: generateId(),
      name: "",
      type: "string",
      description: "",
      required: false,
      children: [],
    };

    if (activeTab === "request") {
      // Add to query params (always available)
      const updated = [...(endpoint.queryParams || []), newField];
      handleUpdateEndpoint({ queryParams: updated });
    } else if (activeTab === "response") {
      // Add to response schema
      const updated = [...(endpoint.responseSchema || []), newField];
      handleUpdateEndpoint({ responseSchema: updated });
    }
  }, [selectedEndpointId, activeTab, endpoints]);

  // ── Keyboard Shortcuts ──────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input/textarea/select
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        // Only handle Esc in inputs
        if (e.key === "Escape") {
          (target as HTMLInputElement).blur();
        }
        return;
      }

      // Ctrl+N — Create new endpoint OR add field
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        if (!selectedEndpointId) {
          // No endpoint open → create new endpoint
          handleCreate();
        } else if (activeTab === "request" || activeTab === "response") {
          // Request/Response tab → add field
          handleAddField();
        }
        // General/Test → do nothing
        return;
      }

      // Ctrl+S — Save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        onSave?.();
        return;
      }

      // Escape — deselect endpoint
      if (e.key === "Escape") {
        if (selectedEndpointId) {
          setSelectedEndpointId(null);
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedEndpointId, activeTab, handleCreate, handleAddField, onSave]);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* ── Header Bar ──────────────────────────────────────────────── */}
      <div className="flex-shrink-0 h-14 bg-card border-b border-border flex items-center px-4 justify-between z-50">
        <div className="flex items-center space-x-4">
          {/* Back to frontend editor */}
          <button
            onClick={() =>
              router.push(
                projectId ? `/editor?projectId=${projectId}` : "/editor"
              )
            }
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Frontend Editor
          </button>

          <div className="w-px h-6 bg-border" />

          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold tracking-wide">
              Backend Editor
            </span>
          </div>

          {projectName && (
            <>
              <div className="w-px h-4 bg-border" />
              <span className="text-xs text-muted-foreground/60">
                {projectName}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Shortcut hints */}
          <div className="hidden md:flex items-center gap-2 text-[10px] text-muted-foreground/40">
            <kbd className="px-1.5 py-0.5 bg-muted/50 border border-border rounded text-[9px]">Ctrl+N</kbd>
            <span>New</span>
            <span className="mx-1">•</span>
            <kbd className="px-1.5 py-0.5 bg-muted/50 border border-border rounded text-[9px]">Esc</kbd>
            <span>Close</span>
            <span className="mx-1">•</span>
            <kbd className="px-1.5 py-0.5 bg-muted/50 border border-border rounded text-[9px]">Ctrl+S</kbd>
            <span>Save</span>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-muted/50 rounded-md p-0.5">
            <button
              onClick={() => setViewMode("endpoints")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === "endpoints"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground/60 hover:text-foreground"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Endpoints
              <span className="text-[9px] text-muted-foreground/50">{endpoints.length}</span>
            </button>
            <button
              onClick={() => setViewMode("schema")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === "schema"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground/60 hover:text-foreground"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Schema
              <span className="text-[9px] text-muted-foreground/50">{dbSchema.length}</span>
            </button>
            <button
              onClick={() => setViewMode("firebase")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === "firebase"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground/60 hover:text-foreground"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Firebase
              {firebaseConfig && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
            </button>
          </div>

          {/* Templates */}
          <div className="relative">
            <button
              onClick={() => setShowTemplatePicker(!showTemplatePicker)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
            >
              <BookTemplate className="w-3.5 h-3.5" />
              Templates
            </button>

            {showTemplatePicker && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowTemplatePicker(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-xl shadow-2xl border border-border z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border bg-muted/30">
                    <h4 className="text-xs font-semibold text-foreground">Endpoint Templates</h4>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      Pre-built, working pipelines — added to your project instantly.
                    </p>
                  </div>
                  <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
                    {ENDPOINT_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleApplyTemplate(template.id)}
                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-base mt-0.5">{template.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                              {template.name}
                            </div>
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5 leading-relaxed">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Save */}
          <button
            onClick={onSave}
            disabled={isSaving}
            className={`px-4 py-2 rounded-md text-xs font-medium transition-colors flex items-center gap-2 ${
              isSaving
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────── */}
      {viewMode === "firebase" ? (
        /* Firebase Config Editor */
        <div className="flex flex-1 overflow-hidden min-h-0">
          <FirebaseConfigEditor
            config={firebaseConfig}
            onChange={onFirebaseConfigChange}
          />
        </div>
      ) : viewMode === "schema" ? (
        /* Unified Firestore Database Explorer */
        <div className="flex flex-1 overflow-hidden min-h-0">
          <FirestoreExplorer
            projectId={projectId}
            dbSchema={dbSchema}
            onDbSchemaChange={onDbSchemaChange}
          />
        </div>
      ) : (
        /* Endpoints Mode — list + editor */
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Left Panel — Endpoint List */}
          <div
            className="bg-card border-r border-border flex-shrink-0 flex flex-col"
            style={{ width: 300 }}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("[data-endpoint-item]")) return;
              if ((e.target as HTMLElement).closest("button")) return;
              if ((e.target as HTMLElement).closest("input")) return;

              setSelectedEndpointId(null);
            }}
          >
            {/* Endpoints section */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <EndpointList
                endpoints={endpoints}
                selectedEndpointId={selectedEndpointId}
                onSelect={setSelectedEndpointId}
                onCreate={handleCreate}
                onDelete={handleDelete}
                onToggleEnabled={handleToggleEnabled}
              />
            </div>
          </div>

          {/* Right Panel — Endpoint Editor */}
          <div className="flex-1 min-w-0 overflow-hidden">
            {selectedEndpoint ? (
              <EndpointEditor
                endpoint={selectedEndpoint}
                onChange={handleUpdateEndpoint}
                projectId={projectId}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                allEndpoints={endpoints}
                dbSchema={dbSchema}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-xs">
                  <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground/20" />
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    No Endpoint Selected
                  </h3>
                  <p className="text-xs text-muted-foreground/60 mb-4">
                    Select an endpoint from the list or press{" "}
                    <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[10px] font-mono">
                      Ctrl+N
                    </kbd>{" "}
                    to create a new one.
                  </p>
                  <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-xs font-semibold transition-colors"
                  >
                    Create Endpoint
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
