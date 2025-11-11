import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button, Input, Select } from "@/shared/components/ui";
import { ProvinciasSelect } from "./ProvinciasSelect";
import type { MunicipiosFilters as MunicipiosFiltersType } from "../types/geografica.types";
import type { SelectOption } from "@/shared/components/ui";

interface MunicipiosFiltersProps {
  filters: MunicipiosFiltersType;
  onFiltersChange: (filters: MunicipiosFiltersType) => void;
  onClearFilters: () => void;
}

export function MunicipiosFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: MunicipiosFiltersProps) {
  const [localFilters, setLocalFilters] =
    useState<MunicipiosFiltersType>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (
    field: keyof MunicipiosFiltersType,
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
      filters[key as keyof MunicipiosFiltersType] !== undefined &&
      filters[key as keyof MunicipiosFiltersType] !== ""
  );

  const activoOptions: SelectOption[] = [
    { value: "", label: "Todos" },
    { value: "true", label: "Activos" },
    { value: "false", label: "Inactivos" },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-5 items-end">
      {/* Nombre */}
      <Input
        label="Buscar por nombre"
        placeholder="Nombre del municipio..."
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
  );
}
