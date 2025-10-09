/**
 * Configuracion de API
 * Define constantes de configuracion para la comunicacion con el backend
 */

import { env } from "./env";

export const API_CONFIG = {
  BASE_URL: env.API_BASE_URL,
  TIMEOUT: env.API_TIMEOUT,

  HEADERS: {
    CONTENT_TYPE_JSON: "application/json",
    ACCEPT: "application/json",
  },

  ENDPOINTS_PREFIX: {
    AUTH: "/api/auth",
    CATALOGOS: "/api/catalogos",
    COMUNIDADES: "/api/comunidades",
    GEOGRAFICAS: "/api/geograficas",
    PRODUCTORES: "/api/productores",
    PARCELAS: "/api/parcelas",
    USUARIOS: "/api/usuarios",
    FICHAS: "/api/fichas",
  },
} as const;
