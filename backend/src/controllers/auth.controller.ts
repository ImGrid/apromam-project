import { FastifyRequest, FastifyReply } from "fastify";
import { AuthService } from "../services/auth.service.js";
import { extractTokenFromHeader } from "../utils/jwt.utils.js";
import { createAuthLogger } from "../utils/logger.js";
import type {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
} from "../schemas/auth.schema.js";

const logger = createAuthLogger();

/**
 * Controlador de autenticación
 * Maneja HTTP requests/responses para operaciones de auth
 */
export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  /**
   * POST /api/auth/register
   * Registra un nuevo usuario
   */
  async register(
    request: FastifyRequest<{ Body: RegisterInput }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const result = await this.authService.register(request.body);

      logger.info(
        {
          user_id: result.user.id_usuario,
          username: result.user.username,
          ip: request.ip,
        },
        "User registered via API"
      );

      return reply.code(201).send({
        user: result.user,
        tokens: {
          access_token: result.tokens.accessToken,
          refresh_token: result.tokens.refreshToken,
          token_type: "Bearer" as const,
          expires_in: result.tokens.expiresIn,
        },
        message: "Usuario registrado exitosamente",
      });
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : "Unknown error",
          username: request.body.username,
          ip: request.ip,
        },
        "Registration failed"
      );

      // Errores específicos con códigos HTTP apropiados
      const errorMessage =
        error instanceof Error ? error.message : "Error al registrar usuario";

      if (
        errorMessage.includes("ya existe") ||
        errorMessage.includes("Username") ||
        errorMessage.includes("Email")
      ) {
        return reply.code(409).send({
          error: "conflict",
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
      }

      if (
        errorMessage.includes("Password") ||
        errorMessage.includes("comunidad")
      ) {
        return reply.code(400).send({
          error: "validation_error",
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
      }

      return reply.code(500).send({
        error: "internal_error",
        message: "Error al registrar usuario",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * POST /api/auth/login
   * Autentica usuario con credenciales
   */
  async login(
    request: FastifyRequest<{ Body: LoginInput }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const result = await this.authService.login(request.body);

      logger.info(
        {
          user_id: result.user.id_usuario,
          username: result.user.username,
          role: result.user.nombre_rol,
          ip: request.ip,
        },
        "User logged in via API"
      );

      return reply.code(200).send({
        user: result.user,
        tokens: {
          access_token: result.tokens.accessToken,
          refresh_token: result.tokens.refreshToken,
          token_type: "Bearer" as const,
          expires_in: result.tokens.expiresIn,
        },
      });
    } catch (error) {
      logger.warn(
        {
          error: error instanceof Error ? error.message : "Unknown error",
          username: request.body.username,
          ip: request.ip,
        },
        "Login failed"
      );

      const errorMessage =
        error instanceof Error ? error.message : "Error al iniciar sesión";

      // Rate limit error
      if (errorMessage.includes("Demasiados intentos")) {
        return reply.code(429).send({
          error: "too_many_requests",
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
      }

      // Invalid credentials o usuario inactivo
      return reply.code(401).send({
        error: "unauthorized",
        message: errorMessage,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * POST /api/auth/refresh
   * Renueva access token con refresh token
   */
  async refresh(
    request: FastifyRequest<{ Body: RefreshTokenInput }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const result = await this.authService.refresh(request.body);

      logger.debug(
        {
          ip: request.ip,
        },
        "Token refreshed via API"
      );

      return reply.code(200).send({
        access_token: result.accessToken,
        token_type: "Bearer" as const,
        expires_in: result.expiresIn,
      });
    } catch (error) {
      logger.warn(
        {
          error: error instanceof Error ? error.message : "Unknown error",
          ip: request.ip,
        },
        "Token refresh failed"
      );

      return reply.code(401).send({
        error: "invalid_refresh_token",
        message: "Refresh token inválido o expirado",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * POST /api/auth/logout
   * Cierra sesión (invalida token)
   * Requiere autenticación
   */
  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // Extraer token del header
      const authHeader = request.headers.authorization;
      const token = extractTokenFromHeader(authHeader);

      if (!token) {
        return reply.code(401).send({
          error: "unauthorized",
          message: "Token requerido para logout",
          timestamp: new Date().toISOString(),
        });
      }

      await this.authService.logout(token);

      logger.info(
        {
          user_id: request.user?.userId,
          username: request.user?.username,
          ip: request.ip,
        },
        "User logged out via API"
      );

      return reply.code(204).send();
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : "Unknown error",
          user_id: request.user?.userId,
          ip: request.ip,
        },
        "Logout failed"
      );

      return reply.code(500).send({
        error: "internal_error",
        message: "Error al cerrar sesión",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * GET /api/auth/me
   * Obtiene información del usuario autenticado
   * Requiere autenticación
   */
  async me(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // Usuario viene de authenticate middleware
      if (!request.user?.userId) {
        return reply.code(401).send({
          error: "unauthorized",
          message: "Autenticación requerida",
          timestamp: new Date().toISOString(),
        });
      }

      const result = await this.authService.me(request.user.userId);

      logger.debug(
        {
          user_id: result.user.id_usuario,
        },
        "User info retrieved via API"
      );

      return reply.code(200).send({
        user: result.user,
        permisos: result.permisos,
      });
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : "Unknown error",
          user_id: request.user?.userId,
        },
        "Failed to retrieve user info"
      );

      return reply.code(500).send({
        error: "internal_error",
        message: "Error al obtener información del usuario",
        timestamp: new Date().toISOString(),
      });
    }
  }
}
