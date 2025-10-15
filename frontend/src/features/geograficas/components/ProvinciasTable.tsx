import { DataTable, Badge, Button } from "@/shared/components/ui";
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
            <Button
              variant="ghost"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(provincia);
              }}
              title="Editar provincia"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(provincia);
              }}
              title="Eliminar provincia"
            >
              <Trash2 className="w-4 h-4 text-error" />
            </Button>
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
