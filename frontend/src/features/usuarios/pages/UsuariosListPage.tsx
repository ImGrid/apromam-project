// src/features/usuarios/pages/UsuariosListPage.tsx

import { useState } from "react";
import { UserPlus, RefreshCw } from "lucide-react";
import { AdminLayout } from "@/shared/components/layout/AdminLayout";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Button, Alert } from "@/shared/components/ui";
import { PermissionGate } from "@/shared/components/layout/PermissionGate";
import { UsuarioFilters } from "../components/UsuarioFilters";
import { UsuariosList } from "../components/UsuariosList";
import { UsuarioCard } from "../components/UsuarioCard";
import { EditUsuarioModal } from "../components/EditUsuarioModal";
import { CreateUsuarioModal } from "../components/CreateUsuarioModal";
import { useUsuarios } from "../hooks/useUsuarios";
import { useDeleteUsuario } from "../hooks/useDeleteUsuario";
import { usePermissions } from "@/shared/hooks/usePermissions";
import type { Usuario } from "../types/usuario.types";

export function UsuariosListPage() {
  const permissions = usePermissions();
  const { usuarios, isLoading, error, total, filters, setFilters, refetch } =
    useUsuarios();
  const { deleteUsuario } = useDeleteUsuario();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [detailUsuario, setDetailUsuario] = useState<Usuario | null>(null);

  // Permisos
  const canEdit = permissions.canAccess("usuarios", "edit");
  const canDelete = permissions.canAccess("usuarios", "delete");

  // Abrir modal de edicion
  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setEditModalOpen(true);
  };

  // Desactivar usuario
  const handleDelete = async (usuario: Usuario) => {
    try {
      await deleteUsuario(usuario.id_usuario);
      refetch();
      if (detailUsuario?.id_usuario === usuario.id_usuario) {
        setDetailUsuario(null);
      }
    } catch {
      // Error ya manejado
    }
  };

  // Ver detalle de usuario
  const handleRowClick = (usuario: Usuario) => {
    setDetailUsuario(usuario);
  };

  // Cerrar detalle
  const handleCloseDetail = () => {
    setDetailUsuario(null);
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setFilters({});
  };

  // Refrescar lista despues de crear/editar
  const handleSuccess = () => {
    refetch();
  };

  return (
    <AdminLayout title="Usuarios">
      <PageContainer
        title="Gestión de Usuarios"
        description="Administra usuarios del sistema"
        actions={
          <div className="flex gap-2">
            <Button
              size="small"
              variant="secondary"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>

            <PermissionGate permission="createUser">
              <Button
                size="small"
                variant="primary"
                onClick={() => setCreateModalOpen(true)}
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Nuevo Usuario</span>
              </Button>
            </PermissionGate>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Error global */}
          {error && (
            <Alert type="error" message={error} onClose={() => refetch()} />
          )}

          {/* Filtros */}
          <UsuarioFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClear={handleClearFilters}
          />

          {/* Contador de resultados */}
          {!isLoading && (
            <div className="text-sm text-text-secondary">
              Mostrando {usuarios.length} de {total} usuarios
            </div>
          )}

          {/* Vista: Detalle o Lista */}
          {detailUsuario ? (
            <div>
              <Button
                variant="ghost"
                size="small"
                onClick={handleCloseDetail}
                className="mb-4"
              >
                ← Volver a la lista
              </Button>

              <UsuarioCard
                usuario={detailUsuario}
                onEdit={() => handleEdit(detailUsuario)}
                onDeactivate={() => handleDelete(detailUsuario)}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            </div>
          ) : (
            <UsuariosList
              usuarios={usuarios}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRowClick={handleRowClick}
              loading={isLoading}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          )}
        </div>
      </PageContainer>

      {/* Modales */}
      <CreateUsuarioModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleSuccess}
      />

      {selectedUsuario && (
        <EditUsuarioModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedUsuario(null);
          }}
          usuario={selectedUsuario}
          onSuccess={handleSuccess}
        />
      )}
    </AdminLayout>
  );
}
