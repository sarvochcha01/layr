/**
 * Global Theme Styles System — v2
 *
 * 10 proper visual design themes that work across ALL components.
 * Each theme injects CSS custom properties to guarantee readable contrast
 * regardless of Tailwind's root CSS variable scheme.
 */

import React from "react";
import { getFontFamilyValue, loadGoogleFonts } from "./fonts";

export type ThemeStyleVariant =
  | "dark-pro"
  | "light-clean"
  | "midnight-glam"
  | "brutalist"
  | "neobrutalist"
  | "glassmorphic"
  | "sunset-gradient"
  | "cyberpunk"
  | "forest-organic"
  | "ocean-depth";

export interface ThemeColorPalette {
  /** Main background */
  bg: string;
  /** Elevated surface (cards, panels) */
  surface: string;
  /** Border color */
  border: string;
  /** Primary text */
  text: string;
  /** Secondary/muted text */
  textMuted: string;
  /** Accent color (buttons, highlights) */
  accent: string;
  /** Text on accent background */
  accentFg: string;
  /** Accent hover */
  accentHover: string;
  /** Input/form background */
  inputBg: string;
  /** Divider/rule color */
  divider: string;
}

export interface ThemeStyleConfig {
  id: ThemeStyleVariant;
  name: string;
  description: string;
  /** Color swatches for preview — [bg, text, accent] */
  previewColors: [string, string, string];
  colors: ThemeColorPalette;
  style: {
    /** Border radius for components */
    radius: string;
    /** Border width for structural borders */
    borderWidth: string;
    /** Box shadow recipe */
    shadow: string;
    /** Hard offset shadow for neobrutalist */
    hardShadow?: string;
    /** Backdrop filter for glass */
    backdrop?: string;
    /** Font weight for headings */
    headingWeight: string;
    /** Letter spacing */
    letterSpacing: string;
    /** Body / UI font family (Google Fonts name) */
    fontFamily: string;
    /** Heading font family (Google Fonts name) */
    headingFontFamily: string;
  };
}

