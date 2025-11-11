// frontend/src/features/geograficas/pages/GeograficasManagePage.tsx

import { useState } from "react";
import { AdminLayout } from "@/shared/components/layout/AdminLayout";
import { GerenteLayout } from "@/shared/components/layout/GerenteLayout";
import { TecnicoLayout } from "@/shared/components/layout/TecnicoLayout";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Button, ConfirmModal } from "@/shared/components/ui";
import { DepartamentosTable } from "../components/DepartamentosTable";
import { ProvinciasTable } from "../components/ProvinciasTable";
import { MunicipiosTable } from "../components/MunicipiosTable";
import { DepartamentosFilters } from "../components/DepartamentosFilters";
import { ProvinciasFilters } from "../components/ProvinciasFilters";
import { MunicipiosFilters } from "../components/MunicipiosFilters";
import { CreateDepartamentoModal } from "../components/CreateDepartamentoModal";
import { CreateProvinciaModal } from "../components/CreateProvinciaModal";
import { CreateMunicipioModal } from "../components/CreateMunicipioModal";
import { EditDepartamentoModal } from "../components/EditDepartamentoModal";
import { EditProvinciaModal } from "../components/EditProvinciaModal";
import { EditMunicipioModal } from "../components/EditMunicipioModal";
import { ComunidadesList } from "@/features/comunidades/components/ComunidadesList";
import { ComunidadesFilters } from "@/features/comunidades/components/ComunidadesFilters";
import { CreateComunidadModal } from "@/features/comunidades/components/CreateComunidadModal";
import { EditComunidadModal } from "@/features/comunidades/components/EditComunidadModal";
import { useProvincias } from "../hooks/useProvincias";
import { useMunicipios } from "../hooks/useMunicipios";
import { useDepartamentos } from "../hooks/useDepartamentos";
import { useHardDeleteDepartamento } from "../hooks/useHardDeleteDepartamento";
import { useHardDeleteProvincia } from "../hooks/useHardDeleteProvincia";
import { useHardDeleteMunicipio } from "../hooks/useHardDeleteMunicipio";
import { useComunidades } from "@/features/comunidades/hooks/useComunidades";
import { useDeleteComunidad } from "@/features/comunidades/hooks/useDeleteComunidad";
import { useHardDeleteComunidad } from "@/features/comunidades/hooks/useHardDeleteComunidad";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { Plus } from "lucide-react";
import type { Departamento, Provincia, Municipio, DepartamentosFilters as DepartamentosFiltersType, ProvinciasFilters as ProvinciasFiltersType, MunicipiosFilters as MunicipiosFiltersType } from "../types/geografica.types";
import type { Comunidad, ComunidadFilters as ComunidadFiltersType } from "@/features/comunidades/types/comunidad.types";

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

  // Estados de filtros
  const [departamentosFilters, setDepartamentosFilters] = useState<DepartamentosFiltersType>({});
  const [provinciasFilters, setProvinciasFilters] = useState<ProvinciasFiltersType>({});
  const [municipiosFilters, setMunicipiosFilters] = useState<MunicipiosFiltersType>({});
  const [comunidadesFilters, setComunidadesFilters] = useState<ComunidadFiltersType>({});

  const {
    departamentos,
    isLoading: loadingDepartamentos,
    refetch: refetchDepartamentos,
  } = useDepartamentos(departamentosFilters);

  const {
    provincias,
    isLoading: loadingProvincias,
    refetch: refetchProvincias,
  } = useProvincias(provinciasFilters);

  const {
    municipios,
    isLoading: loadingMunicipios,
    refetch: refetchMunicipios,
  } = useMunicipios(municipiosFilters);

  const {
    comunidades,
    isLoading: loadingComunidades,
    refetch: refetchComunidades,
  } = useComunidades(comunidadesFilters);

  const { hardDeleteDepartamento, isLoading: isHardDeletingDept } = useHardDeleteDepartamento();
  const { hardDeleteProvincia, isLoading: isHardDeletingProv } = useHardDeleteProvincia();
  const { hardDeleteMunicipio, isLoading: isHardDeletingMun } = useHardDeleteMunicipio();
  const { deleteComunidad } = useDeleteComunidad();
  const { hardDeleteComunidad, isLoading: isHardDeletingCom } = useHardDeleteComunidad();

  // Estados para modales de confirmación
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'soft-delete' | 'hard-delete';
    entity: 'departamento' | 'provincia' | 'municipio' | 'comunidad';
    item: any;
  } | null>(null);

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

  const handleDeleteDepartamento = (departamento: Departamento) => {
    setConfirmModal({
      isOpen: true,
      type: 'hard-delete',
      entity: 'departamento',
      item: departamento,
    });
  };

  const handleDeleteProvincia = (provincia: Provincia) => {
    setConfirmModal({
      isOpen: true,
      type: 'hard-delete',
      entity: 'provincia',
      item: provincia,
    });
  };

  const handleDeleteMunicipio = (municipio: Municipio) => {
    setConfirmModal({
      isOpen: true,
      type: 'hard-delete',
      entity: 'municipio',
      item: municipio,
    });
  };

  const handleEditComunidad = (comunidad: Comunidad) => {
    setSelectedComunidad(comunidad);
    setEditComunidadModalOpen(true);
  };

  const handleDeleteComunidad = (comunidad: Comunidad) => {
    setConfirmModal({
      isOpen: true,
      type: 'hard-delete',
      entity: 'comunidad',
      item: comunidad,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal) return;

    const { type, entity, item } = confirmModal;

    try {
      if (type === 'hard-delete') {
        switch (entity) {
          case 'departamento':
            await hardDeleteDepartamento(item.id_departamento);
            refetchDepartamentos();
            break;
          case 'provincia':
            await hardDeleteProvincia(item.id_provincia);
            refetchProvincias();
            break;
          case 'municipio':
            await hardDeleteMunicipio(item.id_municipio);
            refetchMunicipios();
            break;
          case 'comunidad':
            await hardDeleteComunidad(item.id_comunidad);
            refetchComunidades();
            break;
        }
      } else if (type === 'soft-delete') {
        // Soft delete solo para comunidades (no tiene modal de edición todavía)
        if (entity === 'comunidad') {
          await deleteComunidad(item.id_comunidad);
          refetchComunidades();
        }
      }
      setConfirmModal(null);
    } catch (error) {
      // Error manejado por los hooks
    }
  };

  const getConfirmModalProps = () => {
    if (!confirmModal) return null;

    const { type, entity, item } = confirmModal;
    const isHardDelete = type === 'hard-delete';

    let title = '';
    let message = '';
    let confirmText = '';
    let modalType: 'danger' | 'warning' = 'warning';

    if (isHardDelete) {
      modalType = 'danger';
      confirmText = 'Eliminar Permanentemente';

      switch (entity) {
        case 'departamento':
          title = '¿Eliminar departamento permanentemente?';
          message = `Esta acción ELIMINARÁ PERMANENTEMENTE "${item.nombre_departamento}" de la base de datos. Esta acción NO se puede deshacer. Solo se puede eliminar si no tiene provincias asociadas.`;
          break;
        case 'provincia':
          title = '¿Eliminar provincia permanentemente?';
          message = `Esta acción ELIMINARÁ PERMANENTEMENTE "${item.nombre_provincia}" de la base de datos. Esta acción NO se puede deshacer. Solo se puede eliminar si no tiene municipios asociados.`;
          break;
        case 'municipio':
          title = '¿Eliminar municipio permanentemente?';
          message = `Esta acción ELIMINARÁ PERMANENTEMENTE "${item.nombre_municipio}" de la base de datos. Esta acción NO se puede deshacer. Solo se puede eliminar si no tiene comunidades asociadas.`;
          break;
        case 'comunidad':
          title = '¿Eliminar comunidad permanentemente?';
          message = `Esta acción ELIMINARÁ PERMANENTEMENTE "${item.nombre_comunidad}" de la base de datos. Esta acción NO se puede deshacer. Solo se puede eliminar si no tiene usuarios ni productores asociados.`;
          break;
      }
    } else {
      const action = item.activo ? 'desactivar' : 'activar';
      confirmText = item.activo ? 'Desactivar' : 'Activar';

      switch (entity) {
        case 'departamento':
          title = `¿${action.charAt(0).toUpperCase() + action.slice(1)} departamento?`;
          message = `¿Estás seguro de que deseas ${action} el departamento "${item.nombre_departamento}"?`;
          break;
        case 'provincia':
          title = `¿${action.charAt(0).toUpperCase() + action.slice(1)} provincia?`;
          message = `¿Estás seguro de que deseas ${action} la provincia "${item.nombre_provincia}"?`;
          break;
        case 'municipio':
          title = `¿${action.charAt(0).toUpperCase() + action.slice(1)} municipio?`;
          message = `¿Estás seguro de que deseas ${action} el municipio "${item.nombre_municipio}"?`;
          break;
        case 'comunidad':
          title = `¿${action.charAt(0).toUpperCase() + action.slice(1)} comunidad?`;
          message = `¿Estás seguro de que deseas ${action} la comunidad "${item.nombre_comunidad}"?`;
          break;
      }
    }

    const isLoading = isHardDelete
      ? (entity === 'departamento' ? isHardDeletingDept :
         entity === 'provincia' ? isHardDeletingProv :
         entity === 'municipio' ? isHardDeletingMun :
         entity === 'comunidad' ? isHardDeletingCom : false)
      : false;

    return {
      title,
      message,
      confirmText,
      type: modalType,
      isLoading,
    };
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
          {/* Tabs - Responsive con scroll horizontal en móviles */}
          <div className="border-b border-neutral-border">
            <div className="flex gap-2 sm:gap-4 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab("departamentos")}
                className={`px-3 sm:px-4 py-2 font-medium text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === "departamentos"
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                Departamentos
              </button>
              <button
                onClick={() => setActiveTab("provincias")}
                className={`px-3 sm:px-4 py-2 font-medium text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === "provincias"
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                Provincias
              </button>
              <button
                onClick={() => setActiveTab("municipios")}
                className={`px-3 sm:px-4 py-2 font-medium text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === "municipios"
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                Municipios
              </button>
              <button
                onClick={() => setActiveTab("comunidades")}
                className={`px-3 sm:px-4 py-2 font-medium text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
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
              <DepartamentosFilters
                filters={departamentosFilters}
                onFiltersChange={setDepartamentosFilters}
                onClearFilters={() => setDepartamentosFilters({})}
              />

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
              <ProvinciasFilters
                filters={provinciasFilters}
                onFiltersChange={setProvinciasFilters}
                onClearFilters={() => setProvinciasFilters({})}
              />

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
              <MunicipiosFilters
                filters={municipiosFilters}
                onFiltersChange={setMunicipiosFilters}
                onClearFilters={() => setMunicipiosFilters({})}
              />

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
              <ComunidadesFilters
                filters={comunidadesFilters}
                onFiltersChange={setComunidadesFilters}
                onClearFilters={() => setComunidadesFilters({})}
              />

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

      {/* Modal de confirmación */}
      {confirmModal && getConfirmModalProps() && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(null)}
          onConfirm={handleConfirmAction}
          {...getConfirmModalProps()!}
        />
      )}
    </Layout>
  );
}
