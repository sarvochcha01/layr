"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Palette, Check, X, AlertTriangle, RotateCcw, Trash2, Paintbrush, Type, Search } from "lucide-react";
import { THEME_STYLES, ThemeStyleVariant } from "@/lib/themeStyles";
import { useThemeStyle, ThemeOverrides } from "@/contexts/ThemeStyleContext";
import { cn } from "@/lib/utils";
import { ComponentDefinition } from "@/types/editor";
import { GOOGLE_FONTS, loadGoogleFont, getFontFamilyValue } from "@/lib/fonts";

// ─── Types ───────────────────────────────────────────────────────────────────
interface OverrideEntry {
  id: string;
  type: string;
  themeStyle: string;
  label: string;
}

interface ThemeStylePanelProps {
  components?: ComponentDefinition[];
  onUpdateComponent?: (id: string, updates: Record<string, any>) => void;
}

// ─── Color Presets per Theme ─────────────────────────────────────────────────
interface ColorPreset {
  name: string;
  accent: string;
  bg: string;
  text: string;
}

const THEME_COLOR_PRESETS: Record<string, ColorPreset[]> = {
  "neobrutalist": [
    { name: "Default (Yellow+Red)", accent: "#ff4d4d", bg: "#fffbeb", text: "#1a1a1a" },
    { name: "Pink + Cyan", accent: "#06b6d4", bg: "#fdf2f8", text: "#1a1a1a" },
    { name: "Violet + Lime", accent: "#84cc16", bg: "#f5f3ff", text: "#1a1a1a" },
    { name: "Blue + Orange", accent: "#f97316", bg: "#eff6ff", text: "#1a1a1a" },
    { name: "Mint + Coral", accent: "#fb7185", bg: "#ecfdf5", text: "#1a1a1a" },
    { name: "Peach + Navy", accent: "#1e3a5f", bg: "#fff7ed", text: "#1a1a1a" },
  ],
  "brutalist": [
    { name: "Default (B&W)", accent: "#000000", bg: "#ffffff", text: "#000000" },
    { name: "Red Ink", accent: "#dc2626", bg: "#ffffff", text: "#000000" },
    { name: "Blue Ink", accent: "#2563eb", bg: "#ffffff", text: "#000000" },
    { name: "Inverted", accent: "#ffffff", bg: "#000000", text: "#ffffff" },
  ],
  "dark-pro": [
    { name: "Default (Indigo)", accent: "#6366f1", bg: "#0d0d0d", text: "#f8fafc" },
    { name: "Emerald", accent: "#10b981", bg: "#0d0d0d", text: "#f8fafc" },
    { name: "Rose", accent: "#f43f5e", bg: "#0d0d0d", text: "#f8fafc" },
    { name: "Amber", accent: "#f59e0b", bg: "#0d0d0d", text: "#f8fafc" },
    { name: "Cyan", accent: "#06b6d4", bg: "#0d0d0d", text: "#f8fafc" },
    { name: "Violet", accent: "#8b5cf6", bg: "#0d0d0d", text: "#f8fafc" },
  ],
  "light-clean": [
    { name: "Default (Blue)", accent: "#2563eb", bg: "#ffffff", text: "#111827" },
    { name: "Emerald", accent: "#059669", bg: "#ffffff", text: "#111827" },
    { name: "Purple", accent: "#7c3aed", bg: "#ffffff", text: "#111827" },
    { name: "Rose", accent: "#e11d48", bg: "#ffffff", text: "#111827" },
    { name: "Orange", accent: "#ea580c", bg: "#ffffff", text: "#111827" },
    { name: "Teal", accent: "#0d9488", bg: "#ffffff", text: "#111827" },
  ],
  "midnight-glam": [
    { name: "Default (Gold)", accent: "#f59e0b", bg: "#0a0a0f", text: "#fefce8" },
    { name: "Rose Gold", accent: "#f472b6", bg: "#0a0a0f", text: "#fce7f3" },
    { name: "Silver", accent: "#94a3b8", bg: "#0a0a0f", text: "#f1f5f9" },
    { name: "Emerald", accent: "#34d399", bg: "#0a0a0f", text: "#ecfdf5" },
  ],
  "glassmorphic": [
    { name: "Default (Violet)", accent: "#a78bfa", bg: "#0f0b1e", text: "#f1f5f9" },
    { name: "Cyan Glow", accent: "#22d3ee", bg: "#0a1628", text: "#f1f5f9" },
    { name: "Pink Glow", accent: "#f472b6", bg: "#1a0a1e", text: "#f1f5f9" },
    { name: "Lime Glow", accent: "#a3e635", bg: "#0a1a0f", text: "#f1f5f9" },
  ],
  "sunset-gradient": [
    { name: "Default (Orange)", accent: "#f97316", bg: "#1a0a06", text: "#fef3c7" },
    { name: "Cherry", accent: "#e11d48", bg: "#1a0608", text: "#fecdd3" },
    { name: "Peach", accent: "#fb923c", bg: "#1a0f06", text: "#fef3c7" },
  ],
  "cyberpunk": [
    { name: "Default (Pink)", accent: "#f0abfc", bg: "#070714", text: "#e2e8f0" },
    { name: "Neon Green", accent: "#4ade80", bg: "#070714", text: "#e2e8f0" },
    { name: "Electric Blue", accent: "#38bdf8", bg: "#070714", text: "#e2e8f0" },
    { name: "Hot Red", accent: "#ef4444", bg: "#070714", text: "#e2e8f0" },
    { name: "Neon Yellow", accent: "#facc15", bg: "#070714", text: "#e2e8f0" },
  ],
  "forest-organic": [
    { name: "Default (Green)", accent: "#4ade80", bg: "#0d1f13", text: "#fef9f0" },
    { name: "Autumn", accent: "#fb923c", bg: "#1a1208", text: "#fef9f0" },
    { name: "Berry", accent: "#c084fc", bg: "#0d1f13", text: "#fef9f0" },
  ],
  "ocean-depth": [
    { name: "Default (Sky)", accent: "#0ea5e9", bg: "#0a1628", text: "#f0f9ff" },
    { name: "Coral Reef", accent: "#fb7185", bg: "#0a1628", text: "#f0f9ff" },
    { name: "Deep Teal", accent: "#2dd4bf", bg: "#0a1628", text: "#f0f9ff" },
    { name: "Pearl", accent: "#e2e8f0", bg: "#0a1628", text: "#f0f9ff" },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function collectOverrides(
  components: ComponentDefinition[],
  parentLabel?: string,
): OverrideEntry[] {
  const results: OverrideEntry[] = [];
  for (const comp of components) {
    const ts = comp.props?.themeStyle;
    if (ts && typeof ts === "string") {
      results.push({
        id: comp.id,
        type: comp.type,
        themeStyle: ts,
        label: parentLabel ? `${comp.type} (in ${parentLabel})` : comp.type,
      });
    }
    if (comp.children?.length) {
      results.push(...collectOverrides(comp.children, comp.type));
    }
  }
  return results;
}

// ─── Font Picker (compact) ───────────────────────────────────────────────────

function FontPickerCompact({
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
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredFonts = useMemo(() => {
    if (!search) return GOOGLE_FONTS;
    return GOOGLE_FONTS.filter((f) =>
      f.family.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

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

  return (
    <div className="space-y-1.5 relative" ref={containerRef}>
      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      <button
        onClick={() => setOpen(!open)}
        className="w-full h-8 px-3 text-xs text-left bg-background border border-border rounded-md hover:border-border/80 transition-colors flex items-center justify-between"
      >
        <span style={{ fontFamily: value ? `'${value}', system-ui` : undefined, fontWeight: 500 }}>
          {value || "Theme Default"}
        </span>
        <Type className="w-3 h-3 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 border rounded-md bg-card shadow-lg z-[60] overflow-hidden">
          <div className="p-2 border-b flex gap-1.5 items-center">
            <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search fonts..."
              className="flex-1 text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-40 overflow-y-auto">
            {/* Reset option */}
            <button
              onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
              className={cn(
                "w-full px-3 py-2 text-left text-xs hover:bg-muted transition-colors",
                !value ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground",
              )}
            >
              Use theme default
            </button>
            {filteredFonts.map((font) => (
              <button
                key={font.family}
                onClick={() => { onChange(font.family); setOpen(false); setSearch(""); }}
                onMouseEnter={() => loadGoogleFont(font.family)}
                className={cn(
                  "w-full px-3 py-1.5 text-left text-xs hover:bg-muted transition-colors",
                  value === font.family ? "bg-primary/10 text-primary" : "text-foreground",
                )}
                style={{ fontFamily: `'${font.family}', system-ui`, fontWeight: 500 }}
              >
                {font.family}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ThemeStylePanel({
  components = [],
  onUpdateComponent,
}: ThemeStylePanelProps) {
  const {
    globalThemeStyle,
    setGlobalThemeStyle,
    isGlobalThemeEnabled,
    toggleGlobalTheme,
    themeOverrides,
    updateThemeOverride,
    resetThemeOverrides,
  } = useThemeStyle();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"themes" | "customize" | "overrides">("themes");

  const themeVariants = Object.values(THEME_STYLES);
  const overrides = useMemo(() => collectOverrides(components), [components]);
  const activeTheme = globalThemeStyle ? THEME_STYLES[globalThemeStyle] : null;
  const presets = globalThemeStyle ? THEME_COLOR_PRESETS[globalThemeStyle] || [] : [];

  const hasOverrides = Object.values(themeOverrides).some(Boolean);

  const resetOne = (id: string) => {
    onUpdateComponent?.(id, { themeStyle: undefined });
  };

  const resetAll = () => {
    for (const o of overrides) {
      onUpdateComponent?.(o.id, { themeStyle: undefined });
    }
  };

  const applyPreset = (preset: ColorPreset) => {
    updateThemeOverride("accentColor", preset.accent);
    updateThemeOverride("bgColor", preset.bg);
    updateThemeOverride("textColor", preset.text);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2 rounded-md transition-colors relative",
          isGlobalThemeEnabled && globalThemeStyle
            ? "bg-primary/10 text-primary"
            : "hover:bg-muted text-muted-foreground hover:text-foreground",
        )}
        title="Global Theme Style"
      >
        <Palette className="w-4 h-4" />
        {overrides.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-[9px] text-white font-bold rounded-full flex items-center justify-center">
            {overrides.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 top-full mt-2 w-[440px] bg-card rounded-xl shadow-2xl border border-border overflow-hidden z-50 max-h-[650px] flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-foreground">Global Theme</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Apply a visual design language to all components
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-muted rounded transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tab Switcher — 3 tabs */}
            <div className="flex border-b border-border flex-shrink-0">
              {(["themes", "customize", "overrides"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 py-2.5 text-xs font-semibold tracking-wide transition-colors border-b-2 flex items-center justify-center gap-1.5",
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab === "themes" && "THEMES"}
                  {tab === "customize" && (
                    <>
                      CUSTOMIZE
                      {hasOverrides && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </>
                  )}
                  {tab === "overrides" && (
                    <>
                      OVERRIDES
                      {overrides.length > 0 && (
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                          activeTab === "overrides" ? "bg-amber-500/20 text-amber-400" : "bg-muted text-muted-foreground",
                        )}>
                          {overrides.length}
                        </span>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* ═══════════════ THEMES TAB ═══════════════ */}
            {activeTab === "themes" && (
              <div className="flex-1 overflow-y-auto">
                {/* Enable/Disable Toggle */}
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-sm text-foreground font-medium">Enable Global Theme</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Components with explicit themes still override this
                      </p>
                    </div>
                    <button
                      onClick={toggleGlobalTheme}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        isGlobalThemeEnabled ? "bg-primary" : "bg-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm",
                          isGlobalThemeEnabled ? "translate-x-6" : "translate-x-0.5",
                        )}
                      />
                    </button>
                  </label>
                </div>

                {/* Theme Grid */}
                <div className="p-3 space-y-1.5">
                  <button
                    onClick={() => setGlobalThemeStyle(null)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border-2 transition-all",
                      globalThemeStyle === null
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md border border-border flex items-center justify-center text-muted-foreground text-xs">—</div>
                        <div>
                          <div className="text-sm font-medium text-foreground">None</div>
                          <p className="text-xs text-muted-foreground">Use individual component styles</p>
                        </div>
                      </div>
                      {globalThemeStyle === null && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                    </div>
                  </button>

                  {themeVariants.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setGlobalThemeStyle(theme.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border-2 transition-all",
                        globalThemeStyle === theme.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-md flex-shrink-0 overflow-hidden border"
                            style={{
                              background: theme.previewColors[0],
                              borderColor: theme.previewColors[0] === "#ffffff" ? "#e5e7eb" : theme.previewColors[0],
                            }}
                          >
                            <div className="w-full h-full flex items-center justify-between p-1 gap-0.5">
                              <div className="h-full w-1/2 rounded-sm" style={{ background: theme.previewColors[2] }} />
                              <div className="h-3/4 w-1/4 rounded-sm self-center" style={{ background: theme.previewColors[1], opacity: 0.7 }} />
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground flex items-center gap-2">
                              {theme.name}
                              {globalThemeStyle === theme.id && <Check className="w-3.5 h-3.5 text-primary" />}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{theme.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {theme.previewColors.map((color, i) => (
                            <div
                              key={i}
                              className="w-4 h-4 rounded-full border"
                              style={{ background: color, borderColor: color === "#ffffff" ? "#e5e7eb" : color }}
                            />
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="px-4 py-3 border-t border-border bg-muted/30">
                  <p className="text-xs text-muted-foreground">
                    💡 Select a theme then go to <strong>CUSTOMIZE</strong> to adjust colors & fonts.
                  </p>
                </div>
              </div>
            )}

            {/* ═══════════════ CUSTOMIZE TAB ═══════════════ */}
            {activeTab === "customize" && (
              <div className="flex-1 overflow-y-auto">
                {!globalThemeStyle || !isGlobalThemeEnabled ? (
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                    <Paintbrush className="w-8 h-8 text-muted-foreground mb-3" />
                    <div className="text-sm font-medium text-foreground mb-1">Select a theme first</div>
                    <p className="text-xs text-muted-foreground max-w-[280px]">
                      Enable a global theme in the <strong>THEMES</strong> tab to unlock customization.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Active theme name */}
                    <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {activeTheme?.previewColors.map((c, i) => (
                            <div key={i} className="w-3 h-3 rounded-full" style={{ background: themeOverrides.accentColor && i === 2 ? themeOverrides.accentColor : themeOverrides.bgColor && i === 0 ? themeOverrides.bgColor : c }} />
                          ))}
                        </div>
                        <span className="text-xs font-medium text-foreground">{activeTheme?.name}</span>
                        {hasOverrides && <span className="text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">customized</span>}
                      </div>
                      {hasOverrides && (
                        <button
                          onClick={resetThemeOverrides}
                          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Reset
                        </button>
                      )}
                    </div>

                    {/* Color Presets */}
                    {presets.length > 0 && (
                      <div className="px-4 py-3 border-b border-border">
                        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                          Color Presets
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {presets.map((preset, i) => {
                            const isActive =
                              themeOverrides.accentColor === preset.accent &&
                              themeOverrides.bgColor === preset.bg;
                            const isDefault = i === 0 && !hasOverrides;
                            return (
                              <button
                                key={i}
                                onClick={() => i === 0 ? resetThemeOverrides() : applyPreset(preset)}
                                className={cn(
                                  "p-2 rounded-lg border-2 transition-all text-center",
                                  isActive || isDefault
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/40",
                                )}
                              >
                                <div className="flex justify-center gap-1 mb-1.5">
                                  <div className="w-5 h-5 rounded-full border" style={{ background: preset.bg, borderColor: preset.bg === "#ffffff" ? "#d1d5db" : preset.bg }} />
                                  <div className="w-5 h-5 rounded-full" style={{ background: preset.accent }} />
                                  <div className="w-5 h-5 rounded-full border" style={{ background: preset.text, borderColor: preset.text === "#ffffff" ? "#d1d5db" : preset.text }} />
                                </div>
                                <span className="text-[10px] text-muted-foreground leading-tight block">{preset.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Custom Color Pickers */}
                    <div className="px-4 py-3 space-y-3 border-b border-border">
                      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block">
                        Custom Colors
                      </label>
                      {/* Accent */}
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={themeOverrides.accentColor || activeTheme?.colors.accent || "#6366f1"}
                          onChange={(e) => updateThemeOverride("accentColor", e.target.value)}
                          className="w-7 h-7 p-0.5 rounded cursor-pointer border border-border"
                        />
                        <div className="flex-1">
                          <div className="text-xs text-foreground font-medium">Accent</div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {themeOverrides.accentColor || activeTheme?.colors.accent}
                          </div>
                        </div>
                        {themeOverrides.accentColor && (
                          <button onClick={() => updateThemeOverride("accentColor", undefined)} className="text-[10px] text-primary hover:opacity-70">Reset</button>
                        )}
                      </div>
                      {/* Background */}
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={themeOverrides.bgColor || activeTheme?.colors.bg || "#0d0d0d"}
                          onChange={(e) => updateThemeOverride("bgColor", e.target.value)}
                          className="w-7 h-7 p-0.5 rounded cursor-pointer border border-border"
                        />
                        <div className="flex-1">
                          <div className="text-xs text-foreground font-medium">Background</div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {themeOverrides.bgColor || activeTheme?.colors.bg}
                          </div>
                        </div>
                        {themeOverrides.bgColor && (
                          <button onClick={() => updateThemeOverride("bgColor", undefined)} className="text-[10px] text-primary hover:opacity-70">Reset</button>
                        )}
                      </div>
                      {/* Text */}
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={themeOverrides.textColor || activeTheme?.colors.text || "#f8fafc"}
                          onChange={(e) => updateThemeOverride("textColor", e.target.value)}
                          className="w-7 h-7 p-0.5 rounded cursor-pointer border border-border"
                        />
                        <div className="flex-1">
                          <div className="text-xs text-foreground font-medium">Text</div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {themeOverrides.textColor || activeTheme?.colors.text}
                          </div>
                        </div>
                        {themeOverrides.textColor && (
                          <button onClick={() => updateThemeOverride("textColor", undefined)} className="text-[10px] text-primary hover:opacity-70">Reset</button>
                        )}
                      </div>
                    </div>

                    {/* Font Pickers */}
                    <div className="px-4 py-3 space-y-3">
                      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block">
                        Typography
                      </label>
                      <FontPickerCompact
                        value={themeOverrides.fontFamily || ""}
                        onChange={(f) => updateThemeOverride("fontFamily", f || undefined)}
                        label="Body Font"
                      />
                      <FontPickerCompact
                        value={themeOverrides.headingFontFamily || ""}
                        onChange={(f) => updateThemeOverride("headingFontFamily", f || undefined)}
                        label="Heading Font"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ═══════════════ OVERRIDES TAB ═══════════════ */}
            {activeTab === "overrides" && (
              <div className="flex-1 overflow-y-auto">
                {overrides.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                      <Check className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div className="text-sm font-medium text-foreground mb-1">
                      All components follow the global theme
                    </div>
                    <p className="text-xs text-muted-foreground max-w-[280px]">
                      No components have individual theme overrides set.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="px-4 py-3 border-b border-border bg-amber-500/5 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-500">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs font-medium">
                          {overrides.length} component{overrides.length !== 1 ? "s" : ""} not following global theme
                        </span>
                      </div>
                      <button
                        onClick={resetAll}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset All
                      </button>
                    </div>

                    <div className="p-2 space-y-1">
                      {overrides.map((entry) => {
                        const themeDef = THEME_STYLES[entry.themeStyle as ThemeStyleVariant];
                        return (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {themeDef ? (
                                <div
                                  className="w-8 h-8 rounded-md flex-shrink-0 border"
                                  style={{
                                    background: themeDef.previewColors[0],
                                    borderColor: themeDef.previewColors[0] === "#ffffff" ? "#e5e7eb" : themeDef.previewColors[0],
                                  }}
                                >
                                  <div className="w-full h-full flex items-center justify-center">
                                    <div className="w-4 h-4 rounded-sm" style={{ background: themeDef.previewColors[2] }} />
                                  </div>
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-md flex-shrink-0 border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground">?</div>
                              )}
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-foreground truncate">{entry.type}</div>
                                <div className="text-[11px] text-muted-foreground truncate">
                                  Using: <span className="text-foreground/70 font-medium">{themeDef?.name || entry.themeStyle}</span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => resetOne(entry.id)}
                              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                              title="Remove override"
                            >
                              <Trash2 className="w-3 h-3" />
                              Reset
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="px-4 py-3 border-t border-border bg-muted/30">
                      <p className="text-xs text-muted-foreground">
                        🔄 Resetting removes explicit themes and lets components inherit the global theme.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
