"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";

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
  backgroundColor = "#1a1a1a",
  textColor = "#ffffff",
  width,
  height,
  ...rest
}: PricingCardProps) {
  const [hovered, setHovered] = useState(false);

  const normalizedFeatures = features.map((f) =>
    typeof f === "string" ? { text: f, included: true } : f,
  );

  const baseStyle = buildComponentStyle({ backgroundColor, textColor, width, height, ...rest });

  return (
    <div
      className={cn(
        "p-8 rounded-2xl flex flex-col min-w-0 overflow-hidden border border-border",
        featured && "ring-1 ring-primary/20",
      )}
      style={{
        ...baseStyle,
        transition: "transform 300ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 300ms ease",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        boxShadow: hovered && featured
          ? "0 20px 60px rgba(99,102,241,0.25)"
          : hovered
          ? "0 16px 40px rgba(0,0,0,0.3)"
          : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-xl font-semibold tracking-tight"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {title}
          </h3>
          {featured && badge && (
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/20 text-primary"
              style={{
                animation: "badge-pulse 3s ease-in-out infinite",
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
          <span className="text-sm text-muted-foreground">/{period}</span>
        </div>

        {description && <p className="text-sm text-muted-foreground">{description}</p>}
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
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/20">
                  <Check className="w-3 h-3 text-primary" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                  <X className="w-3 h-3 text-muted-foreground" />
                </div>
              )}
              <span className={cn("break-words min-w-0", feature.included ? "text-foreground/80" : "text-muted-foreground")}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button */}
      <div className="mt-auto">
        <Button
          className={cn(
            "w-full py-3 rounded-xl font-semibold text-xs tracking-wider transition-all duration-200 active:scale-[0.98]",
            buttonVariant === "primary"
              ? "bg-primary hover:bg-primary/90 text-primary-foreground border-0 hover:scale-[1.02]"
              : "bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border hover:scale-[1.02]",
          )}
          asChild
        >
          <a href={buttonLink}>{buttonText}</a>
        </Button>
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
