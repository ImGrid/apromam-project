// Hook para obtener una No Conformidad por ID
// Obtiene datos enriquecidos (NC + productor + ficha + comunidad)

import { useState, useEffect, useCallback } from "react";
import { noConformidadesService } from "../services/noConformidades.service";
import { showToast } from "@/shared/hooks/useToast";
import type { NoConformidadEnriquecida } from "../types/noConformidad.types";

export function useNoConformidadById(id: string) {
  const [data, setData] = useState<NoConformidadEnriquecida | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNoConformidad = useCallback(async () => {
    if (!id) {
      setData(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const nc = await noConformidadesService.getById(id);
      setData(nc);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar no conformidad";
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchNoConformidad();
  }, [fetchNoConformidad]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchNoConformidad,
  };
}
