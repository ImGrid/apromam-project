import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { AuthController } from "../controllers/auth.controller.js";
import { AuthService } from "../services/auth.service.js";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { RolRepository } from "../repositories/RolRepository.js";
import { authenticate } from "../middleware/authenticate.js";
import {
  LoginSchema,
  RegisterSchema,
  RefreshTokenSchema,
  LoginResponseSchema,
  RegisterResponseSchema,
  RefreshResponseSchema,
  MeResponseSchema,
  AuthErrorSchema,
} from "../schemas/auth.schema.js";
import { z } from "zod/v4";
/**
 * Plugin de rutas de autenticación
 * Registra todos los endpoints de auth con sus schemas y middleware
 *
 * Endpoints:
 * POST   /register - Registro de usuario
 * POST   /login - Login con credenciales
 * POST   /refresh - Renovar access token
 * POST   /logout - Cerrar sesión (requiere auth)
 * GET    /me - Info usuario autenticado (requiere auth)
 */
export default async function authRoutes(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) {
  // Inicializar dependencias
  const usuarioRepository = new UsuarioRepository();
  const rolRepository = new RolRepository();
  const authService = new AuthService(usuarioRepository, rolRepository);
  const authController = new AuthController(authService);

  /**
   * POST /auth/register
   * Registro de nuevo usuario
   */
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/register",
    {
      schema: {
        description: "Registra un nuevo usuario en el sistema",
        tags: ["auth"],
        body: RegisterSchema,
        response: {
          201: RegisterResponseSchema,
          400: AuthErrorSchema,
          409: AuthErrorSchema,
          500: AuthErrorSchema,
        },
      },
    },
    async (request, reply) => authController.register(request, reply)
  );

  /**
   * POST /auth/login
   * Login con username y password
   */
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/login",
    {
      schema: {
        description: "Autentica usuario con credenciales",
        tags: ["auth"],
        body: LoginSchema,
        response: {
          200: LoginResponseSchema,
          401: AuthErrorSchema,
          429: AuthErrorSchema,
        },
      },
    },
    async (request, reply) => authController.login(request, reply)
  );

  /**
   * POST /auth/refresh
   * Renueva access token con refresh token
   */
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/refresh",
    {
      schema: {
        description: "Renueva access token usando refresh token",
        tags: ["auth"],
        body: RefreshTokenSchema,
        response: {
          200: RefreshResponseSchema,
          401: AuthErrorSchema,
        },
      },
    },
    async (request, reply) => authController.refresh(request, reply)
  );

  /**
   * POST /auth/logout
   * Cierra sesión del usuario
   * Requiere autenticación
   */
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/logout",
    {
      onRequest: [authenticate],
      schema: {
        description: "Cierra sesión e invalida token",
        tags: ["auth"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        response: {
          204: {
            type: "null",
            description: "Logout exitoso",
          },
          401: AuthErrorSchema,
          500: AuthErrorSchema,
        },
      },
    },
    async (request, reply) => authController.logout(request, reply)
  );

  /**
   * GET /auth/me
   * Obtiene información del usuario autenticado
   * Requiere autenticación
   */
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/me",
    {
      onRequest: [authenticate],
      schema: {
        description: "Obtiene información del usuario autenticado",
        tags: ["auth"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        response: {
          200: MeResponseSchema,
          401: AuthErrorSchema,
          500: AuthErrorSchema,
        },
      },
    },
    async (request, reply) => authController.me(request, reply)
  );
}
