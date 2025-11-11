import { z } from "zod";

// Schema base para UUID
const UUIDSchema = z.string().uuid({
  message: "Formato UUID invalido",
});

// Schemas para enums

export const ComplianceStatusSchema = z.enum(
  ["cumple", "parcial", "no_cumple", "no_aplica"],
  {
    message: "Estado debe ser: cumple, parcial, no_cumple o no_aplica",
  }
);

export const EstadoFichaSchema = z.enum(
  ["borrador", "revision", "aprobado", "rechazado"],
  {
    message: "Estado de ficha invalido",
  }
);

export const ResultadoCertificacionSchema = z.enum(
  ["aprobado", "rechazado", "pendiente"],
  {
    message: "Resultado de certificacion invalido",
  }
);

export const OrigenCapturaSchema = z.enum(["online", "offline"], {
  message: "Origen de captura debe ser: online u offline",
});

export const EstadoSyncSchema = z.enum(
  ["pendiente", "sincronizado", "conflicto"],
  {
    message: "Estado de sincronizacion invalido",
  }
);

export const CategoriaProductorSchema = z.enum(["E", "T2", "T1", "T0"], {
  message: "Categoria debe ser: E, T2, T1 o T0",
});

export const ProcedenciaSemillaSchema = z.enum(
  ["asociacion", "propia", "otro_productor", "no_sembro"],
  {
    message: "Procedencia de semilla invalida",
  }
);

export const CategoriaSemillaSchema = z.enum(
  ["organica", "transicion", "convencional", "ninguna"],
  {
    message: "Categoria de semilla invalida",
  }
);

export const TipoGanadoSchema = z.enum(["mayor", "menor", "aves"], {
  message: "Tipo de ganado debe ser: mayor, menor o aves",
});

// Seccion 7: Enums para manejo de cultivos
export const TratamientoSemillasSchema = z.enum(
  ["sin_tratamiento", "agroquimico", "insumos_organicos"],
  {
    message: "Tratamiento debe ser: sin_tratamiento, agroquimico o insumos_organicos",
  }
);

export const TipoAbonamientoSchema = z.enum(
  ["rastrojo", "guano", "otro"],
  {
    message: "Tipo de abonamiento debe ser: rastrojo, guano u otro",
  }
);

export const MetodoAporqueSchema = z.enum(["con_yunta", "manual", "otro"], {
  message: "Metodo de aporque debe ser: con_yunta, manual u otro",
});

export const ControlHierbasSchema = z.enum(
  ["con_bueyes", "carpida_manual", "otro"],
  {
    message: "Control de hierbas debe ser: con_bueyes, carpida_manual u otro",
  }
);

export const MetodoCosechaSchema = z.enum(["con_yunta", "manual", "otro"], {
  message: "Metodo de cosecha debe ser: con_yunta, manual u otro",
});

// Seccion 8: Tipo de mani
export const TipoManiSchema = z.enum(["ecologico", "transicion"], {
  message: "Tipo de mani debe ser: ecologico o transicion",
});

export const TipoArchivoSchema = z.enum(
  ["croquis", "foto_parcela", "documento_pdf"],
  {
    message: "Tipo de archivo invalido",
  }
);

export const EstadoUploadSchema = z.enum(["pendiente", "subido", "error"], {
  message: "Estado de upload invalido",
});

export const EstadoSeguimientoSchema = z.enum(
  ["pendiente", "seguimiento", "corregido"],
  {
    message: "Estado de seguimiento debe ser: pendiente, seguimiento o corregido",
  }
);

// Seccion 2: Revision de documentacion
export const RevisionDocumentacionSchema = z.object({
  solicitud_ingreso: ComplianceStatusSchema,
  normas_reglamentos: ComplianceStatusSchema,
  contrato_produccion: ComplianceStatusSchema,
  croquis_unidad: ComplianceStatusSchema,
  diario_campo: ComplianceStatusSchema,
  registro_cosecha: ComplianceStatusSchema,
  recibo_pago: ComplianceStatusSchema,
  observaciones_documentacion: z
    .string()
    .max(1000, "Observaciones no pueden exceder 1000 caracteres")
    .nullish(),
});

