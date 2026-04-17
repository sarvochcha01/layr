"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import { ComponentDefinition } from "@/types/editor";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Trash2,
  MoreHorizontal,
  Component as ComponentIcon,
  Globe,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { componentCategories } from "./config/components";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDragSelect } from "@/hooks/useDragSelect";

interface HierarchyPanelProps {
  components: ComponentDefinition[];
  selectedComponentIds?: string[];
  selectedComponentId?: string | null;
  onSelectComponent: (id: string | null) => void;
  onSelectMultiple?: (ids: string[]) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent?: (id: string) => void;
  onAddComponent?: (componentType: string) => void;
  onMoveComponentUp?: (id: string) => void;
  onMoveComponentDown?: (id: string) => void;
  onRepositionComponent?: (componentId: string, targetId: string | null, position: "top" | "bottom" | "inside") => void;
}

export interface HierarchyPanelRef {
  expandToComponent: (componentId: string) => void;
}

export const HierarchyPanel = forwardRef<HierarchyPanelRef, HierarchyPanelProps>(({
  components,
  selectedComponentIds = [],
  selectedComponentId,
  onSelectComponent,
  onSelectMultiple,
  onDeleteComponent,
  onDuplicateComponent,
  onAddComponent,
  onMoveComponentUp,
  onMoveComponentDown,
  onRepositionComponent,
}, ref) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(["root"])
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<"top" | "bottom" | "inside" | null>(null);
  
  // Use drag-select hook for multi-selection
  const dragSelect = useDragSelect({
    onSelectionComplete: (ids) => {
      if (onSelectMultiple) {
        onSelectMultiple(ids);
      }
    },
  });

  // Determine selected IDs
  const currentSelectedIds = selectedComponentIds.length > 0 ? selectedComponentIds : (selectedComponentId ? [selectedComponentId] : []);

  // Helper function to find all parent IDs of a component
  const findParentIds = (targetId: string, components: ComponentDefinition[], parents: string[] = []): string[] | null => {
    for (const component of components) {
      if (component.id === targetId) {
        return parents;
      }
      if (component.children.length > 0) {
        const result = findParentIds(targetId, component.children, [...parents, component.id]);
        if (result !== null) {
          return result;
        }
      }
    }
    return null;
  };

  // Expose method to expand to a specific component
  useImperativeHandle(ref, () => ({
    expandToComponent: (componentId: string) => {
      const parentIds = findParentIds(componentId, components);
      if (parentIds) {
        setExpandedItems(prev => {
          const newExpanded = new Set(prev);
          newExpanded.add("root"); // Always expand root
          parentIds.forEach(id => newExpanded.add(id));
          return newExpanded;
        });
      }
    }
  }));

  const handleAddComponent = (componentType: string) => {
    if (onAddComponent) {
      onAddComponent(componentType);
      setIsAddDialogOpen(false);
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getComponentIcon = (type: string) => {
    for (const category of componentCategories) {
      const found = category.components.find((c) => c.type === type);
      if (found) return found.icon;
    }
    return <ComponentIcon className="w-4 h-4" />;
  };

  const handleDragStart = (e: React.DragEvent, componentId: string) => {
    e.stopPropagation();
    setDraggedId(componentId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", componentId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedId || draggedId === targetId) return;
    
    // Calculate drop position based on mouse Y position relative to element
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    const elementHeight = rect.height;
    
    // Divide into three zones: top 30%, middle 40%, bottom 30%
    if (mouseY < elementHeight * 0.3) {
      setDropPosition("top");
    } else if (mouseY > elementHeight * 0.7) {
      setDropPosition("bottom");
    } else {
      setDropPosition("inside");
    }
    
    setDropTargetId(targetId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only clear if we're leaving the hierarchy panel entirely
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !relatedTarget.closest('[data-hierarchy-id]')) {
      setDropTargetId(null);
      setDropPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedId || !dropPosition || draggedId === targetId) {
      setDraggedId(null);
      setDropTargetId(null);
      setDropPosition(null);
      return;
    }
    
    // Call the reposition callback
    if (onRepositionComponent) {
      onRepositionComponent(draggedId, targetId, dropPosition);
    }
    
    // Clear drag state
    setDraggedId(null);
    setDropTargetId(null);
    setDropPosition(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDropTargetId(null);
    setDropPosition(null);
  };

  const renderComponent = (
    component: ComponentDefinition,
    level: number = 0
  ) => {
    const isSelected = currentSelectedIds.includes(component.id);
    const isExpanded = expandedItems.has(component.id);
    const hasChildren = component.children.length > 0;
    const isDragging = draggedId === component.id;
    const isDropTarget = dropTargetId === component.id;
    const isHovered = dragSelect.isHovered(component.id);

    return (
      <div key={component.id}>
        {/* Drop indicator - top */}
        {isDropTarget && dropPosition === "top" && (
          <div className="h-0.5 bg-primary mx-2 rounded-full" />
        )}
        
        <div
          data-hierarchy-id={component.id}
          draggable={!dragSelect.isSelecting}
          onDragStart={(e) => !dragSelect.isSelecting && handleDragStart(e, component.id)}
          onDragOver={(e) => !dragSelect.isSelecting && handleDragOver(e, component.id)}
          onDragLeave={!dragSelect.isSelecting ? handleDragLeave : undefined}
          onDrop={(e) => !dragSelect.isSelecting && handleDrop(e, component.id)}
          onDragEnd={!dragSelect.isSelecting ? handleDragEnd : undefined}
          onMouseEnter={() => {
            // Only add to selection if we're in selection mode
            if (dragSelect.isSelecting) {
              dragSelect.handleMouseEnter(component.id);
            }
          }}
          className={cn(
            "flex items-center py-1 px-2 hover:bg-muted cursor-pointer group transition-colors",
            isSelected && "bg-primary/10 border-r-2 border-primary",
            isDragging && "opacity-40",
            isDropTarget && dropPosition === "inside" && "bg-primary/20 ring-2 ring-primary ring-inset",
            isHovered && dragSelect.isSelecting && "bg-blue-100 dark:bg-blue-900/30"
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={(e) => {
            // Prevent click during selection drag
            if (dragSelect.isSelecting) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            
            // Check if Ctrl/Cmd is held for multi-select
            if (e.ctrlKey || e.metaKey) {
              e.stopPropagation();
              if (onSelectMultiple) {
                const currentlySelected = currentSelectedIds.includes(component.id);
                if (currentlySelected) {
                  // Remove from selection
                  const newSelection = currentSelectedIds.filter(id => id !== component.id);
                  if (newSelection.length > 0) {
                    onSelectMultiple(newSelection);
                  } else {
                    onSelectComponent(component.id); // Keep at least one selected
                  }
                } else {
                  // Add to selection
                  onSelectMultiple([...currentSelectedIds, component.id]);
                }
              }
            } else {
              // Normal click: select only this component
              onSelectComponent(component.id);
              // Expand this component if it has children
              if (hasChildren && !isExpanded) {
                toggleExpanded(component.id);
              }
              // Scroll to the component in the canvas
              const el = document.querySelector(`[data-component-id="${component.id}"]`);
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                // Brief highlight flash
                el.classList.add("ring-4", "ring-blue-400/50");
                setTimeout(() => el.classList.remove("ring-4", "ring-blue-400/50"), 1000);
              }
            }
          }}
          title={component.props.title || component.props.text || component.props.logoText || component.type}
        >
          {/* Expand/Collapse Button */}
          <button
            className="w-4 h-4 flex items-center justify-center mr-1"
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) {
                toggleExpanded(component.id);
              }
            }}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              )
            ) : null}
          </button>

          {/* Component Icon */}
          <span className="mr-2 text-sm">
            {getComponentIcon(component.type)}
          </span>

          {/* Component Name & Global Badge */}
          <div className="flex-1 flex items-center min-w-0 pr-2">
            <span className="text-sm text-muted-foreground truncate">
              {component.props.title ||
                component.props.text ||
                component.props.logoText ||
                component.type}
            </span>
            {component.isGlobal && (
              <span title={`Global: ${component.isGlobal}`}>
                <Globe className="w-3 h-3 text-primary ml-1.5 flex-shrink-0" />
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
            {onMoveComponentUp && (
              <button
                className="w-5 h-5 flex items-center justify-center hover:bg-muted rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveComponentUp(component.id);
                }}
                title="Move up"
              >
                <ArrowUp className="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            )}
            {onMoveComponentDown && (
              <button
                className="w-5 h-5 flex items-center justify-center hover:bg-muted rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveComponentDown(component.id);
                }}
                title="Move down"
              >
                <ArrowDown className="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            )}
            <button className="w-4 h-4 flex items-center justify-center hover:bg-muted rounded">
              <Eye className="w-3 h-3 text-muted-foreground" />
            </button>
            <button
              className="w-5 h-5 flex items-center justify-center hover:bg-destructive/10 rounded group/delete"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteComponent(component.id);
              }}
              title="Delete component"
            >
              <Trash2 className="w-3 h-3 text-muted-foreground group-hover/delete:text-destructive transition-colors" />
            </button>
          </div>
        </div>

        {/* Render Children */}
        {hasChildren && isExpanded && (
          <div>
            {component.children.map((child) =>
              renderComponent(child, level + 1)
            )}
          </div>
        )}
        
        {/* Drop indicator - bottom */}
        {isDropTarget && dropPosition === "bottom" && (
          <div className="h-0.5 bg-primary mx-2 rounded-full" />
        )}
      </div>
    );
  };

  return (
    <div 
      className={cn("h-full flex flex-col relative", dragSelect.isSelecting && "hierarchy-selecting")}
      onMouseUp={dragSelect.handleMouseUp}
      onMouseLeave={dragSelect.handleMouseLeave}
    >
      {/* Header */}
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Page Structure</h3>
      </div>

      {/* Selection indicator */}
      {dragSelect.isSelecting && (
        <div className="absolute top-14 left-0 right-0 z-10 bg-blue-500/90 text-white text-xs py-1 px-3 flex items-center justify-between">
          <span>Selecting components... ({dragSelect.hoveredCount} selected)</span>
          <span className="text-xs opacity-75">Release to confirm</span>
        </div>
      )}

      {/* Hierarchy Tree */}
      <div 
        className="flex-1 overflow-auto"
        style={{ userSelect: dragSelect.isSelecting ? 'none' : 'auto' }}
        onMouseDown={(e) => {
          // Only start selection if clicking on empty space (not on a component)
          const target = e.target as HTMLElement;
          const isEmptySpace = !target.closest('[data-hierarchy-id]') && 
                               !target.closest('button') &&
                               target.closest('.flex-1.overflow-auto');
          
          if (isEmptySpace && e.button === 0) {
            dragSelect.handleMouseDown(e, 'empty-space');
          }
        }}
        onClick={(e) => {
          // Handle click on empty space (not drag)
          const target = e.target as HTMLElement;
          const isEmptySpace = !target.closest('[data-hierarchy-id]') && 
                               !target.closest('button') &&
                               target.closest('.flex-1.overflow-auto');
          
          // Only clear selection if:
          // 1. Clicking on empty space
          // 2. Not in drag-select mode
          // 3. A drag-select didn't just complete (to prevent immediate deselection)
          if (isEmptySpace && !dragSelect.isSelecting && !dragSelect.wasJustCompleted()) {
            // Clear selection when clicking empty space
            if (onSelectComponent) {
              onSelectComponent(null);
            }
          }
        }}
      >
        <div className="p-2">
          {/* Root Page Node */}
          <div
            className="flex items-center py-1 px-2 hover:bg-muted cursor-pointer"
            onClick={() => onSelectComponent(null)}
          >
            <button
              className="w-4 h-4 flex items-center justify-center mr-1"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded("root");
              }}
            >
              {expandedItems.has("root") ? (
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              )}
            </button>
            <span className="mr-2 text-sm text-primary">📄</span>
            <span className="flex-1 text-sm font-medium text-foreground">
              Page
            </span>
          </div>

          {/* Components */}
          {expandedItems.has("root") && (
            <div className="ml-4">
              {components.map((component) => renderComponent(component, 0))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setIsAddDialogOpen(true)}
        >
          Add Component
        </Button>
      </div>

      {/* Add Component Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-panel="dialog">
          <DialogHeader>
            <DialogTitle>Add Component</DialogTitle>
            <DialogDescription>
              Select a component to add to your page
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {componentCategories.map((category) => (
              <div key={category.name}>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {category.name}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {category.components.map((component) => (
                    <button
                      key={component.type}
                      onClick={() => handleAddComponent(component.type)}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted hover:border-primary/50 transition-colors text-left group/item"
                    >
                      <div className="p-2 rounded-md bg-background border border-border group-hover/item:border-primary/30 group-hover/item:text-primary transition-colors">
                        {component.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-foreground">
                          {component.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {component.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

HierarchyPanel.displayName = "HierarchyPanel";
