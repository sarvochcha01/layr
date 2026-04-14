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

export function EffectsSection({ props, updateProp }: StyleSectionProps) {
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
            <span className="text-xs text-muted-foreground">
              {Math.round((props.opacity_css ?? 1) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={props.opacity_css ?? 1}
            onChange={(e) => updateProp("opacity_css", parseFloat(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
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
          <Input
            value={props.boxShadow || ""}
            onChange={(e) => updateProp("boxShadow", e.target.value)}
            placeholder="Custom: 0 4px 6px rgba(0,0,0,0.1)"
            className="h-8 text-xs font-mono"
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
