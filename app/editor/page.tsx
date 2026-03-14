"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { EditorLayout } from "@/components/editor/EditorLayout";
import { ComponentDefinition, Page, GlobalComponents } from "@/types/editor";
import { generateId } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useProject, useUpdateProject } from "@/hooks/useProjects";
import { toast } from "sonner";
import { Loading } from "@/components/ui/loading";
import { useHistory } from "@/hooks/useHistory";
import { useComponentFavorites } from "@/hooks/useComponentFavorites";
import { useComponentClipboard } from "@/hooks/useComponentClipboard";
import { ShortcutsPanel } from "@/components/editor/ShortcutsPanel";
import { componentCategories } from "@/components/editor/config/components";
import { Component as ComponentIcon, Globe } from "lucide-react";

// Utility to recursively remove undefined values so Firebase doesn't complain
const sanitizeForFirestore = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  if (obj && typeof obj === "object" && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((acc: any, key) => {
      const val = obj[key];
      if (val !== undefined) {
        acc[key] = sanitizeForFirestore(val);
      }
      return acc;
    }, {});
  }
  return obj;
};

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
    [],
  );
  const [draggedComponent, setDraggedComponent] = useState<any>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [projectName, setProjectName] = useState<string>("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isSavingManual, setIsSavingManual] = useState(false);

  // Global components state
  const [globalComponents, setGlobalComponents] = useState<GlobalComponents>({});

  const { addToRecent } = useComponentFavorites();
  const { copyComponent, pasteComponent, hasClipboard } =
    useComponentClipboard();

  // Get current page
  const currentPage = pages.find((p) => p.id === currentPageId) || pages[0];

  // Merge components. We no longer inject global templates directly.
  // Global component instances already exist inside `currentPage.components` with `isGlobal` flags
  // and are kept in sync with the `globalComponents` dictionary.
  const components: ComponentDefinition[] = [...currentPage.components];

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
            const globalComps = projectData.globalComponents || {};
            setGlobalComponents(globalComps);

            // Just load pages as they are
            setPages(projectData.pages, false);
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
          false, // Don't record initial load in history
        );
      }
      setProjectName(projectData.name || "Untitled Project");
      setIsInitialLoad(false);
      clearHistory(); // Clear any history from initialization
    }
  }, [projectData, isInitialLoad, setPages, clearHistory]);

  // Auto-save when pages, global components, or project name change
  useEffect(() => {
    if (!projectId || !user || isInitialLoad) return;

    const timeoutId = setTimeout(() => {
      // Merge global components back into first page for saving
      const pagesWithGlobal = pages.map((page, index) => {
        return page;
      });

      const updates = sanitizeForFirestore({ pages: pagesWithGlobal, name: projectName, globalComponents });

      updateProjectMutation.mutate({
        projectId,
        updates,
        userId: user.uid,
      });
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [pages, globalComponents, projectName, projectId, user, isInitialLoad]);

  // Manual save handler
  const handleManualSave = async () => {
    if (!projectId || !user || isInitialLoad) return;
    setIsSavingManual(true);
    
    try {
      const pagesWithGlobal = pages.map((page, index) => {
        return page;
      });

      const updates = sanitizeForFirestore({ pages: pagesWithGlobal, name: projectName, globalComponents });

      await updateProjectMutation.mutateAsync({
        projectId,
        updates,
        userId: user.uid,
      });
      toast.success("Project saved manually!");
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save project");
    } finally {
      setIsSavingManual(false);
    }
  };

  // Helper to update current page components
  const updateCurrentPageComponents = (
    updater: (components: ComponentDefinition[]) => ComponentDefinition[],
  ) => {
    setPages((prevPages) =>
      prevPages.map((page) =>
        page.id === currentPageId
          ? { ...page, components: updater(page.components) }
          : page,
      ),
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

  const handlePageDuplicate = (pageId: string) => {
    const pageToDuplicate = pages.find((p) => p.id === pageId);
    if (!pageToDuplicate) return;

    // Deep clone components with new IDs
    const cloneComponentsWithNewIds = (
      comps: ComponentDefinition[],
    ): ComponentDefinition[] => {
      return comps.map((comp) => ({
        ...comp,
        id: generateId(),
        children: cloneComponentsWithNewIds(comp.children),
      }));
    };

    const newPage: Page = {
      id: generateId(),
      name: `${pageToDuplicate.name} (Copy)`,
      slug: `${pageToDuplicate.slug}-copy-${Date.now()}`,
      components: cloneComponentsWithNewIds(pageToDuplicate.components),
    };

    setPages((prev) => [...prev, newPage]);
    setCurrentPageId(newPage.id);
    toast.success(`Page "${pageToDuplicate.name}" duplicated`);
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
          insertComponent(prev, newComponent, targetId, position),
        );
        addToRecent(componentType); // Track in recent
      }
    } else if (active.data.current?.type === "palette-global") {
      const { globalName, componentType } = active.data.current;
      const template = globalComponents[globalName];
      
      if (template) {
        // Deep clone the global component with new IDs
        const cloneComponent = (comp: ComponentDefinition): ComponentDefinition => ({
          ...comp,
          id: generateId(),
          isGlobal: comp.id === template.id ? globalName : undefined,
          children: comp.children.map(cloneComponent),
        });

        const newGlobalComponent = cloneComponent(template);

        if (over.data.current?.type === "drop-zone") {
          const targetId = over.data.current.targetId;
          const position = over.data.current.position;

          updateCurrentPageComponents((prev) =>
            insertComponent(prev, newGlobalComponent, targetId, position),
          );
        }
      }
    }

    setDraggedComponent(null);
  };

  const updateComponent = (
    componentId: string,
    updates: Partial<ComponentDefinition["props"]>,
  ) => {
    const component = findComponentInTree(components, componentId);
    if (!component) return;

    // Update the component in the current page
    updateCurrentPageComponents((prev) =>
      updateComponentInTree(prev, componentId, updates),
    );

    // If this component is global, sync the change to ALL pages
    const globalName = component.isGlobal;
    if (globalName) {
      // Update the global template
      setGlobalComponents((prev) => ({
        ...prev,
        [globalName]: {
          ...prev[globalName],
          props: { ...prev[globalName]?.props, ...updates },
        },
      }));

      // Sync updates to ALL other pages that have a component with the same isGlobal name
      setPages((prevPages) =>
        prevPages.map((page) => {
          if (page.id === currentPageId) return page; // Already updated above
          return {
            ...page,
            components: syncGlobalInComponents(page.components, globalName, updates),
          };
        })
      );
    }
  };

  const moveComponentUp = (componentId: string) => {
    updateCurrentPageComponents((prev) => moveComponentInTree(prev, componentId, "up"));
  };

  const moveComponentDown = (componentId: string) => {
    updateCurrentPageComponents((prev) => moveComponentInTree(prev, componentId, "down"));
  };

  // Recursively find and update components with matching isGlobal name
  const syncGlobalInComponents = (
    components: ComponentDefinition[],
    globalName: string,
    updates: Record<string, any>,
  ): ComponentDefinition[] => {
    return components.map((comp) => {
      let updated = comp;
      if (comp.isGlobal === globalName) {
        updated = { ...comp, props: { ...comp.props, ...updates } };
      }
      if (comp.children.length > 0) {
        updated = { ...updated, children: syncGlobalInComponents(comp.children, globalName, updates) };
      }
      return updated;
    });
  };

  const markAsGlobal = (componentId: string, globalName: string) => {
    const component = findComponentInTree(components, componentId);
    if (!component) return;

    // 1. Save the current state of the component as the global template
    setGlobalComponents((prev) => ({
      ...prev,
      [globalName]: { ...component, isGlobal: globalName },
    }));

    // 2. Mark the current instance as global 
    updateCurrentPageComponents((prev) => 
      setGlobalFlagInTree(prev, componentId, globalName)
    );
    toast.success(`Component marked as global: ${globalName}`);
  };

  const unmarkGlobal = (componentId: string) => {
    updateCurrentPageComponents((prev) => 
      clearGlobalFlagInTree(prev, componentId)
    );
    toast.success("Removed global sync from component");
  };

  const applyGlobalTemplate = (componentId: string, globalName: string) => {
    const template = globalComponents[globalName];
    if (!template) return;

    updateCurrentPageComponents((prev) => {
      // Find the component and update all its props with the template's props
      return updateComponentInTree(prev, componentId, template.props);
    });
    
    // Also mark it as pointing to this global group
    updateCurrentPageComponents((prev) => 
      setGlobalFlagInTree(prev, componentId, globalName)
    );

    toast.success(`Applied global style "${globalName}"`);
  };

  const deleteComponent = (componentId: string) => {
    // Check if it's a global component template
    const isGlobalTemplate = Object.values(globalComponents).some(
      (comp) => comp.id === componentId
    );

    if (isGlobalTemplate) {
      // Find its global name and remove from global state
      const globalName = Object.entries(globalComponents).find(
        ([_, comp]) => comp.id === componentId
      )?.[0];

      if (globalName) {
        setGlobalComponents((prev) => {
          const next = { ...prev };
          delete next[globalName];
          return next;
        });

        // Also remove instances from the current page tree
        updateCurrentPageComponents((prev) =>
          removeComponentFromTree(prev, componentId),
        );
      }
    } else {
      updateCurrentPageComponents((prev) =>
        removeComponentFromTree(prev, componentId),
      );
    }

    setSelectedComponentIds((prev) => prev.filter((id) => id !== componentId));
  };

  const deleteSelectedComponents = () => {
    selectedComponentIds.forEach((id) => {
      // Check if it's a global component template
      const globalName = Object.entries(globalComponents).find(
        ([_, comp]) => comp.id === id
      )?.[0];

      if (globalName) {
        setGlobalComponents((prev) => {
          const next = { ...prev };
          delete next[globalName];
          return next;
        });
      }

      updateCurrentPageComponents((prev: ComponentDefinition[]) =>
        removeComponentFromTree(prev, id),
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
      duplicateComponentInTree(prev, componentId),
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
    addToRecent(componentType); // Track in recent
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

      // Show shortcuts panel with ?
      if (event.key === "?" && !isInputField) {
        event.preventDefault();
        setShowShortcuts((prev) => !prev);
        return;
      }

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

        // Copy component
        if (
          event.ctrlKey &&
          event.key === "c" &&
          selectedComponentIds.length === 1
        ) {
          event.preventDefault();
          const component = findComponentInTree(
            components,
            selectedComponentIds[0],
          );
          if (component) {
            copyComponent(component);
            toast.success("Component copied");
          }
          return;
        }

        // Paste component
        if (event.ctrlKey && event.key === "v" && hasClipboard) {
          event.preventDefault();
          const copiedComponent = pasteComponent();
          if (copiedComponent) {
            // Deep clone with new IDs
            const cloneWithNewIds = (
              comp: ComponentDefinition,
            ): ComponentDefinition => ({
              ...comp,
              id: generateId(),
              children: comp.children.map(cloneWithNewIds),
            });
            const newComponent = cloneWithNewIds(copiedComponent);
            updateCurrentPageComponents((prev) => [...prev, newComponent]);
            toast.success("Component pasted");
          }
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
  }, [
    components,
    selectedComponentIds,
    undo,
    redo,
    hasClipboard,
    copyComponent,
    pasteComponent,
  ]);

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
    <>
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
          onPageDuplicate={handlePageDuplicate}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onSave={handleManualSave}
          isSaving={isSavingManual}
          globalComponents={globalComponents}
          onMarkAsGlobal={markAsGlobal}
          onUnmarkGlobal={unmarkGlobal}
          onApplyGlobalTemplate={applyGlobalTemplate}
          onMoveComponentUp={moveComponentUp}
          onMoveComponentDown={moveComponentDown}
        />

        <DragOverlay>
          {draggedComponent ? (
            <div className="bg-card border border-primary rounded-lg p-3 shadow-xl flex flex-col items-center justify-center space-y-2 min-w-[120px] opacity-90 scale-105 transition-transform cursor-grabbing">
              <span className="text-muted-foreground p-2 bg-muted rounded-md text-primary">
                {draggedComponent.type === "palette-global" ? (
                  <Globe className="w-5 h-5" />
                ) : (
                  (() => {
                    const type = draggedComponent.componentType || draggedComponent.type;
                    for (const cat of componentCategories) {
                      const found = cat.components.find((c) => c.type === type);
                      if (found) return found.icon;
                    }
                    return <ComponentIcon className="w-5 h-5" />;
                  })()
                )}
              </span>
              <span className="text-xs font-medium text-foreground">
                {draggedComponent.type === "palette-global" 
                  ? draggedComponent.globalName 
                  : (draggedComponent.componentType || draggedComponent.type)}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Shortcuts Panel */}
      {showShortcuts && (
        <ShortcutsPanel onClose={() => setShowShortcuts(false)} />
      )}
    </>
  );
}

// Helper functions
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
  targetId?: string | null,
  position?: "before" | "after" | "inside" | "root-start" | string,
): ComponentDefinition[] {
  if (position === "root-start" || targetId === "root-start") {
    return [newComponent, ...components];
  }
  
  if (!targetId || targetId === "root") {
    if (position === "before") {
      return [newComponent, ...components];
    }
    return [...components, newComponent];
  }

  let inserted = false;

  function insertInTree(items: ComponentDefinition[]): ComponentDefinition[] {
    const result: ComponentDefinition[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.id === targetId && !inserted) {
        inserted = true;
        if (position === "before") {
          result.push(newComponent);
          result.push(item);
        } else if (position === "after") {
          result.push(item);
          result.push(newComponent);
        } else if (position === "inside") {
          result.push({
            ...item,
            children: [...item.children, newComponent],
          });
        }
      } else {
        // Recursively check children
        if (item.children.length > 0 && !inserted) {
          const updatedChildren = insertInTree(item.children);
          result.push({
            ...item,
            children: updatedChildren,
          });
        } else {
          result.push(item);
        }
      }
    }

    return result;
  }

  return insertInTree(components);
}

function findComponentInTree(
  components: ComponentDefinition[],
  componentId: string,
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
  type: string,
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
  updates: Partial<ComponentDefinition["props"]>,
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
          updates,
        ),
      };
    }

    return component;
  });
}

