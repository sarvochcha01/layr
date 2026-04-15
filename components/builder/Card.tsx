"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";

interface CardProps {
  title?: string;
  description?: string;
  image?: string;
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
  textColor?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export function Card({
  title = "Card Title",
  description = "A short description of this card's content goes here.",
  image = "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=400&fit=crop",
  icon,
  buttonText,
  buttonLink = "#",
  variant = "default",
  className,
  width,
  height,
  backgroundColor = "#1a1a1a",
  textColor = "#ffffff",
  children,
  iconBg,
  iconColor,
  ...rest
}: CardProps) {
  const [hovered, setHovered] = useState(false);

  const baseStyle = buildComponentStyle({ backgroundColor, textColor, width, height, ...rest });

  return (
    <div
      className={cn(
        "rounded-2xl p-6 min-w-0 w-full h-full flex flex-col",
        "border border-border",
        "overflow-hidden",
        className,
      )}
      style={{
        ...baseStyle,
        transition: "transform 300ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 300ms ease, border-color 300ms ease",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? "0 16px 40px rgba(0,0,0,0.35)" : "0 0 0 rgba(0,0,0,0)",
        borderColor: hovered ? "rgba(255,255,255,0.15)" : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      {image && (
        <div className="-mx-6 -mt-6 mb-5 flex-shrink-0 overflow-hidden">
          <img
            src={image}
            alt={title || "Card image"}
            className="w-full h-52 object-cover"
            style={{
              transition: "transform 500ms cubic-bezier(0.25,0.46,0.45,0.94)",
              transform: hovered ? "scale(1.04)" : "scale(1)",
            }}
          />
        </div>
      )}

      {/* Icon */}
      {icon && !image && (
        <div className="mb-5 flex-shrink-0">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold backdrop-blur-sm"
            style={{
              backgroundColor: iconBg,
              color: iconColor,
              transition: "transform 300ms cubic-bezier(0.34,1.56,0.64,1)",
              transform: hovered ? "scale(1.1) rotate(-3deg)" : "scale(1) rotate(0deg)",
            }}
          >
            {icon || "•"}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-3 min-w-0 flex-1 overflow-hidden">
        {title && (
          <h3
            className="text-xl font-semibold break-words leading-tight tracking-tight line-clamp-2"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {title}
          </h3>
        )}

        {description && (
          <p className="text-sm leading-relaxed break-words text-gray-400 line-clamp-3">
            {description}
          </p>
        )}

        {buttonText && (
          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="px-0 font-medium hover:bg-transparent text-primary hover:text-primary/80 group/btn"
              asChild
            >
              <a href={buttonLink} className="inline-flex items-center gap-1.5">
                {buttonText}
                <span
                  className="text-xs transition-transform duration-200 group-hover/btn:translate-x-1"
                >
                  →
                </span>
              </a>
            </Button>
          </div>
        )}
      </div>

      {children}
    </div>
  );
}
