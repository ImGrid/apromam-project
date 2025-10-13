import { Badge, DataTable } from "@/shared/components/ui";
import { Edit, Trash2, CheckCircle, Star } from "lucide-react";
import type { DataTableColumn } from "@/shared/components/ui";
import type { Gestion } from "../types/catalogo.types";

interface GestionesTableProps {
  gestiones: Gestion[];
  gestionActual: Gestion | null;
  onEdit: (gestion: Gestion) => void;
  onToggleActiva: (gestion: Gestion) => void;
  onRowClick?: (gestion: Gestion) => void;
  loading?: boolean;
  canEdit: boolean;
  canToggleActiva: boolean;
}

export function GestionesTable({
  gestiones,
  gestionActual,
  onEdit,
  onToggleActiva,
  onRowClick,
  loading = false,
  canEdit,
  canToggleActiva,
}: GestionesTableProps) {
  const columns: DataTableColumn<Gestion>[] = [
    {
      key: "anio_gestion",
      label: "Año",
      sortable: true,
      render: (gestion) => (
        <div className="flex items-center gap-2">
          <p className="font-medium text-text-primary">
            {gestion.anio_gestion}
          </p>
          {gestionActual?.id_gestion === gestion.id_gestion && (
            <Star className="w-4 h-4 text-warning fill-warning" />
          )}
        </div>
      ),
    },
    {
      key: "descripcion",
      label: "Descripción",
      hiddenOnMobile: true,
      render: (gestion) => gestion.descripcion || "-",
    },
    {
      key: "fecha_inicio",
      label: "Fecha Inicio",
      hiddenOnMobile: true,
      render: (gestion) =>
        gestion.fecha_inicio
          ? new Date(gestion.fecha_inicio).toLocaleDateString()
          : "-",
    },
    {
      key: "fecha_fin",
      label: "Fecha Fin",
      hiddenOnMobile: true,
      render: (gestion) =>
        gestion.fecha_fin
          ? new Date(gestion.fecha_fin).toLocaleDateString()
          : "-",
    },
    {
      key: "estado_gestion",
      label: "Estado",
      sortable: true,
      render: (gestion) => {
        const estadoColors: Record<string, "info" | "success" | "neutral"> = {
          planificada: "info",
          activa: "success",
          finalizada: "neutral",
        };

        const variant = estadoColors[gestion.estado_gestion] || "neutral";

        return (
          <Badge variant={variant}>
            {gestion.estado_gestion.charAt(0).toUpperCase() +
              gestion.estado_gestion.slice(1)}
          </Badge>
        );
      },
    },
    {
      key: "activa",
      label: "Activa",
      render: (gestion) => (
        <Badge variant={gestion.activa ? "success" : "error"}>
          {gestion.activa ? "Sí" : "No"}
        </Badge>
      ),
    },
    {
      key: "acciones",
      label: "Acciones",
      render: (gestion) => (
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(gestion);
              }}
              className="p-2 transition-colors rounded text-primary hover:bg-primary/10 touch-target"
              aria-label="Editar gestión"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          {canToggleActiva && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleActiva(gestion);
              }}
              className={`p-2 transition-colors rounded touch-target ${
                gestion.activa
                  ? "text-error hover:bg-error/10"
                  : "text-success hover:bg-success/10"
              }`}
              aria-label={
                gestion.activa ? "Desactivar gestión" : "Activar gestión"
              }
              title={gestion.activa ? "Desactivar" : "Activar"}
            >
              {gestion.activa ? (
                <Trash2 className="w-4 h-4" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={gestiones}
      onRowClick={onRowClick}
      loading={loading}
      emptyMessage="No se encontraron gestiones"
      rowKey="id_gestion"
    />
  );
}
