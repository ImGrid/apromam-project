import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { CatalogosController } from "../controllers/catalogos.controller.js";
import { CatalogosService } from "../services/catalogos.service.js";
import { TipoCultivoRepository } from "../repositories/TipoCultivoRepository.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRoles } from "../middleware/authorize.js";
import {
  CreateTipoCultivoSchema,
  UpdateTipoCultivoSchema,
  CatalogoParamsSchema,
  CatalogoQuerySchema,
  TiposCultivoListResponseSchema,
  TipoCultivoResponseSchema,
  CatalogoErrorSchema,
} from "../schemas/catalogos.schema.js";
import { z } from "zod";

/**
 * Plugin de rutas de catálogos (solo tipos de cultivo)
 * NOTA: Gestiones ahora tienen su propio endpoint en /api/gestiones
 */
const catalogosRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  // Inicializar dependencias
  const tipoCultivoRepository = new TipoCultivoRepository();
  const catalogosService = new CatalogosService(tipoCultivoRepository);
  const catalogosController = new CatalogosController(catalogosService);

  // ==========================================
  // RUTAS TIPOS CULTIVO
  // ==========================================

  /**
   * GET /api/catalogos/tipos-cultivo
   * Lista todos los tipos de cultivo
   * Acceso: todos los roles autenticados
   */
  fastify.route({
    method: "GET",
    url: "/tipos-cultivo",
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
    handler: catalogosController.listTiposCultivo.bind(catalogosController) as any,
  });

  /**
   * GET /api/catalogos/tipos-cultivo/:id
   * Obtiene un tipo cultivo por ID
   * Acceso: todos los roles autenticados
   */
  fastify.route({
    method: "GET",
    url: "/tipos-cultivo/:id",
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
    handler: catalogosController.getTipoCultivoById.bind(catalogosController) as any,
  });

  /**
   * POST /api/catalogos/tipos-cultivo
   * Crea un nuevo tipo cultivo
   * Acceso: solo admin (gerente NO puede modificar catálogos, solo ver)
   */
  fastify.route({
    method: "POST",
    url: "/tipos-cultivo",
    onRequest: [authenticate, requireRoles("administrador")],
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
    handler: catalogosController.createTipoCultivo.bind(catalogosController) as any,
  });

  /**
   * PUT /api/catalogos/tipos-cultivo/:id
   * Actualiza un tipo cultivo existente
   * Acceso: solo admin (gerente NO puede modificar catálogos, solo ver)
   */
  fastify.route({
    method: "PUT",
    url: "/tipos-cultivo/:id",
    onRequest: [authenticate, requireRoles("administrador")],
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
    handler: catalogosController.updateTipoCultivo.bind(catalogosController) as any,
  });

  /**
   * DELETE /api/catalogos/tipos-cultivo/:id
   * Elimina (desactiva) un tipo cultivo
   * Acceso: solo admin (gerente NO puede modificar catálogos, solo ver)
   */
  fastify.route({
    method: "DELETE",
    url: "/tipos-cultivo/:id",
    onRequest: [authenticate, requireRoles("administrador")],
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
    handler: catalogosController.deleteTipoCultivo.bind(catalogosController) as any,
  });
};

export default catalogosRoutes;
