import { useState, useEffect, useCallback } from "react";
import { comunidadesService } from "../services/comunidades.service";
import type { Comunidad, ComunidadFilters } from "../types/comunidad.types";

export function useComunidades(externalFilters?: ComunidadFilters) {
  const [comunidades, setComunidades] = useState<Comunidad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [internalFilters, setInternalFilters] = useState<ComunidadFilters>(externalFilters || {});
  const [total, setTotal] = useState(0);

  // Usar filtros externos si se proporcionan, sino usar internos
  const filters = externalFilters || internalFilters;

  const hasActiveFilters = Object.keys(filters).some(
    (key) =>
      filters[key as keyof ComunidadFilters] !== undefined &&
      filters[key as keyof ComunidadFilters] !== ""
  );

  const fetchComunidades = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await comunidadesService.listComunidades(filters);
      setComunidades(data.comunidades);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  }, [
    filters?.nombre,
    filters?.municipio,
    filters?.provincia,
    filters?.sin_tecnicos,
    filters?.activo,
  ]);

  useEffect(() => {
    fetchComunidades();
  }, [fetchComunidades]);

  return {
    comunidades,
    isLoading,
    error,
    total,
    filters,
    setFilters: setInternalFilters,
    refetch: fetchComunidades,
    hasActiveFilters,
  };
}