export type RevisionDocumentacionInput = z.infer<
  typeof RevisionDocumentacionSchema
>;

// Seccion 3: Acciones correctivas (gestión anterior)
export const AccionCorrectivaSchema = z.object({
  numero_accion: z.number().int().min(1, "Numero de accion debe ser mayor a 0"),
  descripcion_accion: z
    .string()
    .min(5, "Descripcion debe tener al menos 5 caracteres")
    .max(500, "Descripcion no puede exceder 500 caracteres"),
  implementacion_descripcion: z
    .string()
    .max(500, "Implementacion no puede exceder 500 caracteres")
    .nullish(),
});

export type AccionCorrectivaInput = z.infer<typeof AccionCorrectivaSchema>;

// Seccion 11: No conformidades
export const NoConformidadSchema = z.object({
  descripcion_no_conformidad: z
    .string()
    .min(5, "Descripcion debe tener al menos 5 caracteres")
    .max(500, "Descripcion no puede exceder 500 caracteres"),
  accion_correctiva_propuesta: z
    .string()
    .max(500, "Accion correctiva no puede exceder 500 caracteres")
    .nullish(),
  fecha_limite_implementacion: z.string().datetime().optional(),
  // Campos de seguimiento (opcionales - se llenan durante el seguimiento)
  estado_seguimiento: EstadoSeguimientoSchema.default("pendiente").optional(),
  comentario_seguimiento: z
    .string()
    .max(1000, "Comentario de seguimiento no puede exceder 1000 caracteres")
    .nullish(),
  fecha_seguimiento: z.string().datetime().optional(),
  realizado_por_usuario: UUIDSchema.optional(),
});

export type NoConformidadInput = z.infer<typeof NoConformidadSchema>;

// Seccion 5: Evaluacion de mitigacion
export const EvaluacionMitigacionSchema = z.object({
  practica_mitigacion_riesgos: ComplianceStatusSchema,
  mitigacion_contaminacion: ComplianceStatusSchema,
  deposito_herramientas: ComplianceStatusSchema,
  deposito_insumos_organicos: ComplianceStatusSchema,
  evita_quema_residuos: ComplianceStatusSchema,
  practica_mitigacion_riesgos_descripcion: z
    .string()
    .max(1000, "Descripcion no puede exceder 1000 caracteres")
    .nullish(),
  mitigacion_contaminacion_descripcion: z
    .string()
    .max(1000, "Descripcion no puede exceder 1000 caracteres")
    .nullish(),
  comentarios_sobre_practica_mitigacion: z
    .string()
    .max(1000, "Comentarios no pueden exceder 1000 caracteres")
    .nullish(),
});

export type EvaluacionMitigacionInput = z.infer<
  typeof EvaluacionMitigacionSchema
>;

// Seccion 9: Evaluacion poscosecha
export const EvaluacionPoscosechaSchema = z.object({
  secado_tendal: ComplianceStatusSchema,
  envases_limpios: ComplianceStatusSchema,
  almacen_protegido: ComplianceStatusSchema,
  evidencia_comercializacion: ComplianceStatusSchema,
  comentarios_poscosecha: z
    .string()
    .max(1000, "Comentarios no pueden exceder 1000 caracteres")
    .nullable()
    .optional(),
});

export type EvaluacionPoscosechaInput = z.infer<
  typeof EvaluacionPoscosechaSchema
>;

// Seccion 10: Evaluacion conocimiento normas
export const EvaluacionConocimientoNormasSchema = z.object({
  conoce_normas_organicas: ComplianceStatusSchema,
  recibio_capacitacion: ComplianceStatusSchema,
  comentarios_conocimiento: z
    .string()
    .max(1000, "Comentarios no pueden exceder 1000 caracteres")
    .nullable()
    .optional(),
});

export type EvaluacionConocimientoNormasInput = z.infer<
  typeof EvaluacionConocimientoNormasSchema
>;

