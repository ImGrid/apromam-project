/**
 * Schemas Zod para validación de Fichas
 * Match exacto con las validaciones del backend
 */

import { z } from "zod";

// ============================================
// ENUMS Y TIPOS BASICOS
// ============================================

export const categoriaGestionSchema = z.enum(["E", "T2", "T1", "T0"]);

export const origenCapturaSchema = z.enum(["online", "offline"]);

export const estadoSyncSchema = z.enum([
  "pendiente",
  "sincronizado",
  "conflicto",
]);

export const estadoFichaSchema = z.enum([
  "borrador",
  "revision",
  "aprobado",
  "rechazado",
]);

export const resultadoCertificacionSchema = z.enum([
  "aprobado",
  "rechazado",
  "pendiente",
]);

export const complianceStatusSchema = z.enum([
  "cumple",
  "parcial",
  "no_cumple",
  "no_aplica",
]);

// Schemas para Sección 7 - Manejo del cultivo
export const procedenciaSemillaSchema = z.enum([
  "asociacion",
  "propia",
  "otro_productor",
  "no_sembro",
]);

export const categoriaSemillaSchema = z.enum([
  "organica",
  "transicion",
  "convencional",
  "ninguna",
]);

export const tratamientoSemillasSchema = z.enum([
  "sin_tratamiento",
  "agroquimico",
  "insumos_organicos",
]);

export const tipoAbonamientoSchema = z.enum(["rastrojo", "guano", "otro"]);

export const metodoAporqueSchema = z.enum(["con_yunta", "manual", "otro"]);

export const controlHierbasSchema = z.enum([
  "con_bueyes",
  "carpida_manual",
  "otro",
]);

export const metodoCosechaSchema = z.enum(["con_yunta", "manual", "otro"]);

// Schema para Sección 8 - Cosecha y Ventas
export const tipoManiSchema = z.enum(["ecologico", "transicion"]);

// Tipo para barreras de parcelas
export const tipoBarreraSchema = z.enum(["viva", "muerta", "ninguna"]);

// ============================================
// FICHA PRINCIPAL
// ============================================

export const fichaSchema = z.object({
  id_ficha: z.string().optional(),
  codigo_productor: z
    .string()
    .min(5, "El código debe tener al menos 5 caracteres")
    .max(50, "El código no puede exceder 50 caracteres")
    .trim()
    .toUpperCase(),
  gestion: z
    .number()
    .int()
    .min(2000, "La gestión debe ser mayor o igual a 2000")
    .max(2050, "La gestión debe ser menor o igual a 2050"),
  fecha_inspeccion: z.string().refine(
    (date) => {
      const d = new Date(date);
      return !isNaN(d.getTime());
    },
    { message: "Fecha inválida" }
  ),
  inspector_interno: z
    .string()
    .min(3, "El inspector debe tener al menos 3 caracteres")
    .max(100, "El inspector no puede exceder 100 caracteres")
    .trim(),
  persona_entrevistada: z
    .string()
    .max(100, "La persona entrevistada no puede exceder 100 caracteres")
    .trim()
    .nullish(),
  categoria_gestion_anterior: categoriaGestionSchema.optional(),
  origen_captura: origenCapturaSchema.default("online"),
  fecha_sincronizacion: z.string().optional(),
  estado_sync: estadoSyncSchema.default("pendiente"),
  estado_ficha: estadoFichaSchema.default("borrador"),
  resultado_certificacion: resultadoCertificacionSchema.default("pendiente"),
  comentarios_evaluacion: z
    .string()
    .max(2000, "Los comentarios no pueden exceder 2000 caracteres")
    .trim()
    .nullish(),
  comentarios_actividad_pecuaria: z
    .string()
    .max(1000, "Los comentarios no pueden exceder 1000 caracteres")
    .trim()
    .nullish(),
  nombre_productor: z.string().optional(),
  nombre_comunidad: z.string().optional(),
});

