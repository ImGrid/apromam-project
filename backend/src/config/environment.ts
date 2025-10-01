import "dotenv/config";
import Joi from "joi";
import { resolve } from "path";

// Schema de validacion para variables de entorno
// Define tipos, valores por defecto y restricciones para toda la configuracion critica del sistema
// Si alguna variable no cumple las reglas, la aplicacion no iniciara
const environmentSchema = Joi.object({
  // Configuracion del servidor
  // NODE_ENV determina el comportamiento del sistema (logs, validaciones, etc)
  NODE_ENV: Joi.string()
    .valid("development", "test", "production")
    .default("development")
    .description("Ambiente de ejecución"),

  // Puerto donde escucha el servidor HTTP
  // Debe estar entre 1000-65535 para evitar puertos del sistema
  PORT: Joi.number()
    .integer()
    .min(1000)
    .max(65535)
    .default(3001)
    .description("Puerto del servidor HTTP"),

  // IP donde el servidor acepta conexiones
  // 0.0.0.0 permite conexiones desde cualquier IP
  // 127.0.0.1 solo permite localhost
  HOST: Joi.string()
    .ip({ version: ["ipv4", "ipv6"] })
    .default("0.0.0.0")
    .description("Host de bind del servidor"),

  // Configuracion de PostgreSQL con PostGIS
  // Estos valores son obligatorios para conectar a la base de datos
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

  // SSL para conexion a base de datos
  // En desarrollo suele ser false, en produccion true
  DB_SSL: Joi.boolean()
    .default(false)
    .description("Habilitar SSL para conexión DB"),

  // Pool de conexiones a PostgreSQL
  // Controla cuantas conexiones simultaneas mantiene el servidor
  // MIN: conexiones minimas siempre abiertas
  // MAX: conexiones maximas permitidas
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

  // Tiempo que una conexion idle permanece abierta antes de cerrarse
  // 30000ms = 30 segundos
  DB_POOL_IDLE_TIMEOUT: Joi.number()
    .integer()
    .min(1000)
    .max(300000)
    .default(30000)
    .description("Timeout conexiones idle (ms)"),

  // Tiempo maximo para establecer una nueva conexion
  // Si tarda mas, se considera fallo
  DB_CONNECTION_TIMEOUT: Joi.number()
    .integer()
    .min(1000)
    .max(60000)
    .default(15000)
    .description("Timeout establecer conexión (ms)"),

  // Configuracion de PostGIS para coordenadas GPS
  // PostGIS es la extension de PostgreSQL para datos geograficos
  POSTGIS_VERSION: Joi.string()
    .default("3.4")
    .description("Versión PostGIS esperada"),

  // SRID 4326 es el sistema de coordenadas WGS84 (usado por GPS)
  // Es el estandar para latitud/longitud
  SRID_BOLIVIA: Joi.number()
    .integer()
    .valid(4326)
    .default(4326)
    .description("SRID para coordenadas Bolivia"),

  // Configuracion de autenticacion JWT
  // JWT_SECRET es la clave para firmar tokens
  // Debe ser una cadena larga y segura, cambiarla invalida todos los tokens
  JWT_SECRET: Joi.string()
    .required()
    .min(32)
    .description("Clave secreta JWT - CRÍTICO"),

  // Duracion del access token
  // Despues de este tiempo el usuario debe renovar con refresh token
  JWT_EXPIRES_IN: Joi.string().default("24h").description("Duración token JWT"),

  // Duracion del refresh token
  // Se usa para obtener nuevos access tokens sin hacer login otra vez
  JWT_REFRESH_EXPIRES_IN: Joi.string()
    .default("7d")
    .description("Duración refresh token"),

  // Configuracion para sincronizacion PWA offline
  // Controla como se sincronizan datos cuando el tecnico vuelve a tener internet
  SYNC_BATCH_SIZE: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(50)
    .description("Registros por batch sync"),

  // Cuantas veces reintentar una sincronizacion fallida
  SYNC_RETRY_ATTEMPTS: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .default(3)
    .description("Intentos retry sync"),

  // Tiempo maximo para completar una operacion de sincronizacion
  SYNC_TIMEOUT_MS: Joi.number()
    .integer()
    .min(5000)
    .max(120000)
    .default(30000)
    .description("Timeout operaciones sync"),

  // Configuracion de subida de archivos
  // Controla tamano maximo y cantidad de archivos (PDFs, imagenes)
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

  // Ruta donde se guardan los archivos subidos
  UPLOADS_PATH: Joi.string()
    .default("./src/uploads")
    .description("Ruta almacenamiento archivos"),

  // Tipos de archivo permitidos (separados por coma)
  ALLOWED_FILE_TYPES: Joi.string()
    .default("pdf,jpg,jpeg,png")
    .description("Tipos archivo permitidos"),

  // Limites geograficos de Bolivia para validar coordenadas GPS
  // Si las coordenadas estan fuera de estos rangos, se rechazan
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

  // Cantidad de decimales para precision GPS
  // 8 decimales = precision de ~1 metro
  GPS_PRECISION_DECIMALS: Joi.number()
    .integer()
    .min(6)
    .max(10)
    .default(8)
    .description("Decimales precisión GPS"),

  // Rate limiting para prevenir abuso del API
  // MAX: cantidad maxima de requests permitidos
  // TIMEWINDOW: ventana de tiempo en milisegundos
  RATE_LIMIT_MAX: Joi.number()
    .integer()
    .min(10)
    .max(5000)
    .default(100)
    .description("Requests máximos por ventana"),

  RATE_LIMIT_TIMEWINDOW: Joi.number()
    .integer()
    .min(60000)
    .max(3600000)
    .default(900000)
    .description("Ventana rate limit (ms) - 15min default"),

  // Configuracion CORS para permitir requests desde el frontend
  // Lista de origenes permitidos separados por coma
  CORS_ORIGIN: Joi.string()
    .default("http://localhost:3000,http://localhost:5173")
    .description("Orígenes permitidos CORS"),

  // Permitir envio de cookies y headers de autenticacion
  CORS_CREDENTIALS: Joi.boolean()
    .default(true)
    .description("Permitir credentials CORS"),

  // Configuracion de logging
  // LOG_LEVEL: nivel minimo de logs a registrar
  // LOG_PRETTY: formato legible en desarrollo, JSON en produccion
  LOG_LEVEL: Joi.string()
    .valid("fatal", "error", "warn", "info", "debug", "trace")
    .default("info")
    .description("Nivel logging Pino"),

  LOG_PRETTY: Joi.boolean()
    .default(true)
    .description("Pretty print logs desarrollo"),

  // Configuracion para generar reportes Excel
  EXCEL_TEMP_PATH: Joi.string()
    .default("./src/uploads/reportes-temp")
    .description("Ruta temporal reportes Excel"),

  EXCEL_MAX_ROWS: Joi.number()
    .integer()
    .min(100)
    .max(100000)
    .default(10000)
    .description("Máximo filas por reporte Excel"),

  // Variables de desarrollo
  // Solo aplican en NODE_ENV=development
  DEV_SEED_DATA: Joi.boolean()
    .default(false)
    .description("Cargar datos semilla desarrollo"),

  DEV_AUTO_MIGRATE: Joi.boolean()
    .default(false)
    .description("Auto ejecutar migraciones desarrollo"),
}).unknown(true);

