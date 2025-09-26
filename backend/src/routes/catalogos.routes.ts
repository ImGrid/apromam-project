import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { CatalogosController } from "../controllers/catalogos.controller.js";
import { CatalogosService } from "../services/catalogos.service.js";
import { TipoCultivoRepository } from "../repositories/TipoCultivoRepository.js";
import { GestionRepository } from "../repositories/GestionRepository.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/authorize.js";
import {
  CreateTipoCultivoSchema,
  UpdateTipoCultivoSchema,
  CreateGestionSchema,
  UpdateGestionSchema,
  CatalogoParamsSchema,
  CatalogoQuerySchema,
  TiposCultivoListResponseSchema,
  TipoCultivoResponseSchema,
  GestionesListResponseSchema,
  GestionResponseSchema,
  CatalogoErrorSchema,
} from "../schemas/catalogos.schema.js";
import { z } from "zod/v4";

/**
 * Plugin de rutas de catálogos
 * Gestión de tipos cultivo y gestiones
 */
export default async function catalogosRoutes(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) {
  // Inicializar dependencias
  const tipoCultivoRepository = new TipoCultivoRepository();
  const gestionRepository = new GestionRepository();
  const catalogosService = new CatalogosService(
    tipoCultivoRepository,
    gestionRepository
  );
  const catalogosController = new CatalogosController(catalogosService);

  // ==========================================
  // RUTAS TIPOS CULTIVO
  // ==========================================

  /**
   * GET /api/catalogos/tipos-cultivo
   * Lista todos los tipos de cultivo
   * Acceso: todos los roles autenticados
   */
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/tipos-cultivo",
    {
      onRequest: [authenticate],
      schema: {
        description: "Lista todos los tipos de cultivo",
        tags: ["catalogos"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        querystring: CatalogoQuerySchema,
        response: {
          200: TiposCultivoListResponseSchema,
          401: CatalogoErrorSchema,
          500: CatalogoErrorSchema,
        },
      },
    },
    async (request, reply) =>
      catalogosController.listTiposCultivo(request, reply)
  );

  /**
   * GET /api/catalogos/tipos-cultivo/:id
   * Obtiene un tipo cultivo por ID
   * Acceso: todos los roles autenticados
   */
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/tipos-cultivo/:id",
    {
      onRequest: [authenticate],
      schema: {
        description: "Obtiene un tipo cultivo por ID",
        tags: ["catalogos"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: CatalogoParamsSchema,
        response: {
          200: z.object({ tipo_cultivo: TipoCultivoResponseSchema }),
          401: CatalogoErrorSchema,
          404: CatalogoErrorSchema,
          500: CatalogoErrorSchema,
        },
      },
    },
    async (request, reply) =>
      catalogosController.getTipoCultivoById(request, reply)
  );

  /**
   * POST /api/catalogos/tipos-cultivo
   * Crea un nuevo tipo cultivo
   * Acceso: solo admin
   */
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/tipos-cultivo",
    {
      onRequest: [authenticate, requireAdmin],
      schema: {
        description: "Crea un nuevo tipo cultivo",
        tags: ["catalogos"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        body: CreateTipoCultivoSchema,
        response: {
          201: z.object({
            tipo_cultivo: TipoCultivoResponseSchema,
            message: z.string(),
          }),
          401: CatalogoErrorSchema,
          403: CatalogoErrorSchema,
          409: CatalogoErrorSchema,
          500: CatalogoErrorSchema,
        },
      },
    },
    async (request, reply) =>
      catalogosController.createTipoCultivo(request, reply)
  );

  /**
   * PUT /api/catalogos/tipos-cultivo/:id
   * Actualiza un tipo cultivo existente
   * Acceso: solo admin
   */
  fastify.withTypeProvider<ZodTypeProvider>().put(
    "/tipos-cultivo/:id",
    {
      onRequest: [authenticate, requireAdmin],
      schema: {
        description: "Actualiza un tipo cultivo existente",
        tags: ["catalogos"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: CatalogoParamsSchema,
        body: UpdateTipoCultivoSchema,
        response: {
          200: z.object({
            tipo_cultivo: TipoCultivoResponseSchema,
            message: z.string(),
          }),
          401: CatalogoErrorSchema,
          403: CatalogoErrorSchema,
          404: CatalogoErrorSchema,
          500: CatalogoErrorSchema,
        },
      },
    },
    async (request, reply) =>
      catalogosController.updateTipoCultivo(request, reply)
  );

  /**
   * DELETE /api/catalogos/tipos-cultivo/:id
   * Elimina (desactiva) un tipo cultivo
   * Acceso: solo admin
   */
  fastify.withTypeProvider<ZodTypeProvider>().delete(
    "/tipos-cultivo/:id",
    {
      onRequest: [authenticate, requireAdmin],
      schema: {
        description: "Elimina (desactiva) un tipo cultivo",
        tags: ["catalogos"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: CatalogoParamsSchema,
        response: {
          204: {
            type: "null",
            description: "Tipo cultivo eliminado exitosamente",
          },
          401: CatalogoErrorSchema,
          403: CatalogoErrorSchema,
          404: CatalogoErrorSchema,
          500: CatalogoErrorSchema,
        },
      },
    },
    async (request, reply) =>
      catalogosController.deleteTipoCultivo(request, reply)
  );

  // ==========================================
  // RUTAS GESTIONES
  // ==========================================

  /**
   * GET /api/catalogos/gestiones
   * Lista todas las gestiones
   * Acceso: todos los roles autenticados
   */
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/gestiones",
    {
      onRequest: [authenticate],
      schema: {
        description: "Lista todas las gestiones",
        tags: ["catalogos"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        querystring: CatalogoQuerySchema,
        response: {
          200: GestionesListResponseSchema,
          401: CatalogoErrorSchema,
          500: CatalogoErrorSchema,
        },
      },
    },
    async (request, reply) => catalogosController.listGestiones(request, reply)
  );

  /**
   * GET /api/catalogos/gestiones/actual
   * Obtiene la gestión actual (año actual)
   * Acceso: todos los roles autenticados
   */
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/gestiones/actual",
    {
      onRequest: [authenticate],
      schema: {
        description: "Obtiene la gestión actual (año actual)",
        tags: ["catalogos"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        response: {
          200: z.object({ gestion: GestionResponseSchema }),
          401: CatalogoErrorSchema,
          404: CatalogoErrorSchema,
          500: CatalogoErrorSchema,
        },
      },
    },
    async (request, reply) =>
      catalogosController.getGestionActual(request, reply)
  );

  /**
   * GET /api/catalogos/gestiones/:id
   * Obtiene una gestión por ID
   * Acceso: todos los roles autenticados
   */
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/gestiones/:id",
    {
      onRequest: [authenticate],
      schema: {
        description: "Obtiene una gestión por ID",
        tags: ["catalogos"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: CatalogoParamsSchema,
        response: {
          200: z.object({ gestion: GestionResponseSchema }),
          401: CatalogoErrorSchema,
          404: CatalogoErrorSchema,
          500: CatalogoErrorSchema,
        },
      },
    },
    async (request, reply) => catalogosController.getGestionById(request, reply)
  );

  /**
   * POST /api/catalogos/gestiones
   * Crea una nueva gestión
   * Acceso: solo admin
   */
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/gestiones",
    {
      onRequest: [authenticate, requireAdmin],
      schema: {
        description: "Crea una nueva gestión",
        tags: ["catalogos"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        body: CreateGestionSchema,
        response: {
          201: z.object({
            gestion: GestionResponseSchema,
            message: z.string(),
          }),
          401: CatalogoErrorSchema,
          403: CatalogoErrorSchema,
          409: CatalogoErrorSchema,
          500: CatalogoErrorSchema,
        },
      },
    },
    async (request, reply) => catalogosController.createGestion(request, reply)
  );

  /**
   * PUT /api/catalogos/gestiones/:id
   * Actualiza una gestión existente
   * Acceso: solo admin
   */
  fastify.withTypeProvider<ZodTypeProvider>().put(
    "/gestiones/:id",
    {
      onRequest: [authenticate, requireAdmin],
      schema: {
        description: "Actualiza una gestión existente",
        tags: ["catalogos"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: CatalogoParamsSchema,
        body: UpdateGestionSchema,
        response: {
          200: z.object({
            gestion: GestionResponseSchema,
            message: z.string(),
          }),
          401: CatalogoErrorSchema,
          403: CatalogoErrorSchema,
          404: CatalogoErrorSchema,
          500: CatalogoErrorSchema,
        },
      },
    },
    async (request, reply) => catalogosController.updateGestion(request, reply)
  );

  /**
   * DELETE /api/catalogos/gestiones/:id
   * Elimina (desactiva) una gestión
   * Acceso: solo admin
   */
  fastify.withTypeProvider<ZodTypeProvider>().delete(
    "/gestiones/:id",
    {
      onRequest: [authenticate, requireAdmin],
      schema: {
        description: "Elimina (desactiva) una gestión",
        tags: ["catalogos"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: CatalogoParamsSchema,
        response: {
          204: {
            type: "null",
            description: "Gestión eliminada exitosamente",
          },
          401: CatalogoErrorSchema,
          403: CatalogoErrorSchema,
          404: CatalogoErrorSchema,
          500: CatalogoErrorSchema,
        },
      },
    },
    async (request, reply) => catalogosController.deleteGestion(request, reply)
  );
}
