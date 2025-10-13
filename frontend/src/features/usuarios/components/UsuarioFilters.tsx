import { useState } from "react";
import { Search, X } from "lucide-react";
import { Select, Button } from "@/shared/components/ui";
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
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  // Manejar cambio de rol
  const handleRolChange = (value: string) => {
    onFiltersChange({
      ...filters,
      rol: value || undefined,
    });
  };

  // Manejar cambio de estado
  const handleEstadoChange = (value: string) => {
    onFiltersChange({
      ...filters,
      activo: value === "" ? undefined : value === "true",
    });
  };

  // Manejar busqueda con debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Aplicar filtro despues de 500ms
    setTimeout(() => {
      onFiltersChange({
        ...filters,
        search: value || undefined,
      });
    }, 500);
  };

  // Limpiar todos los filtros
  const handleClear = () => {
    setSearchTerm("");
    onClear();
  };

  // Verificar si hay filtros activos
  const hasActiveFilters =
    filters.rol || filters.activo !== undefined || filters.search;

  return (
    <div className="p-4 space-y-4 bg-white border rounded-lg sm:p-6 border-neutral-border">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Busqueda por texto */}
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-text-secondary" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar por nombre o usuario..."
              className="w-full py-3 pl-10 pr-4 border rounded-md border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Filtro por rol */}
        <Select
          options={rolesOptions}
          value={filters.rol || ""}
          onChange={handleRolChange}
          placeholder="Filtrar por rol"
        />

        {/* Filtro por estado */}
        <Select
          options={estadoOptions}
          value={
            filters.activo === undefined
              ? ""
              : filters.activo
              ? "true"
              : "false"
          }
          onChange={handleEstadoChange}
          placeholder="Filtrar por estado"
        />
      </div>

      {/* Boton limpiar filtros */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="small"
            onClick={handleClear}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
