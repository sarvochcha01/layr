"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { EditorLayout } from "@/components/editor/EditorLayout";
import { ComponentDefinition } from "@/types/editor";
import { generateId } from "@/lib/utils";

export default function EditorPage() {
  const [components, setComponents] = useState<ComponentDefinition[]>([
    {
      id: "header-1",
      type: "Header",
      props: {
        sticky: true,
        shadow: true,
      },
      children: [
        {
          id: "navbar-1",
          type: "Navbar",
          props: {
            logoText: "My Website",
            links: [
              { text: "Home", href: "#" },
              { text: "About", href: "#" },
              { text: "Contact", href: "#" },
            ],
            ctaText: "Get Started",
            ctaLink: "#",
          },
          children: [],
        },
      ],
    },
    {
      id: "hero-1",
      type: "Hero",
      props: {
        title: "Welcome to My Website",
        description: "Build amazing websites with our drag and drop editor",
        primaryButtonText: "Get Started",
        backgroundColor: "#f8fafc",
      },
      children: [],
    },
  ]);

  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    null
  );
  const [draggedComponent, setDraggedComponent] = useState<any>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setDraggedComponent(event.active.data.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setDraggedComponent(null);
      return;
    }

    // Handle adding new component from palette
    if (active.data.current?.type === "palette-item") {
      const componentType = active.data.current.componentType;
      const newComponent: ComponentDefinition = {
        id: generateId(),
        type: componentType,
        props: getDefaultProps(componentType),
        children: [],
      };

      if (over.data.current?.type === "drop-zone") {
        const targetId = over.data.current.targetId;
        const position = over.data.current.position;

        setComponents((prev) =>
          insertComponent(prev, newComponent, targetId, position)
        );
      }
    }

    // Handle reordering existing components
    if (active.data.current?.type === "component") {
      // Implementation for reordering components
      console.log("Reordering component:", active.id, "to:", over.id);
    }

    setDraggedComponent(null);
  };

  const updateComponent = (
    componentId: string,
    updates: Partial<ComponentDefinition["props"]>
  ) => {
    setComponents((prev) => updateComponentInTree(prev, componentId, updates));
  };

  const deleteComponent = (componentId: string) => {
    setComponents((prev) => removeComponentFromTree(prev, componentId));
    // Clear selection if deleted component was selected
    if (selectedComponentId === componentId) {
      setSelectedComponentId(null);
    }
  };

  const duplicateComponent = (componentId: string) => {
    setComponents((prev) => duplicateComponentInTree(prev, componentId));
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <EditorLayout
        components={components}
        selectedComponentId={selectedComponentId}
        onSelectComponent={setSelectedComponentId}
        onUpdateComponent={updateComponent}
        onDeleteComponent={deleteComponent}
        onDuplicateComponent={duplicateComponent}
      />

      <DragOverlay>
        {draggedComponent ? (
          <div className="bg-white border-2 border-blue-500 rounded-lg p-3 shadow-xl flex flex-col items-center space-y-2 min-w-[100px]">
            <span className="text-2xl">
              {getComponentIcon(
                draggedComponent.componentType || draggedComponent.type
              )}
            </span>
            <span className="text-xs font-medium text-gray-900">
              {draggedComponent.componentType || draggedComponent.type}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// Helper functions
function getComponentIcon(type: string): string {
  const icons: Record<string, string> = {
    Header: "📦",
    Footer: "🦶",
    Hero: "🎯",
    Section: "📄",
    Container: "📦",
    Grid: "🏗️",
    Card: "🃏",
    Button: "🔘",
    Text: "📝",
    Image: "🖼️",
    Video: "🎥",
    Form: "📋",
    Navbar: "🧭",
  };
  return icons[type] || "📦";
}

function getDefaultProps(componentType: string): Record<string, any> {
  const defaults: Record<string, any> = {
    Header: { sticky: false, shadow: true },
    Hero: {
      title: "New Hero Section",
      description: "Add your description here",
      backgroundColor: "#f8fafc",
    },
    Section: { padding: "lg", backgroundColor: "#ffffff" },
    Card: {
      title: "New Card",
      description: "Add your description here",
      variant: "default",
    },
    Button: { text: "Button", variant: "default" },
    Text: { content: "Add your text here", tag: "p", size: "base" },
    Image: {
      src: "https://via.placeholder.com/400x200/e5e7eb/6b7280?text=Image",
      alt: "Placeholder image",
    },
    Grid: { columns: 3, gap: "md" },
    Container: { maxWidth: "xl", padding: "md" },
    Form: { title: "Contact Form", submitText: "Submit" },
    Footer: {
      logoText: "My Website",
      copyright: "© 2024 My Website. All rights reserved.",
    },
    Navbar: {
      logoText: "Brand",
      links: [{ text: "Home", href: "#" }],
      ctaText: "Get Started",
    },
  };

  return defaults[componentType] || {};
}

function insertComponent(
  components: ComponentDefinition[],
  newComponent: ComponentDefinition,
  targetId?: string,
  position?: "before" | "after" | "inside"
): ComponentDefinition[] {
  if (!targetId) {
    return [...components, newComponent];
  }

  function insertInTree(items: ComponentDefinition[]): ComponentDefinition[] {
    return items.map((item) => {
      if (item.id === targetId) {
        if (position === "inside") {
          return {
            ...item,
            children: [...item.children, newComponent],
          };
        } else if (position === "before") {
          // Handle before insertion at parent level
          return item;
        } else if (position === "after") {
          // Handle after insertion at parent level
          return item;
        }
      }

      if (item.children.length > 0) {
        return {
          ...item,
          children: insertInTree(item.children),
        };
      }

      return item;
    });
  }

  return insertInTree(components);
}

function updateComponentInTree(
  components: ComponentDefinition[],
  componentId: string,
  updates: Partial<ComponentDefinition["props"]>
): ComponentDefinition[] {
  return components.map((component) => {
    if (component.id === componentId) {
      return {
        ...component,
        props: { ...component.props, ...updates },
      };
    }

    if (component.children.length > 0) {
      return {
        ...component,
        children: updateComponentInTree(
          component.children,
          componentId,
          updates
        ),
      };
    }

    return component;
  });
}

function removeComponentFromTree(
  components: ComponentDefinition[],
  componentId: string
): ComponentDefinition[] {
  return components
    .filter((component) => component.id !== componentId)
    .map((component) => ({
      ...component,
      children: removeComponentFromTree(component.children, componentId),
    }));
}

function duplicateComponentInTree(
  components: ComponentDefinition[],
  componentId: string
): ComponentDefinition[] {
  function duplicateComponent(
    component: ComponentDefinition
  ): ComponentDefinition {
    return {
      ...component,
      id: generateId(),
      children: component.children.map(duplicateComponent),
    };
  }

  function duplicateInTree(
    items: ComponentDefinition[]
  ): ComponentDefinition[] {
    const result: ComponentDefinition[] = [];

    for (const item of items) {
      result.push(item);

      if (item.id === componentId) {
        // Add duplicated component right after the original
        result.push(duplicateComponent(item));
      } else if (item.children.length > 0) {
        // Recursively check children
        const updatedItem = {
          ...item,
          children: duplicateInTree(item.children),
        };
        result[result.length - 1] = updatedItem;
      }
    }

    return result;
  }

  return duplicateInTree(components);
}
