import { z } from "zod/v4";

/**
 * Schema base para UUID
 */
const UUIDSchema = z.string().uuid({
  message: "Formato UUID inválido",
});

// ==========================================
// SCHEMAS DE REQUEST - COMUNIDADES
// ==========================================

/**
 * Schema para crear comunidad
 * Solo admin puede crear
 */
export const CreateComunidadSchema = z.object({
  id_municipio: UUIDSchema,
  nombre_comunidad: z
    .string()
    .min(3, "Nombre debe tener al menos 3 caracteres")
    .max(200, "Nombre no puede exceder 200 caracteres")
    .trim(),
});

export type CreateComunidadInput = z.infer<typeof CreateComunidadSchema>;

/**
 * Schema para actualizar comunidad
 * Solo admin puede actualizar
 */
export const UpdateComunidadSchema = z.object({
  nombre_comunidad: z
    .string()
    .min(3, "Nombre debe tener al menos 3 caracteres")
    .max(200, "Nombre no puede exceder 200 caracteres")
    .trim()
    .optional(),
  activo: z.boolean().optional(),
});

export type UpdateComunidadInput = z.infer<typeof UpdateComunidadSchema>;

/**
 * Schema para parámetros de URL
 */
export const ComunidadParamsSchema = z.object({
  id: UUIDSchema,
});

export type ComunidadParams = z.infer<typeof ComunidadParamsSchema>;

/**
 * Schema para query params de filtrado
 */
export const ComunidadQuerySchema = z.object({
  municipio: UUIDSchema.optional(),
  provincia: UUIDSchema.optional(),
  sin_tecnicos: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  activo: z
    .string()
    .transform((val) => val === "true")
    .optional(),
});

export type ComunidadQuery = z.infer<typeof ComunidadQuerySchema>;

// ==========================================
// SCHEMAS DE RESPONSE - COMUNIDADES
// ==========================================

/**
 * Schema para respuesta de comunidad completa
 */
export const ComunidadResponseSchema = z.object({
  id_comunidad: UUIDSchema,
  id_municipio: UUIDSchema,
  nombre_comunidad: z.string(),
  nombre_municipio: z.string().optional(),
  nombre_provincia: z.string().optional(),
  cantidad_tecnicos: z.number().int().optional(),
  cantidad_productores: z.number().int().optional(),
  activo: z.boolean(),
  created_at: z.string().datetime(),
});

export type ComunidadResponse = z.infer<typeof ComunidadResponseSchema>;

/**
 * Schema para lista de comunidades
 */
export const ComunidadesListResponseSchema = z.object({
  comunidades: z.array(ComunidadResponseSchema),
  total: z.number().int(),
});

export type ComunidadesListResponse = z.infer<
  typeof ComunidadesListResponseSchema
>;

/**
 * Schema para respuesta de comunidad creada
 */
export const ComunidadCreatedResponseSchema = z.object({
  comunidad: ComunidadResponseSchema,
  message: z.string(),
});

export type ComunidadCreatedResponse = z.infer<
  typeof ComunidadCreatedResponseSchema
>;

// ==========================================
// SCHEMAS DE ERROR
// ==========================================

/**
 * Schema para errores de comunidades
 */
export const ComunidadErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  timestamp: z.string().datetime(),
});

export type ComunidadError = z.infer<typeof ComunidadErrorSchema>;
