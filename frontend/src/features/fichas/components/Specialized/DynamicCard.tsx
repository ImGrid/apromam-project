/**
 * DynamicCard
 * Card expandible/colapsable genérica para listas dinámicas
 * Usada para: Acciones Correctivas, Parcelas, No Conformidades, etc.
 */

import { useState, type ReactNode } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

interface DynamicCardProps {
  index: number;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  isExpanded?: boolean;
  onToggle?: () => void;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  disabled?: boolean;
  variant?: "default" | "success" | "warning" | "error";
  className?: string;
}

export function DynamicCard({
  index,
  title,
  subtitle,
  children,
  isExpanded: controlledExpanded,
  onToggle,
  onRemove,
  showRemoveButton = true,
  disabled = false,
  variant = "default",
  className = "",
}: DynamicCardProps) {
  // Estado interno si no está controlado
  const [internalExpanded, setInternalExpanded] = useState(true);

  const isExpanded =
    controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  // Colores según variante
  const variantClasses = {
    default: "border-neutral-border bg-white hover:border-neutral-300",
    success: "border-success/30 bg-success/5 hover:border-success/50",
    warning: "border-warning/30 bg-warning/5 hover:border-warning/50",
    error: "border-error/30 bg-error/5 hover:border-error/50",
  };

  const numberClasses = {
    default: "bg-primary text-white",
    success: "bg-success text-white",
    warning: "bg-warning text-white",
    error: "bg-error text-white",
  };

  return (
    <div
      className={`
        border-2 rounded-lg transition-all
        ${variantClasses[variant]}
        ${disabled ? "opacity-60" : ""}
        ${className}
      `}
    >
      {/* Header */}
      <div
        className={`
          flex items-center gap-3 p-4 cursor-pointer select-none
          ${!isExpanded ? "rounded-lg" : ""}
        `}
        onClick={disabled ? undefined : handleToggle}
      >
        {/* Número */}
        <div
          className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
            font-semibold text-sm
            ${numberClasses[variant]}
          `}
        >
          {index + 1}
        </div>

        {/* Título y subtítulo */}
        <div className="flex-1 min-w-0">
          {title && (
            <p className="font-medium text-text-primary truncate">{title}</p>
          )}
          {subtitle && (
            <p className="text-sm text-text-secondary truncate">{subtitle}</p>
          )}
          {!title && !subtitle && (
            <p className="text-sm text-text-secondary">
              Item {index + 1}
            </p>
          )}
        </div>

        {/* Controles */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Botón eliminar */}
          {showRemoveButton && onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                if (
                  window.confirm(
                    "¿Estás seguro de eliminar este elemento?"
                  )
                ) {
                  onRemove();
                }
              }}
              disabled={disabled}
              className="text-error hover:bg-error/10"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}

          {/* Icono expandir/colapsar */}
          <ChevronDown
            className={`w-5 h-5 text-text-secondary transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Contenido expandible */}
      {isExpanded && (
        <div
          className={`
            px-4 pb-4 space-y-4 animate-in slide-in-from-top-2 duration-200
            ${disabled ? "pointer-events-none" : ""}
          `}
        >
          {/* Separador */}
          <div className="border-t border-neutral-border" />

          {/* Contenido */}
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Contenedor para una lista de DynamicCards con botón agregar
 */
interface DynamicCardListProps {
  children: ReactNode;
  onAdd?: () => void;
  addButtonLabel?: string;
  disabled?: boolean;
  emptyMessage?: string;
  maxItems?: number;
}

export function DynamicCardList({
  children,
  onAdd,
  addButtonLabel = "Agregar item",
  disabled = false,
  emptyMessage = "No hay elementos. Haz clic en el botón para agregar.",
  maxItems,
}: DynamicCardListProps) {
  const childrenArray = Array.isArray(children) ? children : [children];
  const itemCount = childrenArray.filter(Boolean).length;
  const canAdd = !maxItems || itemCount < maxItems;

  return (
    <div className="space-y-4">
      {/* Lista de cards */}
      {itemCount > 0 ? (
        <div className="space-y-3">{children}</div>
      ) : (
        <div className="p-8 text-center border-2 border-dashed rounded-lg border-neutral-border">
          <p className="text-sm text-text-secondary">{emptyMessage}</p>
        </div>
      )}

      {/* Botón agregar */}
      {onAdd && (
        <Button
          type="button"
          variant="secondary"
          size="medium"
          onClick={onAdd}
          disabled={disabled || !canAdd}
          fullWidth
          className="border-2 border-dashed hover:border-primary"
        >
          {addButtonLabel}
          {maxItems && (
            <span className="ml-2 text-xs text-text-secondary">
              ({itemCount}/{maxItems})
            </span>
          )}
        </Button>
      )}

      {maxItems && !canAdd && (
        <p className="text-xs text-center text-text-secondary">
          Has alcanzado el límite máximo de {maxItems} elementos
        </p>
      )}
    </div>
  );
}

/**
 * Hook para manejar el estado de expansión de múltiples cards
 */
export function useExpandedCards(initialCount = 0) {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(
    new Set(Array.from({ length: initialCount }, (_, i) => i))
  );

  const toggleCard = (index: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const expandAll = (count: number) => {
    setExpandedCards(new Set(Array.from({ length: count }, (_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedCards(new Set());
  };

  const isExpanded = (index: number) => expandedCards.has(index);

  return {
    expandedCards,
    toggleCard,
    expandAll,
    collapseAll,
    isExpanded,
  };
}
