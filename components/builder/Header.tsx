import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";

interface HeaderProps {
  children?: React.ReactNode;
  className?: string;
  backgroundColor?: string;
  backgroundType?: "solid" | "gradient" | "image";
  gradientStart?: string;
  gradientEnd?: string;
  gradientDirection?: string;
  gradientAngle?: string;
  padding?: string;
  sticky?: boolean;
  shadow?: boolean;
  width?: string;
  height?: string;
  themeStyle?: ThemeStyleVariant;
  [key: string]: any;
}

export function Header({
  children,
  className,
  backgroundColor = "#0d0d0d",
  backgroundType,
  gradientStart,
  gradientEnd,
  gradientDirection,
  gradientAngle,
  padding = "1rem 2rem",
  sticky = false,
  shadow = true,
  width,
  height,
  themeStyle,
  ...rest
}: HeaderProps) {
  const effectiveTheme = useEffectiveThemeStyle(themeStyle, themeStyle !== undefined);
  const cssVars = getThemeCSSVars(effectiveTheme);

  const baseStyle: React.CSSProperties = {
    ...cssVars,
    padding,
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

  return (
    <header
      className={cn(
        "w-full border-b border-border",
        sticky && "sticky top-0 z-50",
        shadow && "shadow-sm shadow-black/20",
        className,
      )}
      style={baseStyle}
    >
      {children}
    </header>
  );
}
