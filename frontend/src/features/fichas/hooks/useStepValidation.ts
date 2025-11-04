/**
 * useStepValidation Hook
 * Hook para validar steps del formulario multi-paso
 * Incluye debouncing, trigger de React Hook Form, y validaciones custom
 */

import { useEffect, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useDebouncedCallback } from 'use-debounce';
import { useFichaFormStore } from '../stores/fichaFormStore';
import { STEP_FIELDS } from '../config/stepFields.config';
import type { StepValidation } from '../types/validation.types';
import type { CreateFichaCompletaInput } from '../types/ficha.types';

// Import validaciones custom (las crearemos después)
import { validateStep4Superficie } from '../utils/customValidations';
import { validateStep8Destinos } from '../utils/customValidations';

console.log('🪝 [useStepValidation] Hook cargado');

/**
 * Hook para validar un step específico
 */
export function useStepValidation(step: number) {
  const { trigger, watch, formState } = useFormContext<CreateFichaCompletaInput>();
  const actions = useFichaFormStore((state) => state.actions);

  console.log(`🪝 [useStepValidation] Inicializando para step ${step}`);

  /**
   * Función principal de validación
   * 1. Valida campos con Zod (via trigger)
   * 2. Ejecuta validaciones custom si existen
   * 3. Retorna resultado combinado
   */
  const validateStep = useCallback(async (): Promise<StepValidation> => {
    console.log(`🔍 [useStepValidation] Validando step ${step}...`);

    const fields = STEP_FIELDS[step];

    // Si el step no tiene campos definidos, es válido por defecto
    if (!fields || fields.length === 0) {
      console.log(`✅ [useStepValidation] Step ${step} no tiene campos, marcado como válido`);
      return {
        isValid: true,
        hasErrors: false,
        hasWarnings: false,
        errors: [],
        warnings: [],
      };
    }

    console.log(`🔍 [useStepValidation] Campos a validar en step ${step}:`, fields);

    // 1. Validar con Zod (via trigger de React Hook Form)
    const isZodValid = await trigger(fields as any);

    console.log(`🔍 [useStepValidation] Resultado validación Zod step ${step}:`, isZodValid);

    // Si Zod encontró errores, extraerlos de formState.errors
    if (!isZodValid) {
      const fieldErrors: Record<string, string> = {};

      fields.forEach((field) => {
        const fieldPath = field.split('.');
        let error: any = formState.errors;

        // Navegar por el path del campo (ej: "ficha.codigo_productor")
        for (const part of fieldPath) {
          if (error && error[part]) {
            error = error[part];
          } else {
            error = null;
            break;
          }
        }

        if (error && error.message) {
          fieldErrors[field] = error.message;
        }
      });

      console.log(`❌ [useStepValidation] Errores Zod en step ${step}:`, fieldErrors);

      const validation: StepValidation = {
        isValid: false,
        hasErrors: true,
        hasWarnings: false,
        errors: Object.entries(fieldErrors).map(([field, message]) => ({
          field,
          message,
          severity: 'error' as const,
        })),
        warnings: [],
        fieldErrors,
      };

      return validation;
    }

    // 2. Ejecutar validaciones custom según el step
    let customValidation: StepValidation | null = null;

    switch (step) {
      case 4:
        console.log(`🔍 [useStepValidation] Ejecutando validación custom para Step 4 (superficie)`);
        customValidation = await validateStep4Superficie(watch);
        break;

      case 8:
        console.log(`🔍 [useStepValidation] Ejecutando validación custom para Step 8 (destinos)`);
        customValidation = await validateStep8Destinos(watch);
        break;

      default:
        // No hay validación custom para este step
        break;
    }

    // Si hay validación custom, combinar con resultado Zod
    if (customValidation) {
      console.log(`🔍 [useStepValidation] Resultado validación custom step ${step}:`, {
        hasErrors: customValidation.hasErrors,
        hasWarnings: customValidation.hasWarnings,
      });

      return customValidation;
    }

    // Si pasó Zod y no hay validación custom, está completamente válido
    console.log(`✅ [useStepValidation] Step ${step} es válido`);

    return {
      isValid: true,
      hasErrors: false,
      hasWarnings: false,
      errors: [],
      warnings: [],
    };
  }, [step, trigger, watch, formState.errors]);

  /**
   * Validación con debouncing (500ms)
   * Para no validar en cada keystroke
   */
  const validateDebounced = useDebouncedCallback(
    async () => {
      console.log(`⏱️ [useStepValidation] Debounce triggered para step ${step}`);

      const validation = await validateStep();

      // Actualizar el store con el resultado
      actions.setStepValidation(step, validation);

      // Marcar step como completo/incompleto según resultado
      if (validation.isValid && !validation.hasWarnings) {
        console.log(`✅ [useStepValidation] Marcando step ${step} como COMPLETO`);
        actions.markStepComplete(step);
      } else if (validation.hasErrors) {
        console.log(`❌ [useStepValidation] Marcando step ${step} como INCOMPLETO (errores)`);
        actions.markStepIncomplete(step);
      } else if (validation.hasWarnings) {
        console.log(`⚠️ [useStepValidation] Step ${step} tiene warnings pero está completo`);
        actions.markStepComplete(step);
      }
    },
    500 // 500ms de delay
  );

  /**
   * Validar en background cuando cambian los datos
   * Se ejecuta automáticamente
   */
  useEffect(() => {
    console.log(`👁️ [useStepValidation] Watcheando cambios en step ${step}`);

    const subscription = watch(() => {
      console.log(`🔄 [useStepValidation] Datos cambiaron en step ${step}, validando...`);
      validateDebounced();
    });

    // Validar una vez al montar
    validateDebounced();

    return () => {
      console.log(`👋 [useStepValidation] Desmontando watcher para step ${step}`);
      subscription.unsubscribe();
    };
  }, [step, watch, validateDebounced]);

  /**
   * Función para validar manualmente (sin debounce)
   * Se usa cuando el usuario hace clic en "Siguiente"
   */
  const validateNow = useCallback(async (): Promise<StepValidation> => {
    console.log(`⚡ [useStepValidation] Validación INMEDIATA solicitada para step ${step}`);
    const validation = await validateStep();
    actions.setStepValidation(step, validation);
    return validation;
  }, [validateStep, step, actions]);

  return {
    validateNow, // Validar inmediatamente
    validateDebounced, // Validar con debounce
  };
}
