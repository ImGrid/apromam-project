import { z } from "zod/v4";

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

export const CategoriaProductorSchema = z.enum(["E", "2T", "1T", "0T"], {
  message: "Categoria debe ser: E, 2T, 1T o 0T",
});

export const ProcedenciaSemillaSchema = z.enum(
  ["asociacion", "propia", "otro_productor", "no_sembro"],
  {
    message: "Procedencia de semilla invalida",
  }
);

export const CategoriaSemillaSchema = z.enum(
  ["organica", "transicion", "convencional"],
  {
    message: "Categoria de semilla invalida",
  }
);

export const TipoGanadoSchema = z.enum(["mayor", "menor", "aves"], {
  message: "Tipo de ganado debe ser: mayor, menor o aves",
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
    .optional(),
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
    .optional(),
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
    .optional(),
  fecha_limite_implementacion: z.string().datetime().optional(),
  estado_conformidad: z.string().default("pendiente"),
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
    .optional(),
  mitigacion_contaminacion_descripcion: z
    .string()
    .max(1000, "Descripcion no puede exceder 1000 caracteres")
    .optional(),
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
    .optional(),
  cantidad: z
    .number()
    .int()
    .min(0, "Cantidad no puede ser negativa")
    .max(10000, "Cantidad no puede exceder 10000"),
  sistema_manejo: z
    .string()
    .max(200, "Sistema de manejo no puede exceder 200 caracteres")
    .optional(),
  uso_guano: z
    .string()
    .max(500, "Uso de guano no puede exceder 500 caracteres")
    .optional(),
});

export type ActividadPecuariaInput = z.infer<typeof ActividadPecuariaSchema>;

// Seccion 4/7: Detalle cultivo por parcela
export const DetalleCultivoParcelaSchema = z.object({
  id_parcela: UUIDSchema,
  id_tipo_cultivo: UUIDSchema,
  superficie_ha: z
    .number()
    .positive("Superficie debe ser mayor a 0")
    .max(10000, "Superficie no puede exceder 10,000 hectareas"),
  procedencia_semilla: ProcedenciaSemillaSchema,
  categoria_semilla: CategoriaSemillaSchema,
  tratamiento_semillas: z
    .string()
    .max(200, "Tratamiento no puede exceder 200 caracteres")
    .optional(),
  tipo_abonamiento: z
    .string()
    .max(200, "Tipo de abonamiento no puede exceder 200 caracteres")
    .optional(),
  metodo_aporque: z
    .string()
    .max(200, "Metodo de aporque no puede exceder 200 caracteres")
    .optional(),
  control_hierbas: z
    .string()
    .max(200, "Control de hierbas no puede exceder 200 caracteres")
    .optional(),
  metodo_cosecha: z
    .string()
    .max(200, "Metodo de cosecha no puede exceder 200 caracteres")
    .optional(),
  rotacion: z.boolean().default(false),
  insumos_organicos_usados: z
    .string()
    .max(500, "Insumos no pueden exceder 500 caracteres")
    .optional(),
});

export type DetalleCultivoParcelaInput = z.infer<
  typeof DetalleCultivoParcelaSchema
>;

// Seccion 8: Cosecha y ventas
export const CosechaVentasSchema = z
  .object({
    id_tipo_cultivo: UUIDSchema,
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
      .optional(),
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
  fecha_inspeccion: z.string().datetime(),
  inspector_interno: z
    .string()
    .min(3, "Inspector debe tener al menos 3 caracteres")
    .max(100, "Inspector no puede exceder 100 caracteres"),
  persona_entrevistada: z
    .string()
    .max(100, "Persona entrevistada no puede exceder 100 caracteres")
    .optional(),
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

  // Contenido final (opcional)
  recomendaciones: z
    .string()
    .max(2000, "Recomendaciones no pueden exceder 2000 caracteres")
    .optional(),
  comentarios_evaluacion: z
    .string()
    .max(2000, "Comentarios no pueden exceder 2000 caracteres")
    .optional(),
  firma_productor: z
    .string()
    .max(100, "Firma no puede exceder 100 caracteres")
    .optional(),
  firma_inspector: z
    .string()
    .max(100, "Firma no puede exceder 100 caracteres")
    .optional(),
  descripcion_uso_guano_general: z
    .string()
    .max(1000, "Descripcion uso guano general no puede exceder 1000 caracteres")
    .optional(),
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
    .optional(),
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
  recomendaciones: z
    .string()
    .max(2000, "Recomendaciones no pueden exceder 2000 caracteres")
    .optional(),
  comentarios_evaluacion: z
    .string()
    .max(2000, "Comentarios no pueden exceder 2000 caracteres")
    .optional(),
  firma_productor: z
    .string()
    .max(100, "Firma no puede exceder 100 caracteres")
    .optional(),
  firma_inspector: z
    .string()
    .max(100, "Firma no puede exceder 100 caracteres")
    .optional(),
  descripcion_uso_guano_general: z
    .string()
    .max(1000, "Descripcion uso guano general no puede exceder 1000 caracteres")
    .optional(),
});

export type UpdateFichaInput = z.infer<typeof UpdateFichaSchema>;

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
});

export type FichaQuery = z.infer<typeof FichaQuerySchema>;

// Schema para workflow: enviar a revision
export const EnviarRevisionSchema = z.object({
  recomendaciones: z
    .string()
    .min(10, "Recomendaciones deben tener al menos 10 caracteres")
    .max(2000, "Recomendaciones no pueden exceder 2000 caracteres"),
  firma_inspector: z
    .string()
    .min(3, "Firma de inspector es requerida")
    .max(100, "Firma no puede exceder 100 caracteres"),
});

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
  estado_ficha: EstadoFichaSchema,
  resultado_certificacion: ResultadoCertificacionSchema,
  origen_captura: OrigenCapturaSchema,
  estado_sync: EstadoSyncSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type FichaResponse = z.infer<typeof FichaResponseSchema>;

// Schema para lista de fichas
export const FichasListResponseSchema = z.object({
  fichas: z.array(FichaResponseSchema),
  total: z.number().int(),
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
