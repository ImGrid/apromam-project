import { AdminLayout } from "@/shared/components/layout/AdminLayout";
import { useAuth } from "@/shared/hooks/useAuth";
import { PermissionGate } from "@/shared/components/layout/PermissionGate";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <AdminLayout title="Dashboard">
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

        {/* Stats cards (ejemplo) */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Solo admin y gerente ven estadisticas generales */}
          <PermissionGate permission="report">
            <div className="p-6 bg-white border rounded-lg border-neutral-border">
              <h3 className="mb-2 text-sm font-medium text-text-secondary">
                Total Productores
              </h3>
              <p className="text-3xl font-bold text-primary">--</p>
            </div>
          </PermissionGate>

          {/* Todos ven fichas */}
          <PermissionGate resource="fichas" action="read">
            <div className="p-6 bg-white border rounded-lg border-neutral-border">
              <h3 className="mb-2 text-sm font-medium text-text-secondary">
                Fichas Pendientes
              </h3>
              <p className="text-3xl font-bold text-warning">--</p>
            </div>
          </PermissionGate>

          {/* Solo quien puede aprobar ve esto */}
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
    </AdminLayout>
  );
}
