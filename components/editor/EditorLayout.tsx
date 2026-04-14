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
  onPageUpdate?: (pageId: string, updates: Partial<Page>) => void;
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
  onPageUpdate,
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
  // Controlled tab state so AI panel can be closed programmatically
  const [activeTab, setActiveTab] = useState("components");

  // Panel widths
  const [leftPanelWidth, setLeftPanelWidth] = useState(280);
  const [rightPanelWidth, setRightPanelWidth] = useState(480);

  const isResizingRef = useRef<string | null>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startSizeRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;

      if (isResizingRef.current === "left") {
        const delta = e.clientX - startPosRef.current.x;
        setLeftPanelWidth(Math.max(200, Math.min(600, startSizeRef.current + delta)));
      } else if (isResizingRef.current === "right") {
        const delta = startPosRef.current.x - e.clientX;
        setRightPanelWidth(Math.max(300, Math.min(700, startSizeRef.current + delta)));
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

  const startResize = (type: string, e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = type;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startSizeRef.current = type === "left" ? leftPanelWidth : rightPanelWidth;
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
  };

  const selectedComponent =
    selectedComponentIds.length === 1
      ? findComponentById(components, selectedComponentIds[0])
      : null;

  const getCanvasWidth = () => {
    switch (viewport) {
      case "mobile": return "375px";
      case "tablet": return "768px";
      default: return "100%";
    }
  };

  const exportToZip = async (format: "html" | "react" = "html") => {
    try {
      setShowExportMenu(false);
      const zip = new JSZip();
      const pagesToExport = pages;
      const name = projectName || "my-website";

      if (format === "react") {
        const appFolder = zip.folder("app");
        const componentsFolder = zip.folder("components");
        const publicFolder = zip.folder("public");

        appFolder?.file("layout.tsx", generateAppLayout(name));
        appFolder?.file(
          "globals.css",
          `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root {\n  --foreground-rgb: 0, 0, 0;\n  --background-start-rgb: 214, 219, 220;\n  --background-end-rgb: 255, 255, 255;\n}\n\nbody {\n  color: rgb(var(--foreground-rgb));\n  background: linear-gradient(\n      to bottom,\n      transparent,\n      rgb(var(--background-end-rgb))\n    )\n    rgb(var(--background-start-rgb));\n}\n`,
        );

        for (let i = 0; i < pagesToExport.length; i++) {
          const page = pagesToExport[i];
          const pageName = page.name.replace(/\s+/g, "");
          if (page.slug === "index" || (i === 0 && !pagesToExport.some((p) => p.slug === "index"))) {
            appFolder?.file("page.tsx", generateAppPage(page.components, pageName, `${pageName} - ${name}`));
          } else {
            const slugPath = page.slug || page.name.toLowerCase().replace(/\s+/g, "-") || page.id;
            appFolder?.folder(slugPath)?.file("page.tsx", generateReactComponent(page.components, pageName));
          }
        }

        const componentNames = [
          "Header","Footer","Hero","Section","Container","Grid","Card","Button",
          "Text","Image","Video","Form","Navbar","Accordion","Tabs","Testimonial",
          "PricingCard","Feature","Stats","CTA","Divider","Spacer","Badge","Alert",
        ];
        for (const componentName of componentNames) {
          componentsFolder?.file(`${componentName}.tsx`, generateComponentImplementation(componentName));
        }
        componentsFolder?.file("index.ts", generateReactComponentsIndex());

        zip.file("package.json", generatePackageJson(name));
        zip.file("next.config.js", generateNextConfig());
        zip.file("tailwind.config.js", generateTailwindConfig());
        zip.file("README.md", generateREADME(name));
        zip.file("postcss.config.js", `/** @type {import('postcss-load-config').Config} */\nconst config = {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n}\n\nmodule.exports = config\n`);
        zip.file(".gitignore", `# dependencies\n/node_modules\n/.pnp\n.pnp.js\n\n# testing\n/coverage\n\n# next.js\n/.next/\n/out/\n\n# production\n/build\n\n# misc\n.DS_Store\n*.pem\n\n# debug\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\n\n# local env files\n.env*.local\n\n# vercel\n.vercel\n\n# typescript\n*.tsbuildinfo\nnext-env.d.ts\n`);
        zip.file(".eslintrc.json", JSON.stringify({ extends: "next/core-web-vitals" }, null, 2));
        zip.file("next-env.d.ts", `/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n\n// NOTE: This file should not be edited\n// see https://nextjs.org/docs/app/building-your-application/configuring/typescript for more information.\n`);
        zip.file("tsconfig.json", JSON.stringify({
          compilerOptions: {
            target: "ES2017", lib: ["dom", "dom.iterable", "esnext"],
            allowJs: true, skipLibCheck: true, strict: true, noEmit: true,
            esModuleInterop: true, module: "esnext", moduleResolution: "node",
            resolveJsonModule: true, isolatedModules: true, jsx: "preserve",
            incremental: true, plugins: [{ name: "next" }], paths: { "@/*": ["./*"] },
          },
          include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
          exclude: ["node_modules"],
        }, null, 2));
        publicFolder?.file(".gitkeep", "");
      } else {
        const css = generateCSS();
        const js = generateJS();
        for (const page of pagesToExport) {
          zip.file(`${page.slug || page.id}.html`, generateHTML(page.components, pagesToExport));
        }
        zip.file("styles.css", css);
        zip.file("script.js", js);
      }

      // Download the zip file
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
      <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
        {/* Top Header Bar — part of normal flex flow, not fixed */}
        <div className="flex-shrink-0 h-14 bg-card border-b border-border flex items-center px-4 justify-between z-50">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
                title="Close Editor"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="text-sm font-semibold tracking-wide">LAYR</div>
            </div>

            {/* Viewport Tabs */}
            <div className="flex items-center space-x-1 bg-background border border-border rounded-md p-1">
              {(["desktop", "tablet", "mobile"] as Viewport[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setViewport(v)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors rounded capitalize ${
                    viewport === v ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>PAGES</span>
              <span>/</span>
              <span className="text-foreground/70">INDEX / HERO SECTION</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">

            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
              title="Preview"
            >
              <Play className="w-4 h-4" />
            </button>
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-2 rounded-md transition-colors ${canUndo ? "hover:bg-muted text-muted-foreground hover:text-foreground" : "text-muted-foreground/50 cursor-not-allowed"}`}
              title="Undo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground">
              <Settings className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-border" />

            <button
              onClick={onSave}
              disabled={isSaving}
              className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                isSaving ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-xs font-medium transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              {showExportMenu && (
                <>
                  {/* Click-outside overlay */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-card rounded-lg shadow-xl border border-border overflow-hidden z-50">
                    <button
                      onClick={() => exportToZip("html")}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-muted transition-colors"
                    >
                      <div className="font-medium text-foreground">Export as HTML</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Static website</div>
                    </button>
                    <div className="h-px bg-border" />
                    <button
                      onClick={() => exportToZip("react")}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-muted transition-colors"
                    >
                      <div className="font-medium text-foreground">Export as React</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Next.js project</div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Left Sidebar */}
          {!isPreviewMode && (
            <>
              <div
                className="bg-card border-r border-border flex flex-col"
                style={{ width: `${leftPanelWidth}px`, flexShrink: 0, flexGrow: 0 }}
              >
                {/* Controlled Tabs — activeTab state drives everything */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full w-full">
                  <div className="flex-shrink-0 px-2 py-2 border-b border-border bg-card">
                    <TabsList className="w-full grid grid-cols-3 bg-muted gap-0.5 p-1 h-auto rounded-md border border-border">
                      <TabsTrigger
                        value="pages"
                        className="text-[10px] py-2 px-1 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground text-muted-foreground hover:text-foreground rounded-md transition-all font-semibold tracking-wide flex items-center justify-center h-auto"
                      >
                        <LayoutTemplate className="w-3 h-3 mr-1" />
                        PAGES
                      </TabsTrigger>
                      <TabsTrigger
                        value="layers"
                        className="text-[10px] py-2 px-1 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground text-muted-foreground hover:text-foreground rounded-md transition-all font-semibold tracking-wide flex items-center justify-center h-auto"
                      >
                        <Layers className="w-3 h-3 mr-1" />
                        LAYERS
                      </TabsTrigger>
                      <TabsTrigger
                        value="components"
                        className="text-[10px] py-2 px-1 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground text-muted-foreground hover:text-foreground rounded-md transition-all font-semibold tracking-wide flex items-center justify-center h-auto"
                      >
                        <FileBox className="w-3 h-3 mr-1" />
                        ASSETS
                      </TabsTrigger>
                    </TabsList>
                  </div>

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

                  <TabsContent value="layers" className="flex-1 min-h-0 m-0 p-0 border-none data-[state=inactive]:hidden overflow-y-auto">
                    <HierarchyPanel
                      components={components}
                      selectedComponentIds={selectedComponentIds}
                      onSelectComponent={onSelectComponent}
                      onDeleteComponent={onDeleteComponent}
                      onAddComponent={onAddComponent}
                    />
                  </TabsContent>

                  <TabsContent value="components" className="flex-1 min-h-0 m-0 p-0 border-none data-[state=inactive]:hidden overflow-y-auto">
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
                    className="flex-1 min-h-0 m-0 p-0 border-none data-[state=inactive]:hidden overflow-hidden flex flex-col"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card flex-shrink-0">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">AI Assistant</span>
                      </div>
                      {/* Plain button — no TabsTrigger nesting needed */}
                      <button
                        onClick={() => setActiveTab("components")}
                        className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
                        title="Close AI Assistant"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden">
                      <AIChatPanel
                        onApplyComponents={onApplyAIComponents || (() => {})}
                        onApplyPages={onApplyAIPages || (() => {})}
                        existingComponents={components}
                        customComponents={customComponents}
                        globalComponents={globalComponents}
                        messages={chatHistory}
                        onMessagesChange={onChatHistoryChange}
                      />
                    </div>
                  </TabsContent>

                  {/* Bottom AI trigger */}
                  <div className="flex-shrink-0 p-2 border-t border-border">
                    <button
                      onClick={() => setActiveTab("ai")}
                      className={`w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-md transition-colors text-xs font-semibold ${
                        activeTab === "ai"
                          ? "bg-primary/20 text-primary"
                          : "bg-primary/10 hover:bg-primary/15 text-primary/70"
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>AI ASSISTANT</span>
                      <span className="text-[10px] bg-primary/20 px-1.5 py-0.5 rounded">⌘K</span>
                    </button>
                  </div>
                </Tabs>
              </div>

              {/* Left Resize Handle */}
              <div
                className="w-[1px] bg-border hover:bg-primary cursor-ew-resize transition-colors flex-shrink-0 z-10"
                onMouseDown={(e) => startResize("left", e)}
              />
            </>
          )}

          {/* Canvas Area */}
          <div className="flex-1 min-w-0 bg-background overflow-auto" style={{ flexShrink: 1, flexGrow: 1 }}>
            <div className={`h-full overflow-auto transition-all duration-300 ${isPreviewMode ? "bg-white p-0" : "bg-background p-8"} light`}>
              <div
                className="transition-all duration-300 ease-in-out mx-auto"
                style={{
                  width: getCanvasWidth(),
                  maxWidth: viewport === "desktop" ? (isPreviewMode ? "none" : "1200px") : getCanvasWidth(),
                  minHeight: "100%",
                }}
              >
                <Canvas
                  components={components}
                  selectedComponentIds={isPreviewMode ? [] : selectedComponentIds}
                  onSelectComponent={isPreviewMode ? () => {} : onSelectComponent}
                  onUpdateComponent={onUpdateComponent}
                  viewport={viewport}
                  isPreviewMode={isPreviewMode}
                  onNavigate={(slug) => {
                    const targetPage = pages.find((p) => p.slug === slug);
                    if (targetPage) onPageSelect(targetPage.id);
                  }}
                  pages={pages}
                  showOutlines={!isPreviewMode && showOutlines}
                  pageBackground={pages.find(p => p.id === currentPageId)}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          {!isPreviewMode && (
            <>
              <div
                className="w-[1px] bg-border hover:bg-primary cursor-ew-resize transition-colors flex-shrink-0 z-10"
                onMouseDown={(e) => startResize("right", e)}
              />
              <div
                className="bg-card border-l border-border flex flex-col overflow-hidden"
                style={{ width: `${rightPanelWidth}px`, flexShrink: 0, flexGrow: 0 }}
              >
                <PropertiesPanel
                  selectedComponent={selectedComponent}
                  onUpdateComponent={onUpdateComponent}
                  onDeleteComponent={onDeleteComponent}
                  onDuplicateComponent={onDuplicateComponent}
                  pages={pages}
                  currentPage={pages.find(p => p.id === currentPageId)}
                  onUpdatePage={(updates) => onPageUpdate?.(currentPageId, updates)}
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
    if (component.id === id) return component;
    const found = findComponentById(component.children, id);
    if (found) return found;
  }
  return null;
}