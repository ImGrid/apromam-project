
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FichasController } from "../controllers/fichas.controller.js";
import { FichasService } from "../services/fichas.service.js";
import { FichaRepository } from "../repositories/FichaRepository.js";
import { ProductorRepository } from "../repositories/ProductorRepository.js";
import { ArchivoFichaRepository } from "../repositories/ArchivoFichaRepository.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRoles, requireAdmin } from "../middleware/authorize.js";
import {
  CreateFichaSchema,
  UpdateFichaSchema,
  FichaParamsSchema,
  FichaQuerySchema,
  EnviarRevisionSchema,
  AprobarFichaSchema,
  RechazarFichaSchema,
  FichasListResponseSchema,
  FichaResponseSchema,
  FichaErrorSchema,
  ArchivoFichaResponseSchema,
} from "../schemas/fichas.schema.js";
import { z } from "zod";

// Plugin de rutas para Fichas de Inspección
// Define el CRUD completo y el flujo de trabajo (borrador, revisión, aprobado/rechazado)
export default async function fichasRoutes(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) {
  // Inicializar dependencias
  const fichaRepository = new FichaRepository();
  const productorRepository = new ProductorRepository();
  const archivoFichaRepository = new ArchivoFichaRepository();
  const fichasService = new FichasService(
    fichaRepository,
    productorRepository,
    archivoFichaRepository
  );
  const fichasController = new FichasController(fichasService);

  // GET /api/fichas
  // Lista fichas con filtros. Tecnico solo ve su comunidad, Gerente/Admin ven todo.
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/",
    {
      onRequest: [
        authenticate,
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
    },
    async (request, reply) => fichasController.list(request, reply)
  );

  // GET /api/fichas/estadisticas
  // Obtiene estadísticas sobre las fichas.
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/estadisticas",
    {
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
    },
    async (request, reply) => fichasController.getEstadisticas(request, reply)
  );

  // GET /api/fichas/:id
  // Obtiene una ficha completa por su ID.
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/:id",
    {
      onRequest: [
        authenticate,
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
    },
    async (request, reply) => fichasController.getById(request, reply)
  );

  // POST /api/fichas
  // Crea una nueva ficha de inspección completa.
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/",
    {
      onRequest: [authenticate, requireRoles("tecnico", "administrador")],
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
    },
    async (request, reply) => fichasController.create(request, reply)
  );

  // PUT /api/fichas/:id
  // Actualiza una ficha que está en estado 'borrador'.
  fastify.withTypeProvider<ZodTypeProvider>().put(
    "/:id",
    {
      onRequest: [authenticate, requireRoles("tecnico", "administrador")],
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
    },
    async (request, reply) => fichasController.update(request, reply)
  );

  // DELETE /api/fichas/:id
  // Elimina (desactivación suave) una ficha. Solo Admin.
  fastify.withTypeProvider<ZodTypeProvider>().delete(
    "/:id",
    {
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
    },
    async (request, reply) => fichasController.delete(request, reply)
  );

  // POST /api/fichas/:id/archivos
  // Sube un archivo (croquis, foto) y lo asocia a la ficha.
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/:id/archivos",
    {
      onRequest: [authenticate, requireRoles("tecnico", "administrador")],
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
    },
    async (request, reply) => fichasController.uploadArchivo(request, reply)
  );

  // --- WORKFLOW ROUTES ---

  // POST /api/fichas/:id/enviar-revision
  // Cambia el estado de la ficha de 'borrador' a 'revision'.
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/:id/enviar-revision",
    {
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
    },
    async (request, reply) => fichasController.enviarRevision(request, reply)
  );

  // POST /api/fichas/:id/aprobar
  // Cambia el estado de la ficha de 'revision' a 'aprobado'. Solo Gerente/Admin.
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/:id/aprobar",
    {
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
    },
    async (request, reply) => fichasController.aprobar(request, reply)
  );

  // POST /api/fichas/:id/rechazar
  // Cambia el estado de la ficha de 'revision' a 'rechazado'. Solo Gerente/Admin.
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/:id/rechazar",
    {
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
    },
    async (request, reply) => fichasController.rechazar(request, reply)
  );

  // POST /api/fichas/:id/devolver-borrador
  // Devuelve una ficha 'rechazada' a 'borrador'. Solo Admin.
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/:id/devolver-borrador",
    {
      onRequest: [authenticate, requireAdmin],
      schema: {
        description: "Devuelve una ficha rechazada al estado borrador.",
        tags: ["fichas-workflow"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: FichaParamsSchema,
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
    },
    async (request, reply) => fichasController.devolverBorrador(request, reply)
  );
}
