import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { ComunidadesController } from "../controllers/comunidades.controller.js";
import { ComunidadesService } from "../services/comunidades.service.js";
import { ComunidadRepository } from "../repositories/ComunidadRepository.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRoles, requireAdmin } from "../middleware/authorize.js";
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
export default async function comunidadesRoutes(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) {
  // Inicializar dependencias
  const comunidadRepository = new ComunidadRepository();
  const comunidadesService = new ComunidadesService(comunidadRepository);
  const comunidadesController = new ComunidadesController(comunidadesService);

  /**
   * GET /api/comunidades
   * Lista todas las comunidades con filtros opcionales
   * Acceso: técnico, gerente, admin
   */
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/",
    {
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
    },
    async (request, reply) => comunidadesController.list(request, reply)
  );

  /**
   * GET /api/comunidades/:id
   * Obtiene una comunidad por ID
   * Acceso: técnico, gerente, admin
   */
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/:id",
    {
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
    },
    async (request, reply) => comunidadesController.getById(request, reply)
  );

  /**
   * POST /api/comunidades
   * Crea una nueva comunidad
   * Acceso: gerente y admin
   */
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/",
    {
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
    },
    async (request, reply) => comunidadesController.create(request, reply)
  );

  /**
   * PUT /api/comunidades/:id
   * Actualiza una comunidad existente
   * Acceso: gerente y admin
   */
  fastify.withTypeProvider<ZodTypeProvider>().put(
    "/:id",
    {
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
    },
    async (request, reply) => comunidadesController.update(request, reply)
  );

  /**
   * DELETE /api/comunidades/:id
   * Elimina (desactiva) una comunidad
   * Acceso: gerente y admin
   */
  fastify.withTypeProvider<ZodTypeProvider>().delete(
    "/:id",
    {
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
    },
    async (request, reply) => comunidadesController.delete(request, reply)
  );

  /**
   * GET /api/comunidades/especiales/sin-tecnicos
   * Lista comunidades sin técnicos asignados
   * Acceso: gerente, admin
   */
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/especiales/sin-tecnicos",
    {
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
    },
    async (request, reply) =>
      comunidadesController.listWithoutTecnicos(request, reply)
  );
}
