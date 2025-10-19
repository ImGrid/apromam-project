import { z } from "zod";

// Schema base para UUID
const UUIDSchema = z.string().uuid({
  message: "Formato UUID invalido",
});

// SCHEMAS DEPARTAMENTOS

// Schema para crear departamento
// Solo admin y gerente pueden crear
export const CreateDepartamentoSchema = z.object({
  nombre_departamento: z
    .string()
    .min(3, "Nombre debe tener al menos 3 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres")
    .trim()
    .refine(
      (val) => !/[<>{}[\]]/.test(val),
      "Nombre contiene caracteres no permitidos"
    ),
});

export type CreateDepartamentoInput = z.infer<typeof CreateDepartamentoSchema>;

// Schema para actualizar departamento
export const UpdateDepartamentoSchema = z.object({
  nombre_departamento: z
    .string()
    .min(3, "Nombre debe tener al menos 3 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres")
    .trim()
    .refine(
      (val) => !/[<>{}[\]]/.test(val),
      "Nombre contiene caracteres no permitidos"
    )
    .optional(),
  activo: z.boolean().optional(),
});

export type UpdateDepartamentoInput = z.infer<typeof UpdateDepartamentoSchema>;

// Schema para respuesta departamento
export const DepartamentoResponseSchema = z.object({
  id_departamento: UUIDSchema,
  nombre_departamento: z.string(),
  activo: z.boolean(),
  created_at: z.string().datetime(),
  cantidad_provincias: z.number().int().optional(),
  cantidad_municipios: z.number().int().optional(),
  cantidad_comunidades: z.number().int().optional(),
  cantidad_productores: z.number().int().optional(),
});

export type DepartamentoResponse = z.infer<typeof DepartamentoResponseSchema>;

// SCHEMAS PROVINCIAS

// Schema para crear provincia
// Solo admin puede crear
export const CreateProvinciaSchema = z.object({
  id_departamento: UUIDSchema,
  nombre_provincia: z
    .string()
    .min(3, "Nombre debe tener al menos 3 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres")
    .trim()
    .refine(
      (val) => !/[<>{}[\]]/.test(val),
      "Nombre contiene caracteres no permitidos"
    ),
});

export type CreateProvinciaInput = z.infer<typeof CreateProvinciaSchema>;

// Schema para actualizar provincia
export const UpdateProvinciaSchema = z.object({
  nombre_provincia: z
    .string()
    .min(3, "Nombre debe tener al menos 3 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres")
    .trim()
    .refine(
      (val) => !/[<>{}[\]]/.test(val),
      "Nombre contiene caracteres no permitidos"
    )
    .optional(),
  activo: z.boolean().optional(),
});

export type UpdateProvinciaInput = z.infer<typeof UpdateProvinciaSchema>;

// Schema para respuesta provincia
export const ProvinciaResponseSchema = z.object({
  id_provincia: UUIDSchema,
  id_departamento: UUIDSchema,
  nombre_provincia: z.string(),
  nombre_departamento: z.string().optional(),
  activo: z.boolean(),
  created_at: z.string().datetime(),
  cantidad_municipios: z.number().int().optional(),
  cantidad_comunidades: z.number().int().optional(),
  cantidad_productores: z.number().int().optional(),
});

export type ProvinciaResponse = z.infer<typeof ProvinciaResponseSchema>;

// SCHEMAS MUNICIPIOS

// Schema para crear municipio
// Solo admin puede crear
export const CreateMunicipioSchema = z.object({
  id_provincia: UUIDSchema,
  nombre_municipio: z
    .string()
    .min(3, "Nombre debe tener al menos 3 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres")
    .trim()
    .refine(
      (val) => !/[<>{}[\]]/.test(val),
      "Nombre contiene caracteres no permitidos"
    ),
});

export type CreateMunicipioInput = z.infer<typeof CreateMunicipioSchema>;

// Schema para actualizar municipio
export const UpdateMunicipioSchema = z.object({
  nombre_municipio: z
    .string()
    .min(3, "Nombre debe tener al menos 3 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres")
    .trim()
    .refine(
      (val) => !/[<>{}[\]]/.test(val),
      "Nombre contiene caracteres no permitidos"
    )
    .optional(),
  activo: z.boolean().optional(),
});

export type UpdateMunicipioInput = z.infer<typeof UpdateMunicipioSchema>;

// Schema para respuesta municipio
export const MunicipioResponseSchema = z.object({
  id_municipio: UUIDSchema,
  id_provincia: UUIDSchema,
  nombre_municipio: z.string(),
  nombre_provincia: z.string().optional(),
  activo: z.boolean(),
  created_at: z.string().datetime(),
  cantidad_comunidades: z.number().int().optional(),
  cantidad_productores: z.number().int().optional(),
});

export type MunicipioResponse = z.infer<typeof MunicipioResponseSchema>;

// SCHEMAS PARAMS Y QUERY

// Schema para parametros de URL
export const GeograficaParamsSchema = z.object({
  id: UUIDSchema,
});

export type GeograficaParams = z.infer<typeof GeograficaParamsSchema>;

// Schema para query params de filtrado
export const GeograficaQuerySchema = z.object({
  departamento: UUIDSchema.optional(),
  provincia: UUIDSchema.optional(),
  activo: z
    .string()
    .transform((val) => val === "true")
    .optional(),
});

export type GeograficaQuery = z.infer<typeof GeograficaQuerySchema>;

// SCHEMAS DE RESPONSE LISTAS

// Schema para lista de departamentos
export const DepartamentosListResponseSchema = z.object({
  departamentos: z.array(DepartamentoResponseSchema),
  total: z.number().int(),
});

export type DepartamentosListResponse = z.infer<
  typeof DepartamentosListResponseSchema
>;

// Schema para lista de provincias
export const ProvinciasListResponseSchema = z.object({
  provincias: z.array(ProvinciaResponseSchema),
  total: z.number().int(),
});

export type ProvinciasListResponse = z.infer<
  typeof ProvinciasListResponseSchema
>;

// Schema para lista de municipios
export const MunicipiosListResponseSchema = z.object({
  municipios: z.array(MunicipioResponseSchema),
  total: z.number().int(),
});

export type MunicipiosListResponse = z.infer<
  typeof MunicipiosListResponseSchema
>;

// SCHEMAS DE ERROR

// Schema para errores geograficos
export const GeograficaErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  timestamp: z.string().datetime(),
});

export type GeograficaError = z.infer<typeof GeograficaErrorSchema>;
