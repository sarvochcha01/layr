"use client";
import React from "react";
import { Type } from "lucide-react";
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

export function TypographySection({ props, updateProp }: StyleSectionProps) {
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
              <button
                key={a}
                onClick={() => updateProp("textAlign_css", a)}
                className={`flex-1 px-2 py-1 text-xs rounded capitalize transition-colors ${(props.textAlign_css || "") === a ? "bg-secondary text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
