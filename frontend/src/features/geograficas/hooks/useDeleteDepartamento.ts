/**
 * Hook para eliminar (desactivar) departamentos
 */

import { useState } from "react";
import { geograficasService } from "../services/geograficas.service";
import { showToast } from "@/shared/hooks/useToast";

interface UseDeleteDepartamentoReturn {
  deleteDepartamento: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useDeleteDepartamento(): UseDeleteDepartamentoReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteDepartamento = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await geograficasService.deleteDepartamento(id);
      showToast.success("Departamento eliminado exitosamente");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al eliminar departamento";
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteDepartamento,
    isLoading,
    error,
  };
}
