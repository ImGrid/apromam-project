import { DataTable, Badge, IconButton } from "@/shared/components/ui";
import { Edit, Trash2 } from "lucide-react";
import type { DataTableColumn } from "@/shared/components/ui";
import type { Departamento } from "../types/geografica.types";

interface DepartamentosTableProps {
  departamentos: Departamento[];
  onRowClick?: (departamento: Departamento) => void;
  onEdit?: (departamento: Departamento) => void;
  onDelete?: (departamento: Departamento) => void;
  loading?: boolean;
}

export function DepartamentosTable({
  departamentos,
  onRowClick,
  onEdit,
  onDelete,
  loading = false,
}: DepartamentosTableProps) {
  const columns: DataTableColumn<Departamento>[] = [
    {
      key: "nombre_departamento",
      label: "Nombre",
      sortable: true,
    },
    {
      key: "cantidad_provincias",
      label: "Provincias",
      render: (departamento) => departamento.cantidad_provincias || 0,
    },
    {
      key: "cantidad_municipios",
      label: "Municipios",
      render: (departamento) => departamento.cantidad_municipios || 0,
    },
    {
      key: "cantidad_comunidades",
      label: "Comunidades",
      render: (departamento) => departamento.cantidad_comunidades || 0,
    },
    {
      key: "cantidad_productores",
      label: "Productores",
      render: (departamento) => departamento.cantidad_productores || 0,
      hiddenOnMobile: true,
    },
    {
      key: "activo",
      label: "Estado",
      render: (departamento) => (
        <Badge variant={departamento.activo ? "success" : "error"}>
          {departamento.activo ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (departamento) => (
        <div className="flex items-center gap-1">
          {onEdit && (
            <IconButton
              icon={<Edit className="w-4 h-4" />}
              tooltip="Editar departamento"
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(departamento);
              }}
            />
          )}
          {onDelete && (
            <IconButton
              icon={<Trash2 className="w-4 h-4" />}
              tooltip="Eliminar departamento"
              variant="danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(departamento);
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
      data={departamentos}
      onRowClick={onRowClick}
      loading={loading}
      emptyMessage="No hay departamentos registrados"
      rowKey="id_departamento"
    />
  );
}