function removeComponentFromTree(
  components: ComponentDefinition[],
  componentId: string,
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
  componentId: string,
): ComponentDefinition[] {
  function duplicateComponent(
    component: ComponentDefinition,
  ): ComponentDefinition {
    return {
      ...component,
      id: generateId(),
      children: component.children.map(duplicateComponent),
    };
  }

  function duplicateInTree(
    items: ComponentDefinition[],
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

// Move a component up or down within its current siblings
function moveComponentInTree(
  components: ComponentDefinition[],
  componentId: string,
  direction: "up" | "down",
): ComponentDefinition[] {
  const result: ComponentDefinition[] = [];

  for (let i = 0; i < components.length; i++) {
    const comp = components[i];
    
    // Check if the target is one of the siblings at the current level
    if (components.some(c => c.id === componentId)) {
      const idx = components.findIndex(c => c.id === componentId);
      
      // If we're at the very top and trying to move up, ignore
      if (idx === 0 && direction === "up") return [...components];
      // If we're at the very bottom and trying to move down, ignore
      if (idx === components.length - 1 && direction === "down") return [...components];

      // Perform the swap
      const newArray = [...components];
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      const temp = newArray[idx];
      newArray[idx] = newArray[swapIdx];
      newArray[swapIdx] = temp;
      
      return newArray;
    }

    if (comp.children.length > 0) {
      result.push({
        ...comp,
        children: moveComponentInTree(comp.children, componentId, direction),
      });
    } else {
      result.push(comp);
    }
  }

  return result;
}

// Set isGlobal flag on a specific component in the tree
function setGlobalFlagInTree(
  components: ComponentDefinition[],
  componentId: string,
  globalName: string,
): ComponentDefinition[] {
  return components.map((comp) => {
    if (comp.id === componentId) {
      return { ...comp, isGlobal: globalName };
    }
    if (comp.children.length > 0) {
      return {
        ...comp,
        children: setGlobalFlagInTree(comp.children, componentId, globalName),
      };
    }
    return comp;
  });
}

// Clear isGlobal flag on a specific component in the tree
function clearGlobalFlagInTree(
  components: ComponentDefinition[],
  componentId: string,
): ComponentDefinition[] {
  return components.map((comp) => {
    if (comp.id === componentId) {
      const copy = { ...comp };
      delete copy.isGlobal;
      return copy;
    }
    if (comp.children.length > 0) {
      return {
        ...comp,
        children: clearGlobalFlagInTree(comp.children, componentId),
      };
    }
    return comp;
  });
}