export const THEME_STYLES: Record<ThemeStyleVariant, ThemeStyleConfig> = {
  // ─── 1. DARK PRO ──────────────────────────────────────────────────────────
  "dark-pro": {
    id: "dark-pro",
    name: "Dark Pro",
    description: "Deep dark background with indigo accents — the polished pro tool look",
    previewColors: ["#0d0d0d", "#ffffff", "#6366f1"],
    colors: {
      bg: "#0d0d0d",
      surface: "#1a1a1a",
      border: "rgba(255,255,255,0.08)",
      text: "#f8fafc",
      textMuted: "rgba(248,250,252,0.5)",
      accent: "#6366f1",
      accentFg: "#ffffff",
      accentHover: "#4f46e5",
      inputBg: "#242424",
      divider: "rgba(255,255,255,0.06)",
    },
    style: {
      radius: "12px",
      borderWidth: "1px",
      shadow: "0 4px 24px rgba(0,0,0,0.4)",
      headingWeight: "700",
      letterSpacing: "-0.02em",
      fontFamily: "Inter",
      headingFontFamily: "Inter",
    },
  },

  // ─── 2. LIGHT CLEAN ───────────────────────────────────────────────────────
  "light-clean": {
    id: "light-clean",
    name: "Light Clean",
    description: "White and soft gray — pristine SaaS look with great readability",
    previewColors: ["#ffffff", "#111827", "#2563eb"],
    colors: {
      bg: "#ffffff",
      surface: "#f8fafc",
      border: "rgba(17,24,39,0.1)",
      text: "#111827",
      textMuted: "rgba(17,24,39,0.55)",
      accent: "#2563eb",
      accentFg: "#ffffff",
      accentHover: "#1d4ed8",
      inputBg: "#f1f5f9",
      divider: "rgba(17,24,39,0.08)",
    },
    style: {
      radius: "10px",
      borderWidth: "1px",
      shadow: "0 2px 12px rgba(0,0,0,0.08)",
      headingWeight: "700",
      letterSpacing: "-0.01em",
      fontFamily: "DM Sans",
      headingFontFamily: "DM Sans",
    },
  },

  // ─── 3. MIDNIGHT GLAM ─────────────────────────────────────────────────────
  "midnight-glam": {
    id: "midnight-glam",
    name: "Midnight Glam",
    description: "Near-black with gold and amber — luxury brand aesthetic",
    previewColors: ["#0a0a0f", "#fefce8", "#f59e0b"],
    colors: {
      bg: "#0a0a0f",
      surface: "#15151e",
      border: "rgba(245,158,11,0.15)",
      text: "#fefce8",
      textMuted: "rgba(254,252,232,0.5)",
      accent: "#f59e0b",
      accentFg: "#0a0a0f",
      accentHover: "#d97706",
      inputBg: "#1e1e2a",
      divider: "rgba(245,158,11,0.1)",
    },
    style: {
      radius: "8px",
      borderWidth: "1px",
      shadow: "0 4px 32px rgba(0,0,0,0.6)",
      headingWeight: "800",
      letterSpacing: "-0.01em",
      fontFamily: "DM Sans",
      headingFontFamily: "Playfair Display",
    },
  },

  // ─── 4. BRUTALIST ─────────────────────────────────────────────────────────
  brutalist: {
    id: "brutalist",
    name: "Brutalist",
    description: "Raw monochrome — thick black borders, bold typography, no embellishment",
    previewColors: ["#ffffff", "#000000", "#000000"],
    colors: {
      bg: "#ffffff",
      surface: "#f5f5f5",
      border: "#000000",
      text: "#000000",
      textMuted: "rgba(0,0,0,0.6)",
      accent: "#000000",
      accentFg: "#ffffff",
      accentHover: "#222222",
      inputBg: "#ffffff",
      divider: "#000000",
    },
    style: {
      radius: "0px",
      borderWidth: "3px",
      shadow: "none",
      headingWeight: "900",
      letterSpacing: "0.05em",
      fontFamily: "Space Mono",
      headingFontFamily: "Space Mono",
    },
  },

  // ─── 5. NEOBRUTALIST ──────────────────────────────────────────────────────
  neobrutalist: {
    id: "neobrutalist",
    name: "NeoBrutalist",
    description: "Vibrant electric yellow + coral, hard offset shadows, thick black borders — maximum impact",
    previewColors: ["#fffbeb", "#1a1a1a", "#f59e0b"],
    colors: {
      bg: "#fffbeb",
      surface: "#fef3c7",
      border: "#1a1a1a",
      text: "#1a1a1a",
      textMuted: "rgba(26,26,26,0.65)",
      accent: "#ff4d4d",
      accentFg: "#ffffff",
      accentHover: "#e63535",
      inputBg: "#ffffff",
      divider: "#1a1a1a",
    },
    style: {
      radius: "0px",
      borderWidth: "3px",
      shadow: "none",
      hardShadow: "5px 5px 0px #1a1a1a",
      headingWeight: "900",
      letterSpacing: "0",
      fontFamily: "Archivo",
      headingFontFamily: "Archivo",
    },
  },

  // ─── 6. GLASSMORPHIC ──────────────────────────────────────────────────────
  glassmorphic: {
    id: "glassmorphic",
    name: "Glassmorphic",
    description: "Deep purple-dark with frosted glass surfaces and soft glow effects",
    previewColors: ["#0f0b1e", "#f1f5f9", "#a78bfa"],
    colors: {
      bg: "#0f0b1e",
      surface: "rgba(30,20,60,0.85)",
      border: "rgba(167,139,250,0.2)",
      text: "#f1f5f9",
      textMuted: "rgba(241,245,249,0.5)",
      accent: "#a78bfa",
      accentFg: "#0f0b1e",
      accentHover: "#8b5cf6",
      inputBg: "rgba(255,255,255,0.08)",
      divider: "rgba(167,139,250,0.12)",
    },
    style: {
      radius: "16px",
      borderWidth: "1px",
      shadow: "0 8px 32px rgba(0,0,0,0.5)",
      backdrop: "blur(12px)",
      headingWeight: "700",
      letterSpacing: "-0.01em",
      fontFamily: "Sora",
      headingFontFamily: "Plus Jakarta Sans",
    },
  },

  // ─── 7. SUNSET GRADIENT ───────────────────────────────────────────────────
  "sunset-gradient": {
    id: "sunset-gradient",
    name: "Sunset Gradient",
    description: "Warm coral-to-orange gradient backgrounds, ivory text, energetic feel",
    previewColors: ["#1a0a06", "#fef3c7", "#f97316"],
    colors: {
      bg: "#1a0a06",
      surface: "#2a1008",
      border: "rgba(249,115,22,0.2)",
      text: "#fef3c7",
      textMuted: "rgba(254,243,199,0.55)",
      accent: "#f97316",
      accentFg: "#1a0a06",
      accentHover: "#ea580c",
      inputBg: "#2d1209",
      divider: "rgba(249,115,22,0.15)",
    },
    style: {
      radius: "14px",
      borderWidth: "1px",
      shadow: "0 6px 28px rgba(0,0,0,0.45)",
      headingWeight: "800",
      letterSpacing: "-0.02em",
      fontFamily: "Outfit",
      headingFontFamily: "Outfit",
    },
  },

  // ─── 8. CYBERPUNK ─────────────────────────────────────────────────────────
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Hot pink and cyan neon on near-black — electric and futuristic",
    previewColors: ["#070714", "#e2e8f0", "#f0abfc"],
    colors: {
      bg: "#070714",
      surface: "#0f0f24",
      border: "rgba(240,171,252,0.2)",
      text: "#e2e8f0",
      textMuted: "rgba(226,232,240,0.5)",
      accent: "#f0abfc",
      accentFg: "#070714",
      accentHover: "#e879f9",
      inputBg: "#12122a",
      divider: "rgba(240,171,252,0.1)",
    },
    style: {
      radius: "4px",
      borderWidth: "1px",
      shadow: "0 0 20px rgba(240,171,252,0.15), 0 4px 24px rgba(0,0,0,0.6)",
      headingWeight: "800",
      letterSpacing: "0.03em",
      fontFamily: "Rajdhani",
      headingFontFamily: "Orbitron",
    },
  },

  // ─── 9. FOREST ORGANIC ────────────────────────────────────────────────────
  "forest-organic": {
    id: "forest-organic",
    name: "Forest Organic",
    description: "Deep forest greens with warm cream text — natural, earthy, trustworthy",
    previewColors: ["#0d1f13", "#fef9f0", "#4ade80"],
    colors: {
      bg: "#0d1f13",
      surface: "#162b1c",
      border: "rgba(74,222,128,0.15)",
      text: "#fef9f0",
      textMuted: "rgba(254,249,240,0.55)",
      accent: "#4ade80",
      accentFg: "#0d1f13",
      accentHover: "#22c55e",
      inputBg: "#1a3020",
      divider: "rgba(74,222,128,0.1)",
    },
    style: {
      radius: "10px",
      borderWidth: "1px",
      shadow: "0 4px 20px rgba(0,0,0,0.4)",
      headingWeight: "700",
      letterSpacing: "-0.01em",
      fontFamily: "Nunito",
      headingFontFamily: "Lora",
    },
  },

  // ─── 10. OCEAN DEPTH ──────────────────────────────────────────────────────
  "ocean-depth": {
    id: "ocean-depth",
    name: "Ocean Depth",
    description: "Deep navy with teal accents and crisp white — professional and calm",
    previewColors: ["#0a1628", "#f0f9ff", "#0ea5e9"],
    colors: {
      bg: "#0a1628",
      surface: "#0f1f3d",
      border: "rgba(14,165,233,0.15)",
      text: "#f0f9ff",
      textMuted: "rgba(240,249,255,0.5)",
      accent: "#0ea5e9",
      accentFg: "#0a1628",
      accentHover: "#0284c7",
      inputBg: "#142040",
      divider: "rgba(14,165,233,0.1)",
    },
    style: {
      radius: "10px",
      borderWidth: "1px",
      shadow: "0 4px 24px rgba(0,0,0,0.45)",
      headingWeight: "700",
      letterSpacing: "-0.01em",
      fontFamily: "IBM Plex Sans",
      headingFontFamily: "IBM Plex Sans",
    },
  },
};

