import { useState, useEffect, useCallback } from "react";
import { geograficasService } from "../services/geograficas.service";
import type { Municipio, MunicipiosFilters } from "../types/geografica.types";

const CACHE_TIME = 5 * 60 * 1000; // 5 minutos
let cachedMunicipios: Municipio[] | null = null;
let cacheTimestamp: number | null = null;

export function useMunicipios(filters?: MunicipiosFilters) {
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasFilters = !!(filters?.nombre || filters?.provincia || filters?.activo !== undefined);

  const fetchMunicipios = useCallback(async (force = false) => {
    const now = Date.now();

    // Usar cache solo si no hay filtros y no ha expirado
    if (
      !force &&
      !hasFilters &&
      cachedMunicipios &&
      cacheTimestamp &&
      now - cacheTimestamp < CACHE_TIME
    ) {
      setMunicipios(cachedMunicipios);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await geograficasService.listMunicipios(filters);

      // Solo cachear si no hay filtros
      if (!hasFilters) {
        cachedMunicipios = data.municipios;
        cacheTimestamp = now;
      }

      setMunicipios(data.municipios);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  }, [filters?.nombre, filters?.provincia, filters?.activo, hasFilters]);

  useEffect(() => {
    fetchMunicipios();
  }, [fetchMunicipios]);

  return {
    municipios,
    isLoading,
    error,
    refetch: () => fetchMunicipios(true),
  };
}
