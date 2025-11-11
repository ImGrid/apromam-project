import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
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
import { z } from "zod";

// Plugin de rutas de usuarios
// Gerente puede crear tecnicos y productores, NO administradores ni gerentes
// Admin puede crear cualquier rol
const usuariosRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  // Inicializar dependencias
  const usuarioRepository = new UsuarioRepository();
  const rolRepository = new RolRepository();
  const usuariosService = new UsuariosService(usuarioRepository, rolRepository);
  const usuariosController = new UsuariosController(usuariosService);

  // GET /api/usuarios
  // Lista todos los usuarios
  // Acceso: gerente, admin
  fastify.route({
    method: "GET",
    url: "/",
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
    handler: usuariosController.list.bind(usuariosController) as any,
  });

  // GET /api/usuarios/:id
  // Obtiene un usuario por ID
  // Acceso: gerente, admin
  fastify.route({
    method: "GET",
    url: "/:id",
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
    handler: usuariosController.getById.bind(usuariosController) as any,
  });

  // POST /api/usuarios
  // Crea un nuevo usuario
  // Gerente: tecnicos y productores, NO administradores ni gerentes
  // Admin: cualquier rol
  fastify.route({
    method: "POST",
    url: "/",
    onRequest: [authenticate, requireRoles("gerente", "administrador")],
    schema: {
      description:
        "Crea un nuevo usuario (gerente: técnicos y productores, no admin/gerente)",
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
    handler: usuariosController.create.bind(usuariosController) as any,
  });

  // PUT /api/usuarios/:id
  // Actualiza un usuario existente
  // Acceso: gerente, admin
  fastify.route({
    method: "PUT",
    url: "/:id",
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
    handler: usuariosController.update.bind(usuariosController) as any,
  });

  // DELETE /api/usuarios/:id
  // Elimina (desactiva) un usuario
  // Acceso: gerente, admin
  fastify.route({
    method: "DELETE",
    url: "/:id",
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
    handler: usuariosController.delete.bind(usuariosController) as any,
  });

  // GET /api/usuarios/comunidad/:id
  // Lista usuarios de una comunidad
  // Acceso: gerente, admin
  fastify.route({
    method: "GET",
    url: "/comunidad/:id",
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
    handler: usuariosController.listByComunidad.bind(usuariosController) as any,
  });

  // GET /api/usuarios/roles
  // Lista todos los roles disponibles del sistema
  // Acceso: gerente, admin
  fastify.route({
    method: "GET",
    url: "/roles",
    onRequest: [authenticate, requireRoles("gerente", "administrador")],
    schema: {
      description:
        "Lista todos los roles disponibles para asignar a usuarios",
      tags: ["usuarios"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      response: {
        200: z.object({
          roles: z.array(
            z.object({
              id_rol: z.string().uuid(),
              nombre_rol: z.string(),
            })
          ),
        }),
        401: UsuarioErrorSchema,
        403: UsuarioErrorSchema,
        500: UsuarioErrorSchema,
      },
    },
    handler: usuariosController.listRoles.bind(usuariosController) as any,
  });
};

export default usuariosRoutes;
