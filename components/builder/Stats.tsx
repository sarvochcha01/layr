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
    { value: "10M", label: "ACTIVE USERS", suffix: "+" },
    { value: "99.9", label: "UPTIME SLA", suffix: "%" },
    { value: "240", label: "GLOBAL EDGES", suffix: "+" },
    { value: "15", label: "AVG LATENCY", suffix: "ms" },
  ],
  layout = "horizontal",
  columns = 4,
  backgroundColor = "#0d0d0d",
  textColor = "#ffffff",
  accentColor = "#ffffff",
  width,
  height,
  ...rest
}: StatsProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
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
        "py-12 px-8",
        layout === "grid"
          ? `grid ${gridCols[columns]} gap-12`
          : "flex justify-around items-center flex-wrap gap-12",
      )}
      style={baseStyle}
    >
      {stats.map((stat, index) => (
        <div key={index} className="text-center relative">
          <div
            className="text-4xl sm:text-5xl font-bold mb-2 tracking-tight"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: accentColor,
            }}
          >
            {stat.value}
            {stat.suffix}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
