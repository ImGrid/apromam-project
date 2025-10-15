/**
 * FichaMultiStepForm
 * Contenedor principal del formulario multi-paso de fichas
 * Integra React Hook Form + Zustand para gestión de estado
 */

import { useEffect, useCallback, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { showToast } from "@/shared/hooks/useToast";
import {
  useFichaFormActions,
  useCurrentStep,
  useIsDirty,
  useIsAutosaving,
} from "../../stores/fichaFormStore";
import { fichaCompletaSchema } from "../../schemas/ficha.schemas";
import type {
  FichaCompleta,
  CreateFichaCompletaInput,
} from "../../types/ficha.types";
import FichaStepHeader from "./FichaStepHeader";
import FichaStepFooter from "./FichaStepFooter";
import { STEP_CONFIGS } from "./stepConfigs";

// ============================================
// TYPES
// ============================================

export interface FichaMultiStepFormProps {
  mode: "create" | "edit";
  fichaId?: string;
  initialData?: Partial<FichaCompleta>;
  onSubmit: (data: CreateFichaCompletaInput) => Promise<void>;
  onSaveDraft?: (data: Partial<FichaCompleta>) => Promise<void>;
}

// ============================================
// COMPONENT
// ============================================

export default function FichaMultiStepForm({
  mode,
  initialData,
  onSubmit,
  onSaveDraft,
}: FichaMultiStepFormProps) {
  const currentStep = useCurrentStep();
  const isDirty = useIsDirty();
  const isAutosaving = useIsAutosaving();
  const actions = useFichaFormActions();
  const autosaveTimerRef = useRef<number | undefined>(undefined);

  // React Hook Form setup
  const methods = useForm<CreateFichaCompletaInput>({
    resolver: zodResolver(fichaCompletaSchema),
    mode: "onChange",
    defaultValues: initialData || {
      ficha: {},
      acciones_correctivas: [],
      no_conformidades: [],
      actividades_pecuarias: [],
      detalles_cultivo: [],
      cosecha_ventas: [],
    },
  });

  const {
    handleSubmit,
    watch,
    formState: { errors },
  } = methods;

  // Sincronizar datos del formulario con Zustand
  useEffect(() => {
    const subscription = watch((data) => {
      actions.updateFichaData(data as Partial<FichaCompleta>);
    });
    return () => subscription.unsubscribe();
  }, [watch, actions]);

  // Cargar datos iniciales
  useEffect(() => {
    if (initialData) {
      actions.setFichaData(initialData);
      methods.reset(initialData as Partial<CreateFichaCompletaInput>);
    }
  }, [initialData, actions, methods]);

  // Autosave cada 30 segundos
  const performAutosave = useCallback(async () => {
    if (!isDirty || !onSaveDraft) return;

    try {
      actions.setAutosaving(true);
      const formData = methods.getValues();
      await onSaveDraft(formData as Partial<FichaCompleta>);
      actions.markAsSaved();

      showToast.success("Los cambios se han guardado automáticamente");
    } catch (err) {
      console.error("Error en autosave:", err);
    } finally {
      actions.setAutosaving(false);
    }
  }, [isDirty, onSaveDraft, actions, methods]);

  useEffect(() => {
    if (mode === "create" || mode === "edit") {
      autosaveTimerRef.current = window.setInterval(performAutosave, 30000); // 30s
    }

    return () => {
      if (autosaveTimerRef.current) {
        window.clearInterval(autosaveTimerRef.current);
      }
    };
  }, [mode, performAutosave]);

  // Handler para submit final
  const handleFormSubmit = async (data: CreateFichaCompletaInput) => {
    try {
      await onSubmit(data);
      actions.resetForm();
    } catch (err) {
      console.error("Error al enviar ficha:", err);
      showToast.error("Error al enviar la ficha");
    }
  };

  // Handler para guardar borrador manual
  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;

    try {
      actions.setAutosaving(true);
      const formData = methods.getValues();
      await onSaveDraft(formData as Partial<FichaCompleta>);
      actions.markAsSaved();

      showToast.success("Los cambios se han guardado exitosamente");
    } catch (error) {
      showToast.error("No se pudo guardar el borrador");
    } finally {
      actions.setAutosaving(false);
    }
  };

  // Obtener configuración del paso actual
  const currentStepConfig = STEP_CONFIGS[currentStep - 1];
  const StepComponent = currentStepConfig.component;

  return (
    <FormProvider {...methods}>
      {/* Header del paso actual */}
      <FichaStepHeader
        title={currentStepConfig.title}
        description={currentStepConfig.description}
        stepNumber={currentStep}
        totalSteps={STEP_CONFIGS.length}
        isAutosaving={isAutosaving}
      />

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Mostrar errores globales si existen - Solo errores con mensaje directo */}
          {Object.entries(errors).some(
            ([_, error]) => error && typeof error.message === "string"
          ) && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-sm font-semibold text-red-800 mb-2">
                Errores de validación:
              </h3>
              <ul className="text-sm text-red-700 list-disc list-inside">
                {Object.entries(errors)
                  .filter(([_, error]) => error && typeof error.message === "string")
                  .map(([field, error]) => (
                    <li key={field}>
                      {field}: {error?.message?.toString()}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Componente del paso actual */}
          <StepComponent />
        </div>
      </div>

      {/* Footer */}
      <FichaStepFooter
        currentStep={currentStep}
        totalSteps={STEP_CONFIGS.length}
        onPrevious={actions.goToPreviousStep}
        onNext={actions.goToNextStep}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmit(handleFormSubmit)}
        isFirstStep={currentStep === 1}
        isLastStep={currentStep === STEP_CONFIGS.length}
        canNavigateNext={actions.canNavigateToStep(currentStep + 1)}
      />
    </FormProvider>
  );
}
