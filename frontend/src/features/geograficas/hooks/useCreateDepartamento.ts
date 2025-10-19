/**
 * Hook para crear departamentos
 */

import { useState } from "react";
import { geograficasService } from "../services/geograficas.service";
import { showToast } from "@/shared/hooks/useToast";
import type { CreateDepartamentoInput } from "../types/geografica.types";

interface UseCreateDepartamentoReturn {
  createDepartamento: (data: CreateDepartamentoInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useCreateDepartamento(): UseCreateDepartamentoReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDepartamento = async (data: CreateDepartamentoInput) => {
    setIsLoading(true);
    setError(null);

    try {
      await geograficasService.createDepartamento(data);
      showToast.success("Departamento creado exitosamente");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al crear departamento";
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createDepartamento,
    isLoading,
    error,
  };
}
