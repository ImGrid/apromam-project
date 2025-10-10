// src/features/dashboard/pages/TecnicoDashboard.tsx
/**
 * Dashboard del tecnico
 * Simplificado para uso en campo
 */

import { useNavigate } from "react-router-dom";
import { PlusCircle, Leaf, Map } from "lucide-react";
import { TecnicoLayout } from "@/shared/components/layout/TecnicoLayout";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { StatCard } from "../components/StatCard";
import { MisFichasTabs } from "../components/MisFichasTabs";
import { AlertCard } from "../components/AlertCard";
import { useMisFichas } from "../hooks/useMisFichas";
import { ROUTES } from "@/shared/config/routes.config";
import { useAuth } from "@/shared/hooks/useAuth";
import { useState, useEffect } from "react";
import { apiClient, ENDPOINTS } from "@/shared/services/api";

export function TecnicoDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { borradores, enRevision, aprobadas, isLoading } = useMisFichas();
  const [totalProductores, setTotalProductores] = useState(0);
  const [productoresSinGPS, setProductoresSinGPS] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productores] = await Promise.all([
          apiClient.get(ENDPOINTS.PRODUCTORES.BASE),
        ]);

        setTotalProductores(productores.data.total || 0);

        // TODO: Implementar endpoint para productores sin GPS
        setProductoresSinGPS(0);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <TecnicoLayout title="Inicio">
      <PageContainer
        title={`Hola, ${user?.nombre_completo?.split(" ")[0] || "Técnico"}`}
        description={`Comunidad: ${user?.nombre_comunidad || "Sin asignar"}`}
      >
        <div className="space-y-6">
          {/* Botones de accion principales */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button
              onClick={() => navigate(ROUTES.FICHAS_CREATE)}
              className="flex flex-col items-center justify-center gap-3 p-8 text-white transition-colors rounded-lg bg-primary hover:bg-primary-dark"
            >
              <PlusCircle className="w-10 h-10" />
              <span className="text-base font-semibold">Nueva Ficha</span>
            </button>

            <button
              onClick={() => navigate(ROUTES.PRODUCTORES_CREATE)}
              className="flex flex-col items-center justify-center gap-3 p-8 text-white transition-colors rounded-lg bg-success hover:bg-green-700"
            >
              <Leaf className="w-10 h-10" />
              <span className="text-base font-semibold">Nuevo Productor</span>
            </button>

            <button
              onClick={() => navigate(ROUTES.PARCELAS)}
              className="flex flex-col items-center justify-center gap-3 p-8 text-white transition-colors rounded-lg bg-info hover:bg-blue-700"
            >
              <Map className="w-10 h-10" />
              <span className="text-base font-semibold">Ver Mapa</span>
            </button>
          </div>

          {/* Estadisticas */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <StatCard
              title="Mis Productores"
              value={totalProductores}
              icon={Leaf}
              color="info"
              loading={loadingStats}
            />
            <StatCard
              title="Total Fichas"
              value={borradores.length + enRevision.length + aprobadas.length}
              icon={PlusCircle}
              color="primary"
              loading={isLoading}
            />
          </div>

          {/* Alerta productores sin GPS */}
          {productoresSinGPS > 0 && (
            <AlertCard
              type="warning"
              message={`Tienes ${productoresSinGPS} productores sin coordenadas GPS`}
              action={{
                label: "Ver productores",
                onClick: () => navigate(ROUTES.PRODUCTORES),
              }}
            />
          )}

          {/* Mis fichas */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Mis Fichas
            </h3>
            <MisFichasTabs
              borradores={borradores}
              enRevision={enRevision}
              aprobadas={aprobadas}
              loading={isLoading}
            />
          </div>
        </div>
      </PageContainer>
    </TecnicoLayout>
  );
}
