import { cn } from "@/lib/utils";

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
}

export function Stats({
  stats = [
    { value: "10K+", label: "Users" },
    { value: "50+", label: "Countries" },
    { value: "99%", label: "Satisfaction" },
  ],
  layout = "horizontal",
  columns = 3,
  backgroundColor,
  textColor,
  accentColor = "#3b82f6",
  width,
  height,
}: StatsProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  return (
    <div
      className={cn(
        "p-8",
        layout === "grid"
          ? `grid ${gridCols[columns]} gap-8`
          : "flex justify-around items-center flex-wrap gap-8"
      )}
      style={{
        width: width || undefined,
        height: height || undefined,
        backgroundColor: backgroundColor || undefined,
        color: textColor || undefined,
      }}
    >
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div
            className="text-4xl font-bold mb-2"
            style={{ color: accentColor }}
          >
            {stat.value}
            {stat.suffix}
          </div>
          <div className="text-sm opacity-75 uppercase tracking-wide">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
