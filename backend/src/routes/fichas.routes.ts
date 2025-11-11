
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { FichasController } from "../controllers/fichas.controller.js";
import { FichasService } from "../services/fichas.service.js";
import { FichaRepository } from "../repositories/FichaRepository.js";
import { ProductorRepository } from "../repositories/ProductorRepository.js";
import { ParcelaRepository } from "../repositories/ParcelaRepository.js";
import { ArchivoFichaRepository } from "../repositories/ArchivoFichaRepository.js";
import { FichaDraftRepository } from "../repositories/FichaDraftRepository.js";
import { GestionRepository } from "../repositories/GestionRepository.js";
import { CultivosGestionRepository } from "../repositories/CultivosGestionRepository.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRoles, requireAdmin } from "../middleware/authorize.js";
import { gestionActivaMiddleware } from "../middleware/gestionActiva.middleware.js";
import {
  CreateFichaSchema,
  UpdateFichaSchema,
  UpdateFichaCompletaSchema,
  FichaParamsSchema,
  FichaQuerySchema,
  EnviarRevisionSchema,
  AprobarFichaSchema,
  RechazarFichaSchema,
  FichasListResponseSchema,
  FichaResponseSchema,
  FichaErrorSchema,
  ArchivoFichaResponseSchema,
  CreateFichaDraftSchema,
  GetDraftParamsSchema,
  FichaDraftResponseSchema,
} from "../schemas/fichas.schema.js";
import { z } from "zod";

