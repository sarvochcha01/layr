import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";

interface GridProps {
  children?: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: "sm" | "md" | "lg" | "xl";
  className?: string;
  responsive?: boolean;
  width?: string;
  height?: string;
  backgroundColor?: string;
  textColor?: string;
  [key: string]: any;
}

export function Grid({
  children,
  columns = 3,
  gap = "md",
  className,
  responsive = true,
  width,
  height,
  backgroundColor,
  textColor,
  ...rest
}: GridProps) {
  const gapClasses = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
    xl: "gap-12",
  };

  const columnClasses = {
    1: "grid-cols-1",
    2: responsive ? "grid-cols-1 md:grid-cols-2" : "grid-cols-2",
    3: responsive ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-3",
    4: responsive ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-4",
    5: responsive ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-5" : "grid-cols-5",
    6: responsive ? "grid-cols-1 md:grid-cols-3 lg:grid-cols-6" : "grid-cols-6",
  };

  const baseStyle = buildComponentStyle({ backgroundColor, textColor, width, height, ...rest });

  return (
    <div
      className={cn("grid", columnClasses[columns], gapClasses[gap], className)}
      style={baseStyle}
    >
      {children}
    </div>
  );
}
