import { Select, type SelectOption } from "@/shared/components/ui";
import { useMunicipios } from "../hooks/useMunicipios";

interface MunicipiosSelectProps {
  provinciaId?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

export function MunicipiosSelect({
  provinciaId,
  value,
  onChange,
  placeholder = "Selecciona un municipio",
  disabled = false,
  error,
}: MunicipiosSelectProps) {
  const { municipios, isLoading } = useMunicipios(provinciaId);

  const options: SelectOption[] = municipios
    .filter((m) => m.activo)
    .sort((a, b) => a.nombre_municipio.localeCompare(b.nombre_municipio))
    .map((m) => ({
      value: m.id_municipio,
      label: m.nombre_municipio,
    }));

  const isDisabled = disabled || !provinciaId || isLoading;

  return (
    <Select
      options={options}
      value={value || ""}
      onChange={onChange}
      placeholder={
        isLoading
          ? "Cargando municipios..."
          : !provinciaId
          ? "Primero selecciona una provincia"
          : placeholder
      }
      disabled={isDisabled}
      error={error}
      searchable
    />
  );
}
