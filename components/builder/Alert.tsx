import { AlertCircle, CheckCircle, Info, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertProps {
  title?: string;
  message?: string;
  variant?: "info" | "success" | "warning" | "error";
  dismissible?: boolean;
  onDismiss?: () => void;
  backgroundColor?: string;
  textColor?: string;
  width?: string;
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
}: AlertProps) {
  const variantConfig = {
    info: {
      icon: Info,
      bgClass: "bg-blue-50 border-blue-200",
      textClass: "text-blue-800",
      iconClass: "text-blue-500",
    },
    success: {
      icon: CheckCircle,
      bgClass: "bg-green-50 border-green-200",
      textClass: "text-green-800",
      iconClass: "text-green-500",
    },
    warning: {
      icon: AlertCircle,
      bgClass: "bg-yellow-50 border-yellow-200",
      textClass: "text-yellow-800",
      iconClass: "text-yellow-500",
    },
    error: {
      icon: XCircle,
      bgClass: "bg-red-50 border-red-200",
      textClass: "text-red-800",
      iconClass: "text-red-500",
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "p-4 rounded-lg border flex gap-3",
        !backgroundColor && config.bgClass,
        !textColor && config.textClass
      )}
      style={{
        width: width || undefined,
        backgroundColor: backgroundColor || undefined,
        color: textColor || undefined,
      }}
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
