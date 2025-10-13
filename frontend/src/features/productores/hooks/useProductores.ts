import { useState, useEffect, useCallback } from 'react';
import { productoresService } from '../services/productores.service';
import type { Productor, ProductorFilters } from '../types/productor.types';

export function useProductores(initialFilters?: ProductorFilters) {
  const [productores, setProductores] = useState<Productor[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductorFilters | undefined>(initialFilters);

  const fetchProductores = useCallback(async (filterParams?: ProductorFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await productoresService.listProductores(filterParams);
      setProductores(response.productores);
      setTotal(response.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar productores';
      setError(errorMessage);
      setProductores([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchProductores(filters);
  }, [filters, fetchProductores]);

  const updateFilters = useCallback((newFilters: ProductorFilters) => {
    setFilters(newFilters);
    fetchProductores(newFilters);
  }, [fetchProductores]);

  const clearFilters = useCallback(() => {
    setFilters(undefined);
    fetchProductores(undefined);
  }, [fetchProductores]);

  // Fetch inicial
  useEffect(() => {
    fetchProductores(filters);
  }, [filters, fetchProductores]);

  return {
    productores,
    total,
    isLoading,
    error,
    filters,
    refetch,
    updateFilters,
    clearFilters,
  };
}
