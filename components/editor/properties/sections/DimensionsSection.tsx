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
const sectionTriggerClass = "hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50";
const sectionContentClass = "px-4 pb-4 pt-2 space-y-4";

// Helper: parse "200px" → { value: "200", unit: "px" }
function parseDimension(value: string | undefined) {
  if (!value || value === "auto") return { value: "", unit: "auto" };
  if (value && !value.match(/\d/)) return { value: "", unit: value };
  const match = value.match(/^(\d+\.?\d*)(.*)$/);
  if (match) return { value: match[1], unit: match[2] || "px" };
  return { value: "", unit: "px" };
}

function combineDimension(value: string, unit: string) {
  if (!value || unit === "auto") return "auto";
  return `${value}${unit}`;
}

function combineDimensionAllowEmpty(value: string, unit: string) {
  if (unit === "auto") return "auto";
  if (!value) return unit;
  return `${value}${unit}`;
}

export function DimensionsSection({ props, updateProp }: StyleSectionProps) {
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
          {/* Width */}
          <div className="space-y-1.5">
            <Label className={labelClass}>Width</Label>
            <div className="flex gap-0 border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-primary">
              <Input
                type="number"
                value={width.value}
                onChange={(e) => updateProp("width", combineDimensionAllowEmpty(e.target.value, width.unit))}
                onBlur={(e) => { if (!e.target.value && width.unit !== "auto") updateProp("width", "auto"); }}
                placeholder="auto"
                className="flex-1 h-8 text-xs border-0 rounded-none shadow-none focus-visible:ring-0 px-2"
                disabled={width.unit === "auto"}
              />
              <select
                value={width.unit}
                onChange={(e) => {
                  const u = e.target.value;
                  updateProp("width", u === "auto" ? "auto" : combineDimension(width.value || "100", u));
                }}
                className="w-14 bg-muted border-l text-xs text-muted-foreground px-1 focus:outline-none"
              >
                <option className="bg-background text-foreground" value="auto">auto</option>
                <option className="bg-background text-foreground" value="px">px</option>
                <option className="bg-background text-foreground" value="%">%</option>
                <option className="bg-background text-foreground" value="rem">rem</option>
                <option className="bg-background text-foreground" value="vw">vw</option>
              </select>
            </div>
          </div>
          {/* Height */}
          <div className="space-y-1.5">
            <Label className={labelClass}>Height</Label>
            <div className="flex gap-0 border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-primary">
              <Input
                type="number"
                value={height.value}
                onChange={(e) => updateProp("height", combineDimensionAllowEmpty(e.target.value, height.unit))}
                onBlur={(e) => { if (!e.target.value && height.unit !== "auto") updateProp("height", "auto"); }}
                placeholder="auto"
                className="flex-1 h-8 text-xs border-0 rounded-none shadow-none focus-visible:ring-0 px-2"
                disabled={height.unit === "auto"}
              />
              <select
                value={height.unit}
                onChange={(e) => {
                  const u = e.target.value;
                  updateProp("height", u === "auto" ? "auto" : combineDimension(height.value || "100", u));
                }}
                className="w-14 bg-muted border-l text-xs text-muted-foreground px-1 focus:outline-none"
              >
                <option className="bg-background text-foreground" value="auto">auto</option>
                <option className="bg-background text-foreground" value="px">px</option>
                <option className="bg-background text-foreground" value="%">%</option>
                <option className="bg-background text-foreground" value="rem">rem</option>
                <option className="bg-background text-foreground" value="vh">vh</option>
              </select>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