// ─── Global Override Storage ─────────────────────────────────────────────────
// Module-level variable set by ThemeStyleContext so getThemeCSSVars auto-applies
// user customizations without modifying every component call site.
let _globalOverrides: { accentColor?: string; bgColor?: string; textColor?: string; fontFamily?: string; headingFontFamily?: string } = {};

/** Called by ThemeStyleContext when user changes customizations */
export function setGlobalThemeOverrides(overrides: typeof _globalOverrides) {
  _globalOverrides = overrides;
}

/**
 * Returns CSS custom properties to inject onto any component root element.
 * Components use var(--theme-bg), var(--theme-text), etc. for all colors.
 * This eliminates Tailwind CSS variable conflicts entirely.
 *
 * Automatically merges global user overrides from the customize panel.
 * Optional explicit `overrides` param takes precedence over global.
 */
export function getThemeCSSVars(
  themeId: ThemeStyleVariant = "dark-pro",
  overrides?: { accentColor?: string; bgColor?: string; textColor?: string; fontFamily?: string; headingFontFamily?: string },
): React.CSSProperties {
  const theme = THEME_STYLES[themeId] || THEME_STYLES["dark-pro"];
  const c = theme.colors;
  const s = theme.style;

  // Resolve overrides: explicit param > global overrides > theme defaults
  const merged = { ..._globalOverrides, ...overrides };
  const bg = merged.bgColor || c.bg;
  const text = merged.textColor || c.text;
  const accent = merged.accentColor || c.accent;
  const bodyFont = merged.fontFamily || s.fontFamily;
  const headingFont = merged.headingFontFamily || s.headingFontFamily;

  // Ensure fonts are loaded
  if (typeof window !== "undefined") {
    loadGoogleFonts([bodyFont, headingFont].filter(Boolean));
  }

  return {
    "--theme-bg": bg,
    "--theme-surface": c.surface,
    "--theme-border": c.border,
    "--theme-text": text,
    "--theme-text-muted": c.textMuted,
    "--theme-accent": accent,
    "--theme-accent-fg": c.accentFg,
    "--theme-accent-hover": c.accentHover,
    "--theme-input-bg": c.inputBg,
    "--theme-divider": c.divider,
    "--theme-radius": s.radius,
    "--theme-border-width": s.borderWidth,
    "--theme-shadow": s.shadow,
    "--theme-hard-shadow": s.hardShadow || "none",
    "--theme-backdrop": s.backdrop || "none",
    "--theme-heading-weight": s.headingWeight,
    "--theme-letter-spacing": s.letterSpacing,
    "--theme-font": bodyFont ? getFontFamilyValue(bodyFont) : "'Inter', system-ui, sans-serif",
    "--theme-heading-font": headingFont ? getFontFamilyValue(headingFont) : getFontFamilyValue(bodyFont || "Inter"),
    // Apply body font directly so all components auto-inherit
    fontFamily: bodyFont ? getFontFamilyValue(bodyFont) : "'Inter', system-ui, sans-serif",
  } as React.CSSProperties;
}

