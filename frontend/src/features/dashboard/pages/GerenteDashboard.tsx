import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Leaf,
  ClipboardList,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import { GerenteLayout } from "@/shared/components/layout/GerenteLayout";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { StatCard } from "../components/StatCard";
import { AlertCard } from "../components/AlertCard";
import { FichasPendientesList } from "../components/FichasPendientesList";
import { Button } from "@/shared/components/ui/Button";
import { dashboardService } from "../services/dashboard.service";
import { CreateTecnicoModal } from "@/features/tecnicos/components/CreateTecnicoModal";
import { CreateProductorModal } from "@/features/productores/components/CreateProductorModal";
import { ROUTES } from "@/shared/config/routes.config";
import { apiClient, ENDPOINTS } from "@/shared/services/api";
import type { DashboardStats, DashboardAlert } from "../types/dashboard.types";

// Tipo de ficha del backend
interface FichaBackend {
  id_ficha: string;
  codigo_productor: string;
  nombre_productor?: string;
  fecha_inspeccion: string;
  estado_ficha: string;
  nombre_comunidad: string;
  inspector_interno: string;
}

interface FichaConDias extends FichaBackend {
  dias_en_revision: number;
}

export function GerenteDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alertas, setAlertas] = useState<DashboardAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fichasPendientes, setFichasPendientes] = useState<FichaConDias[]>([]);
  const [loadingFichas, setLoadingFichas] = useState(true);
  const [tecnicoModalOpen, setTecnicoModalOpen] = useState(false);
  const [productorModalOpen, setProductorModalOpen] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchAlertas();
    fetchFichasPendientes();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const statsData = await dashboardService.getGerenteStats();
      setStats(statsData);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAlertas = async () => {
    try {
      const alertasData = await dashboardService.getAlertasGerente();
      setAlertas(alertasData);
    } catch (error) {
    }
  };

  const fetchFichasPendientes = async () => {
    try {
      const response = await apiClient.get<{ fichas: FichaBackend[] }>(
        `${ENDPOINTS.FICHAS.BASE}?estado=revision`
      );

      // Calcular dias en revision
      const fichasConDias: FichaConDias[] = response.data.fichas.map(
        (ficha) => ({
          ...ficha,
          dias_en_revision: Math.floor(
            (Date.now() - new Date(ficha.fecha_inspeccion).getTime()) /
              (1000 * 60 * 60 * 24)
          ),
        })
      );

      // Ordenar por fecha mas antigua primero
      fichasConDias.sort(
        (a, b) =>
          new Date(a.fecha_inspeccion).getTime() -
          new Date(b.fecha_inspeccion).getTime()
      );

      setFichasPendientes(fichasConDias);
    } catch (error) {
    } finally {
      setLoadingFichas(false);
    }
  };

  const handleRefresh = () => {
    fetchStats();
    fetchAlertas();
    fetchFichasPendientes();
  };

  return (
    <GerenteLayout title="Dashboard">
      <PageContainer
        title="Panel de Gerencia"
        description="Supervisión y aprobación de fichas"
        actions={
          <Button
            size="small"
            variant="secondary"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            <span className="ml-2">Actualizar</span>
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Estadisticas principales */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <StatCard
              title="Comunidades"
              value={stats?.totalComunidades || 0}
              icon={Building2}
              color="success"
              loading={isLoading}
            />
            <StatCard
              title="Productores"
              value={stats?.totalProductores || 0}
              icon={Leaf}
              color="info"
              loading={isLoading}
            />
          </div>

          {/* Estadisticas de fichas */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Estado de Fichas
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <StatCard
                title="Borradores"
                value={stats?.fichasPendientes || 0}
                icon={ClipboardList}
                color="warning"
                loading={isLoading}
              />
              <StatCard
                title="En Revisión"
                value={stats?.fichasEnRevision || 0}
                icon={ClipboardList}
                color="info"
                loading={isLoading}
              />
              <StatCard
                title="Aprobadas"
                value={stats?.fichasAprobadas || 0}
                icon={ClipboardList}
                color="success"
                loading={isLoading}
              />
            </div>
          </div>

          {/* Alertas */}
          {alertas.length > 0 && (
            <div>
              <h3 className="mb-4 text-lg font-semibold text-text-primary">
                Alertas Importantes
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {alertas.map((alerta) => (
                  <AlertCard
                    key={alerta.id}
                    type={alerta.type}
                    message={alerta.message}
                    action={
                      alerta.action
                        ? {
                            label: alerta.action.label,
                            onClick: () => navigate(alerta.action!.path),
                          }
                        : undefined
                    }
                    dismissible
                  />
                ))}
              </div>
            </div>
          )}

          {/* Acciones rapidas */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Acciones Rápidas
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <button
                onClick={() => setTecnicoModalOpen(true)}
                className="flex flex-col items-center justify-center gap-3 p-6 text-white transition-colors rounded-lg bg-primary hover:bg-primary-dark"
              >
                <UserPlus className="w-8 h-8" />
                <span className="text-sm font-medium">Nuevo Técnico</span>
              </button>

              <button
                onClick={() => setProductorModalOpen(true)}
                className="flex flex-col items-center justify-center gap-3 p-6 text-white transition-colors rounded-lg bg-success hover:bg-success-700"
              >
                <Leaf className="w-8 h-8" />
                <span className="text-sm font-medium">Nuevo Productor</span>
              </button>

              <button
                onClick={() => navigate(`${ROUTES.FICHAS}?estado=revision`)}
                className="flex flex-col items-center justify-center gap-3 p-6 text-white transition-colors rounded-lg bg-warning hover:bg-warning-700"
              >
                <ClipboardList className="w-8 h-8" />
                <span className="text-sm font-medium">
                  Ver Fichas Pendientes
                </span>
              </button>
            </div>
          </div>

          {/* Fichas esperando aprobacion */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Fichas Esperando tu Aprobación
            </h3>
            <FichasPendientesList
              fichas={fichasPendientes}
              loading={loadingFichas}
            />
          </div>
        </div>

        {/* Modales */}
        <CreateTecnicoModal
          isOpen={tecnicoModalOpen}
          onClose={() => setTecnicoModalOpen(false)}
          onSuccess={handleRefresh}
        />

        <CreateProductorModal
          isOpen={productorModalOpen}
          onClose={() => setProductorModalOpen(false)}
          onSuccess={handleRefresh}
        />
      </PageContainer>
    </GerenteLayout>
  );
}
