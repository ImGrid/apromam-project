import { Badge, DataTable } from "@/shared/components/ui";
import { Edit, Trash2, CheckCircle } from "lucide-react";
import type { DataTableColumn } from "@/shared/components/ui";
import type { TipoCultivo } from "../types/catalogo.types";

interface TiposCultivoListProps {
  tiposCultivo: TipoCultivo[];
  onEdit: (tipoCultivo: TipoCultivo) => void;
  onToggleActivo: (tipoCultivo: TipoCultivo) => void;
  onRowClick?: (tipoCultivo: TipoCultivo) => void;
  loading?: boolean;
  canEdit: boolean;
  canToggleActivo: boolean;
}

export function TiposCultivoList({
  tiposCultivo,
  onEdit,
  onToggleActivo,
  onRowClick,
  loading = false,
  canEdit,
  canToggleActivo,
}: TiposCultivoListProps) {
  const columns: DataTableColumn<TipoCultivo>[] = [
    {
      key: "nombre_cultivo",
      label: "Nombre",
      sortable: true,
      render: (tipoCultivo) => (
        <div>
          <p className="font-medium text-text-primary">
            {tipoCultivo.nombre_cultivo}
          </p>
          {tipoCultivo.descripcion && (
            <p className="text-sm text-text-secondary">
              {tipoCultivo.descripcion}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "es_principal_certificable",
      label: "Principal Certificable",
      sortable: true,
      render: (tipoCultivo) => (
        <Badge variant={tipoCultivo.es_principal_certificable ? "success" : "neutral"}>
          {tipoCultivo.es_principal_certificable ? "Sí" : "No"}
        </Badge>
      ),
    },
    {
      key: "rendimiento_promedio_qq_ha",
      label: "Rendimiento (qq/ha)",
      hiddenOnMobile: true,
      render: (tipoCultivo) =>
        tipoCultivo.rendimiento_promedio_qq_ha
          ? tipoCultivo.rendimiento_promedio_qq_ha.toFixed(2)
          : "-",
    },
    {
      key: "activo",
      label: "Estado",
      render: (tipoCultivo) => (
        <Badge variant={tipoCultivo.activo ? "success" : "error"}>
          {tipoCultivo.activo ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "acciones",
      label: "Acciones",
      render: (tipoCultivo) => (
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(tipoCultivo);
              }}
              className="p-2 transition-colors rounded text-primary hover:bg-primary/10 touch-target"
              aria-label="Editar tipo de cultivo"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          {canToggleActivo && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleActivo(tipoCultivo);
              }}
              className={`p-2 transition-colors rounded touch-target ${
                tipoCultivo.activo
                  ? "text-error hover:bg-error/10"
                  : "text-success hover:bg-success/10"
              }`}
              aria-label={
                tipoCultivo.activo
                  ? "Desactivar tipo de cultivo"
                  : "Activar tipo de cultivo"
              }
              title={tipoCultivo.activo ? "Desactivar" : "Activar"}
            >
              {tipoCultivo.activo ? (
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
      data={tiposCultivo}
      onRowClick={onRowClick}
      loading={loading}
      emptyMessage="No se encontraron tipos de cultivo"
      rowKey="id_tipo_cultivo"
    />
  );
}
