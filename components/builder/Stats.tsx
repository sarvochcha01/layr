"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";

interface Stat {
  value: string;
  label: string;
  suffix?: string;
}

interface StatsProps {
  stats?: Stat[];
  layout?: "horizontal" | "grid";
  columns?: 2 | 3 | 4;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  width?: string;
  height?: string;
  themeStyle?: ThemeStyleVariant;
  [key: string]: any;
}

function useCountUp(target: number, duration = 1800, shouldStart = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [target, duration, shouldStart]);

  return count;
}

function AnimatedStat({
  stat,
  accentColor,
  shouldStart,
}: {
  stat: Stat;
  accentColor: string;
  shouldStart: boolean;
}) {
  const numericPart = parseFloat(stat.value.replace(/[^0-9.]/g, ""));
  const prefix = stat.value.match(/^[^0-9]*/)?.[0] || "";
  const isNumeric = !isNaN(numericPart);

  const counted = useCountUp(isNumeric ? numericPart : 0, 1600, shouldStart && isNumeric);
  const displayValue = isNumeric ? `${prefix}${counted}` : stat.value;

  return (
    <div
      className="text-center relative"
      style={{
        opacity: shouldStart ? 1 : 0,
        transform: shouldStart ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      <div
        className="text-4xl sm:text-5xl font-bold mb-2 tracking-tight tabular-nums"
        style={{ color: accentColor }}
      >
        {displayValue}
        {stat.suffix}
      </div>
      <div
        className="text-[10px] font-semibold uppercase tracking-[0.2em]"
        style={{ color: "var(--theme-text-muted)" }}
      >
        {stat.label}
      </div>
    </div>
  );
}

export function Stats({
  stats = [
    { value: "10M", label: "ACTIVE USERS", suffix: "+" },
    { value: "99.9", label: "UPTIME SLA", suffix: "%" },
    { value: "240", label: "GLOBAL EDGES", suffix: "+" },
    { value: "15", label: "AVG LATENCY", suffix: "ms" },
  ],
  layout = "horizontal",
  columns = 4,
  backgroundColor,
  textColor,
  accentColor,
  width,
  height,
  themeStyle,
  ...rest
}: StatsProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const effectiveTheme = useEffectiveThemeStyle(themeStyle, !!themeStyle);
  const cssVars = getThemeCSSVars(effectiveTheme);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const gridCols = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-2 sm:grid-cols-4" };

  const rootStyle: React.CSSProperties = {
    ...cssVars,
    backgroundColor: backgroundColor || "var(--theme-bg)",
    color: textColor || "var(--theme-text)",
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
  };

  const resolvedAccent = accentColor || "var(--theme-text)";

  return (
    <div
      ref={ref}
      className={cn(
        "py-12 px-8",
        layout === "grid"
          ? `grid ${gridCols[columns]} gap-12`
          : "flex justify-around items-center flex-wrap gap-12",
      )}
      style={rootStyle}
    >
      {stats.map((stat, index) => (
        <div key={index} style={{ transitionDelay: `${index * 120}ms` }}>
          <AnimatedStat stat={stat} accentColor={resolvedAccent} shouldStart={visible} />
        </div>
      ))}
    </div>
  );
}
