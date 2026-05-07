"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
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
  ShieldCheck,
  GitBranch,
  Variable,
  Send,
  Search,
  DatabaseZap,
  RefreshCw,
  Trash2,
  Lock,
  ShieldOff,
  Type,
  Hash,
  ToggleLeft,
  Braces,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────

const NODE_TYPES: NodeTypes = {
  stepNode: StepNode,
  requestNode: RequestNode,
};

const REQUEST_NODE_ID = "__request__";
const NODE_X_GAP = 300;
const NODE_Y_START = 50;

// ── Step type palette for context menu ────────────────────────────────
interface PaletteSection {
  label: string;
  items: { type: PipelineStepType; label: string; icon: React.ReactNode }[];
}

const STEP_PALETTE: PaletteSection[] = [
  {
    label: "Logic",
    items: [
      { type: "validate",       label: "Validate",      icon: <ShieldCheck className="w-3.5 h-3.5" /> },
      { type: "condition",      label: "Condition",      icon: <GitBranch className="w-3.5 h-3.5" /> },
      { type: "set-variable",   label: "Set Variable",   icon: <Variable className="w-3.5 h-3.5" /> },
      { type: "respond",        label: "Respond",        icon: <Send className="w-3.5 h-3.5" /> },
    ],
  },
  {
    label: "Database",
    items: [
      { type: "db-query",       label: "DB Query",       icon: <Search className="w-3.5 h-3.5" /> },
      { type: "db-insert",      label: "DB Insert",      icon: <DatabaseZap className="w-3.5 h-3.5" /> },
      { type: "db-update",      label: "DB Update",      icon: <RefreshCw className="w-3.5 h-3.5" /> },
      { type: "db-delete",      label: "DB Delete",      icon: <Trash2 className="w-3.5 h-3.5" /> },
    ],
  },
  {
    label: "Security",
    items: [
      { type: "hash",           label: "Hash",           icon: <Lock className="w-3.5 h-3.5" /> },
      { type: "hash-compare",   label: "Compare Hash",   icon: <ShieldOff className="w-3.5 h-3.5" /> },
    ],
  },
  {
    label: "Data",
    items: [
      { type: "string-literal",  label: "String",        icon: <Type className="w-3.5 h-3.5" /> },
      { type: "number-literal",  label: "Number",        icon: <Hash className="w-3.5 h-3.5" /> },
      { type: "boolean-literal", label: "Boolean",       icon: <ToggleLeft className="w-3.5 h-3.5" /> },
      { type: "json-literal",    label: "JSON",          icon: <Braces className="w-3.5 h-3.5" /> },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────

/** Build React Flow nodes from a pipeline + endpoint */
function buildNodes(
  pipeline: PipelineStep[],
  endpoint: ApiEndpoint,
  selectedStepId: string | null,
  onSelectStep: (id: string) => void,
  onStepChange: (stepId: string, updates: Partial<PipelineStep>) => void
): Node[] {
  const nodes: Node[] = [];

  // 1. Request entry node
  const bodyFields = (endpoint.requestBody || []).map((f) => f.name).filter(Boolean);
  const queryFields = (endpoint.queryParams || []).map((f) => f.name).filter(Boolean);

  nodes.push({
    id: REQUEST_NODE_ID,
    type: "requestNode",
    position: { x: 0, y: NODE_Y_START },
    data: {
      bodyFields,
      queryFields,
    } satisfies RequestNodeData,
    draggable: true,
    selectable: false,
  });

  // 2. Pipeline step nodes
  pipeline.forEach((step, idx) => {
    const position = step.position || {
      x: (idx + 1) * NODE_X_GAP,
      y: NODE_Y_START,
    };

    nodes.push({
      id: step.id,
      type: "stepNode",
      position,
      data: {
        step,
        isSelected: step.id === selectedStepId,
        onSelect: onSelectStep,
        onStepChange,
      } satisfies StepNodeData,
      draggable: true,
    });
  });

  return nodes;
}

/** Build edges from saved nodeEdges — data wires only */
function buildEdges(savedEdges?: PipelineEdge[]): Edge[] {
  if (savedEdges && savedEdges.length > 0) {
    return savedEdges.map((e) => ({
      id: e.id,
      source: e.source,
      sourceHandle: e.sourceHandle,
      target: e.target,
      targetHandle: e.targetHandle,
      type: "smoothstep",
      style: { stroke: "#9ca3af", strokeWidth: 2 },
      className: "data-wire",
    }));
  }
  return [];
}

/** Convert React Flow edges back to PipelineEdge[] for persistence */
function edgesToPipelineEdges(edges: Edge[]): PipelineEdge[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.source,
    sourceHandle: e.sourceHandle || "",
    target: e.target,
    targetHandle: e.targetHandle || "",
  }));
}