// Seccion 6: Actividad pecuaria
export const ActividadPecuariaSchema = z.object({
  tipo_ganado: TipoGanadoSchema,
  animal_especifico: z
    .string()
    .max(100, "Animal especifico no puede exceder 100 caracteres")
    .nullish(),
  cantidad: z
    .number()
    .int()
    .min(0, "Cantidad no puede ser negativa")
    .max(10000, "Cantidad no puede exceder 10000"),
  sistema_manejo: z
    .string()
    .max(200, "Sistema de manejo no puede exceder 200 caracteres")
    .nullish(),
  uso_guano: z
    .string()
    .max(500, "Uso de guano no puede exceder 500 caracteres")
    .nullish(),
});

export type ActividadPecuariaInput = z.infer<typeof ActividadPecuariaSchema>;

// Seccion 12: Planificacion de siembras (proyeccion futura)
export const PlanificacionSiembraSchema = z.object({
  id_parcela: UUIDSchema,
  area_parcela_planificada_ha: z
    .number()
    .min(0, "Área planificada no puede ser negativa")
    .max(10000, "Área planificada no puede exceder 10,000 hectáreas")
    .default(0),
  mani_ha: z
    .number()
    .min(0, "Superficie de maní no puede ser negativa")
    .max(10000, "Superficie no puede exceder 10,000 hectáreas")
    .default(0),
  maiz_ha: z
    .number()
    .min(0, "Superficie de maíz no puede ser negativa")
    .max(10000, "Superficie no puede exceder 10,000 hectáreas")
    .default(0),
  papa_ha: z
    .number()
    .min(0, "Superficie de papa no puede ser negativa")
    .max(10000, "Superficie no puede exceder 10,000 hectáreas")
    .default(0),
  aji_ha: z
    .number()
    .min(0, "Superficie de ají no puede ser negativa")
    .max(10000, "Superficie no puede exceder 10,000 hectáreas")
    .default(0),
  leguminosas_ha: z
    .number()
    .min(0, "Superficie de leguminosas no puede ser negativa")
    .max(10000, "Superficie no puede exceder 10,000 hectáreas")
    .default(0),
  otros_cultivos_ha: z
    .number()
    .min(0, "Superficie de otros cultivos no puede ser negativa")
    .max(10000, "Superficie no puede exceder 10,000 hectáreas")
    .default(0),
  otros_cultivos_detalle: z
    .string()
    .max(500, "Detalle de otros cultivos no puede exceder 500 caracteres")
    .nullish(),
  descanso_ha: z
    .number()
    .min(0, "Superficie de descanso no puede ser negativa")
    .max(10000, "Superficie no puede exceder 10,000 hectáreas")
    .default(0),
});

export type PlanificacionSiembraInput = z.infer<
  typeof PlanificacionSiembraSchema
>;

// Seccion 4/7: Detalle cultivo por parcela
// Seccion 4 (todos los cultivos): id_parcela, id_tipo_cultivo, superficie_ha, situacion_actual
// Seccion 7 (solo cultivos certificables): procedencia_semilla, categoria_semilla, etc.
export const DetalleCultivoParcelaSchema = z.object({
  // Seccion 4 - Inspeccion de parcelas (obligatorio para todos)
  id_parcela: UUIDSchema,
  id_tipo_cultivo: UUIDSchema,
  superficie_ha: z
    .number()
    .positive("Superficie debe ser mayor a 0")
    .max(10000, "Superficie no puede exceder 10,000 hectareas"),
  situacion_actual: z
    .string()
    .max(100, "Situacion actual no puede exceder 100 caracteres")
    .nullish(),

  // Seccion 7 - Manejo del cultivo (opcional - solo para cultivos certificables)
  procedencia_semilla: ProcedenciaSemillaSchema.nullish(),
  categoria_semilla: CategoriaSemillaSchema.nullish(),
  tratamiento_semillas: TratamientoSemillasSchema.nullish(),
  tipo_abonamiento: TipoAbonamientoSchema.nullish(),
  tipo_abonamiento_otro: z
    .string()
    .max(200, "Abonamiento otro no puede exceder 200 caracteres")
    .nullish(),
  metodo_aporque: MetodoAporqueSchema.nullish(),
  metodo_aporque_otro: z
    .string()
    .max(200, "Aporque otro no puede exceder 200 caracteres")
    .nullish(),
  control_hierbas: ControlHierbasSchema.nullish(),
  control_hierbas_otro: z
    .string()
    .max(200, "Control hierbas otro no puede exceder 200 caracteres")
    .nullish(),
  metodo_cosecha: MetodoCosechaSchema.nullish(),
  metodo_cosecha_otro: z
    .string()
    .max(200, "Cosecha otro no puede exceder 200 caracteres")
    .nullish(),
});

