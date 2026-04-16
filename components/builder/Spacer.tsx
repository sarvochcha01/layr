import { buildComponentStyle } from "@/lib/buildStyle";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";

interface SpacerProps {
  height?: string;
  width?: string;
  themeStyle?: ThemeStyleVariant;
  [key: string]: any;
}

export function Spacer({ height = "2rem", width = "100%", themeStyle, ...rest }: SpacerProps) {
  const baseStyle = buildComponentStyle({ height, width, ...rest });
  const effectiveTheme = useEffectiveThemeStyle(themeStyle, themeStyle !== undefined);
  const cssVars = getThemeCSSVars(effectiveTheme);

  return <div style={{ ...baseStyle, ...cssVars }} />;
}
