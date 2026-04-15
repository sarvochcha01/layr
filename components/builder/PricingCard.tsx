"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";

interface Feature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  title?: string;
  price?: string;
  period?: string;
  description?: string;
  features?: (string | Feature)[];
  buttonText?: string;
  buttonLink?: string;
  buttonVariant?: "primary" | "secondary";
  featured?: boolean;
  badge?: string;
  backgroundColor?: string;
  textColor?: string;
  width?: string;
  height?: string;
  themeStyle?: ThemeStyleVariant;
  [key: string]: any;
}

export function PricingCard({
  title = "Professional",
  price = "$49",
  period = "mo",
  description,
  features = [
    { text: "Unlimited Components", included: true },
    { text: "Advanced Interactivity", included: true },
    { text: "Real-time Collaboration", included: true },
    { text: "Custom Domain", included: true },
  ],
  buttonText = "GET STARTED",
  buttonLink = "#",
  buttonVariant = "primary",
  featured = false,
  badge = "POPULAR",
  backgroundColor,
  textColor,
  width,
  height,
  themeStyle,
  ...rest
}: PricingCardProps) {
  const [hovered, setHovered] = useState(false);

  const normalizedFeatures = features.map((f) =>
    typeof f === "string" ? { text: f, included: true } : f,
  );

  const effectiveTheme = useEffectiveThemeStyle(themeStyle, !!themeStyle);
  const cssVars = getThemeCSSVars(effectiveTheme);

  return (
    <div
      className={cn(
        "p-8 flex flex-col min-w-0 overflow-hidden",
      )}
      style={{ 
        ...cssVars,
        backgroundColor: backgroundColor || "var(--theme-surface)",
        color: textColor || "var(--theme-text)",
        border: `var(--theme-border-width) solid ${featured ? "var(--theme-accent)" : "var(--theme-border)"}`,
        borderRadius: "var(--theme-radius)",
        boxShadow: hovered
          ? featured
            ? `0 20px 60px color-mix(in srgb, var(--theme-accent) 30%, transparent), var(--theme-hard-shadow, none)`
            : "var(--theme-shadow)"
          : featured
            ? `0 0 0 1px var(--theme-accent), var(--theme-hard-shadow, none)`
            : "none",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        transition: "transform 300ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 300ms ease",
        ...(width ? { width } : {}),
        ...(height ? { height } : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-xl tracking-tight"
            style={{ fontWeight: "var(--theme-heading-weight)" as any, color: "var(--theme-text)", fontFamily: "var(--theme-heading-font)" }}
          >
            {title}
          </h3>
          {featured && badge && (
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-3 py-1"
              style={{
                animation: "badge-pulse 3s ease-in-out infinite",
                background: "var(--theme-accent)",
                color: "var(--theme-accent-fg)",
                borderRadius: "var(--theme-radius)",
              }}
            >
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1 mb-2">
          <span
            className="text-5xl font-bold tracking-tight tabular-nums"
            style={{
              transition: "transform 200ms ease",
              transform: hovered ? "scale(1.04)" : "scale(1)",
              display: "inline-block",
            }}
          >
            {price}
          </span>
          <span className="text-sm" style={{ color: "var(--theme-text-muted)" }}>/{period}</span>
        </div>

        {description && <p className="text-sm" style={{ color: "var(--theme-text-muted)" }}>{description}</p>}
      </div>

      {/* Features */}
      <div className="flex-grow mb-8">
        <ul className="space-y-3">
          {normalizedFeatures.map((feature, index) => (
            <li
              key={index}
              className="flex items-center gap-3 text-sm"
              style={{
                opacity: hovered ? 1 : 0.9,
                transform: hovered ? "translateX(2px)" : "translateX(0)",
                transition: `opacity 200ms ease ${index * 30}ms, transform 200ms ease ${index * 30}ms`,
              }}
            >
              {feature.included ? (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "color-mix(in srgb, var(--theme-accent) 20%, transparent)" }}
                >
                  <Check className="w-3 h-3" style={{ color: "var(--theme-accent)" }} />
                </div>
              ) : (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--theme-surface)" }}
                >
                  <X className="w-3 h-3" style={{ color: "var(--theme-text-muted)" }} />
                </div>
              )}
              <span className="break-words min-w-0" style={{ color: feature.included ? "var(--theme-text)" : "var(--theme-text-muted)" }}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button */}
      <div className="mt-auto">
        <a
          href={buttonLink}
          className="w-full py-3 text-xs font-bold tracking-wider transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
          style={{
            background: buttonVariant === "primary" ? "var(--theme-accent)" : "var(--theme-surface)",
            color: buttonVariant === "primary" ? "var(--theme-accent-fg)" : "var(--theme-text)",
            borderRadius: "var(--theme-radius)",
            border: `var(--theme-border-width) solid var(--theme-border)`,
            boxShadow: "var(--theme-hard-shadow, none)",
          }}
        >
          {buttonText}
        </a>
      </div>

      <style>{`
        @keyframes badge-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
