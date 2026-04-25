"use client";
import React from "react";
import { Paintbrush, Space } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Page } from "@/types/editor";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const labelClass = "text-xs font-medium text-muted-foreground";

interface PagePropertiesProps {
  currentPage: Page;
  onUpdatePage: (updates: Partial<Page>) => void;
}

export function PageProperties({ currentPage, onUpdatePage }: PagePropertiesProps) {
  const bgType = currentPage.backgroundType || "solid";

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Page Settings</h3>
      </div>
      <div className="flex-1 overflow-auto">
        <Accordion type="multiple" defaultValue={["background", "spacing"]} className="w-full">
          {/* Component Spacing Section */}
          <AccordionItem value="spacing" className="border-b-0 border-t border-border/50">
            <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
              <div className="flex items-center gap-2">
                <Space className="w-4 h-4 text-muted-foreground" />
                Component Spacing
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
              <div className="space-y-1.5">
                <Label className={labelClass}>Spacing Between Components</Label>
                <div className="flex flex-col gap-1 border rounded-md p-1">
                  {(["none", "compact", "normal", "relaxed", "loose"] as const).map((spacing) => (
                    <button
                      key={spacing}
                      onClick={() => onUpdatePage({ componentSpacing: spacing })}
                      className={`px-3 py-2 text-xs rounded capitalize transition-colors text-left ${
                        (currentPage.componentSpacing || "normal") === spacing
                          ? "bg-secondary text-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{spacing}</span>
                        <span className="text-[10px] opacity-60">
                          {spacing === "none" && "0px"}
                          {spacing === "compact" && "8px"}
                          {spacing === "normal" && "16px"}
                          {spacing === "relaxed" && "24px"}
                          {spacing === "loose" && "32px"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Controls the vertical spacing between components on this page
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="background" className="border-b-0 border-t border-border/50">
            <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
              <div className="flex items-center gap-2">
                <Paintbrush className="w-4 h-4 text-muted-foreground" />
                Page Background
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
              {/* Background Type Selector */}
              <div className="space-y-1.5">
                <Label className={labelClass}>Background Type</Label>
                <div className="flex gap-1 border rounded-md p-0.5">
                  {(["solid", "gradient", "image"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        const updates: Partial<Page> = { backgroundType: t };
                        // Initialize gradient defaults when switching to gradient
                        if (t === "gradient" && !currentPage.gradientStart) {
                          updates.gradientStart = "#667eea";
                          updates.gradientEnd = "#764ba2";
                          updates.gradientDirection = "to bottom right";
                        }
                        onUpdatePage(updates);
                      }}
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
                    <Input type="color" value={currentPage.backgroundColor || "#0d0d0d"} onChange={(e) => onUpdatePage({ backgroundColor: e.target.value })} className="w-8 h-8 p-0.5 min-h-0 cursor-pointer" />
                    <Input type="text" value={currentPage.backgroundColor || "#0d0d0d"} onChange={(e) => onUpdatePage({ backgroundColor: e.target.value })} className="flex-1 h-8 text-xs font-mono" />
                  </div>
                </div>
              )}

              {/* Gradient */}
              {bgType === "gradient" && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className={labelClass}>Start Color</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        value={currentPage.gradientStart || "#667eea"}
                        onChange={(e) => onUpdatePage({ gradientStart: e.target.value })}
                        className="w-8 h-8 p-0.5 min-h-0 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={currentPage.gradientStart || "#667eea"}
                        onChange={(e) => onUpdatePage({ gradientStart: e.target.value })}
                        className="flex-1 h-8 text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className={labelClass}>End Color</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        value={currentPage.gradientEnd || "#764ba2"}
                        onChange={(e) => onUpdatePage({ gradientEnd: e.target.value })}
                        className="w-8 h-8 p-0.5 min-h-0 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={currentPage.gradientEnd || "#764ba2"}
                        onChange={(e) => onUpdatePage({ gradientEnd: e.target.value })}
                        className="flex-1 h-8 text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className={labelClass}>Direction</Label>
                    <div className="relative border rounded-md">
                      <select
                        value={currentPage.gradientDirection || "to bottom right"}
                        onChange={(e) => onUpdatePage({ gradientDirection: e.target.value })}
                        className="w-full h-8 px-2 text-xs bg-transparent appearance-none focus:outline-none"
                      >
                        <option className="bg-background text-foreground" value="to right">To Right</option>
                        <option className="bg-background text-foreground" value="to left">To Left</option>
                        <option className="bg-background text-foreground" value="to bottom">To Bottom</option>
                        <option className="bg-background text-foreground" value="to top">To Top</option>
                        <option className="bg-background text-foreground" value="to bottom right">To Bottom Right</option>
                        <option className="bg-background text-foreground" value="to bottom left">To Bottom Left</option>
                        <option className="bg-background text-foreground" value="to top right">To Top Right</option>
                        <option className="bg-background text-foreground" value="to top left">To Top Left</option>
                        <option className="bg-background text-foreground" value="custom">Custom Angle</option>
                      </select>
                    </div>
                  </div>
                  {currentPage.gradientDirection === "custom" && (
                    <div className="space-y-1.5">
                      <Label className={labelClass}>Angle (degrees)</Label>
                      <Input
                        type="number"
                        value={currentPage.gradientAngle || "135"}
                        onChange={(e) => onUpdatePage({ gradientAngle: e.target.value })}
                        min="0"
                        max="360"
                        className="h-8 text-xs"
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label className={labelClass}>Preview</Label>
                    <div
                      className="h-12 rounded border"
                      style={{
                        backgroundImage: `linear-gradient(${currentPage.gradientDirection === "custom" ? `${currentPage.gradientAngle || "135"}deg` : currentPage.gradientDirection || "to bottom right"}, ${currentPage.gradientStart || "#667eea"}, ${currentPage.gradientEnd || "#764ba2"})`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Background Image */}
              {bgType === "image" && (
                <>
                  <div className="space-y-1.5">
                    <Label className={labelClass}>Image URL</Label>
                    <Input value={currentPage.backgroundImageUrl || ""} onChange={(e) => onUpdatePage({ backgroundImageUrl: e.target.value })} placeholder="https://example.com/bg.jpg" className="h-8 text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className={labelClass}>Size</Label>
                      <div className="relative border rounded-md">
                        <select value={currentPage.backgroundSize || "cover"} onChange={(e) => onUpdatePage({ backgroundSize: e.target.value })} className="w-full h-8 px-2 text-xs bg-transparent appearance-none focus:outline-none">
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
                        <select value={currentPage.backgroundPosition || "center"} onChange={(e) => onUpdatePage({ backgroundPosition: e.target.value })} className="w-full h-8 px-2 text-xs bg-transparent appearance-none focus:outline-none">
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
