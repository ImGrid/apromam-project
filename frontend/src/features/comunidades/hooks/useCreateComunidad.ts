import { useState } from "react";
import { comunidadesService } from "../services/comunidades.service";
import type { CreateComunidadInput, Comunidad } from "../types/comunidad.types";
import { showToast } from "@/shared/components/ui";

export function useCreateComunidad() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createComunidad = async (
    data: CreateComunidadInput
  ): Promise<Comunidad> => {
    setIsLoading(true);
    setError(null);

    try {
      const comunidad = await comunidadesService.createComunidad(data);
      showToast.success("Comunidad creada exitosamente");
      return comunidad;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al crear comunidad";
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createComunidad,
    isLoading,
    error,
  };
}
