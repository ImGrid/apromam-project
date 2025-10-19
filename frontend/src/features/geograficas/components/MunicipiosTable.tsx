import { DataTable, Badge, IconButton } from "@/shared/components/ui";
import { Edit, Trash2 } from "lucide-react";
import type { DataTableColumn } from "@/shared/components/ui";
import type { Municipio } from "../types/geografica.types";

interface MunicipiosTableProps {
  municipios: Municipio[];
  onRowClick?: (municipio: Municipio) => void;
  onEdit?: (municipio: Municipio) => void;
  onDelete?: (municipio: Municipio) => void;
  loading?: boolean;
}

export function MunicipiosTable({
  municipios,
  onRowClick,
  onEdit,
  onDelete,
  loading = false,
}: MunicipiosTableProps) {
  const columns: DataTableColumn<Municipio>[] = [
    {
      key: "nombre_municipio",
      label: "Nombre",
      sortable: true,
    },
    {
      key: "nombre_provincia",
      label: "Provincia",
      sortable: true,
    },
    {
      key: "cantidad_comunidades",
      label: "Comunidades",
      render: (municipio) => municipio.cantidad_comunidades || 0,
    },
    {
      key: "cantidad_productores",
      label: "Productores",
      render: (municipio) => municipio.cantidad_productores || 0,
      hiddenOnMobile: true,
    },
    {
      key: "activo",
      label: "Estado",
      render: (municipio) => (
        <Badge variant={municipio.activo ? "success" : "error"}>
          {municipio.activo ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (municipio) => (
        <div className="flex items-center gap-1">
          {onEdit && (
            <IconButton
              icon={<Edit className="w-4 h-4" />}
              tooltip="Editar municipio"
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(municipio);
              }}
            />
          )}
          {onDelete && (
            <IconButton
              icon={<Trash2 className="w-4 h-4" />}
              tooltip="Eliminar municipio"
              variant="danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(municipio);
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
      data={municipios}
      onRowClick={onRowClick}
      loading={loading}
      emptyMessage="No hay municipios registrados"
      rowKey="id_municipio"
    />
  );
}
