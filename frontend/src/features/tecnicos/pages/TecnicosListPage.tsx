/**
 * Página principal de técnicos
 * Lista de técnicos con filtros y acciones de edición
 */

import { useState } from "react";
import { UserCog, Users, Building2, UserX, Plus } from "lucide-react";
import { AdminLayout } from "@/shared/components/layout/AdminLayout";
import { GerenteLayout } from "@/shared/components/layout/GerenteLayout";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Alert, Button } from "@/shared/components/ui";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { TecnicosList } from "../components/TecnicosList";
import { TecnicoFilters } from "../components/TecnicoFilters";
import { CreateTecnicoModal } from "../components/CreateTecnicoModal";
import { EditTecnicoModal } from "../components/EditTecnicoModal";
import { useTecnicos } from "../hooks/useTecnicos";
import { useToggleTecnico } from "../hooks/useToggleTecnico";
import type { Tecnico, TecnicoFilters as Filters } from "../types/tecnico.types";

export default function TecnicosListPage() {
  const permissions = usePermissions();
  const { isAdmin, isGerente } = permissions;
  const [selectedTecnico, setSelectedTecnico] = useState<Tecnico | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const {
    tecnicos,
    total,
    isLoading,
    error,
    filters,
    setFilters,
    refetch,
  } = useTecnicos();

  const { toggleActivo, isLoading: isToggling } = useToggleTecnico();

  // Seleccionar layout según rol
  const Layout = isAdmin() ? AdminLayout : isGerente() ? GerenteLayout : AdminLayout;

  const canCreate = permissions.canAccess("usuarios", "create") || isGerente();
  const canEdit = permissions.canAccess("usuarios", "edit") || isGerente();

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleEdit = (tecnico: Tecnico) => {
    setSelectedTecnico(tecnico);
    setEditModalOpen(true);
  };

  const handleToggleActivo = async (tecnico: Tecnico) => {
    if (
      window.confirm(
        `¿Estás seguro de ${
          tecnico.activo ? "desactivar" : "activar"
        } a ${tecnico.nombre_completo}?`
      )
    ) {
      try {
        await toggleActivo(tecnico.id_usuario, !tecnico.activo);
        refetch();
      } catch (error) {
        // Error manejado por el hook
      }
    }
  };

  const handleModalSuccess = () => {
    refetch();
  };

  // Calcular estadísticas
  const tecnicosActivos = tecnicos.filter((t) => t.activo).length;
  const tecnicosConComunidad = tecnicos.filter((t) => t.id_comunidad).length;
  const tecnicosSinComunidad = tecnicos.filter((t) => !t.id_comunidad).length;

  return (
    <Layout title="Técnicos">
      <PageContainer
        title="Gestión de Técnicos"
        description="Administra técnicos y asigna comunidades"
        actions={
          canCreate ? (
            <Button
              size="small"
              variant="primary"
              onClick={() => setCreateModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Técnico</span>
            </Button>
          ) : undefined
        }
      >
        <div className="space-y-6">
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Técnicos"
              value={total}
              icon={<Users className="w-5 h-5 text-primary" />}
              color="primary"
            />
            <StatCard
              label="Técnicos Activos"
              value={tecnicosActivos}
              icon={<UserCog className="w-5 h-5 text-success" />}
              color="success"
            />
            <StatCard
              label="Con Comunidad"
              value={tecnicosConComunidad}
              icon={<Building2 className="w-5 h-5 text-info" />}
              color="info"
            />
            <StatCard
              label="Sin Comunidad"
              value={tecnicosSinComunidad}
              icon={<UserX className="w-5 h-5 text-warning" />}
              color="warning"
            />
          </div>

          {/* Filtros */}
          <TecnicoFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />

          {/* Error */}
          {error && <Alert type="error" message={error} />}

          {/* Información de resultados */}
          {!isLoading && !error && (
            <div className="text-sm text-text-secondary">
              Mostrando {tecnicos.length} de {total} técnicos
            </div>
          )}

          {/* Tabla */}
          <div className="bg-white border rounded-lg border-neutral-border">
            <TecnicosList
              tecnicos={tecnicos}
              loading={isLoading || isToggling}
              onEdit={canEdit ? handleEdit : undefined}
              onToggleActivo={handleToggleActivo}
            />
          </div>
        </div>
      </PageContainer>

      {/* Modal crear técnico */}
      <CreateTecnicoModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      {/* Modal editar técnico */}
      <EditTecnicoModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        tecnico={selectedTecnico}
        onSuccess={handleModalSuccess}
      />
    </Layout>
  );
}

// Componente auxiliar para estadísticas
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "primary" | "success" | "info" | "warning" | "error";
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  const colorClasses = {
    primary: "bg-primary/5",
    success: "bg-success/5",
    info: "bg-info/5",
    warning: "bg-warning/5",
    error: "bg-error/5",
  };

  return (
    <div className="p-4 bg-white border rounded-lg border-neutral-border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
}
