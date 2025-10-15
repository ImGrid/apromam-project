/**
 * Hook para eliminar (desactivar) provincias
 */

import { useState } from "react";
import { geograficasService } from "../services/geograficas.service";
import { showToast } from "@/shared/hooks/useToast";

interface UseDeleteProvinciaReturn {
  deleteProvincia: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useDeleteProvincia(): UseDeleteProvinciaReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteProvincia = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await geograficasService.deleteProvincia(id);
      showToast.success("Provincia eliminada exitosamente");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al eliminar provincia";
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteProvincia,
    isLoading,
    error,
  };
}
