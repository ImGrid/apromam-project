import { useState, useEffect, useCallback } from "react";
import { comunidadesService } from "../services/comunidades.service";
import type { Comunidad, ComunidadFilters } from "../types/comunidad.types";

export function useComunidades(initialFilters?: ComunidadFilters) {
  const [comunidades, setComunidades] = useState<Comunidad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ComunidadFilters>(initialFilters || {});
  const [total, setTotal] = useState(0);

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
  }, [filters]);

  useEffect(() => {
    fetchComunidades();
  }, [fetchComunidades]);

  return {
    comunidades,
    isLoading,
    error,
    total,
    filters,
    setFilters,
    refetch: fetchComunidades,
  };
}
