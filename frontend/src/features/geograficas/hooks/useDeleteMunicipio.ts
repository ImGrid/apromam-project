/**
 * Hook para eliminar (desactivar) municipios
 */

import { useState } from "react";
import { geograficasService } from "../services/geograficas.service";
import { showToast } from "@/shared/hooks/useToast";

interface UseDeleteMunicipioReturn {
  deleteMunicipio: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useDeleteMunicipio(): UseDeleteMunicipioReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteMunicipio = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await geograficasService.deleteMunicipio(id);
      showToast.success("Municipio eliminado exitosamente");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al eliminar municipio";
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteMunicipio,
    isLoading,
    error,
  };
}
