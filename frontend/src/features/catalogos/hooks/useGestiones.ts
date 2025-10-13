import { useState, useEffect } from "react";
import { catalogosService } from "../services/catalogos.service";
import type { Gestion, CatalogoFilters } from "../types/catalogo.types";

interface UseGestionesReturn {
  gestiones: Gestion[];
  gestionActual: Gestion | null;
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  filters: CatalogoFilters;
  setFilters: (filters: CatalogoFilters) => void;
}

export function useGestiones(
  initialFilters?: CatalogoFilters
): UseGestionesReturn {
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [gestionActual, setGestionActual] = useState<Gestion | null>(null);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CatalogoFilters>(
    initialFilters || {}
  );

  const fetchGestiones = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [gestionesResponse, actualResponse] = await Promise.all([
        catalogosService.listGestiones(filters),
        catalogosService.getGestionActual(),
      ]);

      setGestiones(gestionesResponse.gestiones);
      setTotal(gestionesResponse.total);
      setGestionActual(actualResponse);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar gestiones";
      setError(errorMessage);
      console.error("Error fetching gestiones:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGestiones();
  }, [filters]);

  return {
    gestiones,
    gestionActual,
    total,
    isLoading,
    error,
    refetch: fetchGestiones,
    filters,
    setFilters,
  };
}
