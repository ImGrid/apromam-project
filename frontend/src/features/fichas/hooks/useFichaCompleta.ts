/**
 * useFichaCompleta Hook
 * Hook para obtener una ficha completa por ID (con todas las secciones)
 */

import { useState, useEffect, useCallback } from "react";
import { fichasService } from "../services/fichas.service";
import { showToast } from "@/shared/hooks/useToast";
import type { FichaCompleta } from "../types/ficha.types";

export function useFichaCompleta(id: string | undefined) {
  const [ficha, setFicha] = useState<FichaCompleta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFicha = useCallback(async () => {
    if (!id) {
      setFicha(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await fichasService.getById(id);
      setFicha(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar ficha";
      setError(errorMessage);

      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFicha();
  }, [fetchFicha]);

  const refetch = useCallback(() => {
    fetchFicha();
  }, [fetchFicha]);

  return {
    ficha,
    isLoading,
    error,
    refetch,
  };
}
