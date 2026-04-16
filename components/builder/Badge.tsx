import { cn } from "@/lib/utils";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { getUserStyleOverrides } from "@/lib/buildStyle";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";

interface BadgeProps {
  text?: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  rounded?: boolean;
  backgroundColor?: string;
  textColor?: string;
  themeStyle?: ThemeStyleVariant;
  [key: string]: any;
}

export function Badge({
  text = "Badge",
  variant = "default",
  size = "md",
  rounded = false,
  backgroundColor,
  textColor,
  themeStyle,
  ...rest
}: BadgeProps) {
  const effectiveTheme = useEffectiveThemeStyle(themeStyle, !!themeStyle);
  const cssVars = getThemeCSSVars(effectiveTheme);

  // Semantic variant accents (still works across themes)
  const variantColors: Record<string, { bg: string; text: string }> = {
    default: { bg: "var(--theme-surface)", text: "var(--theme-text)" },
    success: { bg: "rgba(34,197,94,0.15)", text: "#4ade80" },
    warning: { bg: "rgba(234,179,8,0.15)", text: "#fbbf24" },
    error: { bg: "rgba(239,68,68,0.15)", text: "#f87171" },
    info: { bg: "color-mix(in srgb, var(--theme-accent) 15%, transparent)", text: "var(--theme-accent)" },
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: "4px 10px", fontSize: "11px" },
    md: { padding: "6px 14px", fontSize: "13px" },
    lg: { padding: "8px 18px", fontSize: "14px" },
  };

  const colors = variantColors[variant] || variantColors.default;

  const badgeStyle: React.CSSProperties = {
    ...cssVars,
    display: "inline-flex",
    alignItems: "center",
    fontWeight: 600,
    letterSpacing: "var(--theme-letter-spacing)",
    borderRadius: rounded ? "9999px" : "var(--theme-radius)",
    border: `var(--theme-border-width) solid var(--theme-border)`,
    background: backgroundColor || colors.bg,
    color: textColor || colors.text,
    ...sizeStyles[size],
    ...getUserStyleOverrides(rest),
  };

  return (
    <span style={badgeStyle}>
      {text}
    </span>
  );
}
