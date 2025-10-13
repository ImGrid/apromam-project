import { Select, type SelectOption } from "@/shared/components/ui";
import { useProvincias } from "../hooks/useProvincias";

interface ProvinciasSelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

export function ProvinciasSelect({
  value,
  onChange,
  placeholder = "Selecciona una provincia",
  disabled = false,
  error,
}: ProvinciasSelectProps) {
  const { provincias, isLoading } = useProvincias();

  const options: SelectOption[] = provincias
    .filter((p) => p.activo)
    .sort((a, b) => a.nombre_provincia.localeCompare(b.nombre_provincia))
    .map((p) => ({
      value: p.id_provincia,
      label: p.nombre_provincia,
    }));

  return (
    <Select
      options={options}
      value={value || ""}
      onChange={onChange}
      placeholder={isLoading ? "Cargando provincias..." : placeholder}
      disabled={disabled || isLoading}
      error={error}
      searchable
    />
  );
}
