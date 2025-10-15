/**
 * Hook para activar/desactivar técnicos
 */

import { useState } from "react";
import { tecnicosService } from "../services/tecnicos.service";
import { showToast } from "@/shared/hooks/useToast";

interface UseToggleTecnicoReturn {
  toggleActivo: (id_usuario: string, activo: boolean) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useToggleTecnico(): UseToggleTecnicoReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleActivo = async (id_usuario: string, activo: boolean) => {
    setIsLoading(true);
    setError(null);

    try {
      await tecnicosService.toggleActivo(id_usuario, activo);

      showToast.success(
        activo ? "Técnico activado exitosamente" : "Técnico desactivado exitosamente"
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error al cambiar estado del técnico";
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    toggleActivo,
    isLoading,
    error,
  };
}
