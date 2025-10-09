/**
 * Auth Service
 * Servicio para operaciones de autenticacion
 */

import { apiClient, ENDPOINTS } from "@/shared/services/api";
import { saveTokens, clearTokens } from "@/shared/services/storage";
import type { AuthResponse, UserPublicData } from "@/shared/types";

/**
 * Datos para registro
 */
export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  nombre_completo: string;
  id_rol: string;
  id_comunidad?: string;
}

/**
 * Datos para login
 */
export interface LoginInput {
  username: string;
  password: string;
}

/**
 * Registra un nuevo usuario
 */
export async function register(data: RegisterInput): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    ENDPOINTS.AUTH.REGISTER,
    data
  );

  saveTokens(response.data.tokens);
  return response.data;
}

/**
 * Inicia sesion con username y password
 */
export async function login(data: LoginInput): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    ENDPOINTS.AUTH.LOGIN,
    data
  );

  saveTokens(response.data.tokens);
  return response.data;
}

/**
 * Cierra la sesion del usuario
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
  } finally {
    clearTokens();
  }
}

/**
 * Obtiene la informacion del usuario autenticado
 */
export async function getCurrentUser(): Promise<{
  user: UserPublicData;
  permisos: Record<string, unknown>;
}> {
  const response = await apiClient.get(ENDPOINTS.AUTH.ME);
  return response.data;
}
