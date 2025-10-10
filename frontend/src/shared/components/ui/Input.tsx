import { type InputHTMLAttributes, forwardRef } from "react";

type InputType = "text" | "email" | "password" | "number" | "tel" | "url";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  inputType?: InputType;
  fullWidth?: boolean;
}

/**
 * Input component con forwardRef para React Hook Form
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      inputType = "text",
      fullWidth = true,
      disabled = false,
      required = false,
      className = "",
      id,
      ...rest
    },
    ref
  ) => {
    // Generar ID único si no se proporciona
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Clases base (mobile-first, touch-safe)
    const baseClasses =
      "w-full min-h-[48px] px-4 py-3 text-base border rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-neutral-bg disabled:cursor-not-allowed disabled:opacity-60";

    // Estados de borde
    const borderClasses = error
      ? "border-error focus:ring-error focus:border-error"
      : "border-neutral-border focus:ring-primary focus:border-primary";

    // Clases finales
    const inputClasses = `
      ${baseClasses}
      ${borderClasses}
      ${fullWidth ? "w-full" : ""}
      ${className}
    `.trim();

    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-2 text-sm font-medium text-text-primary"
          >
            {label}
            {required && (
              <span className="ml-1 text-error" aria-label="requerido">
                *
              </span>
            )}
          </label>
        )}

        {/* Input field */}
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          disabled={disabled}
          required={required}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          className={inputClasses}
          {...rest}
        />

        {/* Mensaje de error */}
        {error && (
          <p
            id={`${inputId}-error`}
            className="flex items-start gap-1 mt-2 text-sm text-error"
            role="alert"
          >
            {/* Ícono de error (minimalista) */}
            <svg
              className="flex-shrink-0 w-4 h-4 mt-0.5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </p>
        )}

        {/* Helper text (cuando no hay error) */}
        {!error && helperText && (
          <p
            id={`${inputId}-helper`}
            className="mt-2 text-sm text-text-secondary"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
