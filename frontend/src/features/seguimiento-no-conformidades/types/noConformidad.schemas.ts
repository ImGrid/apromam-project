// Schemas de validacion Zod para No Conformidades
// Replica exactamente los schemas del backend

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

// Enum para estado de upload
export const EstadoUploadNCSchema = z.enum(["pendiente", "subido", "error"], {
  message: "Estado de upload invalido",
});

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

// Schema para actualizar seguimiento de NC (CORE - usado en formulario)
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

// Schema para validacion de archivo a subir
export const UploadArchivoNCSchema = z.object({
  tipo_archivo: TipoArchivoNCSchema,
  file: z.instanceof(File, { message: "Debe seleccionar un archivo" }),
});

export type UploadArchivoNCInput = z.infer<typeof UploadArchivoNCSchema>;

// Validacion de tamaño de archivo en cliente
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB igual que backend

// Tipos MIME permitidos
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

// Validador de archivo completo
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `El archivo no puede exceder 50MB. Tamaño actual: ${(
        file.size /
        1024 /
        1024
      ).toFixed(2)}MB`,
    };
  }

  // Validar tipo MIME
  if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido: ${file.type}. Permitidos: imágenes (JPG, PNG, WebP), PDF, Word`,
    };
  }

  return { valid: true };
};

// Labels para los tipos de archivo (para UI)
export const TIPO_ARCHIVO_LABELS: Record<
  "evidencia_correccion" | "documento_soporte" | "foto_antes" | "foto_despues",
  string
> = {
  evidencia_correccion: "Evidencia de Corrección",
  documento_soporte: "Documento de Soporte",
  foto_antes: "Foto Antes",
  foto_despues: "Foto Después",
} as const;

// Labels para estados de seguimiento (para UI)
export const ESTADO_SEGUIMIENTO_LABELS: Record<
  "pendiente" | "seguimiento" | "corregido",
  string
> = {
  pendiente: "Pendiente",
  seguimiento: "En Seguimiento",
  corregido: "Corregido",
} as const;
