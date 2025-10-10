/**
 * Auth Store
 * Estado global de autenticación usando Zustand
 * Mejores prácticas 2024-2025: TypeScript strict, persist, auto-sync
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authService } from "../services/auth.service";
import {
  saveTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  hasValidToken,
} from "@/shared/services/storage/tokenStorage";
import type {
  AuthStore,
  LoginInput,
  RegisterInput,
  User,
  TokenPair,
  UserPermissions,
} from "../types/auth.types";

/**
 * Estado inicial del store
 */
const initialState = {
  user: null,
  permisos: null,
  status: "idle" as const,
  isAuthenticated: false,
  tokens: null,
  isLoading: false,
  error: null,
};

/**
 * Store de autenticación con Zustand
 * Persistido automáticamente en localStorage
 * Sincronizado entre pestañas del navegador
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Login del usuario
       * Guarda tokens, usuario y permisos en el store
       */
      login: async (credentials: LoginInput) => {
        set({ isLoading: true, error: null });

        try {
          // Llamar al backend
          const response = await authService.login(credentials);

          // Guardar tokens (ya se hace en authService, pero por si acaso)
          saveTokens(response.tokens);

          // Obtener permisos del usuario
          const meResponse = await authService.getCurrentUser();

          // Actualizar store
          set({
            user: response.user,
            permisos: meResponse.permisos,
            tokens: response.tokens,
            status: "authenticated",
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            ...initialState,
            status: "unauthenticated",
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Error al iniciar sesión",
          });

          throw error;
        }
      },

      /**
       * Registro de nuevo usuario
       * Automáticamente inicia sesión después del registro
       */
      register: async (data: RegisterInput) => {
        set({ isLoading: true, error: null });

        try {
          // Llamar al backend
          const response = await authService.register(data);

          // Guardar tokens
          saveTokens(response.tokens);

          // Obtener permisos del usuario
          const meResponse = await authService.getCurrentUser();

          // Actualizar store
          set({
            user: response.user,
            permisos: meResponse.permisos,
            tokens: response.tokens,
            status: "authenticated",
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            ...initialState,
            status: "unauthenticated",
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Error al registrar usuario",
          });

          throw error;
        }
      },

      /**
       * Logout del usuario
       * Limpia todo el estado y los tokens
       */
      logout: async () => {
        set({ isLoading: true });

        try {
          // Invalidar token en backend
          await authService.logout();
        } catch (error) {
          // Si falla, solo logueamos pero continuamos
          console.warn("Error al invalidar token:", error);
        } finally {
          // Siempre limpiar estado local
          clearTokens();
          set({
            ...initialState,
            status: "unauthenticated",
          });
        }
      },

      // ============================================
      // GESTIÓN DE SESIÓN
      // ============================================

      /**
       * Refresca la sesión del usuario
       * Útil para refrescar el access token o recargar datos del usuario
       */
      refreshSession: async () => {
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
          // No hay refresh token, limpiar sesión
          get().clearAuth();
          return;
        }

        try {
          // Intentar refrescar el access token
          const response = await authService.refreshToken(refreshToken);

          // Guardar nuevo access token
          const currentRefreshToken = getRefreshToken();
          if (currentRefreshToken) {
            saveTokens({
              access_token: response.access_token,
              refresh_token: currentRefreshToken,
              token_type: "Bearer",
              expires_in: response.expires_in,
            });
          }

          // Recargar datos del usuario
          const meResponse = await authService.getCurrentUser();

          // Actualizar store
          set({
            user: meResponse.user,
            permisos: meResponse.permisos,
            status: "authenticated",
            isAuthenticated: true,
          });
        } catch (error) {
          // Si falla el refresh, limpiar sesión
          console.error("Error al refrescar sesión:", error);
          get().clearAuth();
        }
      },

      /**
       * Carga el usuario desde el almacenamiento local
       * Se llama al iniciar la aplicación
       */
      loadUserFromStorage: async () => {
        // Verificar si hay token válido
        if (!hasValidToken()) {
          set({
            ...initialState,
            status: "unauthenticated",
          });
          return;
        }

        set({ isLoading: true });

        try {
          // Obtener datos del usuario actual
          const response = await authService.getCurrentUser();

          set({
            user: response.user,
            permisos: response.permisos,
            status: "authenticated",
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // Si falla, limpiar tokens
          clearTokens();
          set({
            ...initialState,
            status: "unauthenticated",
            isLoading: false,
          });
        }
      },

      // ============================================
      // ACTUALIZACIÓN DE DATOS
      // ============================================

      /**
       * Actualiza los datos del usuario en el store
       * Útil cuando se edita el perfil
       */
      updateUser: (user: User) => {
        set({ user });
      },

      /**
       * Actualiza los tokens en el store
       * Se llama desde el interceptor de Axios
       */
      updateTokens: (tokens: TokenPair) => {
        saveTokens(tokens);
        set({ tokens });
      },

      // ============================================
      // LIMPIEZA
      // ============================================

      /**
       * Limpia todo el estado de autenticación
       */
      clearAuth: () => {
        clearTokens();
        set({
          ...initialState,
          status: "unauthenticated",
        });
      },

      /**
       * Limpia solo el error
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "apromam-auth-storage", // Nombre único para localStorage
      storage: createJSONStorage(() => localStorage),

      // Solo persistir datos del usuario y tokens (no estados temporales)
      partialize: (state) => ({
        user: state.user,
        permisos: state.permisos,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),

      // Versión del store (para migraciones futuras)
      version: 1,
    }
  )
);

// ============================================
// SELECTORES PARA MEJOR PERFORMANCE
// ============================================

/**
 * Selectores memoizados para evitar re-renders innecesarios
 */
export const authSelectors = {
  user: (state: AuthStore) => state.user,
  permisos: (state: AuthStore) => state.permisos,
  isAuthenticated: (state: AuthStore) => state.isAuthenticated,
  isLoading: (state: AuthStore) => state.isLoading,
  error: (state: AuthStore) => state.error,
  status: (state: AuthStore) => state.status,
};
