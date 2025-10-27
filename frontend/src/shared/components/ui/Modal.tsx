import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "small" | "medium" | "large" | "full";
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "medium",
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
}: ModalProps) {
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
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  // Tamaños adaptativos (desktop only, mobile siempre full)
  const sizeClasses = {
    small: "sm:max-w-md",
    medium: "sm:max-w-lg",
    large: "sm:max-w-2xl",
    full: "sm:max-w-full sm:mx-4",
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

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
        className={`
          relative w-full bg-white
          sm:rounded-lg sm:shadow-lg
          max-h-[95vh] sm:max-h-[90vh]
          flex flex-col
          animate-in slide-in-from-bottom sm:slide-in-from-bottom-4
          duration-300
          ${sizeClasses[size]}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 py-4 border-b sm:px-6 border-neutral-border">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-text-primary sm:text-xl"
              >
                {title}
              </h2>
            )}

            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 transition-colors rounded-lg text-text-secondary hover:bg-neutral-bg touch-target"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content - scrollable */}
        <div className="flex-1 px-4 py-4 overflow-y-auto sm:px-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
