// Hook para obtener estadisticas de No Conformidades

import { useState, useEffect, useCallback } from "react";
import { noConformidadesService } from "../services/noConformidades.service";
import { showToast } from "@/shared/hooks/useToast";
import type {
  EstadisticasNC,
  EstadisticasNCQuery,
} from "../types/noConformidad.types";

export function useEstadisticasNC(params?: EstadisticasNCQuery) {
  const [data, setData] = useState<EstadisticasNC | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEstadisticas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const stats = await noConformidadesService.getEstadisticas(params);
      setData(stats);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar estadísticas";
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchEstadisticas();
  }, [fetchEstadisticas]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchEstadisticas,
  };
}
