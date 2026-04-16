import { AlertCircle, CheckCircle, Info, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { getUserStyleOverrides } from "@/lib/buildStyle";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";

interface AlertProps {
  title?: string;
  message?: string;
  variant?: "info" | "success" | "warning" | "error";
  dismissible?: boolean;
  onDismiss?: () => void;
  backgroundColor?: string;
  textColor?: string;
  width?: string;
  themeStyle?: ThemeStyleVariant;
  [key: string]: any;
}

const icons = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
};

const semanticColors: Record<string, { accent: string }> = {
  info: { accent: "var(--theme-accent)" },
  success: { accent: "#4ade80" },
  warning: { accent: "#fbbf24" },
  error: { accent: "#f87171" },
};

export function Alert({
  title,
  message = "This is an alert message",
  variant = "info",
  dismissible = false,
  onDismiss,
  backgroundColor,
  textColor,
  width,
  themeStyle,
  ...rest
}: AlertProps) {
  const effectiveTheme = useEffectiveThemeStyle(themeStyle, themeStyle !== undefined);
  const cssVars = getThemeCSSVars(effectiveTheme);
  const Icon = icons[variant] || Info;
  const accent = semanticColors[variant]?.accent || "var(--theme-accent)";

  const rootStyle: React.CSSProperties = {
    ...cssVars,
    display: "flex",
    gap: "12px",
    padding: "16px",
    borderRadius: "var(--theme-radius)",
    backgroundColor: backgroundColor || "var(--theme-surface)",
    color: textColor || "var(--theme-text)",
    border: `var(--theme-border-width) solid ${variant === "info" ? "var(--theme-border)" : accent}`,
    borderLeftWidth: "4px",
    borderLeftColor: accent,
    ...(width ? { width } : {}),
    ...getUserStyleOverrides(rest),
  };

  return (
    <div style={rootStyle}>
      <Icon
        className="w-5 h-5 flex-shrink-0 mt-0.5"
        style={{ color: accent }}
      />
      <div className="flex-1 min-w-0">
        {title && (
          <div
            className="font-semibold mb-1"
            style={{ color: "var(--theme-text)" }}
          >
            {title}
          </div>
        )}
        <div className="text-sm" style={{ color: "var(--theme-text-muted)" }}>
          {message}
        </div>
      </div>

      {dismissible && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 hover:opacity-75 transition-opacity"
          style={{ color: "var(--theme-text-muted)" }}
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
