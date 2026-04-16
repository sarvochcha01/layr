"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ThemeStyleVariant, setGlobalThemeOverrides } from "@/lib/themeStyles";

/** User-customizable overrides applied on top of the selected theme */
export interface ThemeOverrides {
  /** Override accent color */
  accentColor?: string;
  /** Override background color */
  bgColor?: string;
  /** Override text color */
  textColor?: string;
  /** Override body font */
  fontFamily?: string;
  /** Override heading font */
  headingFontFamily?: string;
}

interface ThemeStyleContextType {
  globalThemeStyle: ThemeStyleVariant | null;
  setGlobalThemeStyle: (style: ThemeStyleVariant | null, autoEnable?: boolean) => void;
  isGlobalThemeEnabled: boolean;
  setIsGlobalThemeEnabled: (enabled: boolean) => void;
  toggleGlobalTheme: () => void;
  /** User customizations applied on top of the active theme */
  themeOverrides: ThemeOverrides;
  setThemeOverrides: (overrides: ThemeOverrides) => void;
  updateThemeOverride: <K extends keyof ThemeOverrides>(key: K, value: ThemeOverrides[K]) => void;
  resetThemeOverrides: () => void;
}

const ThemeStyleContext = createContext<ThemeStyleContextType | undefined>(
  undefined,
);

export function ThemeStyleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [globalThemeStyle, setGlobalThemeStyleState] =
    useState<ThemeStyleVariant | null>(null);
  const [isGlobalThemeEnabled, setIsGlobalThemeEnabled] = useState(false);
  const [themeOverrides, setThemeOverridesState] = useState<ThemeOverrides>({});

  // Expose theme state to window for saving AND log changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__currentGlobalTheme = globalThemeStyle;
      (window as any).__isGlobalThemeEnabled = isGlobalThemeEnabled;
      (window as any).__themeOverrides = themeOverrides;
      console.log("[ThemeContext] Updated window:", {
        theme: globalThemeStyle,
        enabled: isGlobalThemeEnabled,
        overrides: themeOverrides
      });
    }
  }, [globalThemeStyle, isGlobalThemeEnabled, themeOverrides]);

  const setGlobalThemeStyle = useCallback((style: ThemeStyleVariant | null, autoEnable: boolean = true) => {
    console.log("[ThemeContext] Setting theme to:", style, "autoEnable:", autoEnable);
    setGlobalThemeStyleState(style);
    if (style !== null && autoEnable) {
      setIsGlobalThemeEnabled(true);
    }
    // Reset overrides when switching themes (only if not loading from save)
    if (autoEnable) {
      setThemeOverridesState({});
      setGlobalThemeOverrides({});
    }
  }, []);

  const toggleGlobalTheme = useCallback(() => {
    setIsGlobalThemeEnabled((prev) => {
      const next = !prev;
      if (!next) setGlobalThemeOverrides({});
      return next;
    });
  }, []);

  const setThemeOverrides = useCallback((overrides: ThemeOverrides) => {
    setThemeOverridesState(overrides);
    setGlobalThemeOverrides(overrides);
  }, []);

  const updateThemeOverride = useCallback(<K extends keyof ThemeOverrides>(key: K, value: ThemeOverrides[K]) => {
    setThemeOverridesState((prev) => {
      const next = { ...prev, [key]: value };
      setGlobalThemeOverrides(next);
      return next;
    });
  }, []);

  const resetThemeOverrides = useCallback(() => {
    setThemeOverridesState({});
    setGlobalThemeOverrides({});
  }, []);

  return (
    <ThemeStyleContext.Provider
      value={{
        globalThemeStyle,
        setGlobalThemeStyle,
        isGlobalThemeEnabled,
        setIsGlobalThemeEnabled,
        toggleGlobalTheme,
        themeOverrides,
        setThemeOverrides,
        updateThemeOverride,
        resetThemeOverrides,
      }}
    >
      {children}
    </ThemeStyleContext.Provider>
  );
}

export function useThemeStyle() {
  const context = useContext(ThemeStyleContext);
  if (context === undefined) {
    throw new Error("useThemeStyle must be used within a ThemeStyleProvider");
  }
  return context;
}

/**
 * Hook to get the effective theme style for a component.
 *
 * Priority order:
 * 1. If the component has themeStyle property defined (even if null), respect it — ALWAYS wins.
 * 2. If global theme is enabled and set, use global.
 * 3. Fall back to default.
 *
 * This lets individual components resist the global theme by explicitly
 * setting their own themeStyle in the properties panel, or by setting it to null.
 */
export function useEffectiveThemeStyle(
  componentThemeStyle?: ThemeStyleVariant | null,
  /** Pass true when the component has a themeStyle explicitly set by the user (not just default) */
  hasExplicitOverride?: boolean,
): ThemeStyleVariant {
  const { globalThemeStyle, isGlobalThemeEnabled } = useThemeStyle();

  // If themeStyle is explicitly set to null, don't inherit global theme
  // This is used by the reset button to force default styling
  if (componentThemeStyle === null && hasExplicitOverride) {
    return "dark-pro";
  }

  // Component-level explicit override wins over global
  if (hasExplicitOverride && componentThemeStyle) {
    return componentThemeStyle;
  }

  // Global theme takes precedence when enabled
  if (isGlobalThemeEnabled && globalThemeStyle) {
    return globalThemeStyle;
  }

  return componentThemeStyle || "dark-pro";
}

/**
 * Convenience hook: returns ready-to-spread CSS vars with theme overrides already applied.
 * Use this instead of manually calling useEffectiveThemeStyle + getThemeCSSVars.
 */
export function useThemeCSSVars(
  componentThemeStyle?: ThemeStyleVariant,
  hasExplicitOverride?: boolean,
) {
  const { themeOverrides, isGlobalThemeEnabled, globalThemeStyle } = useThemeStyle();
  const effectiveTheme = useEffectiveThemeStyle(componentThemeStyle, hasExplicitOverride);

  // Only apply global overrides when using the global theme (not a per-component override)
  const shouldApplyOverrides = isGlobalThemeEnabled && globalThemeStyle && !hasExplicitOverride;
  const overrides = shouldApplyOverrides ? themeOverrides : undefined;

  // Lazy import to avoid circular deps
  const { getThemeCSSVars } = require("@/lib/themeStyles");
  return {
    cssVars: getThemeCSSVars(effectiveTheme, overrides) as React.CSSProperties,
    effectiveTheme,
    overrides,
  };
}
