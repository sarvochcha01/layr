"use client";
import React from "react";
import { Scissors } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DebouncedInput } from "../fields";
import { Label } from "@/components/ui/label";
import { StyleSectionProps } from "../types";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useThemeStyle } from "@/contexts/ThemeStyleContext";
import { THEME_STYLES } from "@/lib/themeStyles";

const labelClass = "text-xs font-medium text-muted-foreground";
const selectClass = "w-full h-8 px-2 text-xs bg-transparent appearance-none focus:outline-none";
const sectionTriggerClass = "hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50";
const sectionContentClass = "px-4 pb-4 pt-2 space-y-4";

export function BordersSection({ props, updateProp }: StyleSectionProps) {
  // Get active theme defaults for display values
  const { globalThemeStyle, isGlobalThemeEnabled } = useThemeStyle();
  const activeThemeKey = props.themeStyle || (isGlobalThemeEnabled ? globalThemeStyle : null);
  const activeTheme = activeThemeKey ? THEME_STYLES[activeThemeKey as keyof typeof THEME_STYLES] : null;

  const themeRadius = activeTheme?.style.radius || "0px";
  const themeBorderWidth = activeTheme?.style.borderWidth || "0px";
  const themeBorderColor = activeTheme?.colors.border || "#000000";
  const themeName = activeTheme?.name;

  // Displayed values: show theme value when no explicit override
  const displayRadius = props.borderRadius_css || (themeName ? themeRadius : "");
  const displayWidth = props.borderWidth_css || (themeName ? themeBorderWidth : "");
  const displayColor = props.borderColor || (themeName && themeBorderColor.startsWith("#") ? themeBorderColor : "#000000");
  const isRadiusInherited = !props.borderRadius_css && !!themeName;
  const isWidthInherited = !props.borderWidth_css && !!themeName;
  const isColorInherited = !props.borderColor && !!themeName;

  return (
    <AccordionItem value="borders" className="border-b-0 border-t border-border/50">
      <AccordionTrigger className={sectionTriggerClass}>
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-muted-foreground" />
          Borders
        </div>
      </AccordionTrigger>
      <AccordionContent className={sectionContentClass}>
        {/* Theme indicator */}
        {themeName && (
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">{themeName}</span>
            <span>values shown • edit to override</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className={labelClass}>Radius</Label>
              {props.borderRadius_css && themeName && (
                <button
                  onClick={() => updateProp("borderRadius_css", undefined)}
                  className="text-[10px] text-primary hover:text-primary/80 font-medium"
                >
                  Use theme
                </button>
              )}
            </div>
            <DebouncedInput
              value={displayRadius}
              onChange={(v) => updateProp("borderRadius_css", v || undefined)}
              placeholder="0px"
              className={`h-8 text-xs ${isRadiusInherited ? "text-muted-foreground italic" : ""}`}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className={labelClass}>Width</Label>
              {props.borderWidth_css && themeName && (
                <button
                  onClick={() => updateProp("borderWidth_css", undefined)}
                  className="text-[10px] text-primary hover:text-primary/80 font-medium"
                >
                  Use theme
                </button>
              )}
            </div>
            <DebouncedInput
              value={displayWidth}
              onChange={(v) => updateProp("borderWidth_css", v || undefined)}
              placeholder="0px"
              className={`h-8 text-xs ${isWidthInherited ? "text-muted-foreground italic" : ""}`}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className={labelClass}>Color</Label>
              {props.borderColor && themeName && (
                <button
                  onClick={() => updateProp("borderColor", undefined)}
                  className="text-[10px] text-primary hover:text-primary/80 font-medium"
                >
                  Use theme
                </button>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={displayColor}
                onChange={(e) => updateProp("borderColor", e.target.value)}
                className="w-8 h-8 p-0.5 min-h-0 cursor-pointer"
              />
              <DebouncedInput
                value={props.borderColor || (themeName && themeBorderColor.startsWith("#") ? themeBorderColor : "")}
                onChange={(v) => updateProp("borderColor", v || undefined)}
                placeholder="#000000"
                className={`flex-1 h-8 text-xs font-mono ${isColorInherited ? "text-muted-foreground italic" : ""}`}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Style</Label>
            <div className="relative border rounded-md">
              <select value={props.borderStyle_css || ""} onChange={(e) => updateProp("borderStyle_css", e.target.value)} className={selectClass}>
                <option className="bg-background text-foreground" value="">{themeName ? "Solid (theme)" : "None"}</option>
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
