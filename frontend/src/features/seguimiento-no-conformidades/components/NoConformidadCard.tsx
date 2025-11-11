// Card compacto para mostrar una No Conformidad en listas
// Diseño basado en research: spacing compacto, información densa pero legible

import { Link } from "react-router-dom";
import { Card } from "@/shared/components/ui/Card";
import { EstadoSeguimientoBadge } from "./EstadoSeguimientoBadge";
import type { NoConformidadEnriquecida } from "../types";
import { Calendar, User, MapPin, AlertTriangle } from "lucide-react";
import { format, parseISO, isPast } from "date-fns";
import { es } from "date-fns/locale";

interface NoConformidadCardProps {
  noConformidad: NoConformidadEnriquecida;
}

export function NoConformidadCard({ noConformidad }: NoConformidadCardProps) {
  const fechaLimite = noConformidad.fecha_limite_implementacion
    ? parseISO(noConformidad.fecha_limite_implementacion)
    : null;

  const estaVencida =
    fechaLimite &&
    isPast(fechaLimite) &&
    noConformidad.estado_seguimiento === "pendiente";

  return (
    <Link to={`/seguimiento-no-conformidades/${noConformidad.id_no_conformidad}`}>
      <Card
        compact
        variant="default"
        className="hover:shadow-md transition-shadow cursor-pointer"
      >
        {/* Header con código productor y estado */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm text-text-primary truncate">
                {noConformidad.codigo_productor || "Sin código"}
              </h3>
              <EstadoSeguimientoBadge estado={noConformidad.estado_seguimiento} />
            </div>
            <p className="text-xs text-text-secondary truncate">
              {noConformidad.nombre_productor || "Sin nombre"}
            </p>
          </div>

          {/* Badge de vencida si aplica */}
          {estaVencida && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-error-100 text-error-800 border border-error-200 flex-shrink-0">
              <AlertTriangle className="w-3 h-3" />
              Vencida
            </span>
          )}
        </div>

        {/* Descripción de la NC (truncada) */}
        <p className="text-sm text-text-primary line-clamp-2 mb-3">
          {noConformidad.descripcion_no_conformidad}
        </p>

        {/* Metadata compacta */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
          {noConformidad.gestion && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Gestión {noConformidad.gestion}</span>
            </div>
          )}

          {fechaLimite && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Límite: {format(fechaLimite, "dd/MM/yyyy", { locale: es })}</span>
            </div>
          )}

          {noConformidad.nombre_comunidad && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{noConformidad.nombre_comunidad}</span>
            </div>
          )}
        </div>

        {/* Comentario de seguimiento si existe */}
        {noConformidad.comentario_seguimiento && (
          <div className="mt-2 pt-2 border-t border-neutral-100">
            <div className="flex items-start gap-1">
              <User className="w-3 h-3 text-disabled mt-0.5 flex-shrink-0" />
              <p className="text-xs text-text-secondary line-clamp-1 flex-1">
                {noConformidad.comentario_seguimiento}
              </p>
            </div>
          </div>
        )}
      </Card>
    </Link>
  );
}
