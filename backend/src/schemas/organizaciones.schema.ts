import { z } from "zod";

// Schema base para UUID
const UUIDSchema = z.string().uuid({
  message: "Formato UUID invalido",
});

// SCHEMAS ORGANIZACIONES

// Schema para crear organizacion
// Solo admin y gerente pueden crear
export const CreateOrganizacionSchema = z.object({
  nombre_organizacion: z
    .string()
    .min(3, "Nombre debe tener al menos 3 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres")
    .trim()
    .refine(
      (val) => !/[<>{}[\]]/.test(val),
      "Nombre contiene caracteres no permitidos"
    ),
  abreviatura_organizacion: z
    .string()
    .min(2, "Abreviatura debe tener al menos 2 caracteres")
    .max(5, "Abreviatura no puede exceder 5 caracteres")
    .trim()
    .toUpperCase()
    .refine(
      (val) => /^[A-Z]+$/.test(val),
      "Abreviatura debe contener solo letras mayúsculas sin espacios"
    ),
});

export type CreateOrganizacionInput = z.infer<
  typeof CreateOrganizacionSchema
>;

// Schema para actualizar organizacion
export const UpdateOrganizacionSchema = z.object({
  nombre_organizacion: z
    .string()
    .min(3, "Nombre debe tener al menos 3 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres")
    .trim()
    .refine(
      (val) => !/[<>{}[\]]/.test(val),
      "Nombre contiene caracteres no permitidos"
    )
    .optional(),
  abreviatura_organizacion: z
    .string()
    .min(2, "Abreviatura debe tener al menos 2 caracteres")
    .max(5, "Abreviatura no puede exceder 5 caracteres")
    .trim()
    .toUpperCase()
    .refine(
      (val) => /^[A-Z]+$/.test(val),
      "Abreviatura debe contener solo letras mayúsculas sin espacios"
    )
    .optional(),
  activo: z.boolean().optional(),
});

export type UpdateOrganizacionInput = z.infer<
  typeof UpdateOrganizacionSchema
>;

// Schema para respuesta organizacion
export const OrganizacionResponseSchema = z.object({
  id_organizacion: UUIDSchema,
  nombre_organizacion: z.string(),
  abreviatura_organizacion: z.string(),
  activo: z.boolean(),
  created_at: z.string().datetime(),
  cantidad_productores: z.number().int().optional(),
});

export type OrganizacionResponse = z.infer<typeof OrganizacionResponseSchema>;

// SCHEMAS PARAMS Y QUERY

// Schema para parametros de URL
export const OrganizacionParamsSchema = z.object({
  id: UUIDSchema,
});

export type OrganizacionParams = z.infer<typeof OrganizacionParamsSchema>;

// Schema para query params de filtrado
export const OrganizacionQuerySchema = z.object({
  activo: z
    .string()
    .transform((val) => val === "true")
    .optional(),
});

export type OrganizacionQuery = z.infer<typeof OrganizacionQuerySchema>;

// SCHEMAS DE RESPONSE LISTAS

// Schema para lista de organizaciones
export const OrganizacionesListResponseSchema = z.object({
  organizaciones: z.array(OrganizacionResponseSchema),
  total: z.number().int(),
});

export type OrganizacionesListResponse = z.infer<
  typeof OrganizacionesListResponseSchema
>;

// SCHEMAS DE ERROR

// Schema para errores de organizaciones
export const OrganizacionErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  timestamp: z.string().datetime(),
});

export type OrganizacionError = z.infer<typeof OrganizacionErrorSchema>;
