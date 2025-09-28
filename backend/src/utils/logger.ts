import pino from "pino";
import { config } from "../config/environment.js";
import fs from "fs";
import path from "path";

// Crear directorio logs antes de inicializar Pino
// Si no existe el directorio, Pino puede fallar al intentar escribir archivos
const logDirectory = path.resolve(process.cwd(), "logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// Configura donde se escriben los logs segun el ambiente
// Desarrollo: consola con colores
// Produccion: archivos con rotacion automatica y salida a consola
// Test: no muestra nada
const getTransports = () => {
  const isDevelopment = config.node_env === "development";
  const isProduction = config.node_env === "production";

  // Modo desarrollo: logs en consola con formato legible
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

  // Modo produccion: logs en archivos y consola
  // Los archivos se rotan diariamente o cuando alcanzan 10MB
  if (isProduction) {
    return {
      targets: [
        // Archivo para todos los logs generales
        // Mantiene 14 dias de historial
        {
          target: "pino-roll",
          level: "info",
          options: {
            file: path.join(logDirectory, "combined.log"),
            frequency: "daily",
            mkdir: true,
            size: "10m",
            limit: { count: 14 },
          },
        },
        // Archivo solo para errores
        // Mantiene 30 dias de historial
        {
          target: "pino-roll",
          level: "error",
          options: {
            file: path.join(logDirectory, "error.log"),
            frequency: "daily",
            mkdir: true,
            size: "10m",
            limit: { count: 30 },
          },
        },
        // Salida a consola para ver logs en tiempo real
        // Necesario para Docker, Kubernetes y servidores cloud
        {
          target: "pino/file",
          level: "info",
          options: {
            destination: 1,
          },
        },
      ],
    };
  }

  // Modo test: enviar logs a la nada para no contaminar salida de tests
  return {
    target: "pino/file",
    options: {
      destination: "/dev/null",
    },
  };
};

// Configuracion base de Pino
const loggerConfig = {
  // Nivel minimo de logs a registrar
  // En test usa "silent" para no mostrar nada
  level: config.node_env === "test" ? "silent" : config.logging.level,

  // Formato de fecha y hora en ISO 8601
  timestamp: pino.stdTimeFunctions.isoTime,

  // Transforma el numero de nivel de Pino a texto legible
  // Usa mixin porque formatters.level no funciona con multiples targets
  mixin(_context: object, level: number) {
    const levelLabels: Record<number, string> = {
      10: "TRACE",
      20: "DEBUG",
      30: "INFO",
      40: "WARN",
      50: "ERROR",
      60: "FATAL",
    };

    return {
      level: levelLabels[level] || "UNKNOWN",
      env: config.node_env,
    };
  },

  // Agrega informacion del proceso a cada log
  formatters: {
    bindings: (bindings: any) => {
      return {
        pid: bindings.pid,
        hostname: bindings.hostname,
        node_env: config.node_env,
      };
    },
  },

  // Oculta datos sensibles en los logs
  // Remueve completamente campos con informacion confidencial
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
      "ci_documento",
      "*.ci_documento",
    ],
    remove: true,
  },

  // Formatea objetos comunes de manera estandar
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
};

// Crea la instancia del logger segun el ambiente
const createLogger = () => {
  const transports = getTransports();

  if (transports) {
    return pino(loggerConfig, pino.transport(transports as any));
  }

  return pino(loggerConfig);
};

// Logger principal del sistema
// Se crea una sola vez y se reutiliza en toda la aplicacion
const logger = createLogger();

// Crea un logger con contexto adicional
// Util para agregar informacion especifica de un modulo o request
export const createChildLogger = (context: Record<string, any>) => {
  return logger.child(context);
};

// Logger para operaciones de base de datos
export const createDatabaseLogger = () => {
  return logger.child({ module: "database" });
};

// Logger para sincronizacion PWA offline
export const createSyncLogger = (deviceId?: string) => {
  return logger.child({
    module: "pwa-sync",
    ...(deviceId && { device_id: deviceId }),
  });
};

// Logger para autenticacion y autorizacion
export const createAuthLogger = () => {
  return logger.child({ module: "auth" });
};

// Logger para operaciones con archivos
export const createFileLogger = () => {
  return logger.child({ module: "files" });
};

// Exportacion por defecto del logger principal
export default logger;

// Tipos para TypeScript
export type Logger = typeof logger;
export type ChildLogger = ReturnType<typeof createChildLogger>;
