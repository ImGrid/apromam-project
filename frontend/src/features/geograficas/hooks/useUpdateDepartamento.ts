/**
 * Hook para actualizar departamentos
 */

import { useState } from "react";
import { geograficasService } from "../services/geograficas.service";
import { showToast } from "@/shared/hooks/useToast";
import type { UpdateDepartamentoInput } from "../types/geografica.types";

interface UseUpdateDepartamentoReturn {
  updateDepartamento: (id: string, data: UpdateDepartamentoInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useUpdateDepartamento(): UseUpdateDepartamentoReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDepartamento = async (id: string, data: UpdateDepartamentoInput) => {
    setIsLoading(true);
    setError(null);

    try {
      await geograficasService.updateDepartamento(id, data);
      showToast.success("Departamento actualizado exitosamente");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al actualizar departamento";
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateDepartamento,
    isLoading,
    error,
  };
}
