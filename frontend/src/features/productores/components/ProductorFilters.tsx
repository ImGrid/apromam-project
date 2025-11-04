/**
 * Componente de filtros para productores
 * Permite filtrar por comunidad, categoría y estado GPS
 */

import { Search, X } from 'lucide-react';
import { Button, Select, Input, type SelectOption } from '@/shared/components/ui';
import { useComunidades } from '@/features/comunidades/hooks/useComunidades';
import { useAuth } from '@/shared/hooks/useAuth';
import type { ProductorFiltersInput as Filters, CategoriaProductor } from '../types/productor.types';
import { CATEGORIA_LABELS } from '../types/productor.types';

interface ProductorFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClearFilters: () => void;
}

const CATEGORIA_OPTIONS: SelectOption[] = [
  { value: '', label: 'Todas las categorías' },
  { value: 'E', label: `E - ${CATEGORIA_LABELS.E}` },
  { value: 'T2', label: `T2 - ${CATEGORIA_LABELS.T2}` },
  { value: 'T1', label: `T1 - ${CATEGORIA_LABELS.T1}` },
  { value: 'T0', label: `T0 - ${CATEGORIA_LABELS.T0}` },
];

const GPS_OPTIONS: SelectOption[] = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Con coordenadas GPS' },
  { value: 'false', label: 'Sin coordenadas GPS' },
];

export function ProductorFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: ProductorFiltersProps) {
  const { user } = useAuth();
  const { comunidades, isLoading: loadingComunidades } = useComunidades();

  // Si es técnico, solo mostrar su comunidad
  const comunidadesOptions: SelectOption[] = [
    { value: '', label: 'Todas las comunidades' },
    ...comunidades.map((c) => ({
      value: c.id_comunidad,
      label: c.nombre_municipio
        ? `${c.nombre_comunidad} - ${c.nombre_municipio}`
        : c.nombre_comunidad,
    })),
  ];

  const handleFilterChange = (key: keyof Filters, value: string | boolean) => {
    const newFilters = { ...filters };

    if (key === 'categoria') {
      newFilters.categoria = value ? (value as CategoriaProductor) : undefined;
    } else if (key === 'comunidad') {
      newFilters.comunidad = (typeof value === 'string' && value) ? value : undefined;
    } else if (key === 'con_coordenadas') {
      newFilters.con_coordenadas = value === 'true' ? true : value === 'false' ? false : undefined;
    } else if (key === 'search') {
      newFilters.search = value as string;
    }

    onFiltersChange(newFilters);
  };

  const hasActiveFilters =
    filters.categoria ||
    filters.comunidad ||
    filters.con_coordenadas !== undefined ||
    filters.search;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Búsqueda por texto */}
        <div className="relative">
          <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-text-secondary" />
          <Input
            type="text"
            placeholder="Buscar productor..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtro por comunidad */}
        {user?.nombre_rol.toLowerCase() !== 'técnico' && (
          <Select
            options={comunidadesOptions}
            value={filters.comunidad || ''}
            onChange={(value) => handleFilterChange('comunidad', value)}
            placeholder="Filtrar por comunidad"
            disabled={loadingComunidades}
          />
        )}

        {/* Filtro por categoría */}
        <Select
          options={CATEGORIA_OPTIONS}
          value={filters.categoria || ''}
          onChange={(value) => handleFilterChange('categoria', value)}
          placeholder="Filtrar por categoría"
        />

        {/* Filtro por estado GPS */}
        <Select
          options={GPS_OPTIONS}
          value={
            filters.con_coordenadas === true
              ? 'true'
              : filters.con_coordenadas === false
              ? 'false'
              : ''
          }
          onChange={(value) => handleFilterChange('con_coordenadas', value)}
          placeholder="Estado GPS"
        />
      </div>

      {/* Botón limpiar filtros */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button variant="ghost" size="small" onClick={onClearFilters}>
            <X className="w-4 h-4" />
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
