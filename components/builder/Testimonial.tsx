"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";

interface TestimonialProps {
  quote?: string;
  author?: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating?: number;
  variant?: "card" | "minimal" | "featured";
  backgroundColor?: string;
  textColor?: string;
  width?: string;
  height?: string;
  themeStyle?: ThemeStyleVariant;
  [key: string]: any;
}

export function Testimonial({
  quote = "This platform has transformed how our design team ships. It's the precision of an IDE with the speed of a site builder.",
  author = "Marcus Chen",
  role = "CTO",
  company = "NEXUS DIGITAL",
  avatar,
  rating,
  variant = "card",
  backgroundColor,
  textColor,
  width,
  height,
  themeStyle,
  ...rest
}: TestimonialProps) {
  const [hovered, setHovered] = useState(false);
  const effectiveTheme = useEffectiveThemeStyle(themeStyle, !!themeStyle);
  const cssVars = getThemeCSSVars(effectiveTheme);

  const numericRating =
    rating === undefined || rating === null
      ? 5
      : typeof rating === "string"
        ? parseFloat(rating) || 0
        : rating;

  const isCard = variant === "card";
  const isMinimal = variant === "minimal";
  const isFeatured = variant === "featured";

  const rootStyle: React.CSSProperties = {
    ...cssVars,
    backgroundColor: backgroundColor || (isMinimal ? "transparent" : "var(--theme-surface)"),
    color: textColor || "var(--theme-text)",
    border: isMinimal ? "none" : `var(--theme-border-width) solid ${isFeatured ? "var(--theme-accent)" : "var(--theme-border)"}`,
    borderRadius: isMinimal ? "0" : isFeatured ? "24px" : "var(--theme-radius)",
    padding: isMinimal ? "16px" : isFeatured ? "40px" : "32px",
    backdropFilter: "var(--theme-backdrop)",
    boxShadow: hovered
      ? isFeatured
        ? `0 20px 60px color-mix(in srgb, var(--theme-accent) 25%, transparent)`
        : isCard
          ? "var(--theme-shadow)"
          : "none"
      : "none",
    transform: hovered && !isMinimal ? "translateY(-4px)" : "translateY(0)",
    transition: "transform 300ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 300ms ease",
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
  };

  return (
    <div
      className="min-w-0 overflow-hidden"
      style={rootStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Rating Stars */}
      {numericRating > 0 && (
        <div className={cn("flex gap-1", isMinimal ? "mb-3" : isFeatured ? "mb-8" : "mb-6")}>
          {Array.from({ length: 5 }).map((_, i) => {
            const isFilled = i < numericRating;
            return (
              <Star
                key={i}
                className={cn(isMinimal ? "w-4 h-4" : isFeatured ? "w-6 h-6" : "w-5 h-5")}
                fill={isFilled ? "currentColor" : "none"}
                style={{
                  color: isFilled ? "var(--theme-accent)" : "var(--theme-text-muted)",
                  transition: `transform 300ms cubic-bezier(0.34,1.56,0.64,1) ${i * 40}ms`,
                  transform: hovered ? "scale(1.2)" : "scale(1)",
                }}
              />
            );
          })}
        </div>
      )}

      {/* Quote */}
      <blockquote
        className={cn(
          "leading-relaxed break-words",
          isMinimal ? "text-base mb-4" : isFeatured ? "text-xl mb-10 italic" : "text-lg mb-8 italic",
        )}
        style={{ color: "var(--theme-text)" }}
      >
        {isMinimal ? quote : `"${quote}"`}
      </blockquote>

      {/* Author */}
      <div
        className={cn("flex items-center gap-3")}
        style={{
          paddingTop: !isMinimal ? "24px" : undefined,
          borderTop: !isMinimal ? `1px solid var(--theme-border)` : undefined,
        }}
      >
        {avatar ? (
          <img
            src={avatar}
            alt={author}
            className={cn(
              "rounded-full object-cover",
              isMinimal ? "w-10 h-10" : isFeatured ? "w-16 h-16" : "w-12 h-12",
            )}
            style={{
              border: `2px solid var(--theme-border)`,
              transition: "transform 300ms cubic-bezier(0.34,1.56,0.64,1)",
              transform: hovered ? "scale(1.08)" : "scale(1)",
            }}
          />
        ) : (
          <div
            className={cn(
              "rounded-full flex items-center justify-center font-semibold",
              isMinimal ? "w-10 h-10 text-xs" : isFeatured ? "w-16 h-16 text-lg" : "w-12 h-12 text-sm",
            )}
            style={{
              background: "color-mix(in srgb, var(--theme-accent) 20%, transparent)",
              color: "var(--theme-accent)",
              transition: "transform 300ms cubic-bezier(0.34,1.56,0.64,1)",
              transform: hovered ? "scale(1.08)" : "scale(1)",
            }}
          >
            {author?.charAt(0) || "?"}
          </div>
        )}
        <div className="min-w-0">
          <div
            className={cn(
              "font-semibold truncate",
              isMinimal ? "text-xs" : isFeatured ? "text-base" : "text-sm",
            )}
            style={{ color: "var(--theme-text)" }}
          >
            {author}
          </div>
          <div
            className={cn(
              "truncate uppercase tracking-wider",
              isMinimal ? "text-[10px]" : isFeatured ? "text-sm" : "text-xs",
            )}
            style={{ color: "var(--theme-text-muted)" }}
          >
            {role}
            {company && `, ${company}`}
          </div>
        </div>
      </div>
    </div>
  );
}