// Plugin de rutas para Fichas de Inspección
// Define el CRUD completo y el flujo de trabajo (borrador, revisión, aprobado/rechazado)
const fichasRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  // Inicializar dependencias
  const fichaRepository = new FichaRepository();
  const productorRepository = new ProductorRepository();
  const parcelaRepository = new ParcelaRepository();
  const archivoFichaRepository = new ArchivoFichaRepository();
  const fichaDraftRepository = new FichaDraftRepository();
  const gestionRepository = new GestionRepository();
  const cultivosGestionRepository = new CultivosGestionRepository();
  const fichasService = new FichasService(
    fichaRepository,
    productorRepository,
    parcelaRepository,
    archivoFichaRepository,
    fichaDraftRepository,
    gestionRepository,
    cultivosGestionRepository
  );
  const fichasController = new FichasController(fichasService);

  // GET /api/fichas
  // Lista fichas con filtros. Tecnico solo ve su comunidad, Gerente/Admin ven todo.
  fastify.route({
    method: "GET",
    url: "/",
    onRequest: [
      authenticate,
      gestionActivaMiddleware,
      requireRoles("tecnico", "gerente", "administrador"),
    ],
    schema: {
      description: "Lista fichas de inspección con filtros opcionales.",
      tags: ["fichas"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      querystring: FichaQuerySchema,
      response: {
        200: FichasListResponseSchema,
        401: FichaErrorSchema,
        403: FichaErrorSchema,
        500: FichaErrorSchema,
      },
    },
    handler: fichasController.list.bind(fichasController) as any,
  });

  // GET /api/fichas/estadisticas
  // Obtiene estadísticas sobre las fichas.
  fastify.route({
    method: "GET",
    url: "/estadisticas",
    onRequest: [
      authenticate,
      requireRoles("tecnico", "gerente", "administrador"),
    ],
    schema: {
      description: "Obtiene estadísticas de las fichas.",
      tags: ["fichas"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      querystring: z.object({
        gestion: z.string().optional(),
      }),
      response: {
        200: z.object({
          total: z.number().int(),
          por_estado: z.record(z.string(), z.number().int()),
          por_resultado: z.record(z.string(), z.number().int()),
          pendientes_sincronizacion: z.number().int(),
        }),
        401: FichaErrorSchema,
        403: FichaErrorSchema,
        500: FichaErrorSchema,
      },
    },
    handler: fichasController.getEstadisticas.bind(fichasController) as any,
  });

  // GET /api/fichas/check-exists
  // Verifica si existe una ficha para un productor en una gestión
  fastify.route({
    method: "GET",
    url: "/check-exists",
    onRequest: [authenticate, requireRoles("tecnico", "administrador")],
    schema: {
      description: "Verifica si existe una ficha para un productor en una gestión.",
      tags: ["fichas"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      querystring: z.object({
        codigo_productor: z.string().describe("Código del productor"),
        gestion: z.string().describe("Gestión (año)"),
      }),
      response: {
        200: z.union([
          z.object({
            exists: z.literal(false),
          }),
          z.object({
            exists: z.literal(true),
            ficha: z.object({
              id_ficha: z.string(),
              estado_ficha: z.string(),
              resultado_certificacion: z.string(),
              fecha_inspeccion: z.string(),
            }),
          }),
        ]),
        400: FichaErrorSchema,
        401: FichaErrorSchema,
        500: FichaErrorSchema,
      },
    },
    handler: fichasController.checkExists.bind(fichasController) as any,
  });

  // GET /api/fichas/:id
  // Obtiene una ficha completa por su ID.
  fastify.route({
    method: "GET",
    url: "/:id",
    onRequest: [
      authenticate,
      gestionActivaMiddleware,
      requireRoles("tecnico", "gerente", "administrador"),
    ],
    schema: {
      description: "Obtiene una ficha completa por su ID.",
      tags: ["fichas"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: FichaParamsSchema,
      response: {
        200: z.object({ ficha: z.any() }), // La respuesta es compleja, se deja como any por simplicidad
        401: FichaErrorSchema,
        403: FichaErrorSchema,
        404: FichaErrorSchema,
        500: FichaErrorSchema,
      },
    },
    handler: fichasController.getById.bind(fichasController) as any,
  });

  // POST /api/fichas
  // Crea una nueva ficha de inspección completa.
  fastify.route({
    method: "POST",
    url: "/",
    onRequest: [authenticate, gestionActivaMiddleware, requireRoles("tecnico", "administrador")],
    schema: {
      description: "Crea una nueva ficha de inspección completa.",
      tags: ["fichas"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      body: CreateFichaSchema,
      response: {
        201: z.object({
          ficha: z.any(),
          message: z.string(),
        }),
        401: FichaErrorSchema,
        403: FichaErrorSchema,
        409: FichaErrorSchema,
        500: FichaErrorSchema,
      },
    },
    handler: fichasController.create.bind(fichasController) as any,
  });

  // PUT /api/fichas/:id
  // Actualiza una ficha que está en estado 'borrador'.
  fastify.route({
    method: "PUT",
    url: "/:id",
    onRequest: [authenticate, gestionActivaMiddleware, requireRoles("tecnico", "administrador")],
    schema: {
      description: "Actualiza una ficha que está en estado 'borrador'.",
      tags: ["fichas"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: FichaParamsSchema,
      body: UpdateFichaSchema,
      response: {
        200: z.object({
          ficha: FichaResponseSchema,
          message: z.string(),
        }),
        400: FichaErrorSchema,
        401: FichaErrorSchema,
        403: FichaErrorSchema,
        404: FichaErrorSchema,
        500: FichaErrorSchema,
      },
    },
    handler: fichasController.update.bind(fichasController) as any,
  });

  // PUT /api/fichas/:id/completa
  // Actualiza una ficha completa con todas las secciones
  fastify.route({
    method: "PUT",
    url: "/:id/completa",
    onRequest: [authenticate, gestionActivaMiddleware, requireRoles("tecnico", "administrador")],
    schema: {
      description:
        "Actualiza una ficha completa incluyendo todas las 11 secciones. " +
        "Solo se puede actualizar si está en estado 'borrador'. " +
        "Usa DELETE + INSERT para todas las secciones (excepto la ficha principal).",
      tags: ["fichas"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: FichaParamsSchema,
      body: UpdateFichaCompletaSchema,
      response: {
        200: z.object({
          ficha: z.any(),
          message: z.string(),
        }),
        400: FichaErrorSchema,
        401: FichaErrorSchema,
        403: FichaErrorSchema,
        404: FichaErrorSchema,
        500: FichaErrorSchema,
      },
    },
    handler: fichasController.updateCompleta.bind(fichasController) as any,
  });

  // DELETE /api/fichas/:id
  // Elimina (desactivación suave) una ficha. Solo Admin.
  fastify.route({
    method: "DELETE",
    url: "/:id",
    onRequest: [authenticate, requireAdmin],
    schema: {
      description: "Elimina (desactivación suave) una ficha. Solo Admin.",
      tags: ["fichas"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: FichaParamsSchema,
      response: {
        204: z.null(),
        400: FichaErrorSchema,
        401: FichaErrorSchema,
        403: FichaErrorSchema,
        404: FichaErrorSchema,
        500: FichaErrorSchema,
      },
    },
    handler: fichasController.delete.bind(fichasController) as any,
  });

  // GET /api/fichas/:id/archivos
  // Lista todos los archivos asociados a una ficha
  fastify.route({
    method: "GET",
    url: "/:id/archivos",
    onRequest: [
      authenticate,
      requireRoles("tecnico", "gerente", "administrador"),
    ],
    schema: {
      description: "Lista todos los archivos de una ficha.",
      tags: ["fichas"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: FichaParamsSchema,
      response: {
        200: z.object({
          archivos: z.array(ArchivoFichaResponseSchema),
          total: z.number().int(),
        }),
        401: FichaErrorSchema,
        403: FichaErrorSchema,
        404: FichaErrorSchema,
        500: FichaErrorSchema,
      },
    },
    handler: fichasController.listArchivos.bind(fichasController) as any,
  });

  // POST /api/fichas/:id/archivos
  // Sube un archivo (croquis, foto) y lo asocia a la ficha.
  fastify.route({
    method: "POST",
    url: "/:id/archivos",
    onRequest: [authenticate, requireRoles("tecnico")],
    schema: {
      description: "Sube un archivo y lo asocia a una ficha.",
      tags: ["fichas"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: FichaParamsSchema,
      response: {
        201: z.object({
          archivo: ArchivoFichaResponseSchema,
          message: z.string(),
        }),
        400: FichaErrorSchema,
        401: FichaErrorSchema,
        403: FichaErrorSchema,
        404: FichaErrorSchema,
        500: FichaErrorSchema,
      },
    },
    handler: fichasController.uploadArchivo.bind(fichasController) as any,
  });

  // GET /api/fichas/:id/archivos/:idArchivo/download
  // Descarga un archivo específico de una ficha
  fastify.route({
    method: "GET",
    url: "/:id/archivos/:idArchivo/download",
    onRequest: [
      authenticate,
      requireRoles("tecnico", "gerente", "administrador"),
    ],
    schema: {
      description: "Descarga un archivo de una ficha.",
      tags: ["fichas"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: z.object({
        id: z.string().uuid().describe("ID de la ficha"),
        idArchivo: z.string().uuid().describe("ID del archivo"),
      }),
      response: {
        400: FichaErrorSchema,
        401: FichaErrorSchema,
        403: FichaErrorSchema,
        404: FichaErrorSchema,
        500: FichaErrorSchema,
      },
    },
    handler: fichasController.downloadArchivo.bind(fichasController) as any,
  });

  // DELETE /api/fichas/:id/archivos/:idArchivo
  // Elimina un archivo de una ficha
  fastify.route({
    method: "DELETE",
    url: "/:id/archivos/:idArchivo",
    onRequest: [authenticate, requireRoles("tecnico")],
    schema: {
      description: "Elimina un archivo de una ficha.",
      tags: ["fichas"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: z.object({
        id: z.string().uuid().describe("ID de la ficha"),
        idArchivo: z.string().uuid().describe("ID del archivo"),
      }),
      response: {
        204: z.null(),
        401: FichaErrorSchema,
        403: FichaErrorSchema,
        404: FichaErrorSchema,
        500: FichaErrorSchema,
      },
    },
    handler: fichasController.deleteArchivoFicha.bind(fichasController) as any,
  });

  // --- DRAFT ROUTES ---

  // POST /api/fichas/draft
  // Guarda o actualiza un borrador de ficha
  fastify.route({
    method: "POST",
    url: "/draft",
    onRequest: [authenticate, requireRoles("tecnico", "administrador")],
    schema: {
      description: "Guarda o actualiza un borrador de ficha.",
      tags: ["fichas-draft"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      body: CreateFichaDraftSchema,
      response: {
        200: z.object({
          draft: FichaDraftResponseSchema,
          message: z.string(),
        }),
        401: FichaErrorSchema,
        403: FichaErrorSchema,
        500: FichaErrorSchema,
      },
    },
    handler: fichasController.saveDraft.bind(fichasController) as any,
  });

  // GET /api/fichas/draft/my-drafts
  // Lista todos los borradores del usuario actual
  fastify.route({
    method: "GET",
    url: "/draft/my-drafts",
    onRequest: [authenticate, requireRoles("tecnico", "administrador")],
    schema: {
      description: "Lista todos los borradores del usuario actual.",
      tags: ["fichas-draft"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      response: {
        200: z.object({
          drafts: z.array(FichaDraftResponseSchema),
          total: z.number().int(),
        }),
        401: FichaErrorSchema,
        403: FichaErrorSchema,
        500: FichaErrorSchema,
      },
    },
    handler: fichasController.listMyDrafts.bind(fichasController) as any,
  });

  // GET /api/fichas/draft/:codigoProductor/:gestion
  // Obtiene un borrador específico por código de productor y gestión
  fastify.route({
    method: "GET",
    url: "/draft/:codigoProductor/:gestion",
    onRequest: [authenticate, requireRoles("tecnico", "administrador")],
    schema: {
      description: "Obtiene un borrador por código de productor y gestión.",
      tags: ["fichas-draft"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: GetDraftParamsSchema,
      response: {
        200: z.object({
          draft: FichaDraftResponseSchema.nullable(),
          message: z.string().optional(),
        }),
        401: FichaErrorSchema,
        403: FichaErrorSchema,
        500: FichaErrorSchema,
      },
    },
    handler: fichasController.getDraft.bind(fichasController) as any,
  });

  // DELETE /api/fichas/draft/:id
  // Elimina un borrador por ID
  fastify.route({
    method: "DELETE",
    url: "/draft/:id",
    onRequest: [authenticate, requireRoles("tecnico", "administrador")],
    schema: {
      description: "Elimina un borrador por ID.",
      tags: ["fichas-draft"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: z.object({
        id: z.string().uuid(),
      }),
      response: {
        204: z.null(),
        401: FichaErrorSchema,
        403: FichaErrorSchema,
        404: FichaErrorSchema,
        500: FichaErrorSchema,
      },
    },
    handler: fichasController.deleteDraft.bind(fichasController) as any,
  });

  // --- WORKFLOW ROUTES ---

  // POST /api/fichas/:id/enviar-revision
  // Cambia el estado de la ficha de 'borrador' a 'revision'.
  fastify.route({
    method: "POST",
    url: "/:id/enviar-revision",
    onRequest: [authenticate, requireRoles("tecnico", "administrador")],
    schema: {
      description: "Envía una ficha a revisión.",
      tags: ["fichas-workflow"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: FichaParamsSchema,
      body: EnviarRevisionSchema,
      response: {
        200: z.object({
          ficha: FichaResponseSchema,
          message: z.string(),
        }),
        400: FichaErrorSchema,
        401: FichaErrorSchema,
        403: FichaErrorSchema,
        404: FichaErrorSchema,
        500: FichaErrorSchema,
      },
    },
    handler: fichasController.enviarRevision.bind(fichasController) as any,
  });

  // POST /api/fichas/:id/aprobar
  // Cambia el estado de la ficha de 'revision' a 'aprobado'. Solo Gerente/Admin.
  fastify.route({
    method: "POST",
    url: "/:id/aprobar",
    onRequest: [authenticate, requireRoles("gerente", "administrador")],
    schema: {
      description: "Aprueba una ficha en revisión.",
      tags: ["fichas-workflow"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: FichaParamsSchema,
      body: AprobarFichaSchema,
      response: {
        200: z.object({
          ficha: FichaResponseSchema,
          message: z.string(),
        }),
        400: FichaErrorSchema,
        401: FichaErrorSchema,
        403: FichaErrorSchema,
        404: FichaErrorSchema,
        500: FichaErrorSchema,
      },
    },
    handler: fichasController.aprobar.bind(fichasController) as any,
  });

  // POST /api/fichas/:id/rechazar
  // Cambia el estado de la ficha de 'revision' a 'rechazado'. Solo Gerente/Admin.
  fastify.route({
    method: "POST",
    url: "/:id/rechazar",
    onRequest: [authenticate, requireRoles("gerente", "administrador")],
    schema: {
      description: "Rechaza una ficha en revisión.",
      tags: ["fichas-workflow"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: FichaParamsSchema,
      body: RechazarFichaSchema,
      response: {
        200: z.object({
          ficha: FichaResponseSchema,
          message: z.string(),
        }),
        400: FichaErrorSchema,
        401: FichaErrorSchema,
        403: FichaErrorSchema,
        404: FichaErrorSchema,
        500: FichaErrorSchema,
      },
    },
    handler: fichasController.rechazar.bind(fichasController) as any,
  });

};

export default fichasRoutes;
