import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";

interface HeroProps {
  title?: string;
  subtitle?: string;
  badge?: string;
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
  showScrollIndicator?: boolean;
  isPreviewMode?: boolean;
  className?: string;
  width?: string;
  height?: string;
  [key: string]: any;
}

export function Hero({
  title = "ENGINEER THE FUTURE OF DIGITAL SPACE.",
  subtitle,
  badge = "ENGINE VERSION 4.2.0 ACTIVE",
  description = "Obsidian Architect is the high-performance visual builder designed for technical precision. Construct immersive interfaces with the speed of code and the intuition of art.",
  primaryButtonText = "START BUILDING",
  primaryButtonLink = "#",
  secondaryButtonText = "VIEW DOCUMENTATION",
  secondaryButtonLink = "#",
  backgroundImage = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fHdlYnNpdGUlMjBiYWNrZ3JvdW5kfGVufDB8fDB8fHww",
  backgroundColor = "#0d0d0d",
  textColor = "#ffffff",
  alignment = "center",
  size = "xl",
  showScrollIndicator = true,
  isPreviewMode = false,
  className,
  width,
  height,
  ...rest
}: HeroProps) {
  const sizeClasses = {
    sm: "py-20 sm:py-24 px-4",
    md: "py-28 sm:py-36 px-4 sm:px-6",
    lg: "py-36 sm:py-44 px-4 sm:px-8",
    xl: "py-44 sm:py-56 px-4 sm:px-12",
  };

  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const baseStyle = buildComponentStyle({
    backgroundColor,
    textColor,
    width,
    height,
    ...rest,
  });

  if (backgroundImage) {
    baseStyle.backgroundImage = `url(${backgroundImage})`;
    baseStyle.backgroundSize = "cover";
    baseStyle.backgroundPosition = "center";
  }

  const titleParts = title.split("FUTURE");
  const hasHighlight = titleParts.length > 1;

  return (
    <section
      className={cn(
        "relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden",
        sizeClasses[size],
        alignmentClasses[alignment],
        className,
      )}
      style={baseStyle}
    >
      {/* Animated grid background */}
      {!backgroundImage && (
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(99,102,241,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(99,102,241,0.1) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
              animation: "grid-flow 20s linear infinite",
            }}
          />
        </div>
      )}

      {/* Gradient orbs — now with slow breathing animation */}
      {!backgroundImage && (
        <>
          <div
            className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, #6366f1 0%, transparent 70%)",
              animation: "orb-breathe 8s ease-in-out infinite",
              opacity: 0.3,
            }}
          />
          <div
            className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
              animation: "orb-breathe 10s ease-in-out infinite 2s",
              opacity: 0.2,
            }}
          />
        </>
      )}

      {/* Keyframes injected inline */}
      <style>{`
        @keyframes orb-breathe {
          0%, 100% { transform: scale(1) translate(0, 0); }
          33% { transform: scale(1.08) translate(12px, -8px); }
          66% { transform: scale(0.95) translate(-8px, 10px); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes grid-flow {
          from { background-position: 0 0; }
          to   { background-position: 50px 50px; }
        }
        .hero-badge   { animation: fade-up 0.5s ease both 0.1s; }
        .hero-title   { animation: fade-up 0.6s ease both 0.25s; }
        .hero-desc    { animation: fade-up 0.6s ease both 0.4s; }
        .hero-ctas    { animation: fade-up 0.6s ease both 0.55s; }
        .hero-tech    { animation: fade-up 0.6s ease both 0.7s; }
      `}</style>

      <div className="relative z-10 max-w-5xl mx-auto px-4">
        {/* Badge */}
        {badge && (
          <div
            className={cn(
              "mb-8 hero-badge",
              alignment === "center"
                ? "flex justify-center"
                : alignment === "right"
                  ? "flex justify-end"
                  : "",
            )}
          >
            <span
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-border bg-card"
              style={{ color: "#a5b4fc" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              {badge}
            </span>
          </div>
        )}

        {/* Title */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-[1.1] tracking-tight hero-title"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {hasHighlight ? (
            <>
              {titleParts[0]}
              <span
                className="inline-block"
                style={{
                  background:
                    "linear-gradient(135deg, #a5b4fc 0%, #c4b5fd 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                FUTURE
              </span>
              {titleParts[1]}
            </>
          ) : (
            title
          )}
        </h1>

        {/* Description */}
        <p
          className="text-base sm:text-lg mb-12 leading-relaxed max-w-2xl text-muted-foreground hero-desc"
          style={
            alignment === "center"
              ? { marginLeft: "auto", marginRight: "auto" }
              : {}
          }
        >
          {description}
        </p>

        {/* CTA Buttons */}
        <div
          className={cn(
            "flex flex-col sm:flex-row gap-4 hero-ctas",
            alignment === "center"
              ? "justify-center items-center"
              : alignment === "right"
                ? "justify-end items-center"
                : "items-start",
          )}
        >
          {primaryButtonText && (
            <div style={isPreviewMode ? undefined : { pointerEvents: "none" }}>
              <Button
                size="lg"
                className="group w-full sm:w-auto px-8 py-3 text-sm font-bold tracking-wider rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground border-0 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                asChild
              >
                <a
                  href={isPreviewMode ? primaryButtonLink : "#"}
                  onClick={(e) => handleLinkClick(e, primaryButtonLink)}
                >
                  {primaryButtonText}
                  <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </a>
              </Button>
            </div>
          )}

          {secondaryButtonText && (
            <div style={isPreviewMode ? undefined : { pointerEvents: "none" }}>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 py-3 text-sm font-bold tracking-wider rounded-xl border-border bg-card hover:bg-muted text-foreground transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                asChild
              >
                <a
                  href={isPreviewMode ? secondaryButtonLink : "#"}
                  onClick={(e) => handleLinkClick(e, secondaryButtonLink)}
                >
                  {secondaryButtonText}
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      {showScrollIndicator && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
          <span>SCROLL TO EXPLORE</span>
          <div className="w-px h-12 bg-gradient-to-b from-muted-foreground to-transparent animate-pulse" />
        </div>
      )}
    </section>
  );
}
