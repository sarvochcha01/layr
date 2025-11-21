import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Feature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  title?: string;
  price?: string;
  period?: string;
  description?: string;
  features?: (string | Feature)[]; // Allow both string[] and Feature[]
  buttonText?: string;
  buttonLink?: string;
  featured?: boolean;
  backgroundColor?: string;
  textColor?: string;
  width?: string;
  height?: string;
}

export function PricingCard({
  title = "Basic Plan",
  price = "$29",
  period = "month",
  description = "Perfect for individuals",
  features = [
    { text: "Feature 1", included: true },
    { text: "Feature 2", included: true },
    { text: "Feature 3", included: false },
  ],
  buttonText = "Get Started",
  buttonLink = "#",
  featured = false,
  backgroundColor,
  textColor,
  width,
  height,
}: PricingCardProps) {
  // Normalize features to handle both string[] and Feature[] formats
  const normalizedFeatures = features.map((feature) => {
    if (typeof feature === "string") {
      return { text: feature, included: true };
    }
    return feature;
  });
  return (
    <div
      className={cn(
        "p-8 rounded-lg border-2 flex flex-col",
        featured ? "border-blue-500 shadow-xl" : "border-gray-200 shadow-md"
      )}
      style={{
        width: width || "320px",
        minWidth: "280px",
        maxWidth: "400px",
        backgroundColor: backgroundColor || "#ffffff",
        color: textColor || undefined,
      }}
    >
      {featured && (
        <div className="text-center mb-4">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <div className="mb-2">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-gray-600">/{period}</span>
        </div>
        <p className="text-sm opacity-75">{description}</p>
      </div>

      <ul className="space-y-3 mb-6 flex-grow">
        {normalizedFeatures.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            {feature.included ? (
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : (
              <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
            )}
            <span className={cn(!feature.included && "opacity-50")}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <Button
          className="w-full"
          variant={featured ? "default" : "outline"}
          asChild
        >
          <a href={buttonLink}>{buttonText}</a>
        </Button>
      </div>
    </div>
  );
}
