"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Copy,
  GripVertical,
  Eye,
  EyeOff,
  Zap,
  MousePointer,
  MousePointerClick,
  ArrowDownToLine,
  LogOut,
  Settings,
  RefreshCw,
  ScrollText,
  Play,
  Layers,
  AlertTriangle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { ComponentDefinition } from "@/types/editor";
import {
  AnimationDefinition,
  AnimationTrigger,
  AnimationPreset,
  AnimationCategory,
  ANIMATION_PRESETS,
  TRIGGER_LABELS,
  EASE_OPTIONS,
  createAnimationDefinition,
  getPresetsByCategory,
} from "@/types/animation";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface AnimationPanelProps {
  selectedComponent: ComponentDefinition | null;
  selectedComponents?: ComponentDefinition[];
  onUpdateComponent: (id: string, updates: Record<string, any>) => void;
}

// ═══════════════════════════════════════════════════════════
// Main Panel
// ═══════════════════════════════════════════════════════════

export function AnimationPanel({
  selectedComponent,
  selectedComponents = [],
  onUpdateComponent,
}: AnimationPanelProps) {
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<AnimationTrigger>("onScroll");

  const primaryComponent = selectedComponent || selectedComponents[0];
  const animations: AnimationDefinition[] = primaryComponent?.props?.animations || [];

  // ── No component selected ──────────────────────────────
  if (!primaryComponent) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
            Animations
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center px-6">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3 mx-auto">
              <Sparkles className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="text-sm font-medium mb-1">No Component Selected</div>
            <div className="text-xs text-muted-foreground/70">
              Select a component to add animations
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Helpers ────────────────────────────────────────────

  const updateAnimations = (newAnims: AnimationDefinition[]) => {
    onUpdateComponent(primaryComponent.id, { animations: newAnims });
  };

  const addAnimation = (trigger: AnimationTrigger, preset: AnimationPreset) => {
    const newAnim = createAnimationDefinition(trigger, preset);
    updateAnimations([...animations, newAnim]);
    setShowPresetPicker(false);
  };

  const removeAnimation = (animId: string) => {
    updateAnimations(animations.filter((a) => a.id !== animId));
  };

  const updateAnimation = (animId: string, updates: Partial<AnimationDefinition>) => {
    updateAnimations(
      animations.map((a) => (a.id === animId ? { ...a, ...updates } : a)),
    );
  };

  const duplicateAnimation = (animId: string) => {
    const source = animations.find((a) => a.id === animId);
    if (!source) return;
    const dup: AnimationDefinition = {
      ...source,
      id: `anim_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    };
    updateAnimations([...animations, dup]);
  };

  const toggleAnimation = (animId: string) => {
    const anim = animations.find((a) => a.id === animId);
    if (anim) updateAnimation(animId, { enabled: !anim.enabled });
  };

  // ── Multi-select guard ─────────────────────────────────
  if (selectedComponents.length > 1) {
    const allSameType = selectedComponents.every((c) => c.type === primaryComponent.type);
    if (!allSameType) {
      return (
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
              Animations
            </h3>
          </div>
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center px-6">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3 mx-auto">
                <AlertTriangle className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-sm">
                {selectedComponents.length} different types selected
              </div>
              <div className="text-xs mt-2">
                Select same-type components to edit animations
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col overflow-hidden" data-panel="animations">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
              Animations
            </h3>
            <p className="text-[10px] text-muted-foreground/70 mt-1">
              {primaryComponent.type} Component
              {animations.length > 0 && (
                <span className="text-primary ml-1">
                  • {animations.length} animation{animations.length !== 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Animation List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {animations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="text-sm font-medium text-foreground mb-1">
              No Animations Yet
            </div>
            <div className="text-xs text-muted-foreground mb-4 max-w-[200px]">
              Add scroll reveals, hover effects, click interactions, and more.
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => setShowPresetPicker(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Animation
            </Button>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {animations.map((anim, index) => (
              <AnimationCard
                key={anim.id}
                animation={anim}
                index={index}
                onUpdate={(updates) => updateAnimation(anim.id, updates)}
                onDelete={() => removeAnimation(anim.id)}
                onDuplicate={() => duplicateAnimation(anim.id)}
                onToggle={() => toggleAnimation(anim.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Button (when animations exist) */}
      {animations.length > 0 && (
        <div className="flex-shrink-0 p-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs gap-1.5 border-dashed"
            onClick={() => setShowPresetPicker(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Animation
          </Button>
        </div>
      )}

      {/* Preset Picker Dialog */}
      <PresetPickerDialog
        open={showPresetPicker}
        onClose={() => setShowPresetPicker(false)}
        selectedTrigger={selectedTrigger}
        onTriggerChange={setSelectedTrigger}
        onSelect={(preset) => addAnimation(selectedTrigger, preset)}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Animation Card — Individual animation config
// ═══════════════════════════════════════════════════════════

function AnimationCard({
  animation,
  index,
  onUpdate,
  onDelete,
  onDuplicate,
  onToggle,
}: {
  animation: AnimationDefinition;
  index: number;
  onUpdate: (updates: Partial<AnimationDefinition>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggle: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(index === 0);
  const preset = ANIMATION_PRESETS[animation.preset];
  const trigger = TRIGGER_LABELS[animation.trigger];

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-colors ${
        animation.enabled
          ? "border-border bg-card"
          : "border-border/50 bg-muted/30 opacity-60"
      }`}
    >
      {/* Card Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <GripVertical className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />

        {/* Trigger badge */}
        <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium flex-shrink-0 flex items-center gap-1">
          <TriggerIcon trigger={animation.trigger} className="w-3 h-3" />
          {trigger.label}
        </span>

        {/* Preset name */}
        <span className="text-xs font-medium text-foreground truncate flex-1">
          {preset?.label || animation.preset}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-muted rounded transition-colors"
            title={animation.enabled ? "Disable" : "Enable"}
          >
            {animation.enabled ? (
              <Eye className="w-3 h-3 text-muted-foreground" />
            ) : (
              <EyeOff className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={onDuplicate}
            className="p-1 hover:bg-muted rounded transition-colors"
            title="Duplicate"
          >
            <Copy className="w-3 h-3 text-muted-foreground" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 hover:bg-destructive/10 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3 h-3 text-destructive/70" />
          </button>
        </div>

        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        )}
      </div>

      {/* Expanded Settings */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 space-y-3 border-t border-border/50">
          {/* Trigger Select */}
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase text-muted-foreground font-semibold">
              Trigger
            </Label>
            <div className="relative border rounded-md">
              <select
                value={animation.trigger}
                onChange={(e) => onUpdate({ trigger: e.target.value as AnimationTrigger })}
                className="w-full h-8 px-2 text-xs bg-transparent appearance-none focus:outline-none"
              >
                {Object.entries(TRIGGER_LABELS).map(([key, val]) => (
                  <option key={key} value={key} className="bg-background text-foreground">
                    {val.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preset Select */}
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase text-muted-foreground font-semibold">
              Animation
            </Label>
            <div className="relative border rounded-md">
              <select
                value={animation.preset}
                onChange={(e) => {
                  const newPreset = e.target.value as AnimationPreset;
                  const meta = ANIMATION_PRESETS[newPreset];
                  onUpdate({
                    preset: newPreset,
                    duration: meta?.defaultDuration || 0.6,
                    ease: meta?.defaultEase || "power2.out",
                  });
                }}
                className="w-full h-8 px-2 text-xs bg-transparent appearance-none focus:outline-none"
              >
                {(Object.entries(ANIMATION_PRESETS) as [AnimationPreset, any][]).map(
                  ([key, meta]) => (
                    <option key={key} value={key} className="bg-background text-foreground">
                      {meta.label}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          {/* Timing: Duration + Delay */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase text-muted-foreground font-semibold">
                Duration (s)
              </Label>
              <Input
                type="number"
                min={0}
                max={10}
                step={0.1}
                value={animation.duration}
                onChange={(e) => onUpdate({ duration: parseFloat(e.target.value) || 0.6 })}
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase text-muted-foreground font-semibold">
                Delay (s)
              </Label>
              <Input
                type="number"
                min={0}
                max={10}
                step={0.1}
                value={animation.delay}
                onChange={(e) => onUpdate({ delay: parseFloat(e.target.value) || 0 })}
                className="h-7 text-xs"
              />
            </div>
          </div>

          {/* Ease */}
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase text-muted-foreground font-semibold">
              Easing
            </Label>
            <div className="relative border rounded-md">
              <select
                value={animation.ease}
                onChange={(e) => onUpdate({ ease: e.target.value })}
                className="w-full h-8 px-2 text-xs bg-transparent appearance-none focus:outline-none"
              >
                {EASE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-background text-foreground">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scroll-specific settings */}
          {(animation.trigger === "onScroll" || animation.trigger === "whileInView") && (
            <div className="space-y-3 p-2.5 bg-muted/50 rounded-md border border-border/50">
              <div className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
                <ScrollText className="w-3 h-3" /> Scroll Settings
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Start</Label>
                  <Input
                    type="text"
                    value={animation.scrollStart || "top 80%"}
                    onChange={(e) => onUpdate({ scrollStart: e.target.value })}
                    className="h-7 text-xs font-mono"
                    placeholder="top 80%"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">End</Label>
                  <Input
                    type="text"
                    value={animation.scrollEnd || "top 20%"}
                    onChange={(e) => onUpdate({ scrollEnd: e.target.value })}
                    className="h-7 text-xs font-mono"
                    placeholder="top 20%"
                  />
                </div>
              </div>
              {animation.trigger === "onScroll" && (
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-muted-foreground">
                    Scrub (tie to scroll)
                  </Label>
                  <Switch
                    checked={animation.scrub || false}
                    onCheckedChange={(checked) => onUpdate({ scrub: checked })}
                    className="scale-75 origin-right"
                  />
                </div>
              )}
            </div>
          )}

          {/* Hover/Click settings */}
          {(animation.trigger === "onHover" || animation.trigger === "onClick") && (
            <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-md border border-border/50">
              <Label className="text-[10px] uppercase text-muted-foreground font-semibold">
                Reverse on {animation.trigger === "onHover" ? "mouse leave" : "2nd click"}
              </Label>
              <Switch
                checked={animation.reverse !== false}
                onCheckedChange={(checked) => onUpdate({ reverse: checked })}
                className="scale-75 origin-right"
              />
            </div>
          )}

          {/* Loop settings */}
          {animation.trigger === "loop" && (
            <div className="space-y-3 p-2.5 bg-muted/50 rounded-md border border-border/50">
              <div className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Loop Settings
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">
                    Repeat (-1 = ∞)
                  </Label>
                  <Input
                    type="number"
                    min={-1}
                    max={100}
                    step={1}
                    value={animation.repeat ?? -1}
                    onChange={(e) => onUpdate({ repeat: parseInt(e.target.value) || -1 })}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="flex items-center justify-between pt-4">
                  <Label className="text-[10px] text-muted-foreground">Yoyo</Label>
                  <Switch
                    checked={animation.yoyo !== false}
                    onCheckedChange={(checked) => onUpdate({ yoyo: checked })}
                    className="scale-75 origin-right"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Stagger settings (for container components) */}
          <div className="space-y-3 p-2.5 bg-muted/50 rounded-md border border-border/50">
            <div className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
              <Layers className="w-3 h-3" /> Stagger (Children)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">
                  Stagger (s)
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={2}
                  step={0.05}
                  value={animation.stagger || 0}
                  onChange={(e) => onUpdate({ stagger: parseFloat(e.target.value) || 0 })}
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">From</Label>
                <div className="relative border rounded-md">
                  <select
                    value={animation.staggerFrom || "start"}
                    onChange={(e) =>
                      onUpdate({ staggerFrom: e.target.value as AnimationDefinition["staggerFrom"] })
                    }
                    className="w-full h-7 px-2 text-xs bg-transparent appearance-none focus:outline-none"
                  >
                    <option value="start" className="bg-background text-foreground">Start</option>
                    <option value="end" className="bg-background text-foreground">End</option>
                    <option value="center" className="bg-background text-foreground">Center</option>
                    <option value="edges" className="bg-background text-foreground">Edges</option>
                    <option value="random" className="bg-background text-foreground">Random</option>
                  </select>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
              Set stagger {">"} 0 to animate children sequentially instead of the whole component.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Preset Picker Dialog
// ═══════════════════════════════════════════════════════════

function PresetPickerDialog({
  open,
  onClose,
  selectedTrigger,
  onTriggerChange,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  selectedTrigger: AnimationTrigger;
  onTriggerChange: (trigger: AnimationTrigger) => void;
  onSelect: (preset: AnimationPreset) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<AnimationCategory>("entrance");

  const categories: { key: AnimationCategory; label: string; Icon: LucideIcon }[] = [
    { key: "entrance", label: "Entrance", Icon: ArrowDownToLine },
    { key: "attention", label: "Attention", Icon: Zap },
    { key: "exit", label: "Exit", Icon: LogOut },
    { key: "special", label: "Special", Icon: Settings },
  ];

  const presets = getPresetsByCategory(activeCategory);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="dark max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base">Add Animation</DialogTitle>
        </DialogHeader>

        {/* Trigger Selection */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            1. Choose Trigger
          </Label>
          <div className="grid grid-cols-3 gap-1.5">
            {(Object.entries(TRIGGER_LABELS) as [AnimationTrigger, typeof TRIGGER_LABELS[AnimationTrigger]][]).map(
              ([key, val]) => (
                <button
                  key={key}
                  onClick={() => onTriggerChange(key)}
                  className={`px-2 py-2 text-xs rounded-md border transition-colors text-left ${
                    selectedTrigger === key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted text-foreground"
                  }`}
                >
                  <div className="font-medium flex items-center gap-1.5">
                    <TriggerIcon trigger={key} className="w-3.5 h-3.5" />
                    {val.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                    {val.description}
                  </div>
                </button>
              ),
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            2. Choose Animation
          </Label>
          <div className="flex gap-1 p-1 bg-muted rounded-md">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                  activeCategory === cat.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <cat.Icon className="w-3 h-3 inline-block mr-1" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preset Grid */}
        <div className="flex-1 overflow-y-auto min-h-0 -mx-1 px-1">
          <div className="grid grid-cols-2 gap-1.5 pb-2">
            {presets.map(({ key, meta }) => (
              <button
                key={key}
                onClick={() => onSelect(key)}
                className="flex items-start gap-2.5 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CategoryIcon category={meta.category} className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                    {meta.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                    {meta.description}
                  </div>
                  <div className="text-[10px] text-muted-foreground/50 mt-1 font-mono">
                    {meta.defaultDuration}s • {meta.defaultEase.split(".")[0]}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════
// Icon Helpers
// ═══════════════════════════════════════════════════════════

function TriggerIcon({ trigger, className }: { trigger: string; className?: string }) {
  const icons: Record<string, LucideIcon> = {
    onLoad: Play,
    onScroll: ScrollText,
    onHover: MousePointer,
    onClick: MousePointerClick,
    whileInView: Eye,
    loop: RefreshCw,
  };
  const Icon = icons[trigger] || Zap;
  return <Icon className={className} />;
}

function CategoryIcon({ category, className }: { category: string; className?: string }) {
  const icons: Record<string, LucideIcon> = {
    entrance: ArrowDownToLine,
    attention: Zap,
    exit: LogOut,
    special: Settings,
  };
  const Icon = icons[category] || Sparkles;
  return <Icon className={className} />;
}
