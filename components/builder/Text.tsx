import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";
import { loadGoogleFont, getFontFamilyValue } from "@/lib/fonts";

interface TextProps {
  children?: React.ReactNode;
  content?: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  size?:
    | "xs"
    | "sm"
    | "base"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl";
  weight?: "light" | "normal" | "medium" | "semibold" | "bold" | "extrabold";
  color?: string;
  align?: "left" | "center" | "right" | "justify";
  className?: string;
  width?: string;
  height?: string;
  themeStyle?: ThemeStyleVariant;
  isPreviewMode?: boolean;
  [key: string]: any;
}

export function Text({
  children,
  content,
  tag = "p",
  size = "base",
  weight = "normal",
  color,
  align = "left",
  className,
  width,
  height,
  themeStyle,
  isPreviewMode,
  ...rest
}: TextProps) {
  const Component = tag;

  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
    "5xl": "text-5xl",
    "6xl": "text-6xl",
  };

  const weightClasses = {
    light: "font-light",
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
    extrabold: "font-extrabold",
  };

  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
    justify: "text-justify",
  };

  const baseStyle = buildComponentStyle({
    textColor: color,
    width,
    height,
    ...rest,
  });
  const effectiveTheme = useEffectiveThemeStyle(
    themeStyle,
    themeStyle !== undefined,
  );
  const cssVars = getThemeCSSVars(effectiveTheme);

  // Per-component font override
  const fontOverride = rest.fontFamily_override;
  if (fontOverride && typeof window !== "undefined") {
    loadGoogleFont(fontOverride);
  }

  return (
    <Component
      className={cn(
        sizeClasses[size],
        weightClasses[weight],
        alignClasses[align],
        className,
      )}
      style={{
        ...cssVars,
        backgroundColor: rest.backgroundColor || "var(--theme-bg)",
        ...baseStyle, // Apply baseStyle AFTER theme vars so user preferences override
        ...(fontOverride
          ? { fontFamily: getFontFamilyValue(fontOverride) }
          : {}),
        // Ensure full width in edit mode for better clickability
        width: !isPreviewMode && !width ? "100%" : baseStyle.width,
        display: !isPreviewMode ? "block" : baseStyle.display,
        minHeight: !isPreviewMode ? "1.5em" : undefined,
      }}
    >
      {children || content}
    </Component>
  );
}
