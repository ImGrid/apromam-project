import { useState } from "react";
import { gestionesService } from "../services/gestiones.service";
import type { UpdateGestionInput, Gestion } from "../types/gestion.types";
import { showToast } from "@/shared/components/ui";

interface UseUpdateGestionReturn {
  updateGestion: (id: string, data: UpdateGestionInput) => Promise<Gestion>;
  isLoading: boolean;
  error: string | null;
}

export function useUpdateGestion(): UseUpdateGestionReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateGestion = async (
    id: string,
    data: UpdateGestionInput
  ): Promise<Gestion> => {
    setIsLoading(true);
    setError(null);

    try {
      const gestion = await gestionesService.updateGestion(id, data);
      showToast.success("Gestión actualizada exitosamente");
      return gestion;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al actualizar gestión";
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateGestion,
    isLoading,
    error,
  };
}
