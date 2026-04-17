"use client";
import React from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { ComponentDefinition } from "@/types/editor";
import { COMPONENT_REGISTRY } from "@/components/builder";
import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";
import { ResizableWrapper } from "./ResizableWrapper";
import { useCtrlDrag } from "@/hooks/useCtrlDrag";
import { useCanvasZoom } from "@/hooks/useCanvasZoom";

interface CanvasProps {
  components: ComponentDefinition[];
  selectedComponentIds: string[];
  onSelectComponent: (id: string | null) => void;
  onSelectMultiple?: (ids: string[]) => void;
  onUpdateComponent?: (id: string, updates: Record<string, any>) => void;
  onRepositionComponent?: (componentId: string, targetId: string | null, position: "top" | "bottom" | "left" | "right" | "center" | "inside") => void;
  viewport?: "desktop" | "tablet" | "mobile";
  isPreviewMode?: boolean;
  onNavigate?: (slug: string) => void;
  pages?: any[];
  currentPageSlug?: string;
  showOutlines?: boolean;
  outlineColor?: "black" | "white";
  showComponentTags?: boolean;
  pageBackground?: {
    backgroundColor?: string;
    backgroundType?: "solid" | "gradient" | "image";
    backgroundGradient?: string;
    backgroundImageUrl?: string;
    backgroundSize?: string;
    backgroundPosition?: string;
  };
  onZoomChange?: (zoom: number, pan: { x: number; y: number }) => void;
  onComponentDoubleClick?: (componentId: string) => void;
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
          ? "bg-primary/10 border-2 border-dashed border-primary min-h-[40px]"
          : "min-h-[8px] border-2 border-transparent",
        className,
      )}
    >
      {isOver ? (
        <div className="flex items-center justify-center h-full text-primary text-sm font-medium">
          Drop component here
        </div>
      ) : (
        emptyStateText && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
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
  onSelectMultiple,
  onUpdateComponent,
  viewport,
  isPreviewMode,
  onNavigate,
  pages,
  currentPageSlug,
  showOutlines,
  outlineColor,
  showComponentTags,
  onComponentDoubleClick,
}: {
  component: ComponentDefinition;
  isSelected: boolean;
  onSelect: () => void;
  selectedComponentIds: string[];
  onSelectComponent: (id: string) => void;
  onSelectMultiple?: (ids: string[]) => void;
  onUpdateComponent?: (id: string, updates: Record<string, any>) => void;
  viewport?: "desktop" | "tablet" | "mobile";
  isPreviewMode?: boolean;
  onNavigate?: (slug: string) => void;
  pages?: any[];
  currentPageSlug?: string;
  showOutlines?: boolean;
  outlineColor?: "black" | "white";
  showComponentTags?: boolean;
  onComponentDoubleClick?: (componentId: string) => void;
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

  const handleResize = (id: string, updates: { width?: string; height?: string }) => {
    if (onUpdateComponent) {
      onUpdateComponent(id, updates);
    }
  };

  // Simple click handler - delegates to parent for multi-select logic
  const handleClick = (e: React.MouseEvent) => {
    if (isPreviewMode) return;
    
    e.stopPropagation();
    
    // Check if Ctrl/Cmd is held for multi-select
    if (e.ctrlKey || e.metaKey) {
      if (onSelectMultiple) {
        // Toggle this component in selection
        const currentlySelected = selectedComponentIds.includes(component.id);
        if (currentlySelected) {
          // Remove from selection
          const newSelection = selectedComponentIds.filter(id => id !== component.id);
          if (newSelection.length > 0) {
            onSelectMultiple(newSelection);
          } else {
            onSelectComponent(component.id); // Keep at least one selected
          }
        } else {
          // Add to selection
          onSelectMultiple([...selectedComponentIds, component.id]);
        }
      }
    } else {
      // Normal click: select only this component
      onSelect();
    }
  };

  return (
    <div
      ref={setNodeRef}
      data-component-id={component.id}
      data-component-type={component.type}
      className={cn(
        "relative group min-w-0",
        shouldTakeFullHeight && "flex self-stretch",
        shouldTakeFullWidth && "w-full",
        isDragging && "opacity-40",
      )}
    >
      {/* Component wrapper — receives inline styles from properties panel */}
      <ResizableWrapper
        componentId={component.id}
        isSelected={isSelected}
        isPreviewMode={!!isPreviewMode}
        currentWidth={component.props.width}
        currentHeight={component.props.height}
        onResize={handleResize}
        className={cn(
          "relative transition-all duration-200",
          shouldTakeFullHeight && "flex flex-1",
          shouldTakeFullWidth && "w-full",
          !isPreviewMode && isSelected && "ring-2 ring-blue-500 ring-offset-2",
          !isPreviewMode &&
            "hover:ring-1 hover:ring-blue-300 hover:ring-offset-1",
          !isPreviewMode &&
            showOutlines &&
            !isSelected &&
            (outlineColor === "white" 
              ? "outline outline-1 outline-dashed outline-white" 
              : "outline outline-1 outline-dashed outline-black"),
        )}
      >
        <div
          onClick={
            isPreviewMode
              ? undefined
              : handleClick
          }
          onDoubleClick={
            isPreviewMode
              ? undefined
              : (e) => {
                  e.stopPropagation();
                  if (onComponentDoubleClick) {
                    onComponentDoubleClick(component.id);
                  }
                }
          }
        >
        {/* Selection overlay and DRAG HANDLE */}
        {!isPreviewMode && showComponentTags && (
          <div
            {...listeners}
            {...attributes}
            className={cn(
              "absolute -top-6 left-0 text-xs px-2 py-1 rounded z-10 transition-colors",
              isSelected 
                ? "bg-primary text-primary-foreground cursor-grab active:cursor-grabbing hover:bg-primary/90" 
                : "bg-muted text-muted-foreground cursor-pointer hover:bg-muted/80"
            )}
            title={isSelected ? "Drag to move this component" : "Click to select"}
            onClick={(e) => {
              if (!isSelected) {
                e.stopPropagation();
                onSelect();
              }
            }}
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
            currentPageSlug={currentPageSlug}
          >
            {component.children.length > 0 &&
              (component.type === "Grid" || component.type === "Container" ? (
                // Grid & Container: render children without wrapper divs to preserve layout
                // but still include drop zones when in edit mode
                <>
                  {component.children.map((child, index) => (
                    <React.Fragment key={child.id}>
                      <ComponentRenderer
                        component={child}
                        selectedComponentIds={selectedComponentIds}
                        onSelectComponent={onSelectComponent}
                        onSelectMultiple={onSelectMultiple}
                        onUpdateComponent={onUpdateComponent}
                        viewport={viewport}
                        isPreviewMode={isPreviewMode}
                        onNavigate={onNavigate}
                        pages={pages}
                        currentPageSlug={currentPageSlug}
                        showOutlines={showOutlines}
                        outlineColor={outlineColor}
                        showComponentTags={showComponentTags}
                        onComponentDoubleClick={onComponentDoubleClick}
                      />
                    </React.Fragment>
                  ))}
                  {/* Trailing drop zone so users can always add more children */}
                  {!isPreviewMode && (
                    <DropZone
                      targetId={component.id}
                      position="inside"
                      className="min-h-[60px] rounded-md"
                    />
                  )}
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
                        onSelectMultiple={onSelectMultiple}
                        onUpdateComponent={onUpdateComponent}
                        viewport={viewport}
                        isPreviewMode={isPreviewMode}
                        onNavigate={onNavigate}
                        pages={pages}
                        currentPageSlug={currentPageSlug}
                        showOutlines={showOutlines}
                        outlineColor={outlineColor}
                        showComponentTags={showComponentTags}
                        onComponentDoubleClick={onComponentDoubleClick}
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
            currentPageSlug={currentPageSlug}
          />
        )}
        </div>
      </ResizableWrapper>
    </div>
  );
}

function ComponentRenderer({
  component,
  selectedComponentIds,
  onSelectComponent,
  onSelectMultiple,
  onUpdateComponent,
  viewport,
  isPreviewMode,
  onNavigate,
  pages,
  currentPageSlug,
  showOutlines,
  outlineColor,
  showComponentTags,
  onComponentDoubleClick,
}: {
  component: ComponentDefinition;
  selectedComponentIds: string[];
  onSelectComponent: (id: string) => void;
  onSelectMultiple?: (ids: string[]) => void;
  onUpdateComponent?: (id: string, updates: Record<string, any>) => void;
  viewport?: "desktop" | "tablet" | "mobile";
  isPreviewMode?: boolean;
  onNavigate?: (slug: string) => void;
  pages?: any[];
  currentPageSlug?: string;
  showOutlines?: boolean;
  outlineColor?: "black" | "white";
  showComponentTags?: boolean;
  onComponentDoubleClick?: (componentId: string) => void;
}) {
  return (
    <ComponentWrapper
      component={component}
      isSelected={selectedComponentIds.includes(component.id)}
      onSelect={() => onSelectComponent(component.id)}
      selectedComponentIds={selectedComponentIds}
      onSelectComponent={onSelectComponent}
      onSelectMultiple={onSelectMultiple}
      onUpdateComponent={onUpdateComponent}
      viewport={viewport}
      isPreviewMode={isPreviewMode}
      onNavigate={onNavigate}
      pages={pages}
      currentPageSlug={currentPageSlug}
      showOutlines={showOutlines}
      outlineColor={outlineColor}
      showComponentTags={showComponentTags}
      onComponentDoubleClick={onComponentDoubleClick}
    />
  );
}

export function Canvas({
  components,
  selectedComponentIds,
  onSelectComponent,
  onSelectMultiple,
  onUpdateComponent,
  onRepositionComponent,
  viewport = "desktop",
  isPreviewMode = false,
  onNavigate,
  pages,
  currentPageSlug,
  showOutlines = false,
  outlineColor = "black",
  showComponentTags = true,
  pageBackground,
  onZoomChange,
  onComponentDoubleClick,
}: CanvasProps) {
  // Ctrl+Click drag functionality
  const { isDragging, draggedComponentId } = useCtrlDrag({
    isEnabled: !isPreviewMode,
    onDragStart: (componentId) => {
      console.log('🎯 Ctrl+Drag started for component:', componentId);
    },
    onDragEnd: (componentId, targetId, position) => {
      console.log('🎯 Ctrl+Drag ended:', { componentId, targetId, position });
      if (onRepositionComponent && targetId) {
        console.log('🎯 Calling onRepositionComponent...');
        onRepositionComponent(componentId, targetId, position);
      } else {
        console.log('⚠️ onRepositionComponent not available or no targetId');
      }
    },
  });

  // Canvas zoom and pan functionality (controlled externally)
  const { zoom, pan, isPanning } = useCanvasZoom({
    isEnabled: !isPreviewMode,
    minZoom: 0.25,
    maxZoom: 2,
    zoomSpeed: 0.1,
  });

  // Notify parent of zoom changes
  React.useEffect(() => {
    if (onZoomChange) {
      onZoomChange(zoom, pan);
    }
  }, [zoom, pan, onZoomChange]);

  // Add Ctrl key detection for cursor change
  React.useEffect(() => {
    if (isPreviewMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        document.body.classList.add('ctrl-drag-mode');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        document.body.classList.remove('ctrl-drag-mode');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.body.classList.remove('ctrl-drag-mode');
    };
  }, [isPreviewMode]);

  // Build page background style
  const pageStyle: React.CSSProperties = {};
  
  if (pageBackground) {
    const bgType = pageBackground.backgroundType || "solid";
    
    if (bgType === "solid") {
      pageStyle.backgroundColor = pageBackground.backgroundColor || "#ffffff";
    } else if (bgType === "gradient" && pageBackground.backgroundGradient) {
      pageStyle.backgroundImage = pageBackground.backgroundGradient;
    } else if (bgType === "image" && pageBackground.backgroundImageUrl) {
      pageStyle.backgroundImage = `url(${pageBackground.backgroundImageUrl})`;
      pageStyle.backgroundSize = pageBackground.backgroundSize || "cover";
      pageStyle.backgroundPosition = pageBackground.backgroundPosition || "center";
      pageStyle.backgroundRepeat = "no-repeat";
    }
  } else {
    // Default to white background when no pageBackground is provided
    pageStyle.backgroundColor = "#ffffff";
  }

  return (
    <div
      className={`w-full editor-canvas ${
        isPreviewMode
          ? "min-h-screen"
          : "editor-canvas-container rounded-lg shadow-sm min-h-[800px] p-4"
      }`}
      style={pageStyle}
      onClick={isPreviewMode ? undefined : () => onSelectComponent(null)}
      tabIndex={isPreviewMode ? undefined : 0}
    >
      {/* Canvas wrapper */}
      <div>
      {/* Canvas content with zoom and pan - only apply transform in edit mode */}
      <div
        style={
          isPreviewMode
            ? undefined
            : {
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isPanning ? 'none' : 'transform 0.1s ease-out',
              }
        }
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
                    onSelectMultiple={onSelectMultiple}
                    onUpdateComponent={onUpdateComponent}
                    viewport={viewport}
                    isPreviewMode={isPreviewMode}
                    onNavigate={onNavigate}
                    pages={pages}
                    currentPageSlug={currentPageSlug}
                    showOutlines={showOutlines}
                    outlineColor={outlineColor}
                    showComponentTags={showComponentTags}
                    onComponentDoubleClick={onComponentDoubleClick}
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
      </div>
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
