import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";
import {
  Zap, Shield, Star, Heart, Settings, Globe, Lock, Cpu,
  Layers, Code, Rocket, Target, Eye, Bell, Award, BarChart3,
  CheckCircle, Cloud, Database, PenTool, Smartphone, Users,
  Sparkles, TrendingUp, Lightbulb, Package, type LucideIcon,
} from "lucide-react";

/** Map of icon names to Lucide components */
const ICON_MAP: Record<string, LucideIcon> = {
  zap: Zap,
  shield: Shield,
  star: Star,
  heart: Heart,
  settings: Settings,
  globe: Globe,
  lock: Lock,
  cpu: Cpu,
  layers: Layers,
  code: Code,
  rocket: Rocket,
  target: Target,
  eye: Eye,
  bell: Bell,
  award: Award,
  chart: BarChart3,
  check: CheckCircle,
  cloud: Cloud,
  database: Database,
  pen: PenTool,
  phone: Smartphone,
  users: Users,
  sparkles: Sparkles,
  trending: TrendingUp,
  lightbulb: Lightbulb,
  package: Package,
};

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
  icon = "zap",
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
    sm: { container: "w-10 h-10", icon: "w-5 h-5" },
    md: { container: "w-12 h-12", icon: "w-6 h-6" },
    lg: { container: "w-14 h-14", icon: "w-7 h-7" },
  };

  const baseStyle = buildComponentStyle({
    backgroundColor,
    textColor,
    width,
    height,
    ...rest,
  });

  // Resolve icon: try Lucide icon map first, fall back to text display
  const iconKey = (icon || "zap").toLowerCase().trim();
  const IconComponent = ICON_MAP[iconKey];

  return (
    <div
      className={cn(
        "p-6 rounded-2xl transition-all duration-300 min-w-0 overflow-hidden",
        "hover:bg-card/50 border border-border",
        layout === "vertical" ? "text-center" : "flex gap-5 items-start",
      )}
      style={baseStyle}
    >
      <div
        className={cn(
          "rounded-xl flex items-center justify-center flex-shrink-0",
          iconSizes[iconSize].container,
          layout === "vertical" && "mx-auto mb-5",
        )}
        style={{
          background: `linear-gradient(135deg, ${iconColor}15, ${iconColor}25)`,
          color: iconColor,
        }}
      >
        {IconComponent ? (
          <IconComponent className={iconSizes[iconSize].icon} />
        ) : (
          <span className={cn("font-bold", iconSize === "sm" ? "text-xl" : iconSize === "lg" ? "text-3xl" : "text-2xl")}>
            {icon}
          </span>
        )}
      </div>

      <div
        className={cn(
          "min-w-0",
          layout === "vertical" ? "text-center" : "flex-1",
        )}
      >
        <h3
          className="text-lg font-semibold mb-2 tracking-tight break-words text-foreground"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground break-words">
          {description}
        </p>
      </div>
    </div>
  );
}
