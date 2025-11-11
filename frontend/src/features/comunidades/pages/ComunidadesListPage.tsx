import { useState } from "react";
import { AdminLayout } from "@/shared/components/layout/AdminLayout";
import { GerenteLayout } from "@/shared/components/layout/GerenteLayout";
import { TecnicoLayout } from "@/shared/components/layout/TecnicoLayout";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Button } from "@/shared/components/ui";
import { ComunidadesList } from "../components/ComunidadesList";
import { ComunidadesFilters } from "../components/ComunidadesFilters";
import { CreateComunidadModal } from "../components/CreateComunidadModal";
import { EditComunidadModal } from "../components/EditComunidadModal";
import { useComunidades } from "../hooks/useComunidades";
import { useDeleteComunidad } from "../hooks/useDeleteComunidad";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { Plus } from "lucide-react";
import type { Comunidad } from "../types/comunidad.types";

export function ComunidadesListPage() {
  const permissions = usePermissions();

  // Seleccionar layout según rol
  const Layout = permissions.isAdmin()
    ? AdminLayout
    : permissions.isGerente()
    ? GerenteLayout
    : permissions.isTecnico()
    ? TecnicoLayout
    : AdminLayout;

  const { comunidades, isLoading, filters, setFilters, refetch } =
    useComunidades();
  const { deleteComunidad } = useDeleteComunidad();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedComunidad, setSelectedComunidad] = useState<Comunidad | null>(
    null
  );

  const canCreate = permissions.canAccess("comunidades", "create");
  const canEdit = permissions.canAccess("comunidades", "edit");
  const canDelete = permissions.canAccess("comunidades", "delete");

  const handleEdit = (comunidad: Comunidad) => {
    setSelectedComunidad(comunidad);
    setEditModalOpen(true);
  };

  const handleDelete = async (comunidad: Comunidad) => {
    if (
      window.confirm(
        `¿Estás seguro de que deseas ${
          comunidad.activo ? "desactivar" : "activar"
        } la comunidad "${comunidad.nombre_comunidad}"?`
      )
    ) {
      try {
        await deleteComunidad(comunidad.id_comunidad);
        refetch();
      } catch (error) {
        // Error manejado por el hook
      }
    }
  };

  const handleSuccess = () => {
    refetch();
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <Layout title="Comunidades">
      <PageContainer
        title="Gestión de Comunidades"
        description="Administra las comunidades del programa"
        actions={
          canCreate && (
            <Button
              size="small"
              variant="primary"
              onClick={() => setCreateModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Comunidad</span>
            </Button>
          )
        }
      >
        <div className="space-y-4">
          {/* Filtros */}
          <div className="p-4 bg-white border rounded-lg border-neutral-border">
            <ComunidadesFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Lista */}
          <ComunidadesList
            comunidades={comunidades}
            loading={isLoading}
            onEdit={canEdit ? handleEdit : undefined}
            onDelete={canDelete ? handleDelete : undefined}
          />
        </div>
      </PageContainer>

      {/* Modal Crear */}
      <CreateComunidadModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleSuccess}
      />

      {/* Modal Editar */}
      <EditComunidadModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        comunidad={selectedComunidad}
        onSuccess={handleSuccess}
      />
    </Layout>
  );
}
