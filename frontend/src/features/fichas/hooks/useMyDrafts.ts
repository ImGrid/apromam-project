import { useState, useEffect, useCallback } from 'react';
import { fichasService } from '../services/fichas.service';
import { showToast } from '@/shared/hooks/useToast';
import type { FichaDraftData } from '../types/ficha.types';

export function useMyDrafts() {
  const [data, setData] = useState<FichaDraftData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDrafts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const drafts = await fichasService.listMyDrafts();
      setData(drafts);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cargar borradores';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const refetch = useCallback(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
