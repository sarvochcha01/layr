import { cn } from "@/lib/utils";

interface ContainerProps {
  children?: React.ReactNode;
  className?: string;
  maxWidth?:
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl"
    | "full";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  margin?: "none" | "sm" | "md" | "lg" | "xl" | "auto";
  backgroundColor?: string;
  textColor?: string;
  tag?: "div" | "main" | "section" | "article" | "aside" | "header" | "footer";
}

export function Container({
  children,
  className,
  maxWidth = "xl",
  padding = "md",
  margin = "auto",
  backgroundColor,
  textColor,
  tag = "div",
}: ContainerProps) {
  const Component = tag;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-full",
  };

  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
    xl: "p-12",
  };

  const marginClasses = {
    none: "",
    sm: "m-2",
    md: "m-4",
    lg: "m-6",
    xl: "m-8",
    auto: "mx-auto",
  };

  return (
    <Component
      className={cn(
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        marginClasses[margin],
        className
      )}
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      {children}
    </Component>
  );
}
