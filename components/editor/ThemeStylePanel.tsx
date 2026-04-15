"use client";

import { useState, useMemo } from "react";
import { Palette, Check, X, AlertTriangle, RotateCcw, Trash2 } from "lucide-react";
import { THEME_STYLES, ThemeStyleVariant } from "@/lib/themeStyles";
import { useThemeStyle } from "@/contexts/ThemeStyleContext";
import { cn } from "@/lib/utils";
import { ComponentDefinition } from "@/types/editor";

// ─── Types ───────────────────────────────────────────────────────────────────
interface OverrideEntry {
  id: string;
  type: string;
  themeStyle: string;
  /** Human-readable label like "Hero" or "Card (inside Section)" */
  label: string;
}

interface ThemeStylePanelProps {
  components?: ComponentDefinition[];
  onUpdateComponent?: (id: string, updates: Record<string, any>) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Recursively collect every component that has an explicit themeStyle override */
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

// ─── Component ───────────────────────────────────────────────────────────────

export function ThemeStylePanel({
  components = [],
  onUpdateComponent,
}: ThemeStylePanelProps) {
  const {
    globalThemeStyle,
    setGlobalThemeStyle,
    isGlobalThemeEnabled,
    toggleGlobalTheme,
  } = useThemeStyle();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"themes" | "overrides">("themes");

  const themeVariants = Object.values(THEME_STYLES);

  // Scan all components for theme overrides
  const overrides = useMemo(() => collectOverrides(components), [components]);

  const resetOne = (id: string) => {
    onUpdateComponent?.(id, { themeStyle: undefined });
  };

  const resetAll = () => {
    for (const o of overrides) {
      onUpdateComponent?.(o.id, { themeStyle: undefined });
    }
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
        {/* Override count badge */}
        {overrides.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-[9px] text-white font-bold rounded-full flex items-center justify-center">
            {overrides.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Click-outside overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 top-full mt-2 w-[440px] bg-card rounded-xl shadow-2xl border border-border overflow-hidden z-50 max-h-[650px] flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    Global Theme
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Apply a visual design language to all components
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-border flex-shrink-0">
              <button
                onClick={() => setActiveTab("themes")}
                className={cn(
                  "flex-1 py-2.5 text-xs font-semibold tracking-wide transition-colors border-b-2",
                  activeTab === "themes"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                THEMES
              </button>
              <button
                onClick={() => setActiveTab("overrides")}
                className={cn(
                  "flex-1 py-2.5 text-xs font-semibold tracking-wide transition-colors border-b-2 flex items-center justify-center gap-1.5",
                  activeTab === "overrides"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                OVERRIDES
                {overrides.length > 0 && (
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                    activeTab === "overrides"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-muted text-muted-foreground",
                  )}>
                    {overrides.length}
                  </span>
                )}
              </button>
            </div>

            {/* ═══════════════ THEMES TAB ═══════════════ */}
            {activeTab === "themes" && (
              <div className="flex-1 overflow-y-auto">
                {/* Enable/Disable Toggle */}
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-sm text-foreground font-medium">
                        Enable Global Theme
                      </span>
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
                          isGlobalThemeEnabled
                            ? "translate-x-6"
                            : "translate-x-0.5",
                        )}
                      />
                    </button>
                  </label>
                </div>

                {/* Theme Grid */}
                <div className="p-3 space-y-1.5">
                  {/* None Option */}
                  <button
                    onClick={() => {
                      setGlobalThemeStyle(null);
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border-2 transition-all",
                      globalThemeStyle === null
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md border border-border flex items-center justify-center text-muted-foreground text-xs">
                          —
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">None</div>
                          <p className="text-xs text-muted-foreground">Use individual component styles</p>
                        </div>
                      </div>
                      {globalThemeStyle === null && (
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {/* Theme Options */}
                  {themeVariants.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setGlobalThemeStyle(theme.id);
                      }}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border-2 transition-all",
                        globalThemeStyle === theme.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Color Swatch Preview */}
                          <div
                            className="w-10 h-10 rounded-md flex-shrink-0 overflow-hidden border"
                            style={{
                              background: theme.previewColors[0],
                              borderColor: theme.previewColors[0] === "#ffffff" ? "#e5e7eb" : theme.previewColors[0],
                            }}
                          >
                            <div className="w-full h-full flex items-center justify-between p-1 gap-0.5">
                              <div
                                className="h-full w-1/2 rounded-sm"
                                style={{ background: theme.previewColors[2] }}
                              />
                              <div
                                className="h-3/4 w-1/4 rounded-sm self-center"
                                style={{ background: theme.previewColors[1], opacity: 0.7 }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground flex items-center gap-2">
                              {theme.name}
                              {globalThemeStyle === theme.id && (
                                <Check className="w-3.5 h-3.5 text-primary" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {theme.description}
                            </p>
                          </div>
                        </div>

                        {/* Color dots */}
                        <div className="flex gap-1 flex-shrink-0">
                          {theme.previewColors.map((color, i) => (
                            <div
                              key={i}
                              className="w-4 h-4 rounded-full border"
                              style={{
                                background: color,
                                borderColor: color === "#ffffff" ? "#e5e7eb" : color,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Footer Info */}
                <div className="px-4 py-3 border-t border-border bg-muted/30">
                  <p className="text-xs text-muted-foreground">
                    💡 Set a component's own <strong>Theme Style</strong> property to override the global theme for that component.
                  </p>
                </div>
              </div>
            )}

            {/* ═══════════════ OVERRIDES TAB ═══════════════ */}
            {activeTab === "overrides" && (
              <div className="flex-1 overflow-y-auto">
                {overrides.length === 0 ? (
                  /* Empty state */
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                      <Check className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div className="text-sm font-medium text-foreground mb-1">
                      All components follow the global theme
                    </div>
                    <p className="text-xs text-muted-foreground max-w-[280px]">
                      No components have individual theme overrides set. Everything is using the global design language.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Reset All Bar */}
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

                    {/* Override List */}
                    <div className="p-2 space-y-1">
                      {overrides.map((entry) => {
                        const themeDef = THEME_STYLES[entry.themeStyle as ThemeStyleVariant];
                        return (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Theme color swatch */}
                              {themeDef ? (
                                <div
                                  className="w-8 h-8 rounded-md flex-shrink-0 border"
                                  style={{
                                    background: themeDef.previewColors[0],
                                    borderColor:
                                      themeDef.previewColors[0] === "#ffffff"
                                        ? "#e5e7eb"
                                        : themeDef.previewColors[0],
                                  }}
                                >
                                  <div className="w-full h-full flex items-center justify-center">
                                    <div
                                      className="w-4 h-4 rounded-sm"
                                      style={{ background: themeDef.previewColors[2] }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-md flex-shrink-0 border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                  ?
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-foreground truncate">
                                  {entry.type}
                                </div>
                                <div className="text-[11px] text-muted-foreground truncate">
                                  Using: <span className="text-foreground/70 font-medium">{themeDef?.name || entry.themeStyle}</span>
                                  {globalThemeStyle && globalThemeStyle !== entry.themeStyle && (
                                    <span className="text-amber-500 ml-1">
                                      (global: {THEME_STYLES[globalThemeStyle]?.name || globalThemeStyle})
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Reset button */}
                            <button
                              onClick={() => resetOne(entry.id)}
                              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                              title="Remove override — use global theme instead"
                            >
                              <Trash2 className="w-3 h-3" />
                              Reset
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer explanation */}
                    <div className="px-4 py-3 border-t border-border bg-muted/30">
                      <p className="text-xs text-muted-foreground">
                        🔄 Resetting a component removes its explicit theme and lets it inherit the global theme instead.
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
