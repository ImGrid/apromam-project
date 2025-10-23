import { useState, useEffect, useCallback } from 'react';
import { fichasService } from '../services/fichas.service';
import { showToast } from '@/shared/hooks/useToast';
import type { FichaEstadisticas } from '../types/ficha.types';

export function useFichaEstadisticas(filters?: {
  gestion?: number;
  comunidad?: string;
}) {
  const [data, setData] = useState<FichaEstadisticas | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEstadisticas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const stats = await fichasService.getEstadisticas(filters);
      setData(stats);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cargar estadísticas';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEstadisticas();
  }, [fetchEstadisticas]);

  const refetch = useCallback(() => {
    fetchEstadisticas();
  }, [fetchEstadisticas]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
