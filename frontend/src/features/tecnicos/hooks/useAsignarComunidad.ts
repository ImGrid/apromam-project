/**
 * Hook para asignar/remover comunidad de técnicos
 */

import { useState } from "react";
import { tecnicosService } from "../services/tecnicos.service";
import { showToast } from "@/shared/hooks/useToast";

interface UseAsignarComunidadReturn {
  asignarComunidad: (
    id_usuario: string,
    id_comunidad: string | null
  ) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useAsignarComunidad(): UseAsignarComunidadReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const asignarComunidad = async (
    id_usuario: string,
    id_comunidad: string | null
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      await tecnicosService.asignarComunidad(id_usuario, { id_comunidad });

      if (id_comunidad) {
        showToast.success("Comunidad asignada exitosamente");
      } else {
        showToast.success("Comunidad removida exitosamente");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error al asignar comunidad al técnico";
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    asignarComunidad,
    isLoading,
    error,
  };
}
