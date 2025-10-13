import { useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { AdminLayout } from "@/shared/components/layout/AdminLayout";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Button, Alert } from "@/shared/components/ui";
import { PermissionGate } from "@/shared/components/layout/PermissionGate";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { TiposCultivoList } from "../components/TiposCultivoList";
import { GestionesTable } from "../components/GestionesTable";
import { CreateTipoCultivoModal } from "../components/CreateTipoCultivoModal";
import { EditTipoCultivoModal } from "../components/EditTipoCultivoModal";
import { CreateGestionModal } from "../components/CreateGestionModal";
import { EditGestionModal } from "../components/EditGestionModal";
import { useTiposCultivo } from "../hooks/useTiposCultivo";
import { useGestiones } from "../hooks/useGestiones";
import { useUpdateTipoCultivo } from "../hooks/useUpdateTipoCultivo";
import { useUpdateGestion } from "../hooks/useUpdateGestion";
import type { TipoCultivo, Gestion } from "../types/catalogo.types";

type TabType = "tipos-cultivo" | "gestiones";

export function CatalogosManagePage() {
  const permissions = usePermissions();
  const [activeTab, setActiveTab] = useState<TabType>("tipos-cultivo");

  // Tipos de Cultivo
  const {
    tiposCultivo,
    isLoading: loadingTiposCultivo,
    error: errorTiposCultivo,
    total: totalTiposCultivo,
    refetch: refetchTiposCultivo,
  } = useTiposCultivo();

  const { toggleActivo: toggleActivoTipoCultivo } = useUpdateTipoCultivo();

  const [createTipoCultivoModalOpen, setCreateTipoCultivoModalOpen] =
    useState(false);
  const [editTipoCultivoModalOpen, setEditTipoCultivoModalOpen] =
    useState(false);
  const [selectedTipoCultivo, setSelectedTipoCultivo] =
    useState<TipoCultivo | null>(null);

  // Gestiones
  const {
    gestiones,
    gestionActual,
    isLoading: loadingGestiones,
    error: errorGestiones,
    total: totalGestiones,
    refetch: refetchGestiones,
  } = useGestiones();

  const { toggleActiva: toggleActivaGestion } = useUpdateGestion();

  const [createGestionModalOpen, setCreateGestionModalOpen] = useState(false);
  const [editGestionModalOpen, setEditGestionModalOpen] = useState(false);
  const [selectedGestion, setSelectedGestion] = useState<Gestion | null>(null);

  // Permisos (admin y gerente pueden editar)
  const canEdit = permissions.canAccess("catalogos", "edit");
  const canDelete = permissions.canAccess("catalogos", "delete");

  // Handlers para Tipos de Cultivo
  const handleEditTipoCultivo = (tipoCultivo: TipoCultivo) => {
    setSelectedTipoCultivo(tipoCultivo);
    setEditTipoCultivoModalOpen(true);
  };

  const handleToggleActivoTipoCultivo = async (tipoCultivo: TipoCultivo) => {
    try {
      await toggleActivoTipoCultivo(tipoCultivo);
      refetchTiposCultivo();
    } catch {
      // Error ya manejado
    }
  };

  // Handlers para Gestiones
  const handleEditGestion = (gestion: Gestion) => {
    setSelectedGestion(gestion);
    setEditGestionModalOpen(true);
  };

  const handleToggleActivaGestion = async (gestion: Gestion) => {
    try {
      await toggleActivaGestion(gestion);
      refetchGestiones();
    } catch {
      // Error ya manejado
    }
  };

  // Refetch handlers
  const handleRefetch = () => {
    if (activeTab === "tipos-cultivo") {
      refetchTiposCultivo();
    } else {
      refetchGestiones();
    }
  };

  const handleSuccessTipoCultivo = () => {
    refetchTiposCultivo();
  };

  const handleSuccessGestion = () => {
    refetchGestiones();
  };

  return (
    <AdminLayout title="Catálogos">
      <PageContainer
        title="Gestión de Catálogos"
        description="Administra tipos de cultivo y gestiones agrícolas"
        actions={
          <div className="flex gap-2">
            <Button
              size="small"
              variant="secondary"
              onClick={handleRefetch}
              disabled={
                activeTab === "tipos-cultivo"
                  ? loadingTiposCultivo
                  : loadingGestiones
              }
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  activeTab === "tipos-cultivo"
                    ? loadingTiposCultivo
                      ? "animate-spin"
                      : ""
                    : loadingGestiones
                      ? "animate-spin"
                      : ""
                }`}
              />
            </Button>

            <PermissionGate permission="createCatalogo">
              {activeTab === "tipos-cultivo" ? (
                <Button
                  size="small"
                  variant="primary"
                  onClick={() => setCreateTipoCultivoModalOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nuevo Tipo Cultivo</span>
                </Button>
              ) : (
                <Button
                  size="small"
                  variant="primary"
                  onClick={() => setCreateGestionModalOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nueva Gestión</span>
                </Button>
              )}
            </PermissionGate>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Tabs */}
          <div className="border-b border-neutral-border">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("tipos-cultivo")}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === "tipos-cultivo"
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                Tipos de Cultivo
              </button>
              <button
                onClick={() => setActiveTab("gestiones")}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === "gestiones"
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                Gestiones
              </button>
            </div>
          </div>

          {/* Tipos de Cultivo Tab */}
          {activeTab === "tipos-cultivo" && (
            <>
              {errorTiposCultivo && (
                <Alert
                  type="error"
                  message={errorTiposCultivo}
                  onClose={() => refetchTiposCultivo()}
                />
              )}

              {!loadingTiposCultivo && (
                <div className="text-sm text-text-secondary">
                  Mostrando {tiposCultivo.length} de {totalTiposCultivo} tipos
                  de cultivo
                </div>
              )}

              <TiposCultivoList
                tiposCultivo={tiposCultivo}
                onEdit={handleEditTipoCultivo}
                onToggleActivo={handleToggleActivoTipoCultivo}
                loading={loadingTiposCultivo}
                canEdit={canEdit}
                canToggleActivo={canDelete}
              />
            </>
          )}

          {/* Gestiones Tab */}
          {activeTab === "gestiones" && (
            <>
              {errorGestiones && (
                <Alert
                  type="error"
                  message={errorGestiones}
                  onClose={() => refetchGestiones()}
                />
              )}

              {!loadingGestiones && (
                <div className="text-sm text-text-secondary">
                  Mostrando {gestiones.length} de {totalGestiones} gestiones
                </div>
              )}

              <GestionesTable
                gestiones={gestiones}
                gestionActual={gestionActual}
                onEdit={handleEditGestion}
                onToggleActiva={handleToggleActivaGestion}
                loading={loadingGestiones}
                canEdit={canEdit}
                canToggleActiva={canDelete}
              />
            </>
          )}
        </div>
      </PageContainer>

      {/* Modales de Tipos de Cultivo */}
      <CreateTipoCultivoModal
        isOpen={createTipoCultivoModalOpen}
        onClose={() => setCreateTipoCultivoModalOpen(false)}
        onSuccess={handleSuccessTipoCultivo}
      />

      {selectedTipoCultivo && (
        <EditTipoCultivoModal
          isOpen={editTipoCultivoModalOpen}
          onClose={() => {
            setEditTipoCultivoModalOpen(false);
            setSelectedTipoCultivo(null);
          }}
          tipoCultivo={selectedTipoCultivo}
          onSuccess={handleSuccessTipoCultivo}
        />
      )}

      {/* Modales de Gestiones */}
      <CreateGestionModal
        isOpen={createGestionModalOpen}
        onClose={() => setCreateGestionModalOpen(false)}
        onSuccess={handleSuccessGestion}
      />

      {selectedGestion && (
        <EditGestionModal
          isOpen={editGestionModalOpen}
          onClose={() => {
            setEditGestionModalOpen(false);
            setSelectedGestion(null);
          }}
          gestion={selectedGestion}
          onSuccess={handleSuccessGestion}
        />
      )}
    </AdminLayout>
  );
}
