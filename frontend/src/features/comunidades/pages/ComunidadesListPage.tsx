import { useState } from "react";
import { AdminLayout } from "@/shared/components/layout/AdminLayout";
import { GerenteLayout } from "@/shared/components/layout/GerenteLayout";
import { TecnicoLayout } from "@/shared/components/layout/TecnicoLayout";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import {
  Button,
  Select,
  type SelectOption,
} from "@/shared/components/ui";
import { ComunidadesList } from "../components/ComunidadesList";
import { CreateComunidadModal } from "../components/CreateComunidadModal";
import { EditComunidadModal } from "../components/EditComunidadModal";
import { useComunidades } from "../hooks/useComunidades";
import { useDeleteComunidad } from "../hooks/useDeleteComunidad";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { Plus, Filter } from "lucide-react";
import type { Comunidad } from "../types/comunidad.types";

export function ComunidadesListPage() {
  const permissions = usePermissions();

  // Seleccionar layout según rol
  const Layout = permissions.isAdmin() ? AdminLayout :
                 permissions.isGerente() ? GerenteLayout :
                 permissions.isTecnico() ? TecnicoLayout :
                 AdminLayout;

  const { comunidades, isLoading, filters, setFilters, refetch } =
    useComunidades();
  const { deleteComunidad } = useDeleteComunidad();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedComunidad, setSelectedComunidad] = useState<Comunidad | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);

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
        `¿Estás seguro de que deseas ${comunidad.activo ? 'desactivar' : 'activar'} la comunidad "${comunidad.nombre_comunidad}"?`
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

  const filterOptions: SelectOption[] = [
    { value: "all", label: "Todas las comunidades" },
    { value: "sin_tecnicos", label: "Sin técnicos asignados" },
  ];

  return (
    <Layout title="Comunidades">
      <PageContainer
        title="Gestión de Comunidades"
        description="Administra las comunidades del programa"
        actions={
          <div className="flex gap-2">
            <Button
              size="small"
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
            </Button>
            {canCreate && (
              <Button
                size="small"
                variant="primary"
                onClick={() => setCreateModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nueva Comunidad</span>
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          {/* Filtros */}
          {showFilters && (
            <div className="p-4 bg-white border rounded-lg border-neutral-border">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Select
                  options={filterOptions}
                  value={filters.sin_tecnicos ? "sin_tecnicos" : "all"}
                  onChange={(value) =>
                    setFilters({
                      ...filters,
                      sin_tecnicos: value === "sin_tecnicos",
                    })
                  }
                  placeholder="Filtrar por estado"
                />
              </div>
            </div>
          )}

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
