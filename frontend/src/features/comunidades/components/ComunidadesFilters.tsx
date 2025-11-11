import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button, Input, Select } from "@/shared/components/ui";
import { ProvinciasSelect } from "@/features/geograficas/components/ProvinciasSelect";
import { MunicipiosSelect } from "@/features/geograficas/components/MunicipiosSelect";
import type { ComunidadFilters as ComunidadFiltersType } from "../types/comunidad.types";
import type { SelectOption } from "@/shared/components/ui";

interface ComunidadesFiltersProps {
  filters: ComunidadFiltersType;
  onFiltersChange: (filters: ComunidadFiltersType) => void;
  onClearFilters: () => void;
}

export function ComunidadesFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: ComunidadesFiltersProps) {
  const [localFilters, setLocalFilters] =
    useState<ComunidadFiltersType>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (
    field: keyof ComunidadFiltersType,
    value: string | boolean | undefined
  ) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value === "" ? undefined : value,
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClear = () => {
    setLocalFilters({});
    onClearFilters();
  };

  const hasActiveFilters = Object.keys(filters).some(
    (key) =>
      filters[key as keyof ComunidadFiltersType] !== undefined &&
      filters[key as keyof ComunidadFiltersType] !== ""
  );

  const activoOptions: SelectOption[] = [
    { value: "", label: "Todos" },
    { value: "true", label: "Activos" },
    { value: "false", label: "Inactivos" },
  ];

  const sinTecnicosOptions: SelectOption[] = [
    { value: "", label: "Todas" },
    { value: "true", label: "Sin técnicos" },
    { value: "false", label: "Con técnicos" },
  ];

  return (
    <div className="space-y-3">
      {/* Primera fila: Nombre, Provincia, Municipio */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 items-end">
        {/* Nombre */}
        <Input
          label="Buscar por nombre"
          placeholder="Nombre de la comunidad..."
          value={localFilters.nombre || ""}
          onChange={(e) => handleInputChange("nombre", e.target.value)}
        />

        {/* Provincia */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Provincia
          </label>
          <ProvinciasSelect
            value={localFilters.provincia}
            onChange={(value) => handleInputChange("provincia", value)}
            placeholder="Todas las provincias"
          />
        </div>

        {/* Municipio */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Municipio
          </label>
          <MunicipiosSelect
            value={localFilters.municipio}
            onChange={(value) => handleInputChange("municipio", value)}
            provinciaId={localFilters.provincia}
            placeholder="Todos los municipios"
          />
        </div>
      </div>

      {/* Segunda fila: Estado de técnicos, Estado, Botones */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 items-end">
        {/* Sin Técnicos */}
        <Select
          label="Estado de técnicos"
          options={sinTecnicosOptions}
          value={
            localFilters.sin_tecnicos === undefined
              ? ""
              : String(localFilters.sin_tecnicos)
          }
          onChange={(value) =>
            handleInputChange(
              "sin_tecnicos",
              value === "" ? undefined : value === "true"
            )
          }
        />

        {/* Estado */}
        <Select
          label="Estado"
          options={activoOptions}
          value={
            localFilters.activo === undefined
              ? ""
              : String(localFilters.activo)
          }
          onChange={(value) =>
            handleInputChange(
              "activo",
              value === "" ? undefined : value === "true"
            )
          }
        />

        {/* Botones */}
        <div className="flex gap-2 lg:col-span-2 lg:justify-end">
          {hasActiveFilters && (
            <Button variant="ghost" size="small" onClick={handleClear}>
              <X className="w-4 h-4" />
              Limpiar
            </Button>
          )}
          <Button variant="primary" size="small" onClick={handleApplyFilters}>
            <Search className="w-4 h-4" />
            Aplicar Filtros
          </Button>
        </div>
      </div>
    </div>
  );
}
