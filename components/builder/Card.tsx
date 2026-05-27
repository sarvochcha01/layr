"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { getUserStyleOverrides } from "@/lib/buildStyle";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";
import { useBackendContext } from "@/contexts/BackendContext";
import { BackendAction } from "@/types/backend";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface CardProps {
  title?: string;
  description?: string;
  image?: string;
  topImage?: string;
  topImageHeight?: string;
  topImageObjectFit?: "cover" | "contain" | "fill" | "scale-down" | "none";
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  buttonText?: string;
  buttonLink?: string;
  variant?: "default" | "bordered" | "shadow" | "elevated";
  className?: string;
  width?: string;
  height?: string;
  backgroundColor?: string;
  backgroundType?: "solid" | "gradient" | "image";
  gradientStart?: string;
  gradientEnd?: string;
  gradientDirection?: string;
  gradientAngle?: string;
  textColor?: string;
  themeStyle?: ThemeStyleVariant;
  backendAction?: BackendAction;
  projectId?: string;
  onNavigate?: (slugOrId: string) => void;
  children?: React.ReactNode;
  [key: string]: any;
}

export function Card({
  title = "Card Title",
  description = "A short description of this card's content goes here.",
  image,
  topImage,
  topImageHeight = "208px",
  topImageObjectFit = "cover",
  icon,
  buttonText,
  buttonLink = "#",
  variant = "default",
  className,
  width,
  height,
  backgroundColor,
  backgroundType,
  gradientStart,
  gradientEnd,
  gradientDirection,
  gradientAngle,
  textColor,
  themeStyle,
  backendAction,
  projectId,
  onNavigate,
  children,
  iconBg,
  iconColor,
  ...rest
}: CardProps) {
  const [hovered, setHovered] = useState(false);
  const effectiveTheme = useEffectiveThemeStyle(themeStyle, themeStyle !== undefined);
  const cssVars = getThemeCSSVars(effectiveTheme);
  
  const { user } = useAuth();
  const { projectId: ctxProjectId } = useBackendContext();
  const resolvedProjectId = projectId || ctxProjectId;
  const [isLoading, setIsLoading] = useState(false);

  const executeBackendAction = async () => {
    if (!backendAction?.endpointId || !resolvedProjectId) return;

    setIsLoading(true);

    try {
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

  const handleActionClick = (e: React.MouseEvent) => {
    if (backendAction?.endpointId) {
      e.preventDefault();
      executeBackendAction();
    } else if (buttonLink.startsWith("page:") && onNavigate) {
      e.preventDefault();
      const pageId = buttonLink.substring(5);
      onNavigate(pageId);
    }
  };

  const isNeoBrutalist = effectiveTheme === "neobrutalist";
  const isBrutalist = effectiveTheme === "brutalist";

  const baseStyle: React.CSSProperties = {
    ...cssVars,
    border: `var(--theme-border-width) solid var(--theme-border)`,
    borderRadius: "var(--theme-radius)",
    boxShadow: hovered
      ? isNeoBrutalist || isBrutalist
        ? "8px 8px 0px var(--theme-border)"
        : "var(--theme-shadow)"
      : isNeoBrutalist || isBrutalist
        ? "var(--theme-hard-shadow, none)"
        : "0 2px 8px rgba(0,0,0,0.12)",
    transform: hovered && !isNeoBrutalist && !isBrutalist
      ? "translateY(-4px)"
      : hovered && (isNeoBrutalist || isBrutalist)
        ? "translate(-2px, -2px)"
        : "none",
    transition: "all 300ms ease",
    backdropFilter: "var(--theme-backdrop)",
    boxSizing: "border-box",
    // Default padding (can be overridden by user)
    padding: "24px",
    ...getUserStyleOverrides(rest),
  };

  // Handle background based on type - user preferences MUST override theme
  if (backgroundType === "gradient" && gradientStart && gradientEnd) {
    const direction = gradientDirection === "custom"
      ? `${gradientAngle || "135"}deg`
      : gradientDirection || "to bottom right";
    baseStyle.backgroundImage = `linear-gradient(${direction}, ${gradientStart}, ${gradientEnd})`;
  } else if (backgroundColor) {
    baseStyle.background = backgroundColor;
  } else {
    baseStyle.background = "var(--theme-surface)";
  }

  // Text color override
  if (textColor) {
    baseStyle.color = textColor;
  } else {
    baseStyle.color = "var(--theme-text)";
  }

  const showTopImage = topImage || image;
  const showIcon = icon && !showTopImage;

  return (
    <div
      className={cn(
        "w-full h-full flex flex-col overflow-hidden relative",
        className,
      )}
      style={baseStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >


      {/* Top Image */}
      {showTopImage && (
        <div className="-mx-6 -mt-6 mb-5 flex-shrink-0 overflow-hidden relative z-10">
          <img
            src={showTopImage}
            alt={title || "Card image"}
            className="w-full"
            style={{
              height: topImageHeight,
              objectFit: topImageObjectFit,
              transition: "transform 500ms cubic-bezier(0.25,0.46,0.45,0.94)",
              transform: hovered ? "scale(1.04)" : "scale(1)",
            }}
          />
        </div>
      )}

      {children}

      {/* Icon */}
      {showIcon && (
        <div className="mb-5 flex-shrink-0 relative z-10">
          <div
            className="w-12 h-12 flex items-center justify-center text-xl font-bold"
            style={{
              backgroundColor: iconBg || "var(--theme-accent)",
              color: iconColor || "var(--theme-accent-fg)",
              borderRadius: "var(--theme-radius)",
              border: `var(--theme-border-width) solid var(--theme-border)`,
              boxShadow: "var(--theme-hard-shadow, none)",
              transition: "transform 300ms cubic-bezier(0.34,1.56,0.64,1)",
              transform: hovered ? "scale(1.1) rotate(-3deg)" : "scale(1) rotate(0deg)",
            }}
          >
            {icon || "•"}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-3 min-w-0 flex-1 overflow-hidden relative z-10">
        {title && (
          <h3
            className="text-xl break-words leading-tight line-clamp-2"
            style={{
              fontWeight: "var(--theme-heading-weight)" as any,
              color: textColor || "var(--theme-text)",
              letterSpacing: "var(--theme-letter-spacing)",
              fontFamily: "var(--theme-heading-font)",
            }}
          >
            {title}
          </h3>
        )}

        {description && (
          <p
            className="text-sm leading-relaxed break-words line-clamp-3"
            style={{ color: textColor || "var(--theme-text-muted)", opacity: textColor ? 0.8 : 1 }}
          >
            {description}
          </p>
        )}

        {buttonText && (
          <div className="pt-2">
            <a
              href={buttonLink}
              onClick={handleActionClick}
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 hover:opacity-80 group/btn"
              style={{
                color: textColor || "var(--theme-accent)",
                opacity: isLoading ? 0.5 : 1,
                pointerEvents: isLoading ? "none" : "auto",
              }}
            >
              {isLoading ? "Wait..." : buttonText}
              <span className="text-xs transition-transform duration-200 group-hover/btn:translate-x-1">→</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
