/**
 * useUpdateFicha Hook
 * Hook para actualizar una ficha (solo borrador)
 * IMPORTANTE: Limpia los borradores guardados después de actualizar exitosamente
 */

import { useState } from "react";
import { fichasService } from "../services/fichas.service";
import { showToast } from "@/shared/hooks/useToast";
import { deleteDraftFromIndexedDB } from "../services/draftStorage.service";
import type { UpdateFichaInput, Ficha, UpdateFichaCompletaInput, FichaCompleta } from "../types/ficha.types";

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
    data: UpdateFichaCompletaInput
  ): Promise<FichaCompleta> => {
    try {
      setIsLoading(true);
      setError(null);

      const ficha = await fichasService.updateCompleta(id, data);

      // Limpiar borradores guardados después de actualizar exitosamente
      // Usar los datos de la ficha devuelta por el servidor
      if (ficha.ficha.codigo_productor && ficha.ficha.gestion) {
        // Limpiar localStorage
        const localStorageKey = `apromam-ficha-draft-${ficha.ficha.codigo_productor}-${ficha.ficha.gestion}`;
        try {
          localStorage.removeItem(localStorageKey);
        } catch (e) {
          // Error al limpiar localStorage
        }

        // Limpiar IndexedDB
        try {
          await deleteDraftFromIndexedDB(ficha.ficha.codigo_productor, ficha.ficha.gestion);
        } catch (e) {
          // Error al limpiar IndexedDB
        }

        // TODO: Limpiar borrador del servidor si existe
        // Esto requeriría un endpoint DELETE /api/fichas/drafts/:codigoProductor/:gestion
      }

      showToast.success("Ficha actualizada exitosamente");

      return ficha;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al actualizar la ficha";
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
