/**
 * Lista compacta de fichas en revision
 * Muestra fichas esperando aprobacion del gerente
 */

import { useNavigate } from "react-router-dom";
import { Clock, User, MapPin } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { ROUTES } from "@/shared/config/routes.config";

interface Ficha {
  id_ficha: string;
  codigo_productor: string;
  nombre_productor?: string;
  nombre_comunidad: string;
  fecha_inspeccion: string;
  inspector_interno: string;
  dias_en_revision: number;
}

interface FichasPendientesListProps {
  fichas: Ficha[];
  loading?: boolean;
}

export function FichasPendientesList({
  fichas,
  loading = false,
}: FichasPendientesListProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 bg-white border rounded-lg animate-pulse border-neutral-border"
          >
            <div className="w-1/3 h-4 mb-2 rounded bg-neutral-bg" />
            <div className="w-1/2 h-3 rounded bg-neutral-bg" />
          </div>
        ))}
      </div>
    );
  }

  if (fichas.length === 0) {
    return (
      <div className="p-6 text-center bg-white border rounded-lg border-neutral-border">
        <p className="text-sm text-text-secondary">
          No hay fichas pendientes de revisión
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {fichas.map((ficha) => (
        <div
          key={ficha.id_ficha}
          className="p-4 transition-shadow bg-white border rounded-lg border-neutral-border hover:shadow-md"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Info de la ficha */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-text-primary">
                  {ficha.codigo_productor}
                </h4>
                {ficha.nombre_productor && (
                  <span className="text-sm text-text-secondary">
                    - {ficha.nombre_productor}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{ficha.nombre_comunidad}</span>
                </div>

                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{ficha.inspector_interno}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {new Date(ficha.fecha_inspeccion).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Badge y accion */}
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  ficha.dias_en_revision > 7
                    ? "bg-error/10 text-error"
                    : ficha.dias_en_revision > 3
                    ? "bg-warning/10 text-warning"
                    : "bg-info/10 text-info"
                }`}
              >
                {ficha.dias_en_revision}{" "}
                {ficha.dias_en_revision === 1 ? "día" : "días"}
              </span>

              <Button
                size="small"
                variant="primary"
                onClick={() => navigate(ROUTES.FICHAS_DETAIL(ficha.id_ficha))}
              >
                Revisar
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
