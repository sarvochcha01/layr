"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { getUserStyleOverrides } from "@/lib/buildStyle";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";

interface CTAProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  alignment?: "left" | "center" | "right";
  size?: "sm" | "md" | "lg";
  backgroundColor?: string;
  backgroundType?: "solid" | "gradient" | "image";
  gradientStart?: string;
  gradientEnd?: string;
  gradientDirection?: string;
  gradientAngle?: string;
  textColor?: string;
  width?: string;
  height?: string;
  themeStyle?: ThemeStyleVariant;
  [key: string]: any;
}

export function CTA({
  title = "Ready to get started?",
  description = "Join thousands of teams who are already building faster with our platform.",
  primaryButtonText = "Start Free Trial",
  primaryButtonLink = "#",
  secondaryButtonText,
  secondaryButtonLink = "#",
  alignment = "center",
  size = "md",
  backgroundColor,
  backgroundType,
  gradientStart,
  gradientEnd,
  gradientDirection,
  gradientAngle,
  textColor,
  width,
  height,
  themeStyle,
  ...rest
}: CTAProps) {
  const [hovered, setHovered] = useState(false);

  // Size padding values (will be overridden by user's custom padding if set)
  const sizePadding = { 
    sm: { paddingTop: "48px", paddingBottom: "48px", paddingLeft: "24px", paddingRight: "24px" },
    md: { paddingTop: "64px", paddingBottom: "64px", paddingLeft: "32px", paddingRight: "32px" },
    lg: { paddingTop: "96px", paddingBottom: "96px", paddingLeft: "48px", paddingRight: "48px" },
  };
  
  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  const effectiveTheme = useEffectiveThemeStyle(themeStyle, themeStyle !== undefined);
  const cssVars = getThemeCSSVars(effectiveTheme);

  const isNeoBrutalist = effectiveTheme === "neobrutalist";
  const isBrutalist = effectiveTheme === "brutalist";

  const containerStyle: React.CSSProperties = {
    ...cssVars,
    borderRadius: "var(--theme-radius)",
    border: `var(--theme-border-width) solid var(--theme-border)`,
    boxShadow: hovered
      ? isNeoBrutalist || isBrutalist
        ? "8px 8px 0px var(--theme-border)"
        : `0 0 60px rgba(var(--theme-accent), 0.15), var(--theme-shadow)`
      : isNeoBrutalist || isBrutalist
        ? "var(--theme-hard-shadow, none)"
        : "none",
    transform: hovered && (isNeoBrutalist || isBrutalist)
      ? "translate(-2px, -2px)"
      : "none",
    backdropFilter: "var(--theme-backdrop)",
    transition: "all 300ms ease",
    boxSizing: "border-box",
    // Apply size-based padding as defaults
    ...sizePadding[size],
    ...getUserStyleOverrides(rest),
  };

  // Handle background based on type - user preferences MUST override theme
  if (backgroundType === "gradient" && gradientStart && gradientEnd) {
    const direction = gradientDirection === "custom"
      ? `${gradientAngle || "135"}deg`
      : gradientDirection || "to bottom right";
    containerStyle.backgroundImage = `linear-gradient(${direction}, ${gradientStart}, ${gradientEnd})`;
  } else if (backgroundColor) {
    containerStyle.background = backgroundColor;
  } else {
    containerStyle.background = "var(--theme-surface)";
  }

  // Text color override
  if (textColor) {
    containerStyle.color = textColor;
  } else {
    containerStyle.color = "var(--theme-text)";
  }

  return (
    <div
      className={cn(
        "w-full h-full flex flex-col gap-8 relative overflow-hidden",
        alignmentClasses[alignment],
      )}
      style={containerStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Decorative glow on hover */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--theme-accent) 8%, transparent), transparent 70%)`,
          opacity: hovered ? 1 : 0,
          transition: "opacity 400ms ease",
        }}
      />

      <div className="relative z-10">
        <h2
          className="text-3xl sm:text-4xl mb-4 tracking-tight"
          style={{
            fontWeight: "var(--theme-heading-weight)" as any,
            color: "var(--theme-text)",
            letterSpacing: "var(--theme-letter-spacing)",
            fontFamily: "var(--theme-heading-font)",
          }}
        >
          {title}
        </h2>
        <p
          className="text-lg max-w-xl"
          style={{
            color: "var(--theme-text-muted)",
            ...(alignment === "center" ? { marginLeft: "auto", marginRight: "auto" } : undefined),
          }}
        >
          {description}
        </p>
      </div>

      <div className="relative z-10 flex gap-4 flex-wrap">
        <a
          href={primaryButtonLink}
          className="inline-flex items-center px-8 py-3 text-base font-semibold transition-all duration-200 hover:opacity-90 hover:scale-[1.03] active:scale-[0.98]"
          style={{
            background: "var(--theme-accent)",
            color: "var(--theme-accent-fg)",
            borderRadius: "var(--theme-radius)",
            border: `var(--theme-border-width) solid var(--theme-border)`,
            boxShadow: "var(--theme-hard-shadow, var(--theme-shadow))",
          }}
        >
          {primaryButtonText}
        </a>
        {secondaryButtonText && (
          <a
            href={secondaryButtonLink}
            className="inline-flex items-center px-8 py-3 text-base font-semibold transition-all duration-200 hover:opacity-90 hover:scale-[1.03] active:scale-[0.98]"
            style={{
              background: "var(--theme-bg)",
              color: "var(--theme-text)",
              borderRadius: "var(--theme-radius)",
              border: `var(--theme-border-width) solid var(--theme-border)`,
              boxShadow: "var(--theme-hard-shadow, none)",
            }}
          >
            {secondaryButtonText}
          </a>
        )}
      </div>
    </div>
  );
}
