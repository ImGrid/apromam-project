// Badge de estado de seguimiento de No Conformidad
// Usa el componente Badge reutilizable con variantes específicas

import { Badge } from "@/shared/components/ui/Badge";
import type { EstadoSeguimiento } from "../types";
import { ESTADO_SEGUIMIENTO_LABELS } from "../types";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";

interface EstadoSeguimientoBadgeProps {
  estado: EstadoSeguimiento;
  size?: "small" | "medium";
}

// Configuración de variantes por estado
const ESTADO_CONFIG: Record<
  EstadoSeguimiento,
  {
    variant: "success" | "warning" | "info";
    icon: typeof CheckCircle2;
  }
> = {
  pendiente: {
    variant: "warning",
    icon: AlertCircle,
  },
  seguimiento: {
    variant: "info",
    icon: Clock,
  },
  corregido: {
    variant: "success",
    icon: CheckCircle2,
  },
};

export function EstadoSeguimientoBadge({
  estado,
  size = "small",
}: EstadoSeguimientoBadgeProps) {
  const config = ESTADO_CONFIG[estado];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} size={size} icon={<Icon className="w-3 h-3" />}>
      {ESTADO_SEGUIMIENTO_LABELS[estado]}
    </Badge>
  );
}
