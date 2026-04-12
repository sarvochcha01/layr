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
  featured?: boolean;
  backgroundColor?: string;
  textColor?: string;
  width?: string;
  height?: string;
  [key: string]: any;
}

export function PricingCard({
  title = "Pro Plan",
  price = "$49",
  period = "month",
  description = "Everything you need to scale",
  features = [
    { text: "Unlimited projects", included: true },
    { text: "Priority support", included: true },
    { text: "Advanced analytics", included: true },
    { text: "Custom integrations", included: false },
  ],
  buttonText = "Get Started",
  buttonLink = "#",
  featured = false,
  backgroundColor,
  textColor,
  width,
  height,
  ...rest
}: PricingCardProps) {
  const normalizedFeatures = features.map((feature) => {
    if (typeof feature === "string") {
      return { text: feature, included: true };
    }
    return feature;
  });

  const baseStyle = buildComponentStyle({
    backgroundColor: backgroundColor || "#ffffff",
    textColor: textColor || "#1e293b",
    width,
    height,
    ...rest,
  });

  return (
    <div
      className={cn(
        "p-8 rounded-2xl flex flex-col min-w-0 overflow-hidden transition-all duration-300",
        "border",
        featured
          ? "border-indigo-200 shadow-[0_4px_12px_rgba(99,102,241,0.15),0_20px_50px_rgba(99,102,241,0.1)] hover:shadow-[0_8px_24px_rgba(99,102,241,0.2),0_24px_60px_rgba(99,102,241,0.15)] scale-[1.02]"
          : "border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_6px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_12px_40px_rgba(0,0,0,0.1)]",
        "hover:-translate-y-1"
      )}
      style={baseStyle}
    >
      {featured && (
        <div className="text-center mb-5 -mt-2">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-wider px-4 py-1 rounded-full"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#ffffff",
            }}
          >
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-8">
        <h3
          className="text-xl font-semibold mb-4 tracking-tight"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {title}
        </h3>
        <div className="mb-2 flex items-baseline justify-center gap-1">
          <span className="text-5xl font-bold tracking-tight">{price}</span>
          <span className="text-sm opacity-40 font-medium">/{period}</span>
        </div>
        <p className="text-sm opacity-50">{description}</p>
      </div>

      <div className="border-t border-gray-100 pt-6 mb-8">
        <ul className="space-y-3 flex-grow">
          {normalizedFeatures.map((feature, index) => (
            <li key={index} className="flex items-center gap-3 text-sm">
              {feature.included ? (
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}>
                  <Check className="w-3 h-3 text-green-500" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100">
                  <X className="w-3 h-3 text-gray-300" />
                </div>
              )}
              <span className={cn("break-words min-w-0", !feature.included && "opacity-40")}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto">
        <Button
          className={cn(
            "w-full py-3 rounded-xl font-medium transition-all duration-300",
            featured
              ? "shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
              : ""
          )}
          variant={featured ? "default" : "outline"}
          style={featured ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", border: "none" } : undefined}
          asChild
        >
          <a href={buttonLink}>{buttonText}</a>
        </Button>
      </div>
    </div>
  );
}
