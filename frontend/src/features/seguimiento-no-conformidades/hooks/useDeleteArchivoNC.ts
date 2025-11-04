// Hook para eliminar un archivo de una No Conformidad

import { useState } from "react";
import { noConformidadesService } from "../services/noConformidades.service";
import { showToast } from "@/shared/hooks/useToast";

export function useDeleteArchivoNC() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (
    params: {
      idNoConformidad: string;
      idArchivo: string;
    },
    options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }
  ) => {
    try {
      setIsPending(true);
      setError(null);

      await noConformidadesService.deleteArchivo(
        params.idNoConformidad,
        params.idArchivo
      );

      showToast.success("Archivo eliminado correctamente");
      options?.onSuccess?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al eliminar archivo";
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
