import { useState } from "react";
import { catalogosService } from "../services/catalogos.service";
import type {
  UpdateTipoCultivoInput,
  TipoCultivo,
} from "../types/catalogo.types";
import { showToast } from "@/shared/components/ui";

interface UseUpdateTipoCultivoReturn {
  updateTipoCultivo: (
    id: string,
    data: UpdateTipoCultivoInput
  ) => Promise<TipoCultivo>;
  toggleActivo: (tipoCultivo: TipoCultivo) => Promise<TipoCultivo>;
  isLoading: boolean;
  error: string | null;
}

export function useUpdateTipoCultivo(): UseUpdateTipoCultivoReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTipoCultivo = async (
    id: string,
    data: UpdateTipoCultivoInput
  ): Promise<TipoCultivo> => {
    setIsLoading(true);
    setError(null);

    try {
      const tipoCultivo = await catalogosService.updateTipoCultivo(id, data);
      showToast.success("Tipo de cultivo actualizado exitosamente");
      return tipoCultivo;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error al actualizar tipo de cultivo";
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActivo = async (
    tipoCultivo: TipoCultivo
  ): Promise<TipoCultivo> => {
    const nuevoEstado = !tipoCultivo.activo;
    const accion = nuevoEstado ? "activar" : "desactivar";

    const confirmado = window.confirm(
      `¿Estás seguro de ${accion} este tipo de cultivo?`
    );

    if (!confirmado) {
      throw new Error("Operación cancelada");
    }

    setIsLoading(true);
    setError(null);

    try {
      const updated = await catalogosService.updateTipoCultivo(
        tipoCultivo.id_tipo_cultivo,
        { activo: nuevoEstado }
      );
      showToast.success(
        `Tipo de cultivo ${nuevoEstado ? "activado" : "desactivado"} exitosamente`
      );
      return updated;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : `Error al ${accion} tipo de cultivo`;
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateTipoCultivo,
    toggleActivo,
    isLoading,
    error,
  };
}