export const createFichaSchema = fichaSchema.pick({
  codigo_productor: true,
  gestion: true,
  fecha_inspeccion: true,
  inspector_interno: true,
  persona_entrevistada: true,
  categoria_gestion_anterior: true,
  origen_captura: true,
});

export const updateFichaSchema = fichaSchema
  .pick({
    fecha_inspeccion: true,
    inspector_interno: true,
    persona_entrevistada: true,
    categoria_gestion_anterior: true,
    comentarios_evaluacion: true,
  })
  .partial();

// ============================================
// REVISION DOCUMENTACION
// ============================================

export const revisionDocumentacionSchema = z.object({
  id_revision: z.string().optional(),
  id_ficha: z.string().optional(),
  solicitud_ingreso: complianceStatusSchema.default("no_aplica"),
  normas_reglamentos: complianceStatusSchema.default("no_aplica"),
  contrato_produccion: complianceStatusSchema.default("no_aplica"),
  croquis_unidad: complianceStatusSchema.default("no_aplica"),
  diario_campo: complianceStatusSchema.default("no_aplica"),
  registro_cosecha: complianceStatusSchema.default("no_aplica"),
  recibo_pago: complianceStatusSchema.default("no_aplica"),
  observaciones_documentacion: z
    .string()
    .max(1000, "Las observaciones no pueden exceder 1000 caracteres")
    .trim()
    .nullish(),
});

export const createRevisionDocumentacionSchema =
  revisionDocumentacionSchema.omit({
    id_revision: true,
    id_ficha: true,
  });

// ============================================
// ACCIONES CORRECTIVAS
// ============================================

export const accionCorrectivaSchema = z.object({
  id_accion: z.string().optional(),
  id_ficha: z.string().optional(),
  numero_accion: z.number().int().positive("El número debe ser positivo"),
  descripcion_accion: z
    .string()
    .min(5, "La descripción debe tener al menos 5 caracteres")
    .max(500, "La descripción no puede exceder 500 caracteres")
    .trim(),
  implementacion_descripcion: z
    .string()
    .max(500, "La implementación no puede exceder 500 caracteres")
    .trim()
    .nullish(),
});

export const createAccionCorrectivaSchema = accionCorrectivaSchema.omit({
  id_accion: true,
  id_ficha: true,
});

// ============================================
// NO CONFORMIDADES
// ============================================

export const noConformidadSchema = z.object({
  id_no_conformidad: z.string().optional(),
  id_ficha: z.string().optional(),
  descripcion_no_conformidad: z
    .string()
    .min(5, "La descripción debe tener al menos 5 caracteres")
    .max(500, "La descripción no puede exceder 500 caracteres")
    .trim(),
  accion_correctiva_propuesta: z
    .string()
    .max(500, "La acción correctiva no puede exceder 500 caracteres")
    .trim()
    .nullish(),
  fecha_limite_implementacion: z.string().optional(),
  estado_conformidad: z.string().default("pendiente"),
});

export const createNoConformidadSchema = noConformidadSchema.omit({
  id_no_conformidad: true,
  id_ficha: true,
});

// ============================================
// EVALUACION MITIGACION
// ============================================

export const evaluacionMitigacionSchema = z.object({
  id_evaluacion: z.string().optional(),
  id_ficha: z.string().optional(),
  practica_mitigacion_riesgos: complianceStatusSchema.default("no_aplica"),
  mitigacion_contaminacion: complianceStatusSchema.default("no_aplica"),
  deposito_herramientas: complianceStatusSchema.default("no_aplica"),
  deposito_insumos_organicos: complianceStatusSchema.default("no_aplica"),
  evita_quema_residuos: complianceStatusSchema.default("no_aplica"),
  practica_mitigacion_riesgos_descripcion: z
    .string()
    .max(1000, "La descripción no puede exceder 1000 caracteres")
    .trim()
    .nullish(),
  mitigacion_contaminacion_descripcion: z
    .string()
    .max(1000, "La descripción no puede exceder 1000 caracteres")
    .trim()
    .nullish(),
});

