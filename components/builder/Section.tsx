import { cn } from "@/lib/utils";

interface SectionProps {
  children?: React.ReactNode;
  className?: string;
  backgroundColor?: string;
  textColor?: string;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  id?: string;
}

export function Section({
  children,
  className,
  backgroundColor,
  textColor,
  padding = "lg",
  maxWidth = "xl",
  id,
}: SectionProps) {
  const paddingClasses = {
    none: "",
    sm: "py-8 px-4",
    md: "py-16 px-6",
    lg: "py-24 px-8",
    xl: "py-32 px-12",
  };

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    "2xl": "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <section
      id={id}
      className={cn("w-full", paddingClasses[padding], className)}
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      <div className={cn("mx-auto", maxWidthClasses[maxWidth])}>{children}</div>
    </section>
  );
}
