import { Badge, DataTable, IconButton } from "@/shared/components/ui";
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
  // Verificar si hay algún permiso de acción
  const hasActionPermissions = canEdit || canToggleActivo;

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
    // Solo agregar columna de acciones si hay permisos
    ...(hasActionPermissions
      ? [
          {
            key: "acciones" as const,
            label: "Acciones",
            render: (tipoCultivo: TipoCultivo) => (
              <div className="flex items-center gap-1">
                {canEdit && (
                  <IconButton
                    icon={<Edit className="w-4 h-4" />}
                    tooltip="Editar tipo de cultivo"
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(tipoCultivo);
                    }}
                  />
                )}

                {canToggleActivo && (
                  <IconButton
                    icon={
                      tipoCultivo.activo ? (
                        <Trash2 className="w-4 h-4" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )
                    }
                    tooltip={
                      tipoCultivo.activo
                        ? "Desactivar tipo de cultivo"
                        : "Activar tipo de cultivo"
                    }
                    variant={tipoCultivo.activo ? "danger" : "success"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleActivo(tipoCultivo);
                    }}
                  />
                )}
              </div>
            ),
          },
        ]
      : []),
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