export type DetalleCultivoParcelaInput = z.infer<
  typeof DetalleCultivoParcelaSchema
>;

// Seccion 8: Cosecha y ventas (2 filas fijas: ecologico y transicion)
export const CosechaVentasSchema = z
  .object({
    tipo_mani: TipoManiSchema,
    superficie_actual_ha: z
      .number()
      .min(0, "Superficie no puede ser negativa")
      .max(10000, "Superficie no puede exceder 10000 hectareas"),
    cosecha_estimada_qq: z
      .number()
      .min(0, "Cosecha estimada no puede ser negativa")
      .max(1000000, "Cosecha estimada no puede exceder 1000000 qq"),
    numero_parcelas: z
      .number()
      .int()
      .min(0, "Numero de parcelas no puede ser negativo")
      .max(100, "Numero de parcelas no puede exceder 100"),
    destino_consumo_qq: z
      .number()
      .min(0, "Destino consumo no puede ser negativo"),
    destino_semilla_qq: z
      .number()
      .min(0, "Destino semilla no puede ser negativo"),
    destino_ventas_qq: z
      .number()
      .min(0, "Destino ventas no puede ser negativo"),
    observaciones: z
      .string()
      .max(500, "Observaciones no pueden exceder 500 caracteres")
      .nullish(),
  })
  .refine(
    (data) => {
      const total =
        data.destino_consumo_qq +
        data.destino_semilla_qq +
        data.destino_ventas_qq;
      return total <= data.cosecha_estimada_qq * 1.1;
    },
    {
      message:
        "La suma de destinos no puede exceder la cosecha estimada en mas de 10%",
    }
  );

export type CosechaVentasInput = z.infer<typeof CosechaVentasSchema>;

// Schema para archivos adjuntos
export const ArchivoFichaSchema = z.object({
  tipo_archivo: TipoArchivoSchema,
  nombre_original: z
    .string()
    .min(1, "Nombre de archivo es requerido")
    .max(255, "Nombre no puede exceder 255 caracteres"),
  tamaño_bytes: z
    .number()
    .int()
    .min(1, "Tamaño debe ser mayor a 0")
    .max(50 * 1024 * 1024, "Archivo no puede exceder 50MB"),
  mime_type: z.string().optional(),
});

export type ArchivoFichaInput = z.infer<typeof ArchivoFichaSchema>;

// Schema para datos de inspeccion de parcelas
// Estos datos se actualizan en la tabla parcelas al crear la ficha
export const ParcelaInspeccionadaSchema = z.object({
  id_parcela: UUIDSchema,
  rotacion: z.boolean().optional(),
  utiliza_riego: z.boolean().optional(),
  tipo_barrera: z
    .string()
    .max(100, "Tipo barrera no puede exceder 100 caracteres")
    .optional(),
  insumos_organicos: z
    .string()
    .max(500, "Insumos organicos no puede exceder 500 caracteres")
    .optional(),
  latitud_sud: z
    .number()
    .min(-90, "Latitud debe estar entre -90 y 90")
    .max(90, "Latitud debe estar entre -90 y 90")
    .optional(),
  longitud_oeste: z
    .number()
    .min(-180, "Longitud debe estar entre -180 y 180")
    .max(180, "Longitud debe estar entre -180 y 180")
    .optional(),
});

export type ParcelaInspeccionadaInput = z.infer<
  typeof ParcelaInspeccionadaSchema
>;

