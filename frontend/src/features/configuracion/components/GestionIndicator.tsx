/**
 * GestionIndicator
 * Badge que muestra la gestión activa del sistema en el header
 * Se muestra para TODOS los usuarios
 */

import { Calendar } from "lucide-react";
import { Badge } from "@/shared/components/ui";
import { useGestionActiva } from "../hooks/useGestionActiva";

export function GestionIndicator() {
  const { gestionActiva, isLoading } = useGestionActiva();

  if (isLoading) {
    return (
      <Badge variant="neutral" size="small">
        <Calendar className="w-3 h-3" />
        Cargando...
      </Badge>
    );
  }

  if (!gestionActiva) {
    return null;
  }

  return (
    <Badge
      variant="success"
      size="small"
      icon={<Calendar className="w-3 h-3" />}
    >
      Gestión {gestionActiva.anio_gestion}
    </Badge>
  );
}
