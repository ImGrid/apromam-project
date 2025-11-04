// Hook para actualizar seguimiento de una NC
// Este es el HOOK CORE del modulo de seguimiento

import { useState } from "react";
import { noConformidadesService } from "../services/noConformidades.service";
import { showToast } from "@/shared/hooks/useToast";
import type { UpdateSeguimientoInput } from "../types/noConformidad.types";

export function useUpdateSeguimiento() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (
    params: {
      id: string;
      data: UpdateSeguimientoInput;
    },
    options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }
  ) => {
    try {
      setIsPending(true);
      setError(null);

      await noConformidadesService.updateSeguimiento(params.id, params.data);

      showToast.success("Seguimiento actualizado correctamente");
      options?.onSuccess?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al actualizar seguimiento";
      setError(errorMessage);
      showToast.error(errorMessage);
      options?.onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsPending(false);
    }
  };

  return {
    mutate,
    isPending,
    error,
  };
}
