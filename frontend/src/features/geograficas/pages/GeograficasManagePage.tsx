// frontend/src/features/geograficas/pages/GeograficasManagePage.tsx

import { useState } from "react";
import { AdminLayout } from "@/shared/components/layout/AdminLayout";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Button } from "@/shared/components/ui";
import { ProvinciasTable } from "../components/ProvinciasTable";
import { MunicipiosTable } from "../components/MunicipiosTable";
import { CreateProvinciaModal } from "../components/CreateProvinciaModal";
import { CreateMunicipioModal } from "../components/CreateMunicipioModal";
import { EditProvinciaModal } from "../components/EditProvinciaModal";
import { EditMunicipioModal } from "../components/EditMunicipioModal";
import { ProvinciasSelect } from "../components/ProvinciasSelect";
import { useProvincias } from "../hooks/useProvincias";
import { useMunicipios } from "../hooks/useMunicipios";
import { useDeleteProvincia } from "../hooks/useDeleteProvincia";
import { useDeleteMunicipio } from "../hooks/useDeleteMunicipio";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { Plus } from "lucide-react";
import type { Provincia, Municipio } from "../types/geografica.types";

type TabType = "provincias" | "municipios";

export function GeograficasManagePage() {
  const permissions = usePermissions();
  const [activeTab, setActiveTab] = useState<TabType>("provincias");
  const [provinciaModalOpen, setProvinciaModalOpen] = useState(false);
  const [municipioModalOpen, setMunicipioModalOpen] = useState(false);
  const [editProvinciaModalOpen, setEditProvinciaModalOpen] = useState(false);
  const [editMunicipioModalOpen, setEditMunicipioModalOpen] = useState(false);
  const [selectedProvincia, setSelectedProvincia] = useState<Provincia | null>(null);
  const [selectedMunicipio, setSelectedMunicipio] = useState<Municipio | null>(null);
  const [selectedProvinciaFilter, setSelectedProvinciaFilter] = useState<
    string | undefined
  >();

  const {
    provincias,
    isLoading: loadingProvincias,
    refetch: refetchProvincias,
  } = useProvincias();

  const {
    municipios,
    isLoading: loadingMunicipios,
    refetch: refetchMunicipios,
  } = useMunicipios(selectedProvinciaFilter);

  const { deleteProvincia } = useDeleteProvincia();
  const { deleteMunicipio } = useDeleteMunicipio();

  const canCreate = permissions.canAccess("geograficas", "create");
  const canEdit = permissions.canAccess("geograficas", "edit");
  const canDelete = permissions.canAccess("geograficas", "delete");

  const handleProvinciaSuccess = () => {
    refetchProvincias();
  };

  const handleMunicipioSuccess = () => {
    refetchMunicipios();
  };

  const handleEditProvincia = (provincia: Provincia) => {
    setSelectedProvincia(provincia);
    setEditProvinciaModalOpen(true);
  };

  const handleEditMunicipio = (municipio: Municipio) => {
    setSelectedMunicipio(municipio);
    setEditMunicipioModalOpen(true);
  };

  const handleDeleteProvincia = async (provincia: Provincia) => {
    if (
      window.confirm(
        `¿Estás seguro de que deseas ${provincia.activo ? 'desactivar' : 'activar'} la provincia "${provincia.nombre_provincia}"?`
      )
    ) {
      try {
        await deleteProvincia(provincia.id_provincia);
        refetchProvincias();
      } catch (error) {
        // Error manejado por el hook
      }
    }
  };

  const handleDeleteMunicipio = async (municipio: Municipio) => {
    if (
      window.confirm(
        `¿Estás seguro de que deseas ${municipio.activo ? 'desactivar' : 'activar'} el municipio "${municipio.nombre_municipio}"?`
      )
    ) {
      try {
        await deleteMunicipio(municipio.id_municipio);
        refetchMunicipios();
      } catch (error) {
        // Error manejado por el hook
      }
    }
  };

  return (
    <AdminLayout title="Gestión Geográfica">
      <PageContainer
        title="Gestión Geográfica"
        description="Administra provincias y municipios"
        actions={
          canCreate ? (
            <Button
              size="small"
              variant="primary"
              onClick={() =>
                activeTab === "provincias"
                  ? setProvinciaModalOpen(true)
                  : setMunicipioModalOpen(true)
              }
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">
                {activeTab === "provincias"
                  ? "Nueva Provincia"
                  : "Nuevo Municipio"}
              </span>
            </Button>
          ) : undefined
        }
      >
        <div className="space-y-6">
          {/* Tabs */}
          <div className="border-b border-neutral-border">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("provincias")}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === "provincias"
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                Provincias
              </button>
              <button
                onClick={() => setActiveTab("municipios")}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === "municipios"
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                Municipios
              </button>
            </div>
          </div>

          {/* Provincias Tab */}
          {activeTab === "provincias" && (
            <>
              {!loadingProvincias && (
                <div className="text-sm text-text-secondary">
                  Mostrando {provincias.length} provincias
                </div>
              )}

              <ProvinciasTable
                provincias={provincias}
                loading={loadingProvincias}
                onEdit={canEdit ? handleEditProvincia : undefined}
                onDelete={canDelete ? handleDeleteProvincia : undefined}
              />
            </>
          )}

          {/* Municipios Tab */}
          {activeTab === "municipios" && (
            <>
              {/* Filtro por provincia */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-text-secondary">
                  Filtrar por provincia:
                </span>
                <div className="w-64">
                  <ProvinciasSelect
                    value={selectedProvinciaFilter}
                    onChange={setSelectedProvinciaFilter}
                    placeholder="Todas las provincias"
                  />
                </div>
                {selectedProvinciaFilter && (
                  <Button
                    size="small"
                    variant="ghost"
                    onClick={() => setSelectedProvinciaFilter(undefined)}
                  >
                    Limpiar
                  </Button>
                )}
              </div>

              {!loadingMunicipios && (
                <div className="text-sm text-text-secondary">
                  Mostrando {municipios.length} municipios
                </div>
              )}

              <MunicipiosTable
                municipios={municipios}
                loading={loadingMunicipios}
                onEdit={canEdit ? handleEditMunicipio : undefined}
                onDelete={canDelete ? handleDeleteMunicipio : undefined}
              />
            </>
          )}
        </div>
      </PageContainer>

      {/* Modales */}
      <CreateProvinciaModal
        isOpen={provinciaModalOpen}
        onClose={() => setProvinciaModalOpen(false)}
        onSuccess={handleProvinciaSuccess}
      />

      <CreateMunicipioModal
        isOpen={municipioModalOpen}
        onClose={() => setMunicipioModalOpen(false)}
        onSuccess={handleMunicipioSuccess}
      />

      <EditProvinciaModal
        isOpen={editProvinciaModalOpen}
        onClose={() => setEditProvinciaModalOpen(false)}
        provincia={selectedProvincia}
        onSuccess={handleProvinciaSuccess}
      />

      <EditMunicipioModal
        isOpen={editMunicipioModalOpen}
        onClose={() => setEditMunicipioModalOpen(false)}
        municipio={selectedMunicipio}
        onSuccess={handleMunicipioSuccess}
      />
    </AdminLayout>
  );
}
