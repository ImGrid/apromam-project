/**
 * Componente de filtros para técnicos
 * Permite filtrar por comunidad, estado activo y búsqueda
 */

import { Search, X } from "lucide-react";
import {
  Button,
  Select,
  Input,
  type SelectOption,
} from "@/shared/components/ui";
import { useComunidades } from "@/features/comunidades/hooks/useComunidades";
import type { TecnicoFilters as Filters } from "../types/tecnico.types";

interface TecnicoFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClearFilters: () => void;
}

const ESTADO_OPTIONS: SelectOption[] = [
  { value: "", label: "Todos los estados" },
  { value: "true", label: "Activos" },
  { value: "false", label: "Inactivos" },
];

const COMUNIDAD_OPTIONS: SelectOption[] = [
  { value: "", label: "Todas las comunidades" },
  { value: "sin_comunidad", label: "Sin comunidad asignada" },
];

export function TecnicoFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: TecnicoFiltersProps) {
  const { comunidades, isLoading: loadingComunidades } = useComunidades();

  // Combinar opciones de comunidades
  const comunidadesOptions: SelectOption[] = [
    ...COMUNIDAD_OPTIONS,
    ...comunidades.map((c) => ({
      value: c.id_comunidad,
      label: c.nombre_comunidad,
    })),
  ];

  const handleFilterChange = (key: keyof Filters, value: string | boolean) => {
    const newFilters = { ...filters };

    if (key === "comunidad_id") {
      if (value === "sin_comunidad") {
        newFilters.sin_comunidad = true;
        newFilters.comunidad_id = undefined;
      } else if (value) {
        newFilters.comunidad_id = value as string;
        newFilters.sin_comunidad = false;
      } else {
        newFilters.comunidad_id = undefined;
        newFilters.sin_comunidad = false;
      }
    } else if (key === "activo") {
      newFilters.activo =
        value === "true" ? true : value === "false" ? false : undefined;
    } else if (key === "search") {
      newFilters.search = value as string;
    }

    onFiltersChange(newFilters);
  };

  const hasActiveFilters =
    filters.comunidad_id ||
    filters.sin_comunidad ||
    filters.activo !== undefined ||
    filters.search;

  // Obtener valor del select de comunidad
  const getComunidadSelectValue = () => {
    if (filters.sin_comunidad) return "sin_comunidad";
    if (filters.comunidad_id) return filters.comunidad_id;
    return "";
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Búsqueda por texto */}
        <div className="relative">
          <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-text-secondary" />
          <Input
            type="text"
            placeholder="Buscar técnico..."
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtro por comunidad */}
        <Select
          options={comunidadesOptions}
          value={getComunidadSelectValue()}
          onChange={(value) => handleFilterChange("comunidad_id", value)}
          placeholder="Filtrar por comunidad"
          disabled={loadingComunidades}
        />

        {/* Filtro por estado activo */}
        <Select
          options={ESTADO_OPTIONS}
          value={
            filters.activo === true
              ? "true"
              : filters.activo === false
              ? "false"
              : ""
          }
          onChange={(value) => handleFilterChange("activo", value)}
          placeholder="Filtrar por estado"
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
