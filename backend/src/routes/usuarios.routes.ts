import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { UsuariosController } from "../controllers/usuarios.controller.js";
import { UsuariosService } from "../services/usuarios.service.js";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { RolRepository } from "../repositories/RolRepository.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRoles } from "../middleware/authorize.js";
import {
  CreateUsuarioSchema,
  UpdateUsuarioSchema,
  UsuarioParamsSchema,
  UsuarioQuerySchema,
  UsuariosListResponseSchema,
  UsuarioResponseSchema,
  UsuarioErrorSchema,
} from "../schemas/usuarios.schema.js";
import { z } from "zod/v4";

// Plugin de rutas de usuarios
// Gerente puede crear tecnicos
// Admin puede crear cualquier rol
export default async function usuariosRoutes(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) {
  // Inicializar dependencias
  const usuarioRepository = new UsuarioRepository();
  const rolRepository = new RolRepository();
  const usuariosService = new UsuariosService(usuarioRepository, rolRepository);
  const usuariosController = new UsuariosController(usuariosService);

  // GET /api/usuarios
  // Lista todos los usuarios
  // Acceso: gerente, admin
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/",
    {
      onRequest: [authenticate, requireRoles("gerente", "administrador")],
      schema: {
        description: "Lista todos los usuarios con filtros opcionales",
        tags: ["usuarios"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        querystring: UsuarioQuerySchema,
        response: {
          200: UsuariosListResponseSchema,
          401: UsuarioErrorSchema,
          403: UsuarioErrorSchema,
          500: UsuarioErrorSchema,
        },
      },
    },
    async (request, reply) => usuariosController.list(request, reply)
  );

  // GET /api/usuarios/:id
  // Obtiene un usuario por ID
  // Acceso: gerente, admin
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/:id",
    {
      onRequest: [authenticate, requireRoles("gerente", "administrador")],
      schema: {
        description: "Obtiene un usuario por ID",
        tags: ["usuarios"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: UsuarioParamsSchema,
        response: {
          200: z.object({ usuario: UsuarioResponseSchema }),
          401: UsuarioErrorSchema,
          403: UsuarioErrorSchema,
          404: UsuarioErrorSchema,
          500: UsuarioErrorSchema,
        },
      },
    },
    async (request, reply) => usuariosController.getById(request, reply)
  );

  // POST /api/usuarios
  // Crea un nuevo usuario
  // Gerente: solo tecnicos
  // Admin: cualquier rol
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/",
    {
      onRequest: [authenticate, requireRoles("gerente", "administrador")],
      schema: {
        description: "Crea un nuevo usuario (gerente: solo técnicos)",
        tags: ["usuarios"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        body: CreateUsuarioSchema,
        response: {
          201: z.object({
            usuario: UsuarioResponseSchema,
            message: z.string(),
          }),
          400: UsuarioErrorSchema,
          401: UsuarioErrorSchema,
          403: UsuarioErrorSchema,
          404: UsuarioErrorSchema,
          409: UsuarioErrorSchema,
          500: UsuarioErrorSchema,
        },
      },
    },
    async (request, reply) => usuariosController.create(request, reply)
  );

  // PUT /api/usuarios/:id
  // Actualiza un usuario existente
  // Acceso: gerente, admin
  fastify.withTypeProvider<ZodTypeProvider>().put(
    "/:id",
    {
      onRequest: [authenticate, requireRoles("gerente", "administrador")],
      schema: {
        description: "Actualiza un usuario existente",
        tags: ["usuarios"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: UsuarioParamsSchema,
        body: UpdateUsuarioSchema,
        response: {
          200: z.object({
            usuario: UsuarioResponseSchema,
            message: z.string(),
          }),
          401: UsuarioErrorSchema,
          403: UsuarioErrorSchema,
          404: UsuarioErrorSchema,
          500: UsuarioErrorSchema,
        },
      },
    },
    async (request, reply) => usuariosController.update(request, reply)
  );

  // DELETE /api/usuarios/:id
  // Elimina (desactiva) un usuario
  // Acceso: gerente, admin
  fastify.withTypeProvider<ZodTypeProvider>().delete(
    "/:id",
    {
      onRequest: [authenticate, requireRoles("gerente", "administrador")],
      schema: {
        description: "Elimina (desactiva) un usuario",
        tags: ["usuarios"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: UsuarioParamsSchema,
        response: {
          204: {
            type: "null",
            description: "Usuario eliminado exitosamente",
          },
          401: UsuarioErrorSchema,
          403: UsuarioErrorSchema,
          404: UsuarioErrorSchema,
          500: UsuarioErrorSchema,
        },
      },
    },
    async (request, reply) => usuariosController.delete(request, reply)
  );

  // GET /api/usuarios/comunidad/:id
  // Lista usuarios de una comunidad
  // Acceso: gerente, admin
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/comunidad/:id",
    {
      onRequest: [authenticate, requireRoles("gerente", "administrador")],
      schema: {
        description: "Lista usuarios de una comunidad específica",
        tags: ["usuarios"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          200: UsuariosListResponseSchema,
          401: UsuarioErrorSchema,
          403: UsuarioErrorSchema,
          500: UsuarioErrorSchema,
        },
      },
    },
    async (request, reply) => usuariosController.listByComunidad(request, reply)
  );
}
