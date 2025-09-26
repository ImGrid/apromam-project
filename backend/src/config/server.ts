import fastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { config } from "./environment.js";
import logger from "../utils/logger.js";

// Configuracion del servidor Fastify para sistema APROMAM
// Incluye plugins esenciales y configuracion especifica para PWA offline

// Opciones de configuracion Fastify optimizadas para APROMAM
// Configuracion especifica para PWA y manejo de archivos
const fastifyOptions: FastifyServerOptions = {
  // Usar nuestro logger centralizado en lugar de crear uno propio
  loggerInstance: logger,

  // Configuracion para PWA - Keep-alive connections importantes
  keepAliveTimeout: 30000, // 30 segundos
  connectionTimeout: 10000, // 10 segundos

  // Body parsing para uploads PDF/imagenes
  bodyLimit: config.upload.maxFileSize,

  // Configuracion request/response timeouts
  requestTimeout: 30000, // 30 segundos para queries complejas PostGIS

  // Configuracion especifica para produccion
  ...(config.node_env === "production"
    ? {
        trustProxy: true, // Para load balancers
        ignoreTrailingSlash: true, // Normalizacion URLs
        caseSensitive: false, // URLs case insensitive
      }
    : {}),
};

// Crea instancia Fastify con configuracion optimizada
// Registro de plugins esenciales para funcionalidad APROMAM
export const createServer = async (): Promise<FastifyInstance> => {
  const server = fastify(fastifyOptions);

  // Configurar compilers Zod ANTES de registrar plugins
  // Esto permite que las rutas usen withTypeProvider posteriormente
  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  // Plugin JWT para autenticación
  await server.register(import("@fastify/jwt"), {
    secret: config.jwt.secret,
    sign: {
      expiresIn: config.jwt.expiresIn,
      algorithm: "HS256",
      issuer: "apromam-backend",
      audience: "apromam-client",
    },
    verify: {
      algorithms: ["HS256"],
      issuer: "apromam-backend",
      audience: "apromam-client",
    },
  });

  // Registrar decorator authenticate
  server.decorate("authenticate", async (request: any, reply: any) => {
    // Implementación en middleware/authenticate.ts
    const { authenticate } = await import("../middleware/authenticate.js");
    return authenticate(request, reply);
  });

  // Plugin helmet para headers seguridad - Critico para auditorias
  await server.register(import("@fastify/helmet"), {
    // CSP especifico para PWA - Service Workers requieren unsafe-inline
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // PWA Service Workers
        styleSrc: ["'self'", "'unsafe-inline'"], // CSS PWA
        imgSrc: ["'self'", "data:", "blob:"], // Imagenes upload
        connectSrc: ["'self'"], // API calls
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
      },
    },
    // Headers adicionales para PWA
    crossOriginEmbedderPolicy: false, // PWA compatibility
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  });

  // CORS configurado para PWA frontend
  await server.register(import("@fastify/cors"), {
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-Sync-Token", // Header PWA sync
      "X-Device-Id", // Header identificacion dispositivo
    ],
  });

  // Rate limiting configurado por rol
  await server.register(import("@fastify/rate-limit"), {
    global: true,
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.timeWindow,

    // Rate limit diferenciado por rol - Extraido de JWT
    keyGenerator: (request) => {
      const user = (request as any).user;
      const role = user?.role || "anonymous";
      const ip = request.ip;
      return `${ip}-${role}`;
    },

    // Configuracion especifica por endpoint
    allowList: (req) => {
      // Permitir health checks sin rate limit
      return req.url?.includes("/health") || false;
    },
  });

  // Multipart para upload archivos PDF/imagenes
  await server.register(import("@fastify/multipart"), {
    limits: {
      fileSize: config.upload.maxFileSize,
      files: config.upload.maxFiles,
      fields: 10, // Maximo campos por form
      parts: config.upload.maxFiles + 10, // Files + campos
    },

    // Configuracion especifica tipos archivo APROMAM
    attachFieldsToBody: true,

    // Handler para tipos archivo no permitidos
    onFile: async (part) => {
      const allowedTypes = config.upload.allowedTypes;
      const filename = part.filename;

      if (!filename) {
        throw new Error("Filename is required");
      }

      const extension = filename.split(".").pop()?.toLowerCase();
      if (!extension || !allowedTypes.includes(extension)) {
        throw new Error(
          `File type not allowed. Allowed: ${allowedTypes.join(", ")}`
        );
      }
    },
  });

  // Static files para servir uploads
  await server.register(import("@fastify/static"), {
    root: config.upload.path,
    prefix: "/uploads/",

    // Configuracion cache para archivos estaticos
    cacheControl: true,
    dotfiles: "deny",
    etag: true,
    maxAge: config.node_env === "production" ? 86400000 : 0, // 24h produccion

    // Headers especificos para archivos APROMAM
    setHeaders: (response, path) => {
      if (path.endsWith(".pdf")) {
        response.setHeader("Content-Type", "application/pdf");
      }
    },
  });

  // Swagger para documentacion API - Solo desarrollo/test
  if (config.node_env !== "production") {
    await server.register(import("@fastify/swagger"), {
      swagger: {
        info: {
          title: "APROMAM API",
          description: "Sistema Certificacion Organica con PWA offline",
          version: "1.0.0",
        },
        host: `localhost:${config.port}`,
        schemes: ["http"],
        consumes: ["application/json"],
        produces: ["application/json"],
        securityDefinitions: {
          Bearer: {
            type: "apiKey",
            name: "Authorization",
            in: "header",
            description: "JWT token format: Bearer <token>",
          },
        },
      },
    });

    await server.register(import("@fastify/swagger-ui"), {
      routePrefix: "/documentation",
      uiConfig: {
        docExpansion: "list",
        deepLinking: false,
      },
    });
  }

  // Configuracion especifica PWA - Service Worker headers
  server.addHook("onSend", async (request, reply, payload) => {
    // Headers PWA para Service Workers
    if (
      request.url?.includes("sw.js") ||
      request.url?.includes("service-worker.js")
    ) {
      reply.header("Service-Worker-Allowed", "/");
      reply.header("Cache-Control", "no-cache");
    }

    // Headers para archivos manifest PWA
    if (request.url?.includes("manifest.json")) {
      reply.header("Content-Type", "application/manifest+json");
    }

    return payload;
  });

  // Hook error handling global
  server.setErrorHandler(async (error, request, reply) => {
    const errorId = `error_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    request.log.error(
      {
        errorId,
        error: error.message,
        stack: error.stack,
        method: request.method,
        url: request.url,
        ip: request.ip,
      },
      "Error handling request"
    );

    // Respuesta error estandarizada para frontend PWA
    const statusCode = error.statusCode || 500;
    const errorResponse = {
      error: error.name || "ServerError",
      message:
        config.node_env === "production"
          ? "Internal server error"
          : error.message,
      errorId,
      timestamp: new Date().toISOString(),
    };

    reply.status(statusCode).send(errorResponse);
  });

  // Health check basico - No requiere autenticacion
  server.get("/health", async (request, reply) => {
    const healthCheck = {
      status: "OK",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      environment: config.node_env,
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };

    return healthCheck;
  });

  server.log.info({
    message: "Fastify server configured successfully",
    environment: config.node_env,
    plugins: [
      "zod-compilers",
      "jwt",
      "helmet",
      "cors",
      "rate-limit",
      "multipart",
      "static",
      ...(config.node_env !== "production" ? ["swagger", "swagger-ui"] : []),
    ],
  });

  return server;
};
