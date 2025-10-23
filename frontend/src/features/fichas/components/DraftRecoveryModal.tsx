/**
 * Modal que pregunta si desea continuar con un borrador encontrado
 *
 * Muestra:
 * - Información del productor y gestión
 * - Última modificación (fecha/hora)
 * - Step actual del formulario
 * - Botones para aceptar o rechazar
 */

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertCircle, FileText, Calendar, Layers } from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface DraftRecoveryModalProps {
  isOpen: boolean;
  codigoProductor: string;
  nombreProductor?: string;
  gestion: number;
  stepActual: number;
  updatedAt: string;
  onAccept: () => void;
  onReject: () => void;
}

// ============================================
// COMPONENT
// ============================================

export function DraftRecoveryModal({
  isOpen,
  codigoProductor,
  nombreProductor,
  gestion,
  stepActual,
  updatedAt,
  onAccept,
  onReject,
}: DraftRecoveryModalProps) {
  if (!isOpen) return null;

  const formattedDate = format(new Date(updatedAt), "dd/MM/yyyy HH:mm", {
    locale: es,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 rounded-lg">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Borrador encontrado
          </h3>
        </div>

        {/* Mensaje */}
        <p className="text-gray-600 mb-4">
          Tienes un borrador guardado de esta ficha. ¿Deseas continuar donde lo
          dejaste?
        </p>

        {/* Información del borrador */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-gray-700">
              <strong>Productor:</strong> {codigoProductor}
              {nombreProductor && ` - ${nombreProductor}`}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-gray-700">
              <strong>Gestión:</strong> {gestion}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Layers className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-gray-700">
              <strong>Progreso:</strong> Step {stepActual} de 11
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-gray-700">
              <strong>Última modificación:</strong> {formattedDate}
            </span>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={onReject}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Empezar de nuevo
          </button>
          <button
            onClick={onAccept}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Continuar con borrador
          </button>
        </div>
      </div>
    </div>
  );
}
