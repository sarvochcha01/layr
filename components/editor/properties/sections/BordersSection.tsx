"use client";
import React from "react";
import { Scissors } from "lucide-react";
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

export function BordersSection({ props, updateProp }: StyleSectionProps) {
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
}
