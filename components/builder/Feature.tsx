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
  icon = "•",
  title = "Feature Title",
  description = "Explain the value of this feature in a way that resonates with your audience.",
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
    sm: "text-xl w-10 h-10",
    md: "text-2xl w-12 h-12",
    lg: "text-3xl w-14 h-14",
  };

  const baseStyle = buildComponentStyle({
    backgroundColor,
    textColor,
    width,
    height,
    ...rest,
  });

  return (
    <div
      className={cn(
        "p-6 rounded-2xl transition-all duration-300 min-w-0 overflow-hidden",
        "hover:bg-[#1a1a1a]/50 border border-[#2a2a2a]",
        layout === "vertical" ? "text-center" : "flex gap-5 items-start",
      )}
      style={baseStyle}
    >
      <div
        className={cn(
          "rounded-xl flex items-center justify-center flex-shrink-0",
          iconSizes[iconSize],
          layout === "vertical" && "mx-auto mb-5",
        )}
        style={{
          background: `linear-gradient(135deg, ${iconColor}15, ${iconColor}25)`,
          color: iconColor,
        }}
      >
        {icon}
      </div>

      <div
        className={cn(
          "min-w-0",
          layout === "vertical" ? "text-center" : "flex-1",
        )}
      >
        <h3
          className="text-lg font-semibold mb-2 tracking-tight break-words text-white"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-gray-400 break-words">
          {description}
        </p>
      </div>
    </div>
  );
}
