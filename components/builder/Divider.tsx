import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";

interface DividerProps {
  text?: string;
  variant?: "solid" | "dashed" | "dotted";
  thickness?: "thin" | "medium" | "thick";
  color?: string;
  width?: string;
  spacing?: "sm" | "md" | "lg";
  themeStyle?: ThemeStyleVariant;
  [key: string]: any;
}

export function Divider({
  text,
  variant = "solid",
  thickness = "thin",
  color = "#2a2a2a",
  width,
  spacing = "md",
  themeStyle,
  ...rest
}: DividerProps) {
  const thicknessMap = {
    thin: "1px",
    medium: "2px",
    thick: "4px",
  };

  const spacingMap = {
    sm: "my-4",
    md: "my-8",
    lg: "my-12",
  };

  const borderStyle = {
    solid: "solid",
    dashed: "dashed",
    dotted: "dotted",
  };

  const baseStyle = buildComponentStyle({ width, ...rest });
  const effectiveTheme = useEffectiveThemeStyle(themeStyle, themeStyle !== undefined);
  const cssVars = getThemeCSSVars(effectiveTheme);


  if (text) {
    return (
      <div
        className={cn(
        "flex items-center gap-4", spacingMap[spacing])}
        style={{ ...baseStyle, ...cssVars }}
      >
        <div
          className="flex-1"
          style={{
            height: thicknessMap[thickness],
            backgroundColor: color,
            borderStyle: borderStyle[variant],
          }}
        />
        <span className="text-sm text-muted-foreground px-2">{text}</span>
        <div
          className="flex-1"
          style={{
            height: thicknessMap[thickness],
            backgroundColor: color,
            borderStyle: borderStyle[variant],
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={spacingMap[spacing]}
      style={{
        ...baseStyle,
        width: width || "100%",
        height: thicknessMap[thickness],
        backgroundColor: color,
        borderStyle: borderStyle[variant],
      }}
    />
  );
}
