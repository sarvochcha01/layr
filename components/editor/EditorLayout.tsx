"use client";

import { useState } from "react";
import { ComponentDefinition } from "@/types/editor";
import { HierarchyPanel } from "./HierarchyPanel";
import { ComponentPalette } from "./ComponentPalette";
import { Canvas } from "./Canvas";
import { PropertiesPanel } from "./PropertiesPanel";

type Viewport = "desktop" | "tablet" | "mobile";

interface EditorLayoutProps {
  components: ComponentDefinition[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (id: string, updates: Record<string, any>) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
}

export function EditorLayout({
  components,
  selectedComponentId,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  onDuplicateComponent,
}: EditorLayoutProps) {
  const [viewport, setViewport] = useState<Viewport>("desktop");

  const selectedComponent = selectedComponentId
    ? findComponentById(components, selectedComponentId)
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

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Panel - Split between Hierarchy and Components */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
        {/* Hierarchy Panel - Top Half */}
        <div className="flex-1 border-b border-gray-200 min-h-0 overflow-hidden">
          <HierarchyPanel
            components={components}
            selectedComponentId={selectedComponentId}
            onSelectComponent={onSelectComponent}
            onDeleteComponent={onDeleteComponent}
          />
        </div>

        {/* Component Palette - Bottom Half */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ComponentPalette />
        </div>
      </div>

      {/* Canvas - Center */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Canvas</span>
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
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          <div
            className="mx-auto transition-all duration-300 ease-in-out"
            style={{
              width: getCanvasWidth(),
              maxWidth: viewport === "desktop" ? "1200px" : getCanvasWidth(),
            }}
          >
            <Canvas
              components={components}
              selectedComponentId={selectedComponentId}
              onSelectComponent={onSelectComponent}
            />
          </div>
        </div>
      </div>

      {/* Properties Panel - Right */}
      <div className="w-80 bg-white border-l border-gray-200 h-full overflow-hidden">
        <PropertiesPanel
          selectedComponent={selectedComponent}
          onUpdateComponent={onUpdateComponent}
          onDeleteComponent={onDeleteComponent}
          onDuplicateComponent={onDuplicateComponent}
        />
      </div>
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
