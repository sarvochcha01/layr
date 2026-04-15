"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";

interface FeatureProps {
  icon?: string;
  title?: string;
  description?: string;
  layout?: "vertical" | "horizontal";
  iconSize?: "sm" | "md" | "lg";
  backgroundColor?: string;
  textColor?: string;
  iconColor?: string;
  width?: string;
  height?: string;
  themeStyle?: ThemeStyleVariant;
  [key: string]: any;
}

export function Feature({
  icon = "•",
  title = "Feature Title",
  description = "Explain the value of this feature in a way that resonates with your audience.",
  layout = "vertical",
  iconSize = "md",
  backgroundColor,
  textColor,
  iconColor,
  width,
  height,
  themeStyle,
  ...rest
}: FeatureProps) {
  const [hovered, setHovered] = useState(false);
  const effectiveTheme = useEffectiveThemeStyle(themeStyle, !!themeStyle);
  const cssVars = getThemeCSSVars(effectiveTheme);

  const iconSizes = {
    sm: "text-xl w-10 h-10",
    md: "text-2xl w-12 h-12",
    lg: "text-3xl w-14 h-14",
  };

  const rootStyle: React.CSSProperties = {
    ...cssVars,
    backgroundColor: backgroundColor || "var(--theme-surface)",
    color: textColor || "var(--theme-text)",
    borderRadius: "var(--theme-radius)",
    border: `var(--theme-border-width) solid var(--theme-border)`,
    padding: "24px",
    boxShadow: hovered ? "var(--theme-shadow)" : "none",
    transform: hovered ? "translateY(-4px)" : "translateY(0)",
    transition: "transform 300ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 300ms ease",
    backdropFilter: "var(--theme-backdrop)",
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
  };

  const resolvedIconColor = iconColor || "var(--theme-accent)";

  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden",
        layout === "vertical" ? "text-center" : "flex gap-5 items-start",
      )}
      style={rootStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={cn(
          "rounded-xl flex items-center justify-center flex-shrink-0",
          iconSizes[iconSize],
          layout === "vertical" && "mx-auto mb-5",
        )}
        style={{
          background: `color-mix(in srgb, ${resolvedIconColor} 15%, transparent)`,
          color: resolvedIconColor,
          borderRadius: "var(--theme-radius)",
          transition: "transform 350ms cubic-bezier(0.34,1.56,0.64,1)",
          transform: hovered ? "scale(1.15) rotate(-5deg)" : "scale(1) rotate(0deg)",
        }}
      >
        {icon}
      </div>

      <div className={cn("min-w-0", layout === "vertical" ? "text-center" : "flex-1")}>
        <h3
          className="text-lg mb-2 tracking-tight break-words"
          style={{
            fontWeight: "var(--theme-heading-weight)" as any,
            color: "var(--theme-text)",
            letterSpacing: "var(--theme-letter-spacing)",
          }}
        >
          {title}
        </h3>
        <p
          className="text-sm leading-relaxed break-words"
          style={{ color: "var(--theme-text-muted)" }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
