import { useState } from "react";
import { catalogosService } from "../services/catalogos.service";
import type { UpdateGestionInput, Gestion } from "../types/catalogo.types";
import { showToast } from "@/shared/components/ui";

interface UseUpdateGestionReturn {
  updateGestion: (id: string, data: UpdateGestionInput) => Promise<Gestion>;
  toggleActiva: (gestion: Gestion) => Promise<Gestion>;
  isLoading: boolean;
  error: string | null;
}

export function useUpdateGestion(): UseUpdateGestionReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateGestion = async (
    id: string,
    data: UpdateGestionInput
  ): Promise<Gestion> => {
    setIsLoading(true);
    setError(null);

    try {
      const gestion = await catalogosService.updateGestion(id, data);
      showToast.success("Gestión actualizada exitosamente");
      return gestion;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al actualizar gestión";
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActiva = async (gestion: Gestion): Promise<Gestion> => {
    const nuevoEstado = !gestion.activa;
    const accion = nuevoEstado ? "activar" : "desactivar";

    const confirmado = window.confirm(
      `¿Estás seguro de ${accion} esta gestión?`
    );

    if (!confirmado) {
      throw new Error("Operación cancelada");
    }

    setIsLoading(true);
    setError(null);

    try {
      const updated = await catalogosService.updateGestion(
        gestion.id_gestion,
        { activa: nuevoEstado }
      );
      showToast.success(
        `Gestión ${nuevoEstado ? "activada" : "desactivada"} exitosamente`
      );
      return updated;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : `Error al ${accion} gestión`;
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateGestion,
    toggleActiva,
    isLoading,
    error,
  };
}