/**
 * Returns the background color for a given theme (for preview chips etc.)
 */
export function getThemeBg(themeId: ThemeStyleVariant = "dark-pro"): string {
  const theme = THEME_STYLES[themeId] || THEME_STYLES["dark-pro"];
  return theme.colors.bg;
}

/**
 * Returns base structural classes that are safe to apply universally.
 * Does NOT include color classes (those come via CSS vars).
 */
export function getThemeBaseClasses(themeId: ThemeStyleVariant = "dark-pro"): string {
  const theme = THEME_STYLES[themeId] || THEME_STYLES["dark-pro"];
  const classes: string[] = [];

  // Font weight for headings context
  if (theme.style.headingWeight === "900") classes.push("font-black");
  else if (theme.style.headingWeight === "800") classes.push("font-extrabold");
  else if (theme.style.headingWeight === "700") classes.push("font-bold");

  // Transition
  classes.push("transition-all", "duration-300");

  return classes.join(" ");
}

// ─── LEGACY COMPATIBILITY ──────────────────────────────────────────────────
// Keep old function signatures for any file that hasn't been migrated yet.
// These return safe, theme-aware values.

export interface ThemeStyleConfig_Legacy {
  id: ThemeStyleVariant;
  name: string;
  description: string;
  characteristics: {
    borderStyle: "subtle" | "bold" | "none" | "glass";
    spacing: "compact" | "normal" | "spacious";
    corners: "sharp" | "rounded" | "pill";
    shadows: "none" | "subtle" | "elevated" | "dramatic";
    fontWeight: "light" | "normal" | "medium" | "bold" | "black";
    textTransform: "none" | "uppercase" | "lowercase";
    letterSpacing: "tight" | "normal" | "wide" | "wider";
    alignment: "left" | "center" | "right";
    density: "compact" | "normal" | "spacious";
    hover: "subtle" | "lift" | "scale" | "glow" | "none";
    transition: "fast" | "normal" | "slow" | "bouncy";
  };
}

/** @deprecated Use getThemeCSSVars instead */
export function getThemeClasses(themeStyle: ThemeStyleVariant = "dark-pro"): {
  border: string;
  spacing: string;
  corners: string;
  shadow: string;
  font: string;
  hover: string;
  transition: string;
} {
  const theme = THEME_STYLES[themeStyle] || THEME_STYLES["dark-pro"];
  const isSharp = theme.style.radius === "0px";
  const isBold = theme.style.borderWidth === "3px";

  return {
    border: isBold ? "border-[3px]" : "border",
    spacing: "p-6",
    corners: isSharp ? "" : "rounded-xl",
    shadow: "",
    font: theme.style.headingWeight === "900" ? "font-black" : "font-bold",
    hover: "hover:opacity-90",
    transition: "transition-all duration-300",
  };
}

/** @deprecated Use getThemeCSSVars instead */
export function getThemeStyles(themeStyle: ThemeStyleVariant = "dark-pro"): React.CSSProperties {
  return getThemeCSSVars(themeStyle);
}
