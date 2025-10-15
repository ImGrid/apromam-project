/**
 * FichaStepHeader
 * Header simplificado para cada paso del formulario
 * Diseño consistente con el sistema APROMAM
 */

import { Save, CheckCircle } from "lucide-react";

// ============================================
// TYPES
// ============================================

interface FichaStepHeaderProps {
  title: string;
  description: string;
  stepNumber: number;
  totalSteps: number;
  isAutosaving?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export default function FichaStepHeader({
  title,
  description,
  isAutosaving = false,
}: FichaStepHeaderProps) {
  return (
    <header className="bg-white border-b border-neutral-border px-6 py-4">
      <div className="flex items-start justify-between">
        {/* Title and description */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
          <p className="text-sm text-text-secondary mt-1">{description}</p>
        </div>

        {/* Autosave status */}
        <div className="flex items-center gap-2 ml-4">
          {isAutosaving ? (
            <>
              <Save className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm text-text-secondary">Guardando...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-sm text-success">Guardado</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
