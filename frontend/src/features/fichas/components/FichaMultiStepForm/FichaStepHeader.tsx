/**
 * FichaStepHeader
 * Header simplificado para cada paso del formulario
 * Diseño consistente con el sistema APROMAM
 * Integra el indicador de guardado en el mismo componente
 */

import { SaveStatusIndicator } from "../SaveStatusIndicator";
import type { SaveStatus } from "../../hooks/useAutoSaveDraft";

// ============================================
// TYPES
// ============================================

interface FichaStepHeaderProps {
  title: string;
  description: string;
  stepNumber: number;
  totalSteps: number;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  isOnline: boolean;
}

// ============================================
// COMPONENT
// ============================================

export default function FichaStepHeader({
  title,
  description,
  saveStatus,
  lastSavedAt,
  isOnline,
}: FichaStepHeaderProps) {
  return (
    <header className="bg-white border-b border-neutral-border px-6 py-4">
      <div className="flex items-start justify-between gap-4">
        {/* Title and description */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
          <p className="text-sm text-text-secondary mt-1">{description}</p>
        </div>

        {/* Save status indicator */}
        <div className="flex-shrink-0">
          <SaveStatusIndicator
            status={saveStatus}
            lastSavedAt={lastSavedAt}
            isOnline={isOnline}
          />
        </div>
      </div>
    </header>
  );
}
