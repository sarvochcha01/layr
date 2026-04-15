"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { ThemeStyleVariant } from "@/lib/themeStyles";

interface ThemeStyleContextType {
  globalThemeStyle: ThemeStyleVariant | null;
  setGlobalThemeStyle: (style: ThemeStyleVariant | null) => void;
  isGlobalThemeEnabled: boolean;
  toggleGlobalTheme: () => void;
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

  const setGlobalThemeStyle = useCallback((style: ThemeStyleVariant | null) => {
    setGlobalThemeStyleState(style);
    if (style !== null) {
      setIsGlobalThemeEnabled(true);
    }
  }, []);

  const toggleGlobalTheme = useCallback(() => {
    setIsGlobalThemeEnabled((prev) => !prev);
  }, []);

  return (
    <ThemeStyleContext.Provider
      value={{
        globalThemeStyle,
        setGlobalThemeStyle,
        isGlobalThemeEnabled,
        toggleGlobalTheme,
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
