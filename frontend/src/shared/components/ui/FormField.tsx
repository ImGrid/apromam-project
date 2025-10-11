import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}

export function FormField({
  label,
  required = false,
  error,
  helperText,
  children,
  htmlFor,
  className = "",
}: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-text-primary"
        >
          {label}
          {required && (
            <span className="ml-1 text-error" aria-label="requerido">
              *
            </span>
          )}
        </label>
      )}

      {/* Campo (Input, Select, Textarea, etc) */}
      {children}

      {/* Mensaje de error con ícono */}
      {error && (
        <div className="flex items-start gap-2 text-sm duration-200 text-error animate-in slide-in-from-top-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Helper text (solo si no hay error) */}
      {!error && helperText && (
        <p className="text-sm text-text-secondary">{helperText}</p>
      )}
    </div>
  );
}
