import pino from "pino";
import { config } from "../config/environment.js";

// Configuracion de transports segun ambiente
// En desarrollo: consola con formato bonito
// En produccion: archivos JSON con rotacion
const getTransports = () => {
  const isDevelopment = config.node_env === "development";
  const isProduction = config.node_env === "production";

  // Desarrollo: solo consola con colores
  if (isDevelopment) {
    return {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "yyyy-mm-dd HH:MM:ss",
        ignore: "pid,hostname",
        singleLine: false,
      },
    };
  }

  // Produccion: multiples archivos con rotacion
  if (isProduction) {
    return {
      targets: [
        // Archivo para todos los logs (combinado)
        {
          target: "pino-roll",
          options: {
            file: "./logs/combined.log",
            frequency: "daily",
            size: "10m",
            mkdir: true,
            limit: { count: 14 }, // Mantener 14 dias de logs
          },
          level: "info",
        },
        // Archivo solo para errores
        {
          target: "pino-roll",
          options: {
            file: "./logs/error.log",
            frequency: "daily",
            size: "10m",
            mkdir: true,
            limit: { count: 30 }, // Errores se guardan 30 dias
          },
          level: "error",
        },
        // Archivo para operaciones de sync PWA
        {
          target: "pino-roll",
          options: {
            file: "./logs/sync.log",
            frequency: "daily",
            size: "10m",
            mkdir: true,
            limit: { count: 14 },
          },
          level: "info",
        },
      ],
    };
  }

  // Test: sin output para no contaminar tests
  return undefined;
};

// Configuracion base del logger
const loggerConfig = {
  // Nivel minimo segun ambiente
  level: config.logging.level,

  // Formato de timestamp ISO 8601
  timestamp: pino.stdTimeFunctions.isoTime,

  // Formatear el nivel como texto en mayusculas
  formatters: {
    level: (label: string) => {
      return { level: label.toUpperCase() };
    },
    // Informacion adicional del proceso
    bindings: (bindings: any) => {
      return {
        pid: bindings.pid,
        hostname: bindings.hostname,
        node_env: config.node_env,
      };
    },
  },

  // Ocultar datos sensibles en los logs
  // Importante para seguridad y cumplimiento GDPR
  redact: {
    paths: [
      "password",
      "*.password",
      "token",
      "*.token",
      "authorization",
      "*.authorization",
      "jwt",
      "*.jwt",
      "api_key",
      "*.api_key",
      "secret",
      "*.secret",
      "ci_documento", // Documento identidad productor
      "*.ci_documento",
    ],
    remove: true, // Eliminar completamente, no reemplazar con [Redacted]
  },

  // Serializers personalizados para objetos comunes
  serializers: {
    // Serializar errores con stack trace completo
    err: pino.stdSerializers.err,
    // Serializar requests HTTP de Fastify
    req: pino.stdSerializers.req,
    // Serializar responses HTTP
    res: pino.stdSerializers.res,
  },
};

// Crear instancia del logger segun ambiente
const createLogger = () => {
  const transports = getTransports();

  // Si hay transports configurados (produccion/desarrollo)
  if (transports) {
    return pino(
      loggerConfig,
      pino.transport(transports as any) // Cast necesario por tipos de Pino
    );
  }

  // Sin transports (modo test)
  return pino(loggerConfig);
};

// Instancia unica del logger (Singleton)
// Se crea una sola vez para toda la aplicacion
const logger = createLogger();

// Crear logger hijo con contexto especifico
// Util para agregar informacion de modulo, usuario, request, etc
export const createChildLogger = (context: Record<string, any>) => {
  return logger.child(context);
};

// Crear logger hijo para operaciones de base de datos
// Agrega contexto especifico de queries y conexiones
export const createDatabaseLogger = () => {
  return logger.child({ module: "database" });
};

// Crear logger hijo para operaciones de sync PWA
// Agrega contexto de sincronizacion offline
export const createSyncLogger = (deviceId?: string) => {
  return logger.child({
    module: "pwa-sync",
    ...(deviceId && { device_id: deviceId }),
  });
};

// Crear logger hijo para operaciones de autenticacion
// Agrega contexto de login/logout y roles
export const createAuthLogger = () => {
  return logger.child({ module: "auth" });
};

// Crear logger hijo para operaciones de archivos
// Agrega contexto de upload/download
export const createFileLogger = () => {
  return logger.child({ module: "files" });
};

// Logger por defecto para uso general
export default logger;

// Tipos de TypeScript para mejor autocompletado
export type Logger = typeof logger;
export type ChildLogger = ReturnType<typeof createChildLogger>;
