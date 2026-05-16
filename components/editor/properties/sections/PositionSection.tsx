"use client";
import React from "react";
import { Layout } from "lucide-react";
import { DebouncedInput } from "../fields";
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

export function PositionSection({ props, updateProp }: StyleSectionProps) {
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
                <DebouncedInput value={props[key] || ""} onChange={(v) => updateProp(key, v)} placeholder="auto" className="h-7 text-xs" />
              </div>
            ))}
          </div>
        )}
        <div className="space-y-1.5">
          <Label className={labelClass}>Z-Index</Label>
          <DebouncedInput type="number" value={props.zIndex || ""} onChange={(v) => updateProp("zIndex", v)} placeholder="auto" className="h-8 text-xs" />
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
}
