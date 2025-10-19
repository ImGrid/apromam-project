import { Select, type SelectOption } from "@/shared/components/ui";
import { useDepartamentos } from "../hooks/useDepartamentos";

interface DepartamentosSelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

export function DepartamentosSelect({
  value,
  onChange,
  placeholder = "Selecciona un departamento",
  disabled = false,
  error,
}: DepartamentosSelectProps) {
  const { departamentos, isLoading } = useDepartamentos();

  const options: SelectOption[] = departamentos
    .filter((d) => d.activo)
    .sort((a, b) => a.nombre_departamento.localeCompare(b.nombre_departamento))
    .map((d) => ({
      value: d.id_departamento,
      label: d.nombre_departamento,
    }));

  return (
    <Select
      options={options}
      value={value || ""}
      onChange={onChange}
      placeholder={isLoading ? "Cargando departamentos..." : placeholder}
      disabled={disabled || isLoading}
      error={error}
      searchable
    />
  );
}