// Schema principal: Crear ficha completa
export const CreateFichaSchema = z.object({
  // Datos basicos (obligatorios)
  codigo_productor: z
    .string()
    .min(5, "Codigo de productor debe tener al menos 5 caracteres")
    .max(20, "Codigo no puede exceder 20 caracteres"),
  gestion: z
    .number()
    .int()
    .min(2000, "Gestion debe ser mayor a 2000")
    .max(2100, "Gestion debe ser menor a 2100"),
  id_gestion: z.string().uuid("ID de gestion debe ser un UUID valido").optional(),
  fecha_inspeccion: z.string().datetime(),
  inspector_interno: z
    .string()
    .min(3, "Inspector debe tener al menos 3 caracteres")
    .max(100, "Inspector no puede exceder 100 caracteres"),
  persona_entrevistada: z
    .string()
    .max(100, "Persona entrevistada no puede exceder 100 caracteres")
    .nullish(),
  categoria_gestion_anterior: CategoriaProductorSchema.optional(),
  origen_captura: OrigenCapturaSchema.default("online"),

  // Secciones evaluativas (opcionales en borrador)
  revision_documentacion: RevisionDocumentacionSchema.optional(),
  evaluacion_mitigacion: EvaluacionMitigacionSchema.optional(),
  evaluacion_poscosecha: EvaluacionPoscosechaSchema.optional(),
  evaluacion_conocimiento_normas: EvaluacionConocimientoNormasSchema.optional(),

  // Arrays (opcionales)
  acciones_correctivas: z.array(AccionCorrectivaSchema).optional(),
  no_conformidades: z.array(NoConformidadSchema).optional(),
  actividades_pecuarias: z.array(ActividadPecuariaSchema).optional(),
  detalle_cultivos_parcelas: z.array(DetalleCultivoParcelaSchema).optional(),
  cosecha_ventas: z.array(CosechaVentasSchema).optional(),
  parcelas_inspeccionadas: z.array(ParcelaInspeccionadaSchema).optional(),
  planificacion_siembras: z.array(PlanificacionSiembraSchema).optional(),

  // Comentarios adicionales (opcional)
  comentarios_actividad_pecuaria: z
    .string()
    .max(1000, "Comentarios actividad pecuaria no pueden exceder 1000 caracteres")
    .nullish(),
  comentarios_evaluacion: z
    .string()
    .max(2000, "Comentarios no pueden exceder 2000 caracteres")
    .nullish(),
});

export type CreateFichaInput = z.infer<typeof CreateFichaSchema>;

// Schema para actualizar ficha (todo opcional excepto validaciones especificas)
export const UpdateFichaSchema = z.object({
  fecha_inspeccion: z.string().datetime().optional(),
  inspector_interno: z
    .string()
    .min(3, "Inspector debe tener al menos 3 caracteres")
    .max(100, "Inspector no puede exceder 100 caracteres")
    .optional(),
  persona_entrevistada: z
    .string()
    .max(100, "Persona entrevistada no puede exceder 100 caracteres")
    .nullish(),
  categoria_gestion_anterior: CategoriaProductorSchema.optional(),
  revision_documentacion: RevisionDocumentacionSchema.optional(),
  evaluacion_mitigacion: EvaluacionMitigacionSchema.optional(),
  evaluacion_poscosecha: EvaluacionPoscosechaSchema.optional(),
  evaluacion_conocimiento_normas: EvaluacionConocimientoNormasSchema.optional(),
  acciones_correctivas: z.array(AccionCorrectivaSchema).optional(),
  no_conformidades: z.array(NoConformidadSchema).optional(),
  actividades_pecuarias: z.array(ActividadPecuariaSchema).optional(),
  detalle_cultivos_parcelas: z.array(DetalleCultivoParcelaSchema).optional(),
  cosecha_ventas: z.array(CosechaVentasSchema).optional(),
  parcelas_inspeccionadas: z.array(ParcelaInspeccionadaSchema).optional(),
  planificacion_siembras: z.array(PlanificacionSiembraSchema).optional(),
  comentarios_actividad_pecuaria: z
    .string()
    .max(1000, "Comentarios actividad pecuaria no pueden exceder 1000 caracteres")
    .nullish(),
  comentarios_evaluacion: z
    .string()
    .max(2000, "Comentarios no pueden exceder 2000 caracteres")
    .nullish(),
});

