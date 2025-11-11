import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { NoConformidadesController } from "../controllers/noConformidades.controller.js";
import { NoConformidadesService } from "../services/noConformidades.service.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRoles } from "../middleware/authorize.js";
import { gestionActivaMiddleware } from "../middleware/gestionActiva.middleware.js";
import {
  NoConformidadParamsSchema,
  FichaNCParamsSchema,
  ArchivoNCParamsSchema,
  UpdateNoConformidadSchema,
  UpdateSeguimientoNCSchema,
  EstadisticasNCQuerySchema,
  NCFichaQuerySchema,
  NCListQuerySchema,
  NoConformidadEnriquecidaResponseSchema,
  NoConformidadesListResponseSchema,
  NoConformidadResponseSchema,
  EstadisticasNCResponseSchema,
  ArchivoNCResponseSchema,
  ArchivosNCListResponseSchema,
  NCErrorSchema,
} from "../schemas/noConformidades.schema.js";
import { z } from "zod";

// Plugin de rutas para No Conformidades
// Define endpoints para seguimiento de NC y gestión de archivos de evidencia
// Acceso para técnicos, gerentes y administradores
const noConformidadesRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  // Inicializar dependencias
  const ncService = new NoConformidadesService();
  const ncController = new NoConformidadesController(ncService);

  // GET /api/no-conformidades
  // Lista todas las NC con filtros opcionales
  // IMPORTANTE: Esta ruta debe ir ANTES de rutas más específicas
  fastify.route({
    method: "GET",
    url: "/",
    onRequest: [authenticate, gestionActivaMiddleware, requireRoles("tecnico", "gerente", "administrador")],
    schema: {
      description:
        "Lista todas las no conformidades con filtros opcionales. Gerente ve todas, técnico solo su comunidad.",
      tags: ["no-conformidades"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      querystring: NCListQuerySchema,
      response: {
        200: NoConformidadesListResponseSchema,
        401: NCErrorSchema,
        403: NCErrorSchema,
        500: NCErrorSchema,
      },
    },
    handler: ncController.getAll.bind(ncController) as any,
  });

  // GET /api/no-conformidades/estadisticas
  // Obtiene estadísticas de NC con filtros opcionales
  fastify.route({
    method: "GET",
    url: "/estadisticas",
    onRequest: [authenticate, gestionActivaMiddleware, requireRoles("tecnico", "gerente", "administrador")],
    schema: {
      description:
        "Obtiene estadísticas de no conformidades con filtros opcionales.",
      tags: ["no-conformidades"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      querystring: EstadisticasNCQuerySchema,
      response: {
        200: EstadisticasNCResponseSchema,
        401: NCErrorSchema,
        403: NCErrorSchema,
        500: NCErrorSchema,
      },
    },
    handler: ncController.getEstadisticas.bind(ncController) as any,
  });

  // GET /api/no-conformidades/ficha/:id_ficha
  // Lista NC de una ficha con filtro opcional por estado
  fastify.route({
    method: "GET",
    url: "/ficha/:id_ficha",
    onRequest: [authenticate, gestionActivaMiddleware, requireRoles("tecnico", "gerente", "administrador")],
    schema: {
      description: "Lista no conformidades de una ficha con filtro opcional.",
      tags: ["no-conformidades"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: FichaNCParamsSchema,
      querystring: NCFichaQuerySchema,
      response: {
        200: NoConformidadesListResponseSchema,
        401: NCErrorSchema,
        403: NCErrorSchema,
        404: NCErrorSchema,
        500: NCErrorSchema,
      },
    },
    handler: ncController.getByFicha.bind(ncController) as any,
  });

  // GET /api/no-conformidades/:id
  // Obtiene una NC por ID con datos enriquecidos
  fastify.route({
    method: "GET",
    url: "/:id",
    onRequest: [authenticate, requireRoles("tecnico", "gerente", "administrador")],
    schema: {
      description: "Obtiene una no conformidad por ID con datos enriquecidos.",
      tags: ["no-conformidades"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: NoConformidadParamsSchema,
      response: {
        200: z.object({
          no_conformidad: NoConformidadEnriquecidaResponseSchema,
        }),
        401: NCErrorSchema,
        403: NCErrorSchema,
        404: NCErrorSchema,
        500: NCErrorSchema,
      },
    },
    handler: ncController.getById.bind(ncController) as any,
  });

  // PUT /api/no-conformidades/:id
  // Actualiza datos básicos de una NC
  fastify.route({
    method: "PUT",
    url: "/:id",
    onRequest: [authenticate, requireRoles("tecnico", "gerente", "administrador")],
    schema: {
      description:
        "Actualiza datos básicos de una no conformidad (descripción, acción correctiva, fecha límite).",
      tags: ["no-conformidades"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: NoConformidadParamsSchema,
      body: UpdateNoConformidadSchema,
      response: {
        200: z.object({
          no_conformidad: NoConformidadResponseSchema,
        }),
        400: NCErrorSchema,
        401: NCErrorSchema,
        403: NCErrorSchema,
        404: NCErrorSchema,
        500: NCErrorSchema,
      },
    },
    handler: ncController.update.bind(ncController) as any,
  });

  // PUT /api/no-conformidades/:id/seguimiento
  // Actualiza el estado de seguimiento de una NC
  fastify.route({
    method: "PUT",
    url: "/:id/seguimiento",
    onRequest: [authenticate, requireRoles("tecnico", "gerente", "administrador")],
    schema: {
      description:
        "Actualiza el estado de seguimiento de una no conformidad (pendiente, seguimiento, corregido).",
      tags: ["no-conformidades"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: NoConformidadParamsSchema,
      body: UpdateSeguimientoNCSchema,
      response: {
        200: z.object({
          no_conformidad: NoConformidadResponseSchema,
        }),
        400: NCErrorSchema,
        401: NCErrorSchema,
        403: NCErrorSchema,
        404: NCErrorSchema,
        500: NCErrorSchema,
      },
    },
    handler: ncController.updateSeguimiento.bind(ncController) as any,
  });

  // POST /api/no-conformidades/:id/archivos
  // Sube un archivo a una NC
  fastify.route({
    method: "POST",
    url: "/:id/archivos",
    onRequest: [authenticate, requireRoles("tecnico", "gerente", "administrador")],
    schema: {
      description:
        "Sube un archivo de evidencia a una no conformidad (evidencia_correccion, documento_soporte, foto_antes, foto_despues).",
      tags: ["no-conformidades"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: NoConformidadParamsSchema,
      consumes: ["multipart/form-data"],
      response: {
        201: z.object({
          archivo: ArchivoNCResponseSchema,
        }),
        400: NCErrorSchema,
        401: NCErrorSchema,
        403: NCErrorSchema,
        404: NCErrorSchema,
        500: NCErrorSchema,
      },
    },
    handler: ncController.uploadArchivo.bind(ncController) as any,
  });

  // GET /api/no-conformidades/:id/archivos
  // Lista archivos de una NC
  fastify.route({
    method: "GET",
    url: "/:id/archivos",
    onRequest: [authenticate, requireRoles("tecnico", "gerente", "administrador")],
    schema: {
      description: "Lista todos los archivos de una no conformidad.",
      tags: ["no-conformidades"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: NoConformidadParamsSchema,
      response: {
        200: ArchivosNCListResponseSchema,
        401: NCErrorSchema,
        403: NCErrorSchema,
        404: NCErrorSchema,
        500: NCErrorSchema,
      },
    },
    handler: ncController.getArchivos.bind(ncController) as any,
  });

  // DELETE /api/no-conformidades/:id/archivos/:id_archivo
  // Elimina un archivo de una NC
  fastify.route({
    method: "DELETE",
    url: "/:id/archivos/:id_archivo",
    onRequest: [authenticate, requireRoles("tecnico", "gerente", "administrador")],
    schema: {
      description: "Elimina un archivo de una no conformidad.",
      tags: ["no-conformidades"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: ArchivoNCParamsSchema,
      response: {
        204: z.void(),
        400: NCErrorSchema,
        401: NCErrorSchema,
        403: NCErrorSchema,
        404: NCErrorSchema,
        500: NCErrorSchema,
      },
    },
    handler: ncController.deleteArchivo.bind(ncController) as any,
  });

  // GET /api/no-conformidades/:id/archivos/:id_archivo/download
  // Descarga un archivo de una NC
  fastify.route({
    method: "GET",
    url: "/:id/archivos/:id_archivo/download",
    onRequest: [authenticate, requireRoles("tecnico", "gerente", "administrador")],
    schema: {
      description: "Descarga un archivo de una no conformidad.",
      tags: ["no-conformidades"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: ArchivoNCParamsSchema,
      response: {
        200: z.any().describe("Archivo binario"),
        400: NCErrorSchema,
        401: NCErrorSchema,
        403: NCErrorSchema,
        404: NCErrorSchema,
        500: NCErrorSchema,
      },
    },
    handler: ncController.downloadArchivo.bind(ncController) as any,
  });
};

export default noConformidadesRoutes;
