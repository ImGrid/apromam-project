/**
 * Ficha Form Store
 * Store Zustand para gestionar el estado del formulario multi-paso
 * Persiste en localStorage para soporte PWA offline
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { FichaCompleta } from "../types/ficha.types";

// ============================================
// TYPES
// ============================================

export interface StepValidation {
  isValid: boolean;
  errors: string[];
}

export interface FichaFormState {
  // Navegación
  currentStep: number;
  completedSteps: Set<number>;
  stepValidations: Record<number, StepValidation>;

  // Datos del formulario
  fichaData: Partial<FichaCompleta>;

  // Estado de guardado
  isAutosaving: boolean;
  lastSaved: Date | null;
  isDirty: boolean;
}

export interface FichaFormActions {
  // Navegación
  setCurrentStep: (step: number) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  markStepComplete: (step: number) => void;
  markStepIncomplete: (step: number) => void;

  // Validación
  setStepValidation: (step: number, validation: StepValidation) => void;
  canNavigateToStep: (step: number) => boolean;

  // Datos
  updateFichaData: (data: Partial<FichaCompleta>) => void;
  setFichaData: (data: Partial<FichaCompleta>) => void;

  // Estado
  setAutosaving: (isAutosaving: boolean) => void;
  markAsSaved: () => void;
  markAsDirty: () => void;

  // Reset
  resetForm: () => void;
}

export type FichaFormStore = FichaFormState & {
  actions: FichaFormActions;
};

// ============================================
// INITIAL STATE
// ============================================

const TOTAL_STEPS = 11;

const initialState: FichaFormState = {
  currentStep: 1,
  completedSteps: new Set<number>(),
  stepValidations: {},
  fichaData: {},
  isAutosaving: false,
  lastSaved: null,
  isDirty: false,
};

// ============================================
// STORE
// ============================================

export const useFichaFormStore = create<FichaFormStore>()(
  persist(
    (set, get) => ({
      // State
      ...initialState,

      // Actions
      actions: {
        // Navegación
        setCurrentStep: (step: number) => {
          if (step < 1 || step > TOTAL_STEPS) return;
          set({ currentStep: step });
        },

        goToNextStep: () => {
          const { currentStep } = get();
          if (currentStep < TOTAL_STEPS) {
            set({ currentStep: currentStep + 1 });
          }
        },

        goToPreviousStep: () => {
          const { currentStep } = get();
          if (currentStep > 1) {
            set({ currentStep: currentStep - 1 });
          }
        },

        markStepComplete: (step: number) => {
          const { completedSteps } = get();
          const newCompleted = new Set(completedSteps);
          newCompleted.add(step);
          set({ completedSteps: newCompleted });
        },

        markStepIncomplete: (step: number) => {
          const { completedSteps } = get();
          const newCompleted = new Set(completedSteps);
          newCompleted.delete(step);
          set({ completedSteps: newCompleted });
        },

        // Validación
        setStepValidation: (step: number, validation: StepValidation) => {
          set((state) => ({
            stepValidations: {
              ...state.stepValidations,
              [step]: validation,
            },
          }));
        },

        canNavigateToStep: (targetStep: number) => {
          const { currentStep, stepValidations } = get();

          // Siempre puede ir al paso actual o anterior
          if (targetStep <= currentStep) return true;

          // Para ir adelante, todos los pasos intermedios deben ser válidos
          for (let i = currentStep; i < targetStep; i++) {
            const validation = stepValidations[i];
            if (validation && !validation.isValid) {
              return false;
            }
          }

          return true;
        },

        // Datos
        updateFichaData: (data: Partial<FichaCompleta>) => {
          set((state) => ({
            fichaData: {
              ...state.fichaData,
              ...data,
            },
            isDirty: true,
          }));
        },

        setFichaData: (data: Partial<FichaCompleta>) => {
          set({
            fichaData: data,
            isDirty: false,
          });
        },

        // Estado
        setAutosaving: (isAutosaving: boolean) => {
          set({ isAutosaving });
        },

        markAsSaved: () => {
          set({
            lastSaved: new Date(),
            isDirty: false,
          });
        },

        markAsDirty: () => {
          set({ isDirty: true });
        },

        // Reset
        resetForm: () => {
          set({
            ...initialState,
            completedSteps: new Set<number>(),
            stepValidations: {},
          });
        },
      },
    }),
    {
      name: "ficha-form-storage",
      storage: createJSONStorage(() => localStorage),

      // Solo persistir datos necesarios (no funciones)
      partialize: (state) => ({
        currentStep: state.currentStep,
        completedSteps: Array.from(state.completedSteps), // Convert Set to Array
        fichaData: state.fichaData,
        lastSaved: state.lastSaved,
      }),

      // Transformar al hidratar (Array -> Set)
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.completedSteps = new Set(
            state.completedSteps as unknown as number[]
          );
        }
      },
    }
  )
);

// ============================================
// SELECTORS (para mejor performance)
// ============================================

export const useFichaFormActions = () =>
  useFichaFormStore((state) => state.actions);

export const useCurrentStep = () =>
  useFichaFormStore((state) => state.currentStep);

export const useFichaData = () =>
  useFichaFormStore((state) => state.fichaData);

export const useIsDirty = () => useFichaFormStore((state) => state.isDirty);

export const useIsAutosaving = () =>
  useFichaFormStore((state) => state.isAutosaving);

export const useCompletedSteps = () =>
  useFichaFormStore((state) => state.completedSteps);

export const useStepValidation = (step: number) =>
  useFichaFormStore((state) => state.stepValidations[step]);

// Cálculo de progreso
export const useFormProgress = () => {
  const completedSteps = useCompletedSteps();
  return Math.round((completedSteps.size / TOTAL_STEPS) * 100);
};
