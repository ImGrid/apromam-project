import { useState, useEffect, useCallback } from "react";
import { geograficasService } from "../services/geograficas.service";
import type { Provincia, ProvinciasFilters } from "../types/geografica.types";

const CACHE_TIME = 5 * 60 * 1000; // 5 minutos
let cachedProvincias: Provincia[] | null = null;
let cacheTimestamp: number | null = null;

export function useProvincias(filters?: ProvinciasFilters) {
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasFilters = !!(filters?.nombre || filters?.departamento || filters?.activo !== undefined);

  const fetchProvincias = useCallback(async (force = false) => {
    const now = Date.now();

    // Usar cache solo si no hay filtros y no ha expirado
    if (
      !force &&
      !hasFilters &&
      cachedProvincias &&
      cacheTimestamp &&
      now - cacheTimestamp < CACHE_TIME
    ) {
      setProvincias(cachedProvincias);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await geograficasService.listProvincias(filters);

      // Solo cachear si no hay filtros
      if (!hasFilters) {
        cachedProvincias = data.provincias;
        cacheTimestamp = now;
      }

      setProvincias(data.provincias);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  }, [filters?.nombre, filters?.departamento, filters?.activo, hasFilters]);

  useEffect(() => {
    fetchProvincias();
  }, [fetchProvincias]);

  return {
    provincias,
    isLoading,
    error,
    refetch: () => fetchProvincias(true),
  };
}
