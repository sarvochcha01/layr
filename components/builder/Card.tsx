import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";

interface CardProps {
  title?: string;
  description?: string;
  image?: string;
  icon?: string;
  buttonText?: string;
  buttonLink?: string;
  variant?: "default" | "bordered" | "shadow" | "elevated";
  className?: string;
  width?: string;
  height?: string;
  backgroundColor?: string;
  textColor?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export function Card({
  title = "Card Title",
  description = "A short description of this card's content goes here.",
  image,
  icon,
  buttonText,
  buttonLink = "#",
  variant = "default",
  className,
  width,
  height,
  backgroundColor,
  textColor,
  children,
  ...rest
}: CardProps) {
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
        "rounded-2xl p-6 min-w-0 overflow-hidden transition-all duration-300",
        "border border-gray-100",
        "shadow-[0_1px_3px_rgba(0,0,0,0.04),0_6px_24px_rgba(0,0,0,0.06)]",
        "hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_12px_40px_rgba(0,0,0,0.1)]",
        "hover:-translate-y-1",
        className
      )}
      style={baseStyle}
    >
      {/* Image */}
      {image && (
        <div className="-mx-6 -mt-6 mb-5">
          <img
            src={image}
            alt={title || "Card image"}
            className="w-full h-52 object-cover"
          />
        </div>
      )}

      {/* Icon */}
      {icon && !image && (
        <div className="mb-5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: "rgba(99, 102, 241, 0.1)", color: "#6366f1" }}
          >
            {icon}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-3 min-w-0">
        {title && (
          <h3
            className="text-lg font-semibold break-words leading-snug tracking-tight"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {title}
          </h3>
        )}

        {description && (
          <p className="text-sm leading-relaxed break-words opacity-60">
            {description}
          </p>
        )}

        {buttonText && (
          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="px-0 font-medium hover:bg-transparent"
              style={{ color: "#6366f1" }}
              asChild
            >
              <a href={buttonLink} className="inline-flex items-center gap-1.5">
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
