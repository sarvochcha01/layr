import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";

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
  [key: string]: any;
}

export function Hero({
  title = "Build something amazing today",
  subtitle = "INTRODUCING LAYR",
  description = "Create stunning websites in minutes with our intuitive drag-and-drop builder. No coding required — just pure creative freedom.",
  primaryButtonText = "Get Started Free",
  primaryButtonLink = "#",
  secondaryButtonText = "See How It Works",
  secondaryButtonLink = "#",
  backgroundImage,
  backgroundColor,
  textColor,
  alignment = "center",
  size = "lg",
  className,
  width,
  height,
  ...rest
}: HeroProps) {
  const sizeClasses = {
    sm: "py-16 sm:py-20 px-4",
    md: "py-20 sm:py-28 px-4 sm:px-6",
    lg: "py-24 sm:py-36 px-4 sm:px-8",
    xl: "py-32 sm:py-44 px-4 sm:px-12",
  };

  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const baseStyle = buildComponentStyle({
    backgroundColor: backgroundColor || "#0f172a",
    textColor: textColor || "#f8fafc",
    width,
    height,
    ...rest,
  });

  if (backgroundImage) {
    baseStyle.backgroundImage = `url(${backgroundImage})`;
    baseStyle.backgroundSize = "cover";
    baseStyle.backgroundPosition = "center";
    baseStyle.backgroundColor = undefined;
  }

  return (
    <section
      className={cn(
        "relative flex items-center justify-center min-h-[560px] w-full overflow-hidden",
        sizeClasses[size],
        alignmentClasses[alignment],
        className
      )}
      style={baseStyle}
    >
      {/* Decorative gradient orbs */}
      {!backgroundImage && (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }} />
        </>
      )}

      {backgroundImage && (
        <div className="absolute inset-0 bg-black/50" />
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {subtitle && (
          <div className={cn("mb-6", alignment === "center" ? "flex justify-center" : alignment === "right" ? "flex justify-end" : "")}>
            <span
              className="inline-block text-xs font-semibold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border"
              style={{
                color: "#a5b4fc",
                borderColor: "rgba(165, 180, 252, 0.3)",
                backgroundColor: "rgba(99, 102, 241, 0.1)",
              }}
            >
              {subtitle}
            </span>
          </div>
        )}

        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {title}
        </h1>

        <p
          className="text-lg sm:text-xl mb-10 leading-relaxed max-w-2xl opacity-80"
          style={{
            ...(alignment === "center" ? { marginLeft: "auto", marginRight: "auto" } : {}),
          }}
        >
          {description}
        </p>

        <div className={cn(
          "flex flex-col sm:flex-row gap-4",
          alignment === "center" ? "justify-center items-center" : alignment === "right" ? "justify-end items-center" : "items-start"
        )}>
          <Button
            size="lg"
            className="w-full sm:w-auto px-8 py-3 text-base font-medium rounded-full shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300"
            style={{ backgroundColor: "#6366f1", color: "#ffffff" }}
            asChild
          >
            <a href={primaryButtonLink}>{primaryButtonText}</a>
          </Button>

          {secondaryButtonText && (
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-8 py-3 text-base font-medium rounded-full border-white/20 hover:bg-white/10 transition-all duration-300"
              style={{ color: textColor || "#f8fafc" }}
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
