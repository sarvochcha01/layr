"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Type, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StyleSectionProps } from "../types";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { GOOGLE_FONTS, loadGoogleFont } from "@/lib/fonts";
import { useThemeStyle } from "@/contexts/ThemeStyleContext";
import { THEME_STYLES } from "@/lib/themeStyles";

const labelClass = "text-xs font-medium text-muted-foreground";
const selectClass = "w-full h-8 px-2 text-xs bg-transparent appearance-none focus:outline-none";
const sectionTriggerClass = "hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50";
const sectionContentClass = "px-4 pb-4 pt-2 space-y-4";

// Category icons
const CATEGORY_EMOJI: Record<string, string> = {
  "sans-serif": "Aa",
  "serif": "Se",
  "display": "Dp",
  "handwriting": "Hw",
  "monospace": "<>",
};

function FontPicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (font: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Get active theme defaults
  const { globalThemeStyle, isGlobalThemeEnabled } = useThemeStyle();
  const activeFontInfo = useMemo(() => {
    if (!isGlobalThemeEnabled || !globalThemeStyle) return null;
    const theme = THEME_STYLES[globalThemeStyle as keyof typeof THEME_STYLES];
    return theme?.style;
  }, [globalThemeStyle, isGlobalThemeEnabled]);

  const filteredFonts = useMemo(() => {
    return GOOGLE_FONTS.filter((f) => {
      if (category && f.category !== category) return false;
      if (search && !f.family.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, category]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Focus search on open
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  // Load font for preview on hover
  const handleFontHover = (family: string) => {
    loadGoogleFont(family);
  };

  const displayValue = value || (activeFontInfo ? activeFontInfo.fontFamily : "Inter");

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <div className="flex items-center justify-between">
        <Label className={labelClass}>{label}</Label>
        {value && activeFontInfo && (
          <button
            onClick={() => onChange("")}
            className="text-[10px] text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Use theme default
          </button>
        )}
      </div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full h-8 px-3 text-xs text-left bg-background border border-border rounded-md hover:border-border/80 transition-colors flex items-center justify-between"
      >
        <span
          style={{
            fontFamily: `'${displayValue}', system-ui, sans-serif`,
            fontWeight: 500,
          }}
        >
          {displayValue}
        </span>
        <span className="flex items-center gap-1">
          {!value && activeFontInfo && (
            <span className="text-[9px] text-muted-foreground bg-muted px-1 py-0.5 rounded">theme</span>
          )}
          <Type className="w-3 h-3 text-muted-foreground" />
        </span>
      </button>

      {open && (
        <div className="border border-border rounded-md bg-background shadow-lg overflow-hidden z-50 relative">
          {/* Search */}
          <div className="p-2 border-b border-border flex gap-1.5 items-center">
            <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search fonts..."
              className="flex-1 text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Category filters */}
          <div className="flex gap-0.5 px-2 py-1.5 border-b border-border">
            <button
              onClick={() => setCategory(null)}
              className={`px-2 py-0.5 text-[10px] rounded transition-colors ${!category ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              All
            </button>
            {Object.entries(CATEGORY_EMOJI).map(([cat, label]) => (
              <button
                key={cat}
                onClick={() => setCategory(category === cat ? null : cat)}
                className={`px-2 py-0.5 text-[10px] rounded transition-colors capitalize ${category === cat ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Font list */}
          <div className="max-h-48 overflow-y-auto">
            {filteredFonts.map((font) => (
              <button
                key={font.family}
                onClick={() => {
                  onChange(font.family);
                  setOpen(false);
                  setSearch("");
                }}
                onMouseEnter={() => handleFontHover(font.family)}
                className={`w-full px-3 py-2 text-left text-xs hover:bg-muted transition-colors flex items-center justify-between ${
                  (value || displayValue) === font.family ? "bg-primary/10 text-primary" : "text-foreground"
                }`}
              >
                <span
                  style={{
                    fontFamily: `'${font.family}', system-ui, sans-serif`,
                    fontWeight: 500,
                    fontSize: "13px",
                  }}
                >
                  {font.family}
                </span>
                <span className="text-[9px] text-muted-foreground opacity-60 uppercase">
                  {font.category.split("-")[0]}
                </span>
              </button>
            ))}
            {filteredFonts.length === 0 && (
              <div className="px-3 py-4 text-xs text-muted-foreground text-center">
                No fonts found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function TypographySection({ props, updateProp }: StyleSectionProps) {
  // Get active theme defaults
  const { globalThemeStyle, isGlobalThemeEnabled } = useThemeStyle();
  const activeThemeKey = props.themeStyle || (isGlobalThemeEnabled ? globalThemeStyle : null);
  const activeTheme = activeThemeKey ? THEME_STYLES[activeThemeKey as keyof typeof THEME_STYLES] : null;

  const themeHeadingWeight = activeTheme?.style.headingWeight || "700";
  const themeLetterSpacing = activeTheme?.style.letterSpacing || "0";
  const themeFont = activeTheme?.style.fontFamily || "Inter";

  return (
    <AccordionItem value="typography" className="border-b-0 border-t border-border/50">
      <AccordionTrigger className={sectionTriggerClass}>
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-muted-foreground" />
          Typography
        </div>
      </AccordionTrigger>
      <AccordionContent className={sectionContentClass}>
        {/* Font Pickers */}
        <FontPicker
          value={props.fontFamily_override || ""}
          onChange={(f) => updateProp("fontFamily_override", f || undefined)}
          label="Font Family"
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className={labelClass}>Font Size</Label>
            <Input value={props.fontSize_css || ""} onChange={(e) => updateProp("fontSize_css", e.target.value)} placeholder="16px" className="h-8 text-xs" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className={labelClass}>Font Weight</Label>
              {props.fontWeight_css && activeTheme && (
                <button
                  onClick={() => updateProp("fontWeight_css", undefined)}
                  className="text-[10px] text-primary hover:text-primary/80 font-medium"
                >
                  Use theme
                </button>
              )}
            </div>
            <div className="relative border rounded-md">
              <select value={props.fontWeight_css || ""} onChange={(e) => updateProp("fontWeight_css", e.target.value)} className={selectClass}>
                <option className="bg-background text-foreground" value="">{activeTheme ? `Theme (${themeHeadingWeight})` : "Default"}</option>
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
            <div className="flex items-center justify-between">
              <Label className={labelClass}>Letter Spacing</Label>
              {props.letterSpacing_css && activeTheme && (
                <button
                  onClick={() => updateProp("letterSpacing_css", undefined)}
                  className="text-[10px] text-primary hover:text-primary/80 font-medium"
                >
                  Use theme
                </button>
              )}
            </div>
            <Input value={props.letterSpacing_css || ""} onChange={(e) => updateProp("letterSpacing_css", e.target.value)} placeholder={themeLetterSpacing} className="h-8 text-xs" />
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
