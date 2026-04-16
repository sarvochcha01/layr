"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { getUserStyleOverrides } from "@/lib/buildStyle";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";
import {
  Zap, Shield, Star, Heart, Settings, Globe, Lock, Cpu,
  Layers, Code, Rocket, Target, Eye, Bell, Award, BarChart3,
  CheckCircle, Cloud, Database, PenTool, Smartphone, Users,
  Sparkles, TrendingUp, Lightbulb, Package, LucideIcon,
  ArrowRight, Box, Compass, Fingerprint, Flame, GitBranch,
  Hexagon, Infinity, Key, LifeBuoy, Mail, MessageSquare,
  Monitor, Music, Navigation, PieChart, Play, Search,
  Send, Server, ShoppingCart, Terminal, Wifi, Wrench,
} from "lucide-react";

// ─── Icon Map ────────────────────────────────────────────────────────────────
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
  arrow: ArrowRight,
  box: Box,
  compass: Compass,
  fingerprint: Fingerprint,
  flame: Flame,
  git: GitBranch,
  hexagon: Hexagon,
  infinity: Infinity,
  key: Key,
  lifebuoy: LifeBuoy,
  mail: Mail,
  message: MessageSquare,
  monitor: Monitor,
  music: Music,
  navigation: Navigation,
  pie: PieChart,
  play: Play,
  search: Search,
  send: Send,
  server: Server,
  cart: ShoppingCart,
  terminal: Terminal,
  wifi: Wifi,
  wrench: Wrench,
};

interface FeatureProps {
  icon?: string;
  title?: string;
  description?: string;
  layout?: "vertical" | "horizontal";
  iconSize?: "sm" | "md" | "lg";
  backgroundColor?: string;
  backgroundType?: "solid" | "gradient" | "image";
  gradientStart?: string;
  gradientEnd?: string;
  gradientDirection?: string;
  gradientAngle?: string;
  textColor?: string;
  iconColor?: string;
  width?: string;
  height?: string;
  themeStyle?: ThemeStyleVariant;
  [key: string]: any;
}

export function Feature({
  icon = "zap",
  title = "Feature Title",
  description = "Explain the value of this feature in a way that resonates with your audience.",
  layout = "vertical",
  iconSize = "md",
  backgroundColor,
  backgroundType,
  gradientStart,
  gradientEnd,
  gradientDirection,
  gradientAngle,
  textColor,
  iconColor,
  width,
  height,
  themeStyle,
  ...rest
}: FeatureProps) {
  const [hovered, setHovered] = useState(false);
  const effectiveTheme = useEffectiveThemeStyle(themeStyle, themeStyle !== undefined);
  const cssVars = getThemeCSSVars(effectiveTheme);

  const iconSizeMap = {
    sm: { container: "w-10 h-10", icon: 18 },
    md: { container: "w-12 h-12", icon: 22 },
    lg: { container: "w-14 h-14", icon: 26 },
  };

  const rootStyle: React.CSSProperties = {
    ...cssVars,
    borderRadius: "var(--theme-radius)",
    border: `var(--theme-border-width) solid var(--theme-border)`,
    padding: "24px",
    boxShadow: hovered ? "var(--theme-shadow)" : "none",
    transform: hovered ? "translateY(-4px)" : "translateY(0)",
    transition: "transform 300ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 300ms ease",
    backdropFilter: "var(--theme-backdrop)",
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...getUserStyleOverrides(rest),
  };

  // Handle background based on type - user preferences MUST override theme
  if (backgroundType === "gradient" && gradientStart && gradientEnd) {
    const direction = gradientDirection === "custom"
      ? `${gradientAngle || "135"}deg`
      : gradientDirection || "to bottom right";
    rootStyle.backgroundImage = `linear-gradient(${direction}, ${gradientStart}, ${gradientEnd})`;
  } else if (backgroundColor) {
    rootStyle.background = backgroundColor;
  } else {
    rootStyle.background = "var(--theme-surface)";
  }

  // Text color override
  if (textColor) {
    rootStyle.color = textColor;
  } else {
    rootStyle.color = "var(--theme-text)";
  }

  const resolvedIconColor = iconColor || "var(--theme-accent)";
  const IconComponent = ICON_MAP[icon] || Zap;
  const sizes = iconSizeMap[iconSize];

  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden",
        layout === "vertical" ? "text-center" : "flex gap-5 items-start",
      )}
      style={rootStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={cn(
          "rounded-xl flex items-center justify-center flex-shrink-0",
          sizes.container,
          layout === "vertical" && "mx-auto mb-5",
        )}
        style={{
          background: `color-mix(in srgb, ${resolvedIconColor} 15%, transparent)`,
          color: resolvedIconColor,
          borderRadius: "var(--theme-radius)",
          transition: "transform 350ms cubic-bezier(0.34,1.56,0.64,1)",
          transform: hovered ? "scale(1.15) rotate(-5deg)" : "scale(1) rotate(0deg)",
        }}
      >
        <IconComponent size={sizes.icon} strokeWidth={1.75} />
      </div>

      <div className={cn("min-w-0", layout === "vertical" ? "text-center" : "flex-1")}>
        <h3
          className="text-lg mb-2 tracking-tight break-words"
          style={{
            fontWeight: "var(--theme-heading-weight)" as any,
            color: "var(--theme-text)",
            letterSpacing: "var(--theme-letter-spacing)",
            fontFamily: "var(--theme-heading-font)",
          }}
        >
          {title}
        </h3>
        <p
          className="text-sm leading-relaxed break-words"
          style={{ color: "var(--theme-text-muted)" }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
