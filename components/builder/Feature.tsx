"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";

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
  [key: string]: any;
}

export function Feature({
  icon = "•",
  title = "Feature Title",
  description = "Explain the value of this feature in a way that resonates with your audience.",
  layout = "vertical",
  iconSize = "md",
  backgroundColor = "#1a1a1a",
  textColor = "#ffffff",
  iconColor = "#3b82f6",
  width,
  height,
  ...rest
}: FeatureProps) {
  const [hovered, setHovered] = useState(false);

  const iconSizes = {
    sm: "text-xl w-10 h-10",
    md: "text-2xl w-12 h-12",
    lg: "text-3xl w-14 h-14",
  };

  const baseStyle = buildComponentStyle({
    backgroundColor,
    textColor,
    width,
    height,
    ...rest,
  });

  return (
    <div
      className={cn(
        "p-6 rounded-2xl min-w-0 overflow-hidden border border-border",
        layout === "vertical" ? "text-center" : "flex gap-5 items-start",
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
      <div
        className={cn(
          "rounded-xl flex items-center justify-center flex-shrink-0",
          iconSizes[iconSize],
          layout === "vertical" && "mx-auto mb-5",
        )}
        style={{
          background: `linear-gradient(135deg, ${iconColor}15, ${iconColor}25)`,
          color: iconColor,
          transition:
            "transform 350ms cubic-bezier(0.34,1.56,0.64,1), background 250ms ease",
          transform: hovered
            ? "scale(1.15) rotate(-5deg)"
            : "scale(1) rotate(0deg)",
        }}
      >
        {icon}
      </div>

      <div
        className={cn(
          "min-w-0",
          layout === "vertical" ? "text-center" : "flex-1",
        )}
      >
        <h3
          className="text-lg font-semibold mb-2 tracking-tight break-words text-foreground"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground break-words">
          {description}
        </p>
      </div>
    </div>
  );
}
