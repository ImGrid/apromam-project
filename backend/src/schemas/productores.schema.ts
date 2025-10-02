import { z } from "zod/v4";

// Schema base para UUID
const UUIDSchema = z.string().uuid({
  message: "Formato UUID invalido",
});

// Schema para categoria de productor
const CategoriaProductorSchema = z.enum(["E", "2T", "1T", "0T"], {
  error: "Categoria debe ser: E, 2T, 1T o 0T",
});

// Schema para coordenadas GPS
const CoordenadasSchema = z.object({
  latitud: z
    .number()
    .min(-22.896, "Latitud fuera de limites de Bolivia")
    .max(-9.68, "Latitud fuera de limites de Bolivia")
    .refine(
      (val) => {
        const decimals = val.toString().split(".")[1]?.length || 0;
        return decimals >= 6;
      },
      {
        message: "Latitud debe tener al menos 6 decimales de precision",
      }
    ),
  longitud: z
    .number()
    .min(-69.651, "Longitud fuera de limites de Bolivia")
    .max(-57.453, "Longitud fuera de limites de Bolivia")
    .refine(
      (val) => {
        const decimals = val.toString().split(".")[1]?.length || 0;
        return decimals >= 6;
      },
      {
        message: "Longitud debe tener al menos 6 decimales de precision",
      }
    ),
  altitud: z.number().optional(),
});

// Schema para crear productor
// Tecnico solo puede crear en su comunidad
export const CreateProductorSchema = z.object({
  nombre_productor: z
    .string()
    .min(3, "Nombre debe tener al menos 3 caracteres")
    .max(200, "Nombre no puede exceder 200 caracteres")
    .trim(),
  ci_documento: z
    .string()
    .min(6, "CI debe tener al menos 6 caracteres")
    .max(20, "CI no puede exceder 20 caracteres")
    .regex(
      /^[0-9A-Za-z-]+$/,
      "CI solo puede contener numeros, letras y guiones"
    )
    .trim()
    .optional(),
  id_comunidad: UUIDSchema,
  año_ingreso_programa: z
    .number()
    .int()
    .min(2000, "Año de ingreso debe ser mayor a 2000")
    .max(new Date().getFullYear() + 1, "Año de ingreso no puede ser futuro"),
  categoria_actual: CategoriaProductorSchema.optional(),
  superficie_total_has: z
    .number()
    .min(0, "Superficie no puede ser negativa")
    .max(10000, "Superficie no puede exceder 10,000 hectareas")
    .optional(),
  numero_parcelas_total: z
    .number()
    .int()
    .min(0, "Numero de parcelas no puede ser negativo")
    .max(100, "Numero de parcelas no puede exceder 100")
    .optional(),
  coordenadas: CoordenadasSchema.optional(),
  inicio_conversion_organica: z.string().datetime().optional(),
});

export type CreateProductorInput = z.infer<typeof CreateProductorSchema>;

// Schema para actualizar productor
// Tecnico solo puede actualizar en su comunidad
export const UpdateProductorSchema = z.object({
  nombre_productor: z
    .string()
    .min(3, "Nombre debe tener al menos 3 caracteres")
    .max(200, "Nombre no puede exceder 200 caracteres")
    .trim()
    .optional(),
  ci_documento: z
    .string()
    .min(6, "CI debe tener al menos 6 caracteres")
    .max(20, "CI no puede exceder 20 caracteres")
    .regex(
      /^[0-9A-Za-z-]+$/,
      "CI solo puede contener numeros, letras y guiones"
    )
    .trim()
    .optional(),
  categoria_actual: CategoriaProductorSchema.optional(),
  superficie_total_has: z
    .number()
    .min(0, "Superficie no puede ser negativa")
    .max(10000, "Superficie no puede exceder 10,000 hectareas")
    .optional(),
  numero_parcelas_total: z
    .number()
    .int()
    .min(0, "Numero de parcelas no puede ser negativo")
    .max(100, "Numero de parcelas no puede exceder 100")
    .optional(),
  coordenadas: CoordenadasSchema.optional(),
  inicio_conversion_organica: z.string().datetime().optional(),
  activo: z.boolean().optional(),
});

export type UpdateProductorInput = z.infer<typeof UpdateProductorSchema>;

// Schema para parametros de URL
export const ProductorParamsSchema = z.object({
  codigo: z.string().min(1, "Codigo es requerido"),
});

export type ProductorParams = z.infer<typeof ProductorParamsSchema>;

// Schema para query params de filtrado
export const ProductorQuerySchema = z.object({
  comunidad: UUIDSchema.optional(),
  categoria: CategoriaProductorSchema.optional(),
  con_coordenadas: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  activo: z
    .string()
    .transform((val) => val === "true")
    .optional(),
});

export type ProductorQuery = z.infer<typeof ProductorQuerySchema>;

// Schema para busqueda por proximidad
export const ProximitySearchSchema = z.object({
  latitud: z.number().min(-90).max(90),
  longitud: z.number().min(-180).max(180),
  radio_metros: z.number().int().min(100).max(50000).default(1000),
});

export type ProximitySearchInput = z.infer<typeof ProximitySearchSchema>;

// Schema para respuesta de productor
export const ProductorResponseSchema = z.object({
  codigo_productor: z.string(),
  nombre_productor: z.string(),
  ci_documento: z.string().optional(),
  nombre_comunidad: z.string().optional(),
  nombre_municipio: z.string().optional(),
  nombre_provincia: z.string().optional(),
  categoria_actual: CategoriaProductorSchema,
  superficie_total_has: z.number(),
  numero_parcelas_total: z.number().int(),
  año_ingreso_programa: z.number().int(),
  inicio_conversion_organica: z.string().datetime().optional(),
  coordenadas: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      altitude: z.number().optional(),
    })
    .optional(),
  activo: z.boolean(),
  created_at: z.string().datetime(),
});

export type ProductorResponse = z.infer<typeof ProductorResponseSchema>;

// Schema para lista de productores
export const ProductoresListResponseSchema = z.object({
  productores: z.array(ProductorResponseSchema),
  total: z.number().int(),
});

export type ProductoresListResponse = z.infer<
  typeof ProductoresListResponseSchema
>;

// Schema para errores de productores
export const ProductorErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  timestamp: z.string().datetime(),
});

export type ProductorError = z.infer<typeof ProductorErrorSchema>;
