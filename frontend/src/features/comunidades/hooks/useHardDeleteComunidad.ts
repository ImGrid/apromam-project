// Hook para eliminar PERMANENTEMENTE comunidades
// Solo para administradores - verifica dependencias en backend

import { useState } from "react";
import { comunidadesService } from "../services/comunidades.service";
import { showToast } from "@/shared/hooks/useToast";

interface UseHardDeleteComunidadReturn {
  hardDeleteComunidad: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useHardDeleteComunidad(): UseHardDeleteComunidadReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hardDeleteComunidad = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await comunidadesService.hardDeleteComunidad(id);
      showToast.success("Comunidad eliminada permanentemente");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al eliminar permanentemente la comunidad";
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    hardDeleteComunidad,
    isLoading,
    error,
  };
}
