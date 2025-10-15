/**
 * FichasListPage
 * Página principal para listar, filtrar y buscar fichas de inspección
 * Incluye tabla con paginación, acciones por fila y navegación
 */

import { useNavigate } from "react-router-dom";
import { Plus, Eye, Edit, FileText } from "lucide-react";
import { AdminLayout } from "@/shared/components/layout/AdminLayout";
import { TecnicoLayout } from "@/shared/components/layout/TecnicoLayout";
import { GerenteLayout } from "@/shared/components/layout/GerenteLayout";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { Button } from "@/shared/components/ui/Button";
import { DataTable } from "@/shared/components/ui/DataTable";
import { useFichas } from "../hooks/useFichas";
import { FichasFilters } from "../components/FichasFilters";
import { EstadoFichaBadge } from "../components/Specialized";
import { ROUTES } from "@/shared/config/routes.config";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { Ficha } from "../types/ficha.types";
import type { DataTableColumn } from "@/shared/components/ui/DataTable";

export default function FichasListPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { isAdmin, isGerente, isTecnico } = usePermissions();
  const canCreate = user?.nombre_rol === "tecnico" || user?.nombre_rol === "gerente";

  // Seleccionar layout según rol
  const Layout = isAdmin()
    ? AdminLayout
    : isGerente()
    ? GerenteLayout
    : isTecnico()
    ? TecnicoLayout
    : AdminLayout; // Default

  const {
    fichas,
    total,
    page,
    limit,
    totalPages,
    filters,
    isLoading,
    updateFilters,
    clearFilters,
    goToPage,
    changeLimit,
  } = useFichas();

  // Definir columnas de la tabla
  const columns: DataTableColumn<Ficha>[] = [
    {
      key: "codigo_productor",
      label: "Código Productor",
      sortable: true,
      render: (ficha) => (
        <div>
          <p className="font-medium text-text-primary">
            {ficha.codigo_productor}
          </p>
          {ficha.nombre_productor && (
            <p className="text-sm text-text-secondary">
              {ficha.nombre_productor}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "gestion",
      label: "Gestión",
      sortable: true,
      render: (ficha) => (
        <span className="font-medium text-text-primary">{ficha.gestion}</span>
      ),
    },
    {
      key: "fecha_inspeccion",
      label: "Fecha Inspección",
      sortable: true,
      render: (ficha) => (
        <span className="text-sm text-text-secondary">
          {new Date(ficha.fecha_inspeccion).toLocaleDateString("es-BO", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "inspector_interno",
      label: "Inspector",
      render: (ficha) => (
        <div>
          <p className="text-sm text-text-secondary">
            {ficha.inspector_interno}
          </p>
          {ficha.nombre_comunidad && (
            <p className="text-xs text-text-secondary">
              {ficha.nombre_comunidad}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "estado_ficha",
      label: "Estado",
      sortable: true,
      render: (ficha) => <EstadoFichaBadge estado={ficha.estado_ficha} />,
    },
    {
      key: "resultado_certificacion",
      label: "Resultado",
      render: (ficha) => (
        <span
          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
            ficha.resultado_certificacion === "aprobado"
              ? "bg-success/10 text-success"
              : ficha.resultado_certificacion === "rechazado"
              ? "bg-error/10 text-error"
              : "bg-neutral-bg text-text-secondary"
          }`}
        >
          {ficha.resultado_certificacion === "aprobado"
            ? "Aprobado"
            : ficha.resultado_certificacion === "rechazado"
            ? "Rechazado"
            : "Pendiente"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (ficha) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            onClick={() => navigate(ROUTES.FICHAS_DETAIL(ficha.id_ficha))}
            title="Ver detalle"
          >
            <Eye className="w-4 h-4" />
          </Button>
          {(ficha.estado_ficha === "borrador" ||
            ficha.estado_ficha === "rechazado") &&
            canCreate && (
              <Button
                variant="ghost"
                onClick={() => navigate(ROUTES.FICHAS_EDIT(ficha.id_ficha))}
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
        </div>
      ),
    },
  ];

  return (
    <Layout title="Fichas de Inspección">
      <PageContainer
        title="Fichas de Inspección"
        description="Gestiona y revisa las fichas de inspección de productores orgánicos"
        actions={
          canCreate ? (
            <Button
              variant="primary"
              onClick={() => navigate(ROUTES.FICHAS_CREATE)}
            >
              <Plus className="w-4 h-4" />
              Nueva Ficha
            </Button>
          ) : undefined
        }
      >
        <div className="space-y-6">
          {/* Filtros */}
          <FichasFilters
            filters={filters}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
          />

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatCard
              label="Total Fichas"
              value={total}
              icon={<FileText className="w-5 h-5 text-primary" />}
            />
            <StatCard
              label="En Borrador"
              value={
                fichas.filter((f) => f.estado_ficha === "borrador").length
              }
              icon={<FileText className="w-5 h-5 text-gray-500" />}
            />
            <StatCard
              label="En Revisión"
              value={
                fichas.filter((f) => f.estado_ficha === "revision").length
              }
              icon={<FileText className="w-5 h-5 text-warning" />}
            />
            <StatCard
              label="Aprobadas"
              value={
                fichas.filter((f) => f.estado_ficha === "aprobado").length
              }
              icon={<FileText className="w-5 h-5 text-success" />}
            />
          </div>

          {/* Tabla */}
          <div className="bg-white border rounded-lg border-neutral-border">
            <DataTable<Ficha>
              columns={columns}
              data={fichas}
              rowKey="id_ficha"
              loading={isLoading}
              emptyMessage="No se encontraron fichas con los filtros aplicados"
            />

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-border">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-secondary">
                    Mostrando {(page - 1) * limit + 1} a{" "}
                    {Math.min(page * limit, total)} de {total} fichas
                  </span>
                  <select
                    value={limit}
                    onChange={(e) => changeLimit(parseInt(e.target.value))}
                    className="px-2 py-1 text-sm border rounded border-neutral-border"
                  >
                    <option value={10}>10 por página</option>
                    <option value={20}>20 por página</option>
                    <option value={50}>50 por página</option>
                    <option value={100}>100 por página</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>

                  {/* Páginas */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "primary" : "ghost"}
                          onClick={() => goToPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => goToPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </Layout>
  );
}

// Componente auxiliar para estadísticas
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="p-4 bg-white border rounded-lg border-neutral-border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">{value}</p>
        </div>
        <div className="p-3 rounded-full bg-primary/5">{icon}</div>
      </div>
    </div>
  );
}
