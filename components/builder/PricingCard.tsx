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
  isPreviewMode?: boolean;
  onNavigate?: (slug: string) => void;
  pages?: any[];
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
  isPreviewMode = false,
  onNavigate,
  pages,
  ...rest
}: PricingCardProps) {
  const normalizedFeatures = features.map((feature) => {
    if (typeof feature === "string") {
      return { text: feature, included: true };
    }
    return feature;
  });

  const baseStyle = buildComponentStyle({
    backgroundColor,
    textColor,
    width,
    height,
    ...rest,
  });

  /** Handle link clicks */
  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    if (!isPreviewMode) {
      e.preventDefault();
      return;
    }
    if (href.startsWith("page:") && onNavigate) {
      e.preventDefault();
      const pageId = href.substring(5);
      const page = pages?.find((p: any) => p.id === pageId);
      if (page) onNavigate(page.slug);
    }
  };

  return (
    <div
      className={cn(
        "p-8 rounded-2xl flex flex-col min-w-0 overflow-hidden transition-all duration-300",
        "border border-border",
        "hover:border-border/80",
        featured && "ring-1 ring-primary/20",
      )}
      style={baseStyle}
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
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/20 text-primary">
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-5xl font-bold tracking-tight">{price}</span>
          <span className="text-sm text-muted-foreground">/{period}</span>
        </div>

        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      {/* Features */}
      <div className="flex-grow mb-8">
        <ul className="space-y-3">
          {normalizedFeatures.map((feature, index) => (
            <li key={index} className="flex items-center gap-3 text-sm">
              {feature.included ? (
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/20">
                  <Check className="w-3 h-3 text-primary" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                  <X className="w-3 h-3 text-muted-foreground" />
                </div>
              )}
              <span
                className={cn(
                  "break-words min-w-0",
                  feature.included ? "text-foreground/80" : "text-muted-foreground",
                )}
              >
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button */}
      <div className="mt-auto" style={isPreviewMode ? undefined : { pointerEvents: "none" }}>
        <Button
          className={cn(
            "w-full py-3 rounded-xl font-semibold text-xs tracking-wider transition-all duration-300",
            buttonVariant === "primary"
              ? "bg-primary hover:bg-primary/90 text-primary-foreground border-0"
              : "bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border",
          )}
          asChild
        >
          <a
            href={isPreviewMode ? buttonLink : "#"}
            onClick={(e) => handleLinkClick(e, buttonLink)}
          >
            {buttonText}
          </a>
        </Button>
      </div>
    </div>
  );
}
