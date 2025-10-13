import { useState } from "react";
import { catalogosService } from "../services/catalogos.service";
import type {
  CreateTipoCultivoInput,
  TipoCultivo,
} from "../types/catalogo.types";
import { showToast } from "@/shared/components/ui";

interface UseCreateTipoCultivoReturn {
  createTipoCultivo: (data: CreateTipoCultivoInput) => Promise<TipoCultivo>;
  isLoading: boolean;
  error: string | null;
}

export function useCreateTipoCultivo(): UseCreateTipoCultivoReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTipoCultivo = async (
    data: CreateTipoCultivoInput
  ): Promise<TipoCultivo> => {
    setIsLoading(true);
    setError(null);

    try {
      const tipoCultivo = await catalogosService.createTipoCultivo(data);
      showToast.success("Tipo de cultivo creado exitosamente");
      return tipoCultivo;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error al crear tipo de cultivo";
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createTipoCultivo,
    isLoading,
    error,
  };
}
