// Hook para listar todas las no conformidades con filtros

import { useState, useEffect, useCallback } from "react";
import { noConformidadesService } from "../services/noConformidades.service";
import { showToast } from "@/shared/hooks/useToast";
import type {
  NoConformidadEnriquecida,
  EstadoSeguimiento,
} from "../types/noConformidad.types";

interface UseNoConformidadesFilters {
  estado_seguimiento?: EstadoSeguimiento;
  codigo_productor?: string;
  gestion?: number;
}

export function useNoConformidades(filters?: UseNoConformidadesFilters) {
  const [data, setData] = useState<NoConformidadEnriquecida[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNoConformidades = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await noConformidadesService.getAll(filters);
      setData(response.no_conformidades);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error al cargar no conformidades";
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchNoConformidades();
  }, [fetchNoConformidades]);

  return {
    noConformidades: data,
    isLoading,
    error,
    refetch: fetchNoConformidades,
  };
}
