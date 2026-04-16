import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";

import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";

interface ContainerProps {
  children?: React.ReactNode;
  className?: string;
  maxWidth?:
  | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  margin?: "none" | "sm" | "md" | "lg" | "xl" | "auto";
  backgroundColor?: string;
  backgroundType?: "solid" | "gradient" | "image";
  gradientStart?: string;
  gradientEnd?: string;
  gradientDirection?: string;
  gradientAngle?: string;
  textColor?: string;
  tag?: "div" | "main" | "section" | "article" | "aside" | "header" | "footer";
  width?: string;
  height?: string;
  display?: "flex" | "block";
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
  flexWrap?: "nowrap" | "wrap" | "wrap-reverse";
  justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly";
  alignItems?: "start" | "center" | "end" | "stretch" | "baseline";
  gap?: "none" | "sm" | "md" | "lg" | "xl";
  overflowX?: "visible" | "hidden" | "scroll" | "auto";
  overflowY?: "visible" | "hidden" | "scroll" | "auto";
  themeStyle?: ThemeStyleVariant;
  [key: string]: any;
}

export function Container({
  children,
  className,
  maxWidth = "xl",
  padding = "md",
  margin = "auto",
  backgroundColor,
  backgroundType,
  gradientStart,
  gradientEnd,
  gradientDirection,
  gradientAngle,
  textColor,
  tag = "div",
  width,
  height,
  display = "flex",
  flexDirection = "column",
  flexWrap = "nowrap",
  justifyContent = "start",
  alignItems = "start",
  gap = "none",
  overflowX = "visible",
  overflowY = "visible",
  themeStyle,
  ...rest
}: ContainerProps) {
  const effectiveTheme = useEffectiveThemeStyle(themeStyle, themeStyle !== undefined);
  const cssVars = getThemeCSSVars(effectiveTheme);

  const Component = tag;

  const maxWidthClasses: Record<string, string> = {
    sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl",
    "2xl": "max-w-2xl", "3xl": "max-w-3xl", "4xl": "max-w-4xl",
    "5xl": "max-w-5xl", "6xl": "max-w-6xl", "7xl": "max-w-7xl", full: "max-w-full",
  };

  const paddingClasses: Record<string, string> = {
    none: "", sm: "p-4", md: "p-6", lg: "p-8", xl: "p-12",
  };

  const marginClasses: Record<string, string> = {
    none: "", sm: "m-2", md: "m-4", lg: "m-6", xl: "m-8", auto: "mx-auto",
  };

  const flexDirectionClasses: Record<string, string> = {
    row: "flex-row", column: "flex-col", "row-reverse": "flex-row-reverse", "column-reverse": "flex-col-reverse",
  };

  const flexWrapClasses: Record<string, string> = {
    nowrap: "flex-nowrap", wrap: "flex-wrap", "wrap-reverse": "flex-wrap-reverse",
  };

  const justifyContentClasses: Record<string, string> = {
    start: "justify-start", center: "justify-center", end: "justify-end",
    between: "justify-between", around: "justify-around", evenly: "justify-evenly",
  };

  const alignItemsClasses: Record<string, string> = {
    start: "items-start", center: "items-center", end: "items-end",
    stretch: "items-stretch", baseline: "items-baseline",
  };

  const gapClasses: Record<string, string> = {
    none: "", sm: "gap-2", md: "gap-4", lg: "gap-6", xl: "gap-8",
  };

  const overflowXClasses: Record<string, string> = {
    visible: "overflow-x-visible", hidden: "overflow-x-hidden",
    scroll: "overflow-x-scroll", auto: "overflow-x-auto",
  };

  const overflowYClasses: Record<string, string> = {
    visible: "overflow-y-visible", hidden: "overflow-y-hidden",
    scroll: "overflow-y-scroll", auto: "overflow-y-auto",
  };

  const baseStyle: React.CSSProperties = {
    ...cssVars,
    ...(width || display === "flex" ? { width: width || "100%" } : {}),
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
    <Component
      className={cn(
        display !== "flex" && maxWidthClasses[maxWidth],
        paddingClasses[padding],
        display !== "flex" && marginClasses[margin],
        display === "flex" && "flex",
        display === "flex" && flexDirectionClasses[flexDirection],
        display === "flex" && flexWrapClasses[flexWrap],
        display === "flex" && justifyContentClasses[justifyContent],
        display === "flex" && alignItemsClasses[alignItems],
        display === "flex" && gapClasses[gap],
        overflowXClasses[overflowX],
        overflowYClasses[overflowY],
        className
      )}
      style={{ ...baseStyle, ...cssVars }}
    >
      {children}
    </Component>
  );
}
