import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { ProductoresController } from "../controllers/productores.controller.js";
import { ProductoresService } from "../services/productores.service.js";
import { ProductorRepository } from "../repositories/ProductorRepository.js";
import { ComunidadRepository } from "../repositories/ComunidadRepository.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRoles, requireAdmin } from "../middleware/authorize.js";
import {
  CreateProductorSchema,
  UpdateProductorSchema,
  ProductorParamsSchema,
  ProductorQuerySchema,
  ProximitySearchSchema,
  ProductoresListResponseSchema,
  ProductorResponseSchema,
  ProductorErrorSchema,
} from "../schemas/productores.schema.js";
import { z } from "zod";

// Plugin de rutas para productores
// CRUD de productores con control de acceso por comunidad
export default async function productoresRoutes(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) {
  // Inicializar dependencias
  const productorRepository = new ProductorRepository();
  const comunidadRepository = new ComunidadRepository();
  const productoresService = new ProductoresService(
    productorRepository,
    comunidadRepository
  );
  const productoresController = new ProductoresController(productoresService);

  // GET /api/productores
  // Lista productores con filtros opcionales
  // Tecnico: solo su comunidad
  // Gerente/Admin: todas las comunidades
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/",
    {
      onRequest: [
        authenticate,
        requireRoles("tecnico", "gerente", "administrador"),
      ],
      schema: {
        description: "Lista productores con filtros opcionales",
        tags: ["productores"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        querystring: ProductorQuerySchema,
        response: {
          200: ProductoresListResponseSchema,
          401: ProductorErrorSchema,
          403: ProductorErrorSchema,
          500: ProductorErrorSchema,
        },
      },
    },
    async (request, reply) => productoresController.list(request, reply)
  );

  // GET /api/productores/estadisticas
  // Obtiene estadisticas de productores
  // Tecnico: solo su comunidad
  // Gerente/Admin: estadisticas globales
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/estadisticas",
    {
      onRequest: [
        authenticate,
        requireRoles("tecnico", "gerente", "administrador"),
      ],
      schema: {
        description: "Obtiene estadisticas de productores",
        tags: ["productores"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        response: {
          200: z.object({
            total: z.number().int(),
            por_categoria: z.record(z.string(), z.number().int()),
            con_coordenadas: z.number().int(),
          }),
          401: ProductorErrorSchema,
          403: ProductorErrorSchema,
          500: ProductorErrorSchema,
        },
      },
    },
    async (request, reply) =>
      productoresController.getEstadisticas(request, reply)
  );

  // GET /api/productores/:codigo
  // Obtiene un productor por codigo
  // Tecnico: solo si es de su comunidad
  // Gerente/Admin: cualquier productor
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/:codigo",
    {
      onRequest: [
        authenticate,
        requireRoles("tecnico", "gerente", "administrador"),
      ],
      schema: {
        description: "Obtiene un productor por codigo",
        tags: ["productores"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: ProductorParamsSchema,
        response: {
          200: z.object({ productor: ProductorResponseSchema }),
          401: ProductorErrorSchema,
          403: ProductorErrorSchema,
          404: ProductorErrorSchema,
          500: ProductorErrorSchema,
        },
      },
    },
    async (request, reply) => productoresController.getByCodigo(request, reply)
  );

  // POST /api/productores/nearby
  // Busca productores cercanos a una ubicacion GPS
  // Usa funciones PostGIS para calcular distancias
  // Tecnico: solo de su comunidad
  // Gerente/Admin: de todas las comunidades
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/nearby",
    {
      onRequest: [
        authenticate,
        requireRoles("tecnico", "gerente", "administrador"),
      ],
      schema: {
        description: "Busca productores cercanos a una ubicacion GPS",
        tags: ["productores"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        body: ProximitySearchSchema,
        response: {
          200: ProductoresListResponseSchema,
          401: ProductorErrorSchema,
          403: ProductorErrorSchema,
          500: ProductorErrorSchema,
        },
      },
    },
    async (request, reply) => productoresController.searchNearby(request, reply)
  );

  // POST /api/productores
  // Crea un nuevo productor
  // Tecnico: solo en su comunidad
  // Gerente y Admin: en cualquier comunidad
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/",
    {
      onRequest: [
        authenticate,
        requireRoles("tecnico", "gerente", "administrador"),
      ],
      schema: {
        description: "Crea un nuevo productor",
        tags: ["productores"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        body: CreateProductorSchema,
        response: {
          201: z.object({
            productor: ProductorResponseSchema,
            message: z.string(),
          }),
          401: ProductorErrorSchema,
          403: ProductorErrorSchema,
          404: ProductorErrorSchema,
          409: ProductorErrorSchema,
          500: ProductorErrorSchema,
        },
      },
    },
    async (request, reply) => productoresController.create(request, reply)
  );

  // PUT /api/productores/:codigo
  // Actualiza un productor existente
  // Tecnico: solo de su comunidad
  // Gerente y Admin: cualquier productor
  fastify.withTypeProvider<ZodTypeProvider>().put(
    "/:codigo",
    {
      onRequest: [
        authenticate,
        requireRoles("tecnico", "gerente", "administrador"),
      ],
      schema: {
        description: "Actualiza un productor existente",
        tags: ["productores"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: ProductorParamsSchema,
        body: UpdateProductorSchema,
        response: {
          200: z.object({
            productor: ProductorResponseSchema,
            message: z.string(),
          }),
          401: ProductorErrorSchema,
          403: ProductorErrorSchema,
          404: ProductorErrorSchema,
          500: ProductorErrorSchema,
        },
      },
    },
    async (request, reply) => productoresController.update(request, reply)
  );

  // DELETE /api/productores/:codigo
  // Elimina (desactiva) un productor
  // Gerente y admin pueden eliminar
  fastify.withTypeProvider<ZodTypeProvider>().delete(
    "/:codigo",
    {
      onRequest: [authenticate, requireRoles("gerente", "administrador")],
      schema: {
        description: "Elimina (desactiva) un productor",
        tags: ["productores"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: ProductorParamsSchema,
        response: {
          204: {
            type: "null",
            description: "Productor eliminado exitosamente",
          },
          401: ProductorErrorSchema,
          403: ProductorErrorSchema,
          404: ProductorErrorSchema,
          500: ProductorErrorSchema,
        },
      },
    },
    async (request, reply) => productoresController.delete(request, reply)
  );
}
