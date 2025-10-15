/**
 * useRechazarFicha Hook
 * Hook para rechazar una ficha (revision → rechazado)
 * Solo para gerentes y administradores
 */

import { useState } from "react";
import { fichasService } from "../services/fichas.service";
import { showToast } from "@/shared/hooks/useToast";
import type { RechazarFichaInput, Ficha } from "../types/ficha.types";

export function useRechazarFicha() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rechazar = async (
    id: string,
    data: RechazarFichaInput
  ): Promise<Ficha> => {
    try {
      setIsLoading(true);
      setError(null);

      const ficha = await fichasService.rechazar(id, data);

      showToast.warning("La ficha ha sido rechazada y se notificó al técnico");

      return ficha;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al rechazar ficha";
      setError(errorMessage);

      showToast.error(errorMessage);

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    rechazar,
    isLoading,
    error,
  };
}
