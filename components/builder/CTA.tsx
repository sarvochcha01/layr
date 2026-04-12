import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";

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
  [key: string]: any;
}

export function CTA({
  title = "Ready to get started?",
  description = "Join thousands of teams who are already building faster with our platform.",
  primaryButtonText = "Start Free Trial",
  primaryButtonLink = "#",
  secondaryButtonText,
  secondaryButtonLink = "#",
  alignment = "center",
  size = "md",
  backgroundColor,
  textColor,
  width,
  height,
  ...rest
}: CTAProps) {
  const sizeClasses = {
    sm: "py-12 px-6",
    md: "py-16 px-8",
    lg: "py-24 px-12",
  };

  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  const baseStyle = buildComponentStyle({
    textColor: textColor || "#ffffff",
    width,
    height,
    ...rest,
  });

  // Apply dark gradient background if no custom backgroundColor
  if (!backgroundColor) {
    baseStyle.background = "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)";
    baseStyle.border = "1px solid #3a3a3a";
  } else {
    baseStyle.backgroundColor = backgroundColor;
  }

  return (
    <div
      className={cn(
        "rounded-2xl flex flex-col gap-8 relative overflow-hidden",
        sizeClasses[size],
        alignmentClasses[alignment],
      )}
      style={baseStyle}
    >
      {/* Decorative pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(59,130,246,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(59,130,246,0.2) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10">
        <h2
          className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {title}
        </h2>
        <p
          className="text-lg text-gray-400 max-w-xl"
          style={
            alignment === "center"
              ? { marginLeft: "auto", marginRight: "auto" }
              : undefined
          }
        >
          {description}
        </p>
      </div>

      <div className="relative z-10 flex gap-4 flex-wrap">
        <Button
          size="lg"
          className="px-8 py-3 text-base font-medium rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300"
          asChild
        >
          <a href={primaryButtonLink}>{primaryButtonText}</a>
        </Button>
        {secondaryButtonText && (
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-3 text-base font-medium rounded-xl border-[#3a3a3a] hover:bg-[#2a2a2a] text-white transition-all duration-300"
            asChild
          >
            <a href={secondaryButtonLink}>{secondaryButtonText}</a>
          </Button>
        )}
      </div>
    </div>
  );
}
