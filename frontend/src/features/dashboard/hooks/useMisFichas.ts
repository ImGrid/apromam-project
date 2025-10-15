/**
 * Hook para obtener fichas del tecnico autenticado
 * Filtra automaticamente por comunidad
 */

import { useState, useEffect, useCallback } from "react";
import { apiClient, ENDPOINTS } from "@/shared/services/api";
import { useAuth } from "@/shared/hooks/useAuth";

interface Ficha {
  id_ficha: string;
  codigo_productor: string;
  nombre_productor?: string;
  fecha_inspeccion: string;
  estado_ficha: string;
  nombre_comunidad: string;
  inspector_interno: string;
}

interface UseMisFichasReturn {
  borradores: Ficha[];
  enRevision: Ficha[];
  aprobadas: Ficha[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMisFichas(): UseMisFichasReturn {
  const { user } = useAuth();
  const [borradores, setBorradores] = useState<Ficha[]>([]);
  const [enRevision, setEnRevision] = useState<Ficha[]>([]);
  const [aprobadas, setAprobadas] = useState<Ficha[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFichas = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Las fichas ya vienen filtradas por comunidad desde el backend
      const response = await apiClient.get(ENDPOINTS.FICHAS.BASE);
      const fichas = response.data.fichas || [];

      // Agrupar por estado
      setBorradores(fichas.filter((f: Ficha) => f.estado_ficha === "borrador"));
      setEnRevision(fichas.filter((f: Ficha) => f.estado_ficha === "revision"));
      setAprobadas(fichas.filter((f: Ficha) => f.estado_ficha === "aprobado"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar fichas");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFichas();
  }, [fetchFichas]);

  return {
    borradores,
    enRevision,
    aprobadas,
    isLoading,
    error,
    refetch: fetchFichas,
  };
}
