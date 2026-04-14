"use client";
import React from "react";
import { Paintbrush } from "lucide-react";
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
        <Accordion type="multiple" defaultValue={["background"]} className="w-full">
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
                      onClick={() => onUpdatePage({ backgroundType: t })}
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
                <div className="space-y-1.5">
                  <Label className={labelClass}>CSS Gradient</Label>
                  <Input
                    value={currentPage.backgroundGradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}
                    onChange={(e) => onUpdatePage({ backgroundGradient: e.target.value })}
                    placeholder="linear-gradient(135deg, #667eea, #764ba2)"
                    className="h-8 text-xs font-mono"
                  />
                  <div className="h-8 rounded border" style={{ backgroundImage: currentPage.backgroundGradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }} />
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
