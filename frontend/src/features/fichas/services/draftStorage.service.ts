/**
 * Servicio para manejar almacenamiento de borradores en IndexedDB
 * Usa idb-keyval para simplificar operaciones
 *
 * Siguiendo mejores prácticas:
 * - Try-catch en todas las operaciones async
 * - Operaciones en lote cuando sea posible
 * - Fallback a localStorage si falla
 */

import { get, set, del, entries } from 'idb-keyval';

// ============================================
// TYPES
// ============================================

export interface DraftMetadata {
  codigo_productor: string;
  gestion: number;
  step_actual: number;
  created_at: string;
  updated_at: string;
  saves_count: number;
  last_sync_server?: string;
  is_synced: boolean;
}

export interface FichaDraft {
  id: string; // `${codigo_productor}-${gestion}`
  codigo_productor: string;
  gestion: number;
  step_actual: number;
  form_data: any; // Datos del formulario completo
  metadata: DraftMetadata;
}

// ============================================
// CONSTANTS
// ============================================

const DRAFT_KEY_PREFIX = 'apromam-ficha-draft';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Genera clave única para un borrador
 */
function getDraftKey(codigoProductor: string, gestion: number): string {
  return `${DRAFT_KEY_PREFIX}-${codigoProductor}-${gestion}`;
}

/**
 * Fallback a localStorage si IndexedDB falla
 */
function fallbackToLocalStorage(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    // Error al guardar en localStorage
  }
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Guarda un borrador en IndexedDB
 */
export async function saveDraftToIndexedDB(
  codigoProductor: string,
  gestion: number,
  stepActual: number,
  formData: any
): Promise<void> {
  const key = getDraftKey(codigoProductor, gestion);
  const now = new Date().toISOString();

  try {
    // Obtener borrador existente si hay
    const existing = await get<FichaDraft>(key);

    const draft: FichaDraft = {
      id: `${codigoProductor}-${gestion}`,
      codigo_productor: codigoProductor,
      gestion,
      step_actual: stepActual,
      form_data: formData,
      metadata: {
        codigo_productor: codigoProductor,
        gestion,
        step_actual: stepActual,
        created_at: existing?.metadata.created_at || now,
        updated_at: now,
        saves_count: (existing?.metadata.saves_count || 0) + 1,
        last_sync_server: existing?.metadata.last_sync_server,
        is_synced: false, // Se marca como no sincronizado hasta que backend confirme
      },
    };

    await set(key, draft);
  } catch (error) {
    // Fallback a localStorage
    fallbackToLocalStorage(key, {
      id: `${codigoProductor}-${gestion}`,
      codigo_productor: codigoProductor,
      gestion,
      step_actual: stepActual,
      form_data: formData,
      updated_at: now,
    });
  }
}

/**
 * Obtiene un borrador de IndexedDB
 */
export async function getDraftFromIndexedDB(
  codigoProductor: string,
  gestion: number
): Promise<FichaDraft | null> {
  const key = getDraftKey(codigoProductor, gestion);

  try {
    const draft = await get<FichaDraft>(key);

    if (draft) {
      return draft;
    }

    return null;
  } catch (error) {
    // Fallback: intentar leer de localStorage
    try {
      const localData = localStorage.getItem(key);
      if (localData) {
        return JSON.parse(localData);
      }
    } catch (e) {
      // Error al leer de localStorage también
    }

    return null;
  }
}

/**
 * Elimina un borrador de IndexedDB
 */
export async function deleteDraftFromIndexedDB(
  codigoProductor: string,
  gestion: number
): Promise<void> {
  const key = getDraftKey(codigoProductor, gestion);

  try {
    await del(key);

    // También eliminar de localStorage si existe
    localStorage.removeItem(key);
  } catch (error) {
    throw error;
  }
}

/**
 * Marca un borrador como sincronizado con el servidor
 */
export async function markDraftAsSynced(
  codigoProductor: string,
  gestion: number
): Promise<void> {
  const key = getDraftKey(codigoProductor, gestion);

  try {
    const draft = await get<FichaDraft>(key);

    if (draft) {
      draft.metadata.is_synced = true;
      draft.metadata.last_sync_server = new Date().toISOString();
      await set(key, draft);
    }
  } catch (error) {
    // Error al marcar como sincronizado
  }
}

/**
 * Obtiene todos los borradores no sincronizados
 * Útil para sincronizar cuando se recupera conexión
 */
export async function getUnsyncedDrafts(): Promise<FichaDraft[]> {
  try {
    const allEntries = await entries<string, FichaDraft>();
    const unsyncedDrafts = allEntries
      .filter(
        ([key, draft]) =>
          key.startsWith(DRAFT_KEY_PREFIX) && !draft.metadata.is_synced
      )
      .map(([_, draft]) => draft);

    return unsyncedDrafts;
  } catch (error) {
    return [];
  }
}

/**
 * Limpia borradores antiguos (más de 30 días)
 */
export async function cleanOldDrafts(): Promise<number> {
  try {
    const allEntries = await entries<string, FichaDraft>();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let deletedCount = 0;

    for (const [key, draft] of allEntries) {
      if (!key.startsWith(DRAFT_KEY_PREFIX)) continue;

      const updatedAt = new Date(draft.metadata.updated_at);
      if (updatedAt < thirtyDaysAgo) {
        await del(key);
        deletedCount++;
      }
    }

    return deletedCount;
  } catch (error) {
    return 0;
  }
}
