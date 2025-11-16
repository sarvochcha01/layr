import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
}

export function Card({
  title,
  description,
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
}: CardProps) {
  const variantClasses = {
    default: !backgroundColor && "bg-white",
    bordered: !backgroundColor && "bg-white border border-gray-200",
    shadow: !backgroundColor && "bg-white shadow-md",
    elevated:
      !backgroundColor &&
      "bg-white shadow-lg hover:shadow-xl transition-shadow",
  };

  return (
    <div
      className={cn(
        "rounded-lg p-6 flex-shrink-0",
        variantClasses[variant],
        className
      )}
      style={{
        width: width || "250px",
        height: height || undefined,
        backgroundColor: backgroundColor || undefined,
        color: textColor || undefined,
      }}
    >
      {/* Image */}
      {image && (
        <div className="mb-4">
          <img
            src={image}
            alt={title || "Card image"}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Icon */}
      {icon && !image && (
        <div className="mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl">
            {icon}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-3">
        {title && (
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        )}

        {description && (
          <p className="text-gray-600 leading-relaxed">{description}</p>
        )}

        {buttonText && (
          <Button variant="outline" asChild>
            <a href={buttonLink}>{buttonText}</a>
          </Button>
        )}
      </div>
    </div>
  );
}
