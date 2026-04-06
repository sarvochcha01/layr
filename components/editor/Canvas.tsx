"use client";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { ComponentDefinition } from "@/types/editor";
import { COMPONENT_REGISTRY } from "@/components/builder";
import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";

interface CanvasProps {
  components: ComponentDefinition[];
  selectedComponentIds: string[];
  onSelectComponent: (id: string | null) => void;
  viewport?: "desktop" | "tablet" | "mobile";
  isPreviewMode?: boolean;
  onNavigate?: (slug: string) => void;
  pages?: any[];
}

function DropZone({
  targetId,
  position,
  className,
  emptyStateText,
}: {
  targetId?: string;
  position: "before" | "after" | "inside";
  className?: string;
  emptyStateText?: string;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `drop-zone-${targetId || "root"}-${position}`,
    data: {
      type: "drop-zone",
      targetId,
      position,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "transition-all duration-200",
        isOver
          ? "bg-blue-100 border-2 border-dashed border-blue-400 min-h-[40px]"
          : "min-h-[8px] border-2 border-transparent",
        className,
      )}
    >
      {isOver ? (
        <div className="flex items-center justify-center h-full text-blue-600 text-sm font-medium">
          Drop component here
        </div>
      ) : (
        emptyStateText && (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            {emptyStateText}
          </div>
        )
      )}
    </div>
  );
}

function ComponentWrapper({
  component,
  isSelected,
  onSelect,
  selectedComponentIds,
  onSelectComponent,
  viewport,
  isPreviewMode,
  onNavigate,
  pages,
}: {
  component: ComponentDefinition;
  isSelected: boolean;
  onSelect: () => void;
  selectedComponentIds: string[];
  onSelectComponent: (id: string) => void;
  viewport?: "desktop" | "tablet" | "mobile";
  isPreviewMode?: boolean;
  onNavigate?: (slug: string) => void;
  pages?: any[];
}) {
  const Component =
    COMPONENT_REGISTRY[component.type as keyof typeof COMPONENT_REGISTRY];

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `canvas-${component.id}`,
    data: {
      type: "canvas-item",
      componentId: component.id,
      componentType: component.type,
    },
    disabled: isPreviewMode,
  });

  if (!Component) {
    return (
      <div className="p-4 border-2 border-red-300 bg-red-50 rounded">
        <p className="text-red-600">Unknown component: {component.type}</p>
      </div>
    );
  }

  // Components that should take full width
  const fullWidthComponents = [
    "Accordion",
    "Navbar",
    "Footer",
    "Header",
    "Container",
    "Section",
    "Grid",
    "Divider",
  ];
  const shouldTakeFullWidth = fullWidthComponents.includes(component.type);

  // Components that should take full height (for flex stretch)
  const fullHeightComponents = [
    "PricingCard",
    "Card",
    "Feature",
    "Testimonial",
  ];
  const shouldTakeFullHeight = fullHeightComponents.includes(component.type);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative group",
        shouldTakeFullHeight && "flex self-stretch",
        shouldTakeFullWidth && "w-full",
        isDragging && "opacity-40"
      )}
    >
      {/* Component wrapper — receives inline styles from properties panel */}
      <div
        className={cn(
          "relative transition-all duration-200",
          shouldTakeFullHeight && "flex flex-1",
          shouldTakeFullWidth && "w-full",
          !isPreviewMode && isSelected && "ring-2 ring-blue-500 ring-offset-2",
          !isPreviewMode &&
            "hover:ring-1 hover:ring-blue-300 hover:ring-offset-1",
        )}
        onClick={
          isPreviewMode
            ? undefined
            : (e) => {
                e.stopPropagation();
                onSelect();
              }
        }
      >
        {/* Selection overlay and DRAG HANDLE */}
        {!isPreviewMode && isSelected && (
          <div 
            {...listeners} 
            {...attributes} 
            className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded z-10 cursor-grab active:cursor-grabbing hover:bg-blue-600 transition-colors"
            title="Drag to move this component"
          >
            <div className="flex items-center gap-1">
              <span className="opacity-75">⋮⋮</span>
              {component.type}
            </div>
          </div>
        )}

        {/* Render component with or without children */}
        {canHaveChildren(component.type) ? (
          <Component
            {...component.props}
            viewport={viewport}
            isPreviewMode={isPreviewMode}
            onNavigate={onNavigate}
            pages={pages}
          >
            {component.children.length > 0 &&
              (component.type === "Grid" || component.type === "Container" ? (
                // Grid & Container: render children without wrapper divs to preserve layout
                <>
                  {component.children.map((child) => (
                    <ComponentRenderer
                      key={child.id}
                      component={child}
                      selectedComponentIds={selectedComponentIds}
                      onSelectComponent={onSelectComponent}
                      viewport={viewport}
                      isPreviewMode={isPreviewMode}
                      onNavigate={onNavigate}
                      pages={pages}
                    />
                  ))}
                </>
              ) : (
                // Other containers: render with wrapper divs and drop zones
                <div>
                  {component.children.map((child, index) => (
                    <div key={child.id}>
                      <ComponentRenderer
                        component={child}
                        selectedComponentIds={selectedComponentIds}
                        onSelectComponent={onSelectComponent}
                        viewport={viewport}
                        isPreviewMode={isPreviewMode}
                        onNavigate={onNavigate}
                        pages={pages}
                      />
                      {!isPreviewMode &&
                        index < component.children.length - 1 && (
                          <DropZone targetId={component.id} position="inside" />
                        )}
                    </div>
                  ))}
                  {!isPreviewMode && (
                    <DropZone targetId={component.id} position="inside" />
                  )}
                </div>
              ))}

            {/* Drop zone for empty containers */}
            {!isPreviewMode && component.children.length === 0 && (
              <DropZone
                targetId={component.id}
                position="inside"
                className="min-h-[60px] m-4"
              />
            )}
          </Component>
        ) : (
          // For leaf components (Image, Button, Text, etc.) that don't have children
          <Component
            {...component.props}
            viewport={viewport}
            isPreviewMode={isPreviewMode}
            onNavigate={onNavigate}
            pages={pages}
          />
        )}
      </div>
    </div>
  );
}

