import { useState, useEffect, useCallback } from 'react';
import { fichasService } from '../services/fichas.service';
import { showToast } from '@/shared/hooks/useToast';
import { useAuthStore } from '@/features/auth/stores/authStore';
import type { FichaDraftData } from '../types/ficha.types';

export function useMyDrafts() {
  const [data, setData] = useState<FichaDraftData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar rol del usuario - solo técnicos y administradores pueden ver borradores
  const user = useAuthStore((state) => state.user);
  const canViewDrafts = user?.role === 'tecnico' || user?.role === 'administrador';

  const fetchDrafts = useCallback(async () => {
    // No hacer nada si el usuario no tiene permiso
    if (!canViewDrafts) {
      return;
    }

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
  }, [canViewDrafts]);

  useEffect(() => {
    // Solo ejecutar si el usuario tiene permiso
    if (canViewDrafts) {
      fetchDrafts();
    }
  }, [canViewDrafts, fetchDrafts]);

  const refetch = useCallback(() => {
    if (canViewDrafts) {
      fetchDrafts();
    }
  }, [canViewDrafts, fetchDrafts]);

  return {
    data: canViewDrafts ? data : [],
    isLoading: canViewDrafts ? isLoading : false,
    error: canViewDrafts ? error : null,
    refetch,
  };
}
