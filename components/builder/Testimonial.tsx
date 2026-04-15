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

  return (
    <div
      className={cn(
        "p-8 rounded-2xl min-w-0 overflow-hidden border border-border",
      )}
      style={{
        ...baseStyle,
        transition:
          "transform 300ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 300ms ease, border-color 300ms ease",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? "0 16px 40px rgba(0,0,0,0.35)" : "none",
        borderColor: hovered ? "rgba(255,255,255,0.12)" : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Rating Stars */}
      {numericRating > 0 && (
        <div className="flex gap-1 mb-6">
          {Array.from({ length: 5 }).map((_, i) => {
            const isFilled = i < numericRating;
            return (
              <Star
                key={i}
                className={cn("w-5 h-5")}
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
        className="text-lg leading-relaxed mb-8 break-words italic text-foreground/80"
        style={{
          fontFamily: "'Inter', sans-serif",
          transition: "color 200ms ease",
          color: hovered ? "rgba(255,255,255,0.95)" : undefined,
        }}
      >
        "{quote}"
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3 pt-6 border-t border-border">
        {avatar ? (
          <img
            src={avatar}
            alt={author}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-border"
            style={{
              transition: "transform 300ms cubic-bezier(0.34,1.56,0.64,1)",
              transform: hovered ? "scale(1.08)" : "scale(1)",
            }}
          />
        ) : (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold bg-muted"
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
          <div className="text-sm font-semibold truncate text-foreground">
            {author}
          </div>
          <div className="text-xs text-muted-foreground truncate uppercase tracking-wider">
            {role}
            {company && `, ${company}`}
          </div>
        </div>
      </div>
    </div>
  );
}