export const createEvaluacionMitigacionSchema = evaluacionMitigacionSchema.omit(
  {
    id_evaluacion: true,
    id_ficha: true,
  }
);

// ============================================
// EVALUACION POSCOSECHA
// ============================================

export const evaluacionPoscosechaSchema = z.object({
  id_evaluacion: z.string().optional(),
  id_ficha: z.string().optional(),
  secado_tendal: complianceStatusSchema.default("no_aplica"),
  envases_limpios: complianceStatusSchema.default("no_aplica"),
  almacen_protegido: complianceStatusSchema.default("no_aplica"),
  evidencia_comercializacion: complianceStatusSchema.default("no_aplica"),
  comentarios_poscosecha: z
    .string()
    .max(1000, "Los comentarios no pueden exceder 1000 caracteres")
    .trim()
    .nullish(),
});

export const createEvaluacionPoscosechaSchema = evaluacionPoscosechaSchema.omit(
  {
    id_evaluacion: true,
    id_ficha: true,
  }
);

// ============================================
// EVALUACION CONOCIMIENTO NORMAS
// ============================================

export const evaluacionConocimientoSchema = z.object({
  id_evaluacion: z.string().optional(),
  id_ficha: z.string().optional(),
  conoce_normas_organicas: complianceStatusSchema.default("no_aplica"),
  recibio_capacitacion: complianceStatusSchema.default("no_aplica"),
  comentarios_conocimiento: z
    .string()
    .max(1000, "Los comentarios no pueden exceder 1000 caracteres")
    .trim()
    .nullish(),
});

export const createEvaluacionConocimientoSchema =
  evaluacionConocimientoSchema.omit({
    id_evaluacion: true,
    id_ficha: true,
  });

// ============================================
// ACTIVIDAD PECUARIA
// ============================================

export const actividadPecuariaSchema = z.object({
  id_actividad: z.string().optional(),
  id_ficha: z.string().optional(),
  tipo_ganado: z
    .string()
    .min(1, "El tipo de ganado es requerido")
    .max(50, "El tipo no puede exceder 50 caracteres")
    .trim(),
  animal_especifico: z
    .string()
    .max(50, "El animal no puede exceder 50 caracteres")
    .trim()
    .optional(),
  cantidad: z
    .number()
    .int()
    .nonnegative("La cantidad no puede ser negativa"),
  sistema_manejo: z
    .string()
    .max(200, "El sistema no puede exceder 200 caracteres")
    .trim()
    .optional(),
  uso_guano: z
    .string()
    .max(500, "El uso no puede exceder 500 caracteres")
    .trim()
    .optional(),
});

export const createActividadPecuariaSchema = actividadPecuariaSchema.omit({
  id_actividad: true,
  id_ficha: true,
});

// ============================================
// DETALLE CULTIVO PARCELA
// ============================================

