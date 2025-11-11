/**
 * useEnviarRevision Hook
 * Hook para enviar una ficha a revisión (borrador → revision)
 * IMPORTANTE: Limpia los borradores guardados después de enviar exitosamente
 */

import { useState } from "react";
import { fichasService } from "../services/fichas.service";
import { showToast } from "@/shared/hooks/useToast";
import { deleteDraftFromIndexedDB } from "../services/draftStorage.service";
import type { EnviarRevisionInput, Ficha } from "../types/ficha.types";

export function useEnviarRevision() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enviarRevision = async (
    id: string,
    data: EnviarRevisionInput
  ): Promise<Ficha> => {
    try {
      setIsLoading(true);
      setError(null);

      const ficha = await fichasService.enviarRevision(id, data);

      // Limpiar borradores guardados después de enviar exitosamente
      // Los borradores ya no son necesarios porque la ficha está en el servidor
      if (ficha.codigo_productor && ficha.gestion) {
        // Limpiar localStorage
        const localStorageKey = `apromam-ficha-draft-${ficha.codigo_productor}-${ficha.gestion}`;
        try {
          localStorage.removeItem(localStorageKey);
        } catch (e) {
          // Error al limpiar localStorage
        }

        // Limpiar IndexedDB
        try {
          await deleteDraftFromIndexedDB(ficha.codigo_productor, ficha.gestion);
        } catch (e) {
          // Error al limpiar IndexedDB
        }

        // TODO: Limpiar borrador del servidor si existe
        // Esto requeriría un endpoint DELETE /api/fichas/drafts/:codigoProductor/:gestion
      }

      showToast.success("La ficha ha sido enviada para su revisión por el gerente");

      return ficha;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error al enviar ficha a revisión";
      setError(errorMessage);

      showToast.error(errorMessage);

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    enviarRevision,
    isLoading,
    error,
  };
}