export type UpdateFichaInput = z.infer<typeof UpdateFichaSchema>;

// Schema para actualizar ficha completa (todas las secciones)
// Similar a CreateFichaCompletaSchema pero sin codigo_productor ni gestion
export const UpdateFichaCompletaSchema = z.object({
  ficha: z.object({
    fecha_inspeccion: z.string().datetime(),
    inspector_interno: z
      .string()
      .min(3, "Inspector debe tener al menos 3 caracteres")
      .max(100, "Inspector no puede exceder 100 caracteres"),
    persona_entrevistada: z
      .string()
      .max(100, "Persona entrevistada no puede exceder 100 caracteres")
      .nullish(),
    categoria_gestion_anterior: CategoriaProductorSchema.optional(),
    comentarios_actividad_pecuaria: z
      .string()
      .max(1000, "Comentarios no pueden exceder 1000 caracteres")
      .nullish(),
  }),
  revision_documentacion: RevisionDocumentacionSchema.optional(),
  acciones_correctivas: z.array(AccionCorrectivaSchema).default([]),
  no_conformidades: z.array(NoConformidadSchema).default([]),
  evaluacion_mitigacion: EvaluacionMitigacionSchema.optional(),
  evaluacion_poscosecha: EvaluacionPoscosechaSchema.optional(),
  evaluacion_conocimiento: EvaluacionConocimientoNormasSchema.optional(),
  actividades_pecuarias: z.array(ActividadPecuariaSchema).default([]),
  detalles_cultivo: z.array(DetalleCultivoParcelaSchema).default([]),
  cosecha_ventas: z
    .array(CosechaVentasSchema)
    .refine((data) => data.length === 1, {
      message: "Debe haber exactamente 1 registro de cosecha y ventas",
    }),
  parcelas_inspeccionadas: z
    .array(ParcelaInspeccionadaSchema)
    .default([]),
  planificacion_siembras: z.array(PlanificacionSiembraSchema).default([]),
});

export type UpdateFichaCompletaInput = z.infer<
  typeof UpdateFichaCompletaSchema
>;

// Schema para parametros de URL
export const FichaParamsSchema = z.object({
  id: UUIDSchema,
});

export type FichaParams = z.infer<typeof FichaParamsSchema>;

// Schema para query params de filtrado
export const FichaQuerySchema = z.object({
  gestion: z
    .string()
    .transform((val) => parseInt(val, 10))
    .optional(),
  estado: EstadoFichaSchema.optional(),
  productor: z.string().optional(),
  comunidad: UUIDSchema.optional(),
  estado_sync: EstadoSyncSchema.optional(),
  // Filtros avanzados
  inspector_interno: z.string().optional(),
  resultado_certificacion: ResultadoCertificacionSchema.optional(),
  fecha_desde: z.string().optional(),
  fecha_hasta: z.string().optional(),
  // Paginacion
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "Page debe ser mayor a 0"),
  limit: z
    .string()
    .optional()
    .default("20")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, "Limit debe estar entre 1 y 100"),
});

export type FichaQuery = z.infer<typeof FichaQuerySchema>;

// Schema para workflow: enviar a revision
// Solo cambia el estado, no requiere campos adicionales
export const EnviarRevisionSchema = z.object({});

export type EnviarRevisionInput = z.infer<typeof EnviarRevisionSchema>;

// Schema para workflow: aprobar
export const AprobarFichaSchema = z.object({
  comentarios_evaluacion: z
    .string()
    .max(2000, "Comentarios no pueden exceder 2000 caracteres")
    .optional(),
});

export type AprobarFichaInput = z.infer<typeof AprobarFichaSchema>;

// Schema para workflow: rechazar
export const RechazarFichaSchema = z.object({
  motivo: z
    .string()
    .min(10, "Motivo debe tener al menos 10 caracteres")
    .max(500, "Motivo no puede exceder 500 caracteres"),
});

