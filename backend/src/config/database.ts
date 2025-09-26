import { Pool, PoolClient, PoolConfig } from "pg";
import { config } from "./environment.js";
import { createDatabaseLogger } from "../utils/logger.js";

// Logger especifico para operaciones de base de datos
const logger = createDatabaseLogger();

// Configuracion del pool de conexiones PostgreSQL + PostGIS
// Pool singleton para toda la aplicacion siguiendo mejores practicas oficiales
const poolConfig: PoolConfig = {
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,

  // Configuracion de pool critica para performance
  min: config.database.pool.min,
  max: config.database.pool.max,
  idleTimeoutMillis: config.database.pool.idleTimeoutMillis,
  connectionTimeoutMillis: config.database.pool.connectionTimeoutMillis,

  // Timeouts para prevenir queries colgadas
  statement_timeout: 30000, // 30 segundos
  query_timeout: 30000,

  // Nombre aplicacion para monitoring PostgreSQL
  application_name: `apromam_backend_${config.node_env}`,

  // Configuracion directa en connection string
  // Evita race conditions de pool.on('connect') event handlers
  options: `-c search_path=public -c timezone=UTC -c datestyle=ISO,YMD`,
};

// Pool singleton de conexiones PostgreSQL
// Una sola instancia para toda la aplicacion
let poolInstance: Pool | null = null;

// Funcion para inicializar pool de manera controlada
// Evita race conditions de inicializacion automatica
export const initializePool = (): Pool => {
  if (!poolInstance) {
    poolInstance = new Pool(poolConfig);

    // Event handlers simplificados - solo para logging y errores criticos
    // NO para configuracion de clientes (evita race conditions)
    poolInstance.on("error", (err: Error, client: PoolClient) => {
      logger.error(
        {
          event: "pool_client_error",
          error: err.message,
          stack: err.stack,
          client_id: (client as any).processID || "desconocido",
        },
        "Error inesperado en cliente inactivo"
      );

      // En produccion alertar al equipo de operaciones
      if (config.node_env === "production") {
        logger.fatal(
          {
            ambiente: config.node_env,
            host_bd: config.database.host,
            tipo_error: "error_cliente_inactivo",
          },
          "ERROR CRITICO BASE DATOS"
        );
      }
    });

    // Logging basico de conexiones para monitoring
    poolInstance.on("connect", (client: PoolClient) => {
      logger.info(
        {
          total_conexiones: poolInstance?.totalCount || 0,
          conexiones_inactivas: poolInstance?.idleCount || 0,
          conexiones_esperando: poolInstance?.waitingCount || 0,
        },
        "Nueva conexion PostgreSQL establecida"
      );
    });

    poolInstance.on("acquire", (client: PoolClient) => {
      logger.debug(
        {
          total_conexiones: poolInstance?.totalCount || 0,
          conexiones_inactivas: poolInstance?.idleCount || 0,
        },
        "Cliente adquirido del pool"
      );
    });

    poolInstance.on("remove", (client: PoolClient) => {
      logger.warn(
        {
          total_conexiones: poolInstance?.totalCount || 0,
          conexiones_inactivas: poolInstance?.idleCount || 0,
        },
        "Cliente removido del pool"
      );
    });

    logger.info(
      {
        configuracion: {
          host: poolConfig.host,
          base_datos: poolConfig.database,
          conexiones_min: poolConfig.min,
          conexiones_max: poolConfig.max,
          timeout_conexion: poolConfig.connectionTimeoutMillis,
          timeout_inactivo: poolConfig.idleTimeoutMillis,
        },
      },
      "Pool PostgreSQL inicializado correctamente"
    );
  }

  return poolInstance;
};

// Getter para el pool - inicializa automaticamente si es necesario
export const pool = (() => {
  // Lazy initialization - solo cuando se accede por primera vez
  return new Proxy({} as Pool, {
    get(target, prop) {
      const poolInstance = initializePool();
      return poolInstance[prop as keyof Pool];
    },
  });
})();

