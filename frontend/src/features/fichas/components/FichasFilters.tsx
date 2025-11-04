/**
 * FichasFilters
 * Componente para filtrar y buscar fichas de inspección
 * Incluye filtros por estado, gestión, productor, inspector, etc.
 */

import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { Button, Input, Select } from "@/shared/components/ui";
import { useGestionActiva } from "@/features/configuracion/hooks/useGestionActiva";
import type { FichasFilters as FichasFiltersType } from "../types/ficha.types";
import type { SelectOption } from "@/shared/components/ui";

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
  const { gestionActiva } = useGestionActiva();
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

  // Usar gestión activa del sistema en lugar de año calendario
  const currentYear = gestionActiva?.anio_gestion ?? new Date().getFullYear();

  // Opciones para los selects
  const estadoOptions: SelectOption[] = [
    { value: "", label: "Todos los estados" },
    { value: "borrador", label: "Borrador" },
    { value: "revision", label: "En Revisión" },
    { value: "aprobado", label: "Aprobado" },
    { value: "rechazado", label: "Rechazado" },
  ];

  const gestionOptions: SelectOption[] = [
    { value: "", label: "Todas las gestiones" },
    { value: currentYear.toString(), label: currentYear.toString() },
    { value: (currentYear - 1).toString(), label: (currentYear - 1).toString() },
    { value: (currentYear - 2).toString(), label: (currentYear - 2).toString() },
    { value: (currentYear - 3).toString(), label: (currentYear - 3).toString() },
  ];

  const resultadoOptions: SelectOption[] = [
    { value: "", label: "Todos los resultados" },
    { value: "aprobado", label: "Aprobado" },
    { value: "rechazado", label: "Rechazado" },
    { value: "pendiente", label: "Pendiente" },
  ];

  const syncOptions: SelectOption[] = [
    { value: "", label: "Todos" },
    { value: "pendiente", label: "Pendiente" },
    { value: "sincronizado", label: "Sincronizado" },
    { value: "conflicto", label: "Conflicto" },
  ];

  return (
    <div className="p-3 bg-white border rounded-lg border-neutral-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <h3 className="text-base font-semibold text-text-primary">Filtros</h3>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
              Activos
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="small"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? "Ocultar" : "Avanzado"}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="small" onClick={handleClearAll}>
              <X className="w-4 h-4" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Filtros básicos */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {/* Búsqueda por código de productor */}
        <Input
          label="Código Productor"
          placeholder="Buscar por código..."
          value={localFilters.codigo_productor || ""}
          onChange={(e) =>
            handleInputChange("codigo_productor", e.target.value)
          }
        />

        {/* Filtro por estado */}
        <Select
          label="Estado"
          options={estadoOptions}
          value={localFilters.estado_ficha || ""}
          onChange={(value) => handleInputChange("estado_ficha", value)}
        />

        {/* Filtro por gestión */}
        <Select
          label="Gestión"
          options={gestionOptions}
          value={localFilters.gestion?.toString() || ""}
          onChange={(value) =>
            handleInputChange(
              "gestion",
              value ? parseInt(value) : undefined
            )
          }
        />
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="grid grid-cols-1 gap-3 pt-3 mt-3 border-t md:grid-cols-3">
          {/* Inspector interno */}
          <Input
            label="Inspector Interno"
            placeholder="Nombre del inspector..."
            value={localFilters.inspector_interno || ""}
            onChange={(e) =>
              handleInputChange("inspector_interno", e.target.value)
            }
          />

          {/* Comunidad */}
          <Input
            label="Comunidad"
            placeholder="Nombre de la comunidad..."
            value={localFilters.comunidad || ""}
            onChange={(e) => handleInputChange("comunidad", e.target.value)}
          />

          {/* Resultado certificación */}
          <Select
            label="Resultado Certificación"
            options={resultadoOptions}
            value={localFilters.resultado_certificacion || ""}
            onChange={(value) =>
              handleInputChange("resultado_certificacion", value)
            }
          />

          {/* Fecha desde */}
          <Input
            label="Fecha Desde"
            inputType="date"
            value={localFilters.fecha_desde || ""}
            onChange={(e) => handleInputChange("fecha_desde", e.target.value)}
          />

          {/* Fecha hasta */}
          <Input
            label="Fecha Hasta"
            inputType="date"
            value={localFilters.fecha_hasta || ""}
            onChange={(e) => handleInputChange("fecha_hasta", e.target.value)}
          />

          {/* Estado sync */}
          <Select
            label="Estado Sincronización"
            options={syncOptions}
            value={localFilters.estado_sync || ""}
            onChange={(value) => handleInputChange("estado_sync", value)}
          />
        </div>
      )}

      {/* Botón aplicar */}
      <div className="flex justify-end mt-3">
        <Button variant="primary" size="small" onClick={handleApplyFilters}>
          <Search className="w-4 h-4" />
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
}
