import { useEffect, useState, useCallback } from "react";
import { Select, type SelectOption } from "@/shared/components/ui";
import { catalogosService } from "../services/catalogos.service";

interface GestionesSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function GestionesSelect({
  value,
  onChange,
  placeholder = "Selecciona una gestión",
  disabled = false,
}: GestionesSelectProps) {
  const [gestiones, setGestiones] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadGestiones = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await catalogosService.listGestiones({ activo: true });

      // Ordenar por año descendente (más reciente primero)
      const gestionesOrdenadas = response.gestiones.sort(
        (a, b) => b.anio_gestion - a.anio_gestion
      );

      const options = gestionesOrdenadas.map((g) => ({
        value: g.id_gestion,
        label: `${g.anio_gestion}${g.descripcion ? ` - ${g.descripcion}` : ""}`,
      }));

      setGestiones(options);

      // Si no hay valor seleccionado, seleccionar la gestión actual
      if (!value && response.gestiones.length > 0) {
        const gestionActual = await catalogosService.getGestionActual();
        if (gestionActual) {
          onChange(gestionActual.id_gestion);
        }
      }
    } catch (error) {
      console.error("Error cargando gestiones:", error);
    } finally {
      setIsLoading(false);
    }
  }, [value, onChange]);

  useEffect(() => {
    loadGestiones();
  }, [loadGestiones]);

  return (
    <Select
      options={gestiones}
      value={value}
      onChange={onChange}
      placeholder={isLoading ? "Cargando gestiones..." : placeholder}
      disabled={disabled || isLoading}
      searchable
    />
  );
}
