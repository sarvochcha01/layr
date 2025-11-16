import { cn } from "@/lib/utils";

interface HeaderProps {
  children?: React.ReactNode;
  className?: string;
  backgroundColor?: string;
  padding?: string;
  sticky?: boolean;
  shadow?: boolean;
  width?: string;
  height?: string;
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
}: HeaderProps) {
  return (
    <header
      className={cn(
        "w-full border-b",
        sticky && "sticky top-0 z-50",
        shadow && "shadow-sm",
        className
      )}
      style={{
        backgroundColor,
        padding,
        width: width || undefined,
        height: height || undefined,
      }}
    >
      {children}
    </header>
  );
}
