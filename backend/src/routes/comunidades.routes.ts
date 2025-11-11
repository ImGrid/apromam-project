import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { ComunidadesController } from "../controllers/comunidades.controller.js";
import { ComunidadesService } from "../services/comunidades.service.js";
import { ComunidadRepository } from "../repositories/ComunidadRepository.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRoles } from "../middleware/authorize.js";
import {
  CreateComunidadSchema,
  UpdateComunidadSchema,
  ComunidadParamsSchema,
  ComunidadQuerySchema,
  ComunidadesListResponseSchema,
  ComunidadResponseSchema,
  ComunidadCreatedResponseSchema,
  ComunidadErrorSchema,
} from "../schemas/comunidades.schema.js";
import { z } from "zod";

/**
 * Plugin de rutas de comunidades
 * Gestión de comunidades con control de acceso por rol
 */
const comunidadesRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  // Inicializar dependencias
  const comunidadRepository = new ComunidadRepository();
  const comunidadesService = new ComunidadesService(comunidadRepository);
  const comunidadesController = new ComunidadesController(comunidadesService);

  /**
   * GET /api/comunidades
   * Lista todas las comunidades con filtros opcionales
   * Acceso: técnico, gerente, admin
   */
  fastify.route({
    method: "GET",
    url: "/",
    onRequest: [
      authenticate,
      requireRoles("tecnico", "gerente", "administrador"),
    ],
    schema: {
      description: "Lista todas las comunidades con filtros opcionales",
      tags: ["comunidades"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      querystring: ComunidadQuerySchema,
      response: {
        200: ComunidadesListResponseSchema,
        401: ComunidadErrorSchema,
        403: ComunidadErrorSchema,
        500: ComunidadErrorSchema,
      },
    },
    handler: comunidadesController.list.bind(comunidadesController) as any,
  });

  /**
   * GET /api/comunidades/:id
   * Obtiene una comunidad por ID
   * Acceso: técnico, gerente, admin
   */
  fastify.route({
    method: "GET",
    url: "/:id",
    onRequest: [
      authenticate,
      requireRoles("tecnico", "gerente", "administrador"),
    ],
    schema: {
      description: "Obtiene una comunidad por ID",
      tags: ["comunidades"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: ComunidadParamsSchema,
      response: {
        200: z.object({ comunidad: ComunidadResponseSchema }),
        401: ComunidadErrorSchema,
        403: ComunidadErrorSchema,
        404: ComunidadErrorSchema,
        500: ComunidadErrorSchema,
      },
    },
    handler: comunidadesController.getById.bind(comunidadesController) as any,
  });

  /**
   * POST /api/comunidades
   * Crea una nueva comunidad
   * Acceso: gerente y admin
   */
  fastify.route({
    method: "POST",
    url: "/",
    onRequest: [authenticate, requireRoles("gerente", "administrador")],
    schema: {
      description: "Crea una nueva comunidad",
      tags: ["comunidades"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      body: CreateComunidadSchema,
      response: {
        201: ComunidadCreatedResponseSchema,
        400: ComunidadErrorSchema,
        401: ComunidadErrorSchema,
        403: ComunidadErrorSchema,
        409: ComunidadErrorSchema,
        500: ComunidadErrorSchema,
      },
    },
    handler: comunidadesController.create.bind(comunidadesController) as any,
  });

  /**
   * PUT /api/comunidades/:id
   * Actualiza una comunidad existente
   * Acceso: gerente y admin
   */
  fastify.route({
    method: "PUT",
    url: "/:id",
    onRequest: [authenticate, requireRoles("gerente", "administrador")],
    schema: {
      description: "Actualiza una comunidad existente",
      tags: ["comunidades"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: ComunidadParamsSchema,
      body: UpdateComunidadSchema,
      response: {
        200: ComunidadCreatedResponseSchema,
        401: ComunidadErrorSchema,
        403: ComunidadErrorSchema,
        404: ComunidadErrorSchema,
        500: ComunidadErrorSchema,
      },
    },
    handler: comunidadesController.update.bind(comunidadesController) as any,
  });

  /**
   * DELETE /api/comunidades/:id
   * Elimina (desactiva) una comunidad
   * Acceso: gerente y admin
   */
  fastify.route({
    method: "DELETE",
    url: "/:id",
    onRequest: [authenticate, requireRoles("gerente", "administrador")],
    schema: {
      description: "Elimina (desactiva) una comunidad",
      tags: ["comunidades"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: ComunidadParamsSchema,
      response: {
        204: {
          type: "null",
          description: "Comunidad eliminada exitosamente",
        },
        401: ComunidadErrorSchema,
        403: ComunidadErrorSchema,
        404: ComunidadErrorSchema,
        409: ComunidadErrorSchema,
        500: ComunidadErrorSchema,
      },
    },
    handler: comunidadesController.delete.bind(comunidadesController) as any,
  });

  /**
   * DELETE /api/comunidades/:id/permanent
   * Elimina PERMANENTEMENTE una comunidad
   * Verifica que no tenga usuarios ni productores asociados
   * Acceso: admin
   */
  fastify.route({
    method: "DELETE",
    url: "/:id/permanent",
    onRequest: [authenticate, requireRoles("administrador")],
    schema: {
      description: "Elimina permanentemente una comunidad (hard delete)",
      tags: ["comunidades"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: ComunidadParamsSchema,
      response: {
        204: {
          type: "null",
          description: "Comunidad eliminada permanentemente",
        },
        401: ComunidadErrorSchema,
        403: ComunidadErrorSchema,
        404: ComunidadErrorSchema,
        409: ComunidadErrorSchema,
        500: ComunidadErrorSchema,
      },
    },
    handler: comunidadesController.hardDelete.bind(comunidadesController) as any,
  });

  /**
   * GET /api/comunidades/especiales/sin-tecnicos
   * Lista comunidades sin técnicos asignados
   * Acceso: gerente, admin
   */
  fastify.route({
    method: "GET",
    url: "/especiales/sin-tecnicos",
    onRequest: [authenticate, requireRoles("gerente", "administrador")],
    schema: {
      description: "Lista comunidades sin técnicos asignados",
      tags: ["comunidades"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      response: {
        200: ComunidadesListResponseSchema,
        401: ComunidadErrorSchema,
        403: ComunidadErrorSchema,
        500: ComunidadErrorSchema,
      },
    },
    handler: comunidadesController.listWithoutTecnicos.bind(comunidadesController) as any,
  });
};

export default comunidadesRoutes;
