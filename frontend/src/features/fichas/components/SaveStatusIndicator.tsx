/**
 * Componente que muestra el estado del auto-save
 * "Guardando...", "Guardado 14:35", "Error al guardar"
 *
 * Estados:
 * - idle: No muestra nada o muestra última hora guardada
 * - saving: Muestra spinner "Guardando..."
 * - saved: Muestra check verde "Guardado HH:MM"
 * - error: Muestra alerta roja "Error al guardar"
 */

import { Save, Check, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { SaveStatus } from '../hooks/useAutoSaveDraft';

// ============================================
// TYPES
// ============================================

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  lastSavedAt: Date | null;
  isOnline: boolean;
}

// ============================================
// COMPONENT
// ============================================

export function SaveStatusIndicator({
  status,
  lastSavedAt,
  isOnline,
}: SaveStatusIndicatorProps) {
  // No mostrar nada si nunca se ha guardado
  if (status === 'idle' && !lastSavedAt) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {/* Icono según estado */}
      {status === 'saving' && (
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      )}
      {status === 'saved' && <Check className="h-4 w-4 text-green-500" />}
      {status === 'error' && (
        <AlertCircle className="h-4 w-4 text-red-500" />
      )}
      {status === 'idle' && lastSavedAt && (
        <Save className="h-4 w-4 text-gray-400" />
      )}

      {/* Texto según estado */}
      <span
        className={`
          ${status === 'saving' ? 'text-blue-600' : ''}
          ${status === 'saved' ? 'text-green-600' : ''}
          ${status === 'error' ? 'text-red-600' : ''}
          ${status === 'idle' ? 'text-gray-600' : ''}
        `}
      >
        {status === 'saving' && 'Guardando...'}
        {status === 'saved' && lastSavedAt && (
          <>
            Guardado {format(lastSavedAt, 'HH:mm')}
            {!isOnline && ' (local)'}
          </>
        )}
        {status === 'error' && 'Error al guardar'}
        {status === 'idle' && lastSavedAt && (
          <>
            Guardado {format(lastSavedAt, 'HH:mm')}
            {!isOnline && ' (local)'}
          </>
        )}
      </span>
    </div>
  );
}
