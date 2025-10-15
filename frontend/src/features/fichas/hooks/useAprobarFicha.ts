/**
 * useAprobarFicha Hook
 * Hook para aprobar una ficha (revision → aprobado)
 * Solo para gerentes y administradores
 */

import { useState } from "react";
import { fichasService } from "../services/fichas.service";
import { showToast } from "@/shared/hooks/useToast";
import type { AprobarFichaInput, Ficha } from "../types/ficha.types";

export function useAprobarFicha() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aprobar = async (
    id: string,
    data?: AprobarFichaInput
  ): Promise<Ficha> => {
    try {
      setIsLoading(true);
      setError(null);

      const ficha = await fichasService.aprobar(id, data);

      showToast.success("La ficha ha sido aprobada exitosamente");

      return ficha;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al aprobar ficha";
      setError(errorMessage);

      showToast.error(errorMessage);

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    aprobar,
    isLoading,
    error,
  };
}
