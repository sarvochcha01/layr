import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";

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
  themeStyle?: ThemeStyleVariant;
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
  themeStyle,
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

  // Build the container style (width/height handled by ResizableWrapper)
  const baseStyle = buildComponentStyle(rest);
  const effectiveTheme = useEffectiveThemeStyle(themeStyle, !!themeStyle);
  const cssVars = getThemeCSSVars(effectiveTheme);


  const imageElement = (
    <div 
      style={{ ...baseStyle, ...cssVars }} 
      className={cn(
        "relative block w-full h-full overflow-hidden",
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
          objectFitClasses[objectFit]
        )}
      />
    </div>
  );

  if (link) {
    return (
      <a href={link} className="inline-block w-full h-full">
        {imageElement}
      </a>
    );
  }

  return imageElement;
}
