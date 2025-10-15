/**
 * useCreateFicha Hook
 * Hook para crear una nueva ficha completa
 */

import { useState } from "react";
import { fichasService } from "../services/fichas.service";
import { showToast } from "@/shared/hooks/useToast";
import type { CreateFichaCompletaInput, FichaCompleta } from "../types/ficha.types";

export function useCreateFicha() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createFicha = async (
    data: CreateFichaCompletaInput
  ): Promise<FichaCompleta> => {
    try {
      setIsLoading(true);
      setError(null);

      const ficha = await fichasService.create(data);

      showToast.success("La ficha ha sido creada exitosamente");

      return ficha;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al crear ficha";
      setError(errorMessage);

      showToast.error(errorMessage);

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createFicha,
    isLoading,
    error,
  };
}
