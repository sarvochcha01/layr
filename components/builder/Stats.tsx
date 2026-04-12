import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";

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
  [key: string]: any;
}

export function Stats({
  stats = [
    { value: "10K+", label: "Active Users" },
    { value: "99.9%", label: "Uptime SLA" },
    { value: "50+", label: "Countries" },
    { value: "4.9", label: "Star Rating" },
  ],
  layout = "horizontal",
  columns = 4,
  backgroundColor,
  textColor,
  accentColor = "#6366f1",
  width,
  height,
  ...rest
}: StatsProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
  };

  const baseStyle = buildComponentStyle({ backgroundColor, textColor, width, height, ...rest });

  return (
    <div
      className={cn(
        "py-12 px-8",
        layout === "grid"
          ? `grid ${gridCols[columns]} gap-8`
          : "flex justify-around items-center flex-wrap gap-8"
      )}
      style={baseStyle}
    >
      {stats.map((stat, index) => (
        <div key={index} className="text-center relative">
          <div
            className="text-4xl sm:text-5xl font-bold mb-2 tracking-tight"
            style={{
              fontFamily: "'Inter', sans-serif",
              background: `linear-gradient(135deg, ${accentColor}, ${adjustColor(accentColor, 40)})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {stat.value}{stat.suffix}
          </div>
          <div className="text-xs font-medium uppercase tracking-[0.15em] opacity-50">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// Lighten a hex color
function adjustColor(hex: string, amount: number): string {
  try {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.min(255, (num >> 16) + amount);
    const g = Math.min(255, ((num >> 8) & 0x00FF) + amount);
    const b = Math.min(255, (num & 0x0000FF) + amount);
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
  } catch {
    return hex;
  }
}
