import {
  apiClient,
  ENDPOINTS,
  getErrorMessage,
  isAuthError,
} from "@/shared/services/api";
import { saveTokens, clearTokens } from "@/shared/services/storage";
import type {
  AuthResponse,
  MeResponse,
  RefreshResponse,
  RegisterInput,
  LoginInput,
} from "../types/auth.types";

/**
 * Servicio de autenticación
 * Todas las funciones lanzan errores que deben ser manejados por el caller
 */
export const authService = {
  /**
   * Registra un nuevo usuario en el sistema
   */
  async register(data: RegisterInput): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        ENDPOINTS.AUTH.REGISTER,
        data
      );

      // Guardar tokens automáticamente
      if (response.data.tokens) {
        saveTokens(response.data.tokens);
      }

      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      throw new Error(message);
    }
  },

  /**
   * Inicia sesión con username y password
   */
  async login(data: LoginInput): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        ENDPOINTS.AUTH.LOGIN,
        data
      );

      // Guardar tokens automáticamente
      if (response.data.tokens) {
        saveTokens(response.data.tokens);
      }

      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);

      // Mejorar mensajes de error comunes
      if (message.includes("Credenciales inválidas")) {
        throw new Error("Usuario o contraseña incorrectos");
      }

      if (message.includes("Demasiados intentos")) {
        throw new Error("Demasiados intentos fallidos. Intenta más tarde");
      }

      if (message.includes("Usuario inactivo")) {
        throw new Error("Tu cuenta está inactiva. Contacta al administrador");
      }

      throw new Error(message);
    }
  },

  /**
   * Cierra la sesión del usuario
   * Invalida el token en el backend y limpia el almacenamiento local
   */
  async logout(): Promise<void> {
    try {
      // Intentar invalidar token en backend
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Si falla, solo logueamos pero continuamos con la limpieza local
      console.warn("Error al invalidar token en backend:", error);
    } finally {
      // Siempre limpiar tokens localmente
      clearTokens();
    }
  },

  /**
   * Obtiene la información del usuario autenticado actual
   * Incluye permisos completos del rol
   */
  async getCurrentUser(): Promise<MeResponse> {
    try {
      const response = await apiClient.get<MeResponse>(ENDPOINTS.AUTH.ME);
      return response.data;
    } catch (error) {
      // Si es error 401, el token expiró o es inválido
      if (isAuthError(error)) {
        clearTokens();
        throw new Error("Sesión expirada. Por favor inicia sesión nuevamente");
      }

      const message = getErrorMessage(error);
      throw new Error(message);
    }
  },

  /**
   * Refresca el access token usando el refresh token
   */
  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    try {
      const response = await apiClient.post<RefreshResponse>(
        ENDPOINTS.AUTH.REFRESH,
        { refresh_token: refreshToken }
      );

      return response.data;
    } catch (error) {
      // Si falla el refresh, limpiar tokens
      clearTokens();

      const message = getErrorMessage(error);
      throw new Error(message);
    }
  },
};

/**
 * Export individual para backward compatibility
 */
export const { register, login, logout, getCurrentUser, refreshToken } =
  authService;
