"use client";

import { useState, useRef, useEffect } from "react";
import { ComponentDefinition, Page } from "@/types/editor";
import { HierarchyPanel } from "./HierarchyPanel";
import { ComponentPalette } from "./ComponentPalette";
import { Canvas } from "./Canvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { PagesPanel } from "./PagesPanel";
import { Download, Eye, Edit, X, Undo, Redo, Monitor, Tablet, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";

type Viewport = "desktop" | "tablet" | "mobile";

interface EditorLayoutProps {
  components: ComponentDefinition[];
  selectedComponentIds: string[];
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (id: string, updates: Record<string, any>) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
  onAddComponent?: (componentType: string) => void;
  projectName?: string;
  onProjectNameChange?: (name: string) => void;
  pages: Page[];
  currentPageId: string;
  onPageSelect: (pageId: string) => void;
  onPageAdd: (name: string, slug: string) => void;
  onPageDelete: (pageId: string) => void;
  onPageDuplicate?: (pageId: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function EditorLayout({
  components,
  selectedComponentIds,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  onDuplicateComponent,
  onAddComponent,
  projectName,
  onProjectNameChange,
  pages,
  currentPageId,
  onPageSelect,
  onPageAdd,
  onPageDelete,
  onPageDuplicate,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: EditorLayoutProps) {
  const router = useRouter();
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(projectName || "");
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Panel widths and heights
  const [leftPanelWidth, setLeftPanelWidth] = useState(320);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [pagesPanelHeight, setPagesPanelHeight] = useState(256);
  const [hierarchyPanelHeight, setHierarchyPanelHeight] = useState(300);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;

      if (isResizingRef.current === "left") {
        const delta = e.clientX - startPosRef.current.x;
        setLeftPanelWidth(
          Math.max(200, Math.min(600, startSizeRef.current + delta)),
        );
      } else if (isResizingRef.current === "right") {
        const delta = startPosRef.current.x - e.clientX;
        setRightPanelWidth(
          Math.max(200, Math.min(600, startSizeRef.current + delta)),
        );
      } else if (isResizingRef.current === "pages") {
        const delta = e.clientY - startPosRef.current.y;
        setPagesPanelHeight(
          Math.max(150, Math.min(500, startSizeRef.current + delta)),
        );
      } else if (isResizingRef.current === "hierarchy") {
        const delta = e.clientY - startPosRef.current.y;
        setHierarchyPanelHeight(
          Math.max(150, Math.min(600, startSizeRef.current + delta)),
        );
      }
    };

    const handleMouseUp = () => {
      isResizingRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const isResizingRef = useRef<string | null>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startSizeRef = useRef(0);

  const startResize = (type: string, e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = type;
    startPosRef.current = { x: e.clientX, y: e.clientY };

    if (type === "left") {
      startSizeRef.current = leftPanelWidth;
      document.body.style.cursor = "ew-resize";
    } else if (type === "right") {
      startSizeRef.current = rightPanelWidth;
      document.body.style.cursor = "ew-resize";
    } else if (type === "pages") {
      startSizeRef.current = pagesPanelHeight;
      document.body.style.cursor = "ns-resize";
    } else if (type === "hierarchy") {
      startSizeRef.current = hierarchyPanelHeight;
      document.body.style.cursor = "ns-resize";
    }

    document.body.style.userSelect = "none";
  };

  const selectedComponent =
    selectedComponentIds.length === 1
      ? findComponentById(components, selectedComponentIds[0])
      : null;

  const getCanvasWidth = () => {
    switch (viewport) {
      case "mobile":
        return "375px";
      case "tablet":
        return "768px";
      case "desktop":
      default:
        return "100%";
    }
  };

  const exportToZip = async (format: "html" | "react" = "html") => {
    try {
      setShowExportMenu(false);

      // Call the export API with pages
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pages,
          format,
          projectName: projectName || "my-website",
        }),
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        format === "react" ? "react-project.zip" : "website-export.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Panel - Pages, Hierarchy, and Components */}
      {!isPreviewMode && (
        <>
          <div
            className="flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full"
            style={{ width: `${leftPanelWidth}px` }}
          >
            {/* Pages Panel */}
            <div
              className="border-b border-gray-200 flex-shrink-0 overflow-hidden"
              style={{ height: `${pagesPanelHeight}px` }}
            >
              <PagesPanel
                pages={pages}
                currentPageId={currentPageId}
                onPageSelect={onPageSelect}
                onPageAdd={onPageAdd}
                onPageDelete={onPageDelete}
                onPageDuplicate={onPageDuplicate}
                onPageRename={(id, name, slug) => {
                  // TODO: Implement page rename
                }}
              />
            </div>

            {/* Resize Handle for Pages Panel */}
            <div
              className="h-1 bg-gray-200 hover:bg-blue-400 cursor-ns-resize transition-colors flex-shrink-0"
              onMouseDown={(e) => startResize("pages", e)}
            />

            {/* Hierarchy Panel */}
            <div
              className="border-b border-gray-200 min-h-0 overflow-hidden"
              style={{ height: `${hierarchyPanelHeight}px` }}
            >
              <HierarchyPanel
                components={components}
                selectedComponentIds={selectedComponentIds}
                onSelectComponent={onSelectComponent}
                onDeleteComponent={onDeleteComponent}
                onAddComponent={onAddComponent}
              />
            </div>

            {/* Resize Handle for Hierarchy Panel */}
            <div
              className="h-1 bg-gray-200 hover:bg-blue-400 cursor-ns-resize transition-colors flex-shrink-0"
              onMouseDown={(e) => startResize("hierarchy", e)}
            />

            {/* Component Palette */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <ComponentPalette />
            </div>
          </div>

          {/* Resize Handle for Left Panel */}
          <div
            className="w-1 bg-gray-200 hover:bg-blue-400 cursor-ew-resize transition-colors flex-shrink-0"
            onMouseDown={(e) => startResize("left", e)}
          />
        </>
      )}

      {/* Canvas - Center */}
      <div className="flex-1 flex flex-col" style={{ minWidth: 0 }}>
        {/* Toolbar */}
        <div className="h-10 bg-white border-b border-gray-200 flex items-center px-4 justify-between">
          <div className="flex items-center space-x-4">
            {/* Close Button */}
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="Close Editor"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            {projectName && onProjectNameChange ? (
              isEditingName ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onBlur={() => {
                    if (editedName.trim()) {
                      onProjectNameChange(editedName.trim());
                    } else {
                      setEditedName(projectName);
                    }
                    setIsEditingName(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (editedName.trim()) {
                        onProjectNameChange(editedName.trim());
                      } else {
                        setEditedName(projectName);
                      }
                      setIsEditingName(false);
                    } else if (e.key === "Escape") {
                      setEditedName(projectName);
                      setIsEditingName(false);
                    }
                  }}
                  autoFocus
                  className="text-sm font-medium px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <button
                  onClick={() => {
                    setEditedName(projectName);
                    setIsEditingName(true);
                  }}
                  className="text-sm font-medium hover:text-blue-600 transition-colors"
                >
                  {projectName}
                </button>
              )
            ) : (
              <span className="text-sm font-medium">Canvas</span>
            )}
            <div className="flex items-center space-x-1 border border-gray-200 rounded p-0.5 bg-gray-50">
              <button
                onClick={() => setViewport("desktop")}
                className={`p-1.5 rounded transition-colors ${
                  viewport === "desktop"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="Desktop (1200px+)"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewport("tablet")}
                className={`p-1.5 rounded transition-colors ${
                  viewport === "tablet"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="Tablet (768px)"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewport("mobile")}
                className={`p-1.5 rounded transition-colors ${
                  viewport === "mobile"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="Mobile (375px)"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>


          </div>

          {/* Undo/Redo, Preview & Export Buttons */}
          <div className="ml-auto flex items-center space-x-2">
            {/* Undo Button */}
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`flex items-center space-x-1 px-3 py-1 text-xs rounded transition-colors ${
                canUndo
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-3 h-3" />
              <span>Undo</span>
            </button>

            {/* Redo Button */}
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`flex items-center space-x-1 px-3 py-1 text-xs rounded transition-colors ${
                canRedo
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-3 h-3" />
              <span>Redo</span>
            </button>

            <div className="w-px h-6 bg-gray-300"></div>

            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`flex items-center justify-center w-8 h-8 rounded transition-colors ${
                isPreviewMode
                  ? "bg-blue-50 text-blue-600 shadow-sm border border-blue-200"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
              title={isPreviewMode ? "Edit Mode" : "Preview Mode"}
            >
              {isPreviewMode ? (
                <Edit className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>

            {/* Export Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center justify-center w-8 h-8 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded transition-colors"
                title="Export Panel"
              >
                <Download className="w-4 h-4" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <button
                    onClick={() => exportToZip("html")}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-t-lg"
                  >
                    <div className="font-medium">Export as HTML</div>
                    <div className="text-xs text-gray-500">Static website</div>
                  </button>
                  <button
                    onClick={() => exportToZip("react")}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-b-lg border-t"
                  >
                    <div className="font-medium">Export as React</div>
                    <div className="text-xs text-gray-500">Next.js project</div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div
          className={`flex-1 overflow-auto transition-all duration-300 ${
            isPreviewMode ? "bg-white p-0" : "bg-gray-100 p-8"
          }`}
          style={{
            maxHeight: "calc(100vh - 3rem)",
            minWidth: 0,
          }}
        >
          <div
            className="transition-all duration-300 ease-in-out"
            style={{
              width: getCanvasWidth(),
              maxWidth:
                viewport === "desktop"
                  ? isPreviewMode
                    ? "none"
                    : "1200px"
                  : getCanvasWidth(),
              minHeight: "100%",
              margin: "0 auto",
            }}
          >
            <Canvas
              components={components}
              selectedComponentIds={isPreviewMode ? [] : selectedComponentIds}
              onSelectComponent={isPreviewMode ? () => {} : onSelectComponent}
              viewport={viewport}
              isPreviewMode={isPreviewMode}
              onNavigate={(slug) => {
                const targetPage = pages.find((p) => p.slug === slug);
                if (targetPage) {
                  onPageSelect(targetPage.id);
                }
              }}
              pages={pages}
            />
          </div>
        </div>
      </div>

      {/* Properties Panel - Right */}
      {!isPreviewMode && (
        <>
          {/* Resize Handle for Right Panel */}
          <div
            className="w-1 bg-gray-200 hover:bg-blue-400 cursor-ew-resize transition-colors flex-shrink-0"
            onMouseDown={(e) => startResize("right", e)}
          />

          <div
            className="flex-shrink-0 bg-white border-l border-gray-200 h-full overflow-hidden"
            style={{ width: `${rightPanelWidth}px` }}
          >
            <PropertiesPanel
              selectedComponent={selectedComponent}
              onUpdateComponent={onUpdateComponent}
              onDeleteComponent={onDeleteComponent}
              onDuplicateComponent={onDuplicateComponent}
              pages={pages}
            />
          </div>
        </>
      )}
    </div>
  );
}

function findComponentById(
  components: ComponentDefinition[],
  id: string,
): ComponentDefinition | null {
  for (const component of components) {
    if (component.id === id) {
      return component;
    }

    const found = findComponentById(component.children, id);
    if (found) {
      return found;
    }
  }

  return null;
}
