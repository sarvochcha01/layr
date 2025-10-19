"use client";

import { useDraggable } from "@dnd-kit/core";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useState } from "react";

interface ComponentCategory {
  name: string;
  components: ComponentItem[];
}

interface ComponentItem {
  type: string;
  name: string;
  icon: string;
  description: string;
}

const componentCategories: ComponentCategory[] = [
  {
    name: "Layout",
    components: [
      {
        type: "Header",
        name: "Header",
        icon: "📦",
        description: "Page header with navigation",
      },
      {
        type: "Footer",
        name: "Footer",
        icon: "🦶",
        description: "Page footer with links",
      },
      {
        type: "Section",
        name: "Section",
        icon: "📄",
        description: "Content section container",
      },
      {
        type: "Container",
        name: "Container",
        icon: "📦",
        description: "Responsive container",
      },
      {
        type: "Grid",
        name: "Grid",
        icon: "🏗️",
        description: "Responsive grid layout",
      },
    ],
  },
  {
    name: "Content",
    components: [
      {
        type: "Hero",
        name: "Hero",
        icon: "🎯",
        description: "Hero section with CTA",
      },
      {
        type: "Card",
        name: "Card",
        icon: "🃏",
        description: "Content card with image",
      },
      {
        type: "Text",
        name: "Text",
        icon: "📝",
        description: "Text content block",
      },
      {
        type: "Button",
        name: "Button",
        icon: "🔘",
        description: "Call-to-action button",
      },
    ],
  },
  {
    name: "Media",
    components: [
      {
        type: "Image",
        name: "Image",
        icon: "🖼️",
        description: "Responsive image",
      },
      {
        type: "Video",
        name: "Video",
        icon: "🎥",
        description: "Video player or embed",
      },
    ],
  },
  {
    name: "Forms",
    components: [
      {
        type: "Form",
        name: "Form",
        icon: "📋",
        description: "Contact or signup form",
      },
    ],
  },
];

function DraggableComponent({ component }: { component: ComponentItem }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `palette-${component.type}`,
      data: {
        type: "palette-item",
        componentType: component.type,
      },
    });

  // Don't apply transform to the original element - let DragOverlay handle it
  const style = undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "p-3 border border-gray-200 rounded-lg cursor-grab hover:border-blue-300 hover:shadow-sm transition-all",
        "flex flex-col items-center text-center space-y-2",
        isDragging && "opacity-50"
      )}
    >
      <span className="text-2xl">{component.icon}</span>
      <div>
        <div className="text-xs font-medium text-gray-900">
          {component.name}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {component.description}
        </div>
      </div>
    </div>
  );
}

export function ComponentPalette() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(componentCategories.map((cat) => cat.name))
  );

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredCategories = componentCategories
    .map((category) => ({
      ...category,
      components: category.components.filter(
        (component) =>
          component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          component.description.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.components.length > 0);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Components</h3>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>
      </div>

      {/* Component Categories */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {filteredCategories.map((category) => (
          <div key={category.name}>
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.name)}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                {category.name}
              </span>
              <span className="text-xs text-gray-500">
                {expandedCategories.has(category.name) ? "−" : "+"}
              </span>
            </button>

            {/* Components Grid */}
            {expandedCategories.has(category.name) && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {category.components.map((component) => (
                  <DraggableComponent
                    key={component.type}
                    component={component}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🔍</div>
            <div className="text-sm">No components found</div>
          </div>
        )}
      </div>
    </div>
  );
}
