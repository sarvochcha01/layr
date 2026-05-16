"use client";

import { cn } from "@/lib/utils";
import { buildComponentStyle, getUserStyleOverrides } from "@/lib/buildStyle";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";
import { useBackendContext } from "@/contexts/BackendContext";
import { BackendAction } from "@/types/backend";
import { useState } from "react";

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
  /** Backend action config — when set, button fires the action on click */
  backendAction?: BackendAction;
  /** Project ID for backend calls */
  projectId?: string;
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
  backendAction,
  projectId,
  ...rest
}: ButtonProps) {
  const buttonContent = children || text || "Button";
  const effectiveTheme = useEffectiveThemeStyle(themeStyle, themeStyle !== undefined);
  const cssVars = getThemeCSSVars(effectiveTheme);

  // Backend action state
  const { projectId: ctxProjectId } = useBackendContext();
  const resolvedProjectId = projectId || ctxProjectId;
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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
    cursor: disabled || isLoading ? "not-allowed" : "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 200ms ease",
    opacity: disabled || isLoading ? 0.5 : 1,
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

  // ── Execute backend action ──────────────────────────────────────
  const executeBackendAction = async () => {
    if (!backendAction?.endpointId || !resolvedProjectId) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      // Build the request body from staticPayload
      const body = backendAction.staticPayload || {};

      const path = backendAction.endpointPath?.startsWith("/")
        ? backendAction.endpointPath
        : `/${backendAction.endpointPath || ""}`;

      const response = await fetch(`/api/backend${path}`, {
        method: backendAction.endpointMethod || "POST",
        headers: {
          "Content-Type": "application/json",
          "x-project-id": resolvedProjectId,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        let errMsg = `Request failed (${response.status})`;
        if (data?.error) errMsg = data.error;
        if (data?.details && Array.isArray(data.details)) {
          errMsg += ": " + data.details.join(", ");
        }
        throw new Error(errMsg);
      }

      // Handle success behavior
      const successMsg = backendAction.successMessage || "Success!";

      if (backendAction.onSuccess === "redirect" && backendAction.redirectUrl) {
        const url = backendAction.redirectUrl;
        if (url.startsWith("/") && !url.startsWith("//") && onNavigate) {
          const slug = url.replace(/^\/+/, "");
          onNavigate(slug);
        } else {
          window.location.href = url;
        }
      } else if (backendAction.onSuccess !== "none") {
        // Show success feedback (toast mode)
        setFeedback({ type: "success", message: successMsg });
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      const failMode = backendAction.onFail || "toast";

      if (failMode === "redirect" && backendAction.failRedirectUrl) {
        window.location.href = backendAction.failRedirectUrl;
        return;
      }

      if (failMode !== "none") {
        setFeedback({
          type: "error",
          message: backendAction.failMessage || (err as Error).message,
        });
        setTimeout(() => setFeedback(null), 5000);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
    // Fire backend action if configured
    if (backendAction?.endpointId) {
      e.preventDefault();
      executeBackendAction();
      return;
    }
    if (onClick) onClick();
  };

  // Determine displayed text
  const displayText = isLoading ? "Sending..." : buttonContent;

  const buttonElement = (
    <button
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={cn(
        fullWidth && "w-full",
        "hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]",
        className,
      )}
      style={btnStyle}
    >
      {displayText}
    </button>
  );

  // Wrap with feedback toast
  const wrappedElement = (
    <div style={{ position: "relative", display: fullWidth ? "block" : "inline-flex" }}>
      {buttonElement}
      {/* Feedback toast */}
      {feedback && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            padding: "6px 14px",
            borderRadius: "var(--theme-radius, 6px)",
            fontSize: "12px",
            fontWeight: 500,
            zIndex: 50,
            animation: "fadeIn 200ms ease",
            ...(feedback.type === "success"
              ? {
                  background: "rgba(34, 197, 94, 0.15)",
                  color: "#22c55e",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                }
              : {
                  background: "rgba(239, 68, 68, 0.15)",
                  color: "#ef4444",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                }),
          }}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );

  if (!isPreviewMode) {
    return (
      <div style={{ pointerEvents: "none", cursor: "default", display: "inline-flex" }}>
        {buttonElement}
      </div>
    );
  }

  if (href && !disabled && !linkInfo.isPageLink && !backendAction?.endpointId) {
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

  return wrappedElement;
}
