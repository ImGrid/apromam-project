import { useState } from "react";
import { AdminLayout } from "@/shared/components/layout/AdminLayout";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import {
  Button,
  Modal,
  Select,
  type SelectOption,
} from "@/shared/components/ui";
import { ComunidadesList } from "../components/ComunidadesList";
import { ComunidadCard } from "../components/ComunidadCard";
import { ComunidadForm } from "../components/ComunidadForm";
import { useComunidades } from "../hooks/useComunidades";
import { useCreateComunidad } from "../hooks/useCreateComunidad";
import { useUpdateComunidad } from "../hooks/useUpdateComunidad";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { Plus, Filter } from "lucide-react";
import type { Comunidad } from "../types/comunidad.types";

export function ComunidadesListPage() {
  const permissions = usePermissions();
  const { comunidades, isLoading, filters, setFilters, refetch } =
    useComunidades();
  const { createComunidad, isLoading: isCreating } = useCreateComunidad();
  const { updateComunidad, isLoading: isUpdating } = useUpdateComunidad();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedComunidad, setSelectedComunidad] = useState<Comunidad | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);

  const canEdit = permissions.canAccess("comunidades", "edit");
  const canCreate = permissions.canAccess("comunidades", "create");

  const handleRowClick = (comunidad: Comunidad) => {
    setSelectedComunidad(comunidad);
    setDetailModalOpen(true);
  };

  const handleEdit = () => {
    setDetailModalOpen(false);
    setEditModalOpen(true);
  };

  const handleCreate = async (data: {
    nombre_comunidad: string;
    abreviatura_comunidad: string;
    id_municipio: string;
  }) => {
    await createComunidad(data);
    setCreateModalOpen(false);
    refetch();
  };

  const handleUpdate = async (data: {
    nombre_comunidad: string;
    abreviatura_comunidad: string;
    id_municipio: string;
    activo?: boolean;
  }) => {
    if (!selectedComunidad) return;
    await updateComunidad(selectedComunidad.id_comunidad, data);
    setEditModalOpen(false);
    setSelectedComunidad(null);
    refetch();
  };

  const filterOptions: SelectOption[] = [
    { value: "all", label: "Todas las comunidades" },
    { value: "sin_tecnicos", label: "Sin técnicos asignados" },
  ];

  return (
    <AdminLayout title="Comunidades">
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
            onRowClick={handleRowClick}
            loading={isLoading}
          />
        </div>
      </PageContainer>

      {/* Modal Crear */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Nueva Comunidad"
        size="medium"
      >
        <ComunidadForm
          onSubmit={handleCreate}
          onCancel={() => setCreateModalOpen(false)}
          isLoading={isCreating}
        />
      </Modal>

      {/* Modal Detalle */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedComunidad(null);
        }}
        title="Detalle de Comunidad"
        size="medium"
      >
        {selectedComunidad && (
          <ComunidadCard
            comunidad={selectedComunidad}
            onEdit={canEdit ? handleEdit : undefined}
            onClose={() => {
              setDetailModalOpen(false);
              setSelectedComunidad(null);
            }}
            canEdit={canEdit}
          />
        )}
      </Modal>

      {/* Modal Editar */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedComunidad(null);
        }}
        title="Editar Comunidad"
        size="medium"
      >
        {selectedComunidad && (
          <ComunidadForm
            comunidad={selectedComunidad}
            onSubmit={handleUpdate}
            onCancel={() => {
              setEditModalOpen(false);
              setSelectedComunidad(null);
            }}
            isLoading={isUpdating}
          />
        )}
      </Modal>
    </AdminLayout>
  );
}
