import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ButtonProps {
  children?: React.ReactNode;
  text?: string;
  href?: string;
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
}

export function Button({
  children,
  text,
  href,
  variant = "default",
  size = "default",
  fullWidth = false,
  disabled = false,
  className,
  onClick,
}: ButtonProps) {
  const buttonContent = children || text || "Button";

  const buttonElement = (
    <ShadcnButton
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={onClick}
      className={cn(fullWidth && "w-full", className)}
    >
      {buttonContent}
    </ShadcnButton>
  );

  if (href && !disabled) {
    return <a href={href}>{buttonElement}</a>;
  }

  return buttonElement;
}
