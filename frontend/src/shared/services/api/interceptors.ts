/**
 * API Interceptors
 * Maneja request y response interceptors para autenticacion automatica
 */

import type {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { AxiosError } from "axios";
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from "../storage/tokenStorage";
import { ENDPOINTS } from "./endpoints";

/**
 * Flag para evitar loops infinitos en refresh
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * Procesa la cola de requests fallidos despues del refresh
 */
function processQueue(error: AxiosError | null, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
}

/**
 * Configura los interceptors en la instancia de Axios
 */
export function setupInterceptors(axiosInstance: AxiosInstance): void {
  // Request Interceptor
  // Agrega automaticamente el token JWT a todas las peticiones
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAccessToken();

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response Interceptor
  // Maneja errores 401 y refresca el token automaticamente
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Si es error 401 y no es el endpoint de login o refresh
      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        originalRequest.url !== ENDPOINTS.AUTH.LOGIN &&
        originalRequest.url !== ENDPOINTS.AUTH.REFRESH
      ) {
        // Si ya hay un refresh en progreso, agregar a la cola
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return axiosInstance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = getRefreshToken();

        if (!refreshToken) {
          clearTokens();
          processQueue(error, null);
          isRefreshing = false;

          // Redirigir al login
          window.location.href = "/login";
          return Promise.reject(error);
        }

        try {
          // Intentar refrescar el token
          const response = await axiosInstance.post<{
            access_token: string;
            token_type: "Bearer";
            expires_in: number;
          }>(ENDPOINTS.AUTH.REFRESH, {
            refresh_token: refreshToken,
          });

          const newAccessToken = response.data.access_token;

          // Guardar nuevo access token
          const currentRefreshToken = getRefreshToken();
          if (currentRefreshToken) {
            saveTokens({
              access_token: newAccessToken,
              refresh_token: currentRefreshToken,
              token_type: "Bearer",
              expires_in: response.data.expires_in,
            });
          }

          // Actualizar header del request original
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          processQueue(null, newAccessToken);
          isRefreshing = false;

          // Reintentar request original
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError as AxiosError, null);
          isRefreshing = false;
          clearTokens();

          // Redirigir al login
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }

      // Si es error 403 (forbidden)
      if (error.response?.status === 403) {
        console.warn("Acceso denegado:", error.response.data);
      }

      // Si es error 404 (not found)
      if (error.response?.status === 404) {
        console.warn("Recurso no encontrado:", error.config?.url);
      }

      // Si es error 500 (server error)
      if (error.response?.status === 500) {
        console.error("Error del servidor:", error.response.data);
      }

      return Promise.reject(error);
    }
  );
}
