"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { EditorLayout } from "@/components/editor/EditorLayout";
import { ComponentDefinition } from "@/types/editor";
import { generateId } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { getProject } from "@/hooks/useProjects";
import { toast } from "sonner";
import { Loading } from "@/components/ui/loading";

const placeholderComponents: ComponentDefinition[] = [
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
];

export default function EditorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const projectId = searchParams.get("projectId");

  const [components, setComponents] = useState<ComponentDefinition[]>(
    placeholderComponents
  );
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>(
    []
  );
  const [draggedComponent, setDraggedComponent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [projectName, setProjectName] = useState<string>("");

  // Redirect if no projectId
  useEffect(() => {
    if (!projectId) {
      router.push("/projects");
      return;
    }
  }, [projectId, router]);

  // Load project if projectId is provided
  useEffect(() => {
    if (!projectId) return;
    if (authLoading) return;

    if (!user) {
      toast.error("Please log in");
      router.push("/projects");
      return;
    }

    loadProject();
  }, [projectId, user, authLoading]);

  // Auto-save when components or project name change (only if projectId exists)
  useEffect(() => {
    if (!projectId || !user || loading) return;

    const timeoutId = setTimeout(() => {
      saveProject();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [components, projectName, projectId, user]);

  const loadProject = async () => {
    if (!user || !projectId) return;

    setLoading(true);
    try {
      const projectData = await getProject(projectId, user.uid);
      setComponents(projectData.components || placeholderComponents);
      setProjectName(projectData.name || "Untitled Project");
      setLoading(false);
    } catch (err) {
      setRedirecting(true);
      toast.error("Project not found");
      router.push("/projects");
    }
  };

  const saveProject = async () => {
    if (!user || !projectId) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.uid,
        },
        body: JSON.stringify({ components, name: projectName }),
      });

      if (!response.ok) {
        throw new Error("Failed to save project");
      }
    } catch (err) {
      // Silently fail - user will see stale data on reload
    }
  };

  const handleProjectNameChange = (newName: string) => {
    setProjectName(newName);
    toast.success("Project name updated");
  };

  const handleDragStart = (event: DragStartEvent) => {
    setDraggedComponent(event.active.data.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setDraggedComponent(null);
      return;
    }

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
    setSelectedComponentIds((prev) => prev.filter((id) => id !== componentId));
  };

  const deleteSelectedComponents = () => {
    selectedComponentIds.forEach((id) => {
      setComponents((prev) => removeComponentFromTree(prev, id));
    });
    setSelectedComponentIds([]);
  };

  const getAllComponentIds = (components: ComponentDefinition[]): string[] => {
    const ids: string[] = [];
    const traverse = (items: ComponentDefinition[]) => {
      items.forEach((item) => {
        ids.push(item.id);
        if (item.children.length > 0) {
          traverse(item.children);
        }
      });
    };
    traverse(components);
    return ids;
  };

  const duplicateComponent = (componentId: string) => {
    setComponents((prev) => duplicateComponentInTree(prev, componentId));
  };

  const addComponent = (componentType: string) => {
    const newComponent: ComponentDefinition = {
      id: generateId(),
      type: componentType,
      props: getDefaultProps(componentType),
      children: [],
    };
    setComponents((prev) => [...prev, newComponent]);
    toast.success(`${componentType} added to page`);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target === document.body ||
        (event.target as Element)?.closest(".editor-canvas")
      ) {
        if (event.ctrlKey && event.key === "a") {
          event.preventDefault();
          const allIds = getAllComponentIds(components);
          setSelectedComponentIds(allIds);
          return;
        }

        if (event.key === "Delete" && selectedComponentIds.length > 0) {
          event.preventDefault();
          deleteSelectedComponents();
          return;
        }

        if (event.key === "Escape") {
          event.preventDefault();
          setSelectedComponentIds([]);
          return;
        }

        if (
          event.ctrlKey &&
          event.key === "d" &&
          selectedComponentIds.length > 0
        ) {
          event.preventDefault();
          selectedComponentIds.forEach((id) => duplicateComponent(id));
          return;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [components, selectedComponentIds]);

  if (redirecting || loading || (projectId && authLoading)) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loading
          text={loading ? "Loading project..." : "Loading..."}
          size="lg"
        />
      </div>
    );
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <EditorLayout
        components={components}
        selectedComponentIds={selectedComponentIds}
        onSelectComponent={(id) => setSelectedComponentIds(id ? [id] : [])}
        onUpdateComponent={updateComponent}
        onDeleteComponent={deleteComponent}
        onDuplicateComponent={duplicateComponent}
        onAddComponent={addComponent}
        projectName={projectName}
        onProjectNameChange={handleProjectNameChange}
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
      src: "https://placehold.co/400x200/e5e7eb/6b7280?text=Image",
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
        result.push(duplicateComponent(item));
      } else if (item.children.length > 0) {
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
