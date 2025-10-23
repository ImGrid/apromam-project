/**
 * Hook para recuperar borradores al cargar la página
 * Busca en localStorage, IndexedDB y backend
 *
 * Siguiendo mejores prácticas:
 * - Busca en las 3 capas de almacenamiento
 * - Compara timestamps para usar el más reciente
 * - Try-catch en todas las operaciones
 * - Retorna información completa del borrador
 */

import { useEffect, useState } from 'react';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';
import { fichasService } from '../services/fichas.service';
import { getDraftFromIndexedDB } from '../services/draftStorage.service';
import type { FichaDraft } from '../services/draftStorage.service';

// ============================================
// TYPES
// ============================================

export interface DraftInfo {
  source: 'localStorage' | 'indexedDB' | 'server';
  data: any;
  updated_at: string;
  step_actual: number;
}

interface UseRecoverDraftReturn {
  isLoading: boolean;
  draft: DraftInfo | null;
  acceptDraft: () => void;
  rejectDraft: () => void;
}

// ============================================
// HOOK
// ============================================

export function useRecoverDraft(
  codigoProductor: string | undefined,
  gestion: number | undefined
): UseRecoverDraftReturn {
  const isOnline = useOnlineStatus();
  const [isLoading, setIsLoading] = useState(true);
  const [draft, setDraft] = useState<DraftInfo | null>(null);

  useEffect(() => {
    if (!codigoProductor || !gestion) {
      setIsLoading(false);
      return;
    }

    async function searchForDraft() {
      try {
        let foundDraft: DraftInfo | null = null;

        // CAPA 1: Buscar en localStorage (más rápido)
        const localStorageKey = `apromam-ficha-draft-${codigoProductor}-${gestion}`;
        const localData = localStorage.getItem(localStorageKey);

        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            foundDraft = {
              source: 'localStorage',
              data: parsed.form_data,
              updated_at: parsed.updated_at,
              step_actual: parsed.step_actual || 1,
            };
          } catch (e) {
            // Error parseando localStorage, continuar búsqueda
          }
        }

        // CAPA 2: Buscar en IndexedDB (más robusto)
        const indexedDBDraft = await getDraftFromIndexedDB(
          codigoProductor!,
          gestion!
        );

        if (indexedDBDraft) {
          // Si IndexedDB tiene datos más recientes, usar esos
          if (
            !foundDraft ||
            new Date(indexedDBDraft.metadata.updated_at) >
              new Date(foundDraft.updated_at)
          ) {
            foundDraft = {
              source: 'indexedDB',
              data: indexedDBDraft.form_data,
              updated_at: indexedDBDraft.metadata.updated_at,
              step_actual: indexedDBDraft.step_actual,
            };
          }
        }

        // CAPA 3: Si hay internet, buscar en servidor
        if (isOnline) {
          const serverDraft = await fichasService.getDraft(
            codigoProductor!,
            gestion!
          );

          if (serverDraft && serverDraft.draft_data) {
            // Si servidor tiene datos más recientes, usar esos
            if (
              !foundDraft ||
              new Date(serverDraft.updated_at) > new Date(foundDraft.updated_at)
            ) {
              foundDraft = {
                source: 'server',
                data: serverDraft.draft_data,
                updated_at: serverDraft.updated_at,
                step_actual: serverDraft.step_actual || 1,
              };
            }
          }
        }

        setDraft(foundDraft);
      } catch (error) {
        console.error('[RecoverDraft] Error buscando borrador:', error);
        setDraft(null);
      } finally {
        setIsLoading(false);
      }
    }

    searchForDraft();
  }, [codigoProductor, gestion, isOnline]);

  // ============================================
  // HANDLERS
  // ============================================

  const acceptDraft = () => {
    setDraft(null);
  };

  const rejectDraft = () => {
    // Limpiar todos los borradores
    if (codigoProductor && gestion) {
      const localStorageKey = `apromam-ficha-draft-${codigoProductor}-${gestion}`;
      localStorage.removeItem(localStorageKey);

      // También intentar limpiar de IndexedDB (en background)
      import('../services/draftStorage.service').then(
        ({ deleteDraftFromIndexedDB }) => {
          deleteDraftFromIndexedDB(codigoProductor, gestion);
        }
      );
    }

    setDraft(null);
  };

  // ============================================
  // RETURN
  // ============================================

  return {
    isLoading,
    draft,
    acceptDraft,
    rejectDraft,
  };
}
