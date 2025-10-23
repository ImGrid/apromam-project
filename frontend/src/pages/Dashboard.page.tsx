import { AdminLayout } from "@/shared/components/layout/AdminLayout";
import { GerenteLayout } from "@/shared/components/layout/GerenteLayout";
import { TecnicoLayout } from "@/shared/components/layout/TecnicoLayout";
import { useAuth } from "@/shared/hooks/useAuth";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { PermissionGate } from "@/shared/components/layout/PermissionGate";
import { useMyDrafts, useFichaEstadisticas } from "@/features/fichas/hooks";

export function DashboardPage() {
  const { user } = useAuth();
  const { isAdmin, isGerente, isTecnico } = usePermissions();

  // Obtener drafts solo si es técnico
  const { data: drafts = [], isLoading: loadingDrafts } = useMyDrafts();

  // Obtener estadísticas de fichas
  const { data: stats, isLoading: loadingStats } = useFichaEstadisticas();

  // Seleccionar layout segun rol
  const Layout = isAdmin()
    ? AdminLayout
    : isGerente()
    ? GerenteLayout
    : isTecnico()
    ? TecnicoLayout
    : AdminLayout; // Default

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Bienvenida */}
        <div className="p-6 bg-white border rounded-lg border-neutral-border">
          <h2 className="mb-2 text-2xl font-semibold text-text-primary">
            Bienvenido, {user?.nombre_completo}
          </h2>
          <p className="text-text-secondary">
            Rol: <span className="font-medium">{user?.nombre_rol}</span>
          </p>
          {user?.nombre_comunidad && (
            <p className="text-text-secondary">
              Comunidad:{" "}
              <span className="font-medium">{user.nombre_comunidad}</span>
            </p>
          )}
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total de fichas */}
          <PermissionGate resource="fichas" action="read">
            <div className="p-6 bg-white border rounded-lg border-neutral-border">
              <h3 className="mb-2 text-sm font-medium text-text-secondary">
                Total Fichas
              </h3>
              <p className="text-3xl font-bold text-primary">
                {loadingStats ? "..." : stats?.total || 0}
              </p>
            </div>
          </PermissionGate>

          {/* Borradores (solo técnicos) */}
          {isTecnico() && (
            <div className="p-6 bg-white border rounded-lg border-neutral-border">
              <h3 className="mb-2 text-sm font-medium text-text-secondary">
                Borradores
              </h3>
              <p className="text-3xl font-bold text-warning">
                {loadingDrafts ? "..." : drafts.length}
              </p>
            </div>
          )}

          {/* En Revisión (gerentes y admin) */}
          <PermissionGate permission="approve">
            <div className="p-6 bg-white border rounded-lg border-neutral-border">
              <h3 className="mb-2 text-sm font-medium text-text-secondary">
                En Revisión
              </h3>
              <p className="text-3xl font-bold text-info">
                {loadingStats ? "..." : stats?.por_estado?.revision || 0}
              </p>
            </div>
          </PermissionGate>

          {/* Aprobadas */}
          <PermissionGate resource="fichas" action="read">
            <div className="p-6 bg-white border rounded-lg border-neutral-border">
              <h3 className="mb-2 text-sm font-medium text-text-secondary">
                Aprobadas
              </h3>
              <p className="text-3xl font-bold text-success">
                {loadingStats ? "..." : stats?.por_estado?.aprobado || 0}
              </p>
            </div>
          </PermissionGate>
        </div>

        {/* Acciones rapidas */}
        <div className="p-6 bg-white border rounded-lg border-neutral-border">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Acciones Rápidas
          </h3>
          <div className="flex flex-wrap gap-3">
            <PermissionGate resource="fichas" action="create">
              <button className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-primary-dark">
                Nueva Ficha
              </button>
            </PermissionGate>

            <PermissionGate resource="productores" action="create">
              <button className="px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-primary border-primary hover:bg-neutral-bg">
                Nuevo Productor
              </button>
            </PermissionGate>

            <PermissionGate permission="report">
              <button className="px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-text-secondary border-neutral-border hover:bg-neutral-bg">
                Ver Reportes
              </button>
            </PermissionGate>
          </div>
        </div>
      </div>
    </Layout>
  );
}
