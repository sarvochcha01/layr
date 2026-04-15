"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
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
  setGlobalThemeStyle: (style: ThemeStyleVariant | null) => void;
  isGlobalThemeEnabled: boolean;
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

  const setGlobalThemeStyle = useCallback((style: ThemeStyleVariant | null) => {
    setGlobalThemeStyleState(style);
    if (style !== null) {
      setIsGlobalThemeEnabled(true);
    }
    // Reset overrides when switching themes
    setThemeOverridesState({});
    setGlobalThemeOverrides({});
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
 * 1. If the component explicitly set its own themeStyle (hasExplicitOverride=true), use it — ALWAYS wins.
 * 2. If global theme is enabled and set, use global.
 * 3. Fall back to component theme or default.
 *
 * This lets individual components resist the global theme by explicitly
 * setting their own themeStyle in the properties panel.
 */
export function useEffectiveThemeStyle(
  componentThemeStyle?: ThemeStyleVariant,
  /** Pass true when the component has a themeStyle explicitly set by the user (not just default) */
  hasExplicitOverride?: boolean,
): ThemeStyleVariant {
  const { globalThemeStyle, isGlobalThemeEnabled } = useThemeStyle();

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
