/**
 * useGestionActiva Hook
 * Hook para obtener la gestión activa del sistema
 *
 * Este hook obtiene la gestión que tiene activo_sistema = true
 * y se usa para mostrar el indicador en el header y para
 * auto-rellenar formularios de fichas
 */

import { useState, useEffect, useCallback } from "react";
import { gestionesService } from "../services/gestiones.service";
import type { Gestion } from "../types/gestion.types";

interface UseGestionActivaReturn {
  gestionActiva: Gestion | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGestionActiva(): UseGestionActivaReturn {
  const [gestionActiva, setGestionActiva] = useState<Gestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGestionActiva = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const gestion = await gestionesService.getGestionActiva();
      setGestionActiva(gestion);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar gestión activa";
      setError(errorMessage);
      console.error("[useGestionActiva] Error:", err);

      // Si no hay gestión activa, no es un error crítico
      // Solo loguear, no mostrar toast
      setGestionActiva(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGestionActiva();
  }, [fetchGestionActiva]);

  return {
    gestionActiva,
    isLoading,
    error,
    refetch: fetchGestionActiva,
  };
}
