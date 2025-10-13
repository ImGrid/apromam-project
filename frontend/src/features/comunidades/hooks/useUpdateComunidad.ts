import { useState } from "react";
import { comunidadesService } from "../services/comunidades.service";
import { showToast } from "@/shared/components/ui";
import type { UpdateComunidadInput, Comunidad } from "../types/comunidad.types";

export function useUpdateComunidad() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateComunidad = async (
    id: string,
    data: UpdateComunidadInput
  ): Promise<Comunidad> => {
    setIsLoading(true);
    setError(null);

    try {
      const comunidad = await comunidadesService.updateComunidad(id, data);
      showToast.success("Comunidad actualizada exitosamente");
      return comunidad;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al actualizar comunidad";
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateComunidad,
    isLoading,
    error,
  };
}
