/**
 * useGestiones Hook
 * Hook para listar todas las gestiones del sistema
 *
 * Incluye filtro opcional por estado activo
 * y obtiene la gestión activa del sistema en paralelo
 */

import { useState, useEffect, useCallback } from "react";
import { gestionesService } from "../services/gestiones.service";
import { logger } from "@/shared/utils/logger";
import type { Gestion } from "../types/gestion.types";

interface UseGestionesReturn {
  gestiones: Gestion[];
  gestionActiva: Gestion | null;
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGestiones(
  filtrarActivo?: boolean
): UseGestionesReturn {
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [gestionActiva, setGestionActiva] = useState<Gestion | null>(null);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGestiones = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Obtener ambas cosas en paralelo
      const [gestionesResponse, gestionActivaData] = await Promise.all([
        gestionesService.listGestiones(filtrarActivo),
        gestionesService.getGestionActiva().catch(() => null), // No fallar si no hay activa
      ]);

      setGestiones(gestionesResponse.data);
      setTotal(gestionesResponse.total);
      setGestionActiva(gestionActivaData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar gestiones";
      setError(errorMessage);
      logger.error("[useGestiones] Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filtrarActivo]);

  useEffect(() => {
    fetchGestiones();
  }, [fetchGestiones]);

  return {
    gestiones,
    gestionActiva,
    total,
    isLoading,
    error,
    refetch: fetchGestiones,
  };
}
