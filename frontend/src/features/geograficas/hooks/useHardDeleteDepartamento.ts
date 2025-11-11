/**
 * Hook para eliminar PERMANENTEMENTE departamentos
 * Solo para administradores - verifica dependencias en backend
 */

import { useState } from "react";
import { geograficasService } from "../services/geograficas.service";
import { showToast } from "@/shared/hooks/useToast";

interface UseHardDeleteDepartamentoReturn {
  hardDeleteDepartamento: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useHardDeleteDepartamento(): UseHardDeleteDepartamentoReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hardDeleteDepartamento = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await geograficasService.hardDeleteDepartamento(id);
      showToast.success("Departamento eliminado permanentemente");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al eliminar permanentemente el departamento";
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    hardDeleteDepartamento,
    isLoading,
    error,
  };
}
