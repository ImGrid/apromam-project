// Sección para mostrar No Conformidades de una ficha
// Se usa en FichaDetailPage para mostrar las NC asociadas
// Diseño compacto basado en research

import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { NoConformidadCard } from "./NoConformidadCard";
import { EstadisticasWidget } from "./EstadisticasWidget";
import { useNoConformidadesByFicha } from "../hooks";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface NoConformidadesFichaSectionProps {
  idFicha: string;
}

export function NoConformidadesFichaSection({
  idFicha,
}: NoConformidadesFichaSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { data, isLoading } = useNoConformidadesByFicha(idFicha);

  if (isLoading) {
    return (
      <Card compact title="No Conformidades">
        <p className="text-sm text-neutral-500 text-center py-4">
          Cargando no conformidades...
        </p>
      </Card>
    );
  }

  const noConformidades = data?.no_conformidades || [];
  const total = data?.total || 0;

  if (total === 0) {
    return (
      <Card compact>
        <div className="flex items-center gap-3 p-4 bg-success-50 rounded-lg border border-success-200">
          <div className="flex-shrink-0">
            <svg
              className="w-10 h-10 text-success-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-success-900">
              Sin No Conformidades
            </h3>
            <p className="text-xs text-success-700 mt-0.5">
              No se detectaron incumplimientos en esta inspección
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning-600" />
          <h2 className="text-lg font-semibold text-neutral-900">
            No Conformidades ({total})
          </h2>
        </div>
        <Button
          variant="ghost"
          size="small"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              Ocultar
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              Mostrar
            </>
          )}
        </Button>
      </div>

      {isExpanded && (
        <>
          {/* Estadísticas mini */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(() => {
              const stats = {
                pendiente: noConformidades.filter((nc) => nc.estado_seguimiento === "pendiente").length,
                seguimiento: noConformidades.filter((nc) => nc.estado_seguimiento === "seguimiento").length,
                corregido: noConformidades.filter((nc) => nc.estado_seguimiento === "corregido").length,
              };

              return (
                <>
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-2">
                    <p className="text-xs text-neutral-500 uppercase">Total</p>
                    <p className="text-xl font-bold text-neutral-900">{total}</p>
                  </div>
                  <div className="bg-warning-50 border border-warning-200 rounded-lg p-2">
                    <p className="text-xs text-neutral-500 uppercase">Pendientes</p>
                    <p className="text-xl font-bold text-warning-600">
                      {stats.pendiente}
                    </p>
                  </div>
                  <div className="bg-info-50 border border-info-200 rounded-lg p-2">
                    <p className="text-xs text-neutral-500 uppercase">Seguimiento</p>
                    <p className="text-xl font-bold text-info-600">
                      {stats.seguimiento}
                    </p>
                  </div>
                  <div className="bg-success-50 border border-success-200 rounded-lg p-2">
                    <p className="text-xs text-neutral-500 uppercase">Corregidas</p>
                    <p className="text-xl font-bold text-success-600">
                      {stats.corregido}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Lista de NC - Grid compacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {noConformidades.map((nc) => (
              <NoConformidadCard key={nc.id_no_conformidad} noConformidad={nc} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
