/**
 * Página principal de productores
 * Lista de productores con filtros y acciones
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { Button, Alert } from '@/shared/components/ui';
import { PermissionGate } from '@/shared/components/layout/PermissionGate';
import { ProductoresList } from '../components/ProductoresList';
import { ProductorFilters } from '../components/ProductorFilters';
import { CreateProductorModal } from '../components/CreateProductorModal';
import { useProductores } from '../hooks/useProductores';
import { useUpdateProductor } from '../hooks/useUpdateProductor';
import { useDeleteProductor } from '../hooks/useDeleteProductor';
import type { Productor, ProductorFilters as Filters } from '../types/productor.types';

export function ProductoresListPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState<Filters>({});

  const {
    productores,
    total,
    isLoading,
    error,
    refetch,
    updateFilters,
    clearFilters,
  } = useProductores(filters);

  const { toggleActivo, isLoading: isToggling } = useUpdateProductor();
  const { deleteProductor, isLoading: isDeleting } = useDeleteProductor();

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
    updateFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    clearFilters();
  };

  const handleToggleActivo = async (productor: Productor) => {
    try {
      await toggleActivo(productor.codigo_productor, !productor.activo);
      refetch();
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleDelete = async (productor: Productor) => {
    if (
      window.confirm(
        `¿Estás seguro de eliminar al productor ${productor.nombre_productor}?`
      )
    ) {
      try {
        await deleteProductor(productor.codigo_productor);
        refetch();
      } catch (error) {
        // Error manejado por el hook
      }
    }
  };

  const handleCreateSuccess = () => {
    refetch();
  };

  return (
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
          loading={isLoading || isToggling || isDeleting}
          onToggleActivo={handleToggleActivo}
          onDelete={handleDelete}
        />

        {/* Modal de crear */}
        <CreateProductorModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      </div>
    </PageContainer>
  );
}
