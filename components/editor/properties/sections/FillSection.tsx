"use client";
import React from "react";
import { Paintbrush } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StyleSectionProps } from "../types";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const labelClass = "text-xs font-medium text-muted-foreground";
const selectClass = "w-full h-8 px-2 text-xs bg-transparent appearance-none focus:outline-none";
const sectionTriggerClass = "hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50";
const sectionContentClass = "px-4 pb-4 pt-2 space-y-4";

export function FillSection({ props, updateProp }: StyleSectionProps) {
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
                onClick={() => {
                  updateProp("backgroundType", t);
                  if (t === "gradient" && !props.gradientStart && !props.gradientEnd) {
                    updateProp("gradientStart", "#667eea");
                    updateProp("gradientEnd", "#764ba2");
                    updateProp("gradientDirection", "to bottom right");
                  }
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
              <Input type="color" value={props.backgroundColor || "#ffffff"} onChange={(e) => updateProp("backgroundColor", e.target.value)} className="w-8 h-8 p-0.5 min-h-0 cursor-pointer" />
              <Input type="text" value={props.backgroundColor || "#ffffff"} onChange={(e) => updateProp("backgroundColor", e.target.value)} className="flex-1 h-8 text-xs font-mono" />
            </div>
          </div>
        )}

        {/* Gradient */}
        {bgType === "gradient" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className={labelClass}>Start Color</Label>
              <div className="flex gap-2 items-center">
                <Input type="color" value={props.gradientStart || "#667eea"} onChange={(e) => updateProp("gradientStart", e.target.value)} className="w-8 h-8 p-0.5 min-h-0 cursor-pointer" />
                <Input type="text" value={props.gradientStart || "#667eea"} onChange={(e) => updateProp("gradientStart", e.target.value)} className="flex-1 h-8 text-xs font-mono" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>End Color</Label>
              <div className="flex gap-2 items-center">
                <Input type="color" value={props.gradientEnd || "#764ba2"} onChange={(e) => updateProp("gradientEnd", e.target.value)} className="w-8 h-8 p-0.5 min-h-0 cursor-pointer" />
                <Input type="text" value={props.gradientEnd || "#764ba2"} onChange={(e) => updateProp("gradientEnd", e.target.value)} className="flex-1 h-8 text-xs font-mono" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Direction</Label>
              <div className="relative border rounded-md">
                <select value={props.gradientDirection || "to bottom right"} onChange={(e) => updateProp("gradientDirection", e.target.value)} className={selectClass}>
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
            {props.gradientDirection === "custom" && (
              <div className="space-y-1.5">
                <Label className={labelClass}>Angle (degrees)</Label>
                <Input type="number" value={props.gradientAngle || "135"} onChange={(e) => updateProp("gradientAngle", e.target.value)} min="0" max="360" className="h-8 text-xs" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className={labelClass}>Preview</Label>
              <div
                className="h-12 rounded border"
                style={{
                  backgroundImage: `linear-gradient(${props.gradientDirection === "custom" ? `${props.gradientAngle || "135"}deg` : props.gradientDirection || "to bottom right"}, ${props.gradientStart || "#667eea"}, ${props.gradientEnd || "#764ba2"})`,
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

        {/* Text Color */}
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
}
