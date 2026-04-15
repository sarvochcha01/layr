"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";

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
  [key: string]: any;
}

export function Testimonial({
  quote = "The Obsidian Architect has transformed how our design team ships. It's the precision of an IDE with the speed of a site builder.",
  author = "Marcus Chen",
  role = "CTO",
  company = "NEXUS DIGITAL",
  avatar,
  rating,
  variant = "card",
  backgroundColor = "#1a1a1a",
  textColor = "#ffffff",
  width,
  height,
  ...rest
}: TestimonialProps) {
  const [hovered, setHovered] = useState(false);

  const baseStyle = buildComponentStyle({
    backgroundColor,
    textColor,
    width,
    height,
    ...rest,
  });

  // Ensure rating is a number, default to 5 if not provided
  const numericRating =
    rating === undefined || rating === null
      ? 5
      : typeof rating === "string"
        ? parseFloat(rating) || 0
        : rating;

  console.log("Testimonial rating:", {
    rating,
    numericRating,
    type: typeof rating,
  });

  // Variant-specific styles
  const isCard = variant === "card";
  const isMinimal = variant === "minimal";
  const isFeatured = variant === "featured";

  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden",
        isCard && "p-8 rounded-2xl border border-border",
        isMinimal && "p-4",
        isFeatured &&
          "p-10 rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent",
      )}
      style={{
        ...baseStyle,
        transition:
          "transform 300ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 300ms ease, border-color 300ms ease",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? isFeatured
            ? "0 20px 60px rgba(99,102,241,0.3)"
            : isCard
              ? "0 16px 40px rgba(0,0,0,0.35)"
              : "none"
          : "none",
        borderColor: hovered && isCard ? "rgba(255,255,255,0.12)" : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Rating Stars */}
      {numericRating > 0 && (
        <div
          className={cn(
            "flex gap-1",
            isMinimal ? "mb-3" : isFeatured ? "mb-8" : "mb-6",
          )}
        >
          {Array.from({ length: 5 }).map((_, i) => {
            const isFilled = i < numericRating;
            return (
              <Star
                key={i}
                className={cn(
                  isMinimal ? "w-4 h-4" : isFeatured ? "w-6 h-6" : "w-5 h-5",
                )}
                fill={isFilled ? "currentColor" : "none"}
                style={{
                  color: isFilled
                    ? "hsl(var(--primary))"
                    : "hsl(var(--muted-foreground))",
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
          "leading-relaxed break-words text-foreground/80",
          isMinimal
            ? "text-base mb-4"
            : isFeatured
              ? "text-xl mb-10 italic"
              : "text-lg mb-8 italic",
        )}
        style={{
          fontFamily: "'Inter', sans-serif",
          transition: "color 200ms ease",
          color: hovered ? "rgba(255,255,255,0.95)" : undefined,
        }}
      >
        {isMinimal ? quote : `"${quote}"`}
      </blockquote>

      {/* Author */}
      <div
        className={cn(
          "flex items-center gap-3",
          !isMinimal && "pt-6 border-t border-border",
        )}
      >
        {avatar ? (
          <img
            src={avatar}
            alt={author}
            className={cn(
              "rounded-full object-cover ring-2 ring-border",
              isMinimal ? "w-10 h-10" : isFeatured ? "w-16 h-16" : "w-12 h-12",
            )}
            style={{
              transition: "transform 300ms cubic-bezier(0.34,1.56,0.64,1)",
              transform: hovered ? "scale(1.08)" : "scale(1)",
            }}
          />
        ) : (
          <div
            className={cn(
              "rounded-full flex items-center justify-center font-semibold bg-muted",
              isMinimal
                ? "w-10 h-10 text-xs"
                : isFeatured
                  ? "w-16 h-16 text-lg"
                  : "w-12 h-12 text-sm",
            )}
            style={{
              transition:
                "transform 300ms cubic-bezier(0.34,1.56,0.64,1), background-color 200ms ease",
              transform: hovered ? "scale(1.08)" : "scale(1)",
              backgroundColor: hovered ? "rgba(99,102,241,0.3)" : undefined,
            }}
          >
            {author?.charAt(0) || "?"}
          </div>
        )}
        <div className="min-w-0">
          <div
            className={cn(
              "font-semibold truncate text-foreground",
              isMinimal ? "text-xs" : isFeatured ? "text-base" : "text-sm",
            )}
          >
            {author}
          </div>
          <div
            className={cn(
              "text-muted-foreground truncate uppercase tracking-wider",
              isMinimal ? "text-[10px]" : isFeatured ? "text-sm" : "text-xs",
            )}
          >
            {role}
            {company && `, ${company}`}
          </div>
        </div>
      </div>
    </div>
  );
}
