/**
 * FichaMultiStepForm
 * Contenedor principal del formulario multi-paso de fichas
 * Integra React Hook Form + Zustand para gestión de estado
 * Con sistema de borradores: auto-save, recuperación y sincronización
 */

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { showToast } from "@/shared/hooks/useToast";
import { useGestionActiva } from "@/features/configuracion/hooks/useGestionActiva";
import { productoresService } from "@/features/productores/services/productores.service";
import {
  useFichaFormActions,
  useCurrentStep,
  useIsDirty,
  useIsAutosaving,
} from "../../stores/fichaFormStore";
import {
  fichaCompletaFormSchema,
  fichaCompletaSchema,
} from "../../schemas/ficha.schemas";
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

// Sistema de validación
import { useStepValidation } from "../../hooks/useStepValidation";

// ============================================
// STEP VALIDATION MANAGER (debe estar dentro del FormProvider)
// ============================================

function StepValidationManager({ currentStep }: { currentStep: number }) {
  // Este hook SÍ puede usar useFormContext porque está dentro del FormProvider
  const { validateNow } = useStepValidation(currentStep);
  const actions = useFichaFormActions();

  // Guardar la función de validación en el store
  useEffect(() => {
    // Guardar validateNow en el store para que handleNext pueda usarla
    (window as any).__validateCurrentStep = validateNow;

    return () => {
      delete (window as any).__validateCurrentStep;
    };
  }, [validateNow]);

  return null; // No renderiza nada
}

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
  const { gestionActiva } = useGestionActiva();

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
      cosecha_ventas: [
        {
          tipo_mani: "ecologico",
          superficie_actual_ha: 0,
          cosecha_estimada_qq: 0,
          numero_parcelas: 0,
          destino_consumo_qq: 0,
          destino_semilla_qq: 0,
          destino_ventas_qq: 0,
          observaciones: "",
        },
      ],
      planificacion_siembras: [],
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
    enabled:
      mode === "create" &&
      !!codigoProductor &&
      !!gestion &&
      !isLoadingDraft &&
      !draft,
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
      // Asegurar que cosecha_ventas tenga exactamente 1 registro
      const draftData = { ...draft.data };
      if (draftData.cosecha_ventas) {
        if (draftData.cosecha_ventas.length === 0) {
          // Si está vacío, inicializar con 1 registro
          draftData.cosecha_ventas = [
            {
              tipo_mani: "ecologico",
              superficie_actual_ha: 0,
              cosecha_estimada_qq: 0,
              numero_parcelas: 0,
              destino_consumo_qq: 0,
              destino_semilla_qq: 0,
              destino_ventas_qq: 0,
              observaciones: "",
            },
          ];
        } else if (draftData.cosecha_ventas.length > 1) {
          // Si hay más de 1, mantener solo el primero
          draftData.cosecha_ventas = [draftData.cosecha_ventas[0]];
        }
      }

      // Reset del React Hook Form con datos del borrador
      // keepDefaultValues: true mantiene los valores por defecto y solo actualiza los campos con datos
      // keepDirtyValues: false asegura que todos los valores se actualicen
      reset(draftData, {
        keepDefaultValues: false,
        keepDirtyValues: false,
        keepErrors: false,
        keepDirty: false,
        keepIsSubmitted: false,
        keepTouched: false,
        keepIsValid: false,
        keepSubmitCount: false,
      });

      // Ir al step guardado
      actions.setCurrentStep(draft.step_actual);

      // Cerrar modal
      acceptDraft();

      showToast.success("Borrador recuperado exitosamente");
    }
  };

  // Manejar rechazo de borrador
  const handleRejectDraft = () => {
    rejectDraft();
  };

  // Helper para aplicar "N/A" solo a campos vacíos
  const applyNA = (value: string | undefined | null): string => {
    // Si el valor existe y no está vacío después de trim, retornar el valor
    if (value && value.trim().length > 0) {
      return value.trim();
    }
    // Si está vacío, null o undefined, retornar "N/A"
    return "N/A";
  };

  // Handler para submit final
  const handleFormSubmit = async (data: CreateFichaCompletaInput) => {
    // Transformar de estructura frontend a estructura backend
    const {
      ficha, // Se aplana al root
      evaluacion_conocimiento, // Se renombra
      detalles_cultivo, // Se renombra
      no_conformidades, // Se transforma
      coordenadas_domicilio, // Coordenadas del productor (se actualizan aparte)
      ...rest
    } = data;

    // Transformar fechas en no_conformidades de "YYYY-MM-DD" a ISO datetime
    const no_conformidadesTransformadas = no_conformidades?.map((nc) => ({
      ...nc,
      fecha_limite_implementacion: nc.fecha_limite_implementacion
        ? new Date(nc.fecha_limite_implementacion).toISOString()
        : undefined,
      accion_correctiva_propuesta: applyNA(nc.accion_correctiva_propuesta),
    }));

    // Aplicar "N/A" a campos opcionales en acciones correctivas
    const accionesCorrectivasTransformadas = rest.acciones_correctivas?.map((ac) => ({
      ...ac,
      implementacion_descripcion: applyNA(ac.implementacion_descripcion),
    }));

    // Aplicar "N/A" a campos opcionales en actividades pecuarias
    const actividadesPecuariasTransformadas = rest.actividades_pecuarias?.map((ap) => ({
      ...ap,
      animal_especifico: applyNA(ap.animal_especifico),
      sistema_manejo: applyNA(ap.sistema_manejo),
      uso_guano: applyNA(ap.uso_guano),
    }));

    // Aplicar "N/A" SOLO al campo de texto libre situacion_actual
    // NO aplicar a campos ENUM (procedencia_semilla, tipo_abonamiento, etc.)
    const detallesCultivoTransformados = detalles_cultivo?.map((dc) => ({
      ...dc,
      situacion_actual: dc.situacion_actual && dc.situacion_actual.trim().length > 0
        ? dc.situacion_actual.trim()
        : "N/A",
    }));

    // Aplicar "N/A" a campos opcionales en parcelas inspeccionadas
    const parcelasInspeccionadasTransformadas = rest.parcelas_inspeccionadas?.map((pi) => ({
      ...pi,
      insumos_organicos: applyNA(pi.insumos_organicos),
    }));

    // Aplicar "N/A" a campos opcionales en cosecha y ventas
    const cosechaVentasTransformada = rest.cosecha_ventas?.map((cv) => ({
      ...cv,
      observaciones: applyNA(cv.observaciones),
    }));

    const dataToSend = {
      // Aplanar campos de ficha al root
      ...ficha,

      // Convertir fecha a ISO datetime "YYYY-MM-DDTHH:mm:ss.sssZ"
      // Maneja tanto "YYYY-MM-DD" (create) como "YYYY-MM-DDTHH:mm:ss.sssZ" (edit)
      fecha_inspeccion: ficha.fecha_inspeccion
        ? new Date(ficha.fecha_inspeccion).toISOString()
        : "",

      // Aplicar "N/A" a comentarios de ficha principal
      comentarios_actividad_pecuaria: applyNA(ficha.comentarios_actividad_pecuaria),

      // Renombrar campos que tienen nombres diferentes en backend
      evaluacion_conocimiento_normas: evaluacion_conocimiento ? {
        ...evaluacion_conocimiento,
        comentarios_conocimiento: applyNA(evaluacion_conocimiento.comentarios_conocimiento),
      } : undefined,
      detalle_cultivos_parcelas: detallesCultivoTransformados,

      // Incluir no_conformidades con fechas y N/A transformados
      no_conformidades: no_conformidadesTransformadas,

      // Incluir acciones correctivas con N/A
      acciones_correctivas: accionesCorrectivasTransformadas,

      // Incluir actividades pecuarias con N/A
      actividades_pecuarias: actividadesPecuariasTransformadas,

      // Incluir parcelas inspeccionadas con N/A
      parcelas_inspeccionadas: parcelasInspeccionadasTransformadas,

      // Incluir cosecha ventas con N/A
      cosecha_ventas: cosechaVentasTransformada,

      // Aplicar "N/A" a campos de secciones opcionales
      revision_documentacion: rest.revision_documentacion ? {
        ...rest.revision_documentacion,
        observaciones_documentacion: applyNA(rest.revision_documentacion.observaciones_documentacion),
      } : undefined,

      evaluacion_mitigacion: rest.evaluacion_mitigacion ? {
        ...rest.evaluacion_mitigacion,
        practica_mitigacion_riesgos_descripcion: applyNA(rest.evaluacion_mitigacion.practica_mitigacion_riesgos_descripcion),
        mitigacion_contaminacion_descripcion: applyNA(rest.evaluacion_mitigacion.mitigacion_contaminacion_descripcion),
      } : undefined,

      evaluacion_poscosecha: rest.evaluacion_poscosecha ? {
        ...rest.evaluacion_poscosecha,
        comentarios_poscosecha: applyNA(rest.evaluacion_poscosecha.comentarios_poscosecha),
      } : undefined,

      // Incluir planificacion_siembras (Step 12)
      planificacion_siembras: rest.planificacion_siembras,
    };

    try {
      // 1. Actualizar coordenadas del productor si existen
      if (coordenadas_domicilio && ficha.codigo_productor &&
          (coordenadas_domicilio.latitud !== 0 || coordenadas_domicilio.longitud !== 0)) {
        try {
          await productoresService.updateProductor(
            ficha.codigo_productor,
            {
              coordenadas: {
                latitud: coordenadas_domicilio.latitud,
                longitud: coordenadas_domicilio.longitud,
                altitud: coordenadas_domicilio.altitud,
              },
            }
          );
        } catch (error) {
          showToast.warning("Ficha guardada, pero no se pudieron actualizar las coordenadas del productor");
        }
      }

      // 2. Enviar la ficha
      await onSubmit(dataToSend);
      actions.resetForm();
    } catch (err) {
      showToast.error("Error al enviar la ficha");
    }
  };

  // Handler para navegar al siguiente step CON VALIDACIÓN
  const handleNext = async () => {
    // Obtener la función de validación del window (guardada por StepValidationManager)
    const validateCurrentStep = (window as any).__validateCurrentStep;

    if (!validateCurrentStep) {
      actions.goToNextStep();
      return;
    }

    // Validar step actual antes de avanzar
    const validation = await validateCurrentStep();

    // Si hay ERRORES críticos, NO permitir avanzar
    if (validation.hasErrors) {
      showToast.error(`Completa los campos obligatorios antes de continuar`, {
        duration: 5000,
      });

      // Scroll al primer campo con error
      if (validation.errors.length > 0) {
        const firstErrorField = validation.errors[0].field;

        // Intentar hacer scroll al campo
        setTimeout(() => {
          const fieldElement = document.querySelector(
            `[name="${firstErrorField}"]`
          );
          if (fieldElement) {
            fieldElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 100);
      }

      return;
    }

    // Si hay WARNINGS (pero no errores), permitir avanzar con notificación
    if (validation.hasWarnings) {
      showToast.warning(`Hay campos recomendados sin completar`, {
        duration: 3000,
      });

      // ✅ PERMITIR NAVEGACIÓN (warning no bloquea)
    }

    // Si paso validación (o solo tiene warnings), avanzar
    actions.goToNextStep();
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
      {/* Validación del step actual (debe estar dentro del FormProvider) */}
      <StepValidationManager currentStep={currentStep} />

      {/* Modal de recuperación de borrador */}
      <DraftRecoveryModal
        isOpen={!!draft}
        codigoProductor={codigoProductor || ""}
        gestion={
          gestion || gestionActiva?.anio_gestion || new Date().getFullYear()
        }
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
      <div className="flex-1 pb-20 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Mostrar errores globales si existen - Solo errores con mensaje directo */}
          {Object.entries(errors).some(
            ([_, error]) => error && typeof error.message === "string"
          ) && (
            <div className="p-4 mb-4 border rounded-lg bg-error-50 border-error-200">
              <h3 className="mb-2 text-sm font-semibold text-error-800">
                Errores de validación:
              </h3>
              <ul className="text-sm list-disc list-inside text-error-700">
                {Object.entries(errors)
                  .filter(
                    ([_, error]) => error && typeof error.message === "string"
                  )
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

      {/* Footer - handleNext valida antes de avanzar */}
      <FichaStepFooter
        currentStep={currentStep}
        totalSteps={STEP_CONFIGS.length}
        onPrevious={actions.goToPreviousStep}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmit(handleFormSubmit)}
        isFirstStep={currentStep === 1}
        isLastStep={currentStep === STEP_CONFIGS.length}
        canNavigateNext={true}
      />
    </FormProvider>
  );
}
