import { useState, useEffect, useCallback } from "react";
import { geograficasService } from "../services/geograficas.service";
import type { Departamento, DepartamentosFilters } from "../types/geografica.types";

const CACHE_TIME = 5 * 60 * 1000; // 5 minutos
let cachedDepartamentos: Departamento[] | null = null;
let cacheTimestamp: number | null = null;

export function useDepartamentos(filters?: DepartamentosFilters) {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasFilters = !!(filters?.nombre || filters?.activo !== undefined);

  const fetchDepartamentos = useCallback(async (force = false) => {
    const now = Date.now();

    // Usar cache solo si no hay filtros y no ha expirado
    if (
      !force &&
      !hasFilters &&
      cachedDepartamentos &&
      cacheTimestamp &&
      now - cacheTimestamp < CACHE_TIME
    ) {
      setDepartamentos(cachedDepartamentos);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await geograficasService.listDepartamentos(filters);

      // Solo cachear si no hay filtros
      if (!hasFilters) {
        cachedDepartamentos = data.departamentos;
        cacheTimestamp = now;
      }

      setDepartamentos(data.departamentos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  }, [filters?.nombre, filters?.activo, hasFilters]);

  useEffect(() => {
    fetchDepartamentos();
  }, [fetchDepartamentos]);

  return {
    departamentos,
    isLoading,
    error,
    refetch: () => fetchDepartamentos(true),
  };
}
