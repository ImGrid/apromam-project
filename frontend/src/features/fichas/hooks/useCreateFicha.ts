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

      // Guardar valores necesarios ANTES de operaciones async
      // para evitar que se vuelvan undefined por timing issues
      const codigoProductor = data.ficha?.codigo_productor;
      const gestion = data.ficha?.gestion;

      const ficha = await fichasService.create(data);

      // Limpiar borradores guardados después de crear exitosamente
      // Los borradores ya no son necesarios porque la ficha está en el servidor
      if (codigoProductor && gestion) {
        // Limpiar localStorage
        const localStorageKey = `apromam-ficha-draft-${codigoProductor}-${gestion}`;
        try {
          localStorage.removeItem(localStorageKey);
        } catch (e) {
          // Error al limpiar localStorage
        }

        // Limpiar IndexedDB
        try {
          await deleteDraftFromIndexedDB(codigoProductor, gestion);
        } catch (e) {
          // Error al limpiar IndexedDB
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
