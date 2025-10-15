/**
 * Página principal de productores
 * Lista de productores con filtros y acciones
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { TecnicoLayout } from '@/shared/components/layout/TecnicoLayout';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { Button, Alert } from '@/shared/components/ui';
import { PermissionGate } from '@/shared/components/layout/PermissionGate';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { ProductoresList } from '../components/ProductoresList';
import { ProductorFilters } from '../components/ProductorFilters';
import { CreateProductorModal } from '../components/CreateProductorModal';
import { useProductores } from '../hooks/useProductores';
import type { ProductorFiltersInput as Filters } from '../types/productor.types';

export function ProductoresListPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const permissions = usePermissions();

  const {
    productores,
    total,
    isLoading,
    error,
    refetch,
    updateFilters,
    clearFilters,
  } = useProductores(filters);

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
    updateFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    clearFilters();
  };

  const handleCreateSuccess = () => {
    refetch();
  };

  // Determinar el layout según el rol del usuario
  const Layout = permissions.isTecnico() ? TecnicoLayout : AdminLayout;

  return (
    <Layout title="Productores">
      <PageContainer
        title="Productores"
        description="Gestión de productores de maní orgánico"
        actions={
          <PermissionGate permission="createProductor">
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4" />
              Nuevo Productor
            </Button>
          </PermissionGate>
        }
      >
        <div className="space-y-6">
          {/* Filtros */}
          <ProductorFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />

          {/* Error */}
          {error && <Alert type="error" message={error} />}

          {/* Información de resultados */}
          {!isLoading && !error && (
            <div className="text-sm text-text-secondary">
              Mostrando {productores.length} de {total} productores
            </div>
          )}

          {/* Tabla */}
          <ProductoresList
            productores={productores}
            loading={isLoading}
          />

          {/* Modal de crear */}
          <CreateProductorModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCreateSuccess}
          />
        </div>
      </PageContainer>
    </Layout>
  );
}
