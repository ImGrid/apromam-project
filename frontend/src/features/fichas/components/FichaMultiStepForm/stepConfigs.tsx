/**
 * Step Configurations
 * Configuración de todos los pasos del formulario multi-step
 * Separado en archivo independiente para mantener Fast Refresh
 */

import {
  Step1DatosGenerales,
  Step2RevisionDocumentacion,
  Step3AccionesCorrectivas,
  Step4InspeccionParcelas,
  Step5EvaluacionMitigacion,
  Step6ActividadPecuaria,
  Step7ManejoCultivo,
  Step8CosechaVentas,
  Step9EvaluacionPoscosecha,
  Step10ConocimientoNormas,
  Step11NoConformidades,
  Step12PlanificacionSiembra,
} from "../Steps";

// ============================================
// TYPES
// ============================================

export interface StepConfig {
  id: number;
  title: string;
  description: string;
  component: React.ComponentType<Record<string, never>>;
}

// ============================================
// PLACEHOLDER COMPONENT
// ============================================

const StepPlaceholder = ({ stepNumber }: { stepNumber: number }) => (
  <div className="p-8 text-center text-neutral-500">
    <p>Paso {stepNumber} - Componente en desarrollo</p>
    <p className="text-sm mt-2">Este paso se implementará en las siguientes fases</p>
  </div>
);

// ============================================
// STEP CONFIGURATIONS
// ============================================

export const STEP_CONFIGS: StepConfig[] = [
  {
    id: 1,
    title: "Datos Generales",
    description: "Información del productor y la inspección",
    component: Step1DatosGenerales,
  },
  {
    id: 2,
    title: "Revisión Documentación",
    description: "Documentos requeridos",
    component: Step2RevisionDocumentacion,
  },
  {
    id: 3,
    title: "Acciones Correctivas",
    description: "Acciones correctivas pendientes",
    component: Step3AccionesCorrectivas,
  },
  {
    id: 4,
    title: "Inspección de Parcelas",
    description: "Cultivos por parcela",
    component: Step4InspeccionParcelas,
  },
  {
    id: 5,
    title: "Evaluación Mitigación",
    description: "Riesgos y mitigación",
    component: Step5EvaluacionMitigacion,
  },
  {
    id: 6,
    title: "Actividad Pecuaria",
    description: "Actividades ganaderas",
    component: Step6ActividadPecuaria,
  },
  {
    id: 7,
    title: "Manejo del Cultivo",
    description: "Información por cultivo",
    component: Step7ManejoCultivo,
  },
  {
    id: 8,
    title: "Cosecha y Ventas",
    description: "Producción y destino",
    component: Step8CosechaVentas,
  },
  {
    id: 9,
    title: "Evaluación Poscosecha",
    description: "Manejo post-cosecha",
    component: Step9EvaluacionPoscosecha,
  },
  {
    id: 10,
    title: "Conocimiento Normas",
    description: "Normativas orgánicas",
    component: Step10ConocimientoNormas,
  },
  {
    id: 11,
    title: "No Conformidades",
    description: "Incumplimientos detectados",
    component: Step11NoConformidades,
  },
  {
    id: 12,
    title: "Planificación de Siembras",
    description: "Cultivos planificados para próxima gestión",
    component: Step12PlanificacionSiembra,
  },
];