// Verifica la conectividad con PostgreSQL + PostGIS
// Utilizada en health checks y startup de la aplicacion
export const checkDatabaseConnection = async (): Promise<{
  connected: boolean;
  version?: string;
  postgis_version?: string;
  pool_stats?: {
    total: number;
    idle: number;
    waiting: number;
  };
  error?: string;
}> => {
  try {
    // Asegurar que pool este inicializado
    const poolInstance = initializePool();

    // Test conectividad basica PostgreSQL
    const client = await poolInstance.connect();

    try {
      // Verificar version PostgreSQL
      const pgVersionResult = await client.query("SELECT version()");
      const pgVersion = pgVersionResult.rows[0]?.version || "desconocido";

      // Verificar PostGIS disponible y version
      const postgisResult = await client.query(`
        SELECT PostGIS_Version() as version,
               PostGIS_Lib_Version() as lib_version
      `);
      const postgisVersion = postgisResult.rows[0]?.version || "no_disponible";

      // Verificar SRID Bolivia configurado correctamente
      const sridResult = await client.query(
        `
        SELECT auth_name, auth_srid, srtext 
        FROM spatial_ref_sys 
        WHERE srid = $1
      `,
        [config.postgis.srid]
      );

      if (sridResult.rows.length === 0) {
        logger.warn(
          {
            srid_esperado: config.postgis.srid,
          },
          "SRID Bolivia no encontrado en spatial_ref_sys"
        );
      }

      return {
        connected: true,
        version: pgVersion,
        postgis_version: postgisVersion,
        pool_stats: {
          total: poolInstance.totalCount,
          idle: poolInstance.idleCount,
          waiting: poolInstance.waitingCount,
        },
      };
    } finally {
      // CRITICO: Siempre devolver cliente al pool
      client.release();
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    logger.error(
      {
        error: errorMessage,
        configuracion_host: config.database.host,
        configuracion_puerto: config.database.port,
        configuracion_bd: config.database.database,
      },
      "Fallo verificacion conexion base datos"
    );

    return {
      connected: false,
      error: errorMessage,
    };
  }
};

// Ejecuta query simple usando pool.query()
// Recomendado para queries no transaccionales
export const executeQuery = async <T = any>(
  text: string,
  params?: any[]
): Promise<T[]> => {
  try {
    logger.debug(
      {
        consulta: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
        cantidad_parametros: params?.length || 0,
      },
      "Ejecutando consulta"
    );

    const poolInstance = initializePool();
    const result = await poolInstance.query(text, params);

    logger.debug(
      {
        filas_retornadas: result.rowCount || 0,
      },
      "Consulta ejecutada exitosamente"
    );

    return result.rows as T[];
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    logger.error(
      {
        error: errorMessage,
        consulta: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
        cantidad_parametros: params?.length || 0,
      },
      "Fallo ejecucion consulta"
    );

    throw error;
  }
};

// Obtiene cliente del pool para transacciones
// IMPORTANTE: Caller debe hacer client.release() en finally block
export const getPoolClient = async (): Promise<PoolClient> => {
  try {
    const poolInstance = initializePool();
    const client = await poolInstance.connect();

    logger.debug(
      {
        estadisticas_pool: {
          total: poolInstance.totalCount,
          inactivas: poolInstance.idleCount,
          esperando: poolInstance.waitingCount,
        },
      },
      "Cliente del pool adquirido para transaccion"
    );

    return client;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      "Fallo al adquirir cliente del pool"
    );

    throw error;
  }
};

// Cierra el pool de conexiones limpiamente
// Utilizada en graceful shutdown de la aplicacion
export const closePool = async (): Promise<void> => {
  if (!poolInstance) {
    logger.info("Pool no inicializado, no hay nada que cerrar");
    return;
  }

  try {
    logger.info(
      {
        conexiones_activas: poolInstance.totalCount,
      },
      "Cerrando pool de base datos"
    );

    await poolInstance.end();
    poolInstance = null; // Resetear referencia

    logger.info("Pool de base datos cerrado exitosamente");
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      "Error cerrando pool de base datos"
    );

    throw error;
  }
};

// Estadisticas del pool para monitoring y debugging
// Util para endpoints de health check y dashboards
export const getPoolStats = () => {
  const poolInstance = initializePool();

  return {
    totalCount: poolInstance.totalCount,
    idleCount: poolInstance.idleCount,
    waitingCount: poolInstance.waitingCount,
    config: {
      max: poolConfig.max ?? 20,
      min: poolConfig.min ?? 5,
      idleTimeoutMillis: poolConfig.idleTimeoutMillis ?? 30000,
      connectionTimeoutMillis: poolConfig.connectionTimeoutMillis ?? 15000,
    },
    timestamp: new Date().toISOString(),
  };
};

// Manejo de senales para cierre limpio del pool
process.on("SIGTERM", async () => {
  logger.info("SIGTERM recibido, cerrando pool de base datos");
  await closePool();
});

process.on("SIGINT", async () => {
  logger.info("SIGINT recibido, cerrando pool de base datos");
  await closePool();
});
