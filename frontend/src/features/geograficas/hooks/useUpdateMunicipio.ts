/**
 * Hook para actualizar municipios
 */

import { useState } from "react";
import { geograficasService } from "../services/geograficas.service";
import { showToast } from "@/shared/hooks/useToast";
import type { UpdateMunicipioInput } from "../types/geografica.types";

interface UseUpdateMunicipioReturn {
  updateMunicipio: (id: string, data: UpdateMunicipioInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useUpdateMunicipio(): UseUpdateMunicipioReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMunicipio = async (id: string, data: UpdateMunicipioInput) => {
    setIsLoading(true);
    setError(null);

    try {
      await geograficasService.updateMunicipio(id, data);
      showToast.success("Municipio actualizado exitosamente");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al actualizar municipio";
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateMunicipio,
    isLoading,
    error,
  };
}
