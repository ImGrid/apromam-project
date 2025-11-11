import type { ButtonHTMLAttributes, ReactNode } from "react";

// Variantes de estilo del botón
type ButtonVariant = "primary" | "secondary" | "danger" | "warning" | "ghost";

// Tamaños del botón (todos touch-safe)
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "medium",
  isLoading = false,
  fullWidth = false,
  disabled = false,
  className = "",
  type = "button",
  ...rest
}: ButtonProps) {
  // Clases base (mobile-first, touch-safe)
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

  // Tamaños - TODOS son touch-safe (≥44px altura)
  const sizeClasses = {
    // 44px altura mínima
    small: "min-h-[44px] px-4 py-2 text-sm",
    // 48px altura (recomendado para móvil)
    medium: "min-h-[48px] px-6 py-3 text-base",
    // 56px altura (para acciones principales)
    large: "min-h-[56px] px-8 py-4 text-lg",
  };

  // Variantes de color (paleta APROMAM)
  const variantClasses = {
    primary:
      "bg-primary text-white hover:bg-primary-dark focus:ring-primary active:bg-primary-dark",
    secondary:
      "bg-white text-primary border-2 border-primary hover:bg-neutral-bg focus:ring-primary active:bg-neutral-bg",
    danger:
      "bg-error text-white hover:bg-error-700 focus:ring-error active:bg-error-700",
    warning:
      "bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500 active:bg-yellow-600",
    ghost:
      "bg-transparent text-primary hover:bg-neutral-bg focus:ring-primary active:bg-neutral-bg",
  };

  // Ancho completo (útil en móvil)
  const widthClass = fullWidth ? "w-full" : "";

  // Clases finales
  const finalClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${widthClass}
    rounded-md
    ${className}
  `.trim();

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={finalClasses}
      {...rest}
    >
      {/* Spinner de loading (minimalista) */}
      {isLoading && (
        <svg
          className="w-5 h-5 mr-2 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {/* Contenido del botón */}
      <span className={isLoading ? "opacity-70" : ""}>{children}</span>
    </button>
  );
}