function ComponentRenderer({
  component,
  selectedComponentIds,
  onSelectComponent,
  viewport,
  isPreviewMode,
  onNavigate,
  pages,
}: {
  component: ComponentDefinition;
  selectedComponentIds: string[];
  onSelectComponent: (id: string) => void;
  viewport?: "desktop" | "tablet" | "mobile";
  isPreviewMode?: boolean;
  onNavigate?: (slug: string) => void;
  pages?: any[];
}) {
  return (
    <ComponentWrapper
      component={component}
      isSelected={selectedComponentIds.includes(component.id)}
      onSelect={() => onSelectComponent(component.id)}
      selectedComponentIds={selectedComponentIds}
      onSelectComponent={onSelectComponent}
      viewport={viewport}
      isPreviewMode={isPreviewMode}
      onNavigate={onNavigate}
      pages={pages}
    />
  );
}

export function Canvas({
  components,
  selectedComponentIds,
  onSelectComponent,
  viewport = "desktop",
  isPreviewMode = false,
  onNavigate,
  pages,
}: CanvasProps) {
  return (
    <div
      className={`bg-white w-full editor-canvas ${
        isPreviewMode
          ? "min-h-screen"
          : "rounded-lg shadow-sm min-h-[800px] p-4"
      }`}
      onClick={isPreviewMode ? undefined : () => onSelectComponent(null)}
      tabIndex={isPreviewMode ? undefined : 0}
    >
      {components.length === 0 ? (
        /* Empty state - single drop zone */
        <DropZone
          targetId={undefined}
          position="inside"
          className="min-h-[200px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg"
          emptyStateText="Drag components here to start building"
        />
      ) : (
        <>
          <div className="space-y-4">
            {/* Initial drop zone at the top */}
            {!isPreviewMode && (
              <DropZone targetId={undefined} position="before" />
            )}

            {/* Render components with drop zones between them */}
            {components.map((component, index) => (
              <div key={component.id}>
                <ComponentRenderer
                  component={component}
                  selectedComponentIds={selectedComponentIds}
                  onSelectComponent={onSelectComponent}
                  viewport={viewport}
                  isPreviewMode={isPreviewMode}
                  onNavigate={onNavigate}
                  pages={pages}
                />

                {/* Drop zone after each component */}
                {!isPreviewMode && index < components.length - 1 && (
                  <DropZone targetId={component.id} position="after" />
                )}
              </div>
            ))}
          </div>

          {/* Final drop zone at the bottom */}
          {!isPreviewMode && (
            <DropZone targetId={undefined} position="inside" className="mt-4" />
          )}
        </>
      )}
    </div>
  );
}

function canHaveChildren(componentType: string): boolean {
  const containerComponents = [
    "Header",
    "Footer",
    "Section",
    "Container",
    "Grid",
    "Card",
  ];
  return containerComponents.includes(componentType);
}
