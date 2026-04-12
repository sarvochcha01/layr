import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";

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
  onNavigate?: (slug: string) => void;
  pages?: any[];
  width?: string;
  height?: string;
  backgroundColor?: string;
  textColor?: string;
  [key: string]: any;
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
  onNavigate,
  pages,
  width,
  height,
  backgroundColor,
  textColor,
  ...rest
}: ButtonProps) {
  const buttonContent = children || text || "Button";
  const baseStyle = buildComponentStyle({ backgroundColor, textColor, width, height, ...rest });

  // Resolve page: links to actual page slugs
  const resolveHref = (rawHref: string | undefined): { resolved: string; isPageLink: boolean; slug?: string } => {
    if (!rawHref) return { resolved: "#", isPageLink: false };

    if (rawHref.startsWith("page:")) {
      const pageId = rawHref.substring(5);
      const page = pages?.find((p: any) => p.id === pageId);
      if (page) {
        return { resolved: `/${page.slug}`, isPageLink: true, slug: page.slug };
      }
      return { resolved: "#", isPageLink: true };
    }

    return { resolved: rawHref, isPageLink: false };
  };

  const linkInfo = resolveHref(href);

  const handleClick = (e: React.MouseEvent) => {
    if (!isPreviewMode) {
      e.preventDefault();
      return;
    }

    // Handle internal page navigation in preview mode
    if (linkInfo.isPageLink && onNavigate && linkInfo.slug) {
      e.preventDefault();
      onNavigate(linkInfo.slug);
      return;
    }

    if (onClick) {
      onClick();
    }
  };

  const buttonElement = (
    <ShadcnButton
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={handleClick}
      className={cn(fullWidth && "w-full", className)}
      style={baseStyle}
    >
      {buttonContent}
    </ShadcnButton>
  );

  // In edit mode, wrap to block all interactions
  if (!isPreviewMode) {
    return (
      <div style={{ pointerEvents: "none", cursor: "default" }}>
        {buttonElement}
      </div>
    );
  }

  // In preview mode with an external link
  if (href && !disabled && !linkInfo.isPageLink) {
    return (
      <a
        href={linkInfo.resolved}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {buttonElement}
      </a>
    );
  }

  // In preview mode with internal page link or no link — button handles its own click
  return buttonElement;
}
