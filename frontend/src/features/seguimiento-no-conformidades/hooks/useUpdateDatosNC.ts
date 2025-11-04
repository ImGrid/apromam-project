// Hook para actualizar datos basicos de una NC

import { useState } from "react";
import { noConformidadesService } from "../services/noConformidades.service";
import { showToast } from "@/shared/hooks/useToast";
import type { UpdateNoConformidadInput } from "../types/noConformidad.types";

export function useUpdateDatosNC() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (
    params: {
      id: string;
      data: UpdateNoConformidadInput;
    },
    options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }
  ) => {
    try {
      setIsPending(true);
      setError(null);

      await noConformidadesService.updateDatosBasicos(params.id, params.data);

      showToast.success("Datos actualizados correctamente");
      options?.onSuccess?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al actualizar datos";
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
