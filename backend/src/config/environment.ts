import "dotenv/config";
import Joi from "joi";
import { resolve } from "path";

/**
 * Schema de validación para variables de entorno del sistema APROMAM
 * Define tipos, valores por defecto y restricciones para configuración crítica
 */
const environmentSchema = Joi.object({
  // Configuración del servidor
  NODE_ENV: Joi.string()
    .valid("development", "test", "production")
    .default("development")
    .description("Ambiente de ejecución"),

  PORT: Joi.number()
    .integer()
    .min(1000)
    .max(65535)
    .default(3001)
    .description("Puerto del servidor HTTP"),

  HOST: Joi.string()
    .ip({ version: ["ipv4", "ipv6"] })
    .default("0.0.0.0")
    .description("Host de bind del servidor"),

  // Configuración base de datos PostgreSQL + PostGIS
  DB_HOST: Joi.string().required().description("Host de PostgreSQL"),

  DB_PORT: Joi.number()
    .integer()
    .min(1000)
    .max(65535)
    .default(5432)
    .description("Puerto de PostgreSQL"),

  DB_NAME: Joi.string().required().min(1).description("Nombre base de datos"),

  DB_USER: Joi.string().required().min(1).description("Usuario PostgreSQL"),

  DB_PASSWORD: Joi.string()
    .required()
    .min(1)
    .description("Contraseña PostgreSQL"),

  DB_SSL: Joi.boolean()
    .default(false)
    .description("Habilitar SSL para conexión DB"),

  // Pool de conexiones - Configuración crítica para performance
  DB_POOL_MIN: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(5)
    .description("Mínimo conexiones en pool"),

  DB_POOL_MAX: Joi.number()
    .integer()
    .min(5)
    .max(100)
    .default(20)
    .description("Máximo conexiones en pool"),

  DB_POOL_IDLE_TIMEOUT: Joi.number()
    .integer()
    .min(1000)
    .max(300000)
    .default(30000)
    .description("Timeout conexiones idle (ms)"),

  DB_CONNECTION_TIMEOUT: Joi.number()
    .integer()
    .min(1000)
    .max(60000)
    .default(15000)
    .description("Timeout establecer conexión (ms)"),

  // PostGIS específico para coordenadas GPS
  POSTGIS_VERSION: Joi.string()
    .default("3.4")
    .description("Versión PostGIS esperada"),

  SRID_BOLIVIA: Joi.number()
    .integer()
    .valid(4326)
    .default(4326)
    .description("SRID para coordenadas Bolivia"),

  // Autenticación JWT
  JWT_SECRET: Joi.string()
    .required()
    .min(32)
    .description("Clave secreta JWT - CRÍTICO"),

  JWT_EXPIRES_IN: Joi.string().default("24h").description("Duración token JWT"),

  JWT_REFRESH_EXPIRES_IN: Joi.string()
    .default("7d")
    .description("Duración refresh token"),

  // PWA Sync offline - Performance crítica
  SYNC_BATCH_SIZE: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(50)
    .description("Registros por batch sync"),

  SYNC_RETRY_ATTEMPTS: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .default(3)
    .description("Intentos retry sync"),

  SYNC_TIMEOUT_MS: Joi.number()
    .integer()
    .min(5000)
    .max(120000)
    .default(30000)
    .description("Timeout operaciones sync"),

  // Upload de archivos PDF/imágenes
  UPLOAD_MAX_FILE_SIZE: Joi.number()
    .integer()
    .min(1048576)
    .max(52428800)
    .default(10485760)
    .description("Tamaño máximo archivo bytes (10MB default)"),

  UPLOAD_MAX_FILES: Joi.number()
    .integer()
    .min(1)
    .max(20)
    .default(5)
    .description("Máximo archivos por upload"),

  UPLOADS_PATH: Joi.string()
    .default("./src/uploads")
    .description("Ruta almacenamiento archivos"),

  ALLOWED_FILE_TYPES: Joi.string()
    .default("pdf,jpg,jpeg,png")
    .description("Tipos archivo permitidos"),

  // GPS Bolivia - Validación coordenadas específicas
  GPS_MIN_LATITUDE: Joi.number()
    .min(-90)
    .max(90)
    .default(-22.896133)
    .description("Latitud mínima Bolivia"),

  GPS_MAX_LATITUDE: Joi.number()
    .min(-90)
    .max(90)
    .default(-9.680567)
    .description("Latitud máxima Bolivia"),

  GPS_MIN_LONGITUDE: Joi.number()
    .min(-180)
    .max(180)
    .default(-69.651047)
    .description("Longitud mínima Bolivia"),

  GPS_MAX_LONGITUDE: Joi.number()
    .min(-180)
    .max(180)
    .default(-57.453621)
    .description("Longitud máxima Bolivia"),

  GPS_PRECISION_DECIMALS: Joi.number()
    .integer()
    .min(6)
    .max(10)
    .default(8)
    .description("Decimales precisión GPS"),

  // Rate limiting por rol
  RATE_LIMIT_MAX: Joi.number()
    .integer()
    .min(10)
    .max(1000)
    .default(100)
    .description("Requests máximos por ventana"),

  RATE_LIMIT_TIMEWINDOW: Joi.number()
    .integer()
    .min(60000)
    .max(3600000)
    .default(900000)
    .description("Ventana rate limit (ms) - 15min default"),

  // CORS para PWA
  CORS_ORIGIN: Joi.string()
    .default("http://localhost:3000,http://localhost:5173")
    .description("Orígenes permitidos CORS"),

  CORS_CREDENTIALS: Joi.boolean()
    .default(true)
    .description("Permitir credentials CORS"),

  // Logging - Sin emojis (requerimiento auditoría)
  LOG_LEVEL: Joi.string()
    .valid("fatal", "error", "warn", "info", "debug", "trace")
    .default("info")
    .description("Nivel logging Pino"),

  LOG_PRETTY: Joi.boolean()
    .default(true)
    .description("Pretty print logs desarrollo"),

  // Excel reportes ONG
  EXCEL_TEMP_PATH: Joi.string()
    .default("./src/uploads/reportes-temp")
    .description("Ruta temporal reportes Excel"),

  EXCEL_MAX_ROWS: Joi.number()
    .integer()
    .min(100)
    .max(100000)
    .default(10000)
    .description("Máximo filas por reporte Excel"),

  // Variables desarrollo (opcionales)
  DEV_SEED_DATA: Joi.boolean()
    .default(false)
    .description("Cargar datos semilla desarrollo"),

  DEV_AUTO_MIGRATE: Joi.boolean()
    .default(false)
    .description("Auto ejecutar migraciones desarrollo"),
}).unknown(true); // Permitir variables adicionales sin validar

