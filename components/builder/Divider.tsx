import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";

interface DividerProps {
  text?: string;
  variant?: "solid" | "dashed" | "dotted";
  thickness?: "thin" | "medium" | "thick";
  color?: string;
  width?: string;
  spacing?: "sm" | "md" | "lg";
  [key: string]: any;
}

export function Divider({
  text,
  variant = "solid",
  thickness = "thin",
  color = "#2a2a2a",
  width,
  spacing = "md",
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

  if (text) {
    return (
      <div
        className={cn("flex items-center gap-4", spacingMap[spacing])}
        style={baseStyle}
      >
        <div
          className="flex-1"
          style={{
            height: thicknessMap[thickness],
            backgroundColor: color,
            borderStyle: borderStyle[variant],
          }}
        />
        <span className="text-sm text-gray-400 px-2">{text}</span>
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
