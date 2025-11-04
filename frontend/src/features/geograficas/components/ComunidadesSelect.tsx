import { Select, type SelectOption } from "@/shared/components/ui";
import { useComunidades } from "@/features/comunidades/hooks/useComunidades";

interface ComunidadesSelectProps {
  municipioId?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export function ComunidadesSelect({
  municipioId,
  value,
  onChange,
  placeholder = "Selecciona una comunidad",
  disabled = false,
  error,
}: ComunidadesSelectProps) {
  const { comunidades, isLoading } = useComunidades(
    municipioId ? { municipio_id: municipioId } : undefined
  );

  const options: SelectOption[] = comunidades
    .filter((c) => c.activo)
    .sort((a, b) => a.nombre_comunidad.localeCompare(b.nombre_comunidad))
    .map((c) => ({
      value: c.id_comunidad,
      label: c.nombre_municipio
        ? `${c.nombre_comunidad} - ${c.nombre_municipio}`
        : c.nombre_comunidad,
    }));

  const isDisabled = disabled || !municipioId || isLoading;

  return (
    <Select
      options={options}
      value={value || ""}
      onChange={onChange}
      placeholder={
        isLoading
          ? "Cargando comunidades..."
          : !municipioId
          ? "Primero selecciona un municipio"
          : placeholder
      }
      disabled={isDisabled}
      error={error}
      searchable
    />
  );
}
