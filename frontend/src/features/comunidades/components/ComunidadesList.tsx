import { DataTable, Badge, IconButton } from "@/shared/components/ui";
import { Edit, Trash2 } from "lucide-react";
import type { DataTableColumn } from "@/shared/components/ui";
import type { Comunidad } from "../types/comunidad.types";
import { AlertTriangle } from "lucide-react";

interface ComunidadesListProps {
  comunidades: Comunidad[];
  onRowClick?: (comunidad: Comunidad) => void;
  onEdit?: (comunidad: Comunidad) => void;
  onDelete?: (comunidad: Comunidad) => void;
  loading?: boolean;
}

export function ComunidadesList({
  comunidades,
  onRowClick,
  onEdit,
  onDelete,
  loading = false,
}: ComunidadesListProps) {
  const columns: DataTableColumn<Comunidad>[] = [
    {
      key: "nombre_comunidad",
      label: "Nombre",
      sortable: true,
      mobileLabel: "Comunidad",
    },
    {
      key: "abreviatura_comunidad",
      label: "Abreviatura",
      sortable: true,
      mobileLabel: "Abrev.",
    },
    {
      key: "nombre_municipio",
      label: "Municipio",
      sortable: true,
      hiddenOnMobile: true,
    },
    {
      key: "nombre_provincia",
      label: "Provincia",
      sortable: true,
      hiddenOnMobile: true,
    },
    {
      key: "cantidad_tecnicos",
      label: "Técnicos",
      render: (comunidad) => (
        <div className="flex items-center gap-2">
          <span>{comunidad.cantidad_tecnicos || 0}</span>
          {(!comunidad.cantidad_tecnicos || comunidad.cantidad_tecnicos === 0) && (
            <AlertTriangle className="w-4 h-4 text-warning" />
          )}
        </div>
      ),
    },
    {
      key: "cantidad_productores",
      label: "Productores",
      render: (comunidad) => comunidad.cantidad_productores || 0,
    },
    {
      key: "activo",
      label: "Estado",
      render: (comunidad) => (
        <Badge variant={comunidad.activo ? "success" : "error"}>
          {comunidad.activo ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (comunidad) => (
        <div className="flex items-center gap-1">
          {onEdit && (
            <IconButton
              icon={<Edit className="w-4 h-4" />}
              tooltip="Editar comunidad"
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(comunidad);
              }}
            />
          )}
          {onDelete && (
            <IconButton
              icon={<Trash2 className="w-4 h-4" />}
              tooltip="Eliminar comunidad"
              variant="danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(comunidad);
              }}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={comunidades}
      onRowClick={onRowClick}
      loading={loading}
      emptyMessage="No hay comunidades registradas"
      rowKey="id_comunidad"
    />
  );
}
