"use client";

import { useState, useRef, useEffect } from "react";
import { ComponentDefinition, Page, GlobalComponents } from "@/types/editor";
import { HierarchyPanel } from "./HierarchyPanel";
import { ComponentPalette } from "./ComponentPalette";
import { Canvas } from "./Canvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { PagesPanel } from "./PagesPanel";
import { Download, Eye, Edit, X, Undo, Redo, Monitor, Tablet, Smartphone, Layers, LayoutTemplate, FileBox, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  onSave?: () => void;
  isSaving?: boolean;
  globalComponents?: GlobalComponents;
  onMarkAsGlobal?: (componentId: string, globalName: string) => void;
  onUnmarkGlobal?: (componentId: string) => void;
  onApplyGlobalTemplate?: (componentId: string, globalName: string) => void;
  onMoveComponentUp?: (componentId: string) => void;
  onMoveComponentDown?: (componentId: string) => void;
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
  onSave,
  isSaving = false,
  globalComponents = {},
  onMarkAsGlobal,
  onUnmarkGlobal,
  onApplyGlobalTemplate,
  onMoveComponentUp,
  onMoveComponentDown,
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
    <div className="dark h-screen flex bg-background text-foreground overflow-hidden">
      {/* Left Panel - Tabs for Pages, Layers, Assets */}
      {!isPreviewMode && (
        <>
          <div
            className="flex-shrink-0 bg-card border-r border-border flex flex-col h-full"
            style={{ width: `${leftPanelWidth}px` }}
          >
            <Tabs defaultValue="layers" className="flex flex-col h-full w-full">
              <div className="flex-shrink-0 p-2 border-b border-border">
                <TabsList className="w-full grid grid-cols-3 bg-muted">
                  <TabsTrigger value="pages" className="text-xs py-1.5"><LayoutTemplate className="w-3 h-3 mr-1.5" /> Pages</TabsTrigger>
                  <TabsTrigger value="layers" className="text-xs py-1.5"><Layers className="w-3 h-3 mr-1.5" /> Layers</TabsTrigger>
                  <TabsTrigger value="assets" className="text-xs py-1.5"><FileBox className="w-3 h-3 mr-1.5" /> Assets</TabsTrigger>
                </TabsList>
              </div>

              {/* Pages Tab */}
              <TabsContent value="pages" className="flex-1 min-h-0 m-0 p-0 border-none data-[state=inactive]:hidden overflow-y-auto">
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
              </TabsContent>

              {/* Layers Tab (Hierarchy) */}
              <TabsContent value="layers" className="flex-1 min-h-0 m-0 p-0 border-none data-[state=inactive]:hidden overflow-y-auto">
                <HierarchyPanel
                  components={components}
                  selectedComponentIds={selectedComponentIds}
                  onSelectComponent={onSelectComponent}
                  onDeleteComponent={onDeleteComponent}
                  onAddComponent={onAddComponent}
                />
              </TabsContent>

              {/* Assets Tab (Components) */}
              <TabsContent value="assets" className="flex-1 min-h-0 m-0 p-0 border-none data-[state=inactive]:hidden overflow-y-auto">
                <ComponentPalette globalComponents={globalComponents} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Resize Handle for Left Panel */}
          <div
            className="w-1 bg-border hover:bg-primary cursor-ew-resize transition-colors flex-shrink-0 z-10 relative"
            onMouseDown={(e) => startResize("left", e)}
          />
        </>
      )}

      {/* Canvas - Center */}
      <div className="flex-1 flex flex-col min-w-0 bg-muted/30">
        {/* Toolbar */}
        <div className="h-12 bg-card border-b border-border flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center space-x-4">
            {/* Close Button */}
            <button
              onClick={() => router.back()}
              className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
              title="Close Editor"
            >
              <X className="w-4 h-4" />
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
                  className="text-sm font-medium px-2 py-1 border border-border bg-background rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              ) : (
                <button
                  onClick={() => {
                    setEditedName(projectName);
                    setIsEditingName(true);
                  }}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {projectName}
                </button>
              )
            ) : (
              <span className="text-sm font-medium text-foreground">Canvas</span>
            )}
            <div className="flex items-center space-x-1 border border-border rounded p-0.5 bg-background">
              <button
                onClick={() => setViewport("desktop")}
                className={`p-1.5 rounded transition-colors ${
                  viewport === "desktop"
                    ? "bg-muted text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                title="Desktop (1200px+)"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewport("tablet")}
                className={`p-1.5 rounded transition-colors ${
                  viewport === "tablet"
                    ? "bg-muted text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                title="Tablet (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewport("mobile")}
                className={`p-1.5 rounded transition-colors ${
                  viewport === "mobile"
                    ? "bg-muted text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                title="Mobile (375px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="ml-auto flex items-center space-x-2">
            {/* Save Button */}
            {onSave && (
              <button
                onClick={onSave}
                disabled={isSaving}
                className={`flex items-center justify-center space-x-1.5 px-3 h-8 rounded text-xs font-medium transition-colors ${
                  isSaving 
                    ? "bg-muted text-muted-foreground cursor-not-allowed" 
                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                }`}
                title="Save Project (Ctrl+S)"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? "Saving..." : "Save"}</span>
              </button>
            )}

            <div className="w-px h-4 bg-border mx-1"></div>

            {/* Undo Button */}
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`flex items-center justify-center w-8 h-8 rounded transition-colors ${
                canUndo
                  ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                  : "text-muted-foreground/30 cursor-not-allowed"
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>

            {/* Redo Button */}
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`flex items-center justify-center w-8 h-8 rounded transition-colors ${
                canRedo
                  ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                  : "text-muted-foreground/30 cursor-not-allowed"
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-border mx-1"></div>

            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`flex items-center justify-center w-8 h-8 rounded transition-colors ${
                isPreviewMode
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:bg-muted hover:text-foreground rounded transition-colors"
                title="Export Panel"
              >
                <Download className="w-4 h-4" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-card rounded-lg shadow-lg border border-border z-50">
                  <button
                    onClick={() => exportToZip("html")}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted rounded-t-lg"
                  >
                    <div className="font-medium">Export as HTML</div>
                    <div className="text-xs text-muted-foreground">Static website</div>
                  </button>
                  <button
                    onClick={() => exportToZip("react")}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted rounded-b-lg border-t border-border"
                  >
                    <div className="font-medium">Export as React</div>
                    <div className="text-xs text-muted-foreground">Next.js project</div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div
          className={`flex-1 overflow-auto transition-all duration-300 ${
            isPreviewMode ? "bg-white p-0" : "bg-muted p-8"
          } light`}
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
            className="w-1 bg-border hover:bg-primary cursor-ew-resize transition-colors flex-shrink-0 z-10 relative"
            onMouseDown={(e) => startResize("right", e)}
          />

          <div
            className="flex-shrink-0 bg-card border-l border-border h-full overflow-y-auto"
            style={{ width: `${rightPanelWidth}px` }}
          >
            <PropertiesPanel
              selectedComponent={selectedComponent}
              onUpdateComponent={onUpdateComponent}
              onDeleteComponent={onDeleteComponent}
              onDuplicateComponent={onDuplicateComponent}
              pages={pages}
              globalComponents={globalComponents}
              onMarkAsGlobal={onMarkAsGlobal}
              onUnmarkGlobal={onUnmarkGlobal}
              onApplyGlobalTemplate={onApplyGlobalTemplate}
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
