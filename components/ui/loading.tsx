import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  text?: string;
  size?: "sm" | "md" | "lg" | "xl";
  textPosition?: "top" | "bottom" | "left" | "right";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

export function Loading({
  text,
  size = "md",
  textPosition = "bottom",
  className,
}: LoadingProps) {
  const spinnerElement = (
    <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
  );

  const textElement = text ? (
    <span className={cn("text-muted-foreground", textSizeClasses[size])}>
      {text}
    </span>
  ) : null;

  const getLayoutClasses = () => {
    switch (textPosition) {
      case "top":
        return "flex flex-col items-center gap-2";
      case "bottom":
        return "flex flex-col items-center gap-2";
      case "left":
        return "flex items-center gap-3";
      case "right":
        return "flex items-center gap-3";
      default:
        return "flex flex-col items-center gap-2";
    }
  };

  const renderContent = () => {
    switch (textPosition) {
      case "top":
        return (
          <>
            {textElement}
            {spinnerElement}
          </>
        );
      case "bottom":
        return (
          <>
            {spinnerElement}
            {textElement}
          </>
        );
      case "left":
        return (
          <>
            {textElement}
            {spinnerElement}
          </>
        );
      case "right":
        return (
          <>
            {spinnerElement}
            {textElement}
          </>
        );
      default:
        return (
          <>
            {spinnerElement}
            {textElement}
          </>
        );
    }
  };

  return (
    <div className={cn(getLayoutClasses(), className)}>{renderContent()}</div>
  );
}
