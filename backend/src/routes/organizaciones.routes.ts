import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { OrganizacionesController } from "../controllers/organizaciones.controller.js";
import { OrganizacionesService } from "../services/organizaciones.service.js";
import { OrganizacionRepository } from "../repositories/OrganizacionRepository.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRoles } from "../middleware/authorize.js";
import {
  CreateOrganizacionSchema,
  UpdateOrganizacionSchema,
  OrganizacionesListResponseSchema,
  OrganizacionResponseSchema,
  OrganizacionParamsSchema,
  OrganizacionErrorSchema,
} from "../schemas/organizaciones.schema.js";
import { z } from "zod";

// Plugin de rutas para organizaciones
// Las organizaciones son independientes de la jerarquia geografica
// Se asocian con productores
export default async function organizacionesRoutes(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) {
  // Inicializar dependencias
  const organizacionRepository = new OrganizacionRepository();
  const organizacionesService = new OrganizacionesService(
    organizacionRepository
  );
  const organizacionesController = new OrganizacionesController(
    organizacionesService
  );

  // GET /api/organizaciones
  // Lista todas las organizaciones
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/",
    {
      onRequest: [authenticate],
      schema: {
        description: "Lista todas las organizaciones",
        tags: ["organizaciones"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        response: {
          200: OrganizacionesListResponseSchema,
          401: OrganizacionErrorSchema,
          500: OrganizacionErrorSchema,
        },
      },
    },
    async (request, reply) =>
      organizacionesController.listOrganizaciones(request, reply)
  );

  // GET /api/organizaciones/:id
  // Obtiene una organizacion por ID
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/:id",
    {
      onRequest: [authenticate],
      schema: {
        description: "Obtiene una organización por ID",
        tags: ["organizaciones"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: OrganizacionParamsSchema,
        response: {
          200: z.object({ organizacion: OrganizacionResponseSchema }),
          401: OrganizacionErrorSchema,
          404: OrganizacionErrorSchema,
          500: OrganizacionErrorSchema,
        },
      },
    },
    async (request, reply) =>
      organizacionesController.getOrganizacionById(request, reply)
  );

  // POST /api/organizaciones
  // Crea una nueva organizacion
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/",
    {
      onRequest: [authenticate, requireRoles("gerente", "administrador")],
      schema: {
        description: "Crea una nueva organización",
        tags: ["organizaciones"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        body: CreateOrganizacionSchema,
        response: {
          201: z.object({
            organizacion: OrganizacionResponseSchema,
            message: z.string(),
          }),
          401: OrganizacionErrorSchema,
          403: OrganizacionErrorSchema,
          409: OrganizacionErrorSchema,
          500: OrganizacionErrorSchema,
        },
      },
    },
    async (request, reply) =>
      organizacionesController.createOrganizacion(request, reply)
  );

  // PUT /api/organizaciones/:id
  // Actualiza una organizacion existente
  fastify.withTypeProvider<ZodTypeProvider>().put(
    "/:id",
    {
      onRequest: [authenticate, requireRoles("gerente", "administrador")],
      schema: {
        description: "Actualiza una organización existente",
        tags: ["organizaciones"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: OrganizacionParamsSchema,
        body: UpdateOrganizacionSchema,
        response: {
          200: z.object({
            organizacion: OrganizacionResponseSchema,
            message: z.string(),
          }),
          401: OrganizacionErrorSchema,
          403: OrganizacionErrorSchema,
          404: OrganizacionErrorSchema,
          500: OrganizacionErrorSchema,
        },
      },
    },
    async (request, reply) =>
      organizacionesController.updateOrganizacion(request, reply)
  );

  // DELETE /api/organizaciones/:id
  // Elimina (desactiva) una organizacion
  fastify.withTypeProvider<ZodTypeProvider>().delete(
    "/:id",
    {
      onRequest: [authenticate, requireRoles("gerente", "administrador")],
      schema: {
        description: "Elimina (desactiva) una organización",
        tags: ["organizaciones"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: OrganizacionParamsSchema,
        response: {
          204: {
            type: "null",
            description: "Organización eliminada exitosamente",
          },
          401: OrganizacionErrorSchema,
          403: OrganizacionErrorSchema,
          404: OrganizacionErrorSchema,
          500: OrganizacionErrorSchema,
        },
      },
    },
    async (request, reply) =>
      organizacionesController.deleteOrganizacion(request, reply)
  );
}
