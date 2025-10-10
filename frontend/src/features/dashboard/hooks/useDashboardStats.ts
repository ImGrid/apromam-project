// src/features/dashboard/hooks/useDashboardStats.ts
/**
 * Hook para obtener estadisticas del dashboard
 */

import { useState, useEffect, useCallback } from "react";
import { dashboardService } from "../services/dashboard.service";
import type { DashboardStats, DashboardAlert } from "../types/dashboard.types";

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  alertas: DashboardAlert[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const CACHE_TIME = 5 * 60 * 1000; // 5 minutos
const REFRESH_INTERVAL = 2 * 60 * 1000; // 2 minutos

export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alertas, setAlertas] = useState<DashboardAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const fetchData = useCallback(
    async (force = false) => {
      const now = Date.now();

      // Usar cache si no ha pasado el tiempo
      if (!force && lastFetch && now - lastFetch < CACHE_TIME) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [statsData, alertasData] = await Promise.all([
          dashboardService.getAdminStats(),
          dashboardService.getAlertas(),
        ]);

        setStats(statsData);
        setAlertas(alertasData);
        setLastFetch(now);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos");
      } finally {
        setIsLoading(false);
      }
    },
    [lastFetch]
  );

  // Fetch inicial
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh cada 2 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return {
    stats,
    alertas,
    isLoading,
    error,
    refetch,
  };
}
