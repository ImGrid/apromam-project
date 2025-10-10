import { AdminLayout } from "@/shared/components/layout/AdminLayout";
import { GerenteLayout } from "@/shared/components/layout/GerenteLayout";
import { TecnicoLayout } from "@/shared/components/layout/TecnicoLayout";
import { useAuth } from "@/shared/hooks/useAuth";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { PermissionGate } from "@/shared/components/layout/PermissionGate";

export function DashboardPage() {
  const { user } = useAuth();
  const { isAdmin, isGerente, isTecnico } = usePermissions();

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
          <PermissionGate permission="report">
            <div className="p-6 bg-white border rounded-lg border-neutral-border">
              <h3 className="mb-2 text-sm font-medium text-text-secondary">
                Total Productores
              </h3>
              <p className="text-3xl font-bold text-primary">--</p>
            </div>
          </PermissionGate>

          <PermissionGate resource="fichas" action="read">
            <div className="p-6 bg-white border rounded-lg border-neutral-border">
              <h3 className="mb-2 text-sm font-medium text-text-secondary">
                Fichas Pendientes
              </h3>
              <p className="text-3xl font-bold text-warning">--</p>
            </div>
          </PermissionGate>

          <PermissionGate permission="approve">
            <div className="p-6 bg-white border rounded-lg border-neutral-border">
              <h3 className="mb-2 text-sm font-medium text-text-secondary">
                En Revisión
              </h3>
              <p className="text-3xl font-bold text-info">--</p>
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
