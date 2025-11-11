// src/features/usuarios/components/UsuariosList.tsx

import { Badge, DataTable, IconButton } from "@/shared/components/ui";
import { Edit, Trash2, CheckCircle } from "lucide-react";
import type { DataTableColumn } from "@/shared/components/ui";
import type { Usuario } from "../types/usuario.types";

interface UsuariosListProps {
  usuarios: Usuario[];
  onEdit: (usuario: Usuario) => void;
  onDelete: (usuario: Usuario) => void;
  onRowClick?: (usuario: Usuario) => void;
  loading?: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export function UsuariosList({
  usuarios,
  onEdit,
  onDelete,
  onRowClick,
  loading = false,
  canEdit,
  canDelete,
}: UsuariosListProps) {
  // Configuracion de columnas
  const columns: DataTableColumn<Usuario>[] = [
    {
      key: "username",
      label: "Usuario",
      sortable: true,
      render: (usuario) => (
        <div>
          <p className="font-medium text-text-primary">{usuario.username}</p>
          <p className="text-sm text-text-secondary">{usuario.email}</p>
        </div>
      ),
    },
    {
      key: "nombre_completo",
      label: "Nombre Completo",
      sortable: true,
      mobileLabel: "Nombre",
    },
    {
      key: "nombre_rol",
      label: "Rol",
      sortable: true,
      render: (usuario) => {
        const rolColors: Record<string, string> = {
          administrador: "info",
          gerente: "warning",
          tecnico: "success",
        };

        const variant =
          rolColors[usuario.nombre_rol.toLowerCase()] || "neutral";

        return (
          <Badge variant={variant as "info" | "warning" | "success" | "neutral"}>
            {usuario.nombre_rol}
          </Badge>
        );
      },
    },
    {
      key: "comunidades",
      label: "Comunidades",
      hiddenOnMobile: true,
      render: (usuario) =>
        usuario.comunidades && usuario.comunidades.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {usuario.comunidades.map((c) => (
              <span
                key={c.id_comunidad}
                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-primary/10 text-primary"
              >
                {c.nombre_comunidad}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-sm text-text-secondary">-</span>
        ),
    },
    {
      key: "last_login",
      label: "Último acceso",
      hiddenOnMobile: true,
      render: (usuario) =>
        usuario.last_login
          ? new Date(usuario.last_login).toLocaleDateString()
          : "Nunca",
    },
    {
      key: "activo",
      label: "Estado",
      render: (usuario) => (
        <Badge variant={usuario.activo ? "success" : "error"}>
          {usuario.activo ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "acciones",
      label: "Acciones",
      render: (usuario) => (
        <div className="flex items-center gap-1">
          {canEdit && (
            <IconButton
              icon={<Edit className="w-4 h-4" />}
              tooltip="Editar usuario"
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(usuario);
              }}
            />
          )}

          {canDelete && (
            <IconButton
              icon={
                usuario.activo ? (
                  <Trash2 className="w-4 h-4" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )
              }
              tooltip={usuario.activo ? "Desactivar usuario" : "Activar usuario"}
              variant={usuario.activo ? "danger" : "success"}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(usuario);
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
      data={usuarios}
      onRowClick={onRowClick}
      loading={loading}
      emptyMessage="No se encontraron usuarios"
      rowKey="id_usuario"
    />
  );
}
