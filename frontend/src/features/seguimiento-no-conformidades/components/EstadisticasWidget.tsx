// Widget compacto de estadísticas de No Conformidades
// Diseño basado en research: stat cards compactos con p-3

import { Card } from "@/shared/components/ui/Card";
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
            className="h-20 bg-gray-100 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  // Stat cards compactos (p-3 según research)
  const statCards = [
    {
      label: "Total",
      value: stats.total,
      icon: AlertTriangle,
      color: "text-gray-600",
      bg: "bg-gray-50",
      border: "border-gray-200",
    },
    {
      label: "Pendientes",
      value: stats.por_estado.pendiente,
      icon: AlertCircle,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
    },
    {
      label: "En Seguimiento",
      value: stats.por_estado.seguimiento,
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      label: "Corregidas",
      value: stats.por_estado.corregido,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
    },
  ];

  return (
    <div className="space-y-3">
      {/* Stat Cards Grid - Diseño compacto según research */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, color, bg, border }) => (
          <Card
            key={label}
            compact
            className={`${bg} ${border} border`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">
                  {label}
                </p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
              <Icon className={`w-6 h-6 ${color} flex-shrink-0`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Alertas adicionales si hay vencidas o próximas a vencer */}
      {(stats.vencidas > 0 || stats.proximas_vencer > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stats.vencidas > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600">Vencidas</p>
                <p className="text-lg font-semibold text-red-600">{stats.vencidas}</p>
              </div>
            </div>
          )}
          {stats.proximas_vencer > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
              <Clock className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600">Próximas a Vencer</p>
                <p className="text-lg font-semibold text-orange-600">
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
