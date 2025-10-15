/**
 * FichasFilters
 * Componente para filtrar y buscar fichas de inspección
 * Incluye filtros por estado, gestión, productor, inspector, etc.
 */

import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import type { FichasFilters as FichasFiltersType } from "../types/ficha.types";

interface FichasFiltersProps {
  filters: FichasFiltersType;
  onFiltersChange: (filters: FichasFiltersType) => void;
  onClearFilters: () => void;
}

export function FichasFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: FichasFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localFilters, setLocalFilters] = useState<FichasFiltersType>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (
    field: keyof FichasFiltersType,
    value: string | number | undefined
  ) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearAll = () => {
    setLocalFilters({});
    onClearFilters();
  };

  const hasActiveFilters = Object.keys(filters).some(
    (key) =>
      filters[key as keyof FichasFiltersType] !== undefined &&
      filters[key as keyof FichasFiltersType] !== ""
  );

  const currentYear = new Date().getFullYear();

  return (
    <div className="p-4 bg-white border rounded-lg border-neutral-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">Filtros</h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
              Activos
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? "Ocultar" : "Avanzado"}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={handleClearAll}>
              <X className="w-4 h-4" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Filtros básicos */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Búsqueda por código de productor */}
        <FormField label="Código Productor">
          <div className="relative">
            <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-text-secondary" />
            <input
              type="text"
              value={localFilters.codigo_productor || ""}
              onChange={(e) =>
                handleInputChange("codigo_productor", e.target.value)
              }
              className="w-full py-2 pl-10 pr-3 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Buscar por código..."
            />
          </div>
        </FormField>

        {/* Filtro por estado */}
        <FormField label="Estado">
          <select
            value={localFilters.estado_ficha || ""}
            onChange={(e) => handleInputChange("estado_ficha", e.target.value)}
            className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="borrador">Borrador</option>
            <option value="revision">En Revisión</option>
            <option value="aprobado">Aprobado</option>
            <option value="rechazado">Rechazado</option>
          </select>
        </FormField>

        {/* Filtro por gestión */}
        <FormField label="Gestión">
          <select
            value={localFilters.gestion || ""}
            onChange={(e) =>
              handleInputChange(
                "gestion",
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Todas las gestiones</option>
            <option value={currentYear}>{currentYear}</option>
            <option value={currentYear - 1}>{currentYear - 1}</option>
            <option value={currentYear - 2}>{currentYear - 2}</option>
            <option value={currentYear - 3}>{currentYear - 3}</option>
          </select>
        </FormField>
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="grid grid-cols-1 gap-4 pt-4 mt-4 border-t md:grid-cols-3">
          {/* Inspector interno */}
          <FormField label="Inspector Interno">
            <input
              type="text"
              value={localFilters.inspector_interno || ""}
              onChange={(e) =>
                handleInputChange("inspector_interno", e.target.value)
              }
              className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Nombre del inspector..."
            />
          </FormField>

          {/* Comunidad */}
          <FormField label="Comunidad">
            <input
              type="text"
              value={localFilters.comunidad || ""}
              onChange={(e) => handleInputChange("comunidad", e.target.value)}
              className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Nombre de la comunidad..."
            />
          </FormField>

          {/* Resultado certificación */}
          <FormField label="Resultado Certificación">
            <select
              value={localFilters.resultado_certificacion || ""}
              onChange={(e) =>
                handleInputChange("resultado_certificacion", e.target.value)
              }
              className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Todos los resultados</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </FormField>

          {/* Fecha desde */}
          <FormField label="Fecha Desde">
            <input
              type="date"
              value={localFilters.fecha_desde || ""}
              onChange={(e) => handleInputChange("fecha_desde", e.target.value)}
              className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </FormField>

          {/* Fecha hasta */}
          <FormField label="Fecha Hasta">
            <input
              type="date"
              value={localFilters.fecha_hasta || ""}
              onChange={(e) => handleInputChange("fecha_hasta", e.target.value)}
              className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </FormField>

          {/* Estado sync */}
          <FormField label="Estado Sincronización">
            <select
              value={localFilters.estado_sync || ""}
              onChange={(e) =>
                handleInputChange("estado_sync", e.target.value)
              }
              className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="sincronizado">Sincronizado</option>
              <option value="conflicto">Conflicto</option>
            </select>
          </FormField>
        </div>
      )}

      {/* Botón aplicar */}
      <div className="flex justify-end mt-4">
        <Button variant="primary" onClick={handleApplyFilters}>
          <Search className="w-4 h-4" />
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
}