/**
 * Valida y procesa las variables de entorno contra el schema definido
 * Falla inmediatamente si variables críticas están ausentes o inválidas
 */
const validateEnvironment = () => {
  const { error, value: envVars } = environmentSchema.validate(process.env, {
    abortEarly: false, // Mostrar todos los errores
    stripUnknown: false, // Conservar variables no validadas
    errors: {
      label: "key", // Mostrar nombre de variable en error
    },
  });

  if (error) {
    const errorDetails = error.details
      .map((detail) => `${detail.path.join(".")}: ${detail.message}`)
      .join("\n");

    throw new Error(`Environment validation failed:\n${errorDetails}`);
  }

  return envVars;
};

/**
 * Configuración validada del sistema APROMAM
 * Todas las variables han pasado validación Joi y tienen tipos correctos
 */
const env = validateEnvironment();

/**
 * Configuración exportada para uso en toda la aplicación
 * Tipado estricto y validación garantizada
 */
export const config = {
  // Server
  node_env: env.NODE_ENV as "development" | "test" | "production",
  port: env.PORT as number,
  host: env.HOST as string,

  // Database
  database: {
    host: env.DB_HOST as string,
    port: env.DB_PORT as number,
    database: env.DB_NAME as string,
    user: env.DB_USER as string,
    password: env.DB_PASSWORD as string,
    ssl: env.DB_SSL as boolean,

    // Pool configuration
    pool: {
      min: env.DB_POOL_MIN as number,
      max: env.DB_POOL_MAX as number,
      idleTimeoutMillis: env.DB_POOL_IDLE_TIMEOUT as number,
      connectionTimeoutMillis: env.DB_CONNECTION_TIMEOUT as number,
    },
  },

  // PostGIS
  postgis: {
    version: env.POSTGIS_VERSION as string,
    srid: env.SRID_BOLIVIA as number,
  },

  // JWT
  jwt: {
    secret: env.JWT_SECRET as string,
    expiresIn: env.JWT_EXPIRES_IN as string,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN as string,
  },

  // PWA Sync
  sync: {
    batchSize: env.SYNC_BATCH_SIZE as number,
    retryAttempts: env.SYNC_RETRY_ATTEMPTS as number,
    timeoutMs: env.SYNC_TIMEOUT_MS as number,
  },

  // Upload
  upload: {
    maxFileSize: env.UPLOAD_MAX_FILE_SIZE as number,
    maxFiles: env.UPLOAD_MAX_FILES as number,
    path: resolve(env.UPLOADS_PATH as string),
    allowedTypes: (env.ALLOWED_FILE_TYPES as string).split(","),
  },

  // GPS Bolivia
  gps: {
    bounds: {
      minLat: env.GPS_MIN_LATITUDE as number,
      maxLat: env.GPS_MAX_LATITUDE as number,
      minLng: env.GPS_MIN_LONGITUDE as number,
      maxLng: env.GPS_MAX_LONGITUDE as number,
    },
    precision: env.GPS_PRECISION_DECIMALS as number,
  },

  // Rate limiting
  rateLimit: {
    max: env.RATE_LIMIT_MAX as number,
    timeWindow: env.RATE_LIMIT_TIMEWINDOW as number,
  },

  // CORS
  cors: {
    origin: (env.CORS_ORIGIN as string).split(","),
    credentials: env.CORS_CREDENTIALS as boolean,
  },

  // Logging
  logging: {
    level: env.LOG_LEVEL as string,
    pretty: env.LOG_PRETTY as boolean,
  },

  // Excel
  excel: {
    tempPath: resolve(env.EXCEL_TEMP_PATH as string),
    maxRows: env.EXCEL_MAX_ROWS as number,
  },

  // Development
  dev: {
    seedData: env.DEV_SEED_DATA as boolean,
    autoMigrate: env.DEV_AUTO_MIGRATE as boolean,
  },
} as const;

// Type para uso en toda la aplicación
export type AppConfig = typeof config;
