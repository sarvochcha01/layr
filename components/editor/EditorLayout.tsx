"use client";

import { useState, useRef, useEffect } from "react";
import { Page, GlobalComponents, ComponentDefinition, CustomComponents, ChatMessage } from "@/types/editor";
import { HierarchyPanel } from "./HierarchyPanel";
import { ComponentPalette } from "./ComponentPalette";
import { Canvas } from "./Canvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { PagesPanel } from "./PagesPanel";
import { AIChatPanel } from "./AIChatPanel";
import { CodeEditorDialog } from "./CodeEditorDialog";
import { Download, Eye, Edit, X, Undo, Redo, Monitor, Tablet, Smartphone, Layers, LayoutTemplate, FileBox, Save, Sparkles } from "lucide-react";
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
  onApplyAIComponents?: (components: ComponentDefinition[], mode: "add" | "replace") => void;
  onApplyAIPages?: (pages: { name: string; path: string; components: ComponentDefinition[] }[]) => void;
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

      const zip = new JSZip();
      const pagesToExport = pages;
      const name = projectName || "my-website";

      if (format === "react") {
        // React/Next.js export with App Router structure — fully client-side
        const appFolder = zip.folder("app");
        const componentsFolder = zip.folder("components");
        const publicFolder = zip.folder("public");

        // Generate app/layout.tsx
        appFolder?.file("layout.tsx", generateAppLayout(name));

        // Generate app/globals.css
        appFolder?.file("globals.css", `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root {\n  --foreground-rgb: 0, 0, 0;\n  --background-start-rgb: 214, 219, 220;\n  --background-end-rgb: 255, 255, 255;\n}\n\nbody {\n  color: rgb(var(--foreground-rgb));\n  background: linear-gradient(\n      to bottom,\n      transparent,\n      rgb(var(--background-end-rgb))\n    )\n    rgb(var(--background-start-rgb));\n}\n`);

        // Generate page components using App Router structure
        for (let i = 0; i < pagesToExport.length; i++) {
          const page = pagesToExport[i];
          const pageName = page.name.replace(/\s+/g, "");

          // App Router uses app/page.tsx for home and app/[slug]/page.tsx for other pages
          if (page.slug === "index" || (i === 0 && !pagesToExport.some(p => p.slug === "index"))) {
            const appPageContent = generateAppPage(page.components, pageName, `${pageName} - ${name}`);
            appFolder?.file("page.tsx", appPageContent);
          } else {
            const reactComponent = generateReactComponent(page.components, pageName);
            const slugPath = page.slug || page.name.toLowerCase().replace(/\s+/g, "-") || page.id;
            const pageFolder = appFolder?.folder(slugPath);
            pageFolder?.file("page.tsx", reactComponent);
          }
        }

        // Generate all component implementation files
        const componentNames = [
          'Header', 'Footer', 'Hero', 'Section', 'Container', 'Grid',
          'Card', 'Button', 'Text', 'Image', 'Video', 'Form',
          'Navbar', 'Accordion', 'Tabs', 'Testimonial', 'PricingCard',
          'Feature', 'Stats', 'CTA', 'Divider', 'Spacer', 'Badge', 'Alert'
        ];

        for (const componentName of componentNames) {
          const componentCode = generateComponentImplementation(componentName);
          componentsFolder?.file(`${componentName}.tsx`, componentCode);
        }

        // Add component index for convenient imports
        componentsFolder?.file("index.ts", generateReactComponentsIndex());

        // Add config files
        zip.file("package.json", generatePackageJson(name));
        zip.file("next.config.js", generateNextConfig());
        zip.file("tailwind.config.js", generateTailwindConfig());
        zip.file("README.md", generateREADME(name));

        // Add postcss config
        zip.file("postcss.config.js", `/** @type {import('postcss-load-config').Config} */\nconst config = {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n}\n\nmodule.exports = config\n`);

        // Add .gitignore
        zip.file(".gitignore", `# dependencies\n/node_modules\n/.pnp\n.pnp.js\n\n# testing\n/coverage\n\n# next.js\n/.next/\n/out/\n\n# production\n/build\n\n# misc\n.DS_Store\n*.pem\n\n# debug\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\n\n# local env files\n.env*.local\n\n# vercel\n.vercel\n\n# typescript\n*.tsbuildinfo\nnext-env.d.ts\n`);

        // Add .eslintrc.json
        zip.file(".eslintrc.json", JSON.stringify({ extends: "next/core-web-vitals" }, null, 2));

        // Add next-env.d.ts
        zip.file("next-env.d.ts", `/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n\n// NOTE: This file should not be edited\n// see https://nextjs.org/docs/app/building-your-application/configuring/typescript for more information.\n`);

        // Add tsconfig.json with proper Next.js 15 configuration
        zip.file("tsconfig.json", JSON.stringify({
          compilerOptions: {
            target: "ES2017",
            lib: ["dom", "dom.iterable", "esnext"],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            noEmit: true,
            esModuleInterop: true,
            module: "esnext",
            moduleResolution: "node",
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: "preserve",
            incremental: true,
            plugins: [{ name: "next" }],
            paths: { "@/*": ["./*"] },
          },
          include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
          exclude: ["node_modules"],
        }, null, 2));

        // Add placeholder to public folder
        publicFolder?.file(".gitkeep", "");
      } else {
        // HTML export — client-side
        const css = generateCSS();
        const js = generateJS();

        for (const page of pagesToExport) {
          const html = generateHTML(page.components, pagesToExport);
          const filename = `${page.slug || page.id}.html`;
          zip.file(filename, html);
        }

        zip.file("styles.css", css);
        zip.file("script.js", js);
      }

      // Generate and download the zip
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = format === "react" ? `${name}-nextjs.zip` : `${name}-export.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  return (
    <>
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
                <TabsList className="w-full grid grid-cols-4 bg-muted">
                  <TabsTrigger value="pages" className="text-xs py-1.5"><LayoutTemplate className="w-3 h-3 mr-1.5" /> Pages</TabsTrigger>
                  <TabsTrigger value="layers" className="text-xs py-1.5"><Layers className="w-3 h-3 mr-1.5" /> Layers</TabsTrigger>
                  <TabsTrigger value="assets" className="text-xs py-1.5"><FileBox className="w-3 h-3 mr-1.5" /> Assets</TabsTrigger>
                  <TabsTrigger value="ai" className="text-xs py-1.5"><Sparkles className="w-3 h-3 mr-1.5" /> AI</TabsTrigger>
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
                  onPageRename={onPageRename || (() => {})}
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
                <ComponentPalette
                  globalComponents={globalComponents}
                  customComponents={customComponents}
                  onDeleteCustomComponent={onDeleteCustomComponent}
                  selectedComponent={selectedComponent}
                  onSaveCustomComponent={onSaveCustomComponent}
                  onWriteCode={() => setShowCodeEditor(true)}
                />
              </TabsContent>

              {/* AI Tab */}
              <TabsContent value="ai" forceMount className="flex-1 min-h-0 m-0 p-0 border-none data-[state=inactive]:hidden overflow-hidden">
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
