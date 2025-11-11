import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
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
const parcelasRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
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
  fastify.route({
    method: "GET",
    url: "/productores/:codigo/parcelas",
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
    handler: parcelasController.listByProductor.bind(parcelasController) as any,
  });

  /**
   * POST /api/productores/:codigo/parcelas
   * Crea una nueva parcela para un productor
   * Técnico: solo para productores de su comunidad
   * Gerente: para cualquier productor
   * Admin: para cualquier productor
   */
  fastify.route({
    method: "POST",
    url: "/productores/:codigo/parcelas",
    onRequest: [authenticate, requireRoles("tecnico", "gerente", "administrador")],
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
    handler: parcelasController.create.bind(parcelasController) as any,
  });

  // ==========================================
  // RUTAS DE PARCELAS INDIVIDUALES
  // ==========================================

  /**
   * GET /api/parcelas/:id
   * Obtiene una parcela por ID
   * Técnico: solo si el productor es de su comunidad
   * Gerente/Admin: cualquier parcela
   */
  fastify.route({
    method: "GET",
    url: "/parcelas/:id",
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
    handler: parcelasController.getById.bind(parcelasController) as any,
  });

  /**
   * PUT /api/parcelas/:id
   * Actualiza una parcela existente
   * Técnico: solo de su comunidad
   * Admin: cualquier parcela
   */
  fastify.route({
    method: "PUT",
    url: "/parcelas/:id",
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
    handler: parcelasController.update.bind(parcelasController) as any,
  });

  /**
   * DELETE /api/parcelas/:id
   * Elimina (desactiva) una parcela
   * Solo admin puede eliminar
   */
  fastify.route({
    method: "DELETE",
    url: "/parcelas/:id",
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
    handler: parcelasController.delete.bind(parcelasController) as any,
  });

  // ==========================================
  // RUTAS DE BÚSQUEDA Y ESTADÍSTICAS
  // ==========================================

  /**
   * GET /api/parcelas/estadisticas
   * Obtiene estadísticas de parcelas
   * Técnico: solo su comunidad
   * Gerente/Admin: estadísticas globales
   */
  fastify.route({
    method: "GET",
    url: "/parcelas/estadisticas",
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
    handler: parcelasController.getEstadisticas.bind(parcelasController) as any,
  });

  /**
   * GET /api/parcelas/sin-coordenadas
   * Lista parcelas sin coordenadas GPS
   * Útil para alertas y seguimiento
   * Técnico: solo su comunidad
   * Gerente/Admin: todas
   */
  fastify.route({
    method: "GET",
    url: "/parcelas/sin-coordenadas",
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
    handler: parcelasController.listSinCoordenadas.bind(parcelasController) as any,
  });
};

export default parcelasRoutes;
