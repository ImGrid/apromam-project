import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Info, CheckCircle, X, Trash2 } from "lucide-react";
import { Button } from "./Button";

type ConfirmType = "danger" | "warning" | "info" | "success";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  type?: ConfirmType;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "warning",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isLoading = false,
}: ConfirmModalProps) {
  // Prevenir scroll del body cuando modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Cerrar con tecla ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLoading && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    await onConfirm();
  };

  // Configuración de estilos por tipo
  const typeConfig = {
    danger: {
      icon: Trash2,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      buttonVariant: "danger" as const,
    },
    warning: {
      icon: AlertTriangle,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      buttonVariant: "warning" as const,
    },
    info: {
      icon: Info,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      buttonVariant: "primary" as const,
    },
    success: {
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      buttonVariant: "primary" as const,
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      {/* Backdrop con blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div
        className="relative w-full bg-white sm:rounded-lg sm:shadow-lg max-w-md mx-auto animate-in slide-in-from-bottom sm:slide-in-from-bottom-4 duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 transition-colors rounded-lg text-text-secondary hover:bg-neutral-bg disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className={`mx-auto flex items-center justify-center w-12 h-12 rounded-full ${config.iconBg}`}>
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>

          {/* Title */}
          <h3
            id="confirm-modal-title"
            className="mt-4 text-lg font-semibold text-center text-text-primary"
          >
            {title}
          </h3>

          {/* Message */}
          <p className="mt-2 text-sm text-center text-text-secondary">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant={config.buttonVariant}
              onClick={handleConfirm}
              isLoading={isLoading}
              disabled={isLoading}
              className="flex-1"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
