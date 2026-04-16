"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { getUserStyleOverrides } from "@/lib/buildStyle";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";

interface CardProps {
  title?: string;
  description?: string;
  image?: string;
  topImage?: string;
  topImageHeight?: string;
  topImageObjectFit?: "cover" | "contain" | "fill" | "scale-down" | "none";
  bottomBackgroundImageUrl?: string;
  bottomBackgroundSize?: string;
  bottomBackgroundPosition?: string;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  buttonText?: string;
  buttonLink?: string;
  variant?: "default" | "bordered" | "shadow" | "elevated";
  className?: string;
  width?: string;
  height?: string;
  backgroundColor?: string;
  backgroundType?: "solid" | "gradient" | "image";
  gradientStart?: string;
  gradientEnd?: string;
  gradientDirection?: string;
  gradientAngle?: string;
  textColor?: string;
  themeStyle?: ThemeStyleVariant;
  children?: React.ReactNode;
  [key: string]: any;
}

export function Card({
  title = "Card Title",
  description = "A short description of this card's content goes here.",
  image = "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=400&fit=crop",
  topImage,
  topImageHeight = "208px",
  topImageObjectFit = "cover",
  bottomBackgroundImageUrl,
  bottomBackgroundSize = "cover",
  bottomBackgroundPosition = "center",
  icon,
  buttonText,
  buttonLink = "#",
  variant = "default",
  className,
  width,
  height,
  backgroundColor,
  backgroundType,
  gradientStart,
  gradientEnd,
  gradientDirection,
  gradientAngle,
  textColor,
  themeStyle,
  children,
  iconBg,
  iconColor,
  ...rest
}: CardProps) {
  const [hovered, setHovered] = useState(false);
  const effectiveTheme = useEffectiveThemeStyle(themeStyle, themeStyle !== undefined);
  const cssVars = getThemeCSSVars(effectiveTheme);

  const isNeoBrutalist = effectiveTheme === "neobrutalist";
  const isBrutalist = effectiveTheme === "brutalist";

  const baseStyle: React.CSSProperties = {
    ...cssVars,
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    border: `var(--theme-border-width) solid var(--theme-border)`,
    borderRadius: "var(--theme-radius)",
    boxShadow: hovered
      ? isNeoBrutalist || isBrutalist
        ? "8px 8px 0px var(--theme-border)"
        : "var(--theme-shadow)"
      : isNeoBrutalist || isBrutalist
        ? "var(--theme-hard-shadow, none)"
        : "0 2px 8px rgba(0,0,0,0.12)",
    transform: hovered && !isNeoBrutalist && !isBrutalist
      ? "translateY(-4px)"
      : hovered && (isNeoBrutalist || isBrutalist)
        ? "translate(-2px, -2px)"
        : "none",
    transition: "all 300ms ease",
    backdropFilter: "var(--theme-backdrop)",
    ...getUserStyleOverrides(rest),
  };

  // Handle background based on type - user preferences MUST override theme
  if (backgroundType === "gradient" && gradientStart && gradientEnd) {
    const direction = gradientDirection === "custom"
      ? `${gradientAngle || "135"}deg`
      : gradientDirection || "to bottom right";
    baseStyle.backgroundImage = `linear-gradient(${direction}, ${gradientStart}, ${gradientEnd})`;
  } else if (backgroundColor) {
    baseStyle.background = backgroundColor;
  } else {
    baseStyle.background = "var(--theme-surface)";
  }

  // Text color override
  if (textColor) {
    baseStyle.color = textColor;
  } else {
    baseStyle.color = "var(--theme-text)";
  }

  // Build bottom background image style
  const bottomBackgroundStyle = bottomBackgroundImageUrl
    ? {
        backgroundImage: `url(${bottomBackgroundImageUrl})`,
        backgroundSize: bottomBackgroundSize,
        backgroundPosition: bottomBackgroundPosition,
        backgroundRepeat: "no-repeat",
      }
    : {};

  const showTopImage = topImage || image;
  const showIcon = icon && !showTopImage;

  return (
    <div
      className={cn(
        "min-w-0 w-full h-full flex flex-col overflow-hidden relative p-6",
        className,
      )}
      style={baseStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Bottom Background Image Layer */}
      {bottomBackgroundImageUrl && (
        <div
          className="absolute inset-0"
          style={bottomBackgroundStyle}
        />
      )}

      {/* Top Image */}
      {showTopImage && (
        <div className="-mx-6 -mt-6 mb-5 flex-shrink-0 overflow-hidden relative z-10">
          <img
            src={showTopImage}
            alt={title || "Card image"}
            className="w-full"
            style={{
              height: topImageHeight,
              objectFit: topImageObjectFit,
              transition: "transform 500ms cubic-bezier(0.25,0.46,0.45,0.94)",
              transform: hovered ? "scale(1.04)" : "scale(1)",
            }}
          />
        </div>
      )}

      {/* Icon */}
      {showIcon && (
        <div className="mb-5 flex-shrink-0 relative z-10">
          <div
            className="w-12 h-12 flex items-center justify-center text-xl font-bold"
            style={{
              backgroundColor: iconBg || "var(--theme-accent)",
              color: iconColor || "var(--theme-accent-fg)",
              borderRadius: "var(--theme-radius)",
              border: `var(--theme-border-width) solid var(--theme-border)`,
              boxShadow: "var(--theme-hard-shadow, none)",
              transition: "transform 300ms cubic-bezier(0.34,1.56,0.64,1)",
              transform: hovered ? "scale(1.1) rotate(-3deg)" : "scale(1) rotate(0deg)",
            }}
          >
            {icon || "•"}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-3 min-w-0 flex-1 overflow-hidden relative z-10">
        {title && (
          <h3
            className="text-xl break-words leading-tight line-clamp-2"
            style={{
              fontWeight: "var(--theme-heading-weight)" as any,
              color: textColor || "var(--theme-text)",
              letterSpacing: "var(--theme-letter-spacing)",
              fontFamily: "var(--theme-heading-font)",
            }}
          >
            {title}
          </h3>
        )}

        {description && (
          <p
            className="text-sm leading-relaxed break-words line-clamp-3"
            style={{ color: textColor || "var(--theme-text-muted)", opacity: textColor ? 0.8 : 1 }}
          >
            {description}
          </p>
        )}

        {buttonText && (
          <div className="pt-2">
            <a
              href={buttonLink}
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 hover:opacity-80 group/btn"
              style={{ color: textColor || "var(--theme-accent)" }}
            >
              {buttonText}
              <span className="text-xs transition-transform duration-200 group-hover/btn:translate-x-1">→</span>
            </a>
          </div>
        )}
      </div>

      {children}
    </div>
  );
}
