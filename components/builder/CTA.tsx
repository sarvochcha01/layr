import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CTAProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  alignment?: "left" | "center" | "right";
  size?: "sm" | "md" | "lg";
  backgroundColor?: string;
  textColor?: string;
  width?: string;
  height?: string;
}

export function CTA({
  title = "Ready to get started?",
  description = "Join thousands of satisfied customers today",
  primaryButtonText = "Get Started",
  primaryButtonLink = "#",
  secondaryButtonText,
  secondaryButtonLink = "#",
  alignment = "center",
  size = "md",
  backgroundColor = "#3b82f6",
  textColor = "#ffffff",
  width,
  height,
}: CTAProps) {
  const sizeClasses = {
    sm: "py-8 px-6",
    md: "py-12 px-8",
    lg: "py-16 px-12",
  };

  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  return (
    <div
      className={cn(
        "rounded-lg flex flex-col gap-6",
        sizeClasses[size],
        alignmentClasses[alignment]
      )}
      style={{
        width: width || undefined,
        height: height || undefined,
        backgroundColor,
        color: textColor,
      }}
    >
      <div>
        <h2 className="text-3xl font-bold mb-3">{title}</h2>
        <p className="text-lg opacity-90">{description}</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <Button size="lg" variant="secondary" asChild>
          <a href={primaryButtonLink}>{primaryButtonText}</a>
        </Button>
        {secondaryButtonText && (
          <Button size="lg" variant="outline" asChild>
            <a href={secondaryButtonLink}>{secondaryButtonText}</a>
          </Button>
        )}
      </div>
    </div>
  );
}
