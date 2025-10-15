// src/features/usuarios/pages/UsuariosListPage.tsx

import { useState } from "react";
import { UserPlus, RefreshCw } from "lucide-react";
import { AdminLayout } from "@/shared/components/layout/AdminLayout";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Button, Alert, Modal } from "@/shared/components/ui";
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
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

  // Permisos
  const canEdit = permissions.canAccess("usuarios", "edit");
  const canDelete = permissions.canAccess("usuarios", "delete");

  // Ver detalle de usuario
  const handleRowClick = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setDetailModalOpen(true);
  };

  // Abrir modal de edicion desde detalle
  const handleEditFromDetail = () => {
    setDetailModalOpen(false);
    setEditModalOpen(true);
  };

  // Abrir modal de edicion directamente
  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setEditModalOpen(true);
  };

  // Desactivar usuario
  const handleDelete = async (usuario: Usuario) => {
    try {
      await deleteUsuario(usuario);
      refetch();
      // Cerrar modal de detalle si el usuario eliminado es el seleccionado
      if (selectedUsuario?.id_usuario === usuario.id_usuario) {
        setDetailModalOpen(false);
        setSelectedUsuario(null);
      }
    } catch {
      // Error ya manejado
    }
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

          {/* Lista de usuarios */}
          <UsuariosList
            usuarios={usuarios}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRowClick={handleRowClick}
            loading={isLoading}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        </div>
      </PageContainer>

      {/* Modal Crear */}
      <CreateUsuarioModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleSuccess}
      />

      {/* Modal Detalle */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedUsuario(null);
        }}
        title="Detalle de Usuario"
        size="medium"
      >
        {selectedUsuario && (
          <UsuarioCard
            usuario={selectedUsuario}
            onEdit={canEdit ? handleEditFromDetail : undefined}
            onDeactivate={() => handleDelete(selectedUsuario)}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        )}
      </Modal>

      {/* Modal Editar */}
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
