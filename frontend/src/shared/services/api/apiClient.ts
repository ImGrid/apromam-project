/**
 * API Client
 * Instancia configurada de Axios para comunicacion con el backend
 */

import axios, { AxiosError } from "axios";
import type { AxiosInstance } from "axios";
import { API_CONFIG } from "@/shared/config/api.config";
import { setupInterceptors } from "./interceptors";
import { logger } from "@/shared/utils/logger";

/**
 * Estructura de error de la API
 */
export interface ApiError {
  error: string;
  message: string;
  timestamp: string;
}

/**
 * Instancia principal de Axios
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": API_CONFIG.HEADERS.CONTENT_TYPE_JSON,
    Accept: API_CONFIG.HEADERS.ACCEPT,
  },
});

// Configurar interceptors
setupInterceptors(apiClient);

/**
 * Helper para extraer mensaje de error de la respuesta
 * Mapea errores técnicos del backend a mensajes genéricos amigables
 */
export function getErrorMessage(error: unknown): string {
  let message = "Error desconocido";

  // Extraer mensaje técnico del error
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    message = axiosError.response?.data?.message || axiosError.message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  // Logear error técnico en consola para debugging (solo desarrollo)
  logger.error('[API] Error:', {
    message,
    error,
    timestamp: new Date().toISOString()
  });

  // Mapear errores técnicos a mensajes genéricos
  const lowerMessage = message.toLowerCase();

  // Errores de credenciales de login (debe ir PRIMERO)
  if (
    lowerMessage.includes("credenciales") ||
    lowerMessage.includes("inválidas") ||
    lowerMessage.includes("invalidas")
  ) {
    return "Usuario o contraseña incorrectos";
  }

  // Errores de cuenta inactiva o no disponible
  if (
    lowerMessage.includes("usuario inactivo") ||
    lowerMessage.includes("cuenta inactiva") ||
    lowerMessage.includes("deshabilitad") ||
    lowerMessage.includes("bloqueado")
  ) {
    return "Tu cuenta no está disponible. Contacta al administrador";
  }

  // Errores de rate limit / demasiados intentos
  if (
    lowerMessage.includes("demasiados intentos") ||
    lowerMessage.includes("muchas solicitudes") ||
    lowerMessage.includes("rate limit") ||
    message.includes("429")
  ) {
    return "Demasiados intentos. Intenta más tarde";
  }

  // Errores de fortaleza de password (registro/cambio de contraseña)
  if (
    lowerMessage.includes("password debe") ||
    lowerMessage.includes("contraseña debe")
  ) {
    return "La contraseña no cumple los requisitos de seguridad";
  }

  // Errores de acceso denegado a recursos de otra comunidad
  if (
    lowerMessage.includes("no tiene acceso") ||
    lowerMessage.includes("otra comunidad") ||
    lowerMessage.includes("no puede crear") ||
    lowerMessage.includes("no puede actualizar")
  ) {
    return "No tienes permisos para realizar esta acción";
  }

  // Errores de comunidad requerida para técnicos
  if (lowerMessage.includes("debe tener comunidad")) {
    return "Este usuario debe tener una comunidad asignada";
  }

  // Errores de reportes sin datos
  if (lowerMessage.includes("no hay datos")) {
    return "No hay datos disponibles para generar el reporte";
  }

  // Errores de autenticación / tokens inválidos o expirados
  if (
    lowerMessage.includes("token inválido") ||
    lowerMessage.includes("token invalido") ||
    lowerMessage.includes("token expirado") ||
    lowerMessage.includes("token expired") ||
    lowerMessage.includes("invalid token") ||
    lowerMessage.includes("refresh token") ||
    lowerMessage.includes("unauthorized") ||
    message.includes("401")
  ) {
    return "Sesión expirada. Inicia sesión nuevamente";
  }

  // Errores de validación / campos requeridos
  if (
    lowerMessage.includes("expected") ||
    lowerMessage.includes("required") ||
    lowerMessage.includes("invalid") ||
    lowerMessage.includes("zod") ||
    lowerMessage.includes("validation")
  ) {
    return "Verifica los datos ingresados";
  }

  // Errores de duplicados
  if (
    lowerMessage.includes("duplicate") ||
    lowerMessage.includes("already exists") ||
    lowerMessage.includes("ya existe") ||
    lowerMessage.includes("unique constraint")
  ) {
    return "Ya existe un registro con esos datos";
  }

  // Errores de registro no encontrado
  if (
    lowerMessage.includes("not found") ||
    lowerMessage.includes("no encontrado") ||
    message.includes("404")
  ) {
    return "Registro no encontrado";
  }

  // Errores de foreign key / relaciones
  if (
    lowerMessage.includes("foreign key") ||
    lowerMessage.includes("violates constraint") ||
    lowerMessage.includes("tiene registros relacionados") ||
    lowerMessage.includes("cannot delete") ||
    lowerMessage.includes("referenced by")
  ) {
    return "No se puede eliminar porque tiene registros relacionados";
  }

  // Errores de permisos (403)
  if (
    lowerMessage.includes("forbidden") ||
    lowerMessage.includes("sin permisos") ||
    message.includes("403")
  ) {
    return "No tienes permisos para realizar esta acción";
  }

  // Errores de red/conexión
  if (
    lowerMessage.includes("network") ||
    lowerMessage.includes("timeout") ||
    lowerMessage.includes("econnrefused") ||
    lowerMessage.includes("failed to fetch")
  ) {
    return "Error de conexión. Verifica tu internet";
  }

  // Errores del servidor
  if (
    lowerMessage.includes("internal server error") ||
    lowerMessage.includes("server error") ||
    message.includes("500")
  ) {
    return "Error del servidor. Intenta más tarde";
  }

  // Error genérico para cualquier otro caso
  return "Ocurrió un error. Intenta nuevamente";
}

/**
 * Helper para verificar si es un error de autenticacion (401)
 */
export function isAuthError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 401;
  }
  return false;
}

/**
 * Helper para verificar si es un error de permisos (403)
 */
export function isForbiddenError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 403;
  }
  return false;
}

export default apiClient;
