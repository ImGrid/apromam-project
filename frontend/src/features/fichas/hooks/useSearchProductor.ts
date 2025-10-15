/**
 * useSearchProductor Hook
 * Hook para buscar productores por código o nombre
 * Incluye debounce para optimizar las búsquedas
 */

import { useState, useEffect, useCallback } from "react";
import { productoresService } from "@/features/productores/services/productores.service";
import type { Productor } from "@/features/productores/types/productor.types";

export interface UseSearchProductorReturn {
  productores: Productor[];
  isLoading: boolean;
  error: string | null;
  searchProductor: (query: string) => void;
  clearResults: () => void;
}

/**
 * Hook para buscar productores
 * @param debounceMs - Tiempo de espera antes de ejecutar la búsqueda (default: 300ms)
 */
export function useSearchProductor(debounceMs = 300): UseSearchProductorReturn {
  const [productores, setProductores] = useState<Productor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Función de búsqueda
  const performSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setProductores([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const queryUpper = query.trim().toUpperCase();

      // Obtener todos los productores activos
      const response = await productoresService.listProductores({ activo: true });

      // Filtrar por código o nombre
      const filtered = response.productores.filter((p) => {
        const matchCodigo = p.codigo_productor
          .toUpperCase()
          .includes(queryUpper);
        const matchNombre = p.nombre_productor
          .toUpperCase()
          .includes(queryUpper);

        return matchCodigo || matchNombre;
      });

      // Ordenar: primero por coincidencia exacta de código, luego alfabéticamente
      filtered.sort((a, b) => {
        const aCodigoExact = a.codigo_productor.toUpperCase() === queryUpper;
        const bCodigoExact = b.codigo_productor.toUpperCase() === queryUpper;

        if (aCodigoExact && !bCodigoExact) return -1;
        if (!aCodigoExact && bCodigoExact) return 1;

        return a.codigo_productor.localeCompare(b.codigo_productor);
      });

      setProductores(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al buscar productores");
      setProductores([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs, performSearch]);

  const searchProductor = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearResults = useCallback(() => {
    setProductores([]);
    setSearchQuery("");
    setError(null);
  }, []);

  return {
    productores,
    isLoading,
    error,
    searchProductor,
    clearResults,
  };
}
