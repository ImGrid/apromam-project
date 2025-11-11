/**
 * Configuración de campos por Step
 * Mapea qué campos del formulario pertenecen a cada step
 */

// Campos del Step 1: Datos Generales
export const STEP_1_FIELDS = [
  'ficha.codigo_productor',
  'ficha.gestion',
  'ficha.fecha_inspeccion',
  'ficha.inspector_interno',
  'ficha.persona_entrevistada',
  'ficha.categoria_gestion_anterior',
] as const;

// Campos del Step 2: Revisión de Documentación
export const STEP_2_FIELDS = [
  'revision_documentacion.solicitud_ingreso',
  'revision_documentacion.normas_reglamentos',
  'revision_documentacion.contrato_produccion',
  'revision_documentacion.croquis_unidad',
  'revision_documentacion.diario_campo',
  'revision_documentacion.registro_cosecha',
  'revision_documentacion.recibo_pago',
  'revision_documentacion.observaciones_documentacion',
] as const;

// Step 3: Acciones Correctivas (array dinámico)
export const STEP_3_FIELDS = [
  'acciones_correctivas',
] as const;

// Step 4: Inspección de Parcelas (array dinámico)
export const STEP_4_FIELDS = [
  'detalles_cultivo',
] as const;

// Campos del Step 5: Evaluación de Mitigación
export const STEP_5_FIELDS = [
  'evaluacion_mitigacion.practica_mitigacion_riesgos',
  'evaluacion_mitigacion.mitigacion_contaminacion',
  'evaluacion_mitigacion.deposito_herramientas',
  'evaluacion_mitigacion.deposito_insumos_organicos',
  'evaluacion_mitigacion.evita_quema_residuos',
  'evaluacion_mitigacion.practica_mitigacion_riesgos_descripcion',
  'evaluacion_mitigacion.mitigacion_contaminacion_descripcion',
  'evaluacion_mitigacion.deposito_herramientas_descripcion',
  'evaluacion_mitigacion.deposito_insumos_organicos_descripcion',
  'evaluacion_mitigacion.evita_quema_residuos_descripcion',
] as const;

// Campos del Step 6: Evaluación de Poscosecha
export const STEP_6_FIELDS = [
  'evaluacion_poscosecha.secado_campo_protegido',
  'evaluacion_poscosecha.separacion_lotes',
  'evaluacion_poscosecha.almacen_apto',
  'evaluacion_poscosecha.buenas_practicas_bodega',
  'evaluacion_poscosecha.comentarios_poscosecha',
] as const;

// Step 7: Manejo del Cultivo - está dentro de detalles_cultivo
// No tiene campos propios separados, se valida junto con Step 4

// Campos del Step 8: Cosecha y Ventas (array pero solo 1 elemento esperado)
export const STEP_8_FIELDS = [
  'cosecha_ventas',
] as const;

// Step 9: Actividad Pecuaria (array dinámico)
export const STEP_9_FIELDS = [
  'actividades_pecuarias',
] as const;

// Campos del Step 10: Evaluación de Conocimiento
export const STEP_10_FIELDS = [
  'evaluacion_conocimiento.conoce_spo',
  'evaluacion_conocimiento.conoce_nor',
  'evaluacion_conocimiento.conoce_reglamento',
  'evaluacion_conocimiento.asiste_reuniones',
  'evaluacion_conocimiento.comentarios_conocimiento',
] as const;

// Step 11: No Conformidades (array dinámico)
export const STEP_11_FIELDS = [
  'no_conformidades',
] as const;

// Step 12: Planificación de Siembras (array dinámico)
export const STEP_12_FIELDS = [
  'planificacion_siembras',
] as const;

// Mapping completo de step → campos
export const STEP_FIELDS: Record<number, readonly string[]> = {
  1: STEP_1_FIELDS,
  2: STEP_2_FIELDS,
  3: STEP_3_FIELDS,
  4: STEP_4_FIELDS,
  5: STEP_5_FIELDS,
  6: STEP_6_FIELDS,
  7: [], // Step 7 se valida junto con Step 4 (manejo del cultivo)
  8: STEP_8_FIELDS,
  9: STEP_9_FIELDS,
  10: STEP_10_FIELDS,
  11: STEP_11_FIELDS,
  12: STEP_12_FIELDS,
} as const;

// Campos que son REQUERIDOS (no pueden estar vacíos)
export const REQUIRED_FIELDS_BY_STEP: Record<number, readonly string[]> = {
  1: [
    'ficha.codigo_productor',
    'ficha.gestion',
    'ficha.fecha_inspeccion',
    'ficha.inspector_interno',
  ],
  2: [], // Todos los campos de documentación tienen default values
  3: [], // Acciones correctivas pueden estar vacías
  4: [], // Debe tener al menos 1 cultivo, pero se valida custom
  5: [], // Campos de evaluación tienen default values
  6: [], // Campos de evaluación tienen default values
  7: [], // No tiene campos propios
  8: [], // Se valida que exista exactamente 1 registro en el array
  9: [], // Actividades pecuarias pueden estar vacías
  10: [], // Campos de evaluación tienen default values
  11: [], // No conformidades pueden estar vacías
  12: [], // Planificación de siembras puede estar vacía o con valores en 0
} as const;
