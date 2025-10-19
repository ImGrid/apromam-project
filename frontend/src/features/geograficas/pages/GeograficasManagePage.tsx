// frontend/src/features/geograficas/pages/GeograficasManagePage.tsx

import { useState } from "react";
import { AdminLayout } from "@/shared/components/layout/AdminLayout";
import { GerenteLayout } from "@/shared/components/layout/GerenteLayout";
import { TecnicoLayout } from "@/shared/components/layout/TecnicoLayout";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Button } from "@/shared/components/ui";
import { DepartamentosTable } from "../components/DepartamentosTable";
import { ProvinciasTable } from "../components/ProvinciasTable";
import { MunicipiosTable } from "../components/MunicipiosTable";
import { CreateDepartamentoModal } from "../components/CreateDepartamentoModal";
import { CreateProvinciaModal } from "../components/CreateProvinciaModal";
import { CreateMunicipioModal } from "../components/CreateMunicipioModal";
import { EditDepartamentoModal } from "../components/EditDepartamentoModal";
import { EditProvinciaModal } from "../components/EditProvinciaModal";
import { EditMunicipioModal } from "../components/EditMunicipioModal";
import { ProvinciasSelect } from "../components/ProvinciasSelect";
import { ComunidadesList } from "@/features/comunidades/components/ComunidadesList";
import { CreateComunidadModal } from "@/features/comunidades/components/CreateComunidadModal";
import { EditComunidadModal } from "@/features/comunidades/components/EditComunidadModal";
import { useProvincias } from "../hooks/useProvincias";
import { useMunicipios } from "../hooks/useMunicipios";
import { useDepartamentos } from "../hooks/useDepartamentos";
import { useDeleteDepartamento } from "../hooks/useDeleteDepartamento";
import { useDeleteProvincia } from "../hooks/useDeleteProvincia";
import { useDeleteMunicipio } from "../hooks/useDeleteMunicipio";
import { useComunidades } from "@/features/comunidades/hooks/useComunidades";
import { useDeleteComunidad } from "@/features/comunidades/hooks/useDeleteComunidad";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { Plus } from "lucide-react";
import type { Departamento, Provincia, Municipio } from "../types/geografica.types";
import type { Comunidad } from "@/features/comunidades/types/comunidad.types";

type TabType = "departamentos" | "provincias" | "municipios" | "comunidades";