// Valida todas las variables de entorno contra el schema
// Si alguna variable es invalida o falta una requerida, lanza error y detiene la aplicacion
// Esto previene que el servidor inicie con configuracion incorrecta
const validateEnvironment = () => {
  const { error, value: envVars } = environmentSchema.validate(process.env, {
    abortEarly: false,
    stripUnknown: false,
    errors: {
      label: "key",
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

// Ejecutar validacion y obtener variables validadas
const env = validateEnvironment();

// Configuracion exportada para uso en toda la aplicacion
// Todas las variables han sido validadas y tienen tipos correctos
// Se accede como: config.database.host, config.jwt.secret, etc
export const config = {
  // Configuracion del servidor
  node_env: env.NODE_ENV as "development" | "test" | "production",
  port: env.PORT as number,
  host: env.HOST as string,

  // Configuracion de base de datos
  database: {
    host: env.DB_HOST as string,
    port: env.DB_PORT as number,
    database: env.DB_NAME as string,
    user: env.DB_USER as string,
    password: env.DB_PASSWORD as string,
    ssl: env.DB_SSL as boolean,

    // Configuracion del pool de conexiones
    pool: {
      min: env.DB_POOL_MIN as number,
      max: env.DB_POOL_MAX as number,
      idleTimeoutMillis: env.DB_POOL_IDLE_TIMEOUT as number,
      connectionTimeoutMillis: env.DB_CONNECTION_TIMEOUT as number,
    },
  },

  // Configuracion de PostGIS
  postgis: {
    version: env.POSTGIS_VERSION as string,
    srid: env.SRID_BOLIVIA as number,
  },

  // Configuracion de JWT
  jwt: {
    secret: env.JWT_SECRET as string,
    expiresIn: env.JWT_EXPIRES_IN as string,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN as string,
  },

  // Configuracion de sincronizacion PWA
  sync: {
    batchSize: env.SYNC_BATCH_SIZE as number,
    retryAttempts: env.SYNC_RETRY_ATTEMPTS as number,
    timeoutMs: env.SYNC_TIMEOUT_MS as number,
  },

  // Configuracion de subida de archivos
  upload: {
    maxFileSize: env.UPLOAD_MAX_FILE_SIZE as number,
    maxFiles: env.UPLOAD_MAX_FILES as number,
    path: resolve(env.UPLOADS_PATH as string),
    allowedTypes: (env.ALLOWED_FILE_TYPES as string).split(","),
  },

  // Limites GPS para Bolivia
  gps: {
    bounds: {
      minLat: env.GPS_MIN_LATITUDE as number,
      maxLat: env.GPS_MAX_LATITUDE as number,
      minLng: env.GPS_MIN_LONGITUDE as number,
      maxLng: env.GPS_MAX_LONGITUDE as number,
    },
    precision: env.GPS_PRECISION_DECIMALS as number,
  },

  // Configuracion de rate limiting
  rateLimit: {
    max: env.RATE_LIMIT_MAX as number,
    timeWindow: env.RATE_LIMIT_TIMEWINDOW as number,
  },

  // Configuracion de CORS
  cors: {
    origin: (env.CORS_ORIGIN as string).split(","),
    credentials: env.CORS_CREDENTIALS as boolean,
  },

  // Configuracion de logging
  logging: {
    level: env.LOG_LEVEL as string,
    pretty: env.LOG_PRETTY as boolean,
  },

  // Configuracion de Excel
  excel: {
    tempPath: resolve(env.EXCEL_TEMP_PATH as string),
    maxRows: env.EXCEL_MAX_ROWS as number,
  },

  // Configuracion de desarrollo
  dev: {
    seedData: env.DEV_SEED_DATA as boolean,
    autoMigrate: env.DEV_AUTO_MIGRATE as boolean,
  },
} as const;

// Type para TypeScript
// Permite autocompletado y validacion de tipos en toda la app
export type AppConfig = typeof config;
