import { useNavigate } from "react-router-dom";
import { Users, Building2, Leaf, ClipboardList, RefreshCw } from "lucide-react";
import { AdminLayout } from "@/shared/components/layout/AdminLayout";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { StatCard } from "../components/StatCard";
import { AlertCard } from "../components/AlertCard";
import { QuickActions } from "../components/QuickActions";
import { Button } from "@/shared/components/ui/Button";
import { useDashboardStats } from "../hooks/useDashboardStats";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { stats, alertas, isLoading, error, refetch } = useDashboardStats();

  return (
    <AdminLayout title="Dashboard">
      <PageContainer
        title="Panel de Administración"
        description="Resumen general del sistema"
        actions={
          <Button
            size="small"
            variant="secondary"
            onClick={refetch}
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
          {/* Error state */}
          {error && (
            <div className="p-4 border rounded-lg bg-error/10 border-error/20">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {/* Estadisticas principales */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Usuarios"
              value={stats?.totalUsuarios || 0}
              icon={Users}
              color="primary"
              loading={isLoading}
            />
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
            <StatCard
              title="Fichas Total"
              value={stats?.totalFichas || 0}
              icon={ClipboardList}
              color="warning"
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

          <div>
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Acciones Rápidas
            </h3>
            <QuickActions onRefresh={refetch} />
          </div>
        </div>
      </PageContainer>
    </AdminLayout>
  );
}
