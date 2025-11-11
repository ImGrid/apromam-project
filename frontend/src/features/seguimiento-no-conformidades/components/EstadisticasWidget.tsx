// Widget compacto de estadísticas de No Conformidades
// Diseño consistente con el resto del sistema (StatCard pattern)

import { useEstadisticasNC } from "../hooks";
import type { EstadisticasNCQuery } from "../types";
import { AlertTriangle, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface EstadisticasWidgetProps {
  filters?: EstadisticasNCQuery;
}

export function EstadisticasWidget({ filters }: EstadisticasWidgetProps) {
  const { data: stats, isLoading } = useEstadisticasNC(filters);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-20 bg-neutral-100 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: "Total",
      value: stats.total,
      icon: AlertTriangle,
      iconColor: "text-text-secondary",
      iconBg: "bg-neutral-100",
    },
    {
      label: "Pendientes",
      value: stats.por_estado.pendiente,
      icon: AlertCircle,
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
    },
    {
      label: "En Seguimiento",
      value: stats.por_estado.seguimiento,
      icon: Clock,
      iconColor: "text-info",
      iconBg: "bg-info/10",
    },
    {
      label: "Corregidas",
      value: stats.por_estado.corregido,
      icon: CheckCircle2,
      iconColor: "text-success",
      iconBg: "bg-success/10",
    },
  ];

  return (
    <div className="space-y-3">
      {/* Stat Cards Grid - Diseño compacto según research */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, iconColor, iconBg }) => (
          <div
            key={label}
            className="p-4 bg-white border rounded-lg border-neutral-border"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-text-secondary uppercase tracking-wide mb-0.5">
                  {label}
                </p>
                <p className="text-2xl font-bold text-text-primary">{value}</p>
              </div>
              <div className={`p-3 rounded-lg ${iconBg}`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alertas adicionales si hay vencidas o próximas a vencer */}
      {(stats.vencidas > 0 || stats.proximas_vencer > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stats.vencidas > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-error-50 border border-error-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-error-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-secondary">Vencidas</p>
                <p className="text-lg font-semibold text-error-600">{stats.vencidas}</p>
              </div>
            </div>
          )}
          {stats.proximas_vencer > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-warning-50 border border-warning-200 rounded-lg">
              <Clock className="w-4 h-4 text-warning-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-secondary">Próximas a Vencer</p>
                <p className="text-lg font-semibold text-warning-600">
                  {stats.proximas_vencer}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
