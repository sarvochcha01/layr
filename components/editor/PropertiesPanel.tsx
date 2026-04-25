"use client";
import React from "react";
import { useState, useRef, useEffect } from "react";
import { ComponentDefinition, Page, GlobalComponents } from "@/types/editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Globe, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ComponentProperties } from "./properties/ComponentProperties";
import { PageProperties } from "./properties/PageProperties";

interface PropertiesPanelProps {
  selectedComponent: ComponentDefinition | null;
  selectedComponents?: ComponentDefinition[];
  onUpdateComponent: (id: string, updates: Record<string, any>) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
  pages?: Page[];
  currentPage?: Page;
  onUpdatePage?: (updates: Partial<Page>) => void;
  globalComponents?: GlobalComponents;
  onMarkAsGlobal?: (componentId: string, globalName: string) => void;
  onUnmarkGlobal?: (componentId: string) => void;
  onApplyGlobalTemplate?: (componentId: string, globalName: string) => void;
}

export function PropertiesPanel({
  selectedComponent,
  selectedComponents = [],
  onUpdateComponent,
  onDeleteComponent,
  onDuplicateComponent,
  pages = [],
  currentPage,
  onUpdatePage,
  globalComponents = {},
  onMarkAsGlobal,
  onUnmarkGlobal,
  onApplyGlobalTemplate,
}: PropertiesPanelProps) {
  const [showGlobalDialog, setShowGlobalDialog] = useState(false);
  const [globalName, setGlobalName] = useState("");

  // Debounced update for continuous changes (color picker, sliders, etc.)
  const debouncedUpdateRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<Record<string, any>>({});

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debouncedUpdateRef.current) {
        clearTimeout(debouncedUpdateRef.current);
      }
    };
  }, []);

  const updateProp = (key: string, value: any) => {
    // Get the primary component (first selected or single selected)
    const primary = selectedComponent || selectedComponents[0];
    if (!primary) return;

    // Accumulate updates
    pendingUpdatesRef.current[key] = value;

    // Clear existing timeout
    if (debouncedUpdateRef.current) {
      clearTimeout(debouncedUpdateRef.current);
    }

    // Set new timeout
    debouncedUpdateRef.current = setTimeout(() => {
      // If multiple components are selected and they're all the same type, update all of them
      if (selectedComponents.length > 1) {
        const sameType = selectedComponents.every(c => c.type === primary.type);
        if (sameType) {
          // Apply updates to all selected components of the same type
          selectedComponents.forEach(component => {
            onUpdateComponent(component.id, pendingUpdatesRef.current);
          });
        } else {
          // Different types selected, only update the primary one
          onUpdateComponent(primary.id, pendingUpdatesRef.current);
        }
      } else {
        // Single component selected
        onUpdateComponent(primary.id, pendingUpdatesRef.current);
      }
      
      pendingUpdatesRef.current = {};
      debouncedUpdateRef.current = null;
    }, 150); // Reduced from 300ms to 150ms for snappier feedback
  };

  // ── No component selected ──────────────────────────────
  if (!selectedComponent && selectedComponents.length === 0) {
    if (currentPage && onUpdatePage) {
      return <PageProperties currentPage={currentPage} onUpdatePage={onUpdatePage} />;
    }

    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Properties</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div className="text-4xl mb-2">⚙️</div>
            <div className="text-sm">
              Select a component to edit its properties
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get the primary component (first selected or the single selected one)
  const primaryComponent = selectedComponent || selectedComponents[0];
  
  if (!primaryComponent) {
    // Fallback to page properties
    if (currentPage && onUpdatePage) {
      return <PageProperties currentPage={currentPage} onUpdatePage={onUpdatePage} />;
    }
    return null;
  }

  // ── Multiple components selected with different types ──────────────────────────────
  // Show page properties instead when different component types are selected
  if (selectedComponents.length > 1) {
    const allSameType = selectedComponents.every(c => c.type === primaryComponent.type);
    if (!allSameType) {
      // Different types selected - show page properties
      if (currentPage && onUpdatePage) {
        return <PageProperties currentPage={currentPage} onUpdatePage={onUpdatePage} />;
      }
      
      return (
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Properties</h3>
          </div>
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="text-4xl mb-2">⚠️</div>
              <div className="text-sm">
                {selectedComponents.length} different component types selected
              </div>
              <div className="text-xs mt-2">
                Select components of the same type to edit together
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // ── Component(s) selected (same type) ─────────────────────────────────
  const isGlobal = !!primaryComponent.isGlobal;
  const existingGlobalNames = Object.keys(globalComponents);

  const handleMarkAsGlobal = () => {
    if (!globalName.trim() || !onMarkAsGlobal) return;
    onMarkAsGlobal(primaryComponent.id, globalName.trim());
    setShowGlobalDialog(false);
    setGlobalName("");
  };

  const handleApplyExistingGlobal = (name: string) => {
    if (!onApplyGlobalTemplate) return;
    onApplyGlobalTemplate(primaryComponent.id, name);
    setShowGlobalDialog(false);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" data-panel="properties">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
              Properties
            </h3>
            {selectedComponents.length > 1 ? (
              <p className="text-[10px] text-muted-foreground/70 mt-1">
                {selectedComponents.length} Components Selected
                {selectedComponents.every(c => c.type === primaryComponent.type) && (
                  <span className="text-primary"> • All {primaryComponent.type}</span>
                )}
              </p>
            ) : (
              <p className="text-[10px] text-muted-foreground/70 mt-1">
                {primaryComponent.type} Component
              </p>
            )}
          </div>
          {/* Global toggle button - only show for single selection */}
          {selectedComponents.length === 1 && (
            isGlobal ? (
              <button
                onClick={() => onUnmarkGlobal?.(primaryComponent.id)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium hover:bg-primary/25 transition-colors"
                title={`Global: ${primaryComponent.isGlobal} — Click to unmark`}
              >
                <Globe className="w-3 h-3" />
                {primaryComponent.isGlobal}
                <X className="w-3 h-3 opacity-60" />
              </button>
            ) : (
              <button
                onClick={() => setShowGlobalDialog(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
                title="Mark as Global Component"
              >
                <Globe className="w-3 h-3" />
                Make Global
              </button>
            )
          )}
        </div>
      </div>

      {/* Properties Form */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4">
          <ComponentProperties
            type={primaryComponent.type}
            props={primaryComponent.props}
            updateProp={updateProp}
            pages={pages}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 p-4 border-t border-border space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs"
          onClick={() => primaryComponent && onDuplicateComponent(primaryComponent.id)}
        >
          Duplicate Component
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="w-full h-8 text-xs"
          onClick={() => primaryComponent && onDeleteComponent(primaryComponent.id)}
        >
          Delete Component
        </Button>
      </div>

      {/* Global Name Dialog */}
      <Dialog open={showGlobalDialog} onOpenChange={setShowGlobalDialog}>
        <DialogContent className="dark">
          <DialogHeader>
            <DialogTitle>Mark as Global Component</DialogTitle>
            <DialogDescription>
              Global components sync their styles across all pages. Give this
              component a global name, or select an existing global group to
              join.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Existing global groups */}
            {existingGlobalNames.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Join Existing Global Group
                </Label>
                <div className="space-y-1">
                  {existingGlobalNames.map((name) => (
                    <button
                      key={name}
                      onClick={() => handleApplyExistingGlobal(name)}
                      className="w-full flex items-center gap-2 p-2 rounded-md border border-border hover:bg-muted text-sm text-left transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5 text-primary" />
                      <span className="font-medium">{name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        ({globalComponents[name]?.type})
                      </span>
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-background px-2 text-muted-foreground">
                      or create new
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* New global name input */}
            <div className="space-y-2">
              <Label htmlFor="globalName">Global Name</Label>
              <Input
                id="globalName"
                value={globalName}
                onChange={(e) => setGlobalName(e.target.value)}
                placeholder={`e.g. "Main Navbar", "Site Footer"`}
                onKeyDown={(e) => e.key === "Enter" && handleMarkAsGlobal()}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowGlobalDialog(false);
                setGlobalName("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleMarkAsGlobal} disabled={!globalName.trim()}>
              Mark as Global
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
