import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";

import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";

interface SectionProps {
  children?: React.ReactNode;
  className?: string;
  backgroundColor?: string;
  backgroundType?: "solid" | "gradient" | "image";
  gradientStart?: string;
  gradientEnd?: string;
  gradientDirection?: string;
  gradientAngle?: string;
  textColor?: string;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  id?: string;
  width?: string;
  height?: string;
  [key: string]: any;
  themeStyle?: ThemeStyleVariant;
}

export function Section({
  children,
  className,
  backgroundColor,
  backgroundType,
  gradientStart,
  gradientEnd,
  gradientDirection,
  gradientAngle,
  textColor,
  padding = "lg",
  maxWidth = "xl",
  id,
  width,
  height,
  themeStyle,
  ...rest
}: SectionProps) {
  const paddingClasses = {
    none: "",
    sm: "py-8 px-4",
    md: "py-16 px-6",
    lg: "py-24 px-8",
    xl: "py-32 px-12",
  };

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    "2xl": "max-w-7xl",
    full: "max-w-full",
  };

  const effectiveTheme = useEffectiveThemeStyle(themeStyle, themeStyle !== undefined);
  const cssVars = getThemeCSSVars(effectiveTheme);

  const baseStyle: React.CSSProperties = {
    ...cssVars,
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
  };

  // Handle background based on type - user preferences MUST override theme
  if (backgroundType === "gradient" && gradientStart && gradientEnd) {
    const direction = gradientDirection === "custom"
      ? `${gradientAngle || "135"}deg`
      : gradientDirection || "to bottom right";
    baseStyle.backgroundImage = `linear-gradient(${direction}, ${gradientStart}, ${gradientEnd})`;
  } else if (backgroundColor) {
    baseStyle.background = backgroundColor;
  }

  // Text color override
  if (textColor) {
    baseStyle.color = textColor;
  }

  return (
    <section
      id={id}
      className={cn(
        "w-full",
        paddingClasses[padding],
        className
      )}
      style={{ ...baseStyle, ...cssVars }}
    >
      <div className={cn("mx-auto", maxWidthClasses[maxWidth])}>{children}</div>
    </section>
  );
}
