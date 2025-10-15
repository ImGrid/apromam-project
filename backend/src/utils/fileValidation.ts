import { fileTypeFromBuffer } from "file-type";
import { TipoArchivo } from "../entities/ArchivoFicha.js";
import logger from "./logger.js";

/**
 * Configuración de tipos de archivo permitidos
 * Define MIME types permitidos, extensiones y tamaños máximos
 */
export const ALLOWED_FILE_CONFIG = {
  croquis: {
    mimeTypes: ["image/jpeg", "image/png"],
    extensions: [".jpg", ".jpeg", ".png"],
    maxSize: 5 * 1024 * 1024, // 5MB
    description: "Imágenes de croquis (JPEG, PNG)",
  },
  foto_parcela: {
    mimeTypes: ["image/jpeg", "image/png"],
    extensions: [".jpg", ".jpeg", ".png"],
    maxSize: 5 * 1024 * 1024, // 5MB
    description: "Fotos de parcelas (JPEG, PNG)",
  },
  documento_pdf: {
    mimeTypes: ["application/pdf"],
    extensions: [".pdf"],
    maxSize: 10 * 1024 * 1024, // 10MB
    description: "Documentos PDF",
  },
} as const;

export interface FileValidationError {
  field: string;
  message: string;
  code: string;
}

export interface FileValidationResult {
  valid: boolean;
  errors: FileValidationError[];
  detectedMimeType?: string;
  detectedExtension?: string;
}

/**
 * Valida el tipo de archivo usando magic numbers
 * Esta es la forma segura de validar archivos, no confía en el MIME type del cliente
 */
export async function validateFileType(
  buffer: Buffer,
  expectedTipoArchivo: TipoArchivo
): Promise<FileValidationResult> {
  const errors: FileValidationError[] = [];

  try {
    // Detectar tipo real del archivo usando magic numbers
    const fileTypeResult = await fileTypeFromBuffer(buffer);

    if (!fileTypeResult) {
      errors.push({
        field: "file",
        message: "No se pudo determinar el tipo de archivo. El archivo puede estar corrupto o ser de un tipo no soportado.",
        code: "UNKNOWN_FILE_TYPE",
      });
      return { valid: false, errors };
    }

    const { mime, ext } = fileTypeResult;
    const config = ALLOWED_FILE_CONFIG[expectedTipoArchivo];

    // Validar que el MIME type detectado esté permitido
    if (!(config.mimeTypes as readonly string[]).includes(mime)) {
      errors.push({
        field: "file",
        message: `Tipo de archivo no permitido. Detectado: ${mime}. Se esperaba: ${config.mimeTypes.join(", ")}`,
        code: "INVALID_MIME_TYPE",
      });
    }

    // Validar que la extensión detectada esté permitida
    const detectedExtension = `.${ext}`;
    if (!(config.extensions as readonly string[]).includes(detectedExtension)) {
      errors.push({
        field: "file",
        message: `Extensión de archivo no permitida. Detectada: ${detectedExtension}. Se esperaba: ${config.extensions.join(", ")}`,
        code: "INVALID_EXTENSION",
      });
    }

    logger.debug({
      expectedTipoArchivo,
      detectedMime: mime,
      detectedExtension,
      valid: errors.length === 0,
    }, "File type validation completed");

    return {
      valid: errors.length === 0,
      errors,
      detectedMimeType: mime,
      detectedExtension,
    };
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : "Unknown error",
      expectedTipoArchivo,
    }, "Error validating file type");

    errors.push({
      field: "file",
      message: "Error al validar el archivo",
      code: "VALIDATION_ERROR",
    });

    return { valid: false, errors };
  }
}

/**
 * Valida el tamaño del archivo
 */
export function validateFileSize(
  fileSize: number,
  tipoArchivo: TipoArchivo
): FileValidationResult {
  const errors: FileValidationError[] = [];
  const config = ALLOWED_FILE_CONFIG[tipoArchivo];

  if (fileSize > config.maxSize) {
    const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(2);
    const currentSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

    errors.push({
      field: "file",
      message: `El archivo es demasiado grande. Tamaño: ${currentSizeMB}MB. Máximo permitido: ${maxSizeMB}MB`,
      code: "FILE_TOO_LARGE",
    });
  }

  if (fileSize === 0) {
    errors.push({
      field: "file",
      message: "El archivo está vacío",
      code: "EMPTY_FILE",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valida completamente un archivo (tipo y tamaño)
 */
export async function validateFile(
  buffer: Buffer,
  tipoArchivo: TipoArchivo
): Promise<FileValidationResult> {
  const allErrors: FileValidationError[] = [];

  // Validar tamaño
  const sizeValidation = validateFileSize(buffer.length, tipoArchivo);
  allErrors.push(...sizeValidation.errors);

  // Validar tipo con magic numbers
  const typeValidation = await validateFileType(buffer, tipoArchivo);
  allErrors.push(...typeValidation.errors);

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    detectedMimeType: typeValidation.detectedMimeType,
    detectedExtension: typeValidation.detectedExtension,
  };
}

/**
 * Obtiene la configuración para un tipo de archivo
 */
export function getFileConfig(tipoArchivo: TipoArchivo) {
  return ALLOWED_FILE_CONFIG[tipoArchivo];
}
