import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";

interface BadgeProps {
  text?: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  rounded?: boolean;
  backgroundColor?: string;
  textColor?: string;
  [key: string]: any;
}

export function Badge({
  text = "Badge",
  variant = "default",
  size = "md",
  rounded = false,
  backgroundColor,
  textColor,
  ...rest
}: BadgeProps) {
  const variantClasses = {
    default: "bg-[#2a2a2a] text-gray-300",
    success: "bg-green-500/20 text-green-400",
    warning: "bg-yellow-500/20 text-yellow-400",
    error: "bg-red-500/20 text-red-400",
    info: "bg-primary/20 text-primary",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  const baseStyle = buildComponentStyle({
    backgroundColor,
    textColor,
    ...rest,
  });

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium",
        !backgroundColor && variantClasses[variant],
        sizeClasses[size],
        rounded ? "rounded-full" : "rounded",
      )}
      style={baseStyle}
    >
      {text}
    </span>
  );
}
