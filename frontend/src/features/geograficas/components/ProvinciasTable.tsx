import { DataTable, Badge, IconButton } from "@/shared/components/ui";
import { Edit, Trash2 } from "lucide-react";
import type { DataTableColumn } from "@/shared/components/ui";
import type { Provincia } from "../types/geografica.types";

interface ProvinciasTableProps {
  provincias: Provincia[];
  onRowClick?: (provincia: Provincia) => void;
  onEdit?: (provincia: Provincia) => void;
  onDelete?: (provincia: Provincia) => void;
  loading?: boolean;
}

export function ProvinciasTable({
  provincias,
  onRowClick,
  onEdit,
  onDelete,
  loading = false,
}: ProvinciasTableProps) {
  const columns: DataTableColumn<Provincia>[] = [
    {
      key: "nombre_provincia",
      label: "Nombre",
      sortable: true,
    },
    {
      key: "nombre_departamento",
      label: "Departamento",
      sortable: true,
      render: (provincia) => provincia.nombre_departamento || "-",
    },
    {
      key: "cantidad_municipios",
      label: "Municipios",
      render: (provincia) => provincia.cantidad_municipios || 0,
    },
    {
      key: "cantidad_comunidades",
      label: "Comunidades",
      render: (provincia) => provincia.cantidad_comunidades || 0,
    },
    {
      key: "cantidad_productores",
      label: "Productores",
      render: (provincia) => provincia.cantidad_productores || 0,
      hiddenOnMobile: true,
    },
    {
      key: "activo",
      label: "Estado",
      render: (provincia) => (
        <Badge variant={provincia.activo ? "success" : "error"}>
          {provincia.activo ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (provincia) => (
        <div className="flex items-center gap-1">
          {onEdit && (
            <IconButton
              icon={<Edit className="w-4 h-4" />}
              tooltip="Editar provincia"
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(provincia);
              }}
            />
          )}
          {onDelete && (
            <IconButton
              icon={<Trash2 className="w-4 h-4" />}
              tooltip="Eliminar provincia"
              variant="danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(provincia);
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
      data={provincias}
      onRowClick={onRowClick}
      loading={loading}
      emptyMessage="No hay provincias registradas"
      rowKey="id_provincia"
    />
  );
}
