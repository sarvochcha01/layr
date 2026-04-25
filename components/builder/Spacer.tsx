import { buildComponentStyle } from "@/lib/buildStyle";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";
import { cn } from "@/lib/utils";

interface SpacerProps {
  height?: string;
  width?: string;
  themeStyle?: ThemeStyleVariant;
  isPreviewMode?: boolean;
  [key: string]: any;
}

export function Spacer({ height = "2rem", width = "100%", themeStyle, isPreviewMode, ...rest }: SpacerProps) {
  const baseStyle = buildComponentStyle({ height, width, ...rest });
  const effectiveTheme = useEffectiveThemeStyle(themeStyle, themeStyle !== undefined);
  const cssVars = getThemeCSSVars(effectiveTheme);

  return (
    <div 
      style={{ 
        ...baseStyle, 
        ...cssVars,
        // Ensure full width in edit mode for clickability
        width: !isPreviewMode ? "100%" : (baseStyle.width || width),
        display: "block",
      }} 
      className={cn(
        // Show visual indicator in edit mode
        !isPreviewMode && "relative",
        !isPreviewMode && "after:content-['Spacer'] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:text-xs after:text-gray-400 after:pointer-events-none after:opacity-60"
      )}
    />
  );
}
