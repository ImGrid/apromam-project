import { useState } from "react";
import { catalogosService } from "../services/catalogos.service";
import type { CreateGestionInput, Gestion } from "../types/catalogo.types";
import { showToast } from "@/shared/components/ui";

interface UseCreateGestionReturn {
  createGestion: (data: CreateGestionInput) => Promise<Gestion>;
  isLoading: boolean;
  error: string | null;
}

export function useCreateGestion(): UseCreateGestionReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGestion = async (data: CreateGestionInput): Promise<Gestion> => {
    setIsLoading(true);
    setError(null);

    try {
      const gestion = await catalogosService.createGestion(data);
      showToast.success("Gestión creada exitosamente");
      return gestion;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al crear gestión";
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createGestion,
    isLoading,
    error,
  };
}
