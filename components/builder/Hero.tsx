import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  textColor?: string;
  alignment?: "left" | "center" | "right";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  width?: string;
  height?: string;
}

export function Hero({
  title = "Welcome to Our Website",
  subtitle,
  description = "Build amazing websites with our powerful tools",
  primaryButtonText = "Get Started",
  primaryButtonLink = "#",
  secondaryButtonText,
  secondaryButtonLink = "#",
  backgroundImage,
  backgroundColor = "#f8f9fa",
  textColor = "#1f2937",
  alignment = "center",
  size = "lg",
  className,
  width,
  height,
}: HeroProps) {
  const sizeClasses = {
    sm: "py-12 sm:py-16 px-4",
    md: "py-16 sm:py-24 px-4 sm:px-6",
    lg: "py-20 sm:py-32 px-4 sm:px-8",
    xl: "py-24 sm:py-40 px-4 sm:px-12",
  };

  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <section
      className={cn(
        "relative flex items-center justify-center min-h-[500px] w-full",
        sizeClasses[size],
        alignmentClasses[alignment],
        className
      )}
      style={{
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : undefined,
        backgroundColor: !backgroundImage ? backgroundColor : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: textColor,
        width: width || undefined,
        height: height || undefined,
      }}
    >
      {/* Overlay for background images */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {subtitle && (
          <p className="text-xs sm:text-sm font-medium uppercase tracking-wide mb-3 sm:mb-4 opacity-80">
            {subtitle}
          </p>
        )}

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
          {title}
        </h1>

        <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <a href={primaryButtonLink}>{primaryButtonText}</a>
          </Button>

          {secondaryButtonText && (
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              asChild
            >
              <a href={secondaryButtonLink}>{secondaryButtonText}</a>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
