import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";

interface FeatureProps {
  icon?: string;
  title?: string;
  description?: string;
  layout?: "vertical" | "horizontal";
  iconSize?: "sm" | "md" | "lg";
  backgroundColor?: string;
  textColor?: string;
  iconColor?: string;
  width?: string;
  height?: string;
  [key: string]: any;
}

export function Feature({
  icon = "✨",
  title = "Feature Title",
  description = "Feature description goes here",
  layout = "vertical",
  iconSize = "md",
  backgroundColor,
  textColor,
  iconColor = "#3b82f6",
  width,
  height,
  ...rest
}: FeatureProps) {
  const iconSizes = {
    sm: "text-2xl w-10 h-10",
    md: "text-3xl w-14 h-14",
    lg: "text-4xl w-16 h-16",
  };

  const baseStyle = buildComponentStyle({ backgroundColor, textColor, width, height, ...rest });

  return (
    <div
      className={cn(
        "p-6",
        layout === "vertical" ? "text-center" : "flex gap-4 items-start"
      )}
      style={baseStyle}
    >
      <div
        className={cn(
          "rounded-lg flex items-center justify-center flex-shrink-0",
          iconSizes[iconSize],
          layout === "vertical" && "mx-auto mb-4"
        )}
        style={{
          backgroundColor: `${iconColor}20`,
          color: iconColor,
        }}
      >
        {icon}
      </div>

      <div className={cn(layout === "vertical" ? "text-center" : "flex-1")}>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="opacity-75">{description}</p>
      </div>
    </div>
  );
}
