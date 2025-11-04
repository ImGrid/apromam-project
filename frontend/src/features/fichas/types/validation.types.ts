/**
 * Tipos para el sistema de validación de steps
 */

// Severidad de los mensajes de validación
export type ValidationSeverity = 'error' | 'warning' | 'info';

// Estado de un step en el wizard
export type StepStatus =
  | 'incomplete' // No se ha llenado o tiene errores
  | 'complete' // Completado sin errores ni warnings
  | 'complete-with-warnings' // Completado pero con warnings
  | 'error'; // Tiene errores que bloquean navegación

// Error de validación (bloquea navegación)
export interface ValidationError {
  field: string; // Campo que tiene el error (ej: "ficha.codigo_productor")
  message: string; // Mensaje de error
  severity: 'error';
}

// Warning de validación (no bloquea navegación)
export interface ValidationWarning {
  field: string; // Campo que tiene el warning
  message: string; // Mensaje de warning
  severity: 'warning';
}

// Información de validación (solo informativa)
export interface ValidationInfo {
  field: string;
  message: string;
  severity: 'info';
}

// Union type de todos los mensajes de validación
export type ValidationMessage = ValidationError | ValidationWarning | ValidationInfo;

// Resultado de validación de un step
export interface StepValidation {
  isValid: boolean; // true si no hay errores (puede tener warnings)
  hasErrors: boolean; // true si hay errores críticos
  hasWarnings: boolean; // true si hay warnings
  errors: ValidationError[]; // Lista de errores
  warnings: ValidationWarning[]; // Lista de warnings
  infos?: ValidationInfo[]; // Lista de información adicional
  fieldErrors?: Record<string, string>; // Mapa de field → mensaje de error
}

// Estado de validación de todos los steps
export type StepValidations = Record<number, StepValidation>;

// Resultado de validación custom (para Step 4, Step 8, etc)
export interface CustomValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

console.log('✅ [validation.types] Tipos de validación cargados');
