"use client";

import { useState } from "react";
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

interface HierarchyPanelProps {
  components: ComponentDefinition[];
  selectedComponentIds?: string[];
  selectedComponentId?: string | null;
  onSelectComponent: (id: string | null) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent?: (id: string) => void;
  onAddComponent?: (componentType: string) => void;
  onMoveComponentUp?: (id: string) => void;
  onMoveComponentDown?: (id: string) => void;
}

export function HierarchyPanel({
  components,
  selectedComponentIds,
  selectedComponentId,
  onSelectComponent,
  onDeleteComponent,
  onDuplicateComponent,
  onAddComponent,
  onMoveComponentUp,
  onMoveComponentDown,
}: HierarchyPanelProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(["root"])
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Determine selected ID for backward compatibility
  const currentSelectedId = selectedComponentId || (selectedComponentIds && selectedComponentIds[0]) || null;

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

  const renderComponent = (
    component: ComponentDefinition,
    level: number = 0
  ) => {
    const isSelected = currentSelectedId === component.id;
    const isExpanded = expandedItems.has(component.id);
    const hasChildren = component.children.length > 0;

    return (
      <div key={component.id}>
        <div
          className={cn(
            "flex items-center py-1 px-2 hover:bg-muted cursor-pointer group",
            isSelected && "bg-primary/10 border-r-2 border-primary"
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => onSelectComponent(component.id)}
          onDoubleClick={() => {
            onSelectComponent(component.id);
            // Find the component element in the canvas and scroll to it
            const el = document.querySelector(`[data-component-id="${component.id}"]`);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
              // Brief highlight flash
              el.classList.add("ring-4", "ring-blue-400/50");
              setTimeout(() => el.classList.remove("ring-4", "ring-blue-400/50"), 1000);
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
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Page Structure</h3>
      </div>

      {/* Hierarchy Tree */}
      <div className="flex-1 overflow-auto">
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
}
