import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";

interface HeaderProps {
  children?: React.ReactNode;
  className?: string;
  backgroundColor?: string;
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
  padding = "1rem 2rem",
  sticky = false,
  shadow = true,
  width,
  height,
  themeStyle,
  ...rest
}: HeaderProps) {
  const baseStyle = buildComponentStyle({
    backgroundColor,
    width,
    height,
    ...rest,
  });
  const effectiveTheme = useEffectiveThemeStyle(themeStyle, !!themeStyle);
  const cssVars = getThemeCSSVars(effectiveTheme);

  // Header uses its own padding prop (string CSS value), not the shared enum
  baseStyle.padding = padding;

  return (
    <header
      className={cn(
        "w-full border-b border-border",
        sticky && "sticky top-0 z-50",
        shadow && "shadow-sm shadow-black/20",
        className,
      )}
      style={{ ...baseStyle, ...cssVars }}
    >
      {children}
    </header>
  );
}
