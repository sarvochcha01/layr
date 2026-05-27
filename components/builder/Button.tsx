"use client";

import { cn } from "@/lib/utils";
import { buildComponentStyle, getUserStyleOverrides } from "@/lib/buildStyle";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";
import { useBackendContext } from "@/contexts/BackendContext";
import { BackendAction } from "@/types/backend";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

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
  const { user } = useAuth();
  const { projectId: ctxProjectId } = useBackendContext();
  const resolvedProjectId = projectId || ctxProjectId;
  const [isLoading, setIsLoading] = useState(false);

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
      const parts = rawHref.substring(5).split("?");
      const pageId = parts[0];
      const queryParams = parts[1] ? `?${parts[1]}` : "";
      const page = pages?.find((p: any) => p.id === pageId || p.slug === pageId);
      if (page) {
        return {
          resolved: `/${page.slug}${queryParams}`,
          isPageLink: true,
          slug: `${page.slug}${queryParams}`,
        };
      }
      return { resolved: "#", isPageLink: true };
    }
    return { resolved: rawHref, isPageLink: false };
  };

  const linkInfo = resolveHref(href);

  // ── Execute backend action ──────────────────────────────────────
  const executeBackendAction = async () => {
    if (!backendAction?.endpointId || !resolvedProjectId) return;

    setIsLoading(true);

    try {
      // Build the request body
      let body = backendAction.staticPayload || {};

      if (backendAction.payloadSource === "custom" && backendAction.customPayload) {
        let payloadStr = backendAction.customPayload;
        let previewUid = "";
        if (typeof window !== "undefined" && resolvedProjectId) {
          try {
            const stored = localStorage.getItem(`preview-user-${resolvedProjectId}`);
            if (stored) {
              const parsed = JSON.parse(stored);
              if (parsed && parsed.uid) {
                previewUid = parsed.uid;
              }
            }
          } catch (e) {
            console.error("Failed to parse preview user session:", e);
          }
        }
        const uid = previewUid || user?.uid || "";
        payloadStr = payloadStr.replace(/\{\{\s*user\.uid\s*\|\|\s*'guest'\s*\}\}/g, uid || "guest");
        payloadStr = payloadStr.replace(/\{\{\s*user\.uid\s*\}\}/g, uid);
        try {
          body = JSON.parse(payloadStr);
        } catch (e) {
          console.error("Failed to parse custom payload:", e);
        }
      }

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
        toast.success(successMsg);
      }
    } catch (err) {
      const failMode = backendAction.onFail || "toast";

      if (failMode === "redirect" && backendAction.failRedirectUrl) {
        window.location.href = backendAction.failRedirectUrl;
        return;
      }

      if (failMode !== "none") {
        toast.error(backendAction.failMessage || (err as Error).message);
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
    // For internal page links in editor, use onNavigate callback
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
    </div>
  );

  if (!isPreviewMode) {
    return (
      <div style={{ pointerEvents: "none", cursor: "default", display: "inline-flex" }}>
        {buttonElement}
      </div>
    );
  }

  // Internal page link - use Next.js Link for proper routing
  if (linkInfo.isPageLink && !disabled && !backendAction?.endpointId) {
    return (
      <Link href={linkInfo.resolved} style={{ display: "inline-flex" }}>
        {buttonElement}
      </Link>
    );
  }

  // External link
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
