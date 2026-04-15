import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";

interface CardProps {
  title?: string;
  description?: string;
  image?: string;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  buttonText?: string;
  buttonLink?: string;
  variant?: "default" | "bordered" | "shadow" | "elevated";
  className?: string;
  width?: string;
  height?: string;
  backgroundColor?: string;
  textColor?: string;
  isPreviewMode?: boolean;
  onNavigate?: (slug: string) => void;
  pages?: any[];
  children?: React.ReactNode;
  [key: string]: any;
}

export function Card({
  title = "Card Title",
  description = "A short description of this card's content goes here.",
  image = "https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=100&fit=crop",
  icon,
  buttonText,
  buttonLink = "#",
  variant = "default",
  className,
  width,
  height,
  backgroundColor = "#1a1a1a",
  textColor = "#ffffff",
  children,
  iconBg,
  iconColor,
  isPreviewMode = false,
  onNavigate,
  pages,
  ...rest
}: CardProps) {
  const baseStyle = buildComponentStyle({
    backgroundColor,
    textColor,
    width,
    height,
    ...rest,
  });

  /** Handle link clicks — prevent navigation in edit mode */
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
        "rounded-2xl p-6 min-w-0 transition-all duration-300 w-full h-full flex flex-col",
        "border border-border",
        "hover:border-border/80",
        "hover:-translate-y-0.5",
        "overflow-hidden",
        className,
      )}
      style={baseStyle}
    >
      {/* Image */}
      {image && (
        <div className="-mx-6 -mt-6 mb-5 flex-shrink-0 overflow-hidden">
          <img
            src={image}
            alt={title || "Card image"}
            className="w-full h-52 object-cover"
          />
        </div>
      )}

      {/* Icon — show when there's no image */}
      {icon && !image && (
        <div className="mb-5 flex-shrink-0">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold backdrop-blur-sm"
            style={{ backgroundColor: iconBg, color: iconColor }}
          >
            {icon || "•"}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-3 min-w-0 flex-1 overflow-hidden">
        {title && (
          <h3
            className="text-xl font-semibold break-words leading-tight tracking-tight line-clamp-2"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {title}
          </h3>
        )}

        {description && (
          <p className="text-sm leading-relaxed break-words line-clamp-3" style={{ opacity: 0.7 }}>
            {description}
          </p>
        )}

        {buttonText && (
          <div className="pt-2" style={isPreviewMode ? undefined : { pointerEvents: "none" }}>
            <Button
              variant="ghost"
              size="sm"
              className="px-0 font-medium hover:bg-transparent text-primary hover:text-primary/80"
              asChild
            >
              <a
                href={isPreviewMode ? buttonLink : "#"}
                className="inline-flex items-center gap-1.5"
                onClick={(e) => handleLinkClick(e, buttonLink)}
              >
                {buttonText}
                <span className="text-xs">→</span>
              </a>
            </Button>
          </div>
        )}
      </div>

      {children}
    </div>
  );
}
