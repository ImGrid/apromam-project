import { z } from "zod";

// Schema base para UUID
const UUIDSchema = z.string().uuid({
  message: "Formato UUID invalido",
});

// Enum para estado de seguimiento
export const EstadoSeguimientoNCSchema = z.enum(
  ["pendiente", "seguimiento", "corregido"],
  {
    message: "Estado de seguimiento debe ser: pendiente, seguimiento o corregido",
  }
);

// Enum para tipos de archivo de NC
export const TipoArchivoNCSchema = z.enum(
  ["evidencia_correccion", "documento_soporte", "foto_antes", "foto_despues"],
  {
    message: "Tipo de archivo invalido",
  }
);

export const EstadoUploadNCSchema = z.enum(["pendiente", "subido", "error"], {
  message: "Estado de upload invalido",
});

// Schema para parametros de URL
export const NoConformidadParamsSchema = z.object({
  id: UUIDSchema,
});

export type NoConformidadParams = z.infer<typeof NoConformidadParamsSchema>;

export const FichaNCParamsSchema = z.object({
  id_ficha: UUIDSchema,
});

export type FichaNCParams = z.infer<typeof FichaNCParamsSchema>;

export const ArchivoNCParamsSchema = z.object({
  id: UUIDSchema,
  id_archivo: UUIDSchema,
});

export type ArchivoNCParams = z.infer<typeof ArchivoNCParamsSchema>;

// Schema para actualizar datos basicos de NC
export const UpdateNoConformidadSchema = z.object({
  descripcion_no_conformidad: z
    .string()
    .min(5, "Descripcion debe tener al menos 5 caracteres")
    .max(500, "Descripcion no puede exceder 500 caracteres")
    .optional(),
  accion_correctiva_propuesta: z
    .string()
    .max(500, "Accion correctiva no puede exceder 500 caracteres")
    .optional(),
  fecha_limite_implementacion: z.string().datetime().optional(),
});

export type UpdateNoConformidadInput = z.infer<
  typeof UpdateNoConformidadSchema
>;

// Schema para actualizar seguimiento de NC
export const UpdateSeguimientoNCSchema = z.object({
  estado_seguimiento: EstadoSeguimientoNCSchema,
  comentario_seguimiento: z
    .string()
    .max(1000, "Comentario no puede exceder 1000 caracteres")
    .optional(),
});

export type UpdateSeguimientoNCInput = z.infer<
  typeof UpdateSeguimientoNCSchema
>;

// Schema para query params de estadisticas
export const EstadisticasNCQuerySchema = z.object({
  gestion: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 2000 && val <= 2100, "Gestion invalida")
    .optional(),
  id_comunidad: UUIDSchema.optional(),
});

export type EstadisticasNCQuery = z.infer<typeof EstadisticasNCQuerySchema>;

// Schema para query params de filtrado de NC por ficha
export const NCFichaQuerySchema = z.object({
  estado_seguimiento: EstadoSeguimientoNCSchema.optional(),
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

export type NCFichaQuery = z.infer<typeof NCFichaQuerySchema>;

// Schema para query params de listado general de NC (GET /api/no-conformidades)
export const NCListQuerySchema = z.object({
  estado_seguimiento: EstadoSeguimientoNCSchema.optional(),
  id_comunidad: UUIDSchema.optional(),
  gestion: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => !val || (val >= 2000 && val <= 2100), "Gestion invalida"),
  codigo_productor: z.string().optional(),
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

export type NCListQuery = z.infer<typeof NCListQuerySchema>;

// Schema para subir archivo a NC
export const UploadArchivoNCSchema = z.object({
  tipo_archivo: TipoArchivoNCSchema,
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

export type UploadArchivoNCInput = z.infer<typeof UploadArchivoNCSchema>;

// Schema para respuesta de no conformidad
export const NoConformidadResponseSchema = z.object({
  id_no_conformidad: UUIDSchema,
  id_ficha: UUIDSchema,
  descripcion_no_conformidad: z.string(),
  accion_correctiva_propuesta: z.string().nullable().optional(),
  fecha_limite_implementacion: z.string().datetime().nullable().optional(),
  estado_seguimiento: EstadoSeguimientoNCSchema,
  comentario_seguimiento: z.string().nullable().optional(),
  fecha_seguimiento: z.string().datetime().nullable().optional(),
  realizado_por_usuario: UUIDSchema.nullable().optional(),
  updated_at: z.string().datetime(),
  created_at: z.string().datetime(),
});

export type NoConformidadResponse = z.infer<typeof NoConformidadResponseSchema>;

// Schema para respuesta enriquecida de NC (con datos de ficha/productor)
export const NoConformidadEnriquecidaResponseSchema =
  NoConformidadResponseSchema.extend({
    codigo_productor: z.string().nullable().optional(),
    nombre_productor: z.string().nullable().optional(),
    nombre_comunidad: z.string().nullable().optional(),
    gestion: z.number().int().nullable().optional(),
    nombre_usuario_seguimiento: z.string().nullable().optional(),
  });

export type NoConformidadEnriquecidaResponse = z.infer<
  typeof NoConformidadEnriquecidaResponseSchema
>;

// Schema para lista de NC
export const NoConformidadesListResponseSchema = z.object({
  no_conformidades: z.array(NoConformidadEnriquecidaResponseSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
});

export type NoConformidadesListResponse = z.infer<
  typeof NoConformidadesListResponseSchema
>;

// Schema para estadisticas de NC
export const EstadisticasNCResponseSchema = z.object({
  total: z.number().int(),
  por_estado: z.object({
    pendiente: z.number().int(),
    seguimiento: z.number().int(),
    corregido: z.number().int(),
  }),
  vencidas: z.number().int(),
  proximas_vencer: z.number().int(),
});

export type EstadisticasNCResponse = z.infer<
  typeof EstadisticasNCResponseSchema
>;

// Schema para respuesta de archivo NC
export const ArchivoNCResponseSchema = z.object({
  id_archivo: UUIDSchema,
  id_no_conformidad: UUIDSchema,
  tipo_archivo: TipoArchivoNCSchema,
  nombre_original: z.string(),
  ruta_almacenamiento: z.string(),
  tamaño_bytes: z.number(),
  mime_type: z.string().nullable().optional(),
  estado_upload: EstadoUploadNCSchema,
  hash_archivo: z.string().nullable().optional(),
  fecha_captura: z.string().datetime(),
  subido_por: UUIDSchema.nullable().optional(),
  created_at: z.string().datetime(),
});

export type ArchivoNCResponse = z.infer<typeof ArchivoNCResponseSchema>;

// Schema para lista de archivos NC
export const ArchivosNCListResponseSchema = z.object({
  archivos: z.array(ArchivoNCResponseSchema),
  total: z.number().int(),
});

export type ArchivosNCListResponse = z.infer<
  typeof ArchivosNCListResponseSchema
>;

// Schema para errores
export const NCErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  timestamp: z.string().datetime(),
});

export type NCError = z.infer<typeof NCErrorSchema>;
