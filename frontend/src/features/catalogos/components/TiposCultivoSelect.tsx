import { useEffect, useState } from "react";
import { Select, type SelectOption } from "@/shared/components/ui";
import { catalogosService } from "../services/catalogos.service";

interface TiposCultivoSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onlyCertificables?: boolean;
}

export function TiposCultivoSelect({
  value,
  onChange,
  placeholder = "Selecciona un tipo de cultivo",
  disabled = false,
  onlyCertificables = false,
}: TiposCultivoSelectProps) {
  const [tiposCultivo, setTiposCultivo] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTiposCultivo();
  }, [onlyCertificables]);

  const loadTiposCultivo = async () => {
    try {
      setIsLoading(true);
      const response = await catalogosService.listTiposCultivo({ activo: true });

      let tiposFiltrados = response.tipos_cultivo;

      // Filtrar solo certificables si se solicita
      if (onlyCertificables) {
        tiposFiltrados = tiposFiltrados.filter(
          (t) => t.es_principal_certificable
        );
      }

      // Ordenar alfabéticamente
      tiposFiltrados.sort((a, b) =>
        a.nombre_cultivo.localeCompare(b.nombre_cultivo)
      );

      const options = tiposFiltrados.map((t) => ({
        value: t.id_tipo_cultivo,
        label: t.nombre_cultivo,
      }));

      setTiposCultivo(options);
    } catch (error) {
      console.error("Error cargando tipos de cultivo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Select
      options={tiposCultivo}
      value={value}
      onChange={onChange}
      placeholder={isLoading ? "Cargando tipos de cultivo..." : placeholder}
      disabled={disabled || isLoading}
      searchable
    />
  );
}
