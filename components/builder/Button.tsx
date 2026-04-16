import { cn } from "@/lib/utils";
import { buildComponentStyle, getUserStyleOverrides } from "@/lib/buildStyle";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";

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
  themeStyle?: ThemeStyleVariant;
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
  themeStyle,
  ...rest
}: ButtonProps) {
  const buttonContent = children || text || "Button";
  const effectiveTheme = useEffectiveThemeStyle(themeStyle, !!themeStyle);
  const cssVars = getThemeCSSVars(effectiveTheme);

  const sizeStyles: React.CSSProperties = {
    sm: { padding: "6px 14px", fontSize: "12px" },
    default: { padding: "10px 20px", fontSize: "14px" },
    lg: { padding: "14px 28px", fontSize: "15px" },
    icon: { width: "40px", height: "40px", padding: "0" },
  }[size] || { padding: "10px 20px", fontSize: "14px" };

  // Determine button appearance based on variant
  const isOutline = variant === "outline" || variant === "secondary";
  const isGhost = variant === "ghost" || variant === "link";

  const btnStyle: React.CSSProperties = {
    ...cssVars,
    ...(width ? { width } : fullWidth ? { width: "100%" } : {}),
    ...(height ? { height } : {}),
    ...sizeStyles,
    borderRadius: "var(--theme-radius)",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 200ms ease",
    opacity: disabled ? 0.5 : 1,
    boxShadow: isOutline || isGhost ? "none" : "var(--theme-hard-shadow, var(--theme-shadow))",
    ...(isGhost
      ? {
          background: "transparent",
          color: "var(--theme-text)",
          border: "none",
        }
      : isOutline
        ? {
            background: "var(--theme-surface)",
            color: "var(--theme-text)",
            border: `var(--theme-border-width) solid var(--theme-border)`,
          }
        : {
            background: backgroundColor || "var(--theme-accent)",
            color: textColor || "var(--theme-accent-fg)",
            border: `var(--theme-border-width) solid var(--theme-border)`,
          }),
    ...getUserStyleOverrides(rest),
  };

  const resolveHref = (
    rawHref: string | undefined,
  ): { resolved: string; isPageLink: boolean; slug?: string } => {
    if (!rawHref) return { resolved: "#", isPageLink: false };
    if (rawHref.startsWith("page:")) {
      const pageId = rawHref.substring(5);
      const page = pages?.find((p: any) => p.id === pageId);
      if (page) return { resolved: `/${page.slug}`, isPageLink: true, slug: page.slug };
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
    if (linkInfo.isPageLink && onNavigate && linkInfo.slug) {
      e.preventDefault();
      onNavigate(linkInfo.slug);
      return;
    }
    if (onClick) onClick();
  };

  const buttonElement = (
    <button
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        fullWidth && "w-full",
        "hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]",
        className,
      )}
      style={btnStyle}
    >
      {buttonContent}
    </button>
  );

  if (!isPreviewMode) {
    return (
      <div style={{ pointerEvents: "none", cursor: "default", display: "inline-flex" }}>
        {buttonElement}
      </div>
    );
  }

  if (href && !disabled && !linkInfo.isPageLink) {
    return (
      <a
        href={linkInfo.resolved}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        style={{ display: "inline-flex" }}
      >
        {buttonElement}
      </a>
    );
  }

  return buttonElement;
}
