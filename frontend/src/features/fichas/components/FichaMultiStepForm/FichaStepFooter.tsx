/**
 * FichaStepFooter
 * Footer compacto con navegación entre pasos
 * Solo iconos con tooltips para ahorrar espacio
 */

import { ChevronLeft, ChevronRight, Save, Send } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Tooltip } from "@/shared/components/ui/Tooltip";
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
    <footer className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 shadow-lg z-30">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-2">
          {/* Previous Button */}
          <div className="flex-shrink-0">
            {!isFirstStep ? (
              <Tooltip content="Paso anterior" position="top">
                <Button
                  onClick={onPrevious}
                  variant="secondary"
                  disabled={isSubmitting}
                  size="small"
                  className="!px-3 !py-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Tooltip>
            ) : (
              <div className="w-[44px]" />
            )}
          </div>

          {/* Middle: Save Draft Button */}
          <div className="flex-shrink-0">
            {onSaveDraft && (
              <Tooltip
                content={isAutosaving ? "Guardando..." : "Guardar borrador"}
                position="top"
              >
                <Button
                  onClick={onSaveDraft}
                  variant="secondary"
                  disabled={isAutosaving || isSubmitting}
                  size="small"
                  className="!px-3 !py-2"
                >
                  <Save className={`w-5 h-5 ${isAutosaving ? "animate-pulse" : ""}`} />
                </Button>
              </Tooltip>
            )}
          </div>

          {/* Progress indicator */}
          <div className="flex-1 text-center">
            <span className="text-xs text-gray-600 font-medium">
              Paso {currentStep} de {totalSteps}
            </span>
          </div>

          {/* Next/Submit Button */}
          <div className="flex-shrink-0">
            <Tooltip
              content={
                isLastStep
                  ? isSubmitting
                    ? "Enviando..."
                    : "Enviar ficha"
                  : "Siguiente paso"
              }
              position="top"
            >
              <Button
                onClick={handleNextOrSubmit}
                variant="primary"
                disabled={!canNavigateNext || isSubmitting}
                size="small"
                className="!px-3 !py-2"
              >
                {isLastStep ? (
                  <Send className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    </footer>
  );
}
