import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { ParcelasController } from "../controllers/parcelas.controller.js";
import { ParcelasService } from "../services/parcelas.service.js";
import { ParcelaRepository } from "../repositories/ParcelaRepository.js";
import { ProductorRepository } from "../repositories/ProductorRepository.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRoles, requireAdmin } from "../middleware/authorize.js";
import {
  CreateParcelaSchema,
  UpdateParcelaSchema,
  ParcelaParamsSchema,
  ProductorParcelaParamsSchema,
  ProximitySearchParcelaSchema,
  ParcelasListResponseSchema,
  ParcelaResponseSchema,
  ParcelasEstadisticasSchema,
  ParcelaErrorSchema,
} from "../schemas/parcelas.schema.js";
import { z } from "zod";

/**
 * Plugin de rutas de parcelas
 * Gestión de parcelas con PostGIS y control de acceso
 */
export default async function parcelasRoutes(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) {
  // Inicializar dependencias
  const parcelaRepository = new ParcelaRepository();
  const productorRepository = new ProductorRepository();
  const parcelasService = new ParcelasService(
    parcelaRepository,
    productorRepository
  );
  const parcelasController = new ParcelasController(parcelasService);

  // ==========================================
  // RUTAS DE PARCELAS POR PRODUCTOR
  // ==========================================

  /**
   * GET /api/productores/:codigo/parcelas
   * Lista todas las parcelas de un productor
   * Técnico: solo si es de su comunidad
   * Gerente/Admin: cualquier productor
   */
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/productores/:codigo/parcelas",
    {
      onRequest: [
        authenticate,
        requireRoles("tecnico", "gerente", "administrador"),
      ],
      schema: {
        description: "Lista todas las parcelas de un productor",
        tags: ["parcelas"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: ProductorParcelaParamsSchema,
        response: {
          200: ParcelasListResponseSchema,
          401: ParcelaErrorSchema,
          403: ParcelaErrorSchema,
          404: ParcelaErrorSchema,
          500: ParcelaErrorSchema,
        },
      },
    },
    async (request, reply) => parcelasController.listByProductor(request, reply)
  );

  /**
   * POST /api/productores/:codigo/parcelas
   * Crea una nueva parcela para un productor
   * Técnico: solo para productores de su comunidad
   * Admin: para cualquier productor
   */
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/productores/:codigo/parcelas",
    {
      onRequest: [authenticate, requireRoles("tecnico", "administrador")],
      schema: {
        description: "Crea una nueva parcela para un productor",
        tags: ["parcelas"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: ProductorParcelaParamsSchema,
        body: CreateParcelaSchema.omit({ codigo_productor: true }),
        response: {
          201: z.object({
            parcela: ParcelaResponseSchema,
            message: z.string(),
          }),
          401: ParcelaErrorSchema,
          403: ParcelaErrorSchema,
          404: ParcelaErrorSchema,
          409: ParcelaErrorSchema,
          500: ParcelaErrorSchema,
        },
      },
    },
    async (request, reply) => parcelasController.create(request, reply)
  );

  // ==========================================
  // RUTAS DE PARCELAS INDIVIDUALES
  // ==========================================

  /**
   * GET /api/parcelas/:id
   * Obtiene una parcela por ID
   * Técnico: solo si el productor es de su comunidad
   * Gerente/Admin: cualquier parcela
   */
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/parcelas/:id",
    {
      onRequest: [
        authenticate,
        requireRoles("tecnico", "gerente", "administrador"),
      ],
      schema: {
        description: "Obtiene una parcela por ID",
        tags: ["parcelas"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: ParcelaParamsSchema,
        response: {
          200: z.object({ parcela: ParcelaResponseSchema }),
          401: ParcelaErrorSchema,
          403: ParcelaErrorSchema,
          404: ParcelaErrorSchema,
          500: ParcelaErrorSchema,
        },
      },
    },
    async (request, reply) => parcelasController.getById(request, reply)
  );

  /**
   * PUT /api/parcelas/:id
   * Actualiza una parcela existente
   * Técnico: solo de su comunidad
   * Admin: cualquier parcela
   */
  fastify.withTypeProvider<ZodTypeProvider>().put(
    "/parcelas/:id",
    {
      onRequest: [authenticate, requireRoles("tecnico", "administrador")],
      schema: {
        description: "Actualiza una parcela existente",
        tags: ["parcelas"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: ParcelaParamsSchema,
        body: UpdateParcelaSchema,
        response: {
          200: z.object({
            parcela: ParcelaResponseSchema,
            message: z.string(),
          }),
          401: ParcelaErrorSchema,
          403: ParcelaErrorSchema,
          404: ParcelaErrorSchema,
          500: ParcelaErrorSchema,
        },
      },
    },
    async (request, reply) => parcelasController.update(request, reply)
  );

  /**
   * DELETE /api/parcelas/:id
   * Elimina (desactiva) una parcela
   * Solo admin puede eliminar
   */
  fastify.withTypeProvider<ZodTypeProvider>().delete(
    "/parcelas/:id",
    {
      onRequest: [authenticate, requireAdmin],
      schema: {
        description: "Elimina (desactiva) una parcela",
        tags: ["parcelas"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: ParcelaParamsSchema,
        response: {
          204: {
            type: "null",
            description: "Parcela eliminada exitosamente",
          },
          401: ParcelaErrorSchema,
          403: ParcelaErrorSchema,
          404: ParcelaErrorSchema,
          500: ParcelaErrorSchema,
        },
      },
    },
    async (request, reply) => parcelasController.delete(request, reply)
  );

  // ==========================================
  // RUTAS DE BÚSQUEDA Y ESTADÍSTICAS
  // ==========================================

  /**
   * POST /api/parcelas/nearby
   * Busca parcelas cercanas a una ubicación GPS
   * Técnico: solo de su comunidad
   * Gerente/Admin: de todas las comunidades
   */
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/parcelas/nearby",
    {
      onRequest: [
        authenticate,
        requireRoles("tecnico", "gerente", "administrador"),
      ],
      schema: {
        description: "Busca parcelas cercanas a una ubicación GPS",
        tags: ["parcelas"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        body: ProximitySearchParcelaSchema,
        response: {
          200: ParcelasListResponseSchema,
          401: ParcelaErrorSchema,
          403: ParcelaErrorSchema,
          500: ParcelaErrorSchema,
        },
      },
    },
    async (request, reply) => parcelasController.searchNearby(request, reply)
  );

  /**
   * GET /api/parcelas/estadisticas
   * Obtiene estadísticas de parcelas
   * Técnico: solo su comunidad
   * Gerente/Admin: estadísticas globales
   */
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/parcelas/estadisticas",
    {
      onRequest: [
        authenticate,
        requireRoles("tecnico", "gerente", "administrador"),
      ],
      schema: {
        description: "Obtiene estadísticas de parcelas",
        tags: ["parcelas"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        response: {
          200: ParcelasEstadisticasSchema,
          401: ParcelaErrorSchema,
          403: ParcelaErrorSchema,
          500: ParcelaErrorSchema,
        },
      },
    },
    async (request, reply) => parcelasController.getEstadisticas(request, reply)
  );

  /**
   * GET /api/parcelas/sin-coordenadas
   * Lista parcelas sin coordenadas GPS
   * Útil para alertas y seguimiento
   * Técnico: solo su comunidad
   * Gerente/Admin: todas
   */
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/parcelas/sin-coordenadas",
    {
      onRequest: [
        authenticate,
        requireRoles("tecnico", "gerente", "administrador"),
      ],
      schema: {
        description: "Lista parcelas sin coordenadas GPS",
        tags: ["parcelas"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        response: {
          200: ParcelasListResponseSchema,
          401: ParcelaErrorSchema,
          403: ParcelaErrorSchema,
          500: ParcelaErrorSchema,
        },
      },
    },
    async (request, reply) =>
      parcelasController.listSinCoordenadas(request, reply)
  );
}
