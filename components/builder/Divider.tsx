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
  isPreviewMode?: boolean;
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
  isPreviewMode,
  ...rest
}: DividerProps) {
  const thicknessMap = {
    thin: "1px",
    medium: "2px",
    thick: "4px",
  };

  const spacingMap = {
    sm: { paddingTop: "1rem", paddingBottom: "1rem" },
    md: { paddingTop: "2rem", paddingBottom: "2rem" },
    lg: { paddingTop: "3rem", paddingBottom: "3rem" },
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
    const lineStyle = variant === "solid" 
      ? {
          height: thicknessMap[thickness],
          backgroundColor: color,
        }
      : {
          height: "0px",
          borderTop: `${thicknessMap[thickness]} ${borderStyle[variant]} ${color}`,
        };

    return (
      <div
        className="flex items-center gap-4"
        style={{ 
          ...baseStyle, 
          ...cssVars,
          ...spacingMap[spacing],
        }}
      >
        <div
          className="flex-1"
          style={lineStyle}
        />
        <span className="text-sm text-muted-foreground px-2">{text}</span>
        <div
          className="flex-1"
          style={lineStyle}
        />
      </div>
    );
  }

  const lineStyle = variant === "solid" 
    ? {
        height: thicknessMap[thickness],
        backgroundColor: color,
      }
    : {
        height: "0px",
        borderTop: `${thicknessMap[thickness]} ${borderStyle[variant]} ${color}`,
      };

  const containerStyle = {
    ...baseStyle,
    ...cssVars,
    width: width || "100%",
  };

  // In edit mode, we need to ensure the line is still visible while making it clickable
  if (!isPreviewMode) {
    return (
      <div
        className="w-full"
        style={{
          ...containerStyle,
          ...spacingMap[spacing],
          width: "100%",
          minHeight: "20px",
          display: "flex",
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* The actual line */}
        <div
          style={{
            ...lineStyle,
            width: "100%",
            flex: 1,
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        ...containerStyle,
        ...lineStyle,
        ...spacingMap[spacing],
      }}
    />
  );
}
