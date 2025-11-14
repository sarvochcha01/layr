import { cn } from "@/lib/utils";

interface TextProps {
  children?: React.ReactNode;
  content?: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  size?:
    | "xs"
    | "sm"
    | "base"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl";
  weight?: "light" | "normal" | "medium" | "semibold" | "bold" | "extrabold";
  color?: string;
  align?: "left" | "center" | "right" | "justify";
  className?: string;
  width?: string;
  height?: string;
}

export function Text({
  children,
  content,
  tag = "p",
  size = "base",
  weight = "normal",
  color,
  align = "left",
  className,
  width,
  height,
}: TextProps) {
  const Component = tag;

  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
    "5xl": "text-5xl",
    "6xl": "text-6xl",
  };

  const weightClasses = {
    light: "font-light",
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
    extrabold: "font-extrabold",
  };

  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
    justify: "text-justify",
  };

  return (
    <Component
      className={cn(
        sizeClasses[size],
        weightClasses[weight],
        alignClasses[align],
        className
      )}
      style={{
        color,
        width: width || undefined,
        height: height || undefined,
      }}
    >
      {children || content}
    </Component>
  );
}
