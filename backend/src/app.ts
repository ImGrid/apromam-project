import { createServer } from "./config/server.js";
import { checkDatabaseConnection } from "./config/database.js";
import { config } from "./config/environment.js";
import logger from "./utils/logger.js";
import authRoutes from "./routes/auth.routes.js";
import comunidadesRoutes from "./routes/comunidades.routes.js";
import catalogosRoutes from "./routes/catalogos.routes.js";

// Funcion principal de inicializacion
const startServer = async () => {
  try {
    logger.info(
      {
        node_env: config.node_env,
        node_version: process.version,
      },
      "Starting APROMAM backend server..."
    );

    // Crear instancia del servidor Fastify
    const server = await createServer();

    // Verificar conexion con base de datos antes de iniciar servidor
    logger.info("Checking database connection...");
    const dbStatus = await checkDatabaseConnection();

    if (!dbStatus.connected) {
      logger.fatal(
        {
          error: dbStatus.error,
        },
        "Failed to connect to database. Shutting down..."
      );
      process.exit(1);
    }

    logger.info(
      {
        postgres_version: dbStatus.version,
        postgis_version: dbStatus.postgis_version,
        pool_stats: dbStatus.pool_stats,
      },
      "Database connection verified"
    );

    await server.register(authRoutes, { prefix: "/api/auth" });
    await server.register(comunidadesRoutes, { prefix: "/api/comunidades" });
    await server.register(catalogosRoutes, { prefix: "/api/catalogos" });

    // Iniciar servidor HTTP
    await server.listen({
      port: config.port,
      host: config.host,
    });

    logger.info(
      {
        environment: config.node_env,
        config: {
          port: config.port,
          host: config.host,
          database_host: config.database.host,
          database_name: config.database.database,
          pool_config: {
            min: config.database.pool.min,
            max: config.database.pool.max,
          },
          postgis_srid: config.postgis.srid,
          upload_max_size: config.upload.maxFileSize,
          jwt_expires: config.jwt.expiresIn,
          rate_limit_max: config.rateLimit.max,
        },
      },
      "APROMAM application initialized successfully"
    );

    // Obtener direcciones del servidor
    const addresses = server.addresses();
    addresses.forEach((addr) => {
      if (typeof addr === "string") {
        logger.info(`Server listening at ${addr}`);
      } else {
        const url = `http://${addr.address}:${addr.port}`;
        logger.info(`Server listening at ${url}`);
      }
    });

    // URLs de desarrollo
    if (config.node_env === "development") {
      const localUrl = `http://127.0.0.1:${config.port}`;
      logger.info(
        {
          urls: {
            api: localUrl,
            health: `${localUrl}/health`,
            database_health: `${localUrl}/health/database`,
            documentation: `${localUrl}/documentation`,
            // Endpoints autenticacion
            auth_register: `${localUrl}/api/auth/register`,
            auth_login: `${localUrl}/api/auth/login`,
            auth_me: `${localUrl}/api/auth/me`,
            // Endpoints comunidades
            comunidades: `${localUrl}/api/comunidades`,
            // Endpoints catalogos
            tipos_cultivo: `${localUrl}/api/catalogos/tipos-cultivo`,
            gestiones: `${localUrl}/api/catalogos/gestiones`,
          },
        },
        "Development URLs available"
      );
    }

    logger.info(
      {
        address: `http://127.0.0.1:${config.port}`,
        environment: config.node_env,
        node_version: process.version,
      },
      "APROMAM server started successfully"
    );
  } catch (error) {
    logger.fatal(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      "Failed to start server"
    );
    process.exit(1);
  }
};

// Manejo de shutdown limpio
const gracefulShutdown = async (signal: string) => {
  logger.info(
    {
      signal,
    },
    "Received shutdown signal, closing server gracefully..."
  );

  try {
    // Aqui se agregarian otros cleanups necesarios
    logger.info("Server shutdown completed successfully");
    process.exit(0);
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "Error during shutdown"
    );
    process.exit(1);
  }
};

// Registrar handlers para shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Manejo de errores no capturados
process.on("unhandledRejection", (reason, promise) => {
  logger.error(
    {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    },
    "Unhandled Promise Rejection"
  );
});

process.on("uncaughtException", (error) => {
  logger.fatal(
    {
      error: error.message,
      stack: error.stack,
    },
    "Uncaught Exception"
  );
  process.exit(1);
});

// Iniciar aplicacion
startServer();