export const detalleCultivoParcelaSchema = z
  .object({
    id_detalle: z.string().optional(),
    id_ficha: z.string().optional(),
    id_parcela: z.string().min(1, "La parcela es requerida"),
    id_tipo_cultivo: z.string().min(1, "El cultivo es requerido"),
    superficie_ha: z
      .number()
      .positive("La superficie debe ser mayor a 0")
      .max(10000, "La superficie no puede exceder 10,000 hectáreas"),
    procedencia_semilla: procedenciaSemillaSchema.optional(),
    categoria_semilla: categoriaSemillaSchema.optional(),
    tratamiento_semillas: tratamientoSemillasSchema.optional(),
    tipo_abonamiento: tipoAbonamientoSchema.optional(),
    tipo_abonamiento_otro: z
      .string()
      .max(200, "La descripción no puede exceder 200 caracteres")
      .trim()
      .optional(),
    metodo_aporque: metodoAporqueSchema.optional(),
    metodo_aporque_otro: z
      .string()
      .max(200, "La descripción no puede exceder 200 caracteres")
      .trim()
      .optional(),
    control_hierbas: controlHierbasSchema.optional(),
    control_hierbas_otro: z
      .string()
      .max(200, "La descripción no puede exceder 200 caracteres")
      .trim()
      .optional(),
    metodo_cosecha: metodoCosechaSchema.optional(),
    metodo_cosecha_otro: z
      .string()
      .max(200, "La descripción no puede exceder 200 caracteres")
      .trim()
      .optional(),
    situacion_actual: z
      .string()
      .max(100, "La situación actual no puede exceder 100 caracteres")
      .trim()
      .optional(),
    // Campos enriquecidos (solo lectura)
    nombre_parcela: z.string().optional(),
    nombre_cultivo: z.string().optional(),
    es_principal_certificable: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.tipo_abonamiento === "otro") {
        return (
          data.tipo_abonamiento_otro &&
          data.tipo_abonamiento_otro.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Debe especificar el abonamiento cuando selecciona 'otro'",
      path: ["tipo_abonamiento_otro"],
    }
  )
  .refine(
    (data) => {
      if (data.metodo_aporque === "otro") {
        return (
          data.metodo_aporque_otro &&
          data.metodo_aporque_otro.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Debe especificar el aporque cuando selecciona 'otro'",
      path: ["metodo_aporque_otro"],
    }
  )
  .refine(
    (data) => {
      if (data.control_hierbas === "otro") {
        return (
          data.control_hierbas_otro &&
          data.control_hierbas_otro.trim().length > 0
        );
      }
      return true;
    },
    {
      message:
        "Debe especificar el control de hierbas cuando selecciona 'otro'",
      path: ["control_hierbas_otro"],
    }
  )
  .refine(
    (data) => {
      if (data.metodo_cosecha === "otro") {
        return (
          data.metodo_cosecha_otro &&
          data.metodo_cosecha_otro.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Debe especificar la cosecha cuando selecciona 'otro'",
      path: ["metodo_cosecha_otro"],
    }
  );

export const createDetalleCultivoParcelaSchema =
  detalleCultivoParcelaSchema.omit({
    id_detalle: true,
    id_ficha: true,
    nombre_parcela: true,
    nombre_cultivo: true,
    es_principal_certificable: true,
  });

// ============================================
// PARCELAS INSPECCIONADAS (Seccion 4)
// ============================================

export const parcelaInspeccionadaSchema = z.object({
  id_parcela: z.string().min(1, "La parcela es requerida"),
  rotacion: z.boolean().optional(),
  utiliza_riego: z.boolean().optional(),
  tipo_barrera: tipoBarreraSchema.optional(),
  insumos_organicos: z
    .string()
    .max(500, "Los insumos no pueden exceder 500 caracteres")
    .trim()
    .optional(),
  latitud_sud: z
    .number()
    .min(-90, "Latitud inválida")
    .max(90, "Latitud inválida")
    .optional(),
  longitud_oeste: z
    .number()
    .min(-180, "Longitud inválida")
    .max(180, "Longitud inválida")
    .optional(),
});

export const createParcelaInspeccionadaSchema = parcelaInspeccionadaSchema;

// ============================================
// COSECHA Y VENTAS
// ============================================

export const cosechaVentasSchema = z
  .object({
    id_cosecha: z.string().optional(),
    id_ficha: z.string().optional(),
    tipo_mani: tipoManiSchema,
    superficie_actual_ha: z
      .number()
      .positive("La superficie debe ser mayor a 0"),
    cosecha_estimada_qq: z
      .number()
      .nonnegative("La cosecha no puede ser negativa"),
    numero_parcelas: z
      .number()
      .int()
      .positive("El número de parcelas debe ser mayor a 0"),
    destino_consumo_qq: z
      .number()
      .nonnegative("El consumo no puede ser negativo"),
    destino_semilla_qq: z
      .number()
      .nonnegative("La semilla no puede ser negativa"),
    destino_ventas_qq: z
      .number()
      .nonnegative("Las ventas no pueden ser negativas"),
    observaciones: z
      .string()
      .max(500, "Las observaciones no pueden exceder 500 caracteres")
      .trim()
      .nullish(),
  })
  .refine(
    (data) => {
      const total =
        data.destino_consumo_qq +
        data.destino_semilla_qq +
        data.destino_ventas_qq;
      return total <= data.cosecha_estimada_qq * 1.1; // 10% de tolerancia
    },
    {
      message:
        "La suma de destinos no puede exceder la cosecha estimada (±10%)",
      path: ["destino_consumo_qq"],
    }
  );

export const createCosechaVentasSchema = cosechaVentasSchema.omit({
  id_cosecha: true,
  id_ficha: true,
});

// ============================================
// FICHA COMPLETA
// ============================================

// Schema completo del formulario (incluye parcelas_inspeccionadas para draft)
export const fichaCompletaFormSchema = z
  .object({
    ficha: createFichaSchema,
    revision_documentacion: createRevisionDocumentacionSchema.optional(),
    acciones_correctivas: z.array(createAccionCorrectivaSchema).default([]),
    no_conformidades: z.array(createNoConformidadSchema).default([]),
    evaluacion_mitigacion: createEvaluacionMitigacionSchema.optional(),
    evaluacion_poscosecha: createEvaluacionPoscosechaSchema.optional(),
    evaluacion_conocimiento: createEvaluacionConocimientoSchema.optional(),
    actividades_pecuarias: z.array(createActividadPecuariaSchema).default([]),
    parcelas_inspeccionadas: z
      .array(createParcelaInspeccionadaSchema)
      .default([]),
    detalles_cultivo: z.array(createDetalleCultivoParcelaSchema).default([]),
    cosecha_ventas: z.array(createCosechaVentasSchema).default([]),
  })
  .refine(
    (data) => {
      return data.cosecha_ventas.length === 1;
    },
    {
      message: "Debe haber exactamente 1 registro de cosecha y ventas",
      path: ["cosecha_ventas"],
    }
  )
  .refine(
    (data) => {
      // Validar que la fecha de inspección esté dentro del año de la gestión
      if (!data.ficha?.fecha_inspeccion || !data.ficha?.gestion) {
        return true; // Dejar que otras validaciones manejen campos requeridos
      }

      const fechaInspeccion = new Date(data.ficha.fecha_inspeccion);
      const anioInspeccion = fechaInspeccion.getFullYear();
      const gestion = data.ficha.gestion;

      return anioInspeccion === gestion;
    },
    {
      message: "La fecha de inspección debe corresponder al año de la gestión",
      path: ["ficha", "fecha_inspeccion"],
    }
  );

// Schema para enviar al backend (sin parcelas_inspeccionadas - se envían al finalizar)
export const fichaCompletaSchema = fichaCompletaFormSchema.omit({
  parcelas_inspeccionadas: true,
});

// ============================================
// WORKFLOW ACTIONS
// ============================================

export const enviarRevisionSchema = z.object({});

export const aprobarFichaSchema = z.object({
  comentarios: z
    .string()
    .max(2000, "Los comentarios no pueden exceder 2000 caracteres")
    .trim()
    .optional(),
});

export const rechazarFichaSchema = z.object({
  motivo: z
    .string()
    .min(10, "El motivo debe tener al menos 10 caracteres")
    .max(2000, "El motivo no puede exceder 2000 caracteres")
    .trim(),
});

// ============================================
// TYPES EXPORT (inferidos de schemas)
// ============================================

export type FichaFormData = z.infer<typeof fichaSchema>;
export type CreateFichaFormData = z.infer<typeof createFichaSchema>;
export type UpdateFichaFormData = z.infer<typeof updateFichaSchema>;
export type FichaCompletaFormData = z.infer<typeof fichaCompletaSchema>;
