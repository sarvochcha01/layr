"use client";

import { useDraggable } from "@dnd-kit/core";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { 
  Search, Star, LayoutTemplate, Navigation, SplitSquareVertical, 
  Square, Box, Grid3X3, Target, CreditCard, Type, Pointer, 
  Image as ImageIcon, Video, FileText, ListCollapse, FolderTree, 
  MessageSquare, DollarSign, Sparkles, BarChart, 
  Megaphone, Minus, ArrowUpDown, Tag, AlertCircle 
} from "lucide-react";
import { useState } from "react";
import { useComponentFavorites } from "@/hooks/useComponentFavorites";

interface ComponentCategory {
  name: string;
  components: ComponentItem[];
}

interface ComponentItem {
  type: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const componentCategories: ComponentCategory[] = [
  {
    name: "Layout",
    components: [
      {
        type: "Header",
        name: "Header",
        icon: <LayoutTemplate className="w-5 h-5" />,
        description: "Page header with navigation",
      },
      {
        type: "Navbar",
        name: "Navbar",
        icon: <Navigation className="w-5 h-5" />,
        description: "Navigation bar with menu items",
      },
      {
        type: "Footer",
        name: "Footer",
        icon: <SplitSquareVertical className="w-5 h-5" />,
        description: "Page footer with links",
      },
      {
        type: "Section",
        name: "Section",
        icon: <Square className="w-5 h-5" />,
        description: "Content section container",
      },
      {
        type: "Container",
        name: "Container",
        icon: <Box className="w-5 h-5" />,
        description: "Responsive container",
      },
      {
        type: "Grid",
        name: "Grid",
        icon: <Grid3X3 className="w-5 h-5" />,
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
        icon: <Target className="w-5 h-5" />,
        description: "Hero section with CTA",
      },
      {
        type: "Card",
        name: "Card",
        icon: <CreditCard className="w-5 h-5" />,
        description: "Content card with image",
      },
      {
        type: "Text",
        name: "Text",
        icon: <Type className="w-5 h-5" />,
        description: "Text content block",
      },
      {
        type: "Button",
        name: "Button",
        icon: <Pointer className="w-5 h-5" />,
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
        icon: <ImageIcon className="w-5 h-5" />,
        description: "Responsive image",
      },
      {
        type: "Video",
        name: "Video",
        icon: <Video className="w-5 h-5" />,
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
        icon: <FileText className="w-5 h-5" />,
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
        icon: <ListCollapse className="w-5 h-5" />,
        description: "Collapsible content sections",
      },
      {
        type: "Tabs",
        name: "Tabs",
        icon: <FolderTree className="w-5 h-5" />,
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
        icon: <MessageSquare className="w-5 h-5" />,
        description: "Customer review with rating",
      },
      {
        type: "PricingCard",
        name: "Pricing Card",
        icon: <DollarSign className="w-5 h-5" />,
        description: "Pricing plan with features",
      },
      {
        type: "Feature",
        name: "Feature",
        icon: <Sparkles className="w-5 h-5" />,
        description: "Feature showcase with icon",
      },
      {
        type: "Stats",
        name: "Stats",
        icon: <BarChart className="w-5 h-5" />,
        description: "Statistics and numbers",
      },
      {
        type: "CTA",
        name: "CTA",
        icon: <Megaphone className="w-5 h-5" />,
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
        icon: <Minus className="w-5 h-5" />,
        description: "Visual separator line",
      },
      {
        type: "Spacer",
        name: "Spacer",
        icon: <ArrowUpDown className="w-5 h-5" />,
        description: "Vertical spacing",
      },
      {
        type: "Badge",
        name: "Badge",
        icon: <Tag className="w-5 h-5" />,
        description: "Small label or tag",
      },
      {
        type: "Alert",
        name: "Alert",
        icon: <AlertCircle className="w-5 h-5" />,
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
        "p-3 border border-border rounded-lg hover:border-primary hover:shadow-sm transition-all relative group bg-card",
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
            isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
          )}
        />
      </button>

      {/* Draggable area */}
      <div {...listeners} {...attributes} className="cursor-grab w-full flex flex-col items-center">
        <div className="text-muted-foreground mb-2 p-2 bg-muted rounded-md group-hover:bg-primary/20 group-hover:text-primary transition-colors">
          {component.icon}
        </div>
        <div>
          <div className="text-xs font-medium text-foreground">
            {component.name}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1 leading-tight">
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
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Components</h3>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-8 text-xs bg-background border-border"
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
              <span className="text-[10px] text-muted-foreground">
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
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                Recent
              </span>
              <span className="text-[10px] text-muted-foreground">
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
              <span className="text-xs font-semibold text-foreground opacity-80 uppercase tracking-wide">
                {category.name}
              </span>
              <span className="text-[10px] text-muted-foreground">
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
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2 opacity-30">🔍</div>
              <div className="text-sm">No components found</div>
            </div>
          )}
      </div>
    </div>
  );
}
