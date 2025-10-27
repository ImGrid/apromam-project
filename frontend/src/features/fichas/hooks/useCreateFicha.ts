/**
 * useCreateFicha Hook
 * Hook para crear una nueva ficha completa
 * IMPORTANTE: Limpia los borradores guardados después de crear exitosamente
 */

import { useState } from "react";
import { fichasService } from "../services/fichas.service";
import { showToast } from "@/shared/hooks/useToast";
import { deleteDraftFromIndexedDB } from "../services/draftStorage.service";
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

      // Limpiar borradores guardados después de crear exitosamente
      // Los borradores ya no son necesarios porque la ficha está en el servidor
      if (data.ficha.codigo_productor && data.ficha.gestion) {
        console.log('[CREATE_FICHA] Limpiando borradores - Productor:', data.ficha.codigo_productor, 'Gestion:', data.ficha.gestion);

        // Limpiar localStorage
        const localStorageKey = `apromam-ficha-draft-${data.ficha.codigo_productor}-${data.ficha.gestion}`;
        try {
          localStorage.removeItem(localStorageKey);
        } catch (e) {
          console.warn('[CREATE_FICHA] Error al limpiar localStorage:', e);
        }

        // Limpiar IndexedDB
        try {
          await deleteDraftFromIndexedDB(data.ficha.codigo_productor, data.ficha.gestion);
        } catch (e) {
          console.warn('[CREATE_FICHA] Error al limpiar IndexedDB:', e);
        }

        // TODO: Limpiar borrador del servidor si existe
        // Esto requeriría un endpoint DELETE /api/fichas/drafts/:codigoProductor/:gestion
      }

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
