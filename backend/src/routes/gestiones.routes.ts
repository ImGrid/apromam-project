import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { GestionesController } from "../controllers/gestiones.controller.js";
import { GestionesService } from "../services/gestiones.service.js";
import { GestionRepository } from "../repositories/GestionRepository.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/authorize.js";
import {
  CreateGestionSchema,
  UpdateGestionSchema,
  GestionResponseSchema,
} from "../schemas/catalogos.schema.js";

// UUID Schema para validación de parámetros
const UUIDSchema = z.string().uuid("ID debe ser un UUID válido");

/**
 * Rutas para gestión de gestiones (años agrícolas)
 * Prefix: /api/gestiones
 *
 * IMPORTANTE: Gestiones es un módulo crítico que maneja ciclos anuales
 * Todos los endpoints requieren autenticación
 * Solo admin puede crear, actualizar, eliminar y activar gestiones
 */
const gestionesRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  const gestionRepository = new GestionRepository();
  const gestionesService = new GestionesService(gestionRepository);
  const gestionesController = new GestionesController(gestionesService);

  // ==========================================
  // GET /api/gestiones
  // Lista todas las gestiones
  // ==========================================
  fastify.route({
    method: "GET",
    url: "/",
    onRequest: [authenticate],
    schema: {
      description: "Lista todas las gestiones",
      tags: ["Gestiones"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      querystring: z.object({
        activo: z
          .boolean()
          .optional()
          .describe("Filtrar solo activas (default: true)"),
      }),
      response: {
        200: z.object({
          data: z.array(GestionResponseSchema),
          total: z.number(),
        }),
      },
    },
    handler: gestionesController.listGestiones.bind(gestionesController) as any,
  });

  // ==========================================
  // GET /api/gestiones/activa
  // Obtiene la gestión activa del sistema
  // ==========================================
  fastify.route({
    method: "GET",
    url: "/activa",
    onRequest: [authenticate],
    schema: {
      description:
        "Obtiene la gestión activa del sistema (activo_sistema = true)",
      tags: ["Gestiones"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      response: {
        200: z.object({
          data: GestionResponseSchema,
        }),
        404: z.object({
          error: z.string(),
          message: z.string(),
        }),
      },
    },
    handler: gestionesController.getGestionActiva.bind(gestionesController) as any,
  });

  // ==========================================
  // GET /api/gestiones/:id
  // Obtiene una gestión por ID
  // ==========================================
  fastify.route({
    method: "GET",
    url: "/:id",
    onRequest: [authenticate],
    schema: {
      description: "Obtiene una gestión por ID",
      tags: ["Gestiones"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: z.object({
        id: UUIDSchema,
      }),
      response: {
        200: z.object({
          data: GestionResponseSchema,
        }),
        404: z.object({
          error: z.string(),
          message: z.string(),
        }),
      },
    },
    handler: gestionesController.getGestionById.bind(gestionesController) as any,
  });

  // ==========================================
  // POST /api/gestiones
  // Crea una nueva gestión
  // Solo admin
  // ==========================================
  fastify.route({
    method: "POST",
    url: "/",
    onRequest: [authenticate, requireAdmin],
    schema: {
      description: "Crea una nueva gestión",
      tags: ["Gestiones"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      body: CreateGestionSchema,
      response: {
        201: z.object({
          data: GestionResponseSchema,
          message: z.string(),
        }),
        409: z.object({
          error: z.string(),
          message: z.string(),
        }),
      },
    },
    handler: gestionesController.createGestion.bind(gestionesController) as any,
  });

  // ==========================================
  // PUT /api/gestiones/:id
  // Actualiza una gestión existente
  // Solo admin
  // ==========================================
  fastify.route({
    method: "PUT",
    url: "/:id",
    onRequest: [authenticate, requireAdmin],
    schema: {
      description: "Actualiza una gestión existente",
      tags: ["Gestiones"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: z.object({
        id: UUIDSchema,
      }),
      body: UpdateGestionSchema,
      response: {
        200: z.object({
          data: GestionResponseSchema,
          message: z.string(),
        }),
        404: z.object({
          error: z.string(),
          message: z.string(),
        }),
      },
    },
    handler: gestionesController.updateGestion.bind(gestionesController) as any,
  });

  // ==========================================
  // DELETE /api/gestiones/:id
  // Elimina (desactiva) una gestión
  // Solo admin
  // ==========================================
  fastify.route({
    method: "DELETE",
    url: "/:id",
    onRequest: [authenticate, requireAdmin],
    schema: {
      description: "Elimina (desactiva) una gestión",
      tags: ["Gestiones"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: z.object({
        id: UUIDSchema,
      }),
      response: {
        200: z.object({
          message: z.string(),
        }),
        400: z.object({
          error: z.string(),
          message: z.string(),
        }),
      },
    },
    handler: gestionesController.deleteGestion.bind(gestionesController) as any,
  });

  // ==========================================
  // POST /api/gestiones/:id/activar
  // Activa una gestión como la gestión activa del sistema
  // ACCIÓN CRÍTICA: Afecta a TODO el sistema
  // Solo admin
  // ==========================================
  fastify.route({
    method: "POST",
    url: "/:id/activar",
    onRequest: [authenticate, requireAdmin],
    schema: {
      description:
        "Activa una gestión como la gestión activa del sistema. ACCIÓN CRÍTICA que afecta a todo el sistema.",
      tags: ["Gestiones"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: z.object({
        id: UUIDSchema,
      }),
      response: {
        200: z.object({
          data: GestionResponseSchema,
          message: z.string(),
        }),
        400: z.object({
          error: z.string(),
          message: z.string(),
        }),
        404: z.object({
          error: z.string(),
          message: z.string(),
        }),
      },
    },
    handler: gestionesController.activarGestion.bind(gestionesController) as any,
  });
};

export default gestionesRoutes;
