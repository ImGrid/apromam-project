import { useState, useEffect, useCallback } from 'react';
import { productoresService } from '../services/productores.service';
import type { ProductorStats } from '../types/productor.types';

export function useProductorStats() {
  const [stats, setStats] = useState<ProductorStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await productoresService.getEstadisticas();
      setStats(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cargar estadísticas';
      setError(errorMessage);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  // Fetch inicial
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch,
  };
}
