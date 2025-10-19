"use client";

import { useDroppable } from "@dnd-kit/core";
import { ComponentDefinition } from "@/types/editor";
import { COMPONENT_REGISTRY } from "@/components/builder";
import { cn } from "@/lib/utils";

interface CanvasProps {
  components: ComponentDefinition[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
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
        className
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
  selectedComponentId,
  onSelectComponent,
}: {
  component: ComponentDefinition;
  isSelected: boolean;
  onSelect: () => void;
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
}) {
  const Component =
    COMPONENT_REGISTRY[component.type as keyof typeof COMPONENT_REGISTRY];

  if (!Component) {
    return (
      <div className="p-4 border-2 border-red-300 bg-red-50 rounded">
        <p className="text-red-600">Unknown component: {component.type}</p>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Drop zone before */}
      <DropZone targetId={component.id} position="before" />

      {/* Component wrapper */}
      <div
        className={cn(
          "relative transition-all duration-200",
          isSelected && "ring-2 ring-blue-500 ring-offset-2",
          "hover:ring-1 hover:ring-blue-300 hover:ring-offset-1"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {/* Selection overlay */}
        {isSelected && (
          <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded z-10">
            {component.type}
          </div>
        )}

        {/* Render component with or without children */}
        {canHaveChildren(component.type) ? (
          <Component {...component.props}>
            {component.children.length > 0 && (
              <div>
                {component.children.map((child, index) => (
                  <div key={child.id}>
                    <ComponentRenderer
                      component={child}
                      selectedComponentId={selectedComponentId}
                      onSelectComponent={onSelectComponent}
                    />
                    {index < component.children.length - 1 && (
                      <DropZone targetId={component.id} position="inside" />
                    )}
                  </div>
                ))}
                <DropZone targetId={component.id} position="inside" />
              </div>
            )}

            {/* Drop zone for empty containers */}
            {component.children.length === 0 && (
              <DropZone
                targetId={component.id}
                position="inside"
                className="min-h-[60px] m-4"
              />
            )}
          </Component>
        ) : (
          // For leaf components (Image, Button, Text, etc.) that don't have children
          <Component {...component.props} />
        )}
      </div>

      {/* Drop zone after */}
      <DropZone targetId={component.id} position="after" />
    </div>
  );
}

function ComponentRenderer({
  component,
  selectedComponentId,
  onSelectComponent,
}: {
  component: ComponentDefinition;
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
}) {
  return (
    <ComponentWrapper
      component={component}
      isSelected={selectedComponentId === component.id}
      onSelect={() => onSelectComponent(component.id)}
      selectedComponentId={selectedComponentId}
      onSelectComponent={onSelectComponent}
    />
  );
}

export function Canvas({
  components,
  selectedComponentId,
  onSelectComponent,
}: CanvasProps) {
  return (
    <div
      className="bg-white rounded-lg shadow-sm min-h-[800px] w-full p-4"
      onClick={() => onSelectComponent(null)}
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
          {/* Render components */}
          {components.map((component) => (
            <ComponentRenderer
              key={component.id}
              component={component}
              selectedComponentId={selectedComponentId}
              onSelectComponent={onSelectComponent}
            />
          ))}

          {/* Final drop zone */}
          <DropZone targetId={undefined} position="inside" />
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