export type RechazarFichaInput = z.infer<typeof RechazarFichaSchema>;

// Schema para respuesta de ficha
export const FichaResponseSchema = z.object({
  id_ficha: UUIDSchema,
  codigo_productor: z.string(),
  nombre_productor: z.string().optional(),
  nombre_comunidad: z.string().optional(),
  gestion: z.number().int(),
  fecha_inspeccion: z.string().datetime(),
  inspector_interno: z.string(),
  persona_entrevistada: z.string().optional(),
  categoria_gestion_anterior: CategoriaProductorSchema.optional(),
  origen_captura: OrigenCapturaSchema,
  fecha_sincronizacion: z.string().datetime().optional(),
  estado_sync: EstadoSyncSchema,
  estado_ficha: EstadoFichaSchema,
  resultado_certificacion: ResultadoCertificacionSchema,
  comentarios_actividad_pecuaria: z.string().optional(),
  comentarios_evaluacion: z.string().optional(),
  created_by: UUIDSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type FichaResponse = z.infer<typeof FichaResponseSchema>;

// Schema para lista de fichas
export const FichasListResponseSchema = z.object({
  fichas: z.array(FichaResponseSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
});

export type FichasListResponse = z.infer<typeof FichasListResponseSchema>;

// Schema para errores de fichas
export const FichaErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  timestamp: z.string().datetime(),
});

export type FichaError = z.infer<typeof FichaErrorSchema>;

// Schema para respuesta de archivo
export const ArchivoFichaResponseSchema = z.object({
  id_archivo: UUIDSchema,
  id_ficha: UUIDSchema,
  tipo_archivo: TipoArchivoSchema,
  nombre_original: z.string(),
  ruta_almacenamiento: z.string(),
  tamaño_bytes: z.number(),
  mime_type: z.string().optional().nullable(),
  estado_upload: EstadoUploadSchema,
  hash_archivo: z.string().optional().nullable(),
  fecha_captura: z.string().datetime(),
  created_at: z.string().datetime(),
});

export type ArchivoFichaResponse = z.infer<typeof ArchivoFichaResponseSchema>;

// ============================================
// SCHEMAS PARA DRAFT
// ============================================

export const CreateFichaDraftSchema = z.object({
  codigo_productor: z
    .string()
    .min(5, "Codigo de productor debe tener al menos 5 caracteres")
    .max(20, "Codigo no puede exceder 20 caracteres"),
  gestion: z
    .number()
    .int()
    .min(2000, "Gestion debe ser mayor a 2000")
    .max(2100, "Gestion debe ser menor a 2100"),
  draft_data: z.any(),
  step_actual: z
    .number()
    .int()
    .min(1, "Step debe ser mayor a 0")
    .max(11, "Step no puede exceder 11")
    .default(1),
});

export type CreateFichaDraftInput = z.infer<typeof CreateFichaDraftSchema>;

export const UpdateFichaDraftSchema = z.object({
  draft_data: z.any().optional(),
  step_actual: z
    .number()
    .int()
    .min(1, "Step debe ser mayor a 0")
    .max(11, "Step no puede exceder 11")
    .optional(),
});

export type UpdateFichaDraftInput = z.infer<typeof UpdateFichaDraftSchema>;

export const FichaDraftParamsSchema = z.object({
  id: z.string().uuid("ID de draft debe ser UUID valido"),
});

export type FichaDraftParams = z.infer<typeof FichaDraftParamsSchema>;

export const GetDraftParamsSchema = z.object({
  codigoProductor: z.string().min(1, "Codigo de productor es requerido"),
  gestion: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 2000 && val <= 2100, "Gestion invalida"),
});

export type GetDraftParams = z.infer<typeof GetDraftParamsSchema>;

export const FichaDraftResponseSchema = z.object({
  id_draft: z.string().uuid(),
  codigo_productor: z.string(),
  gestion: z.number().int(),
  draft_data: z.any(),
  step_actual: z.number().int(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type FichaDraftResponse = z.infer<typeof FichaDraftResponseSchema>;
