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

  const baseStyle = buildComponentStyle(rest);
  if (width) baseStyle.width = `${width}px`;
  if (height) baseStyle.height = `${height}px`;

  const imageElement = (
    <div style={baseStyle} className={className}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        className={cn(
          "w-full h-full",
          roundedClasses[rounded],
          objectFitClasses[objectFit],
        )}
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
