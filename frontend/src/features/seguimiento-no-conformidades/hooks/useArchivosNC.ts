// Hook para listar archivos de una No Conformidad

import { useState, useEffect, useCallback } from "react";
import { noConformidadesService } from "../services/noConformidades.service";
import { showToast } from "@/shared/hooks/useToast";
import type { ArchivosNCListResponse } from "../types/noConformidad.types";

export function useArchivosNC(idNoConformidad: string) {
  const [data, setData] = useState<ArchivosNCListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArchivos = useCallback(async () => {
    if (!idNoConformidad) {
      setData(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const archivos = await noConformidadesService.getArchivos(idNoConformidad);
      setData(archivos);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar archivos";
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [idNoConformidad]);

  useEffect(() => {
    fetchArchivos();
  }, [fetchArchivos]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchArchivos,
  };
}
