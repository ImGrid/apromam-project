// Hook para eliminar (desactivar) comunidades

import { useState } from "react";
import { comunidadesService } from "../services/comunidades.service";
import { showToast } from "@/shared/hooks/useToast";

interface UseDeleteComunidadReturn {
  deleteComunidad: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useDeleteComunidad(): UseDeleteComunidadReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteComunidad = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await comunidadesService.deleteComunidad(id);
      showToast.success("Comunidad eliminada exitosamente");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al eliminar comunidad";
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteComunidad,
    isLoading,
    error,
  };
}
