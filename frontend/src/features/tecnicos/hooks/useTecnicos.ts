/**
 * Hook para obtener lista de técnicos con filtros
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { tecnicosService } from "../services/tecnicos.service";
import type { Tecnico, TecnicoFilters } from "../types/tecnico.types";

interface UseTecnicosReturn {
  tecnicos: Tecnico[];
  isLoading: boolean;
  error: string | null;
  total: number;
  filters: TecnicoFilters;
  setFilters: (filters: TecnicoFilters) => void;
  refetch: () => void;
}

const CACHE_TIME = 2 * 60 * 1000; // 2 minutos

export function useTecnicos(): UseTecnicosReturn {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<TecnicoFilters>({});
  const lastFetchRef = useRef<number>(0);

  const fetchTecnicos = useCallback(
    async (force = false) => {
      const now = Date.now();

      // Usar cache si no ha pasado el tiempo
      if (
        !force &&
        lastFetchRef.current &&
        now - lastFetchRef.current < CACHE_TIME
      ) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await tecnicosService.listTecnicos(filters);
        setTecnicos(response.usuarios);
        setTotal(response.total);
        lastFetchRef.current = now;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar tecnicos"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  // Cargar al montar o cambiar filtros
  useEffect(() => {
    fetchTecnicos();
  }, [fetchTecnicos]);

  const refetch = useCallback(() => {
    fetchTecnicos(true);
  }, [fetchTecnicos]);

  return {
    tecnicos,
    isLoading,
    error,
    total,
    filters,
    setFilters,
    refetch,
  };
}
