/**
 * FichaSidebar
 * Sidebar de navegación entre pasos del formulario
 * Diseño consistente con el resto del sistema APROMAM
 * Basado en patrones modernos de multi-step forms 2024-2025
 */

import { CheckCircle2, AlertCircle, AlertTriangle, X } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/shared/config/routes.config";
import {
  useCurrentStep,
  useFichaFormActions,
  useCompletedSteps,
  useFormProgress,
  useStepValidation,
} from "../../stores/fichaFormStore";
import type { StepConfig } from "./stepConfigs";

// ============================================
// TYPES
// ============================================

interface FichaSidebarProps {
  steps: StepConfig[];
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface StepItemProps {
  step: StepConfig;
  isActive: boolean;
  isCompleted: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  errorCount: number;
  warningCount: number;
  onClick: () => void;
  canNavigate: boolean;
}

// ============================================
// STEP ITEM COMPONENT
// ============================================

function StepItem({
  step,
  isActive,
  isCompleted,
  hasErrors,
  hasWarnings,
  errorCount,
  warningCount,
  onClick,
  canNavigate,
}: StepItemProps) {
  console.log(`🎨 [StepItem ${step.id}] Renderizando:`, {
    isActive,
    isCompleted,
    hasErrors,
    hasWarnings,
    errorCount,
    warningCount,
  });

  const getIcon = () => {
    if (hasErrors) {
      console.log(`❌ [StepItem ${step.id}] Mostrando icono de ERROR`);
      return <AlertCircle className="w-5 h-5 text-error" />;
    }
    if (hasWarnings) {
      console.log(`⚠️ [StepItem ${step.id}] Mostrando icono de WARNING`);
      return <AlertTriangle className="w-5 h-5 text-warning" />;
    }
    if (isCompleted) {
      console.log(`✅ [StepItem ${step.id}] Mostrando icono de COMPLETADO`);
      return <CheckCircle2 className="w-5 h-5 text-success" />;
    }
    // Mostrar número de sección en lugar de círculo
    console.log(`🔢 [StepItem ${step.id}] Mostrando número de step`);
    return (
      <div
        className={`
          w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
          ${isActive
            ? "bg-white text-primary"
            : "bg-primary/10 text-primary"
          }
        `}
      >
        {step.id}
      </div>
    );
  };

  const getBadge = () => {
    if (errorCount > 0) {
      console.log(`🔴 [StepItem ${step.id}] Mostrando badge con ${errorCount} errores`);
      return (
        <span className="bg-error text-white px-2 py-0.5 rounded-full text-xs font-medium">
          {errorCount}
        </span>
      );
    }
    if (warningCount > 0) {
      console.log(`🟡 [StepItem ${step.id}] Mostrando badge con ${warningCount} warnings`);
      return (
        <span className="bg-warning text-white px-2 py-0.5 rounded-full text-xs font-medium">
          {warningCount}
        </span>
      );
    }
    return null;
  };

  return (
    <button
      onClick={onClick}
      disabled={!canNavigate}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
        ${isActive ? "bg-primary text-white" : "text-text-secondary hover:bg-neutral-bg hover:text-text-primary"}
        ${!canNavigate ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
      `}
    >
      {/* Icon */}
      <div className="flex-shrink-0">{getIcon()}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <span className={`text-sm font-medium ${isActive ? "text-white" : ""}`}>
          {step.title}
        </span>
      </div>

      {/* Badge (errores/warnings) */}
      {getBadge()}
    </button>
  );
}

// ============================================
// SIDEBAR COMPONENT
// ============================================

export default function FichaSidebar({
  steps,
  isMobileOpen = false,
  onMobileClose
}: FichaSidebarProps) {
  const currentStep = useCurrentStep();
  const completedSteps = useCompletedSteps();
  const progress = useFormProgress();
  const actions = useFichaFormActions();

  // Pre-calcular validaciones para todos los steps (llamar hooks en nivel superior)
  const step1Validation = useStepValidation(1);
  const step2Validation = useStepValidation(2);
  const step3Validation = useStepValidation(3);
  const step4Validation = useStepValidation(4);
  const step5Validation = useStepValidation(5);
  const step6Validation = useStepValidation(6);
  const step7Validation = useStepValidation(7);
  const step8Validation = useStepValidation(8);
  const step9Validation = useStepValidation(9);
  const step10Validation = useStepValidation(10);
  const step11Validation = useStepValidation(11);

  const validationsMap = {
    1: step1Validation,
    2: step2Validation,
    3: step3Validation,
    4: step4Validation,
    5: step5Validation,
    6: step6Validation,
    7: step7Validation,
    8: step8Validation,
    9: step9Validation,
    10: step10Validation,
    11: step11Validation,
  };

  const handleStepClick = (stepId: number) => {
    if (actions.canNavigateToStep(stepId)) {
      actions.setCurrentStep(stepId);
      // Cerrar mobile menu al navegar
      if (onMobileClose) {
        onMobileClose();
      }
    }
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="relative flex items-center justify-center flex-shrink-0 h-16 border-b border-neutral-border">
        <Link to={ROUTES.DASHBOARD} className="flex items-center">
          <img
            src="/apromam_logo.webp"
            alt="APROMAM"
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Mobile close button - posición absoluta para no afectar el centrado */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="absolute p-2 rounded-lg right-2 lg:hidden text-text-secondary hover:bg-neutral-bg"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="p-4 border-b border-neutral-border">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Progreso</span>
            <span className="font-semibold text-text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-neutral-bg rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-text-secondary">
            {completedSteps.size} de {steps.length} pasos completados
          </p>
        </div>
      </div>

      {/* Steps List */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {steps.map((step) => {
            const validation = validationsMap[step.id as keyof typeof validationsMap];
            const isActive = currentStep === step.id;
            const isCompleted = completedSteps.has(step.id);
            const hasErrors = validation ? validation.hasErrors : false;
            const hasWarnings = validation ? validation.hasWarnings : false;
            const errorCount = validation ? validation.errors.length : 0;
            const warningCount = validation ? validation.warnings.length : 0;
            const canNavigate = actions.canNavigateToStep(step.id);

            console.log(`📊 [FichaSidebar] Step ${step.id} validación:`, {
              hasErrors,
              hasWarnings,
              errorCount,
              warningCount,
              isCompleted,
            });

            return (
              <li key={step.id}>
                <StepItem
                  step={step}
                  isActive={isActive}
                  isCompleted={isCompleted}
                  hasErrors={hasErrors}
                  hasWarnings={hasWarnings}
                  errorCount={errorCount}
                  warningCount={warningCount}
                  onClick={() => handleStepClick(step.id)}
                  canNavigate={canNavigate}
                />
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Desktop - MISMA posición que Sidebar.tsx del admin */}
      <aside className="fixed top-0 left-0 z-30 flex-col hidden w-64 h-screen bg-white border-r lg:flex border-neutral-border">
        {sidebarContent}
      </aside>

      {/* Sidebar Mobile (Drawer) */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-neutral-border
          flex flex-col
          lg:hidden
          transform transition-transform duration-300
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
