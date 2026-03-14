import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";

interface HeaderProps {
  children?: React.ReactNode;
  className?: string;
  backgroundColor?: string;
  padding?: string;
  sticky?: boolean;
  shadow?: boolean;
  width?: string;
  height?: string;
  [key: string]: any;
}

export function Header({
  children,
  className,
  backgroundColor = "#ffffff",
  padding = "1rem 2rem",
  sticky = false,
  shadow = true,
  width,
  height,
  ...rest
}: HeaderProps) {
  const baseStyle = buildComponentStyle({ backgroundColor, width, height, ...rest });
  // Header uses its own padding prop (string CSS value), not the shared enum
  baseStyle.padding = padding;

  return (
    <header
      className={cn(
        "w-full border-b",
        sticky && "sticky top-0 z-50",
        shadow && "shadow-sm",
        className
      )}
      style={baseStyle}
    >
      {children}
    </header>
  );
}
