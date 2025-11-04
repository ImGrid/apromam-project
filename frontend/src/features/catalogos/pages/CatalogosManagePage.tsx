import { useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { AdminLayout } from "@/shared/components/layout/AdminLayout";
import { GerenteLayout } from "@/shared/components/layout/GerenteLayout";
import { TecnicoLayout } from "@/shared/components/layout/TecnicoLayout";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Button, Alert } from "@/shared/components/ui";
import { PermissionGate } from "@/shared/components/layout/PermissionGate";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { TiposCultivoList } from "../components/TiposCultivoList";
import { CreateTipoCultivoModal } from "../components/CreateTipoCultivoModal";
import { EditTipoCultivoModal } from "../components/EditTipoCultivoModal";
import { useTiposCultivo } from "../hooks/useTiposCultivo";
import { useUpdateTipoCultivo } from "../hooks/useUpdateTipoCultivo";
import type { TipoCultivo } from "../types/catalogo.types";

export function CatalogosManagePage() {
  const permissions = usePermissions();

  // Seleccionar layout según rol
  const Layout = permissions.isAdmin() ? AdminLayout :
                 permissions.isGerente() ? GerenteLayout :
                 permissions.isTecnico() ? TecnicoLayout :
                 AdminLayout;

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

  const handleSuccessTipoCultivo = () => {
    refetchTiposCultivo();
  };

  return (
    <Layout title="Catálogos">
      <PageContainer
        title="Gestión de Catálogos"
        description="Administra tipos de cultivo"
        actions={
          <div className="flex gap-2">
            <Button
              size="small"
              variant="secondary"
              onClick={refetchTiposCultivo}
              disabled={loadingTiposCultivo}
            >
              <RefreshCw
                className={`w-4 h-4 ${loadingTiposCultivo ? "animate-spin" : ""}`}
              />
            </Button>

            <PermissionGate permission="createCatalogo">
              <Button
                size="small"
                variant="primary"
                onClick={() => setCreateTipoCultivoModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nuevo Tipo Cultivo</span>
              </Button>
            </PermissionGate>
          </div>
        }
      >
        <div className="space-y-6">
          {errorTiposCultivo && (
            <Alert
              type="error"
              message={errorTiposCultivo}
              onClose={() => refetchTiposCultivo()}
            />
          )}

          {!loadingTiposCultivo && (
            <div className="text-sm text-text-secondary">
              Mostrando {tiposCultivo.length} de {totalTiposCultivo} tipos de
              cultivo
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
    </Layout>
  );
}
