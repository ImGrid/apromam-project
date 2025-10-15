/**
 * useUploadArchivo Hook
 * Hook para subir archivos a una ficha
 */

import { useState } from "react";
import { fichasService } from "../services/fichas.service";
import { showToast } from "@/shared/hooks/useToast";
import type { ArchivoFicha } from "../types/ficha.types";
import type { FileType } from "../components/Specialized/FileUploadZone";

export function useUploadArchivo() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadArchivo = async (
    idFicha: string,
    file: File,
    tipoArchivo: FileType
  ): Promise<ArchivoFicha> => {
    try {
      setIsLoading(true);
      setError(null);
      setProgress(0);

      // Simulación de progreso (en producción, usar eventos de progreso de axios)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const archivo = await fichasService.uploadArchivo(
        idFicha,
        file,
        tipoArchivo
      );

      clearInterval(progressInterval);
      setProgress(100);

      showToast.success(`${file.name} se ha subido exitosamente`);

      return archivo;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al subir archivo";
      setError(errorMessage);

      showToast.error(errorMessage);

      throw err;
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const deleteArchivo = async (
    idFicha: string,
    idArchivo: string
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await fichasService.deleteArchivo(idFicha, idArchivo);

      showToast.success("El archivo ha sido eliminado exitosamente");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al eliminar archivo";
      setError(errorMessage);

      showToast.error(errorMessage);

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    uploadArchivo,
    deleteArchivo,
    isLoading,
    error,
    progress,
  };
}
