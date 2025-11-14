import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ButtonProps {
  children?: React.ReactNode;
  text?: string;
  href?: string;
  external?: boolean;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  isPreviewMode?: boolean;
  width?: string;
  height?: string;
}

export function Button({
  children,
  text,
  href,
  external = false,
  variant = "default",
  size = "default",
  fullWidth = false,
  disabled = false,
  className,
  onClick,
  isPreviewMode = false,
  width,
  height,
}: ButtonProps) {
  const buttonContent = children || text || "Button";

  const buttonElement = (
    <ShadcnButton
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={isPreviewMode ? onClick : (e) => e.preventDefault()}
      className={cn(fullWidth && "w-full", className)}
      style={{
        width: width || undefined,
        height: height || undefined,
      }}
    >
      {buttonContent}
    </ShadcnButton>
  );

  // Wrap in a div that prevents all interactions in edit mode
  const wrappedButton = (
    <div
      style={
        isPreviewMode ? undefined : { pointerEvents: "none", cursor: "default" }
      }
      onClick={isPreviewMode ? undefined : (e) => e.stopPropagation()}
    >
      {buttonElement}
    </div>
  );

  if (href && !disabled && isPreviewMode) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {wrappedButton}
      </a>
    );
  }

  return wrappedButton;
}
