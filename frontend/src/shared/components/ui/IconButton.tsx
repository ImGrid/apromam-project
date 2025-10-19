import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Tooltip } from "./Tooltip";

/**
 * IconButton - Botón de acción con icono y tooltip integrado
 *
 * Cumple con WCAG 2.1 AAA (44x44px touch target)
 * Diseñado para acciones en tablas y listas
 *
 * @example
 * ```tsx
 * <IconButton
 *   icon={<Edit />}
 *   tooltip="Editar usuario"
 *   onClick={handleEdit}
 *   variant="primary"
 * />
 * ```
 */

// Variantes semánticas de color
type IconButtonVariant = "primary" | "danger" | "success" | "warning" | "neutral";

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Icono de lucide-react u otro elemento React */
  icon: ReactNode;
  /** Texto del tooltip (obligatorio para accesibilidad) */
  tooltip: string;
  /** Variante de color */
  variant?: IconButtonVariant;
  /** Posición del tooltip */
  tooltipPosition?: "top" | "bottom" | "left" | "right";
  /** Deshabilitar botón */
  disabled?: boolean;
  /** className adicional */
  className?: string;
}

export function IconButton({
  icon,
  tooltip,
  variant = "primary",
  tooltipPosition = "top",
  disabled = false,
  className = "",
  onClick,
  ...rest
}: IconButtonProps) {
  // Clases base - WCAG 2.1 AAA compliant (44x44px)
  const baseClasses =
    "inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  // Variantes de color (basado en mejores prácticas)
  const variantClasses: Record<IconButtonVariant, string> = {
    primary: "text-primary hover:bg-primary/10 focus:ring-primary active:bg-primary/20",
    danger: "text-error hover:bg-error/10 focus:ring-error active:bg-error/20",
    success: "text-success hover:bg-success/10 focus:ring-success active:bg-success/20",
    warning: "text-warning hover:bg-warning/10 focus:ring-warning active:bg-warning/20",
    neutral: "text-text-secondary hover:bg-neutral-bg focus:ring-primary active:bg-neutral-bg",
  };

  // Clases finales
  const finalClasses = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  const buttonElement = (
    <button
      type="button"
      disabled={disabled}
      className={finalClasses}
      onClick={onClick}
      aria-label={tooltip}
      {...rest}
    >
      {icon}
    </button>
  );

  // Si está deshabilitado, no mostrar tooltip en hover (mejor UX)
  if (disabled) {
    return buttonElement;
  }

  // Envolver con Tooltip
  return (
    <Tooltip content={tooltip} position={tooltipPosition}>
      {buttonElement}
    </Tooltip>
  );
}
