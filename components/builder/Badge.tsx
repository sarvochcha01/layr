import { cn } from "@/lib/utils";

interface BadgeProps {
  text?: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  rounded?: boolean;
  backgroundColor?: string;
  textColor?: string;
}

export function Badge({
  text = "Badge",
  variant = "default",
  size = "md",
  rounded = false,
  backgroundColor,
  textColor,
}: BadgeProps) {
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium",
        !backgroundColor && variantClasses[variant],
        sizeClasses[size],
        rounded ? "rounded-full" : "rounded"
      )}
      style={{
        backgroundColor: backgroundColor || undefined,
        color: textColor || undefined,
      }}
    >
      {text}
    </span>
  );
}
