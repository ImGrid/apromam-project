// Hook para subir un archivo a una No Conformidad

import { useState } from "react";
import { noConformidadesService } from "../services/noConformidades.service";
import { showToast } from "@/shared/hooks/useToast";
import type { TipoArchivoNC } from "../types/noConformidad.types";

export function useUploadArchivoNC() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (
    params: {
      idNoConformidad: string;
      file: File;
      tipoArchivo: TipoArchivoNC;
    },
    options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }
  ) => {
    try {
      setIsPending(true);
      setError(null);

      await noConformidadesService.uploadArchivo(
        params.idNoConformidad,
        params.file,
        params.tipoArchivo
      );

      showToast.success("Archivo subido correctamente");
      options?.onSuccess?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al subir archivo";
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
