"use client";

import { useState, useRef, useEffect } from "react";
import {
  Page,
  GlobalComponents,
  ComponentDefinition,
  CustomComponents,
  ChatMessage,
} from "@/types/editor";
import { HierarchyPanel } from "./HierarchyPanel";
import { ComponentPalette } from "./ComponentPalette";
import { Canvas } from "./Canvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { PagesPanel } from "./PagesPanel";
import { AIChatPanel } from "./AIChatPanel";
import { CodeEditorDialog } from "./CodeEditorDialog";
import {
  Download,
  Eye,
  Edit,
  X,
  Undo,
  Redo,
  Monitor,
  Tablet,
  Smartphone,
  Layers,
  LayoutTemplate,
  FileBox,
  Save,
  Sparkles,
  BoxSelect,
  Play,
  RotateCcw,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JSZip from "jszip";
import { generateCSS, generateHTML, generateJS } from "@/lib/codeGenerator";
import {
  generateReactComponent,
  generateReactComponentsIndex,
  generatePackageJson,
  generateNextConfig,
  generateTailwindConfig,
  generateREADME,
  generateAppLayout,
  generateAppPage,
  generateComponentImplementation,
} from "@/lib/reactGenerator";

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
  onPageRename?: (pageId: string, name: string, slug: string) => void;
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
  onApplyAIComponents?: (
    components: ComponentDefinition[],
    mode: "add" | "replace",
  ) => void;
  onApplyAIPages?: (
    pages: { name: string; path: string; components: ComponentDefinition[] }[],
  ) => void;
  customComponents?: CustomComponents;
  onSaveCustomComponent?: (componentId: string, customName: string) => void;
  onDeleteCustomComponent?: (customName: string) => void;
  onSaveCodeComponent?: (name: string, html: string, css: string) => void;
  chatHistory?: ChatMessage[];
  onChatHistoryChange?: (messages: ChatMessage[]) => void;
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
  onPageRename,
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
  onApplyAIComponents,
  onApplyAIPages,
  customComponents = {},
  onSaveCustomComponent,
  onDeleteCustomComponent,
  onSaveCodeComponent,
  chatHistory,
  onChatHistoryChange,
}: EditorLayoutProps) {
  const router = useRouter();
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(projectName || "");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showOutlines, setShowOutlines] = useState(false);

  // Panel widths and heights
  const [leftPanelWidth, setLeftPanelWidth] = useState(280);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);

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

      // Call the API route to generate the export server-side
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

      // Download the zip file
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch
        ? filenameMatch[1]
        : format === "react"
          ? `${projectName || "my-website"}-nextjs.zip`
          : `${projectName || "my-website"}-export.zip`;

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert(
        "Export failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }
  };

  return (
    <>
      <div className="h-screen flex bg-[#0d0d0d] text-white overflow-hidden">
        {/* Top Header Bar */}
        <div className="fixed top-0 left-0 right-0 h-14 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-4 justify-between z-50">
          <div className="flex items-center space-x-6">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-[#2a2a2a] rounded-md transition-colors text-gray-400 hover:text-white"
                title="Close Editor"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="text-sm font-semibold tracking-wide">LAYR</div>
            </div>

            {/* Viewport Tabs */}
            <div className="flex items-center space-x-1 bg-[#0d0d0d] border border-[#2a2a2a] rounded-md p-1">
              <button
                onClick={() => setViewport("desktop")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors rounded ${
                  viewport === "desktop"
                    ? "bg-[#2a2a2a] text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Desktop
              </button>
              <button
                onClick={() => setViewport("tablet")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors rounded ${
                  viewport === "tablet"
                    ? "bg-[#2a2a2a] text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Tablet
              </button>
              <button
                onClick={() => setViewport("mobile")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors rounded ${
                  viewport === "mobile"
                    ? "bg-[#2a2a2a] text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Mobile
              </button>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>PAGES</span>
              <span>/</span>
              <span className="text-gray-300">INDEX / HERO SECTION</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Mode Tabs */}
            <div className="flex items-center space-x-1 bg-[#0d0d0d] border border-[#2a2a2a] rounded-md p-1">
              <button className="px-4 py-1.5 text-xs font-medium bg-blue-600 text-white rounded transition-colors">
                DESIGN
              </button>
              <button className="px-4 py-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors">
                PROTOTYPE
              </button>
              <button className="px-4 py-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors">
                INSPECT
              </button>
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="p-2 hover:bg-[#2a2a2a] rounded-md transition-colors text-gray-400 hover:text-white"
              title="Preview"
            >
              <Play className="w-4 h-4" />
            </button>
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-2 rounded-md transition-colors ${
                canUndo
                  ? "hover:bg-[#2a2a2a] text-gray-400 hover:text-white"
                  : "text-gray-600 cursor-not-allowed"
              }`}
              title="Undo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-[#2a2a2a] rounded-md transition-colors text-gray-400 hover:text-white">
              <Settings className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-[#2a2a2a]"></div>

            {/* Save & Publish */}
            <button
              onClick={onSave}
              disabled={isSaving}
              className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                isSaving
                  ? "bg-[#2a2a2a] text-gray-500 cursor-not-allowed"
                  : "bg-[#2a2a2a] text-white hover:bg-[#333333]"
              }`}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-[#1a1a1a] rounded-lg shadow-xl border border-[#2a2a2a] overflow-hidden z-50">
                  <button
                    onClick={() => exportToZip("html")}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-[#2a2a2a] transition-colors"
                  >
                    <div className="font-medium text-white">Export as HTML</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Static website
                    </div>
                  </button>
                  <div className="h-px bg-[#2a2a2a]"></div>
                  <button
                    onClick={() => exportToZip("react")}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-[#2a2a2a] transition-colors"
                  >
                    <div className="font-medium text-white">
                      Export as React
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Next.js project
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 pt-14">
          {/* Left Sidebar */}
          {!isPreviewMode && (
            <>
              <div
                className="flex-shrink-0 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col"
                style={{ width: `${leftPanelWidth}px` }}
              >
                <Tabs
                  defaultValue="components"
                  className="flex flex-col h-full w-full"
                >
                  <div className="flex-shrink-0 px-2 py-2 border-b border-[#2a2a2a]">
                    <TabsList className="w-full grid grid-cols-3 bg-transparent gap-0.5 p-0">
                      <TabsTrigger
                        value="pages"
                        className="text-[10px] py-2 px-1 data-[state=active]:bg-[#2a2a2a] data-[state=active]:text-white text-gray-400 rounded-md transition-all font-semibold tracking-wide flex items-center justify-center"
                      >
                        <LayoutTemplate className="w-3 h-3 mr-1" />
                        PAGES
                      </TabsTrigger>
                      <TabsTrigger
                        value="layers"
                        className="text-[10px] py-2 px-1 data-[state=active]:bg-[#2a2a2a] data-[state=active]:text-white text-gray-400 rounded-md transition-all font-semibold tracking-wide flex items-center justify-center"
                      >
                        <Layers className="w-3 h-3 mr-1" />
                        LAYERS
                      </TabsTrigger>
                      <TabsTrigger
                        value="components"
                        className="text-[10px] py-2 px-1 data-[state=active]:bg-[#2a2a2a] data-[state=active]:text-white text-gray-400 rounded-md transition-all font-semibold tracking-wide flex items-center justify-center"
                      >
                        <FileBox className="w-3 h-3 mr-1" />
                        ASSETS
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent
                    value="pages"
                    className="flex-1 min-h-0 m-0 p-0 border-none data-[state=inactive]:hidden overflow-y-auto"
                  >
                    <PagesPanel
                      pages={pages}
                      currentPageId={currentPageId}
                      onPageSelect={onPageSelect}
                      onPageAdd={onPageAdd}
                      onPageDelete={onPageDelete}
                      onPageDuplicate={onPageDuplicate}
                      onPageRename={onPageRename || (() => {})}
                    />
                  </TabsContent>

                  <TabsContent
                    value="layers"
                    className="flex-1 min-h-0 m-0 p-0 border-none data-[state=inactive]:hidden overflow-y-auto"
                  >
                    <HierarchyPanel
                      components={components}
                      selectedComponentIds={selectedComponentIds}
                      onSelectComponent={onSelectComponent}
                      onDeleteComponent={onDeleteComponent}
                      onAddComponent={onAddComponent}
                    />
                  </TabsContent>

                  <TabsContent
                    value="components"
                    className="flex-1 min-h-0 m-0 p-0 border-none data-[state=inactive]:hidden overflow-y-auto"
                  >
                    <ComponentPalette
                      globalComponents={globalComponents}
                      customComponents={customComponents}
                      onDeleteCustomComponent={onDeleteCustomComponent}
                      selectedComponent={selectedComponent}
                      onSaveCustomComponent={onSaveCustomComponent}
                      onWriteCode={() => setShowCodeEditor(true)}
                    />
                  </TabsContent>

                  <TabsContent
                    value="ai"
                    forceMount
                    className="flex-1 min-h-0 m-0 p-0 border-none data-[state=inactive]:hidden overflow-hidden"
                  >
                    <AIChatPanel
                      onApplyComponents={onApplyAIComponents || (() => {})}
                      onApplyPages={onApplyAIPages || (() => {})}
                      existingComponents={components}
                      customComponents={customComponents}
                      globalComponents={globalComponents}
                      messages={chatHistory}
                      onMessagesChange={onChatHistoryChange}
                    />
                  </TabsContent>

                  {/* Bottom AI Assistant Tab */}
                  <div className="flex-shrink-0 p-2 border-t border-[#2a2a2a]">
                    <TabsList className="w-full bg-transparent p-0">
                      <TabsTrigger
                        value="ai"
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 bg-blue-600/10 hover:bg-blue-600/15 text-blue-400/70 rounded-md transition-colors text-xs font-semibold"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>AI ASSISTANT</span>
                        <span className="text-[10px] bg-blue-600/20 px-1.5 py-0.5 rounded">
                          ⌘K
                        </span>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </Tabs>
              </div>

              {/* Resize Handle */}
              <div
                className="w-[1px] bg-[#2a2a2a] hover:bg-blue-500 cursor-ew-resize transition-colors flex-shrink-0 z-10"
                onMouseDown={(e) => startResize("left", e)}
              />
            </>
          )}

          {/* Canvas Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#0d0d0d] overflow-auto">
            <div
              className={`flex-1 overflow-auto transition-all duration-300 ${
                isPreviewMode ? "bg-white p-0" : "bg-[#0d0d0d] p-8"
              } light`}
            >
              <div
                className="transition-all duration-300 ease-in-out mx-auto"
                style={{
                  width: getCanvasWidth(),
                  maxWidth:
                    viewport === "desktop"
                      ? isPreviewMode
                        ? "none"
                        : "1200px"
                      : getCanvasWidth(),
                  minHeight: "100%",
                }}
              >
                <Canvas
                  components={components}
                  selectedComponentIds={
                    isPreviewMode ? [] : selectedComponentIds
                  }
                  onSelectComponent={
                    isPreviewMode ? () => {} : onSelectComponent
                  }
                  viewport={viewport}
                  isPreviewMode={isPreviewMode}
                  onNavigate={(slug) => {
                    const targetPage = pages.find((p) => p.slug === slug);
                    if (targetPage) {
                      onPageSelect(targetPage.id);
                    }
                  }}
                  pages={pages}
                  showOutlines={!isPreviewMode && showOutlines}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar - Properties */}
          {!isPreviewMode && (
            <>
              <div
                className="w-[1px] bg-[#2a2a2a] hover:bg-blue-500 cursor-ew-resize transition-colors flex-shrink-0 z-10"
                onMouseDown={(e) => startResize("right", e)}
              />

              <div
                className="flex-shrink-0 bg-[#1a1a1a] border-l border-[#2a2a2a] flex flex-col"
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
      </div>

      {/* Code Editor Dialog */}
      <CodeEditorDialog
        open={showCodeEditor}
        onClose={() => setShowCodeEditor(false)}
        onSave={(name, html, css) => {
          onSaveCodeComponent?.(name, html, css);
          setShowCodeEditor(false);
        }}
      />
    </>
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
