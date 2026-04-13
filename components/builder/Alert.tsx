import { AlertCircle, CheckCircle, Info, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";

interface AlertProps {
  title?: string;
  message?: string;
  variant?: "info" | "success" | "warning" | "error";
  dismissible?: boolean;
  onDismiss?: () => void;
  backgroundColor?: string;
  textColor?: string;
  width?: string;
  [key: string]: any;
}

export function Alert({
  title,
  message = "This is an alert message",
  variant = "info",
  dismissible = false,
  onDismiss,
  backgroundColor,
  textColor,
  width,
  ...rest
}: AlertProps) {
  const variantConfig = {
    info: {
      icon: Info,
      bgClass: "bg-card border-primary/20",
      textClass: "text-foreground/80",
      iconClass: "text-primary",
    },
    success: {
      icon: CheckCircle,
      bgClass: "bg-[#1a1a1a] border-green-500/20",
      textClass: "text-gray-300",
      iconClass: "text-green-400",
    },
    warning: {
      icon: AlertCircle,
      bgClass: "bg-[#1a1a1a] border-yellow-500/20",
      textClass: "text-gray-300",
      iconClass: "text-yellow-400",
    },
    error: {
      icon: XCircle,
      bgClass: "bg-[#1a1a1a] border-red-500/20",
      textClass: "text-gray-300",
      iconClass: "text-red-400",
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  const baseStyle = buildComponentStyle({
    backgroundColor,
    textColor,
    width,
    ...rest,
  });

  return (
    <div
      className={cn(
        "p-4 rounded-lg border flex gap-3",
        !backgroundColor && config.bgClass,
        !textColor && config.textClass,
      )}
      style={baseStyle}
    >
      <Icon className={cn("w-5 h-5 flex-shrink-0", config.iconClass)} />

      <div className="flex-1">
        {title && <div className="font-semibold mb-1">{title}</div>}
        <div className="text-sm">{message}</div>
      </div>

      {dismissible && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 hover:opacity-75 transition-opacity"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
