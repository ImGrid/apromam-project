/**
 * GestionesTable
 * Tabla de gestiones con opción de activar
 * Solo para administrador
 */

import { Badge, DataTable, Button } from "@/shared/components/ui";
import { CheckCircle } from "lucide-react";
import type { DataTableColumn } from "@/shared/components/ui";
import type { Gestion } from "../types/gestion.types";

interface GestionesTableProps {
  gestiones: Gestion[];
  gestionActiva: Gestion | null;
  onActivar: (gestion: Gestion) => void;
  loading?: boolean;
  isActivating?: boolean;
}

export function GestionesTable({
  gestiones,
  gestionActiva,
  onActivar,
  loading = false,
  isActivating = false,
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
          {gestion.activo_sistema && (
            <Badge variant="success" size="small">
              Activa
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "acciones",
      label: "Acciones",
      render: (gestion) => (
        <Button
          size="small"
          variant={gestion.activo_sistema ? "secondary" : "primary"}
          onClick={(e) => {
            e.stopPropagation();
            onActivar(gestion);
          }}
          disabled={gestion.activo_sistema || !gestion.activa || isActivating}
        >
          {gestion.activo_sistema ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Activa</span>
            </>
          ) : (
            "Activar"
          )}
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={gestiones}
      loading={loading}
      emptyMessage="No hay gestiones disponibles"
      rowKey="id_gestion"
    />
  );
}
