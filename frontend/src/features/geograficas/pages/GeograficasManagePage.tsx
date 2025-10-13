// frontend/src/features/geograficas/pages/GeograficasManagePage.tsx

import { useState } from "react";
import { AdminLayout } from "@/shared/components/layout/AdminLayout";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Button } from "@/shared/components/ui";
import { ProvinciasTable } from "../components/ProvinciasTable";
import { MunicipiosTable } from "../components/MunicipiosTable";
import { CreateProvinciaModal } from "../components/CreateProvinciaModal";
import { CreateMunicipioModal } from "../components/CreateMunicipioModal";
import { ProvinciasSelect } from "../components/ProvinciasSelect";
import { useProvincias } from "../hooks/useProvincias";
import { useMunicipios } from "../hooks/useMunicipios";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { Plus } from "lucide-react";

type TabType = "provincias" | "municipios";

export function GeograficasManagePage() {
  const permissions = usePermissions();
  const [activeTab, setActiveTab] = useState<TabType>("provincias");
  const [provinciaModalOpen, setProvinciaModalOpen] = useState(false);
  const [municipioModalOpen, setMunicipioModalOpen] = useState(false);
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

  const canCreate = permissions.canAccess("geograficas", "create");

  const handleProvinciaSuccess = () => {
    refetchProvincias();
  };

  const handleMunicipioSuccess = () => {
    refetchMunicipios();
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
          <div className="bg-white border rounded-lg border-neutral-border">
            <div className="flex border-b border-neutral-border">
              <button
                onClick={() => setActiveTab("provincias")}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === "provincias"
                    ? "text-primary border-b-2 border-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Provincias
              </button>
              <button
                onClick={() => setActiveTab("municipios")}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === "municipios"
                    ? "text-primary border-b-2 border-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Municipios
              </button>
            </div>

            <div className="p-6">
              {activeTab === "provincias" ? (
                <ProvinciasTable
                  provincias={provincias}
                  loading={loadingProvincias}
                />
              ) : (
                <div className="space-y-4">
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

                  <MunicipiosTable
                    municipios={municipios}
                    loading={loadingMunicipios}
                  />
                </div>
              )}
            </div>
          </div>
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
    </AdminLayout>
  );
}
