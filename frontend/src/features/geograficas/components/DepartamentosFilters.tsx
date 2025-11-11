import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button, Input, Select } from "@/shared/components/ui";
import type { DepartamentosFilters as DepartamentosFiltersType } from "../types/geografica.types";
import type { SelectOption } from "@/shared/components/ui";

interface DepartamentosFiltersProps {
  filters: DepartamentosFiltersType;
  onFiltersChange: (filters: DepartamentosFiltersType) => void;
  onClearFilters: () => void;
}

export function DepartamentosFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: DepartamentosFiltersProps) {
  const [localFilters, setLocalFilters] =
    useState<DepartamentosFiltersType>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (
    field: keyof DepartamentosFiltersType,
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
      filters[key as keyof DepartamentosFiltersType] !== undefined &&
      filters[key as keyof DepartamentosFiltersType] !== ""
  );

  const activoOptions: SelectOption[] = [
    { value: "", label: "Todos" },
    { value: "true", label: "Activos" },
    { value: "false", label: "Inactivos" },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
      {/* Nombre */}
      <Input
        label="Buscar por nombre"
        placeholder="Nombre del departamento..."
        value={localFilters.nombre || ""}
        onChange={(e) => handleInputChange("nombre", e.target.value)}
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
  );
}
