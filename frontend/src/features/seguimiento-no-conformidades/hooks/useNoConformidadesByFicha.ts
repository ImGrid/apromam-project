// Hook para listar No Conformidades de una ficha especifica

import { useState, useEffect, useCallback } from "react";
import { noConformidadesService } from "../services/noConformidades.service";
import { showToast } from "@/shared/hooks/useToast";
import type {
  NoConformidadesListResponse,
  NCFichaQuery,
} from "../types/noConformidad.types";

export function useNoConformidadesByFicha(
  idFicha: string,
  params?: NCFichaQuery
) {
  const [data, setData] = useState<NoConformidadesListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNoConformidades = useCallback(async () => {
    if (!idFicha) {
      setData(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await noConformidadesService.getByFicha(idFicha, params);
      setData(result);
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
  }, [idFicha, params]);

  useEffect(() => {
    fetchNoConformidades();
  }, [fetchNoConformidades]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchNoConformidades,
  };
}
