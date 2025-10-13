import { Users, Leaf, MapPin } from "lucide-react";
import { Button, Badge } from "@/shared/components/ui";
import type { Comunidad } from "../types/comunidad.types";

interface ComunidadCardProps {
  comunidad: Comunidad;
  onEdit?: () => void;
  onClose?: () => void;
  canEdit?: boolean;
}

export function ComunidadCard({
  comunidad,
  onEdit,
  onClose,
  canEdit = false,
}: ComunidadCardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-bold text-text-primary">
            {comunidad.nombre_comunidad}
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            Código: {comunidad.abreviatura_comunidad}
          </p>
        </div>
        <Badge variant={comunidad.activo ? "success" : "error"}>
          {comunidad.activo ? "Activo" : "Inactivo"}
        </Badge>
      </div>

      {/* Ubicacion */}
      <div className="p-4 border rounded-lg bg-neutral-bg border-neutral-border">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-text-primary">Ubicación</h4>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Provincia:</span>
            <span className="font-medium text-text-primary">
              {comunidad.nombre_provincia}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Municipio:</span>
            <span className="font-medium text-text-primary">
              {comunidad.nombre_municipio}
            </span>
          </div>
        </div>
      </div>

      {/* Estadisticas */}
      <div className="grid grid-cols-2 gap-4">
        {/* Tecnicos */}
        <div className="p-4 border rounded-lg border-neutral-border">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-text-secondary">
              Técnicos
            </span>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {comunidad.cantidad_tecnicos || 0}
          </p>
        </div>

        {/* Productores */}
        <div className="p-4 border rounded-lg border-neutral-border">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-5 h-5 text-success" />
            <span className="text-sm font-medium text-text-secondary">
              Productores
            </span>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {comunidad.cantidad_productores || 0}
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-3 pt-4 border-t border-neutral-border">
        {canEdit && onEdit && (
          <Button variant="primary" onClick={onEdit} fullWidth>
            Editar Comunidad
          </Button>
        )}
        {onClose && (
          <Button variant="secondary" onClick={onClose} fullWidth>
            Cerrar
          </Button>
        )}
      </div>
    </div>
  );
}
