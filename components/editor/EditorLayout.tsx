"use client";

import { useState } from "react";
import { ComponentDefinition, Page } from "@/types/editor";
import { HierarchyPanel } from "./HierarchyPanel";
import { ComponentPalette } from "./ComponentPalette";
import { Canvas } from "./Canvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { PagesPanel } from "./PagesPanel";
import { Download, Eye, Edit, X } from "lucide-react";
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
}: EditorLayoutProps) {
  const router = useRouter();
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(projectName || "");

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

  const exportToZip = async () => {
    try {
      // Call the export API with pages
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pages }),
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
      a.download = "website-export.zip";
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
        <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">
          {/* Pages Panel */}
          <div className="h-64 border-b border-gray-200 flex-shrink-0 overflow-hidden">
            <PagesPanel
              pages={pages}
              currentPageId={currentPageId}
              onPageSelect={onPageSelect}
              onPageAdd={onPageAdd}
              onPageDelete={onPageDelete}
              onPageRename={(id, name, slug) => {
                // TODO: Implement page rename
              }}
            />
          </div>

          {/* Hierarchy Panel */}
          <div className="flex-1 border-b border-gray-200 min-h-0 overflow-hidden">
            <HierarchyPanel
              components={components}
              selectedComponentIds={selectedComponentIds}
              onSelectComponent={onSelectComponent}
              onDeleteComponent={onDeleteComponent}
              onAddComponent={onAddComponent}
            />
          </div>

          {/* Component Palette */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ComponentPalette />
          </div>
        </div>
      )}

      {/* Canvas - Center */}
      <div className="flex-1 flex flex-col" style={{ minWidth: 0 }}>
        {/* Toolbar */}
        <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4 justify-between">
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
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewport("desktop")}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  viewport === "desktop"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Desktop
              </button>
              <button
                onClick={() => setViewport("tablet")}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  viewport === "tablet"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Tablet
              </button>
              <button
                onClick={() => setViewport("mobile")}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  viewport === "mobile"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Mobile
              </button>
            </div>

            {/* Viewport indicator */}
            <div className="text-xs text-gray-500 ml-4">
              {viewport === "desktop" && "1200px+"}
              {viewport === "tablet" && "768px"}
              {viewport === "mobile" && "375px"}
            </div>
          </div>

          {/* Preview & Export Buttons */}
          <div className="ml-auto flex items-center space-x-2">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`flex items-center space-x-2 px-3 py-1 text-xs rounded transition-colors ${
                isPreviewMode
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {isPreviewMode ? (
                <>
                  <Edit className="w-3 h-3" />
                  <span>Edit</span>
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </>
              )}
            </button>

            <button
              onClick={exportToZip}
              className="flex items-center space-x-2 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>
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
            />
          </div>
        </div>
      </div>

      {/* Properties Panel - Right */}
      {!isPreviewMode && (
        <div className="w-80 flex-shrink-0 bg-white border-l border-gray-200 h-full overflow-hidden">
          <PropertiesPanel
            selectedComponent={selectedComponent}
            onUpdateComponent={onUpdateComponent}
            onDeleteComponent={onDeleteComponent}
            onDuplicateComponent={onDuplicateComponent}
            pages={pages}
          />
        </div>
      )}
    </div>
  );
}

function findComponentById(
  components: ComponentDefinition[],
  id: string
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
