import { FastifyRequest, FastifyReply } from "fastify";
import { createAuthLogger } from "../utils/logger.js";
import {
  isTokenBlacklisted,
  extractTokenFromHeader,
} from "../utils/jwt.utils.js";

const logger = createAuthLogger();

// Middleware de autenticacion principal
// Verifica que el token JWT sea valido y asigna el usuario a request.user
// Se usa en todas las rutas protegidas que requieren autenticacion
// Uso: fastify.get('/protected', { onRequest: [fastify.authenticate] }, handler)
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Extraer token del header Authorization
    // Formato esperado: "Bearer <token>"
    const authHeader = request.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      logger.warn(
        {
          method: request.method,
          url: request.url,
          ip: request.ip,
        },
        "Authentication failed: No token provided"
      );

      return reply.code(401).send({
        error: "unauthorized",
        message: "Token de autenticación requerido",
        timestamp: new Date().toISOString(),
      });
    }

    // Verificar si el token esta en la blacklist (usuario hizo logout)
    if (isTokenBlacklisted(token)) {
      logger.warn(
        {
          method: request.method,
          url: request.url,
          ip: request.ip,
        },
        "Authentication failed: Token blacklisted"
      );

      return reply.code(401).send({
        error: "token_revoked",
        message: "Token ha sido revocado. Por favor, inicia sesión nuevamente",
        timestamp: new Date().toISOString(),
      });
    }

    // Verificar JWT usando el plugin @fastify/jwt
    // Esto valida automaticamente firma, expiracion, issuer y audience
    await request.jwtVerify();

    // request.user ya esta asignado por @fastify/jwt
    // Validar que contenga los campos requeridos
    if (!request.user?.userId || !request.user?.role) {
      logger.error(
        {
          user_payload: request.user,
        },
        "Invalid JWT payload structure"
      );

      return reply.code(401).send({
        error: "invalid_token",
        message: "Token inválido",
        timestamp: new Date().toISOString(),
      });
    }

    logger.debug(
      {
        user_id: request.user.userId,
        username: request.user.username,
        role: request.user.role,
        method: request.method,
        url: request.url,
      },
      "User authenticated successfully"
    );
  } catch (error: any) {
    // Manejar errores especificos de JWT

    // Token expirado
    if (error.message === "Authorization token expired") {
      logger.warn(
        {
          method: request.method,
          url: request.url,
          ip: request.ip,
        },
        "Authentication failed: Token expired"
      );

      return reply.code(401).send({
        error: "token_expired",
        message: "Token expirado. Por favor, renueva tu sesión",
        timestamp: new Date().toISOString(),
      });
    }

    // Token invalido (firma incorrecta, formato malo, etc)
    if (error.message?.includes("Authorization token invalid")) {
      logger.warn(
        {
          method: request.method,
          url: request.url,
          ip: request.ip,
          error: error.message,
        },
        "Authentication failed: Invalid token"
      );

      return reply.code(401).send({
        error: "invalid_token",
        message: "Token inválido",
        timestamp: new Date().toISOString(),
      });
    }

    // Error inesperado durante autenticacion
    logger.error(
      {
        error: error.message,
        stack: error.stack,
        method: request.method,
        url: request.url,
      },
      "Authentication failed: Unexpected error"
    );

    return reply.code(500).send({
      error: "authentication_error",
      message: "Error al verificar autenticación",
      timestamp: new Date().toISOString(),
    });
  }
}

// Middleware de autenticacion opcional
// No falla si no hay token, pero lo verifica si existe
// Util para endpoints publicos que retornan datos extra si el usuario esta autenticado
// Ejemplo: listado de productores publico pero con mas detalles si estas autenticado
// Uso: fastify.get('/api/productores', { onRequest: [optionalAuthenticate] }, handler)
export async function optionalAuthenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    // Si no hay token, continuar sin autenticar
    if (!token) {
      logger.debug(
        {
          method: request.method,
          url: request.url,
        },
        "Optional authentication: No token provided, continuing without auth"
      );
      return;
    }

    // Si hay token, verificarlo
    if (isTokenBlacklisted(token)) {
      logger.debug(
        "Optional authentication: Token blacklisted, continuing without auth"
      );
      return;
    }

    // Intentar verificar el token
    await request.jwtVerify();

    logger.debug(
      {
        user_id: request.user?.userId,
        role: request.user?.role,
      },
      "Optional authentication: User authenticated"
    );
  } catch (error) {
    // En modo opcional, ignorar errores de JWT
    // El usuario continua sin autenticar
    logger.debug(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "Optional authentication: Token invalid, continuing without auth"
    );
    // No asignar request.user, dejar undefined
  }
}
