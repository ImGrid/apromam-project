/**
 * useUpdateFicha Hook
 * Hook para actualizar una ficha (solo borrador)
 */

import { useState } from "react";
import { fichasService } from "../services/fichas.service";
import { showToast } from "@/shared/hooks/useToast";
import type { UpdateFichaInput, Ficha, CreateFichaCompletaInput, FichaCompleta } from "../types/ficha.types";

export function useUpdateFicha() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFicha = async (
    id: string,
    data: UpdateFichaInput
  ): Promise<Ficha> => {
    try {
      setIsLoading(true);
      setError(null);

      const ficha = await fichasService.update(id, data);

      showToast.success("Los cambios se han guardado exitosamente");

      return ficha;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al actualizar ficha";
      setError(errorMessage);

      showToast.error(errorMessage);

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCompleta = async (
    id: string,
    data: Partial<CreateFichaCompletaInput>
  ): Promise<FichaCompleta> => {
    try {
      setIsLoading(true);
      setError(null);

      const ficha = await fichasService.updateCompleta(id, data);

      showToast.success("Todos los cambios se han guardado");

      return ficha;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al actualizar ficha";
      setError(errorMessage);

      showToast.error(errorMessage);

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateFicha,
    updateCompleta,
    isLoading,
    error,
  };
}
