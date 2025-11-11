import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Select, Button, Input } from "@/shared/components/ui";
import type { SelectOption } from "@/shared/components/ui";
import type { UsuarioFilters as Filters } from "../types/usuario.types";

interface UsuarioFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClear: () => void;
}

// Opciones de filtro por rol
const rolesOptions: SelectOption[] = [
  { value: "", label: "Todos los roles" },
  { value: "administrador", label: "Administrador" },
  { value: "gerente", label: "Gerente" },
  { value: "tecnico", label: "Técnico" },
];

// Opciones de filtro por estado
const estadoOptions: SelectOption[] = [
  { value: "", label: "Todos" },
  { value: "true", label: "Activos" },
  { value: "false", label: "Inactivos" },
];

export function UsuarioFilters({
  filters,
  onFiltersChange,
  onClear,
}: UsuarioFiltersProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (
    field: keyof Filters,
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
    onClear();
  };

  const hasActiveFilters = Object.keys(filters).some(
    (key) =>
      filters[key as keyof Filters] !== undefined &&
      filters[key as keyof Filters] !== ""
  );

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end">
      {/* Busqueda por nombre */}
      <div className="lg:col-span-2">
        <Input
          label="Buscar por nombre"
          placeholder="Nombre o usuario..."
          value={localFilters.nombre || ""}
          onChange={(e) => handleInputChange("nombre", e.target.value)}
        />
      </div>

      {/* Filtro por rol */}
      <Select
        label="Rol"
        options={rolesOptions}
        value={localFilters.rol || ""}
        onChange={(value) => handleInputChange("rol", value)}
      />

      {/* Filtro por estado */}
      <Select
        label="Estado"
        options={estadoOptions}
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
      <div className="flex gap-2 lg:justify-end">
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
