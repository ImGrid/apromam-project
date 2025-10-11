import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";
import type { ReactNode } from "react";

interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  message: string | ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({ type, message, onClose, className = "" }: AlertProps) {
  const configs = {
    success: {
      icon: CheckCircle,
      bgColor: "bg-success/10",
      borderColor: "border-success/20",
      textColor: "text-success",
      iconColor: "text-success",
    },
    error: {
      icon: AlertCircle,
      bgColor: "bg-error/10",
      borderColor: "border-error/20",
      textColor: "text-error",
      iconColor: "text-error",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-warning/10",
      borderColor: "border-warning/20",
      textColor: "text-warning",
      iconColor: "text-warning",
    },
    info: {
      icon: Info,
      bgColor: "bg-info/10",
      borderColor: "border-info/20",
      textColor: "text-info",
      iconColor: "text-info",
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={`
        p-4 border rounded-lg
        ${config.bgColor} ${config.borderColor}
        ${className}
      `}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />

        <div className="flex-1 min-w-0">
          <div className={`text-sm ${config.textColor}`}>{message}</div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className={`p-1 rounded hover:bg-black/5 ${config.textColor} touch-target`}
            aria-label="Cerrar alerta"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
