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
  children?: React.ReactNode;
  [key: string]: any;
}

export function Card({
  title = "Instant Deploy",
  description = "Propagate your creative changes globally in under 300ms with our atomic edge network.",
  image,
  icon = "",
  iconBg = "rgba(99, 102, 241, 0.1)",
  iconColor = "#818cf8",
  buttonText,
  buttonLink = "#",
  variant = "default",
  className,
  width,
  height,
  backgroundColor = "#1a1a1a",
  textColor = "#ffffff",
  children,
  ...rest
}: CardProps) {
  const baseStyle = buildComponentStyle({
    backgroundColor,
    textColor,
    width,
    height,
    ...rest,
  });

  return (
    <div
      className={cn(
        "rounded-2xl p-6 min-w-0 overflow-hidden transition-all duration-300",
        "border border-[#2a2a2a]",
        "hover:border-[#3a3a3a]",
        "hover:-translate-y-0.5",
        className,
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
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold backdrop-blur-sm"
            style={{ backgroundColor: iconBg, color: iconColor }}
          >
            {icon || "•"}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-3 min-w-0">
        {title && (
          <h3
            className="text-xl font-semibold break-words leading-tight tracking-tight"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {title}
          </h3>
        )}

        {description && (
          <p className="text-sm leading-relaxed break-words text-gray-400">
            {description}
          </p>
        )}

        {buttonText && (
          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="px-0 font-medium hover:bg-transparent text-blue-400 hover:text-blue-300"
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
