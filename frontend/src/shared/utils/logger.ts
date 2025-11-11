/**
 * Logger centralizado para la aplicación
 *
 * En desarrollo: muestra logs en consola
 * En producción: silencia los logs (seguridad)
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  /**
   * Loguea errores
   * Solo visible en desarrollo
   */
  error: (message: string, data?: any) => {
    if (isDevelopment) {
      if (data !== undefined) {
        console.error(message, data);
      } else {
        console.error(message);
      }
    }
    // TODO: En producción, enviar a servicio de monitoreo (Sentry, LogRocket, etc.)
  },

  /**
   * Loguea advertencias
   * Solo visible en desarrollo
   */
  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      if (data !== undefined) {
        console.warn(message, data);
      } else {
        console.warn(message);
      }
    }
  },

  /**
   * Loguea información
   * Solo visible en desarrollo
   */
  info: (message: string, data?: any) => {
    if (isDevelopment) {
      if (data !== undefined) {
        console.info(message, data);
      } else {
        console.info(message);
      }
    }
  },

  /**
   * Loguea debug
   * Solo visible en desarrollo
   */
  debug: (message: string, data?: any) => {
    if (isDevelopment) {
      if (data !== undefined) {
        console.debug(message, data);
      } else {
        console.debug(message);
      }
    }
  },
};
