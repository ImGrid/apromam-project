/**
 * ConfiguracionPage
 * Página de configuración del sistema - Solo Admin
 * Permite activar la gestión que usarán todos los usuarios
 */

import { useState } from "react";
import { RefreshCw, Plus } from "lucide-react";
import { AdminLayout } from "@/shared/components/layout/AdminLayout";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Button, Alert } from "@/shared/components/ui";
import { GestionActivaCard, GestionesTable, CreateGestionModal } from "../components";
import { useGestiones } from "../hooks/useGestiones";
import { useActivarGestion } from "../hooks/useActivarGestion";

export function ConfiguracionPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    gestiones,
    gestionActiva,
    isLoading,
    error,
    refetch,
  } = useGestiones();

  const {
    activarGestion,
    isLoading: isActivating,
  } = useActivarGestion();

  const handleActivar = async (gestion: any) => {
    try {
      await activarGestion(gestion.id_gestion, gestion.anio_gestion);
      await refetch();
    } catch (err) {
      // Error ya manejado en el hook
    }
  };

  return (
    <AdminLayout title="Configuración">
      <PageContainer
        title="Configuración del Sistema"
        description="Gestión activa del sistema"
        actions={
          <div className="flex items-center gap-3">
            <Button
              size="small"
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Nueva Gestión
            </Button>
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
          </div>
        }
      >
        <div className="space-y-6">
          {/* Error */}
          {error && (
            <Alert type="error" message={error} onClose={() => refetch()} />
          )}

          {/* Gestión Activa */}
          {gestionActiva && (
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                Gestión Activa
              </h2>
              <GestionActivaCard gestion={gestionActiva} />
            </div>
          )}

          {/* Todas las Gestiones */}
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              Gestiones Disponibles
            </h2>
            <GestionesTable
              gestiones={gestiones}
              gestionActiva={gestionActiva}
              onActivar={handleActivar}
              loading={isLoading}
              isActivating={isActivating}
            />
          </div>
        </div>
      </PageContainer>

      {/* Modal: Crear Nueva Gestión */}
      <CreateGestionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          refetch();
        }}
      />
    </AdminLayout>
  );
}
