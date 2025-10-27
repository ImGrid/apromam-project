/**
 * FichaMultiStepForm
 * Contenedor principal del formulario multi-paso de fichas
 * Integra React Hook Form + Zustand para gestión de estado
 * Con sistema de borradores: auto-save, recuperación y sincronización
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
import { fichaCompletaFormSchema, fichaCompletaSchema } from "../../schemas/ficha.schemas";
import type {
  FichaCompleta,
  CreateFichaCompletaInput,
} from "../../types/ficha.types";
import FichaStepHeader from "./FichaStepHeader";
import FichaStepFooter from "./FichaStepFooter";
import { STEP_CONFIGS } from "./stepConfigs";

// Sistema de borradores
import { useAutoSaveDraft } from "../../hooks/useAutoSaveDraft";
import { useRecoverDraft } from "../../hooks/useRecoverDraft";
import { useOnlineStatus } from "@/shared/hooks/useOnlineStatus";
import { DraftRecoveryModal } from "../DraftRecoveryModal";

// ============================================
// TYPES
// ============================================

export interface FichaMultiStepFormProps {
  mode: "create" | "edit";
  fichaId?: string;
  initialData?: Partial<FichaCompleta>;
  onSubmit: (data: CreateFichaCompletaInput) => Promise<void>;
  onSaveDraft?: (data: Partial<FichaCompleta>) => Promise<void>;
  // Para recuperar drafts cuando se hace clic en "Continuar"
  codigoProductorFromUrl?: string;
  gestionFromUrl?: number;
}

// ============================================
// COMPONENT
// ============================================

export default function FichaMultiStepForm({
  mode,
  initialData,
  onSubmit,
  onSaveDraft,
  codigoProductorFromUrl,
  gestionFromUrl,
}: FichaMultiStepFormProps) {
  const currentStep = useCurrentStep();
  const isDirty = useIsDirty();
  const isAutosaving = useIsAutosaving();
  const actions = useFichaFormActions();
  const isOnline = useOnlineStatus();

  // React Hook Form setup
  const methods = useForm<CreateFichaCompletaInput>({
    resolver: zodResolver(fichaCompletaFormSchema),
    mode: "onChange",
    defaultValues: initialData || {
      ficha: {},
      revision_documentacion: {},
      acciones_correctivas: [],
      no_conformidades: [],
      evaluacion_mitigacion: {},
      evaluacion_poscosecha: {},
      evaluacion_conocimiento: {},
      actividades_pecuarias: [],
      parcelas_inspeccionadas: [],
      detalles_cultivo: [],
      cosecha_ventas: [],
    },
  });

  const {
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = methods;

  // Obtener código productor y gestión del formulario o de la URL
  const codigoProductorFromForm = watch("ficha.codigo_productor");
  const gestionFromForm = watch("ficha.gestion");

  // Priorizar valores de URL (cuando se hace clic en "Continuar") sobre los del formulario
  const codigoProductor = codigoProductorFromUrl || codigoProductorFromForm;
  const gestion = gestionFromUrl || gestionFromForm;

  // Hook de recuperación de borrador (DEBE ejecutarse PRIMERO)
  // IMPORTANTE: Solo en modo "create", NO en modo "edit" (ya tienes datos del servidor)
  const {
    isLoading: isLoadingDraft,
    draft,
    acceptDraft,
    rejectDraft,
  } = useRecoverDraft(
    mode === "create" ? codigoProductor : undefined,
    mode === "create" ? gestion : undefined
  );

  // Hook de auto-save (reemplaza el setInterval anterior)
  // IMPORTANTE: Deshabilitar mientras se carga el draft o el modal está abierto
  // IMPORTANTE: Solo auto-guardar en modo "create", NO en modo "edit"
  const { saveStatus, lastSavedAt, manualSave } = useAutoSaveDraft({
    control,
    codigoProductor,
    gestion,
    currentStep,
    enabled: mode === "create" && !!codigoProductor && !!gestion && !isLoadingDraft && !draft,
  });

  // Sincronizar datos del formulario con Zustand
  // IMPORTANTE: No incluir 'actions' en dependencies para evitar re-renders infinitos
  useEffect(() => {
    const subscription = watch((data) => {
      // Solo actualizar si hay datos realmente
      if (data && Object.keys(data).length > 0) {
        actions.updateFichaData(data as Partial<FichaCompleta>);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]); // Removido 'actions' de dependencias

  // Cargar datos iniciales
  useEffect(() => {
    if (initialData) {
      actions.setFichaData(initialData);
      reset(initialData as Partial<CreateFichaCompletaInput>);
    }
  }, [initialData, actions, reset]);

  // Manejar aceptación de borrador
  const handleAcceptDraft = () => {
    if (draft) {
      console.log('[RECOVER] Recuperando borrador - Productor:', codigoProductor, 'Gestion:', gestion);
      console.log('[RECOVER] Borrador recuperado:', draft);
      console.log('[RECOVER] Step actual:', draft.step_actual);
      console.log('[RECOVER] Datos del formulario:', draft.data);

      // Reset del React Hook Form con datos del borrador
      // keepDefaultValues: true mantiene los valores por defecto y solo actualiza los campos con datos
      // keepDirtyValues: false asegura que todos los valores se actualicen
      reset(draft.data, {
        keepDefaultValues: false,
        keepDirtyValues: false,
        keepErrors: false,
        keepDirty: false,
        keepIsSubmitted: false,
        keepTouched: false,
        keepIsValid: false,
        keepSubmitCount: false
      });

      // Ir al step guardado
      actions.setCurrentStep(draft.step_actual);

      // Cerrar modal
      acceptDraft();

      console.log('[RECOVER] Borrador aplicado - Navegando a step:', draft.step_actual);
      showToast.success("Borrador recuperado exitosamente");
    }
  };

  // Manejar rechazo de borrador
  const handleRejectDraft = () => {
    rejectDraft();
  };

  // Handler para submit final
  const handleFormSubmit = async (data: CreateFichaCompletaInput) => {
    console.log('[ENVIAR] ========================================');
    console.log('[ENVIAR] Iniciando envío a revisión');
    console.log('[ENVIAR] Datos completos de la ficha (estructura frontend):', data);
    console.log('[ENVIAR] Parcelas inspeccionadas (NO se envían al backend):', data.parcelas_inspeccionadas);
    console.log('[ENVIAR] Detalles de cultivo (parcelas):', data.detalles_cultivo);
    console.log('[ENVIAR] Cosecha y ventas:', data.cosecha_ventas);
    console.log('[ENVIAR] Errores de validación:', errors);

    // Transformar de estructura frontend a estructura backend
    const {
      parcelas_inspeccionadas,  // NO se envía (se envían al finalizar)
      ficha,                    // Se aplana al root
      evaluacion_conocimiento,  // Se renombra
      detalles_cultivo,         // Se renombra
      ...rest
    } = data;

    const dataToSend = {
      // Aplanar campos de ficha al root
      ...ficha,

      // Convertir fecha a ISO datetime "YYYY-MM-DDTHH:mm:ss.sssZ"
      // Maneja tanto "YYYY-MM-DD" (create) como "YYYY-MM-DDTHH:mm:ss.sssZ" (edit)
      fecha_inspeccion: ficha.fecha_inspeccion
        ? new Date(ficha.fecha_inspeccion).toISOString()
        : '',

      // Renombrar campos que tienen nombres diferentes en backend
      evaluacion_conocimiento_normas: evaluacion_conocimiento,
      detalle_cultivos_parcelas: detalles_cultivo,

      // Resto de secciones (nombres correctos)
      ...rest
    };

    console.log('[ENVIAR] Datos transformados para backend:', dataToSend);
    console.log('[ENVIAR] - codigo_productor:', dataToSend.codigo_productor);
    console.log('[ENVIAR] - gestion:', dataToSend.gestion);
    console.log('[ENVIAR] - fecha_inspeccion (ISO):', dataToSend.fecha_inspeccion);
    console.log('[ENVIAR] - inspector_interno:', dataToSend.inspector_interno);
    console.log('[ENVIAR] - detalle_cultivos_parcelas:', dataToSend.detalle_cultivos_parcelas);
    console.log('[ENVIAR] ========================================');

    try {
      await onSubmit(dataToSend);
      console.log('[ENVIAR] Ficha enviada exitosamente');
      actions.resetForm();
    } catch (err) {
      console.error("[ENVIAR] Error al enviar ficha:", err);
      showToast.error("Error al enviar la ficha");
    }
  };

  // Handler para guardar borrador manual (ahora usa el hook)
  const handleSaveDraft = async () => {
    try {
      await manualSave();
      showToast.success("Los cambios se han guardado exitosamente");
    } catch (error) {
      showToast.error("No se pudo guardar el borrador");
    }
  };

  // Obtener configuración del paso actual
  const currentStepConfig = STEP_CONFIGS[currentStep - 1];
  const StepComponent = currentStepConfig.component;

  return (
    <FormProvider {...methods}>
      {/* Modal de recuperación de borrador */}
      <DraftRecoveryModal
        isOpen={!!draft}
        codigoProductor={codigoProductor || ""}
        gestion={gestion || new Date().getFullYear()}
        stepActual={draft?.step_actual || 1}
        updatedAt={draft?.updated_at || new Date().toISOString()}
        onAccept={handleAcceptDraft}
        onReject={handleRejectDraft}
      />

      {/* Header con indicador de guardado integrado */}
      <FichaStepHeader
        title={currentStepConfig.title}
        description={currentStepConfig.description}
        stepNumber={currentStep}
        totalSteps={STEP_CONFIGS.length}
        saveStatus={saveStatus}
        lastSavedAt={lastSavedAt}
        isOnline={isOnline}
      />

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto pb-20">
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
        canNavigateNext={true}
      />
    </FormProvider>
  );
}
