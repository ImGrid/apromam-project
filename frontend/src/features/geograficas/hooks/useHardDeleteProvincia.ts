/**
 * Hook para eliminar PERMANENTEMENTE provincias
 * Solo para administradores - verifica dependencias en backend
 */

import { useState } from "react";
import { geograficasService } from "../services/geograficas.service";
import { showToast } from "@/shared/hooks/useToast";

interface UseHardDeleteProvinciaReturn {
  hardDeleteProvincia: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useHardDeleteProvincia(): UseHardDeleteProvinciaReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hardDeleteProvincia = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await geograficasService.hardDeleteProvincia(id);
      showToast.success("Provincia eliminada permanentemente");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al eliminar permanentemente la provincia";
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    hardDeleteProvincia,
    isLoading,
    error,
  };
}