// ── Main Component ────────────────────────────────────────────────────

interface NodePipelineEditorProps {
  endpoint: ApiEndpoint;
  onChange: (updates: Partial<ApiEndpoint>) => void;
  dbSchema?: DbCollection[];
}

function NodePipelineEditorInner({ endpoint, onChange, dbSchema = [] }: NodePipelineEditorProps) {
  const pipeline = endpoint.pipeline || [];
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; flowPosition: XYPosition } | null>(null);
  const reactFlowRef = useRef<HTMLDivElement>(null);

  // Track the ReactFlow instance for coordinate conversion
  const [rfInstance, setRfInstance] = useState<any>(null);

  // ── Step config change handler ─────────────────────────────────────
  const handleStepChange = useCallback(
    (stepId: string, updates: Partial<PipelineStep>) => {
      const updatedPipeline = pipeline.map((s) =>
        s.id === stepId ? { ...s, ...updates } : s
      );
      onChange({ pipeline: updatedPipeline });
    },
    [pipeline, onChange]
  );

  // Build nodes
  const nodes = useMemo(
    () => buildNodes(pipeline, endpoint, null, () => {}, handleStepChange),
    [pipeline, endpoint, handleStepChange]
  );

  // Build edges
  const [edges, setEdges] = useState<Edge[]>(() =>
    buildEdges(endpoint.nodeEdges)
  );

  // Deferred edge persistence — avoid setState during render
  const pendingEdgeUpdate = useRef<Edge[] | null>(null);
  useEffect(() => {
    if (pendingEdgeUpdate.current !== null) {
      onChange({ nodeEdges: edgesToPipelineEdges(pendingEdgeUpdate.current) });
      pendingEdgeUpdate.current = null;
    }
  });

  // Rebuild edges when pipeline changes from outside (e.g. adding a step)
  const prevPipelineLengthRef = useRef(pipeline.length);
  useEffect(() => {
    if (pipeline.length !== prevPipelineLengthRef.current) {
      setEdges(buildEdges(endpoint.nodeEdges));
      prevPipelineLengthRef.current = pipeline.length;
    }
  }, [pipeline.length, endpoint.nodeEdges]);

  // ── Handlers ──────────────────────────────────────────────────────

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      // Apply position changes — save back to pipeline steps
      const positionChanges = changes.filter(
        (c): c is Extract<typeof c, { type: "position" }> =>
          c.type === "position" && "position" in c && !!c.position && c.id !== REQUEST_NODE_ID
      );

      if (positionChanges.length > 0) {
        const updatedPipeline = pipeline.map((step) => {
          const change = positionChanges.find((c) => c.id === step.id);
          if (change && change.position) {
            return { ...step, position: change.position };
          }
          return step;
        });
        onChange({ pipeline: updatedPipeline });
      }
    },
    [pipeline, onChange]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => {
        const updated = applyEdgeChanges(changes, eds);
        pendingEdgeUpdate.current = updated;
        return updated;
      });
    },
    []
  );

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => {
        const newEdge: Edge = {
          ...connection,
          id: `e-${generateId()}`,
          type: "smoothstep",
          style: { stroke: "#9ca3af", strokeWidth: 2 },
          className: "data-wire",
        };
        const updated = addEdge(newEdge, eds);
        pendingEdgeUpdate.current = updated;
        return updated;
      });
    },
    []
  );
  // ── Drop-on-canvas: show context menu when connection dropped on empty area

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      // Only trigger if the connection was NOT completed (dropped on canvas)
      const target = event.target as HTMLElement;
      // If dropped on a handle, React Flow will fire onConnect — skip
      if (target?.classList?.contains("react-flow__handle")) return;

      if (!rfInstance || !reactFlowRef.current) return;

      const bounds = reactFlowRef.current.getBoundingClientRect();
      const clientX = "changedTouches" in event ? event.changedTouches[0].clientX : event.clientX;
      const clientY = "changedTouches" in event ? event.changedTouches[0].clientY : event.clientY;

      // screenToFlowPosition expects screen coordinates, not element-relative
      const flowPosition = rfInstance.screenToFlowPosition({
        x: clientX,
        y: clientY,
      });

      setContextMenu({
        x: clientX - bounds.left,
        y: clientY - bounds.top,
        flowPosition,
      });
    },
    [rfInstance]
  );

  // ── Context menu (right-click to add nodes) ────────────────────────

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      event.preventDefault();
      if (!rfInstance) return;

      const bounds = reactFlowRef.current?.getBoundingClientRect();
      if (!bounds) return;

      const flowPosition = rfInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setContextMenu({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
        flowPosition,
      });
    },
    [rfInstance]
  );

  const addStepAtPosition = useCallback(
    (type: PipelineStepType, position: XYPosition) => {
      const meta = STEP_TYPE_META[type];
      const newStep: PipelineStep = {
        id: generateId(),
        type,
        label: meta?.label || type,
        isEnabled: true,
        position,
      };

      // Add default config based on type
      switch (type) {
        case "validate":
          newStep.validateConfig = { rules: [], failStatus: 400 };
          break;
        case "condition":
          newStep.conditionConfig = { field: "", operator: "exists", onFail: "skip" };
          break;
        case "set-variable":
          newStep.setVariableConfig = { name: "", source: "", transform: "none" };
          break;
        case "respond":
          newStep.respondConfig = { status: 200, bodyMode: "static", staticBody: { message: "OK" } };
          break;
        case "db-query":
          newStep.dbQueryConfig = { collection: "", filters: [], resultVariable: "result", limit: 20 };
          break;
        case "db-insert":
          newStep.dbInsertConfig = { collection: "", fieldMapping: {}, resultVariable: "newId" };
          break;
        case "db-update":
          newStep.dbUpdateConfig = { collection: "", documentId: "", fieldMapping: {} };
          break;
        case "db-delete":
          newStep.dbDeleteConfig = { collection: "", documentId: "" };
          break;
        case "hash":
          newStep.hashConfig = { input: "", resultVariable: "hashed" };
          break;
        case "hash-compare":
          newStep.hashCompareConfig = { onFail: "respond", failStatus: 401, failBody: { error: "Invalid credentials" } };
          break;
        case "string-literal":
          newStep.stringLiteralConfig = { value: "" };
          break;
        case "number-literal":
          newStep.numberLiteralConfig = { value: 0 };
          break;
        case "boolean-literal":
          newStep.booleanLiteralConfig = { value: false };
          break;
        case "json-literal":
          newStep.jsonLiteralConfig = { value: "{}" };
          break;
      }

      const updatedPipeline = [...pipeline, newStep];
      onChange({
        pipeline: updatedPipeline,
        usePipeline: true,
      });
      setContextMenu(null);
    },
    [pipeline, onChange]
  );

  const deleteStep = useCallback(
    (stepId: string) => {
      const updatedPipeline = pipeline.filter((s) => s.id !== stepId);
      const updatedEdges = edges.filter(
        (e) => e.source !== stepId && e.target !== stepId
      );
      setEdges(updatedEdges);
      onChange({
        pipeline: updatedPipeline,
        nodeEdges: edgesToPipelineEdges(updatedEdges),
      });
    },
    [pipeline, edges, onChange]
  );

  // Close context menu when clicking elsewhere
  const closeContextMenu = useCallback(() => setContextMenu(null), []);



  // Handle Delete key
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        setContextMenu(null);
      }
    },
    []
  );

  return (
    <div
      className="flex h-full"
      onKeyDown={onKeyDown}
      tabIndex={0}
      style={{ outline: "none" }}
    >
      {/* Canvas */}
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
          deleteKeyCode="Delete"
          snapToGrid
          snapGrid={[15, 15]}
          defaultEdgeOptions={{
            type: "smoothstep",
            style: { stroke: "#9ca3af", strokeWidth: 2 },
          }}
          connectionLineStyle={{ stroke: "#818cf8", strokeWidth: 2.5 }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(node) => {
              if (node.id === REQUEST_NODE_ID) return "#818cf8";
              return "#666";
            }}
            maskColor="rgba(0,0,0,0.15)"
          />
        </ReactFlow>

        {/* Context menu */}
        {contextMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={closeContextMenu} />
            <div
              className="node-context-menu"
              style={{ left: contextMenu.x, top: contextMenu.y }}
            >
              <div className="px-3 py-2 text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider border-b border-border">
                Add Node
              </div>
              {STEP_PALETTE.map((section) => (
                <div key={section.label}>
                  <div className="node-context-menu-section">
                    {section.label}
                  </div>
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
          </>
        )}

        {/* Empty state overlay */}
        {pipeline.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-muted-foreground/40 bg-card/80 rounded-xl p-6 border border-dashed border-border">
              <p className="text-sm font-medium mb-1">No pipeline steps yet</p>
              <p className="text-xs">Right-click anywhere to add a step</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

/** Wrapped in ReactFlowProvider */
export function NodePipelineEditor(props: NodePipelineEditorProps) {
  return (
    <ReactFlowProvider>
      <NodePipelineEditorInner {...props} />
    </ReactFlowProvider>
  );
}
