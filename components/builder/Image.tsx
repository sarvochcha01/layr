import { cn } from "@/lib/utils";

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
}

export function Image({
  src = "https://placehold.co/400x200/e5e7eb/6b7280?text=Image",
  alt = "",
  width,
  height,
  className,
  rounded = "md",
  objectFit = "cover",
  loading = "lazy",
  link,
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

  const imageElement = (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      className={cn(
        "max-w-full h-auto",
        roundedClasses[rounded],
        objectFitClasses[objectFit],
        className
      )}
      style={{
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
      }}
    />
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
