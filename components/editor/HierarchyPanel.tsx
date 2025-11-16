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
} from "lucide-react";
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
  selectedComponentIds: string[];
  onSelectComponent: (id: string | null) => void;
  onDeleteComponent: (id: string) => void;
  onAddComponent?: (componentType: string) => void;
}

export function HierarchyPanel({
  components,
  selectedComponentIds,
  onSelectComponent,
  onDeleteComponent,
  onAddComponent,
}: HierarchyPanelProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(["root"])
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const componentTypes = [
    { type: "Header", icon: "📦", description: "Page header with navigation" },
    {
      type: "Hero",
      icon: "🎯",
      description: "Hero section with title and CTA",
    },
    { type: "Section", icon: "📄", description: "Generic content section" },
    { type: "Container", icon: "📦", description: "Container for content" },
    { type: "Grid", icon: "🏗️", description: "Grid layout" },
    { type: "Card", icon: "🃏", description: "Card component" },
    { type: "Button", icon: "🔘", description: "Button element" },
    { type: "Text", icon: "📝", description: "Text content" },
    { type: "Image", icon: "🖼️", description: "Image element" },
    { type: "Video", icon: "🎥", description: "Video player" },
    { type: "Form", icon: "📋", description: "Form with inputs" },
    { type: "Navbar", icon: "🧭", description: "Navigation bar" },
    { type: "Footer", icon: "🦶", description: "Page footer" },
    {
      type: "Accordion",
      icon: "📑",
      description: "Collapsible accordion items",
    },
    { type: "Tabs", icon: "📂", description: "Tabbed content sections" },
    {
      type: "Testimonial",
      icon: "💬",
      description: "Customer testimonial with rating",
    },
    { type: "PricingCard", icon: "💰", description: "Pricing plan card" },
    { type: "Feature", icon: "✨", description: "Feature highlight with icon" },
    { type: "Stats", icon: "📊", description: "Statistics display" },
    { type: "CTA", icon: "🎯", description: "Call-to-action section" },
    { type: "Divider", icon: "➖", description: "Horizontal divider line" },
    { type: "Spacer", icon: "⬜", description: "Vertical spacing element" },
    { type: "Badge", icon: "🏷️", description: "Label or status badge" },
    { type: "Alert", icon: "⚠️", description: "Alert or notification box" },
  ];

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
      Accordion: "📑",
      Tabs: "📂",
      Testimonial: "💬",
      PricingCard: "💰",
      Feature: "✨",
      Stats: "📊",
      CTA: "🎯",
      Divider: "➖",
      Spacer: "⬜",
      Badge: "🏷️",
      Alert: "⚠️",
    };
    return icons[type] || "📦";
  };

  const renderComponent = (
    component: ComponentDefinition,
    level: number = 0
  ) => {
    const isSelected = selectedComponentIds.includes(component.id);
    const isExpanded = expandedItems.has(component.id);
    const hasChildren = component.children.length > 0;

    return (
      <div key={component.id}>
        <div
          className={cn(
            "flex items-center py-1 px-2 hover:bg-gray-50 cursor-pointer group",
            isSelected && "bg-blue-50 border-r-2 border-blue-500"
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => onSelectComponent(component.id)}
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
                <ChevronDown className="w-3 h-3 text-gray-500" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-500" />
              )
            ) : null}
          </button>

          {/* Component Icon */}
          <span className="mr-2 text-sm">
            {getComponentIcon(component.type)}
          </span>

          {/* Component Name */}
          <span className="flex-1 text-sm text-gray-700 truncate">
            {component.props.title ||
              component.props.text ||
              component.props.logoText ||
              component.type}
          </span>

          {/* Actions */}
          <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
            <button className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 rounded">
              <Eye className="w-3 h-3 text-gray-500" />
            </button>
            <button
              className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 rounded"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteComponent(component.id);
              }}
            >
              <Trash2 className="w-3 h-3 text-gray-500" />
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
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Page Structure</h3>
      </div>

      {/* Hierarchy Tree */}
      <div className="flex-1 overflow-auto">
        <div className="p-2">
          {/* Root Page Node */}
          <div
            className="flex items-center py-1 px-2 hover:bg-gray-50 cursor-pointer"
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
                <ChevronDown className="w-3 h-3 text-gray-500" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-500" />
              )}
            </button>
            <span className="mr-2 text-sm">📄</span>
            <span className="flex-1 text-sm font-medium text-gray-900">
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
      <div className="p-4 border-t border-gray-200">
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

          <div className="grid grid-cols-2 gap-3 mt-4">
            {componentTypes.map((component) => (
              <button
                key={component.type}
                onClick={() => handleAddComponent(component.type)}
                className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent hover:border-primary transition-colors text-left"
              >
                <span className="text-2xl">{component.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{component.type}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {component.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
