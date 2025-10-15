/**
 * EstadoFichaBadge
 * Badge para mostrar el estado de una ficha de inspección
 */

import { Badge } from "@/shared/components/ui/Badge";
import {
  FileEdit,
  Clock,
  CheckCircle,
  XCircle,
  Archive,
} from "lucide-react";

export type EstadoFicha =
  | "borrador"
  | "revision"
  | "aprobado"
  | "rechazado"
  | "archivado";

interface EstadoFichaBadgeProps {
  estado: EstadoFicha;
  showIcon?: boolean;
  showLabel?: boolean;
  size?: "small" | "medium";
}

const ESTADO_CONFIG: Record<
  EstadoFicha,
  {
    label: string;
    variant: "neutral" | "warning" | "success" | "error";
    icon: typeof FileEdit;
    description: string;
  }
> = {
  borrador: {
    label: "Borrador",
    variant: "neutral",
    icon: FileEdit,
    description: "Ficha en edición, no enviada a revisión",
  },
  revision: {
    label: "En Revisión",
    variant: "warning",
    icon: Clock,
    description: "Enviada para aprobación del gerente",
  },
  aprobado: {
    label: "Aprobado",
    variant: "success",
    icon: CheckCircle,
    description: "Ficha aprobada y certificada",
  },
  rechazado: {
    label: "Rechazado",
    variant: "error",
    icon: XCircle,
    description: "Ficha rechazada, requiere correcciones",
  },
  archivado: {
    label: "Archivado",
    variant: "neutral",
    icon: Archive,
    description: "Ficha archivada para referencia",
  },
};

export function EstadoFichaBadge({
  estado,
  showIcon = false,
  showLabel = true,
  size = "medium",
}: EstadoFichaBadgeProps) {
  const config = ESTADO_CONFIG[estado];
  const Icon = config.icon;

  return (
    <span title={config.description}>
      <Badge variant={config.variant} size={size}>
        {showIcon && <Icon className="w-3 h-3" />}
        {showLabel && config.label}
      </Badge>
    </span>
  );
}

/**
 * Componente con descripción completa y timestamp
 */
interface EstadoFichaCardProps {
  estado: EstadoFicha;
  fecha?: string;
  usuario?: string;
  comentario?: string;
  className?: string;
}

export function EstadoFichaCard({
  estado,
  fecha,
  usuario,
  comentario,
  className = "",
}: EstadoFichaCardProps) {
  const config = ESTADO_CONFIG[estado];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border bg-white ${className}`}
    >
      {/* Icono */}
      <div
        className={`
        flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
        ${
          estado === "aprobado"
            ? "bg-success/10 text-success"
            : estado === "rechazado"
            ? "bg-error/10 text-error"
            : estado === "revision"
            ? "bg-warning/10 text-warning"
            : "bg-neutral-bg text-text-secondary"
        }
      `}
      >
        <Icon className="w-5 h-5" />
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-text-primary">{config.label}</p>
          {fecha && (
            <span className="text-xs text-text-secondary">
              {new Date(fecha).toLocaleDateString()}
            </span>
          )}
        </div>

        <p className="mt-1 text-sm text-text-secondary">{config.description}</p>

        {usuario && (
          <p className="mt-1 text-xs text-text-secondary">Por: {usuario}</p>
        )}

        {comentario && (
          <div className="mt-2 p-2 bg-neutral-bg rounded text-sm text-text-secondary">
            {comentario}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Helper para verificar si una ficha es editable
 */
export function isEditable(estado: EstadoFicha): boolean {
  return estado === "borrador" || estado === "rechazado";
}

/**
 * Helper para verificar si se puede enviar a revisión
 */
export function canSendToReview(estado: EstadoFicha): boolean {
  return estado === "borrador";
}

/**
 * Helper para verificar si se puede aprobar/rechazar
 */
export function canReview(estado: EstadoFicha): boolean {
  return estado === "revision";
}

/**
 * Helper para obtener las acciones disponibles según el estado
 */
export function getAvailableActions(estado: EstadoFicha, rol: string): string[] {
  const actions: string[] = [];

  // Acciones según estado
  if (isEditable(estado)) {
    actions.push("editar");
  }

  if (canSendToReview(estado)) {
    actions.push("enviar_revision");
  }

  if (canReview(estado) && (rol === "gerente" || rol === "administrador")) {
    actions.push("aprobar", "rechazar");
  }

  if (rol === "administrador") {
    actions.push("devolver_borrador", "archivar");
  }

  return actions;
}

/**
 * Helper para obtener el color del estado
 */
export function getEstadoColor(estado: EstadoFicha): string {
  const colorMap: Record<EstadoFicha, string> = {
    borrador: "text-gray-600",
    revision: "text-warning",
    aprobado: "text-success",
    rechazado: "text-error",
    archivado: "text-gray-400",
  };

  return colorMap[estado];
}
