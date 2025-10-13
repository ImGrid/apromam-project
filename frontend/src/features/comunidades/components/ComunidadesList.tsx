import { DataTable, Badge } from "@/shared/components/ui";
import type { DataTableColumn } from "@/shared/components/ui";
import type { Comunidad } from "../types/comunidad.types";
import { AlertTriangle } from "lucide-react";

interface ComunidadesListProps {
  comunidades: Comunidad[];
  onRowClick?: (comunidad: Comunidad) => void;
  loading?: boolean;
}

export function ComunidadesList({
  comunidades,
  onRowClick,
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
