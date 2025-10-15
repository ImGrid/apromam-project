/**
 * FichaStepFooter
 * Footer con botones de navegación entre pasos
 * Anterior | Guardar Borrador | Siguiente/Enviar
 */

import { ChevronLeft, ChevronRight, Save, Send } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useIsAutosaving } from "../../stores/fichaFormStore";

// ============================================
// TYPES
// ============================================

interface FichaStepFooterProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSaveDraft?: () => void;
  onSubmit?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  canNavigateNext: boolean;
  isSubmitting?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export default function FichaStepFooter({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSaveDraft,
  onSubmit,
  isFirstStep,
  isLastStep,
  canNavigateNext,
  isSubmitting = false,
}: FichaStepFooterProps) {
  const isAutosaving = useIsAutosaving();

  const handleNextOrSubmit = () => {
    if (isLastStep && onSubmit) {
      onSubmit();
    } else {
      onNext();
    }
  };

  return (
    <footer className="bg-white border-t border-gray-200 sticky bottom-0 z-30">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Previous Button */}
          <div className="flex-shrink-0">
            {!isFirstStep && (
              <Button
                onClick={onPrevious}
                variant="secondary"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Anterior</span>
              </Button>
            )}
          </div>

          {/* Middle: Save Draft Button */}
          <div className="flex-1 flex justify-center">
            {onSaveDraft && (
              <Button
                onClick={onSaveDraft}
                variant="secondary"
                disabled={isAutosaving || isSubmitting}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isAutosaving ? "Guardando..." : "Guardar Borrador"}
                </span>
                <span className="sm:hidden">Guardar</span>
              </Button>
            )}
          </div>

          {/* Next/Submit Button */}
          <div className="flex-shrink-0">
            <Button
              onClick={handleNextOrSubmit}
              variant="primary"
              disabled={!canNavigateNext || isSubmitting}
              className="flex items-center gap-2"
            >
              {isLastStep ? (
                <>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {isSubmitting ? "Enviando..." : "Enviar Ficha"}
                  </span>
                  <span className="sm:hidden">Enviar</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Siguiente</span>
                  <span className="sm:hidden">Sig.</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress indicator (mobile) */}
        <div className="lg:hidden mt-3 text-center">
          <span className="text-xs text-gray-500">
            Paso {currentStep} de {totalSteps}
          </span>
        </div>
      </div>
    </footer>
  );
}
