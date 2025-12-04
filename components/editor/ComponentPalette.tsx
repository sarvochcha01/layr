"use client";

import { useDraggable } from "@dnd-kit/core";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, Star } from "lucide-react";
import { useState } from "react";
import { useComponentFavorites } from "@/hooks/useComponentFavorites";

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
        type: "Navbar",
        name: "Navbar",
        icon: "�",
        description: "Navigation bar with menu items",
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
        icon: "�",
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
  {
    name: "Interactive",
    components: [
      {
        type: "Accordion",
        name: "Accordion",
        icon: "📑",
        description: "Collapsible content sections",
      },
      {
        type: "Tabs",
        name: "Tabs",
        icon: "📂",
        description: "Tabbed content switcher",
      },
    ],
  },
  {
    name: "Marketing",
    components: [
      {
        type: "Testimonial",
        name: "Testimonial",
        icon: "💬",
        description: "Customer review with rating",
      },
      {
        type: "PricingCard",
        name: "Pricing Card",
        icon: "💰",
        description: "Pricing plan with features",
      },
      {
        type: "Feature",
        name: "Feature",
        icon: "✨",
        description: "Feature showcase with icon",
      },
      {
        type: "Stats",
        name: "Stats",
        icon: "📊",
        description: "Statistics and numbers",
      },
      {
        type: "CTA",
        name: "CTA",
        icon: "🎯",
        description: "Call-to-action section",
      },
    ],
  },
  {
    name: "UI Elements",
    components: [
      {
        type: "Divider",
        name: "Divider",
        icon: "➖",
        description: "Visual separator line",
      },
      {
        type: "Spacer",
        name: "Spacer",
        icon: "⬜",
        description: "Vertical spacing",
      },
      {
        type: "Badge",
        name: "Badge",
        icon: "🏷️",
        description: "Small label or tag",
      },
      {
        type: "Alert",
        name: "Alert",
        icon: "⚠️",
        description: "Notification message",
      },
    ],
  },
];

function DraggableComponent({
  component,
  isFavorite,
  onToggleFavorite,
}: {
  component: ComponentItem;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
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
      className={cn(
        "p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all relative group",
        "flex flex-col items-center text-center space-y-2",
        isDragging && "opacity-50"
      )}
    >
      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Star
          className={cn(
            "w-3 h-3",
            isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
          )}
        />
      </button>

      {/* Draggable area */}
      <div {...listeners} {...attributes} className="cursor-grab w-full">
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
    </div>
  );
}

export function ComponentPalette() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set([
      "Favorites",
      "Recent",
      ...componentCategories.map((cat) => cat.name),
    ])
  );
  const { favorites, recent, toggleFavorite, isFavorite } =
    useComponentFavorites();

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  // Get all components as flat list for favorites/recent
  const allComponents = componentCategories.flatMap((cat) => cat.components);

  const favoriteComponents = allComponents.filter((comp) =>
    favorites.includes(comp.type)
  );

  const recentComponents = recent
    .map((type) => allComponents.find((comp) => comp.type === type))
    .filter(Boolean) as ComponentItem[];

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
        {/* Favorites Section */}
        {!searchTerm && favoriteComponents.length > 0 && (
          <div>
            <button
              onClick={() => toggleCategory("Favorites")}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <span className="text-xs font-semibold text-yellow-600 uppercase tracking-wide flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400" />
                Favorites
              </span>
              <span className="text-xs text-gray-500">
                {expandedCategories.has("Favorites") ? "−" : "+"}
              </span>
            </button>

            {expandedCategories.has("Favorites") && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {favoriteComponents.map((component) => (
                  <DraggableComponent
                    key={component.type}
                    component={component}
                    isFavorite={true}
                    onToggleFavorite={() => toggleFavorite(component.type)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Section */}
        {!searchTerm && recentComponents.length > 0 && (
          <div>
            <button
              onClick={() => toggleCategory("Recent")}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                Recent
              </span>
              <span className="text-xs text-gray-500">
                {expandedCategories.has("Recent") ? "−" : "+"}
              </span>
            </button>

            {expandedCategories.has("Recent") && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {recentComponents.map((component) => (
                  <DraggableComponent
                    key={component.type}
                    component={component}
                    isFavorite={isFavorite(component.type)}
                    onToggleFavorite={() => toggleFavorite(component.type)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Regular Categories */}
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
                    isFavorite={isFavorite(component.type)}
                    onToggleFavorite={() => toggleFavorite(component.type)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredCategories.length === 0 &&
          !favoriteComponents.length &&
          !recentComponents.length && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <div className="text-sm">No components found</div>
            </div>
          )}
      </div>
    </div>
  );
}
