/**
 * Hook para eliminar PERMANENTEMENTE municipios
 * Solo para administradores - verifica dependencias en backend
 */

import { useState } from "react";
import { geograficasService } from "../services/geograficas.service";
import { showToast } from "@/shared/hooks/useToast";

interface UseHardDeleteMunicipioReturn {
  hardDeleteMunicipio: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useHardDeleteMunicipio(): UseHardDeleteMunicipioReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hardDeleteMunicipio = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await geograficasService.hardDeleteMunicipio(id);
      showToast.success("Municipio eliminado permanentemente");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al eliminar permanentemente el municipio";
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    hardDeleteMunicipio,
    isLoading,
    error,
  };
}
