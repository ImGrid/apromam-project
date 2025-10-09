/**
 * API Client
 * Instancia configurada de Axios para comunicacion con el backend
 */

import axios, { AxiosError } from "axios";
import type { AxiosInstance } from "axios";
import { API_CONFIG } from "@/shared/config/api.config";
import { setupInterceptors } from "./interceptors";

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
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    return axiosError.response?.data?.message || axiosError.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Error desconocido";
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
