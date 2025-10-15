/**
 * useFichas Hook
 * Hook para listar fichas con filtros y paginación
 */

import { useState, useEffect, useCallback } from "react";
import { fichasService } from "../services/fichas.service";
import { showToast } from "@/shared/hooks/useToast";
import type { Ficha, FichasFilters } from "../types/ficha.types";

export function useFichas(initialFilters?: FichasFilters) {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialFilters?.page || 1);
  const [limit, setLimit] = useState(initialFilters?.limit || 20);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<FichasFilters>(initialFilters || {});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFichas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fichasService.list({
        ...filters,
        page,
        limit,
      });

      setFichas(response.fichas);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar fichas";
      setError(errorMessage);

      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => {
    fetchFichas();
  }, [fetchFichas]);

  const refetch = useCallback(() => {
    fetchFichas();
  }, [fetchFichas]);

  const updateFilters = useCallback((newFilters: FichasFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset a página 1 al cambiar filtros
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset a página 1 al cambiar limit
  }, []);

  return {
    fichas,
    total,
    page,
    limit,
    totalPages,
    filters,
    isLoading,
    error,
    refetch,
    updateFilters,
    clearFilters,
    goToPage,
    changeLimit,
  };
}
