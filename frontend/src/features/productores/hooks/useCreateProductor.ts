import { useState } from "react";
import { productoresService } from "../services/productores.service";
import type { CreateProductorInput, Productor } from "../types/productor.types";
import { showToast } from "@/shared/components/ui";

export function useCreateProductor() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProductor = async (
    data: CreateProductorInput
  ): Promise<Productor> => {
    setIsLoading(true);
    setError(null);

    try {
      const productor = await productoresService.createProductor(data);
      showToast.success(
        `Productor ${productor.codigo_productor} creado exitosamente`
      );
      return productor;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al crear productor";
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createProductor,
    isLoading,
    error,
  };
}
