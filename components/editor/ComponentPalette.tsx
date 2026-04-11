"use client";

import { useDraggable } from "@dnd-kit/core";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, Star, Puzzle, Trash2, Code2 } from "lucide-react";
import { useState } from "react";
import { useComponentFavorites } from "@/hooks/useComponentFavorites";
import { ComponentCategory, ComponentItem, componentCategories } from "./config/components";
import { GlobalComponents, CustomComponents, ComponentDefinition } from "@/types/editor";
import { Globe } from "lucide-react";

function DraggableGlobalComponent({
  globalName,
  componentType,
}: {
  globalName: string;
  componentType: string;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-global-${globalName}`,
    data: {
      type: "palette-global",
      globalName,
      componentType,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "p-3 border border-border rounded-lg hover:border-primary hover:shadow-sm transition-all relative group bg-card",
        "flex flex-col items-center text-center space-y-2",
        isDragging && "opacity-50"
      )}
    >
      {/* Draggable area */}
      <div {...listeners} {...attributes} className="cursor-grab w-full flex flex-col items-center">
        <div className="text-muted-foreground mb-2 p-2 bg-muted rounded-md group-hover:bg-primary/20 group-hover:text-primary transition-colors">
           <Globe className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <div className="text-xs font-medium text-foreground line-clamp-1">
            {globalName}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1 leading-tight">
            ({componentType})
          </div>
        </div>
      </div>
    </div>
  );
}

function DraggableCustomComponent({
  customName,
  componentType,
  onDelete,
}: {
  customName: string;
  componentType: string;
  onDelete?: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-custom-${customName}`,
    data: {
      type: "palette-custom",
      customName,
      componentType,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "p-3 border border-border rounded-lg hover:border-purple-400 hover:shadow-sm transition-all relative group bg-card",
        "flex flex-col items-center text-center space-y-2",
        isDragging && "opacity-50"
      )}
    >
      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:text-destructive"
          title="Delete custom component"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}

      {/* Draggable area */}
      <div {...listeners} {...attributes} className="cursor-grab w-full flex flex-col items-center">
        <div className="text-muted-foreground mb-2 p-2 bg-muted rounded-md group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors">
           <Puzzle className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <div className="text-xs font-medium text-foreground line-clamp-1">
            {customName}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1 leading-tight">
            ({componentType})
          </div>
        </div>
      </div>
    </div>
  );
}

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

export function ComponentPalette({
  globalComponents = {},
  customComponents = {},
  onDeleteCustomComponent,
  selectedComponent,
  onSaveCustomComponent,
  onWriteCode,
}: {
  globalComponents?: GlobalComponents;
  customComponents?: CustomComponents;
  onDeleteCustomComponent?: (name: string) => void;
  selectedComponent?: ComponentDefinition | null;
  onSaveCustomComponent?: (componentId: string, customName: string) => void;
  onWriteCode?: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [customNameInput, setCustomNameInput] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set([
      "Custom",
      "Global",
      "Favorites",
      "Recent",
      ...componentCategories.map((cat) => cat.name),
    ])
  );
  const { favorites, recent, toggleFavorite, isFavorite } =
    useComponentFavorites();

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(categoryName)) {
        newExpanded.delete(categoryName);
      } else {
        newExpanded.add(categoryName);
      }
      return newExpanded;
    });
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
        {/* Custom Components Section */}
        {!searchTerm && (
          <div>
            <button
              onClick={() => toggleCategory("Custom")}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <span className="text-xs font-semibold text-purple-500 uppercase tracking-wide flex items-center gap-1">
                <Puzzle className="w-3 h-3 text-purple-400" />
                Custom Components
              </span>
              <span className="text-[10px] text-muted-foreground">
                {expandedCategories.has("Custom") ? "−" : "+"}
              </span>
            </button>

            {expandedCategories.has("Custom") && (
              <div className="space-y-2 mb-4">
                {Object.keys(customComponents).length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(customComponents).map(([name, comp]) => (
                      <DraggableCustomComponent
                        key={`custom-${name}`}
                        customName={name}
                        componentType={comp.type}
                        onDelete={onDeleteCustomComponent ? () => onDeleteCustomComponent(name) : undefined}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground px-1">
                    No custom components yet.
                  </p>
                )}

                {/* Save selected as custom */}
                {selectedComponent && onSaveCustomComponent && !showSaveDialog && (
                  <button
                    onClick={() => {
                      setCustomNameInput(selectedComponent.type + " Custom");
                      setShowSaveDialog(true);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium text-purple-400 border border-purple-500/30 rounded-md hover:bg-purple-500/10 transition-colors"
                  >
                    <Puzzle className="w-3 h-3" />
                    Save Selected as Custom
                  </button>
                )}

                {/* Save dialog */}
                {showSaveDialog && selectedComponent && onSaveCustomComponent && (
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={customNameInput}
                      onChange={(e) => setCustomNameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && customNameInput.trim()) {
                          onSaveCustomComponent(selectedComponent.id, customNameInput.trim());
                          setShowSaveDialog(false);
                          setCustomNameInput("");
                        } else if (e.key === "Escape") {
                          setShowSaveDialog(false);
                        }
                      }}
                      placeholder="Component name..."
                      autoFocus
                      className="flex-1 text-xs px-2 py-1.5 bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <button
                      onClick={() => {
                        if (customNameInput.trim()) {
                          onSaveCustomComponent(selectedComponent.id, customNameInput.trim());
                          setShowSaveDialog(false);
                          setCustomNameInput("");
                        }
                      }}
                      className="px-2.5 py-1.5 text-[11px] font-medium bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                )}

                {/* Write Code button */}
                {onWriteCode && (
                  <button
                    onClick={onWriteCode}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium text-purple-400 border border-purple-500/30 rounded-md hover:bg-purple-500/10 transition-colors"
                  >
                    <Code2 className="w-3 h-3" />
                    Write Code
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Global Components Section */}
        {!searchTerm && Object.keys(globalComponents).length > 0 && (
          <div>
            <button
              onClick={() => toggleCategory("Global")}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <span className="text-xs font-semibold text-blue-500 uppercase tracking-wide flex items-center gap-1">
                <Globe className="w-3 h-3 text-blue-400" />
                Global Components
              </span>
              <span className="text-[10px] text-muted-foreground">
                {expandedCategories.has("Global") ? "−" : "+"}
              </span>
            </button>

            {expandedCategories.has("Global") && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {Object.entries(globalComponents).map(([name, comp]) => (
                  <DraggableGlobalComponent
                    key={`global-${name}`}
                    globalName={name}
                    componentType={comp.type}
                  />
                ))}
              </div>
            )}
          </div>
        )}

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
