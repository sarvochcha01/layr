"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  BackgroundVariant,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Connection,
  type NodeTypes,
  type XYPosition,
} from "@xyflow/react";
import {
  ApiEndpoint,
  PipelineStep,
  PipelineStepType,
  STEP_TYPE_META,
  DbCollection,
  PipelineEdge,
} from "@/types/backend";
import { generateId } from "@/lib/utils";
import { StepNode, RequestNode, type StepNodeData, type RequestNodeData } from "./nodes/StepNode";
import "./nodes/nodeStyles.css";
import {
  ShieldCheck, GitBranch, Variable, Send, Search, DatabaseZap,
  RefreshCw, Trash2, Lock, ShieldOff, Type, Hash, ToggleLeft,
  Braces, TableProperties, UserPlus, LogIn, LogOut, User,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────

const NODE_TYPES: NodeTypes = { stepNode: StepNode, requestNode: RequestNode };
const REQUEST_NODE_ID = "__request__";
const NODE_X_GAP = 300;
const NODE_Y_START = 50;

// ── Palette ───────────────────────────────────────────────────────────

interface PaletteSection {
  label: string;
  items: { type: PipelineStepType; label: string; icon: React.ReactNode }[];
}

const STEP_PALETTE: PaletteSection[] = [
  {
    label: "Logic",
    items: [
      { type: "validate",      label: "Validate",    icon: <ShieldCheck className="w-3.5 h-3.5" /> },
      { type: "condition",     label: "Condition",   icon: <GitBranch className="w-3.5 h-3.5" /> },
      { type: "set-variable",  label: "Set Variable",icon: <Variable className="w-3.5 h-3.5" /> },
      { type: "respond",       label: "Respond",     icon: <Send className="w-3.5 h-3.5" /> },
    ],
  },
  {
    label: "Database",
    items: [
      { type: "collection",    label: "Collection",  icon: <TableProperties className="w-3.5 h-3.5" /> },
      { type: "db-query",      label: "DB Query",    icon: <Search className="w-3.5 h-3.5" /> },
      { type: "db-insert",     label: "DB Insert",   icon: <DatabaseZap className="w-3.5 h-3.5" /> },
      { type: "db-update",     label: "DB Update",   icon: <RefreshCw className="w-3.5 h-3.5" /> },
      { type: "db-delete",     label: "DB Delete",   icon: <Trash2 className="w-3.5 h-3.5" /> },
    ],
  },
  {
    label: "Security",
    items: [
      { type: "hash",          label: "Hash",        icon: <Lock className="w-3.5 h-3.5" /> },
      { type: "hash-compare",  label: "Compare Hash",icon: <ShieldOff className="w-3.5 h-3.5" /> },
    ],
  },
  {
    label: "Firebase",
    items: [
      { type: "firebase-signup",   label: "Firebase Signup",  icon: <UserPlus className="w-3.5 h-3.5" /> },
      { type: "firebase-login",    label: "Firebase Login",   icon: <LogIn className="w-3.5 h-3.5" /> },
      { type: "firebase-signout",  label: "Firebase Signout", icon: <LogOut className="w-3.5 h-3.5" /> },
      { type: "firebase-get-user", label: "Get User",         icon: <User className="w-3.5 h-3.5" /> },
    ],
  },
  {
    label: "Data",
    items: [
      { type: "string-literal",  label: "String",  icon: <Type className="w-3.5 h-3.5" /> },
      { type: "number-literal",  label: "Number",  icon: <Hash className="w-3.5 h-3.5" /> },
      { type: "boolean-literal", label: "Boolean", icon: <ToggleLeft className="w-3.5 h-3.5" /> },
      { type: "json-literal",    label: "JSON",    icon: <Braces className="w-3.5 h-3.5" /> },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────

function resolveConnectedCollections(
  pipeline: PipelineStep[],
  edges: PipelineEdge[],
): Record<string, string> {
  const result: Record<string, string> = {};
  const COLLECTION_HANDLES = new Set(["i-collection","q-collection","u-collection","d-collection"]);
  const stepMap = new Map(pipeline.map((s) => [s.id, s]));
  for (const edge of edges) {
    if (!edge.targetHandle || !COLLECTION_HANDLES.has(edge.targetHandle)) continue;
    const src = stepMap.get(edge.source);
    if (!src || src.type !== "collection") continue;
    const name = src.collectionConfig?.collectionName;
    if (name) result[edge.target] = name;
  }
  return result;
}

function buildNodes(
  pipeline: PipelineStep[],
  endpoint: ApiEndpoint,
  onStepChange: (stepId: string, updates: Partial<PipelineStep>) => void,
  dbSchema: DbCollection[],
  connectedCollections: Record<string, string>,
): Node[] {
  const bodyFields = (endpoint.requestBody || []).map((f) => f.name).filter(Boolean);
  const queryFields = (endpoint.queryParams || []).map((f) => f.name).filter(Boolean);

  const nodes: Node[] = [
    {
      id: REQUEST_NODE_ID,
      type: "requestNode",
      position: { x: 0, y: NODE_Y_START },
      data: { bodyFields, queryFields } satisfies RequestNodeData,
      draggable: true,
      selectable: false,
    },
  ];

  pipeline.forEach((step, idx) => {
    nodes.push({
      id: step.id,
      type: "stepNode",
      position: step.position || { x: (idx + 1) * NODE_X_GAP, y: NODE_Y_START },
      data: {
        step,
        isSelected: false,
        onSelect: () => {},
        onStepChange,
        dbSchema,
        connectedCollectionName: connectedCollections[step.id],
      } satisfies StepNodeData,
      draggable: true,
    });
  });

  return nodes;
}

/** Handle IDs that are exec-flow pins */
const EXEC_HANDLES = new Set([
  "exec-in", "exec-out", "exec-pass", "exec-fail",
  "exec-true", "exec-false", "exec-match", "exec-mismatch",
]);

function isExecEdge(sourceHandle?: string, targetHandle?: string): boolean {
  return EXEC_HANDLES.has(sourceHandle || "") || EXEC_HANDLES.has(targetHandle || "");
}

function buildEdges(saved?: PipelineEdge[]): Edge[] {
  return (saved || []).map((e) => {
    const exec = e.kind === "exec" || isExecEdge(e.sourceHandle, e.targetHandle);
    return {
      id: e.id,
      source: e.source,
      sourceHandle: e.sourceHandle,
      target: e.target,
      targetHandle: e.targetHandle,
      type: "smoothstep",
      style: exec
        ? { stroke: "#e2e8f0", strokeWidth: 3 }
        : { stroke: "#6b7280", strokeWidth: 2 },
      className: exec ? "exec-wire" : "data-wire",
      data: { kind: exec ? "exec" : "data" },
    };
  });
}

function edgesToPipelineEdges(edges: Edge[]): PipelineEdge[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.source,
    sourceHandle: e.sourceHandle || "",
    target: e.target,
    targetHandle: e.targetHandle || "",
    kind: (e.data?.kind === "exec" || isExecEdge(e.sourceHandle || "", e.targetHandle || ""))
      ? "exec" as const
      : "data" as const,
  }));
}

// ── Component ─────────────────────────────────────────────────────────

interface NodePipelineEditorProps {
  endpoint: ApiEndpoint;
  onChange: (updates: Partial<ApiEndpoint>) => void;
  dbSchema?: DbCollection[];
}

const EMPTY_PIPELINE: PipelineStep[] = [];

function NodePipelineEditorInner({ endpoint, onChange, dbSchema = [] }: NodePipelineEditorProps) {
  const pipeline = endpoint.pipeline ?? EMPTY_PIPELINE;

  // ── Step change handler (stable ref pattern to avoid node rebuild on every change) ──
  const onStepChangeRef = useRef<(id: string, u: Partial<PipelineStep>) => void>(() => {});
  useEffect(() => {
    onStepChangeRef.current = (stepId: string, updates: Partial<PipelineStep>) => {
      const updated = pipeline.map((s) => (s.id === stepId ? { ...s, ...updates } : s));
      onChange({ pipeline: updated });
    };
  });
  const stableOnStepChange = useCallback(
    (stepId: string, updates: Partial<PipelineStep>) => onStepChangeRef.current(stepId, updates),
    []
  );

  // ── Edges ──────────────────────────────────────────────────────────
  const [edges, setEdges] = useState<Edge[]>(() => buildEdges(endpoint.nodeEdges));

  // ── Collection resolution ──────────────────────────────────────────
  const connectedCollections = useMemo(
    () => resolveConnectedCollections(pipeline, edgesToPipelineEdges(edges)),
    [pipeline, edges],
  );

  // ── Nodes (local state — lets ReactFlow handle selection/drag internally) ──
  const [nodes, setNodes] = useState<Node[]>(() =>
    buildNodes(pipeline, endpoint, stableOnStepChange, dbSchema, connectedCollections)
  );

  // Rebuild nodes when pipeline/schema changes from outside
  // Preserve current selection state so clicking doesn't feel glitchy
  const pipelineRef = useRef(pipeline);
  const dbSchemaRef = useRef(dbSchema);
  const connectedCollectionsRef = useRef(connectedCollections);
  const endpointRef = useRef(endpoint);
  endpointRef.current = endpoint;
  useEffect(() => {
    const pipelineChanged = pipeline !== pipelineRef.current;
    const schemaChanged = dbSchema !== dbSchemaRef.current;
    // Deep compare connectedCollections since useMemo always returns a new object ref
    const collectionsChanged = JSON.stringify(connectedCollections) !== JSON.stringify(connectedCollectionsRef.current);

    pipelineRef.current = pipeline;
    dbSchemaRef.current = dbSchema;
    connectedCollectionsRef.current = connectedCollections;

    if (pipelineChanged || schemaChanged || collectionsChanged) {
      setNodes((curr) => {
        const selectedIds = new Set(curr.filter((n) => n.selected).map((n) => n.id));
        return buildNodes(pipeline, endpointRef.current, stableOnStepChange, dbSchema, connectedCollections)
          .map((n) => ({ ...n, selected: selectedIds.has(n.id) }));
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipeline, stableOnStepChange, dbSchema, connectedCollections]);

  // ── Context menu state ─────────────────────────────────────────────
  const [contextMenu, setContextMenu] = useState<{
    screenX: number;
    screenY: number;
    flowPosition: XYPosition;
  } | null>(null);
  const [menuSearch, setMenuSearch] = useState("");
  const reactFlowRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [rfInstance, setRfInstance] = useState<any>(null);

  // Focus search input when context menu opens
  useEffect(() => {
    if (contextMenu) {
      setMenuSearch("");
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [contextMenu]);

  // ── Selected IDs for Delete key ───────────────────────────────────
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<Set<string>>(new Set());

  // ── Node change handler ────────────────────────────────────────────
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      // 1. Apply ALL changes to local nodes state (selection, position, etc.)
      setNodes((nds) => applyNodeChanges(changes, nds));

      // 2. Track selected node IDs for Delete key
      const selectChanges = changes.filter((c) => c.type === "select");
      if (selectChanges.length > 0) {
        setSelectedNodeIds((prev) => {
          const next = new Set(prev);
          selectChanges.forEach((c) => {
            if (c.type === "select" && c.id !== REQUEST_NODE_ID) {
              if (c.selected) next.add(c.id);
              else next.delete(c.id);
            }
          });
          return next;
        });
      }

      // 3. Remove — delete from pipeline
      const removeIds = changes
        .filter((c): c is Extract<typeof c, { type: "remove" }> => c.type === "remove" && (c as any).id !== REQUEST_NODE_ID)
        .map((c) => c.id);
      if (removeIds.length > 0) {
        const idSet = new Set(removeIds);
        const updatedPipeline = pipeline.filter((s) => !idSet.has(s.id));
        const updatedEdges = edges.filter((e) => !idSet.has(e.source) && !idSet.has(e.target));
        setEdges(updatedEdges);
        onChange({ pipeline: updatedPipeline, nodeEdges: edgesToPipelineEdges(updatedEdges) });
        return;
      }

      // 4. Position — save to pipeline (only on drag end, i.e. dragging=false)
      const positionChanges = changes.filter(
        (c): c is Extract<typeof c, { type: "position" }> =>
          c.type === "position" && !!(c as any).position && (c as any).id !== REQUEST_NODE_ID && !(c as any).dragging
      );
      if (positionChanges.length > 0) {
        const updated = pipeline.map((step) => {
          const ch = positionChanges.find((c) => c.id === step.id);
          return ch ? { ...step, position: (ch as any).position } : step;
        });
        onChange({ pipeline: updated });
      }
    },
    [pipeline, edges, onChange]
  );

  // ── Edge change handler ────────────────────────────────────────────
  const pendingEdgeSave = useRef<Edge[] | null>(null);
  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    // Track selected edge IDs
    const selectChanges = changes.filter((c) => c.type === "select");
    if (selectChanges.length > 0) {
      setSelectedEdgeIds((prev) => {
        const next = new Set(prev);
        selectChanges.forEach((c) => {
          if (c.type === "select") {
            if (c.selected) next.add(c.id);
            else next.delete(c.id);
          }
        });
        return next;
      });
    }
    setEdges((eds) => {
      const updated = applyEdgeChanges(changes, eds);
      // Only save non-selection changes (removal etc.) — not every hover
      const hasStructural = changes.some((c) => c.type === "remove" || c.type === "add");
      if (hasStructural) pendingEdgeSave.current = updated;
      return updated;
    });
  }, []);

  // Persist edge saves deferred (avoid setState during render)
  useEffect(() => {
    if (pendingEdgeSave.current !== null) {
      onChange({ nodeEdges: edgesToPipelineEdges(pendingEdgeSave.current) });
      pendingEdgeSave.current = null;
    }
  });

  // ── Connect handler ────────────────────────────────────────────────
  const onConnect: OnConnect = useCallback((connection: Connection) => {
    setEdges((eds) => {
      const exec = isExecEdge(connection.sourceHandle || "", connection.targetHandle || "");
      const newEdge: Edge = {
        ...connection,
        id: `e-${generateId()}`,
        type: "smoothstep",
        style: exec
          ? { stroke: "#e2e8f0", strokeWidth: 3 }
          : { stroke: "#6b7280", strokeWidth: 2 },
        className: exec ? "exec-wire" : "data-wire",
        data: { kind: exec ? "exec" : "data" },
      };
      const updated = addEdge(newEdge, eds);
      // Persist immediately
      pendingEdgeSave.current = updated;
      return updated;
    });
  }, []);

  // ── Delete selected ────────────────────────────────────────────────
  const deleteSelected = useCallback(() => {
    if (selectedNodeIds.size === 0 && selectedEdgeIds.size === 0) return;

    const updatedPipeline = pipeline.filter((s) => !selectedNodeIds.has(s.id));
    const updatedEdges = edges.filter(
      (e) => !selectedNodeIds.has(e.source) && !selectedNodeIds.has(e.target) && !selectedEdgeIds.has(e.id)
    );
    setNodes((nds) => nds.filter((n) => !selectedNodeIds.has(n.id)));
    setEdges(updatedEdges);
    setSelectedNodeIds(new Set());
    setSelectedEdgeIds(new Set());
    onChange({ pipeline: updatedPipeline, nodeEdges: edgesToPipelineEdges(updatedEdges) });
  }, [selectedNodeIds, selectedEdgeIds, pipeline, edges, onChange]);

  // ── Context menu ───────────────────────────────────────────────────
  const openContextMenuAt = useCallback((clientX: number, clientY: number) => {
    if (!rfInstance) return;
    const flowPosition = rfInstance.screenToFlowPosition({ x: clientX, y: clientY });
    setContextMenu({ screenX: clientX, screenY: clientY, flowPosition });
  }, [rfInstance]);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const onPaneContextMenu = useCallback((e: React.MouseEvent | MouseEvent) => {
    e.preventDefault();
    openContextMenuAt(e.clientX, e.clientY);
  }, [openContextMenuAt]);

  const onConnectEnd = useCallback((event: MouseEvent | TouchEvent) => {
    const target = event.target as HTMLElement;
    if (
      target?.classList?.contains("react-flow__handle") ||
      target?.closest?.(".react-flow__node")
    ) return;
    const clientX = "changedTouches" in event ? event.changedTouches[0].clientX : event.clientX;
    const clientY = "changedTouches" in event ? event.changedTouches[0].clientY : event.clientY;
    openContextMenuAt(clientX, clientY);
  }, [openContextMenuAt]);

  const addStepAtPosition = useCallback((type: PipelineStepType, position: XYPosition) => {
    const meta = STEP_TYPE_META[type];
    const newStep: PipelineStep = {
      id: generateId(), type, label: meta?.label || type, isEnabled: true, position,
    };
    switch (type) {
      case "validate":       newStep.validateConfig      = { rules: [], failStatus: 400 }; break;
      case "condition":      newStep.conditionConfig     = { field: "", operator: "exists", onFail: "skip" }; break;
      case "set-variable":   newStep.setVariableConfig   = { name: "", source: "", transform: "none" }; break;
      case "respond":        newStep.respondConfig       = { status: 200, bodyMode: "static", staticBody: { message: "OK" } }; break;
      case "collection":     newStep.collectionConfig    = { collectionName: "" }; break;
      case "db-query":       newStep.dbQueryConfig       = { collection: "", filters: [], resultVariable: "result", limit: 20 }; break;
      case "db-insert":      newStep.dbInsertConfig      = { collection: "", fieldMapping: {}, resultVariable: "newId" }; break;
      case "db-update":      newStep.dbUpdateConfig      = { collection: "", documentId: "", fieldMapping: {} }; break;
      case "db-delete":      newStep.dbDeleteConfig      = { collection: "", documentId: "" }; break;
      case "hash":           newStep.hashConfig          = { input: "", resultVariable: "hashed" }; break;
      case "hash-compare":   newStep.hashCompareConfig   = { onFail: "respond", failStatus: 401, failBody: { error: "Invalid credentials" } }; break;
      case "firebase-signup":  newStep.firebaseSignupConfig  = { resultVariable: "newUser" }; break;
      case "firebase-login":   newStep.firebaseLoginConfig   = { resultVariable: "loggedInUser" }; break;
      case "firebase-signout":  newStep.firebaseSignoutConfig  = {}; break;
      case "firebase-get-user": newStep.firebaseGetUserConfig = { resultVariable: "currentUser" }; break;
      case "string-literal": newStep.stringLiteralConfig = { value: "" }; break;
      case "number-literal": newStep.numberLiteralConfig = { value: 0 }; break;
      case "boolean-literal":newStep.booleanLiteralConfig= { value: false }; break;
      case "json-literal":   newStep.jsonLiteralConfig   = { value: "{}" }; break;
    }
    onChange({ pipeline: [...pipeline, newStep], usePipeline: true });
    closeContextMenu();
  }, [pipeline, onChange, closeContextMenu]);

  // ── Window keyboard handler ────────────────────────────────────────
  const deleteSelectedRef = useRef(deleteSelected);
  deleteSelectedRef.current = deleteSelected;
  const openContextMenuAtRef = useRef(openContextMenuAt);
  openContextMenuAtRef.current = openContextMenuAt;
  const contextMenuOpenRef = useRef(false);
  contextMenuOpenRef.current = !!contextMenu;

  // Track last mouse position so Space opens menu at cursor, not canvas center
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT";
      if (e.key === "Escape") { setContextMenu(null); return; }
      if ((e.key === "Delete" || e.key === "Backspace") && !isInput) {
        e.preventDefault();
        deleteSelectedRef.current();
        return;
      }
      if (e.key === " " && !contextMenuOpenRef.current && !isInput) {
        e.preventDefault();
        openContextMenuAtRef.current(lastMousePos.current.x, lastMousePos.current.y);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);

  // ── Filtered palette ───────────────────────────────────────────────
  const filteredPalette = useMemo(() => {
    const q = menuSearch.toLowerCase().trim();
    if (!q) return STEP_PALETTE;
    return STEP_PALETTE
      .map((s) => ({ ...s, items: s.items.filter((i) => i.label.toLowerCase().includes(q)) }))
      .filter((s) => s.items.length > 0);
  }, [menuSearch]);

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="flex h-full">
      <div className="flex-1 relative" ref={reactFlowRef}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectEnd={onConnectEnd}
          onPaneContextMenu={onPaneContextMenu}
          onPaneClick={closeContextMenu}
          onInit={setRfInstance}
          nodeTypes={NODE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          className="pipeline-graph"
          deleteKeyCode={null}
          snapToGrid
          snapGrid={[15, 15]}
          defaultEdgeOptions={{
            type: "smoothstep",
            style: { stroke: "#6b7280", strokeWidth: 2 },
          }}
          connectionLineStyle={{ stroke: "#818cf8", strokeWidth: 2.5 }}
          selectionOnDrag={false}
          multiSelectionKeyCode="Shift"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(n) => n.id === REQUEST_NODE_ID ? "#818cf8" : "#555"}
            maskColor="rgba(0,0,0,0.15)"
          />
        </ReactFlow>



      </div>

      {/* Add-node context menu — portaled to body to escape all stacking contexts */}
      {contextMenu && typeof document !== "undefined" && createPortal(
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 9998 }}
            onClick={closeContextMenu}
            onContextMenu={(e) => { e.preventDefault(); closeContextMenu(); }}
          />
          <div
            className="node-context-menu"
            style={{ position: "fixed", left: contextMenu.screenX, top: contextMenu.screenY, zIndex: 9999 }}
          >
            <div className="node-context-menu-search-wrap">
              <input
                ref={searchInputRef}
                type="text"
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Escape") closeContextMenu();
                  if (e.key === "Enter" && filteredPalette[0]?.items[0]) {
                    addStepAtPosition(filteredPalette[0].items[0].type, contextMenu.flowPosition);
                  }
                }}
                placeholder="Search nodes..."
                className="node-context-menu-search"
                autoComplete="off"
              />
            </div>
            <div className="node-context-menu-header">Add Node</div>
            <div style={{ maxHeight: 280, overflowY: "auto" }}>
              {filteredPalette.length === 0 ? (
                <div style={{ padding: "12px", fontSize: 10, color: "rgba(156,163,175,0.5)", textAlign: "center" }}>
                  No nodes match "{menuSearch}"
                </div>
              ) : filteredPalette.map((section) => (
                <div key={section.label}>
                  <div className="node-context-menu-section">{section.label}</div>
                  {section.items.map((item) => (
                    <button
                      key={item.type}
                      className="node-context-menu-item"
                      onClick={() => addStepAtPosition(item.type, contextMenu.flowPosition)}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

export function NodePipelineEditor(props: NodePipelineEditorProps) {
  return (
    <ReactFlowProvider key={props.endpoint.id}>
      <NodePipelineEditorInner {...props} />
    </ReactFlowProvider>
  );
}
