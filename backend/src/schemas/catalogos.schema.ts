import { z } from "zod/v4";

/**
 * Schema base para UUID
 */
const UUIDSchema = z.string().uuid({
  message: "Formato UUID inválido",
});

// ==========================================
// SCHEMAS TIPOS CULTIVO
// ==========================================

/**
 * Schema para crear tipo cultivo
 * Solo admin puede crear
 */
export const CreateTipoCultivoSchema = z.object({
  nombre_tipo_cultivo: z
    .string()
    .min(2, "Nombre debe tener al menos 2 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres")
    .trim(),
  rendimiento_promedio_qq_ha: z
    .number()
    .positive("Rendimiento debe ser positivo")
    .optional(),
});

export type CreateTipoCultivoInput = z.infer<typeof CreateTipoCultivoSchema>;

/**
 * Schema para actualizar tipo cultivo
 */
export const UpdateTipoCultivoSchema = z.object({
  nombre_tipo_cultivo: z
    .string()
    .min(2, "Nombre debe tener al menos 2 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres")
    .trim()
    .optional(),
  rendimiento_promedio_qq_ha: z
    .number()
    .positive("Rendimiento debe ser positivo")
    .optional(),
  activo: z.boolean().optional(),
});

export type UpdateTipoCultivoInput = z.infer<typeof UpdateTipoCultivoSchema>;

/**
 * Schema para respuesta tipo cultivo
 */
export const TipoCultivoResponseSchema = z.object({
  id_tipo_cultivo: UUIDSchema,
  nombre_tipo_cultivo: z.string(),
  rendimiento_promedio_qq_ha: z.number().optional(),
  activo: z.boolean(),
  created_at: z.string().datetime(),
});

export type TipoCultivoResponse = z.infer<typeof TipoCultivoResponseSchema>;

// ==========================================
// SCHEMAS GESTIONES
// ==========================================

/**
 * Schema para crear gestión
 * Solo admin puede crear
 */
export const CreateGestionSchema = z.object({
  anio_gestion: z
    .number()
    .int()
    .min(2000, "Año debe ser mayor a 2000")
    .max(2100, "Año debe ser menor a 2100"),
  nombre_gestion: z
    .string()
    .min(4, "Nombre debe tener al menos 4 caracteres")
    .max(50, "Nombre no puede exceder 50 caracteres")
    .trim()
    .optional(),
});

export type CreateGestionInput = z.infer<typeof CreateGestionSchema>;

/**
 * Schema para actualizar gestión
 */
export const UpdateGestionSchema = z.object({
  nombre_gestion: z
    .string()
    .min(4, "Nombre debe tener al menos 4 caracteres")
    .max(50, "Nombre no puede exceder 50 caracteres")
    .trim()
    .optional(),
  activo: z.boolean().optional(),
});

export type UpdateGestionInput = z.infer<typeof UpdateGestionSchema>;

/**
 * Schema para respuesta gestión
 */
export const GestionResponseSchema = z.object({
  id_gestion: UUIDSchema,
  anio_gestion: z.number().int(),
  nombre_gestion: z.string().optional(),
  activo: z.boolean(),
  created_at: z.string().datetime(),
});

export type GestionResponse = z.infer<typeof GestionResponseSchema>;

// ==========================================
// SCHEMAS PARAMS Y QUERY
// ==========================================

/**
 * Schema para parámetros de URL
 */
export const CatalogoParamsSchema = z.object({
  id: UUIDSchema,
});

export type CatalogoParams = z.infer<typeof CatalogoParamsSchema>;

/**
 * Schema para query params de filtrado
 */
export const CatalogoQuerySchema = z.object({
  activo: z
    .string()
    .transform((val) => val === "true")
    .optional(),
});

export type CatalogoQuery = z.infer<typeof CatalogoQuerySchema>;

// ==========================================
// SCHEMAS DE RESPONSE LISTAS
// ==========================================

/**
 * Schema para lista de tipos cultivo
 */
export const TiposCultivoListResponseSchema = z.object({
  tipos_cultivo: z.array(TipoCultivoResponseSchema),
  total: z.number().int(),
});

export type TiposCultivoListResponse = z.infer<
  typeof TiposCultivoListResponseSchema
>;

/**
 * Schema para lista de gestiones
 */
export const GestionesListResponseSchema = z.object({
  gestiones: z.array(GestionResponseSchema),
  total: z.number().int(),
});

export type GestionesListResponse = z.infer<typeof GestionesListResponseSchema>;

// ==========================================
// SCHEMAS DE ERROR
// ==========================================

/**
 * Schema para errores de catálogos
 */
export const CatalogoErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  timestamp: z.string().datetime(),
});

export type CatalogoError = z.infer<typeof CatalogoErrorSchema>;