export function GeograficasManagePage() {
  const permissions = usePermissions();
  const [activeTab, setActiveTab] = useState<TabType>("departamentos");

  // Seleccionar layout según rol
  const Layout = permissions.isAdmin() ? AdminLayout :
                 permissions.isGerente() ? GerenteLayout :
                 permissions.isTecnico() ? TecnicoLayout :
                 AdminLayout;
  const [departamentoModalOpen, setDepartamentoModalOpen] = useState(false);
  const [provinciaModalOpen, setProvinciaModalOpen] = useState(false);
  const [municipioModalOpen, setMunicipioModalOpen] = useState(false);
  const [comunidadModalOpen, setComunidadModalOpen] = useState(false);
  const [editDepartamentoModalOpen, setEditDepartamentoModalOpen] = useState(false);
  const [editProvinciaModalOpen, setEditProvinciaModalOpen] = useState(false);
  const [editMunicipioModalOpen, setEditMunicipioModalOpen] = useState(false);
  const [editComunidadModalOpen, setEditComunidadModalOpen] = useState(false);
  const [selectedDepartamento, setSelectedDepartamento] = useState<Departamento | null>(null);
  const [selectedProvincia, setSelectedProvincia] = useState<Provincia | null>(null);
  const [selectedMunicipio, setSelectedMunicipio] = useState<Municipio | null>(null);
  const [selectedComunidad, setSelectedComunidad] = useState<Comunidad | null>(null);
  const [selectedProvinciaFilter, setSelectedProvinciaFilter] = useState<
    string | undefined
  >();

  const {
    departamentos,
    isLoading: loadingDepartamentos,
    refetch: refetchDepartamentos,
  } = useDepartamentos();

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

  const {
    comunidades,
    isLoading: loadingComunidades,
    refetch: refetchComunidades,
  } = useComunidades();

  const { deleteDepartamento } = useDeleteDepartamento();
  const { deleteProvincia } = useDeleteProvincia();
  const { deleteMunicipio } = useDeleteMunicipio();
  const { deleteComunidad } = useDeleteComunidad();

  const canCreate = permissions.canAccess("geograficas", "create");
  const canEdit = permissions.canAccess("geograficas", "edit");
  const canDelete = permissions.canAccess("geograficas", "delete");

  const handleDepartamentoSuccess = () => {
    refetchDepartamentos();
  };

  const handleProvinciaSuccess = () => {
    refetchProvincias();
  };

  const handleMunicipioSuccess = () => {
    refetchMunicipios();
  };

  const handleComunidadSuccess = () => {
    refetchComunidades();
  };

  const handleEditDepartamento = (departamento: Departamento) => {
    setSelectedDepartamento(departamento);
    setEditDepartamentoModalOpen(true);
  };

  const handleEditProvincia = (provincia: Provincia) => {
    setSelectedProvincia(provincia);
    setEditProvinciaModalOpen(true);
  };

  const handleEditMunicipio = (municipio: Municipio) => {
    setSelectedMunicipio(municipio);
    setEditMunicipioModalOpen(true);
  };

  const handleDeleteDepartamento = async (departamento: Departamento) => {
    if (
      window.confirm(
        `¿Estás seguro de que deseas ${departamento.activo ? 'desactivar' : 'activar'} el departamento "${departamento.nombre_departamento}"?`
      )
    ) {
      try {
        await deleteDepartamento(departamento.id_departamento);
        refetchDepartamentos();
      } catch (error) {
        // Error manejado por el hook
      }
    }
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

  const handleEditComunidad = (comunidad: Comunidad) => {
    setSelectedComunidad(comunidad);
    setEditComunidadModalOpen(true);
  };

  const handleDeleteComunidad = async (comunidad: Comunidad) => {
    if (
      window.confirm(
        `¿Estás seguro de que deseas ${comunidad.activo ? 'desactivar' : 'activar'} la comunidad "${comunidad.nombre_comunidad}"?`
      )
    ) {
      try {
        await deleteComunidad(comunidad.id_comunidad);
        refetchComunidades();
      } catch (error) {
        // Error manejado por el hook
      }
    }
  };

  const getTabLabel = () => {
    switch (activeTab) {
      case "departamentos":
        return "Nuevo Departamento";
      case "provincias":
        return "Nueva Provincia";
      case "municipios":
        return "Nuevo Municipio";
      case "comunidades":
        return "Nueva Comunidad";
    }
  };

  const handleCreate = () => {
    switch (activeTab) {
      case "departamentos":
        setDepartamentoModalOpen(true);
        break;
      case "provincias":
        setProvinciaModalOpen(true);
        break;
      case "municipios":
        setMunicipioModalOpen(true);
        break;
      case "comunidades":
        setComunidadModalOpen(true);
        break;
    }
  };

  return (
    <Layout title="Gestión Geográfica">
      <PageContainer
        title="Gestión Geográfica"
        description="Administra departamentos, provincias, municipios y comunidades"
        actions={
          canCreate ? (
            <Button
              size="small"
              variant="primary"
              onClick={handleCreate}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{getTabLabel()}</span>
            </Button>
          ) : undefined
        }
      >
        <div className="space-y-6">
          {/* Tabs */}
          <div className="border-b border-neutral-border">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("departamentos")}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === "departamentos"
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                Departamentos
              </button>
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
              <button
                onClick={() => setActiveTab("comunidades")}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === "comunidades"
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                Comunidades
              </button>
            </div>
          </div>

          {/* Departamentos Tab */}
          {activeTab === "departamentos" && (
            <>
              {!loadingDepartamentos && (
                <div className="text-sm text-text-secondary">
                  Mostrando {departamentos.length} departamentos
                </div>
              )}

              <DepartamentosTable
                departamentos={departamentos}
                loading={loadingDepartamentos}
                onEdit={canEdit ? handleEditDepartamento : undefined}
                onDelete={canDelete ? handleDeleteDepartamento : undefined}
              />
            </>
          )}

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

          {/* Comunidades Tab */}
          {activeTab === "comunidades" && (
            <>
              {!loadingComunidades && (
                <div className="text-sm text-text-secondary">
                  Mostrando {comunidades.length} comunidades
                </div>
              )}

              <ComunidadesList
                comunidades={comunidades}
                loading={loadingComunidades}
                onEdit={canEdit ? handleEditComunidad : undefined}
                onDelete={canDelete ? handleDeleteComunidad : undefined}
              />
            </>
          )}
        </div>
      </PageContainer>

      {/* Modales */}
      <CreateDepartamentoModal
        isOpen={departamentoModalOpen}
        onClose={() => setDepartamentoModalOpen(false)}
        onSuccess={handleDepartamentoSuccess}
      />

      <EditDepartamentoModal
        isOpen={editDepartamentoModalOpen}
        onClose={() => setEditDepartamentoModalOpen(false)}
        departamento={selectedDepartamento}
        onSuccess={handleDepartamentoSuccess}
      />

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

      <CreateComunidadModal
        isOpen={comunidadModalOpen}
        onClose={() => setComunidadModalOpen(false)}
        onSuccess={handleComunidadSuccess}
      />

      <EditComunidadModal
        isOpen={editComunidadModalOpen}
        onClose={() => setEditComunidadModalOpen(false)}
        comunidad={selectedComunidad}
        onSuccess={handleComunidadSuccess}
      />
    </Layout>
  );
}
