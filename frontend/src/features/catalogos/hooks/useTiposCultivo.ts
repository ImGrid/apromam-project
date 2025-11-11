import { useState, useEffect, useCallback } from "react";
import { catalogosService } from "../services/catalogos.service";
import type { TipoCultivo, CatalogoFilters } from "../types/catalogo.types";

interface UseTiposCultivoReturn {
  tiposCultivo: TipoCultivo[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  filters: CatalogoFilters;
  setFilters: (filters: CatalogoFilters) => void;
}

export function useTiposCultivo(
  initialFilters?: CatalogoFilters
): UseTiposCultivoReturn {
  const [tiposCultivo, setTiposCultivo] = useState<TipoCultivo[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CatalogoFilters>(
    initialFilters || {}
  );

  const fetchTiposCultivo = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await catalogosService.listTiposCultivo(filters);
      setTiposCultivo(response.tipos_cultivo);
      setTotal(response.total);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar tipos de cultivo";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters?.activo]);

  useEffect(() => {
    fetchTiposCultivo();
  }, [fetchTiposCultivo]);

  return {
    tiposCultivo,
    total,
    isLoading,
    error,
    refetch: fetchTiposCultivo,
    filters,
    setFilters,
  };
}
