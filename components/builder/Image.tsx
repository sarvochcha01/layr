import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";

interface ImageProps {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  loading?: "lazy" | "eager";
  link?: string;
  [key: string]: any;
}

export function Image({
  src = "https://placehold.co/400x200/1a1a1a/6b7280?text=Image",
  alt = "",
  width,
  height,
  className,
  rounded = "md",
  objectFit = "cover",
  loading = "lazy",
  link,
  ...rest
}: ImageProps) {
  const roundedClasses = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  const objectFitClasses = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
    none: "object-none",
    "scale-down": "object-scale-down",
  };

  // Build the container style with explicit dimensions
  const baseStyle = buildComponentStyle(rest);
  
  // Set explicit width and height on the container
  if (width) {
    baseStyle.width = typeof width === 'number' ? `${width}px` : width;
  } else if (!rest.width) {
    baseStyle.width = '100%'; // Default to full width if not specified
  }
  
  if (height) {
    baseStyle.height = typeof height === 'number' ? `${height}px` : height;
  } else if (!rest.height) {
    baseStyle.height = '300px'; // Default height to prevent overflow
  }

  const imageElement = (
    <div 
      style={baseStyle} 
      className={cn(
        "overflow-hidden relative block",
        roundedClasses[rounded],
        className
      )}
    >
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={cn(
          "w-full h-full block",
          objectFitClasses[objectFit],
          "w-full h-full",
          roundedClasses[rounded],
          objectFitClasses[objectFit],
        )}
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
    </div>
  );

  if (link) {
    return (
      <a href={link} className="inline-block">
        {imageElement}
      </a>
    );
  }

  return imageElement;
}
