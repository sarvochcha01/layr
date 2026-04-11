// @ts-nocheck
"use client";
import React from "react";
import { useState } from "react";
import { ComponentDefinition, Page, GlobalComponents } from "@/types/editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Settings2, Type, Paintbrush, Scissors, Link as LinkIcon, Image as ImageIcon, Layout, Globe, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";



interface PropertiesPanelProps {
  selectedComponent: ComponentDefinition | null;
  onUpdateComponent: (id: string, updates: Record<string, any>) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
  pages?: Page[];
  globalComponents?: GlobalComponents;
  onMarkAsGlobal?: (componentId: string, globalName: string) => void;
  onUnmarkGlobal?: (componentId: string) => void;
  onApplyGlobalTemplate?: (componentId: string, globalName: string) => void;
}

export function PropertiesPanel({
  selectedComponent,
  onUpdateComponent,
  onDeleteComponent,
  onDuplicateComponent,
  pages = [],
  globalComponents = {},
  onMarkAsGlobal,
  onUnmarkGlobal,
  onApplyGlobalTemplate,
}: PropertiesPanelProps) {
  const [showGlobalDialog, setShowGlobalDialog] = useState(false);
  const [globalName, setGlobalName] = useState("");

  if (!selectedComponent) {
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

  const updateProp = (key: string, value: any) => {
    onUpdateComponent(selectedComponent.id, { [key]: value });
  };

  const isGlobal = !!selectedComponent.isGlobal;
  const existingGlobalNames = Object.keys(globalComponents);

  const handleMarkAsGlobal = () => {
    if (!globalName.trim() || !onMarkAsGlobal) return;
    onMarkAsGlobal(selectedComponent.id, globalName.trim());
    setShowGlobalDialog(false);
    setGlobalName("");
  };

  const handleApplyExistingGlobal = (name: string) => {
    if (!onApplyGlobalTemplate) return;
    onApplyGlobalTemplate(selectedComponent.id, name);
    setShowGlobalDialog(false);
  };

  const renderPropertyFields = () => {
    const { type, props } = selectedComponent;

    // Parse dimension value into number and unit
    const parseDimension = (value: string | undefined) => {
      if (!value || value === "auto") return { value: "", unit: "auto" };
      // Handle empty string with unit (e.g., "px" means empty value with px unit)
      if (value && !value.match(/\d/)) {
        return { value: "", unit: value };
      }
      const match = value.match(/^(\d+\.?\d*)(.*)$/);
      if (match) {
        return { value: match[1], unit: match[2] || "px" };
      }
      return { value: "", unit: "px" };
    };

    // Combine value and unit into dimension string
    const combineDimension = (value: string, unit: string) => {
      if (!value || unit === "auto") return "auto";
      return `${value}${unit}`;
    };

    // Combine value and unit, allowing empty during editing
    const combineDimensionAllowEmpty = (value: string, unit: string) => {
      if (unit === "auto") return "auto";
      if (!value) return unit; // Store just the unit when empty
      return `${value}${unit}`;
    };

    // ═══════════════════════════════════════════════════════════
    // SHARED STYLE SECTIONS — available to all components
    // ═══════════════════════════════════════════════════════════

    const sectionTriggerClass = "hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50";
    const sectionContentClass = "px-4 pb-4 pt-2 space-y-4";
    const labelClass = "text-xs font-medium text-muted-foreground";
    const selectClass = "w-full h-8 px-2 text-xs bg-transparent appearance-none focus:outline-none";

    // ── Fill (Background + Text Color) ──
    const renderFillFields = () => {
      const bgType = props.backgroundType || "solid";
      return (
        <AccordionItem value="fill" className="border-b-0 border-t border-border/50">
          <AccordionTrigger className={sectionTriggerClass}>
            <div className="flex items-center gap-2">
              <Paintbrush className="w-4 h-4 text-muted-foreground" />
              Fill
            </div>
          </AccordionTrigger>
          <AccordionContent className={sectionContentClass}>
            {/* Background Type Selector */}
            <div className="space-y-1.5">
              <Label className={labelClass}>Background Type</Label>
              <div className="flex gap-1 border rounded-md p-0.5">
                {(["solid", "gradient", "image"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => updateProp("backgroundType", t)}
                    className={`flex-1 px-2 py-1 text-xs rounded capitalize transition-colors ${bgType === t ? "bg-secondary text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Solid Color */}
            {bgType === "solid" && (
              <div className="space-y-1.5">
                <Label className={labelClass}>Background Color</Label>
                <div className="flex gap-2 items-center">
                  <Input type="color" value={props.backgroundColor || "#ffffff"} onChange={(e) => updateProp("backgroundColor", e.target.value)} className="w-8 h-8 p-0.5 min-h-0 cursor-pointer" />
                  <Input type="text" value={props.backgroundColor || "#ffffff"} onChange={(e) => updateProp("backgroundColor", e.target.value)} className="flex-1 h-8 text-xs font-mono" />
                </div>
              </div>
            )}

            {/* Gradient */}
            {bgType === "gradient" && (
              <div className="space-y-1.5">
                <Label className={labelClass}>CSS Gradient</Label>
                <Input
                  value={props.backgroundGradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}
                  onChange={(e) => updateProp("backgroundGradient", e.target.value)}
                  placeholder="linear-gradient(135deg, #667eea, #764ba2)"
                  className="h-8 text-xs font-mono"
                />
                <div className="h-8 rounded border" style={{ backgroundImage: props.backgroundGradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }} />
              </div>
            )}

            {/* Background Image */}
            {bgType === "image" && (
              <>
                <div className="space-y-1.5">
                  <Label className={labelClass}>Image URL</Label>
                  <Input value={props.backgroundImageUrl || ""} onChange={(e) => updateProp("backgroundImageUrl", e.target.value)} placeholder="https://example.com/bg.jpg" className="h-8 text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className={labelClass}>Size</Label>
                    <div className="relative border rounded-md">
                      <select value={props.backgroundSize || "cover"} onChange={(e) => updateProp("backgroundSize", e.target.value)} className={selectClass}>
                        <option className="bg-background text-foreground" value="cover">Cover</option>
                        <option className="bg-background text-foreground" value="contain">Contain</option>
                        <option className="bg-background text-foreground" value="auto">Auto</option>
                        <option className="bg-background text-foreground" value="100% 100%">Stretch</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className={labelClass}>Position</Label>
                    <div className="relative border rounded-md">
                      <select value={props.backgroundPosition || "center"} onChange={(e) => updateProp("backgroundPosition", e.target.value)} className={selectClass}>
                        <option className="bg-background text-foreground" value="center">Center</option>
                        <option className="bg-background text-foreground" value="top">Top</option>
                        <option className="bg-background text-foreground" value="bottom">Bottom</option>
                        <option className="bg-background text-foreground" value="left">Left</option>
                        <option className="bg-background text-foreground" value="right">Right</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Text Color — always shown */}
            <div className="space-y-1.5">
              <Label className={labelClass}>Text Color</Label>
              <div className="flex gap-2 items-center">
                <Input type="color" value={props.textColor || "#000000"} onChange={(e) => updateProp("textColor", e.target.value)} className="w-8 h-8 p-0.5 min-h-0 cursor-pointer" />
                <Input type="text" value={props.textColor || "#000000"} onChange={(e) => updateProp("textColor", e.target.value)} className="flex-1 h-8 text-xs font-mono" />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      );
    };

    // ── Layout (Width + Height) ──
    const renderDimensionFields = () => {
      const width = parseDimension(props.width || "");
      const height = parseDimension(props.height || "");

      return (
        <AccordionItem value="dimensions" className="border-b-0 border-t border-border/50">
          <AccordionTrigger className={sectionTriggerClass}>
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-muted-foreground" />
              Size
            </div>
          </AccordionTrigger>
          <AccordionContent className={sectionContentClass}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className={labelClass}>Width</Label>
                <div className="flex gap-0 border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-primary">
                  <Input type="number" value={width.value} onChange={(e) => updateProp("width", combineDimensionAllowEmpty(e.target.value, width.unit))} onBlur={(e) => { if (!e.target.value && width.unit !== "auto") updateProp("width", "auto"); }} placeholder="auto" className="flex-1 h-8 text-xs border-0 rounded-none shadow-none focus-visible:ring-0 px-2" disabled={width.unit === "auto"} />
                  <select value={width.unit} onChange={(e) => { const u = e.target.value; updateProp("width", u === "auto" ? "auto" : combineDimension(width.value || "100", u)); }} className="w-14 bg-muted border-l text-xs text-muted-foreground px-1 focus:outline-none">
                    <option className="bg-background text-foreground" value="auto">auto</option><option className="bg-background text-foreground" value="px">px</option><option className="bg-background text-foreground" value="%">%</option><option className="bg-background text-foreground" value="rem">rem</option><option className="bg-background text-foreground" value="vw">vw</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Height</Label>
                <div className="flex gap-0 border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-primary">
                  <Input type="number" value={height.value} onChange={(e) => updateProp("height", combineDimensionAllowEmpty(e.target.value, height.unit))} onBlur={(e) => { if (!e.target.value && height.unit !== "auto") updateProp("height", "auto"); }} placeholder="auto" className="flex-1 h-8 text-xs border-0 rounded-none shadow-none focus-visible:ring-0 px-2" disabled={height.unit === "auto"} />
                  <select value={height.unit} onChange={(e) => { const u = e.target.value; updateProp("height", u === "auto" ? "auto" : combineDimension(height.value || "100", u)); }} className="w-14 bg-muted border-l text-xs text-muted-foreground px-1 focus:outline-none">
                    <option className="bg-background text-foreground" value="auto">auto</option><option className="bg-background text-foreground" value="px">px</option><option className="bg-background text-foreground" value="%">%</option><option className="bg-background text-foreground" value="rem">rem</option><option className="bg-background text-foreground" value="vh">vh</option>
                  </select>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      );
    };

    // ── Spacing (Padding + Margin) ──
    const renderSpacingFields = () => {
      const spacingSides = ["Top", "Right", "Bottom", "Left"] as const;
      return (
        <AccordionItem value="spacing" className="border-b-0 border-t border-border/50">
          <AccordionTrigger className={sectionTriggerClass}>
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4 text-muted-foreground" />
              Spacing
            </div>
          </AccordionTrigger>
          <AccordionContent className={sectionContentClass}>
            <div className="space-y-1.5">
              <Label className={labelClass}>Padding</Label>
              <div className="grid grid-cols-4 gap-1">
                {spacingSides.map((side) => {
                  const key = `padding${side}`;
                  return (
                    <div key={key} className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground block text-center">{side[0]}</span>
                      <Input value={props[key] || ""} onChange={(e) => updateProp(key, e.target.value)} placeholder="0" className="h-7 text-xs text-center px-1" />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Margin</Label>
              <div className="grid grid-cols-4 gap-1">
                {spacingSides.map((side) => {
                  const key = `margin${side}`;
                  return (
                    <div key={key} className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground block text-center">{side[0]}</span>
                      <Input value={props[key] || ""} onChange={(e) => updateProp(key, e.target.value)} placeholder="0" className="h-7 text-xs text-center px-1" />
                    </div>
                  );
                })}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      );
    };

    // ── Typography ──
    const renderTypographyFields = () => {
      return (
        <AccordionItem value="typography" className="border-b-0 border-t border-border/50">
          <AccordionTrigger className={sectionTriggerClass}>
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-muted-foreground" />
              Typography
            </div>
          </AccordionTrigger>
          <AccordionContent className={sectionContentClass}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={labelClass}>Font Size</Label>
                <Input value={props.fontSize_css || ""} onChange={(e) => updateProp("fontSize_css", e.target.value)} placeholder="16px" className="h-8 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Font Weight</Label>
                <div className="relative border rounded-md">
                  <select value={props.fontWeight_css || ""} onChange={(e) => updateProp("fontWeight_css", e.target.value)} className={selectClass}>
                    <option className="bg-background text-foreground" value="">Default</option>
                    <option className="bg-background text-foreground" value="100">Thin (100)</option>
                    <option className="bg-background text-foreground" value="300">Light (300)</option>
                    <option className="bg-background text-foreground" value="400">Normal (400)</option>
                    <option className="bg-background text-foreground" value="500">Medium (500)</option>
                    <option className="bg-background text-foreground" value="600">Semi Bold (600)</option>
                    <option className="bg-background text-foreground" value="700">Bold (700)</option>
                    <option className="bg-background text-foreground" value="800">Extra Bold (800)</option>
                    <option className="bg-background text-foreground" value="900">Black (900)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Line Height</Label>
                <Input value={props.lineHeight_css || ""} onChange={(e) => updateProp("lineHeight_css", e.target.value)} placeholder="1.5" className="h-8 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Letter Spacing</Label>
                <Input value={props.letterSpacing_css || ""} onChange={(e) => updateProp("letterSpacing_css", e.target.value)} placeholder="0px" className="h-8 text-xs" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Text Align</Label>
              <div className="flex gap-1 border rounded-md p-0.5">
                {(["left", "center", "right", "justify"] as const).map((a) => (
                  <button key={a} onClick={() => updateProp("textAlign_css", a)} className={`flex-1 px-2 py-1 text-xs rounded capitalize transition-colors ${(props.textAlign_css || "") === a ? "bg-secondary text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      );
    };

    // ── Borders ──
    const renderBorderFields = () => {
      return (
        <AccordionItem value="borders" className="border-b-0 border-t border-border/50">
          <AccordionTrigger className={sectionTriggerClass}>
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-muted-foreground" />
              Borders
            </div>
          </AccordionTrigger>
          <AccordionContent className={sectionContentClass}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={labelClass}>Radius</Label>
                <Input value={props.borderRadius_css || ""} onChange={(e) => updateProp("borderRadius_css", e.target.value)} placeholder="0px" className="h-8 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Width</Label>
                <Input value={props.borderWidth_css || ""} onChange={(e) => updateProp("borderWidth_css", e.target.value)} placeholder="0px" className="h-8 text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={labelClass}>Color</Label>
                <div className="flex gap-2 items-center">
                  <Input type="color" value={props.borderColor || "#000000"} onChange={(e) => updateProp("borderColor", e.target.value)} className="w-8 h-8 p-0.5 min-h-0 cursor-pointer" />
                  <Input type="text" value={props.borderColor || ""} onChange={(e) => updateProp("borderColor", e.target.value)} className="flex-1 h-8 text-xs font-mono" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Style</Label>
                <div className="relative border rounded-md">
                  <select value={props.borderStyle_css || ""} onChange={(e) => updateProp("borderStyle_css", e.target.value)} className={selectClass}>
                    <option className="bg-background text-foreground" value="">None</option>
                    <option className="bg-background text-foreground" value="solid">Solid</option>
                    <option className="bg-background text-foreground" value="dashed">Dashed</option>
                    <option className="bg-background text-foreground" value="dotted">Dotted</option>
                    <option className="bg-background text-foreground" value="double">Double</option>
                  </select>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      );
    };

    // ── Effects (Opacity + Shadow) ──
    const renderEffectsFields = () => {
      return (
        <AccordionItem value="effects" className="border-b-0 border-t border-border/50">
          <AccordionTrigger className={sectionTriggerClass}>
            <div className="flex items-center gap-2">
              <Paintbrush className="w-4 h-4 text-muted-foreground" />
              Effects
            </div>
          </AccordionTrigger>
          <AccordionContent className={sectionContentClass}>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className={labelClass}>Opacity</Label>
                <span className="text-xs text-muted-foreground">{Math.round((props.opacity_css ?? 1) * 100)}%</span>
              </div>
              <input type="range" min="0" max="1" step="0.01" value={props.opacity_css ?? 1} onChange={(e) => updateProp("opacity_css", parseFloat(e.target.value))} className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" />
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Box Shadow</Label>
              <div className="relative border rounded-md">
                <select value={props.boxShadow || ""} onChange={(e) => updateProp("boxShadow", e.target.value)} className={selectClass}>
                  <option className="bg-background text-foreground" value="">None</option>
                  <option className="bg-background text-foreground" value="0 1px 2px 0 rgba(0,0,0,0.05)">XS</option>
                  <option className="bg-background text-foreground" value="0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)">SM</option>
                  <option className="bg-background text-foreground" value="0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)">MD</option>
                  <option className="bg-background text-foreground" value="0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)">LG</option>
                  <option className="bg-background text-foreground" value="0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)">XL</option>
                  <option className="bg-background text-foreground" value="0 25px 50px -12px rgba(0,0,0,0.25)">2XL</option>
                </select>
              </div>
              <Input value={props.boxShadow || ""} onChange={(e) => updateProp("boxShadow", e.target.value)} placeholder="Custom: 0 4px 6px rgba(0,0,0,0.1)" className="h-8 text-xs font-mono" />
            </div>
          </AccordionContent>
        </AccordionItem>
      );
    };

    // ── Position & Overflow ──
    const renderPositionFields = () => {
      const posType = props.position_css || "static";
      return (
        <AccordionItem value="position" className="border-b-0 border-t border-border/50">
          <AccordionTrigger className={sectionTriggerClass}>
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4 text-muted-foreground" />
              Position
            </div>
          </AccordionTrigger>
          <AccordionContent className={sectionContentClass}>
            <div className="space-y-1.5">
              <Label className={labelClass}>Position</Label>
              <div className="relative border rounded-md">
                <select value={posType} onChange={(e) => updateProp("position_css", e.target.value)} className={selectClass}>
                  <option className="bg-background text-foreground" value="static">Static</option>
                  <option className="bg-background text-foreground" value="relative">Relative</option>
                  <option className="bg-background text-foreground" value="absolute">Absolute</option>
                  <option className="bg-background text-foreground" value="fixed">Fixed</option>
                  <option className="bg-background text-foreground" value="sticky">Sticky</option>
                </select>
              </div>
            </div>
            {posType !== "static" && (
              <div className="grid grid-cols-2 gap-2">
                {(["posTop", "posRight", "posBottom", "posLeft"] as const).map((key) => (
                  <div key={key} className="space-y-1">
                    <Label className={labelClass}>{key.replace("pos", "")}</Label>
                    <Input value={props[key] || ""} onChange={(e) => updateProp(key, e.target.value)} placeholder="auto" className="h-7 text-xs" />
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-1.5">
              <Label className={labelClass}>Z-Index</Label>
              <Input type="number" value={props.zIndex || ""} onChange={(e) => updateProp("zIndex", e.target.value)} placeholder="auto" className="h-8 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={labelClass}>Overflow X</Label>
                <div className="relative border rounded-md">
                  <select value={props.overflowX_css || "visible"} onChange={(e) => updateProp("overflowX_css", e.target.value)} className={selectClass}>
                    <option className="bg-background text-foreground" value="visible">Visible</option>
                    <option className="bg-background text-foreground" value="hidden">Hidden</option>
                    <option className="bg-background text-foreground" value="scroll">Scroll</option>
                    <option className="bg-background text-foreground" value="auto">Auto</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Overflow Y</Label>
                <div className="relative border rounded-md">
                  <select value={props.overflowY_css || "visible"} onChange={(e) => updateProp("overflowY_css", e.target.value)} className={selectClass}>
                    <option className="bg-background text-foreground" value="visible">Visible</option>
                    <option className="bg-background text-foreground" value="hidden">Hidden</option>
                    <option className="bg-background text-foreground" value="scroll">Scroll</option>
                    <option className="bg-background text-foreground" value="auto">Auto</option>
                  </select>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      );
    };

    // Combined style sections shortcut — renders all shared style controls
    const renderAllStyleSections = () => (
      <>
        {renderFillFields()}
        {renderDimensionFields()}
        {renderSpacingFields()}
        {renderTypographyFields()}
        {renderBorderFields()}
        {renderEffectsFields()}
        {renderPositionFields()}
      </>
    );

    switch (type) {
      case "Hero":
        return (
          <Accordion type="multiple" defaultValue={["content", "fill", "dimensions"]} className="w-full">
            <AccordionItem value="content" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-muted-foreground" />
                  Content
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-medium text-muted-foreground">Title</Label>
                  <Input id="title" value={props.title || ""} onChange={(e) => updateProp("title", e.target.value)} placeholder="Enter hero title" className="h-8 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subtitle" className="text-xs font-medium text-muted-foreground">Subtitle</Label>
                  <Input id="subtitle" value={props.subtitle || ""} onChange={(e) => updateProp("subtitle", e.target.value)} placeholder="Enter subtitle" className="h-8 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-medium text-muted-foreground">Description</Label>
                  <Textarea id="description" value={props.description || ""} onChange={(e) => updateProp("description", e.target.value)} placeholder="Enter description" rows={3} className="text-sm resize-none" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="primaryButtonText" className="text-xs font-medium text-muted-foreground">Primary Button Text</Label>
                  <Input id="primaryButtonText" value={props.primaryButtonText || ""} onChange={(e) => updateProp("primaryButtonText", e.target.value)} placeholder="Button text" className="h-8 text-sm" />
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderAllStyleSections()}
          </Accordion>
        );

      case "Text":
        return (
          <Accordion type="multiple" defaultValue={["content", "fill", "dimensions"]} className="w-full">
            <AccordionItem value="content" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-muted-foreground" />
                  Content
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="content" className="text-xs font-medium text-muted-foreground">Content</Label>
                  <Textarea id="content" value={props.content || ""} onChange={(e) => updateProp("content", e.target.value)} placeholder="Enter text content" rows={4} className="text-sm resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="tag" className="text-xs font-medium text-muted-foreground">HTML Tag</Label>
                    <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary">
                      <select id="tag" value={props.tag || "p"} onChange={(e) => updateProp("tag", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                        <option className="bg-background text-foreground" value="h1">H1</option>
                        <option className="bg-background text-foreground" value="h2">H2</option>
                        <option className="bg-background text-foreground" value="h3">H3</option>
                        <option className="bg-background text-foreground" value="h4">H4</option>
                        <option className="bg-background text-foreground" value="h5">H5</option>
                        <option className="bg-background text-foreground" value="h6">H6</option>
                        <option className="bg-background text-foreground" value="p">Paragraph</option>
                        <option className="bg-background text-foreground" value="span">Span</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="size" className="text-xs font-medium text-muted-foreground">Size</Label>
                    <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary">
                      <select id="size" value={props.size || "base"} onChange={(e) => updateProp("size", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                        <option className="bg-background text-foreground" value="xs">Extra Small</option>
                        <option className="bg-background text-foreground" value="sm">Small</option>
                        <option className="bg-background text-foreground" value="base">Base</option>
                        <option className="bg-background text-foreground" value="lg">Large</option>
                        <option className="bg-background text-foreground" value="xl">Extra Large</option>
                        <option className="bg-background text-foreground" value="2xl">2X Large</option>
                        <option className="bg-background text-foreground" value="3xl">3X Large</option>
                      </select>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderAllStyleSections()}
          </Accordion>
        );

      case "Button":
        return (
          <Accordion type="multiple" defaultValue={["content", "links", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="content" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-muted-foreground" />
                  Content
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="text" className="text-xs font-medium text-muted-foreground">Button Text</Label>
                  <Input id="text" value={props.text || ""} onChange={(e) => updateProp("text", e.target.value)} placeholder="Button text" className="h-8 text-sm" />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="variant" className="text-xs font-medium text-muted-foreground">Variant</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary">
                    <select id="variant" value={props.variant || "default"} onChange={(e) => updateProp("variant", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option className="bg-background text-foreground" value="default">Default</option>
                      <option className="bg-background text-foreground" value="destructive">Destructive</option>
                      <option className="bg-background text-foreground" value="outline">Outline</option>
                      <option className="bg-background text-foreground" value="secondary">Secondary</option>
                      <option className="bg-background text-foreground" value="ghost">Ghost</option>
                      <option className="bg-background text-foreground" value="link">Link</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-md bg-muted border border-border/50">
                  <Label htmlFor="fullWidth" className="text-xs font-medium text-muted-foreground cursor-pointer">Full Width</Label>
                  <Switch id="fullWidth" checked={props.fullWidth || false} onCheckedChange={(checked) => updateProp("fullWidth", checked)} className="scale-75 origin-right" />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="links" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  Link Settings
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="linkType" className="text-xs font-medium text-muted-foreground">Link Type</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary">
                    <select
                      id="linkType"
                      value={props.href?.startsWith("page:") ? "page" : "url"}
                      onChange={(e) => {
                        if (e.target.value === "page" && pages.length > 0) {
                          updateProp("href", `page:${pages[0].id}`);
                        } else {
                          updateProp("href", "");
                        }
                      }}
                      className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none"
                    >
                      <option className="bg-background text-foreground" value="url">External URL</option>
                      <option className="bg-background text-foreground" value="page">Internal Page</option>
                    </select>
                  </div>
                </div>

                {props.href?.startsWith("page:") ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="href" className="text-xs font-medium text-muted-foreground">Select Page</Label>
                    <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary">
                      <select id="href" value={props.href} onChange={(e) => updateProp("href", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                        {pages.map((page) => (
                          <option className="bg-background text-foreground" key={page.id} value={`page:${page.id}`}>
                            {page.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Label htmlFor="href" className="text-xs font-medium text-muted-foreground">Link URL</Label>
                    <Input id="href" value={props.href || ""} onChange={(e) => updateProp("href", e.target.value)} placeholder="https://example.com" className="h-8 text-sm" />
                  </div>
                )}

                {props.href && !props.href.startsWith("page:") && (
                  <div className="flex items-center justify-between p-2 rounded-md bg-muted border border-border/50">
                    <Label htmlFor="external" className="text-xs font-medium text-muted-foreground cursor-pointer">Open in new tab</Label>
                    <Switch id="external" checked={props.external || false} onCheckedChange={(checked) => updateProp("external", checked)} className="scale-75 origin-right" />
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
            {renderAllStyleSections()}
          </Accordion>
        );

      case "Image":
        return (
          <Accordion type="multiple" defaultValue={["content", "dimensions"]} className="w-full">
            <AccordionItem value="content" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  Image Source
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="src" className="text-xs font-medium text-muted-foreground">Image URL</Label>
                  <Input id="src" value={props.src || ""} onChange={(e) => updateProp("src", e.target.value)} placeholder="https://example.com/image.jpg" className="h-8 text-sm" />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="alt" className="text-xs font-medium text-muted-foreground">Alt Text</Label>
                  <Input id="alt" value={props.alt || ""} onChange={(e) => updateProp("alt", e.target.value)} placeholder="Describe the image" className="h-8 text-sm" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rounded" className="text-xs font-medium text-muted-foreground">Border Radius Corners</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary">
                    <select id="rounded" value={props.rounded || "md"} onChange={(e) => updateProp("rounded", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option className="bg-background text-foreground" value="none">None</option>
                      <option className="bg-background text-foreground" value="sm">Small</option>
                      <option className="bg-background text-foreground" value="md">Medium</option>
                      <option className="bg-background text-foreground" value="lg">Large</option>
                      <option className="bg-background text-foreground" value="xl">Extra Large</option>
                      <option className="bg-background text-foreground" value="full">Full (Circle)</option>
                    </select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderAllStyleSections()}
          </Accordion>
        );

      case "Card":
        return (
          <Accordion type="multiple" defaultValue={["content", "fill", "dimensions"]} className="w-full">
            <AccordionItem value="content" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-muted-foreground" />
                  Card Content
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-medium text-muted-foreground">Title</Label>
                  <Input id="title" value={props.title || ""} onChange={(e) => updateProp("title", e.target.value)} placeholder="Card title" className="h-8 text-sm" />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-medium text-muted-foreground">Description</Label>
                  <Textarea id="description" value={props.description || ""} onChange={(e) => updateProp("description", e.target.value)} placeholder="Card description" rows={3} className="text-sm resize-none" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="buttonText" className="text-xs font-medium text-muted-foreground">Button Text</Label>
                  <Input id="buttonText" value={props.buttonText || ""} onChange={(e) => updateProp("buttonText", e.target.value)} placeholder="Learn More" className="h-8 text-sm" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="variant" className="text-xs font-medium text-muted-foreground">Card Style</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary">
                    <select id="variant" value={props.variant || "default"} onChange={(e) => updateProp("variant", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option className="bg-background text-foreground" value="default">Default</option>
                      <option className="bg-background text-foreground" value="bordered">Bordered</option>
                      <option className="bg-background text-foreground" value="shadow">Shadow</option>
                      <option className="bg-background text-foreground" value="elevated">Elevated</option>
                    </select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderAllStyleSections()}
          </Accordion>
        );

      case "Header":
        return (
          <Accordion type="multiple" defaultValue={["settings", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="settings" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                  Header Settings
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="flex items-center justify-between p-2 rounded-md bg-muted border border-border/50">
                  <Label htmlFor="sticky" className="text-xs font-medium text-muted-foreground cursor-pointer">Sticky Header</Label>
                  <Switch id="sticky" checked={props.sticky || false} onCheckedChange={(checked) => updateProp("sticky", checked)} className="scale-75 origin-right" />
                </div>

                <div className="flex items-center justify-between p-2 rounded-md bg-muted border border-border/50">
                  <Label htmlFor="shadow" className="text-xs font-medium text-muted-foreground cursor-pointer">Drop Shadow</Label>
                  <Switch id="shadow" checked={props.shadow || false} onCheckedChange={(checked) => updateProp("shadow", checked)} className="scale-75 origin-right" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="padding" className="text-xs font-medium text-muted-foreground">Padding</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary">
                    <select id="padding" value={props.padding || "md"} onChange={(e) => updateProp("padding", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option className="bg-background text-foreground" value="sm">Small</option>
                      <option className="bg-background text-foreground" value="md">Medium</option>
                      <option className="bg-background text-foreground" value="lg">Large</option>
                      <option className="bg-background text-foreground" value="xl">Extra Large</option>
                    </select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderAllStyleSections()}
          </Accordion>
        );

      case "Navbar":
        return (
          <Accordion type="multiple" defaultValue={["brand", "links", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="brand" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                  Brand & CTA
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="logoText" className="text-xs font-medium text-muted-foreground">Logo Text</Label>
                  <Input id="logoText" value={props.logoText || ""} onChange={(e) => updateProp("logoText", e.target.value)} placeholder="Brand Name" className="h-8 text-sm" />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="ctaText" className="text-xs font-medium text-muted-foreground">CTA Button Text</Label>
                  <Input id="ctaText" value={props.ctaText || ""} onChange={(e) => updateProp("ctaText", e.target.value)} placeholder="Get Started" className="h-8 text-sm" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ctaLink" className="text-xs font-medium text-muted-foreground">CTA Button Link</Label>
                  <Input id="ctaLink" value={props.ctaLink || ""} onChange={(e) => updateProp("ctaLink", e.target.value)} placeholder="https://example.com" className="h-8 text-sm" />
                </div>

                <div className="flex items-center justify-between p-2 rounded-md bg-muted border border-border/50">
                  <Label htmlFor="ctaExternal" className="text-xs font-medium text-muted-foreground cursor-pointer">CTA is External Link</Label>
                  <Switch
                    id="ctaExternal"
                    checked={props.ctaExternal || false}
                    onCheckedChange={(checked) =>
                      updateProp("ctaExternal", checked)
                    }
                    className="scale-75 origin-right"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="links" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  Navigation Links
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-3">
                  {(props.links || []).map((link: any, index: number) => (
                    <div key={index} className="space-y-3 p-3 bg-muted border border-border rounded-md">
                      <div className="flex items-center justify-between pointer-events-none">
                        <span className="text-xs font-semibold text-muted-foreground">Link #{index + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 pointer-events-auto"
                          onClick={() => {
                            const newLinks = (props.links || []).filter((_: any, i: number) => i !== index);
                            updateProp("links", newLinks);
                          }}
                        >
                          <span className="sr-only">Delete</span>
                          &times;
                        </Button>
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase text-muted-foreground font-semibold">Label</Label>
                        <Input
                          value={link.text || ""}
                          onChange={(e) => {
                            const newLinks = [...(props.links || [])];
                            newLinks[index] = { ...link, text: e.target.value };
                            updateProp("links", newLinks);
                          }}
                          placeholder="Link text"
                          className="h-7 text-xs bg-background"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase text-muted-foreground font-semibold">Destination</Label>
                        <div className="grid grid-cols-[1fr_2fr] gap-2 items-start">
                          <div className="relative border border-border rounded-md focus-within:ring-1 focus-within:ring-primary bg-background">
                            <select
                              value={link.href?.startsWith("page:") ? "page" : "url"}
                              onChange={(e) => {
                                const newLinks = [...(props.links || [])];
                                if (e.target.value === "page" && pages.length > 0) {
                                  newLinks[index] = { ...link, href: `page:${pages[0].id}` };
                                } else {
                                  newLinks[index] = { ...link, href: "" };
                                }
                                updateProp("links", newLinks);
                              }}
                              className="w-full h-7 px-1 text-xs bg-background text-foreground appearance-none focus:outline-none"
                            >
                              <option className="bg-background text-foreground" value="url">URL</option>
                              <option className="bg-background text-foreground" value="page">Page</option>
                            </select>
                          </div>
                          
                          {link.href?.startsWith("page:") ? (
                            <div className="relative border border-border rounded-md focus-within:ring-1 focus-within:ring-primary bg-background">
                              <select
                                value={link.href}
                                onChange={(e) => {
                                  const newLinks = [...(props.links || [])];
                                  newLinks[index] = { ...link, href: e.target.value };
                                  updateProp("links", newLinks);
                                }}
                                className="w-full h-7 px-1 text-xs bg-background text-foreground appearance-none focus:outline-none"
                              >
                                {pages.map((page) => (
                                  <option className="bg-background text-foreground" key={page.id} value={`page:${page.id}`}>
                                    {page.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <Input
                              value={link.href || ""}
                              onChange={(e) => {
                                const newLinks = [...(props.links || [])];
                                newLinks[index] = { ...link, href: e.target.value };
                                updateProp("links", newLinks);
                              }}
                              placeholder="URL"
                              className="h-7 text-xs bg-background"
                            />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <Label htmlFor={`external-${index}`} className="text-[10px] uppercase text-muted-foreground font-semibold cursor-pointer">Open in new tab</Label>
                        <Switch
                          id={`external-${index}`}
                          checked={link.external || false}
                          onCheckedChange={(checked) => {
                            const newLinks = [...(props.links || [])];
                            newLinks[index] = { ...link, external: checked };
                            updateProp("links", newLinks);
                          }}
                          className="scale-75 origin-right"
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-8 border-dashed"
                    onClick={() => {
                      const newLinks = [...(props.links || []), { text: "New Link", href: "#", external: false }];
                      updateProp("links", newLinks);
                    }}
                  >
                    + Add Link
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="styling" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Paintbrush className="w-4 h-4 text-muted-foreground" />
                  Link Styling
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="linkColor" className="text-xs font-medium text-muted-foreground">Link Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input id="linkColor" type="color" value={props.linkColor || "#000000"} onChange={(e) => updateProp("linkColor", e.target.value)} className="w-8 h-8 p-0.5 min-h-0 cursor-pointer" />
                    <Input type="text" value={props.linkColor || "#000000"} onChange={(e) => updateProp("linkColor", e.target.value)} className="flex-1 h-8 text-xs font-mono" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="linkHoverColor" className="text-xs font-medium text-muted-foreground">Link Hover Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input id="linkHoverColor" type="color" value={props.linkHoverColor || "#3b82f6"} onChange={(e) => updateProp("linkHoverColor", e.target.value)} className="w-8 h-8 p-0.5 min-h-0 cursor-pointer" />
                    <Input type="text" value={props.linkHoverColor || "#3b82f6"} onChange={(e) => updateProp("linkHoverColor", e.target.value)} className="flex-1 h-8 text-xs font-mono" />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderAllStyleSections()}
          </Accordion>
        );

      case "Footer":
        return (
          <Accordion type="multiple" defaultValue={["brand", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="brand" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                  Footer Content
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="logoText" className="text-xs font-medium text-muted-foreground">Logo Text</Label>
                  <Input id="logoText" value={props.logoText || ""} onChange={(e) => updateProp("logoText", e.target.value)} placeholder="Brand Name" className="h-8 text-sm" />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-medium text-muted-foreground">Description</Label>
                  <Textarea id="description" value={props.description || ""} onChange={(e) => updateProp("description", e.target.value)} placeholder="Brief description about your brand" rows={3} className="text-sm resize-none" />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="links" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  Footer Links
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="copyright" className="text-xs font-medium text-muted-foreground">Copyright Text</Label>
                  <Input id="copyright" value={props.copyright || ""} onChange={(e) => updateProp("copyright", e.target.value)} placeholder="© 2024 All rights reserved" className="h-8 text-sm" />
                </div>
                
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-medium text-muted-foreground">Footer Sections</div>
                  <div className="space-y-3">
                    {(props.sections || []).map((section: any, sectionIndex: number) => (
                      <div key={sectionIndex} className="space-y-3 p-3 bg-muted border border-border rounded-md">
                        <div className="flex items-center justify-between pointer-events-none">
                          <span className="text-xs font-semibold text-muted-foreground">Section {sectionIndex + 1}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 pointer-events-auto"
                            onClick={() => {
                              const newSections = (props.sections || []).filter((_: any, i: number) => i !== sectionIndex);
                              updateProp("sections", newSections);
                            }}
                          >
                            <span className="sr-only">Delete</span>
                            &times;
                          </Button>
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase text-muted-foreground font-semibold">Title</Label>
                          <Input
                            value={section.title || ""}
                            onChange={(e) => {
                              const newSections = [...(props.sections || [])];
                              newSections[sectionIndex] = { ...section, title: e.target.value };
                              updateProp("sections", newSections);
                            }}
                            placeholder="Section title (e.g., Products)"
                            className="h-7 text-xs bg-background"
                          />
                        </div>

                        <div className="space-y-2 pt-1 border-t border-border">
                          <Label className="text-[10px] uppercase text-muted-foreground font-semibold">Links</Label>
                          <div className="space-y-2">
                            {(section.links || []).map((link: any, linkIndex: number) => (
                              <div key={linkIndex} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start bg-background p-2 rounded border border-border/50">
                                <Input
                                  value={link.text || ""}
                                  onChange={(e) => {
                                    const newSections = [...(props.sections || [])];
                                    const newLinks = [...(section.links || [])];
                                    newLinks[linkIndex] = { ...link, text: e.target.value };
                                    newSections[sectionIndex] = { ...section, links: newLinks };
                                    updateProp("sections", newSections);
                                  }}
                                  placeholder="Link text"
                                  className="h-7 text-xs"
                                />
                                <Input
                                  value={link.href || ""}
                                  onChange={(e) => {
                                    const newSections = [...(props.sections || [])];
                                    const newLinks = [...(section.links || [])];
                                    newLinks[linkIndex] = { ...link, href: e.target.value };
                                    newSections[sectionIndex] = { ...section, links: newLinks };
                                    updateProp("sections", newSections);
                                  }}
                                  placeholder="URL"
                                  className="h-7 text-xs"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => {
                                    const newSections = [...(props.sections || [])];
                                    const newLinks = (section.links || []).filter((_: any, i: number) => i !== linkIndex);
                                    newSections[sectionIndex] = { ...section, links: newLinks };
                                    updateProp("sections", newSections);
                                  }}
                                >
                                  &times;
                                </Button>
                              </div>
                            ))}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-[10px] h-6 border-dashed mt-2"
                            onClick={() => {
                              const newSections = [...(props.sections || [])];
                              const newLinks = [...(section.links || []), { text: "Link", href: "#" }];
                              newSections[sectionIndex] = { ...section, links: newLinks };
                              updateProp("sections", newSections);
                            }}
                          >
                            + Add section link
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8 border-dashed"
                      onClick={() => {
                        const newSections = [...(props.sections || []), { title: "New Section", links: [] }];
                        updateProp("sections", newSections);
                      }}
                    >
                      + Add List
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="socials" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  Social Links
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-3">
                  {(props.socialLinks || []).map((social: any, index: number) => (
                    <div key={index} className="space-y-3 p-3 bg-muted border border-border rounded-md">
                      <div className="flex items-center justify-between pointer-events-none">
                        <span className="text-xs font-semibold text-muted-foreground">Link #{index + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 pointer-events-auto"
                          onClick={() => {
                            const newSocials = (props.socialLinks || []).filter((_: any, i: number) => i !== index);
                            updateProp("socialLinks", newSocials);
                          }}
                        >
                          <span className="sr-only">Delete</span>
                          &times;
                        </Button>
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase text-muted-foreground font-semibold">Platform</Label>
                        <Input
                          value={social.platform || ""}
                          onChange={(e) => {
                            const newSocials = [...(props.socialLinks || [])];
                            newSocials[index] = { ...social, platform: e.target.value };
                            updateProp("socialLinks", newSocials);
                          }}
                          placeholder="Platform name (e.g., Twitter)"
                          className="h-7 text-xs bg-background"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase text-muted-foreground font-semibold">URL</Label>
                          <Input
                            value={social.href || ""}
                            onChange={(e) => {
                              const newSocials = [...(props.socialLinks || [])];
                              newSocials[index] = { ...social, href: e.target.value };
                              updateProp("socialLinks", newSocials);
                            }}
                            placeholder="URL"
                            className="h-7 text-xs bg-background"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase text-muted-foreground font-semibold">Icon</Label>
                          <Input
                            value={social.icon || ""}
                            onChange={(e) => {
                              const newSocials = [...(props.socialLinks || [])];
                              newSocials[index] = { ...social, icon: e.target.value };
                              updateProp("socialLinks", newSocials);
                            }}
                            placeholder="Emoji or text"
                            className="h-7 text-xs bg-background"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-8 border-dashed"
                    onClick={() => {
                      const newSocials = [...(props.socialLinks || []), { platform: "Social", href: "#", icon: "🔗" }];
                      updateProp("socialLinks", newSocials);
                    }}
                  >
                    + Add Social Link
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderAllStyleSections()}
          </Accordion>
        );

      case "Container":
        return (
          <Accordion type="multiple" defaultValue={["layout", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="layout" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-muted-foreground" />
                  Layout Settings
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="maxWidth" className="text-xs font-medium text-muted-foreground">Max Width</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary">
                    <select id="maxWidth" value={props.maxWidth || "xl"} onChange={(e) => updateProp("maxWidth", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option className="bg-background text-foreground" value="sm">Small (640px)</option>
                      <option className="bg-background text-foreground" value="md">Medium (768px)</option>
                      <option className="bg-background text-foreground" value="lg">Large (1024px)</option>
                      <option className="bg-background text-foreground" value="xl">Extra Large (1280px)</option>
                      <option className="bg-background text-foreground" value="2xl">2X Large (1536px)</option>
                      <option className="bg-background text-foreground" value="full">Full Width</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="padding" className="text-xs font-medium text-muted-foreground">Padding</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary">
                    <select id="padding" value={props.padding || "md"} onChange={(e) => updateProp("padding", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option className="bg-background text-foreground" value="none">None</option>
                      <option className="bg-background text-foreground" value="sm">Small</option>
                      <option className="bg-background text-foreground" value="md">Medium</option>
                      <option className="bg-background text-foreground" value="lg">Large</option>
                      <option className="bg-background text-foreground" value="xl">Extra Large</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="display" className="text-xs font-medium text-muted-foreground">Display</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary">
                    <select id="display" value={props.display || "block"} onChange={(e) => updateProp("display", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option className="bg-background text-foreground" value="block">Block</option>
                      <option className="bg-background text-foreground" value="flex">Flex</option>
                    </select>
                  </div>
                </div>

                {props.display === "flex" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="flexDirection" className="text-xs font-medium text-muted-foreground">Direction</Label>
                        <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary">
                          <select id="flexDirection" value={props.flexDirection || "row"} onChange={(e) => updateProp("flexDirection", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                            <option className="bg-background text-foreground" value="row">Row</option>
                            <option className="bg-background text-foreground" value="column">Column</option>
                            <option className="bg-background text-foreground" value="row-reverse">Row Reverse</option>
                            <option className="bg-background text-foreground" value="column-reverse">Column Reverse</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="flexWrap" className="text-xs font-medium text-muted-foreground">Wrap</Label>
                        <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary">
                          <select id="flexWrap" value={props.flexWrap || "nowrap"} onChange={(e) => updateProp("flexWrap", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                            <option className="bg-background text-foreground" value="nowrap">No Wrap</option>
                            <option className="bg-background text-foreground" value="wrap">Wrap</option>
                            <option className="bg-background text-foreground" value="wrap-reverse">Wrap Reverse</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="justifyContent" className="text-xs font-medium text-muted-foreground">Justify</Label>
                        <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary">
                          <select id="justifyContent" value={props.justifyContent || "start"} onChange={(e) => updateProp("justifyContent", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                            <option className="bg-background text-foreground" value="start">Start</option>
                            <option className="bg-background text-foreground" value="center">Center</option>
                            <option className="bg-background text-foreground" value="end">End</option>
                            <option className="bg-background text-foreground" value="between">Space Between</option>
                            <option className="bg-background text-foreground" value="around">Space Around</option>
                            <option className="bg-background text-foreground" value="evenly">Space Evenly</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="alignItems" className="text-xs font-medium text-muted-foreground">Align</Label>
                        <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary">
                          <select id="alignItems" value={props.alignItems || "start"} onChange={(e) => updateProp("alignItems", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                            <option className="bg-background text-foreground" value="start">Start</option>
                            <option className="bg-background text-foreground" value="center">Center</option>
                            <option className="bg-background text-foreground" value="end">End</option>
                            <option className="bg-background text-foreground" value="stretch">Stretch</option>
                            <option className="bg-background text-foreground" value="baseline">Baseline</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="gap" className="text-xs font-medium text-muted-foreground">Gap</Label>
                      <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary">
                        <select id="gap" value={props.gap || "none"} onChange={(e) => updateProp("gap", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                          <option className="bg-background text-foreground" value="none">None</option>
                          <option className="bg-background text-foreground" value="sm">Small</option>
                          <option className="bg-background text-foreground" value="md">Medium</option>
                          <option className="bg-background text-foreground" value="lg">Large</option>
                          <option className="bg-background text-foreground" value="xl">Extra Large</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="overflowX" className="text-xs font-medium text-muted-foreground">Overflow X</Label>
                    <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary">
                      <select id="overflowX" value={props.overflowX || "visible"} onChange={(e) => updateProp("overflowX", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                        <option className="bg-background text-foreground" value="visible">Visible</option>
                        <option className="bg-background text-foreground" value="hidden">Hidden</option>
                        <option className="bg-background text-foreground" value="scroll">Scroll</option>
                        <option className="bg-background text-foreground" value="auto">Auto</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="overflowY" className="text-xs font-medium text-muted-foreground">Overflow Y</Label>
                    <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary">
                      <select id="overflowY" value={props.overflowY || "visible"} onChange={(e) => updateProp("overflowY", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                        <option className="bg-background text-foreground" value="visible">Visible</option>
                        <option className="bg-background text-foreground" value="hidden">Hidden</option>
                        <option className="bg-background text-foreground" value="scroll">Scroll</option>
                        <option className="bg-background text-foreground" value="auto">Auto</option>
                      </select>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderAllStyleSections()}
          </Accordion>
        );

      case "Grid":
        return (
          <Accordion type="multiple" defaultValue={["layout", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="layout" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-muted-foreground" />
                  Grid Settings
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="columns" className="text-xs font-medium text-muted-foreground">Columns</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary">
                    <select id="columns" value={props.columns || 3} onChange={(e) => updateProp("columns", parseInt(e.target.value))} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option className="bg-background text-foreground" value={1}>1 Column</option>
                      <option className="bg-background text-foreground" value={2}>2 Columns</option>
                      <option className="bg-background text-foreground" value={3}>3 Columns</option>
                      <option className="bg-background text-foreground" value={4}>4 Columns</option>
                      <option className="bg-background text-foreground" value={6}>6 Columns</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="gap" className="text-xs font-medium text-muted-foreground">Gap</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary">
                    <select id="gap" value={props.gap || "md"} onChange={(e) => updateProp("gap", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option className="bg-background text-foreground" value="none">None</option>
                      <option className="bg-background text-foreground" value="sm">Small</option>
                      <option className="bg-background text-foreground" value="md">Medium</option>
                      <option className="bg-background text-foreground" value="lg">Large</option>
                      <option className="bg-background text-foreground" value="xl">Extra Large</option>
                      <option className="bg-background text-foreground" value="custom">Custom</option>
                    </select>
                  </div>
                </div>

                {props.gap === "custom" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="gapCustom" className="text-xs font-medium text-muted-foreground">Custom Gap</Label>
                    <Input id="gapCustom" value={props.gapCustom || ""} onChange={(e) => updateProp("gapCustom", e.target.value)} placeholder="e.g. 20px, 1.5rem" className="h-8 text-xs" />
                  </div>
                )}

                <div className="flex items-center justify-between p-2 rounded-md bg-muted border border-border/50">
                  <Label htmlFor="responsive" className="text-xs font-medium text-muted-foreground cursor-pointer">Responsive (Stack on mobile)</Label>
                  <Switch id="responsive" checked={props.responsive !== false} onCheckedChange={(checked) => updateProp("responsive", checked)} className="scale-75 origin-right" />
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderAllStyleSections()}
          </Accordion>
        );

      case "Section":
        return (
          <Accordion type="multiple" defaultValue={["layout", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="layout" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-muted-foreground" />
                  Section Settings
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="padding" className="text-xs font-medium text-muted-foreground">Padding</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary">
                    <select id="padding" value={props.padding || "lg"} onChange={(e) => updateProp("padding", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option className="bg-background text-foreground" value="none">None</option>
                      <option className="bg-background text-foreground" value="sm">Small</option>
                      <option className="bg-background text-foreground" value="md">Medium</option>
                      <option className="bg-background text-foreground" value="lg">Large</option>
                      <option className="bg-background text-foreground" value="xl">Extra Large</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="maxWidth" className="text-xs font-medium text-muted-foreground">Max Width</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary">
                    <select id="maxWidth" value={props.maxWidth || "xl"} onChange={(e) => updateProp("maxWidth", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option className="bg-background text-foreground" value="sm">Small (640px)</option>
                      <option className="bg-background text-foreground" value="md">Medium (768px)</option>
                      <option className="bg-background text-foreground" value="lg">Large (1024px)</option>
                      <option className="bg-background text-foreground" value="xl">Extra Large (1280px)</option>
                      <option className="bg-background text-foreground" value="2xl">2X Large (1536px)</option>
                      <option className="bg-background text-foreground" value="full">Full Width</option>
                    </select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderAllStyleSections()}
          </Accordion>
        );

      case "Video":
        return (
          <Accordion type="multiple" defaultValue={["settings", "fill", "dimensions"]} className="w-full">
            <AccordionItem value="settings" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                  Video Settings
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div>
                  <Label htmlFor="src" className="mb-2 block">
                    Video URL
                  </Label>
                  <Input
                    id="src"
                    value={props.src || ""}
                    onChange={(e) => updateProp("src", e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div>
                  <Label htmlFor="title" className="mb-2 block">
                    Video Title
                  </Label>
                  <Input
                    id="title"
                    value={props.title || ""}
                    onChange={(e) => updateProp("title", e.target.value)}
                    placeholder="Video title"
                  />
                </div>

                <div>
                  <Label htmlFor="aspectRatio" className="mb-2 block">
                    Aspect Ratio
                  </Label>
                  <select
                    id="aspectRatio"
                    value={props.aspectRatio || "16/9"}
                    onChange={(e) => updateProp("aspectRatio", e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option className="bg-background text-foreground" value="16/9">16:9 (Widescreen)</option>
                    <option className="bg-background text-foreground" value="4/3">4:3 (Standard)</option>
                    <option className="bg-background text-foreground" value="1/1">1:1 (Square)</option>
                    <option className="bg-background text-foreground" value="21/9">21:9 (Ultrawide)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoplay"
                    checked={props.autoplay || false}
                    onCheckedChange={(checked) => updateProp("autoplay", checked)}
                  />
                  <Label htmlFor="autoplay">Autoplay</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="controls"
                    checked={props.controls !== false}
                    onCheckedChange={(checked) => updateProp("controls", checked)}
                  />
                  <Label htmlFor="controls">Show Controls</Label>
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderAllStyleSections()}
          </Accordion>
        );

      case "Form":
        return (
          <Accordion type="multiple" defaultValue={["settings", "fill", "dimensions"]} className="w-full">
            <AccordionItem value="settings" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                  Form Settings
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div>
                  <Label htmlFor="title" className="mb-2 block">
                    Form Title
                  </Label>
                  <Input
                    id="title"
                    value={props.title || ""}
                    onChange={(e) => updateProp("title", e.target.value)}
                    placeholder="Contact Form"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="mb-2 block">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={props.description || ""}
                    onChange={(e) => updateProp("description", e.target.value)}
                    placeholder="Form description"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="submitText" className="mb-2 block">
                    Submit Button Text
                  </Label>
                  <Input
                    id="submitText"
                    value={props.submitText || ""}
                    onChange={(e) => updateProp("submitText", e.target.value)}
                    placeholder="Submit"
                  />
                </div>

                <div>
                  <Label htmlFor="action" className="mb-2 block">
                    Form Action URL
                  </Label>
                  <Input
                    id="action"
                    value={props.action || ""}
                    onChange={(e) => updateProp("action", e.target.value)}
                    placeholder="https://example.com/submit"
                  />
                </div>

                <div>
                  <Label htmlFor="method" className="mb-2 block">
                    Method
                  </Label>
                  <select
                    id="method"
                    value={props.method || "POST"}
                    onChange={(e) => updateProp("method", e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option className="bg-background text-foreground" value="POST">POST</option>
                    <option className="bg-background text-foreground" value="GET">GET</option>
                  </select>
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderAllStyleSections()}
          </Accordion>
        );

      case "Accordion":
        return (
          <Accordion type="multiple" defaultValue={["items", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="items" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                  Accordion Items
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-4">
                  {(props.items || []).map((item: any, index: number) => (
                    <div key={index} className="space-y-2 p-3 border rounded-md bg-muted/30">
                      <Label className="text-xs text-muted-foreground w-full">Title</Label>
                      <Input
                        value={item.title || ""}
                        onChange={(e) => {
                          const newItems = [...(props.items || [])];
                          newItems[index] = { ...item, title: e.target.value };
                          updateProp("items", newItems);
                        }}
                        placeholder="Item title"
                        className="text-xs h-8"
                      />
                      <Label className="text-xs text-muted-foreground w-full mt-2">Content</Label>
                      <Textarea
                        value={item.content || ""}
                        onChange={(e) => {
                          const newItems = [...(props.items || [])];
                          newItems[index] = { ...item, content: e.target.value };
                          updateProp("items", newItems);
                        }}
                        placeholder="Item content"
                        rows={2}
                        className="text-xs resize-none"
                      />
                      <div className="flex justify-end pt-1">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() => {
                            const newItems = (props.items || []).filter(
                              (_: any, i: number) => i !== index
                            );
                            updateProp("items", newItems);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs border-dashed"
                    onClick={() => {
                      const newItems = [
                        ...(props.items || []),
                        { title: "New Item", content: "Content here" },
                      ];
                      updateProp("items", newItems);
                    }}
                  >
                    + Add Item
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderAllStyleSections()}
          </Accordion>
        );

      case "Tabs":
        return (
          <Accordion type="multiple" defaultValue={["settings", "fill", "dimensions"]} className="w-full">
            <AccordionItem value="settings" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                  Tabs Settings
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div>
                  <Label className="mb-2 block">Tab Items</Label>
                  <div className="space-y-2">
                    {(props.tabs || []).map((tab: any, index: number) => (
                      <div key={index} className="space-y-2 p-3 border rounded">
                        <Input
                          value={tab.label || ""}
                          onChange={(e) => {
                            const newTabs = [...(props.tabs || [])];
                            newTabs[index] = { ...tab, label: e.target.value };
                            updateProp("tabs", newTabs);
                          }}
                          placeholder="Tab label"
                        />
                        <Textarea
                          value={tab.content || ""}
                          onChange={(e) => {
                            const newTabs = [...(props.tabs || [])];
                            newTabs[index] = { ...tab, content: e.target.value };
                            updateProp("tabs", newTabs);
                          }}
                          placeholder="Tab content"
                          rows={2}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newTabs = (props.tabs || []).filter(
                              (_: any, i: number) => i !== index
                            );
                            updateProp("tabs", newTabs);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newTabs = [
                          ...(props.tabs || []),
                          { label: "New Tab", content: "Content here" },
                        ];
                        updateProp("tabs", newTabs);
                      }}
                    >
                      Add Tab
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderAllStyleSections()}
          </Accordion>
        );

      case "Testimonial":
        return (
          <Accordion type="multiple" defaultValue={["settings", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="settings" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                  Testimonial Details
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div>
                  <Label htmlFor="quote" className="mb-2 block">
                    Quote
                  </Label>
                  <Textarea
                    id="quote"
                    value={props.quote || ""}
                    onChange={(e) => updateProp("quote", e.target.value)}
                    placeholder="Enter testimonial quote"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="author" className="mb-2 block">
                    Author Name
                  </Label>
                  <Input
                    id="author"
                    value={props.author || ""}
                    onChange={(e) => updateProp("author", e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="role" className="mb-2 block">
                    Author Role
                  </Label>
                  <Input
                    id="role"
                    value={props.role || ""}
                    onChange={(e) => updateProp("role", e.target.value)}
                    placeholder="CEO, Company"
                  />
                </div>
                <div>
                  <Label htmlFor="avatar" className="mb-2 block">
                    Avatar URL
                  </Label>
                  <Input
                    id="avatar"
                    value={props.avatar || ""}
                    onChange={(e) => updateProp("avatar", e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="rating" className="mb-2 block">
                    Rating (1-5)
                  </Label>
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    value={props.rating || 5}
                    onChange={(e) => updateProp("rating", parseInt(e.target.value))}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderAllStyleSections()}
          </Accordion>
        );

      case "PricingCard":
        return (
          <Accordion type="multiple" defaultValue={["settings", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="settings" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                  Pricing Details
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div>
                  <Label htmlFor="title" className="mb-2 block">
                    Plan Name
                  </Label>
                  <Input
                    id="title"
                    value={props.title || ""}
                    onChange={(e) => updateProp("title", e.target.value)}
                    placeholder="Pro Plan"
                  />
                </div>
                <div>
                  <Label htmlFor="price" className="mb-2 block">
                    Price
                  </Label>
                  <Input
                    id="price"
                    value={props.price || ""}
                    onChange={(e) => updateProp("price", e.target.value)}
                    placeholder="$29"
                  />
                </div>
                <div>
                  <Label htmlFor="period" className="mb-2 block">
                    Billing Period
                  </Label>
                  <Input
                    id="period"
                    value={props.period || ""}
                    onChange={(e) => updateProp("period", e.target.value)}
                    placeholder="/month"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="mb-2 block">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={props.description || ""}
                    onChange={(e) => updateProp("description", e.target.value)}
                    placeholder="Plan description"
                    rows={2}
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Features</Label>
                  <div className="space-y-2">
                    {(props.features || []).map(
                      (feature: string, index: number) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={feature}
                            onChange={(e) => {
                              const newFeatures = [...(props.features || [])];
                              newFeatures[index] = e.target.value;
                              updateProp("features", newFeatures);
                            }}
                            placeholder="Feature"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newFeatures = (props.features || []).filter(
                                (_: any, i: number) => i !== index
                              );
                              updateProp("features", newFeatures);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      )
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newFeatures = [
                          ...(props.features || []),
                          "New feature",
                        ];
                        updateProp("features", newFeatures);
                      }}
                    >
                      Add Feature
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="buttonText" className="mb-2 block">
                    Button Text
                  </Label>
                  <Input
                    id="buttonText"
                    value={props.buttonText || ""}
                    onChange={(e) => updateProp("buttonText", e.target.value)}
                    placeholder="Get Started"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={props.featured || false}
                    onCheckedChange={(checked) => updateProp("featured", checked)}
                  />
                  <Label htmlFor="featured">Featured Plan</Label>
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderAllStyleSections()}
          </Accordion>
        );

      case "Feature":
        return (
          <Accordion type="multiple" defaultValue={["settings", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="settings" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                  Feature Settings
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div>
                  <Label htmlFor="icon" className="mb-2 block">
                    Icon (Emoji)
                  </Label>
                  <Input
                    id="icon"
                    value={props.icon || ""}
                    onChange={(e) => updateProp("icon", e.target.value)}
                    placeholder="✨"
                  />
                </div>
                <div>
                  <Label htmlFor="title" className="mb-2 block">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={props.title || ""}
                    onChange={(e) => updateProp("title", e.target.value)}
                    placeholder="Feature title"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="mb-2 block">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={props.description || ""}
                    onChange={(e) => updateProp("description", e.target.value)}
                    placeholder="Feature description"
                    rows={3}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderAllStyleSections()}
          </Accordion>
        );

      case "Stats":
        return (
          <Accordion type="multiple" defaultValue={["settings", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="settings" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                  Stats Configuration
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div>
                  <Label htmlFor="accentColor" className="mb-2 block">
                    Accent Color (for values)
                  </Label>
                  <Input
                    id="accentColor"
                    type="color"
                    value={props.accentColor || "#3b82f6"}
                    onChange={(e) => updateProp("accentColor", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Statistics</Label>
                  <div className="space-y-2">
                    {(props.stats || []).map((stat: any, index: number) => (
                      <div key={index} className="space-y-2 p-3 border rounded">
                        <Input
                          value={stat.value || ""}
                          onChange={(e) => {
                            const newStats = [...(props.stats || [])];
                            newStats[index] = { ...stat, value: e.target.value };
                            updateProp("stats", newStats);
                          }}
                          placeholder="100+"
                        />
                        <Input
                          value={stat.label || ""}
                          onChange={(e) => {
                            const newStats = [...(props.stats || [])];
                            newStats[index] = { ...stat, label: e.target.value };
                            updateProp("stats", newStats);
                          }}
                          placeholder="Customers"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newStats = (props.stats || []).filter(
                              (_: any, i: number) => i !== index
                            );
                            updateProp("stats", newStats);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newStats = [
                          ...(props.stats || []),
                          { value: "100+", label: "Stat" },
                        ];
                        updateProp("stats", newStats);
                      }}
                    >
                      Add Stat
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderAllStyleSections()}
          </Accordion>
        );

      case "CTA":
        return (
          <Accordion type="multiple" defaultValue={["settings", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="settings" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                  CTA Configuration
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div>
                  <Label htmlFor="title" className="mb-2 block">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={props.title || ""}
                    onChange={(e) => updateProp("title", e.target.value)}
                    placeholder="Ready to get started?"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="mb-2 block">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={props.description || ""}
                    onChange={(e) => updateProp("description", e.target.value)}
                    placeholder="Join thousands of users today"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="buttonText" className="mb-2 block">
                    Button Text
                  </Label>
                  <Input
                    id="buttonText"
                    value={props.buttonText || ""}
                    onChange={(e) => updateProp("buttonText", e.target.value)}
                    placeholder="Get Started"
                  />
                </div>
                <div>
                  <Label htmlFor="buttonLink" className="mb-2 block">
                    Button Link
                  </Label>
                  <Input
                    id="buttonLink"
                    value={props.buttonLink || ""}
                    onChange={(e) => updateProp("buttonLink", e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderAllStyleSections()}
          </Accordion>
        );

      case "Divider":
        return (
          <Accordion type="multiple" defaultValue={["settings", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="settings" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                  Divider Settings
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div>
                  <Label htmlFor="thickness" className="mb-2 block text-xs">
                    Thickness
                  </Label>
                  <select
                    id="thickness"
                    value={props.thickness || "1"}
                    onChange={(e) => updateProp("thickness", e.target.value)}
                    className="w-full p-2 border rounded-md text-xs"
                  >
                    <option className="bg-background text-foreground" value="1">1px</option>
                    <option className="bg-background text-foreground" value="2">2px</option>
                    <option className="bg-background text-foreground" value="4">4px</option>
                    <option className="bg-background text-foreground" value="8">8px</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="color" className="mb-2 block text-xs">
                    Color
                  </Label>
                  <Input
                    id="color"
                    type="color"
                    value={props.color || "#e5e7eb"}
                    onChange={(e) => updateProp("color", e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="style" className="mb-2 block text-xs">
                    Style
                  </Label>
                  <select
                    id="style"
                    value={props.style || "solid"}
                    onChange={(e) => updateProp("style", e.target.value)}
                    className="w-full p-2 border rounded-md text-xs"
                  >
                    <option className="bg-background text-foreground" value="solid">Solid</option>
                    <option className="bg-background text-foreground" value="dashed">Dashed</option>
                    <option className="bg-background text-foreground" value="dotted">Dotted</option>
                  </select>
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderAllStyleSections()}
          </Accordion>
        );

      case "Spacer":
        return (
          <Accordion type="multiple" defaultValue={["settings", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="settings" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                  Spacer Settings
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div>
                  <Label htmlFor="size" className="mb-2 block text-xs">
                    Size
                  </Label>
                  <select
                    id="size"
                    value={props.size || "md"}
                    onChange={(e) => updateProp("size", e.target.value)}
                    className="w-full p-2 border rounded-md text-xs"
                  >
                    <option className="bg-background text-foreground" value="xs">Extra Small (8px)</option>
                    <option className="bg-background text-foreground" value="sm">Small (16px)</option>
                    <option className="bg-background text-foreground" value="md">Medium (32px)</option>
                    <option className="bg-background text-foreground" value="lg">Large (64px)</option>
                    <option className="bg-background text-foreground" value="xl">Extra Large (128px)</option>
                  </select>
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderAllStyleSections()}
          </Accordion>
        );

      case "Badge":
        return (
          <Accordion type="multiple" defaultValue={["content", "fill", "dimensions"]} className="w-full">
            <AccordionItem value="content" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-muted-foreground" />
                  Badge Content
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="text" className="text-xs font-medium text-muted-foreground">Text</Label>
                  <Input id="text" value={props.text || ""} onChange={(e) => updateProp("text", e.target.value)} placeholder="New" className="h-8 text-sm" />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="variant" className="text-xs font-medium text-muted-foreground">Variant</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary">
                    <select id="variant" value={props.variant || "default"} onChange={(e) => updateProp("variant", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option className="bg-background text-foreground" value="default">Default</option>
                      <option className="bg-background text-foreground" value="success">Success</option>
                      <option className="bg-background text-foreground" value="warning">Warning</option>
                      <option className="bg-background text-foreground" value="error">Error</option>
                      <option className="bg-background text-foreground" value="info">Info</option>
                    </select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderAllStyleSections()}
          </Accordion>
        );

      case "Alert":
        return (
          <Accordion type="multiple" defaultValue={["content", "fill", "dimensions"]} className="w-full">
            <AccordionItem value="content" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-muted-foreground" />
                  Alert Content
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-medium text-muted-foreground">Title</Label>
                  <Input id="title" value={props.title || ""} onChange={(e) => updateProp("title", e.target.value)} placeholder="Alert title" className="h-8 text-sm" />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-xs font-medium text-muted-foreground">Message</Label>
                  <Textarea id="message" value={props.message || ""} onChange={(e) => updateProp("message", e.target.value)} placeholder="Alert message" rows={2} className="text-sm resize-none" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="variant" className="text-xs font-medium text-muted-foreground">Variant</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary">
                    <select id="variant" value={props.variant || "info"} onChange={(e) => updateProp("variant", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option className="bg-background text-foreground" value="info">Info</option>
                      <option className="bg-background text-foreground" value="success">Success</option>
                      <option className="bg-background text-foreground" value="warning">Warning</option>
                      <option className="bg-background text-foreground" value="error">Error</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-2 rounded-md bg-muted border border-border/50">
                  <Label htmlFor="dismissible" className="text-xs font-medium text-muted-foreground cursor-pointer">Dismissible</Label>
                  <Switch id="dismissible" checked={props.dismissible || false} onCheckedChange={(checked) => updateProp("dismissible", checked)} className="scale-75 origin-right" />
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderAllStyleSections()}
          </Accordion>
        );

      case "Video":
        return (
          <Accordion type="multiple" defaultValue={["settings", "fill", "dimensions"]} className="w-full">
            <AccordionItem value="settings" className="border-b-0 border-t border-border/50 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                  Video Settings
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="youtubeId" className="text-xs font-medium text-muted-foreground">YouTube ID</Label>
                  <Input id="youtubeId" value={props.youtubeId || ""} onChange={(e) => updateProp("youtubeId", e.target.value)} placeholder="e.g. dQw4w9WgXcQ" className="h-8 text-sm" />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="vimeoId" className="text-xs font-medium text-muted-foreground">Vimeo ID</Label>
                  <Input id="vimeoId" value={props.vimeoId || ""} onChange={(e) => updateProp("vimeoId", e.target.value)} placeholder="e.g. 76979871" className="h-8 text-sm" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="src" className="text-xs font-medium text-muted-foreground">Direct Video URL (MP4, WebM)</Label>
                  <Input id="src" value={props.src || ""} onChange={(e) => updateProp("src", e.target.value)} placeholder="https://example.com/video.mp4" className="h-8 text-sm" />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="poster" className="text-xs font-medium text-muted-foreground">Poster Image URL</Label>
                  <Input id="poster" value={props.poster || ""} onChange={(e) => updateProp("poster", e.target.value)} placeholder="https://example.com/poster.jpg" className="h-8 text-sm" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="aspectRatio" className="text-xs font-medium text-muted-foreground">Aspect Ratio</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary">
                    <select id="aspectRatio" value={props.aspectRatio || "16:9"} onChange={(e) => updateProp("aspectRatio", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option className="bg-background text-foreground" value="16:9">16:9</option>
                      <option className="bg-background text-foreground" value="4:3">4:3</option>
                      <option className="bg-background text-foreground" value="1:1">1:1</option>
                      <option className="bg-background text-foreground" value="21:9">21:9</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-md bg-muted border border-border/50">
                  <Label htmlFor="autoplay" className="text-xs font-medium text-muted-foreground cursor-pointer">Autoplay</Label>
                  <Switch id="autoplay" checked={props.autoplay || false} onCheckedChange={(checked) => updateProp("autoplay", checked)} className="scale-75 origin-right" />
                </div>

                <div className="flex items-center justify-between p-2 rounded-md bg-muted border border-border/50">
                  <Label htmlFor="loop" className="text-xs font-medium text-muted-foreground cursor-pointer">Loop</Label>
                  <Switch id="loop" checked={props.loop || false} onCheckedChange={(checked) => updateProp("loop", checked)} className="scale-75 origin-right" />
                </div>

                <div className="flex items-center justify-between p-2 rounded-md bg-muted border border-border/50">
                  <Label htmlFor="muted" className="text-xs font-medium text-muted-foreground cursor-pointer">Muted</Label>
                  <Switch id="muted" checked={props.muted || false} onCheckedChange={(checked) => updateProp("muted", checked)} className="scale-75 origin-right" />
                </div>

                <div className="flex items-center justify-between p-2 rounded-md bg-muted border border-border/50">
                  <Label htmlFor="controls" className="text-xs font-medium text-muted-foreground cursor-pointer">Controls</Label>
                  <Switch id="controls" checked={props.controls !== false} onCheckedChange={(checked) => updateProp("controls", checked)} className="scale-75 origin-right" />
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderAllStyleSections()}
          </Accordion>
        );

      default:
        // By default, if a component type isn't specifically handled above,
        // it still invokes renderColorFields() and renderDimensionFields().
        // These return <AccordionItem> components, which MUST be wrapped in an <Accordion>.
        return (
          <div className="flex flex-col space-y-4">
            <div className="text-center text-muted-foreground py-4">
              <div className="text-4xl mb-2">🔧</div>
              <div className="text-sm">Properties for {type} component</div>
              <div className="text-[10px] text-muted-foreground/50 mt-1 uppercase tracking-wider">Advanced configuration coming soon</div>
            </div>
            <Accordion type="multiple" defaultValue={["colors", "dimensions"]} className="w-full">
              {renderAllStyleSections()}
            </Accordion>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Properties</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedComponent.type} Component
            </p>
          </div>
          {/* Global toggle button */}
          {isGlobal ? (
            <button
              onClick={() => onUnmarkGlobal?.(selectedComponent.id)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 text-xs font-medium hover:bg-blue-500/25 transition-colors"
              title={`Global: ${selectedComponent.isGlobal} — Click to unmark`}
            >
              <Globe className="w-3 h-3" />
              {selectedComponent.isGlobal}
              <X className="w-3 h-3 opacity-60" />
            </button>
          ) : (
            <button
              onClick={() => setShowGlobalDialog(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              title="Mark as Global Component"
            >
              <Globe className="w-3 h-3" />
              Make Global
            </button>
          )}
        </div>
      </div>

      {/* Properties Form */}
      <div className="flex-1 overflow-auto p-4">{renderPropertyFields()}</div>

      {/* Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() =>
            selectedComponent && onDuplicateComponent(selectedComponent.id)
          }
        >
          Duplicate Component
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() =>
            selectedComponent && onDeleteComponent(selectedComponent.id)
          }
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
              Global components sync their styles across all pages. Give this component a global name, or select an existing global group to join.
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
                      <Globe className="w-3.5 h-3.5 text-blue-400" />
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
                    <span className="bg-background px-2 text-muted-foreground">or create new</span>
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
