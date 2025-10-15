/**
 * Hook para actualizar provincias
 */

import { useState } from "react";
import { geograficasService } from "../services/geograficas.service";
import { showToast } from "@/shared/hooks/useToast";
import type { UpdateProvinciaInput } from "../types/geografica.types";

interface UseUpdateProvinciaReturn {
  updateProvincia: (id: string, data: UpdateProvinciaInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useUpdateProvincia(): UseUpdateProvinciaReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProvincia = async (id: string, data: UpdateProvinciaInput) => {
    setIsLoading(true);
    setError(null);

    try {
      await geograficasService.updateProvincia(id, data);
      showToast.success("Provincia actualizada exitosamente");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al actualizar provincia";
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateProvincia,
    isLoading,
    error,
  };
}
