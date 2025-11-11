/**
 * Configuración de Variables de Entorno
 *
 * Este módulo centraliza y valida todas las variables de entorno
 * utilizadas en la aplicación. Proporciona acceso tipado y validación
 * en tiempo de ejecución para prevenir errores en producción.
 */

// Función helper para obtener variables de entorno requeridas
function getEnvVar(key: keyof ImportMetaEnv, defaultValue?: string): string {
  const value = import.meta.env[key] || defaultValue;

  if (!value) {
    throw new Error(
      `Variable de entorno requerida no encontrada: ${key}\n` +
        `Por favor verifica tu archivo .env`
    );
  }

  return value;
}

// Función helper para obtener variables opcionales
function getOptionalEnvVar(
  key: keyof ImportMetaEnv,
  defaultValue = ""
): string {
  return import.meta.env[key] || defaultValue;
}

// Configuración exportada y validada
export const env = {
  // API Configuration
  API_BASE_URL: getEnvVar("VITE_API_BASE_URL"),
  API_TIMEOUT: parseInt(getEnvVar("VITE_API_TIMEOUT", "30000")),

  // App Configuration
  APP_NAME: getEnvVar("VITE_APP_NAME", "APROMAM"),
  APP_VERSION: getOptionalEnvVar("VITE_APP_VERSION", "0.0.1"),

  // Feature Flags
  FEATURE_OFFLINE_MODE:
    getOptionalEnvVar("VITE_FEATURE_OFFLINE_MODE", "false") === "true",
  FEATURE_DEBUG_MODE:
    getOptionalEnvVar("VITE_FEATURE_DEBUG_MODE", "false") === "true",

  // External Services
  MAPS_API_KEY: getOptionalEnvVar("VITE_MAPS_API_KEY"),

  // Environment Detection
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  MODE: import.meta.env.MODE,
} as const;

// Validación adicional en desarrollo
if (env.IS_DEV) {
  // Validar que la URL de API es accesible (formato básico)
  try {
    new URL(env.API_BASE_URL);
  } catch (error) {
    // URL inválida
  }
}
