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
const sectionTriggerClass = "hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50";
const sectionContentClass = "px-4 pb-4 pt-2 space-y-4";

export function SpacingSection({ props, updateProp }: StyleSectionProps) {
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
                  <DebouncedInput
                    value={props[key] || ""}
                    onChange={(v) => updateProp(key, v)}
                    placeholder="0"
                    className="h-7 text-xs text-center px-1"
                  />
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
                  <DebouncedInput
                    value={props[key] || ""}
                    onChange={(v) => updateProp(key, v)}
                    placeholder="0"
                    className="h-7 text-xs text-center px-1"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
