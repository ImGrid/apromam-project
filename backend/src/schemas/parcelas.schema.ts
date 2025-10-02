import { z } from "zod/v4";

// Schema base para UUID
const UUIDSchema = z.string().uuid({
  message: "Formato UUID inválido",
});

// Schema para método de captura de coordenadas
const MetodoCapturaSchema = z.enum(
  ["manual", "gps", "satelital", "topografico"],
  {
    message: "Método de captura debe ser: manual, gps, satelital o topografico",
  }
);

// Schema para tipo de barrera
const TipoBarreraSchema = z.enum(["ninguna", "viva", "muerta"], {
  message: "Tipo de barrera debe ser: ninguna, viva o muerta",
});

// Schema para coordenadas GPS (nomenclatura de parcelas)
const CoordenadasParcelaSchema = z.object({
  latitud: z
    .number()
    .min(-22.896, "Latitud fuera de límites de Bolivia")
    .max(-9.68, "Latitud fuera de límites de Bolivia")
    .refine(
      (val) => {
        const decimals = val.toString().split(".")[1]?.length || 0;
        return decimals >= 6;
      },
      {
        message: "Latitud debe tener al menos 6 decimales de precisión",
      }
    ),
  longitud: z
    .number()
    .min(-69.651, "Longitud fuera de límites de Bolivia")
    .max(-57.453, "Longitud fuera de límites de Bolivia")
    .refine(
      (val) => {
        const decimals = val.toString().split(".")[1]?.length || 0;
        return decimals >= 6;
      },
      {
        message: "Longitud debe tener al menos 6 decimales de precisión",
      }
    ),
  precision_gps: z
    .number()
    .min(0, "Precisión GPS no puede ser negativa")
    .max(100, "Precisión GPS no puede exceder 100 metros")
    .optional(),
});

// Schema para crear parcela
export const CreateParcelaSchema = z.object({
  codigo_productor: z
    .string()
    .min(5, "Código de productor debe tener al menos 5 caracteres")
    .max(20, "Código de productor no puede exceder 20 caracteres"),
  numero_parcela: z
    .number()
    .int()
    .min(1, "Número de parcela debe ser mayor a 0")
    .max(100, "Número de parcela no puede exceder 100"),
  superficie_ha: z
    .number()
    .positive("Superficie debe ser mayor a 0")
    .max(10000, "Superficie no puede exceder 10,000 hectáreas"),
  coordenadas: CoordenadasParcelaSchema.optional(),
  metodo_captura: MetodoCapturaSchema.optional(),
  fecha_captura_coords: z.string().datetime().optional(),
  utiliza_riego: z.boolean().optional(),
  situacion_cumple: z.boolean().optional(),
  tipo_barrera: TipoBarreraSchema.optional(),
  descripcion_barrera: z
    .string()
    .min(3, "Descripción de barrera debe tener al menos 3 caracteres")
    .max(500, "Descripción de barrera no puede exceder 500 caracteres")
    .optional(),
});

export type CreateParcelaInput = z.infer<typeof CreateParcelaSchema>;

// Schema para actualizar parcela
export const UpdateParcelaSchema = z.object({
  superficie_ha: z
    .number()
    .positive("Superficie debe ser mayor a 0")
    .max(10000, "Superficie no puede exceder 10,000 hectáreas")
    .optional(),
  coordenadas: CoordenadasParcelaSchema.optional(),
  metodo_captura: MetodoCapturaSchema.optional(),
  fecha_captura_coords: z.string().datetime().optional(),
  utiliza_riego: z.boolean().optional(),
  situacion_cumple: z.boolean().optional(),
  tipo_barrera: TipoBarreraSchema.optional(),
  descripcion_barrera: z
    .string()
    .min(3, "Descripción de barrera debe tener al menos 3 caracteres")
    .max(500, "Descripción de barrera no puede exceder 500 caracteres")
    .optional(),
  activo: z.boolean().optional(),
});

export type UpdateParcelaInput = z.infer<typeof UpdateParcelaSchema>;

// Schema para parámetros de URL
export const ParcelaParamsSchema = z.object({
  id: UUIDSchema,
});

export type ParcelaParams = z.infer<typeof ParcelaParamsSchema>;

// Schema para parámetros de productor
export const ProductorParcelaParamsSchema = z.object({
  codigo: z.string().min(1, "Código es requerido"),
});

export type ProductorParcelaParams = z.infer<
  typeof ProductorParcelaParamsSchema
>;

// Schema para búsqueda por proximidad
export const ProximitySearchParcelaSchema = z.object({
  latitud: z.number().min(-90).max(90),
  longitud: z.number().min(-180).max(180),
  radio_metros: z.number().int().min(100).max(50000).default(1000),
});

export type ProximitySearchParcelaInput = z.infer<
  typeof ProximitySearchParcelaSchema
>;

// Schema para respuesta de parcela
export const ParcelaResponseSchema = z.object({
  id_parcela: UUIDSchema,
  codigo_productor: z.string(),
  nombre_productor: z.string().optional(),
  numero_parcela: z.number().int(),
  superficie_ha: z.number(),
  coordenadas: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  precision_gps: z.number().optional(),
  metodo_captura: MetodoCapturaSchema,
  fecha_captura_coords: z.string().datetime().optional(),
  utiliza_riego: z.boolean(),
  situacion_cumple: z.boolean(),
  tipo_barrera: TipoBarreraSchema,
  descripcion_barrera: z.string().optional(),
  activo: z.boolean(),
  created_at: z.string().datetime(),
});

export type ParcelaResponse = z.infer<typeof ParcelaResponseSchema>;

// Schema para lista de parcelas
export const ParcelasListResponseSchema = z.object({
  parcelas: z.array(ParcelaResponseSchema),
  total: z.number().int(),
  superficie_total: z.number().optional(),
});

export type ParcelasListResponse = z.infer<typeof ParcelasListResponseSchema>;

// Schema para estadísticas de parcelas
export const ParcelasEstadisticasSchema = z.object({
  total: z.number().int(),
  con_coordenadas: z.number().int(),
  sin_coordenadas: z.number().int(),
  superficie_total: z.number(),
  con_riego: z.number().int(),
});

export type ParcelasEstadisticas = z.infer<typeof ParcelasEstadisticasSchema>;

// Schema para errores de parcelas
export const ParcelaErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  timestamp: z.string().datetime(),
});

export type ParcelaError = z.infer<typeof ParcelaErrorSchema>;
