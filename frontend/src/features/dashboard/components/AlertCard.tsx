/**
 * Tarjeta de alerta
 * Muestra mensaje importante con accion opcional
 */

import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/Button";

interface AlertCardProps {
  type: "warning" | "error" | "info";
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
}

const alertConfig = {
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-warning/10",
    borderColor: "border-warning/20",
    textColor: "text-warning",
    iconColor: "text-warning",
  },
  error: {
    icon: AlertCircle,
    bgColor: "bg-error/10",
    borderColor: "border-error/20",
    textColor: "text-error",
    iconColor: "text-error",
  },
  info: {
    icon: Info,
    bgColor: "bg-info/10",
    borderColor: "border-info/20",
    textColor: "text-info",
    iconColor: "text-info",
  },
};

export function AlertCard({
  type,
  message,
  action,
  dismissible = false,
  onDismiss,
}: AlertCardProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const config = alertConfig[type];
  const Icon = config.icon;

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      className={`relative p-4 border rounded-lg ${config.bgColor} ${config.borderColor} h-full flex flex-col`}
    >
      <div className="flex items-start gap-3 flex-1">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${config.textColor}`}>{message}</p>

          {action && (
            <div className="mt-3">
              <Button size="small" variant="secondary" onClick={action.onClick}>
                {action.label}
              </Button>
            </div>
          )}
        </div>

        {dismissible && (
          <button
            onClick={handleDismiss}
            className={`p-1 rounded hover:bg-black/5 ${config.textColor} flex-shrink-0`}
            aria-label="Cerrar alerta"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
