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
  width?: string;
  height?: string;
  display?: "block" | "flex";
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
  flexWrap?: "nowrap" | "wrap" | "wrap-reverse";
  justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly";
  alignItems?: "start" | "center" | "end" | "stretch" | "baseline";
  gap?: "none" | "sm" | "md" | "lg" | "xl";
  overflowX?: "visible" | "hidden" | "scroll" | "auto";
  overflowY?: "visible" | "hidden" | "scroll" | "auto";
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
  width,
  height,
  display = "block",
  flexDirection = "row",
  flexWrap = "nowrap",
  justifyContent = "start",
  alignItems = "start",
  gap = "none",
  overflowX = "visible",
  overflowY = "visible",
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

  const flexDirectionClasses = {
    row: "flex-row",
    column: "flex-col",
    "row-reverse": "flex-row-reverse",
    "column-reverse": "flex-col-reverse",
  };

  const flexWrapClasses = {
    nowrap: "flex-nowrap",
    wrap: "flex-wrap",
    "wrap-reverse": "flex-wrap-reverse",
  };

  const justifyContentClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
  };

  const alignItemsClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
    baseline: "items-baseline",
  };

  const gapClasses = {
    none: "",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
  };

  const overflowXClasses = {
    visible: "overflow-x-visible",
    hidden: "overflow-x-hidden",
    scroll: "overflow-x-scroll",
    auto: "overflow-x-auto",
  };

  const overflowYClasses = {
    visible: "overflow-y-visible",
    hidden: "overflow-y-hidden",
    scroll: "overflow-y-scroll",
    auto: "overflow-y-auto",
  };

  return (
    <Component
      className={cn(
        display !== "flex" && maxWidthClasses[maxWidth],
        paddingClasses[padding],
        display !== "flex" && marginClasses[margin],
        display === "flex" && "flex",
        display === "flex" && flexDirectionClasses[flexDirection],
        display === "flex" && flexWrapClasses[flexWrap],
        display === "flex" && justifyContentClasses[justifyContent],
        display === "flex" && alignItemsClasses[alignItems],
        display === "flex" && gapClasses[gap],
        overflowXClasses[overflowX],
        overflowYClasses[overflowY],
        className
      )}
      style={{
        backgroundColor,
        color: textColor,
        width: width || (display === "flex" ? "100%" : undefined),
        height: height || undefined,
      }}
    >
      {children}
    </Component>
  );
}
