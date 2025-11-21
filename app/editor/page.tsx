"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { EditorLayout } from "@/components/editor/EditorLayout";
import { ComponentDefinition, Page } from "@/types/editor";
import { generateId } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useProject, useUpdateProject } from "@/hooks/useProjects";
import { toast } from "sonner";
import { Loading } from "@/components/ui/loading";
import { useHistory } from "@/hooks/useHistory";

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

  // Use history hook for undo/redo
  const {
    state: pages,
    setState: setPages,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
  } = useHistory<Page[]>([
    {
      id: "home",
      name: "Home",
      slug: "index",
      components: placeholderComponents,
    },
  ]);

  const [currentPageId, setCurrentPageId] = useState<string>("home");
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>(
    []
  );
  const [draggedComponent, setDraggedComponent] = useState<any>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [projectName, setProjectName] = useState<string>("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Get current page
  const currentPage = pages.find((p) => p.id === currentPageId) || pages[0];
  const components = currentPage.components;

  // React Query hooks - disable refetching to prevent overwriting local changes
  const {
    data: projectData,
    isLoading: projectLoading,
    error: projectError,
  } = useProject(projectId, user?.uid);
  const updateProjectMutation = useUpdateProject();

  // Redirect if no projectId
  useEffect(() => {
    if (!projectId) {
      router.push("/projects");
      return;
    }
  }, [projectId, router]);

  // Handle auth and project errors
  useEffect(() => {
    if (!projectId) return;
    if (authLoading || projectLoading) return;

    if (!user) {
      toast.error("Please log in");
      router.push("/projects");
      return;
    }

    if (projectError) {
      setRedirecting(true);
      toast.error("Project not found");
      router.push("/projects");
      return;
    }
  }, [projectId, user, authLoading, projectLoading, projectError, router]);

  // Load project data ONLY on initial load
  useEffect(() => {
    if (projectData && isInitialLoad) {
      // Load pages from project data, or create default home page
      if (projectData.pages && Array.isArray(projectData.pages)) {
        setPages(projectData.pages, false); // Don't record initial load in history
        setCurrentPageId(projectData.pages[0]?.id || "home");
      } else {
        // Legacy support: convert old components array to pages
        setPages(
          [
            {
              id: "home",
              name: "Home",
              slug: "index",
              components: projectData.components || placeholderComponents,
            },
          ],
          false // Don't record initial load in history
        );
      }
      setProjectName(projectData.name || "Untitled Project");
      setIsInitialLoad(false);
      clearHistory(); // Clear any history from initialization
    }
  }, [projectData, isInitialLoad, setPages, clearHistory]);

  // Auto-save when pages or project name change
  useEffect(() => {
    if (!projectId || !user || isInitialLoad) return;

    const timeoutId = setTimeout(() => {
      updateProjectMutation.mutate({
        projectId,
        updates: { pages, name: projectName },
        userId: user.uid,
      });
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [pages, projectName, projectId, user, isInitialLoad]);

  // Helper to update current page components
  const updateCurrentPageComponents = (
    updater: (components: ComponentDefinition[]) => ComponentDefinition[]
  ) => {
    setPages((prevPages) =>
      prevPages.map((page) =>
        page.id === currentPageId
          ? { ...page, components: updater(page.components) }
          : page
      )
    );
  };

  // Page management functions
  const handlePageAdd = (name: string, slug: string) => {
    const newPage: Page = {
      id: generateId(),
      name,
      slug,
      components: [],
    };
    setPages((prev) => [...prev, newPage]);
    setCurrentPageId(newPage.id);
    toast.success(`Page "${name}" created`);
  };

  const handlePageDelete = (pageId: string) => {
    if (pages.length === 1) {
      toast.error("Cannot delete the last page");
      return;
    }
    setPages((prev) => prev.filter((p) => p.id !== pageId));
    if (currentPageId === pageId) {
      setCurrentPageId(pages[0].id);
    }
    toast.success("Page deleted");
  };

  const handlePageSelect = (pageId: string) => {
    setCurrentPageId(pageId);
    setSelectedComponentIds([]);
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

        updateCurrentPageComponents((prev) =>
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
    // Update component on current page
    updateCurrentPageComponents((prev) =>
      updateComponentInTree(prev, componentId, updates)
    );

    // If it's a Navbar or Footer, sync to all other pages by type
    const component = findComponentInTree(components, componentId);
    if (
      component &&
      (component.type === "Navbar" || component.type === "Footer")
    ) {
      setPages((prevPages) =>
        prevPages.map((page) => {
          if (page.id === currentPageId) return page; // Skip current page (already updated)

          // Find the first Navbar or Footer of the same type on this page
          const targetComponent = findComponentByType(
            page.components,
            component.type
          );
          if (targetComponent) {
            return {
              ...page,
              components: updateComponentInTree(
                page.components,
                targetComponent.id,
                updates
              ),
            };
          }
          return page;
        })
      );
    }
  };

  const deleteComponent = (componentId: string) => {
    updateCurrentPageComponents((prev) =>
      removeComponentFromTree(prev, componentId)
    );
    setSelectedComponentIds((prev) => prev.filter((id) => id !== componentId));
  };

  const deleteSelectedComponents = () => {
    selectedComponentIds.forEach((id) => {
      updateCurrentPageComponents((prev: ComponentDefinition[]) =>
        removeComponentFromTree(prev, id)
      );
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
    updateCurrentPageComponents((prev) =>
      duplicateComponentInTree(prev, componentId)
    );
  };

  const addComponent = (componentType: string) => {
    const newComponent: ComponentDefinition = {
      id: generateId(),
      type: componentType,
      props: getDefaultProps(componentType),
      children: [],
    };
    updateCurrentPageComponents((prev) => [...prev, newComponent]);
    toast.success(`${componentType} added to page`);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (
        event.target === document.body ||
        (event.target as Element)?.closest(".editor-canvas")
      ) {
        // Undo
        if (event.ctrlKey && event.key === "z" && !event.shiftKey) {
          event.preventDefault();
          undo();
          toast.success("Undo");
          return;
        }

        // Redo (Ctrl+Y or Ctrl+Shift+Z)
        if (
          (event.ctrlKey && event.key === "y") ||
          (event.ctrlKey && event.shiftKey && event.key === "z")
        ) {
          event.preventDefault();
          redo();
          toast.success("Redo");
          return;
        }

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
  }, [components, selectedComponentIds, undo, redo]);

  if (redirecting || projectLoading || (projectId && authLoading)) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loading
          text={projectLoading ? "Loading project..." : "Loading..."}
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
        pages={pages}
        currentPageId={currentPageId}
        onPageSelect={handlePageSelect}
        onPageAdd={handlePageAdd}
        onPageDelete={handlePageDelete}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
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
    Accordion: {
      items: [
        { title: "Item 1", content: "Content 1" },
        { title: "Item 2", content: "Content 2" },
      ],
    },
    Tabs: {
      tabs: [
        { label: "Tab 1", content: "Content 1" },
        { label: "Tab 2", content: "Content 2" },
      ],
    },
    Testimonial: {
      quote: "Great product!",
      author: "John Doe",
      role: "CEO",
      rating: 5,
    },
    PricingCard: {
      title: "Basic",
      price: "$29",
      period: "month",
      features: [
        { text: "Feature 1", included: true },
        { text: "Feature 2", included: true },
      ],
    },
    Feature: {
      icon: "✨",
      title: "Feature Title",
      description: "Feature description",
    },
    Stats: {
      stats: [
        { value: "10K+", label: "Users" },
        { value: "50+", label: "Countries" },
      ],
    },
    CTA: {
      title: "Ready to start?",
      description: "Join us today",
      primaryButtonText: "Get Started",
    },
    Divider: { variant: "solid", thickness: "thin" },
    Spacer: { height: "2rem" },
    Badge: { text: "New", variant: "default" },
    Alert: { message: "This is an alert", variant: "info" },
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

function findComponentInTree(
  components: ComponentDefinition[],
  componentId: string
): ComponentDefinition | null {
  for (const component of components) {
    if (component.id === componentId) {
      return component;
    }
    if (component.children.length > 0) {
      const found = findComponentInTree(component.children, componentId);
      if (found) return found;
    }
  }
  return null;
}

function findComponentByType(
  components: ComponentDefinition[],
  type: string
): ComponentDefinition | null {
  for (const component of components) {
    if (component.type === type) {
      return component;
    }
    if (component.children.length > 0) {
      const found = findComponentByType(component.children, type);
      if (found) return found;
    }
  }
  return null;
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
