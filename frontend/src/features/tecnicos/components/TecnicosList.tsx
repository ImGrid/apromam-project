/**
 * Tabla de técnicos con acciones
 * Muestra lista de técnicos con comunidad asignada y acciones
 */

import { Building2, MapPin, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import {
  DataTable,
  Badge,
  IconButton,
  type DataTableColumn,
} from "@/shared/components/ui";
import type { Tecnico } from "../types/tecnico.types";

interface TecnicosListProps {
  tecnicos: Tecnico[];
  loading?: boolean;
  onEdit?: (tecnico: Tecnico) => void;
  onToggleActivo?: (tecnico: Tecnico) => void;
}

export function TecnicosList({
  tecnicos,
  loading = false,
  onEdit,
  onToggleActivo,
}: TecnicosListProps) {
  const columns: DataTableColumn<Tecnico>[] = [
    {
      key: "nombre_completo",
      label: "Nombre Completo",
      sortable: true,
      render: (tecnico) => (
        <div>
          <p className="font-medium text-text-primary">
            {tecnico.nombre_completo}
          </p>
          <p className="text-xs text-text-secondary">@{tecnico.username}</p>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      hiddenOnMobile: true,
      render: (tecnico) => (
        <span className="text-sm text-text-secondary">{tecnico.email}</span>
      ),
    },
    {
      key: "comunidades",
      label: "Comunidades Asignadas",
      sortable: true,
      render: (tecnico) =>
        tecnico.comunidades && tecnico.comunidades.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {tecnico.comunidades.map((c) => (
              <span
                key={c.id_comunidad}
                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-primary/10 text-primary"
              >
                {c.nombre_comunidad}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-text-secondary" />
            <span className="text-sm text-text-secondary">Sin asignar</span>
          </div>
        ),
    },
    {
      key: "activo",
      label: "Estado",
      sortable: true,
      render: (tecnico) => (
        <Badge variant={tecnico.activo ? "success" : "error"}>
          {tecnico.activo ? (
            <>
              <CheckCircle className="w-3 h-3" />
              Activo
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3" />
              Inactivo
            </>
          )}
        </Badge>
      ),
    },
    {
      key: "last_login",
      label: "Último Acceso",
      hiddenOnMobile: true,
      render: (tecnico) =>
        tecnico.last_login ? (
          <span className="text-xs text-text-secondary">
            {new Date(tecnico.last_login).toLocaleDateString("es-BO", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        ) : (
          <span className="text-xs text-text-secondary">Nunca</span>
        ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (tecnico) => (
        <div className="flex items-center gap-1">
          {/* Editar técnico */}
          {onEdit && (
            <IconButton
              icon={<Edit className="w-4 h-4" />}
              tooltip="Editar técnico"
              variant="primary"
              onClick={() => onEdit(tecnico)}
            />
          )}

          {/* Toggle activo */}
          {onToggleActivo && (
            <IconButton
              icon={
                tecnico.activo ? (
                  <Trash2 className="w-4 h-4" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )
              }
              tooltip={tecnico.activo ? "Desactivar técnico" : "Activar técnico"}
              variant={tecnico.activo ? "danger" : "success"}
              onClick={() => onToggleActivo(tecnico)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable<Tecnico>
      columns={columns}
      data={tecnicos}
      rowKey="id_usuario"
      loading={loading}
      emptyMessage="No se encontraron técnicos"
    />
  );
}
