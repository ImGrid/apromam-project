/**
 * Hook para auto-guardar borrador cada 3 segundos
 * Guarda en localStorage, IndexedDB y backend
 *
 * Siguiendo mejores prácticas:
 * - Debounce de 3 segundos con use-debounce
 * - Guardado en 3 capas (memoria → localStorage → IndexedDB → servidor)
 * - Try-catch en todas las operaciones async
 * - Cleanup correcto de efectos
 * - Evitar guardados redundantes con comparación
 */

import { useEffect, useRef, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { useDebounce } from 'use-debounce';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';
import { fichasService } from '../services/fichas.service';
import {
  saveDraftToIndexedDB,
  markDraftAsSynced,
} from '../services/draftStorage.service';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// ============================================
// TYPES
// ============================================

interface UseAutoSaveDraftProps {
  control: any; // React Hook Form control
  codigoProductor: string | undefined;
  gestion: number | undefined;
  currentStep: number;
  enabled?: boolean; // Permitir deshabilitar auto-save
}

interface UseAutoSaveDraftReturn {
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  manualSave: () => Promise<void>;
}

// ============================================
// HOOK
// ============================================

export function useAutoSaveDraft({
  control,
  codigoProductor,
  gestion,
  currentStep,
  enabled = true,
}: UseAutoSaveDraftProps): UseAutoSaveDraftReturn {
  const isOnline = useOnlineStatus();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Observar cambios en el formulario
  const formData = useWatch({ control });

  // Debounce de 3 segundos
  const [debouncedFormData] = useDebounce(formData, 3000);

  // Ref para evitar guardar múltiples veces
  const isSaving = useRef(false);

  // Ref para comparar datos y evitar guardados redundantes
  const lastSavedData = useRef<string>('');

  // ============================================
  // FUNCIÓN PRINCIPAL DE GUARDADO
  // ============================================

  const saveDraft = async () => {
    if (!codigoProductor || !gestion || !enabled || isSaving.current) {
      return;
    }

    // Evitar guardados redundantes
    const currentDataString = JSON.stringify(debouncedFormData);
    if (currentDataString === lastSavedData.current) {
      return;
    }

    try {
      isSaving.current = true;
      setSaveStatus('saving');

      // CAPA 1: Guardar en localStorage (instantáneo, fallback rápido)
      const localStorageKey = `apromam-ficha-draft-${codigoProductor}-${gestion}`;
      try {
        localStorage.setItem(
          localStorageKey,
          JSON.stringify({
            codigo_productor: codigoProductor,
            gestion,
            step_actual: currentStep,
            form_data: debouncedFormData,
            updated_at: new Date().toISOString(),
          })
        );
      } catch (e) {
        // localStorage lleno, continuar con IndexedDB
      }

      // CAPA 2: Guardar en IndexedDB (robusto)
      await saveDraftToIndexedDB(
        codigoProductor,
        gestion,
        currentStep,
        debouncedFormData
      );

      // CAPA 3: Si hay internet, guardar en servidor
      if (isOnline) {
        const result = await fichasService.saveDraft(
          codigoProductor,
          gestion,
          currentStep,
          debouncedFormData
        );

        if (result.success) {
          // Marcar como sincronizado en IndexedDB
          await markDraftAsSynced(codigoProductor, gestion);
        }
      }

      // Actualizar estado exitoso
      setSaveStatus('saved');
      setLastSavedAt(new Date());
      lastSavedData.current = currentDataString;
    } catch (error) {
      console.error('[AutoSave] Error:', error);
      setSaveStatus('error');
    } finally {
      isSaving.current = false;

      // Volver a 'idle' después de 2 segundos
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }
  };

  // ============================================
  // EFECTOS
  // ============================================

  // Auto-save cuando cambia debouncedFormData
  useEffect(() => {
    if (debouncedFormData && enabled) {
      saveDraft();
    }
  }, [debouncedFormData]);

  // Guardar al cambiar de step
  useEffect(() => {
    if (enabled && codigoProductor && gestion) {
      saveDraft();
    }
  }, [currentStep]);

  // Guardar antes de cerrar/recargar página
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (enabled && codigoProductor && gestion) {
        // Guardar de manera síncrona en localStorage
        const localStorageKey = `apromam-ficha-draft-${codigoProductor}-${gestion}`;
        try {
          localStorage.setItem(
            localStorageKey,
            JSON.stringify({
              codigo_productor: codigoProductor,
              gestion,
              step_actual: currentStep,
              form_data: formData,
              updated_at: new Date().toISOString(),
            })
          );
        } catch (err) {
          console.error('[AutoSave] Error en beforeunload:', err);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, codigoProductor, gestion, currentStep, formData]);

  // ============================================
  // RETURN
  // ============================================

  return {
    saveStatus,
    lastSavedAt,
    manualSave: saveDraft,
  };
}
