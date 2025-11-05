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
import { useProductorParcelas } from '@/features/productores/hooks/useProductorParcelas';

// Import validaciones custom
import { validateStep4Superficie } from '../utils/customValidations';
import { validateStep8Destinos } from '../utils/customValidations';

/**
 * Hook para validar un step específico
 */
export function useStepValidation(step: number) {
  const { trigger, watch, formState } = useFormContext<CreateFichaCompletaInput>();
  const actions = useFichaFormStore((state) => state.actions);

  // Obtener parcelas del productor para validación del Step 4
  const codigoProductor = step === 4 ? watch('ficha.codigo_productor') : undefined;
  const { parcelas } = useProductorParcelas(codigoProductor);

  /**
   * Función principal de validación
   * 1. Valida campos con Zod (via trigger)
   * 2. Ejecuta validaciones custom si existen
   * 3. Retorna resultado combinado
   */
  const validateStep = useCallback(async (): Promise<StepValidation> => {
    const fields = STEP_FIELDS[step];

    // Si el step no tiene campos definidos, es válido por defecto
    if (!fields || fields.length === 0) {
      return {
        isValid: true,
        hasErrors: false,
        hasWarnings: false,
        errors: [],
        warnings: [],
      };
    }

    // 1. Validar con Zod (via trigger de React Hook Form)
    const isZodValid = await trigger(fields as any);

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
        customValidation = await validateStep4Superficie(watch, parcelas);
        break;

      case 8:
        customValidation = await validateStep8Destinos(watch);
        break;

      default:
        // No hay validación custom para este step
        break;
    }

    // Si hay validación custom, combinar con resultado Zod
    if (customValidation) {
      return customValidation;
    }

    // Si pasó Zod y no hay validación custom, está completamente válido

    return {
      isValid: true,
      hasErrors: false,
      hasWarnings: false,
      errors: [],
      warnings: [],
    };
  }, [step, trigger, watch, formState.errors, parcelas]);

  /**
   * Validación con debouncing (500ms)
   * Para no validar en cada keystroke
   */
  const validateDebounced = useDebouncedCallback(
    async () => {
      const validation = await validateStep();

      // Actualizar el store con el resultado
      actions.setStepValidation(step, validation);

      // Marcar step como completo/incompleto según resultado
      if (validation.isValid && !validation.hasWarnings) {
        actions.markStepComplete(step);
      } else if (validation.hasErrors) {
        actions.markStepIncomplete(step);
      } else if (validation.hasWarnings) {
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
    const subscription = watch(() => {
      validateDebounced();
    });

    // Validar una vez al montar
    validateDebounced();

    return () => {
      subscription.unsubscribe();
    };
  }, [step, watch, validateDebounced]);

  /**
   * Función para validar manualmente (sin debounce)
   * Se usa cuando el usuario hace clic en "Siguiente"
   */
  const validateNow = useCallback(async (): Promise<StepValidation> => {
    const validation = await validateStep();
    actions.setStepValidation(step, validation);
    return validation;
  }, [validateStep, step, actions]);

  return {
    validateNow, // Validar inmediatamente
    validateDebounced, // Validar con debounce
  };
}
