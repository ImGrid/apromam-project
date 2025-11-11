import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
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
const organizacionesRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
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
  fastify.route({
    method: "GET",
    url: "/",
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
    handler: organizacionesController.listOrganizaciones.bind(organizacionesController) as any,
  });

  // GET /api/organizaciones/:id
  // Obtiene una organizacion por ID
  fastify.route({
    method: "GET",
    url: "/:id",
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
    handler: organizacionesController.getOrganizacionById.bind(organizacionesController) as any,
  });

  // POST /api/organizaciones
  // Crea una nueva organizacion
  fastify.route({
    method: "POST",
    url: "/",
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
    handler: organizacionesController.createOrganizacion.bind(organizacionesController) as any,
  });

  // PUT /api/organizaciones/:id
  // Actualiza una organizacion existente
  fastify.route({
    method: "PUT",
    url: "/:id",
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
    handler: organizacionesController.updateOrganizacion.bind(organizacionesController) as any,
  });

  // DELETE /api/organizaciones/:id
  // Elimina (desactiva) una organizacion
  fastify.route({
    method: "DELETE",
    url: "/:id",
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
    handler: organizacionesController.deleteOrganizacion.bind(organizacionesController) as any,
  });
};

export default organizacionesRoutes;
