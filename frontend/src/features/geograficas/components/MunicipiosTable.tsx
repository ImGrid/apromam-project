import { DataTable, Badge } from "@/shared/components/ui";
import type { DataTableColumn } from "@/shared/components/ui";
import type { Municipio } from "../types/geografica.types";

interface MunicipiosTableProps {
  municipios: Municipio[];
  onRowClick?: (municipio: Municipio) => void;
  loading?: boolean;
}

export function MunicipiosTable({
  municipios,
  onRowClick,
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
