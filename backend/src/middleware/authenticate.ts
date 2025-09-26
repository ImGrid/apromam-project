import { FastifyRequest, FastifyReply } from "fastify";
import { createAuthLogger } from "../utils/logger.js";
import {
  isTokenBlacklisted,
  extractTokenFromHeader,
} from "../utils/jwt.utils.js";

const logger = createAuthLogger();

/**
 * Middleware de autenticación principal
 * Verifica JWT y asigna usuario a request.user
 *
 * Uso en rutas:
 * fastify.get('/protected', {
 *   onRequest: [fastify.authenticate]
 * }, handler)
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Extraer token del header Authorization
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

    // Verificar si token está en blacklist (logout)
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

    // Verificar JWT usando @fastify/jwt
    // Esto automáticamente valida firma, expiración, issuer, audience
    await request.jwtVerify();

    // request.user ya está asignado por @fastify/jwt
    // Validar que tenga los campos requeridos
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
    // Manejar errores específicos de JWT
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

    // Error inesperado
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

/**
 * Middleware de autenticación opcional
 * No falla si no hay token, pero lo verifica si existe
 *
 * Útil para endpoints públicos que retornan data extra si usuario autenticado
 *
 * Uso:
 * fastify.get('/api/productores', {
 *   onRequest: [optionalAuthenticate]
 * }, handler)
 */
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
    logger.debug(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "Optional authentication: Token invalid, continuing without auth"
    );
    // No asignar request.user, dejar undefined
  }
}
