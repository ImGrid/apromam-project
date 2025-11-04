/**
 * useActivarGestion Hook
 * Hook para activar una gestión como la gestión activa del sistema
 *
 * IMPORTANTE: Esta es una ACCIÓN CRÍTICA que afecta a TODO el sistema
 * Solo el administrador puede ejecutarla
 * Muestra confirmación antes de activar
 */

import { useState } from "react";
import { gestionesService } from "../services/gestiones.service";
import { showToast } from "@/shared/components/ui";
import type { Gestion } from "../types/gestion.types";

interface UseActivarGestionReturn {
  activarGestion: (id: string, anio: number) => Promise<Gestion>;
  isLoading: boolean;
  error: string | null;
}

export function useActivarGestion(): UseActivarGestionReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activarGestion = async (id: string, anio: number): Promise<Gestion> => {
    // Confirmación simple y directa
    const confirmado = window.confirm(
      `¿Activar Gestión ${anio}?\n\nTodos los usuarios trabajarán en esta gestión.`
    );

    if (!confirmado) {
      throw new Error("Operación cancelada por el usuario");
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await gestionesService.activarGestion(id);

      showToast.success(
        result.message || `Gestión ${anio} activada como gestión del sistema`,
        { duration: 5000 }
      );

      return result.gestion;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al activar gestión";

      setError(errorMessage);

      // Solo mostrar error si no fue cancelado por el usuario
      if (!errorMessage.includes("cancelada")) {
        showToast.error(errorMessage, { duration: 5000 });
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    activarGestion,
    isLoading,
    error,
  };
}
