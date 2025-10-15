import fs from "fs/promises";
import path from "path";
import { config } from "../config/environment.js";
import logger from "./logger.js";

// Subdirectorios para organizar archivos por tipo
export const UPLOAD_SUBDIRS = {
  croquis: "croquis",
  foto_parcela: "fotos-parcelas",
  documento_pdf: "documentos",
} as const;

export type TipoArchivoUpload = keyof typeof UPLOAD_SUBDIRS;

/**
 * Inicializa la estructura de directorios para uploads
 * Crea el directorio base y los subdirectorios necesarios
 */
export async function initializeUploadsDirectory(): Promise<void> {
  const baseDir = config.upload.path;

  try {
    // Crear directorio base
    await fs.mkdir(baseDir, { recursive: true });

    // Crear subdirectorios
    for (const [tipo, subdir] of Object.entries(UPLOAD_SUBDIRS)) {
      const dirPath = path.join(baseDir, subdir);
      await fs.mkdir(dirPath, { recursive: true });
      logger.debug(`Created upload subdirectory: ${dirPath}`);
    }

    logger.info({
      baseDir,
      subdirs: Object.values(UPLOAD_SUBDIRS),
    }, "Uploads directory structure initialized");
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : "Unknown error",
      baseDir,
    }, "Failed to initialize uploads directory");
    throw error;
  }
}

/**
 * Obtiene el subdirectorio según el tipo de archivo
 */
export function getSubdirForType(tipo: string): string {
  const subdir = UPLOAD_SUBDIRS[tipo as TipoArchivoUpload];
  if (!subdir) {
    throw new Error(`Tipo de archivo no reconocido: ${tipo}`);
  }
  return subdir;
}

/**
 * Construye la ruta completa para guardar un archivo
 */
export function buildFilePath(tipo: string, filename: string): string {
  const subdir = getSubdirForType(tipo);
  return path.join(config.upload.path, subdir, filename);
}

/**
 * Construye la ruta relativa para almacenar en BD
 * (relativa al directorio base de uploads)
 */
export function buildRelativePath(tipo: string, filename: string): string {
  const subdir = getSubdirForType(tipo);
  return path.join(subdir, filename);
}

/**
 * Sanitiza el nombre de archivo para evitar ataques
 * Remueve caracteres peligrosos y path traversal
 */
export function sanitizeFilename(filename: string): string {
  // Remover path traversal (../ y ..\ y variantes)
  let clean = filename.replace(/\.\.[\/\\]/g, "");

  // Remover caracteres especiales peligrosos
  clean = clean.replace(/[<>:"|?*\x00-\x1F]/g, "");

  // Limitar longitud
  if (clean.length > 255) {
    const ext = path.extname(clean);
    const name = path.basename(clean, ext);
    clean = name.substring(0, 255 - ext.length) + ext;
  }

  return clean;
}

/**
 * Genera un nombre de archivo único
 */
export function generateUniqueFilename(originalFilename: string, prefix?: string): string {
  const sanitized = sanitizeFilename(originalFilename);
  const ext = path.extname(sanitized);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  if (prefix) {
    return `${prefix}-${timestamp}-${random}${ext}`;
  }

  return `${timestamp}-${random}${ext}`;
}
