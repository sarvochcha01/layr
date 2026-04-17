import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";

interface GridProps {
  children?: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: "none" | "sm" | "md" | "lg" | "xl" | "custom";
  gapCustom?: string;
  className?: string;
  responsive?: boolean;
  equalHeight?: boolean;
  width?: string;
  height?: string;
  backgroundColor?: string;
  textColor?: string;
  themeStyle?: ThemeStyleVariant;
  [key: string]: any;
}

export function Grid({
  children,
  columns = 3,
  gap = "md",
  gapCustom,
  className,
  responsive = true,
  equalHeight = false,
  width,
  height,
  backgroundColor,
  textColor,
  themeStyle,
  ...rest
}: GridProps) {
  const gapClasses: Record<string, string> = {
    none: "gap-0",
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
    xl: "gap-12",
  };

  const columnClasses = {
    1: "grid-cols-1",
    2: responsive ? "grid-cols-1 md:grid-cols-2" : "grid-cols-2",
    3: responsive ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-3",
    4: responsive ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-4",
    5: responsive ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-5" : "grid-cols-5",
    6: responsive ? "grid-cols-1 md:grid-cols-3 lg:grid-cols-6" : "grid-cols-6",
  };

  const baseStyle = buildComponentStyle({ backgroundColor, textColor, width, height, ...rest });
  const effectiveTheme = useEffectiveThemeStyle(themeStyle, themeStyle !== undefined);
  const cssVars = getThemeCSSVars(effectiveTheme);


  // Apply custom gap as inline style when gap is "custom"
  const gridStyle = { ...baseStyle };
  if (gap === "custom" && gapCustom) {
    gridStyle.gap = gapCustom;
  }

  // Equal height: make all children stretch to match the tallest
  if (equalHeight) {
    gridStyle.alignItems = "stretch";
  }

  return (
    <div
      className={cn(
        "w-full grid",
        columnClasses[columns],
        gap !== "custom" ? gapClasses[gap] || gapClasses.md : undefined,
        className,
      )}
      style={{ ...gridStyle, ...cssVars }}
    >
      {children}
    </div>
  );
}
