import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { GeograficasController } from "../controllers/geograficas.controller.js";
import { GeograficasService } from "../services/geograficas.service.js";
import { ProvinciaRepository } from "../repositories/ProvinciaRepository.js";
import { MunicipioRepository } from "../repositories/MunicipioRepository.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRoles } from "../middleware/authorize.js";
import {
  CreateProvinciaSchema,
  UpdateProvinciaSchema,
  CreateMunicipioSchema,
  UpdateMunicipioSchema,
  GeograficaParamsSchema,
  GeograficaQuerySchema,
  ProvinciasListResponseSchema,
  ProvinciaResponseSchema,
  MunicipiosListResponseSchema,
  MunicipioResponseSchema,
  GeograficaErrorSchema,
} from "../schemas/geograficas.schema.js";
import { z } from "zod/v4";
// Plugin de rutas para jerarquia geografica
// Gestiona provincias y municipios
export default async function geograficasRoutes(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) {
  // Inicializar dependencias
  const provinciaRepository = new ProvinciaRepository();
  const municipioRepository = new MunicipioRepository();
  const geograficasService = new GeograficasService(
    provinciaRepository,
    municipioRepository
  );
  const geograficasController = new GeograficasController(geograficasService);

  // RUTAS PROVINCIAS

  // GET /api/geograficas/provincias
  // Lista todas las provincias
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/provincias",
    {
      onRequest: [authenticate],
      schema: {
        description: "Lista todas las provincias",
        tags: ["geograficas"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        response: {
          200: ProvinciasListResponseSchema,
          401: GeograficaErrorSchema,
          500: GeograficaErrorSchema,
        },
      },
    },
    async (request, reply) =>
      geograficasController.listProvincias(request, reply)
  );

  // GET /api/geograficas/provincias/:id
  // Obtiene una provincia por ID
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/provincias/:id",
    {
      onRequest: [authenticate],
      schema: {
        description: "Obtiene una provincia por ID",
        tags: ["geograficas"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: GeograficaParamsSchema,
        response: {
          200: z.object({ provincia: ProvinciaResponseSchema }),
          401: GeograficaErrorSchema,
          404: GeograficaErrorSchema,
          500: GeograficaErrorSchema,
        },
      },
    },
    async (request, reply) =>
      geograficasController.getProvinciaById(request, reply)
  );

  // POST /api/geograficas/provincias
  // Crea una nueva provincia
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/provincias",
    {
      onRequest: [authenticate, requireRoles("gerente", "administrador")],
      schema: {
        description: "Crea una nueva provincia",
        tags: ["geograficas"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        body: CreateProvinciaSchema,
        response: {
          201: z.object({
            provincia: ProvinciaResponseSchema,
            message: z.string(),
          }),
          401: GeograficaErrorSchema,
          403: GeograficaErrorSchema,
          409: GeograficaErrorSchema,
          500: GeograficaErrorSchema,
        },
      },
    },
    async (request, reply) =>
      geograficasController.createProvincia(request, reply)
  );

  // PUT /api/geograficas/provincias/:id
  // Actualiza una provincia existente
  fastify.withTypeProvider<ZodTypeProvider>().put(
    "/provincias/:id",
    {
      onRequest: [authenticate, requireRoles("gerente", "administrador")],
      schema: {
        description: "Actualiza una provincia existente",
        tags: ["geograficas"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: GeograficaParamsSchema,
        body: UpdateProvinciaSchema,
        response: {
          200: z.object({
            provincia: ProvinciaResponseSchema,
            message: z.string(),
          }),
          401: GeograficaErrorSchema,
          403: GeograficaErrorSchema,
          404: GeograficaErrorSchema,
          500: GeograficaErrorSchema,
        },
      },
    },
    async (request, reply) =>
      geograficasController.updateProvincia(request, reply)
  );

  // DELETE /api/geograficas/provincias/:id
  // Elimina (desactiva) una provincia
  fastify.withTypeProvider<ZodTypeProvider>().delete(
    "/provincias/:id",
    {
      onRequest: [authenticate, requireRoles("gerente", "administrador")],
      schema: {
        description: "Elimina (desactiva) una provincia",
        tags: ["geograficas"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: GeograficaParamsSchema,
        response: {
          204: {
            type: "null",
            description: "Provincia eliminada exitosamente",
          },
          401: GeograficaErrorSchema,
          403: GeograficaErrorSchema,
          404: GeograficaErrorSchema,
          500: GeograficaErrorSchema,
        },
      },
    },
    async (request, reply) =>
      geograficasController.deleteProvincia(request, reply)
  );

  // RUTAS MUNICIPIOS

  // GET /api/geograficas/municipios
  // Lista municipios con filtro opcional por provincia
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/municipios",
    {
      onRequest: [authenticate],
      schema: {
        description: "Lista municipios con filtro opcional por provincia",
        tags: ["geograficas"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        querystring: GeograficaQuerySchema,
        response: {
          200: MunicipiosListResponseSchema,
          401: GeograficaErrorSchema,
          500: GeograficaErrorSchema,
        },
      },
    },
    async (request, reply) =>
      geograficasController.listMunicipios(request, reply)
  );

  // GET /api/geograficas/municipios/:id
  // Obtiene un municipio por ID
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/municipios/:id",
    {
      onRequest: [authenticate],
      schema: {
        description: "Obtiene un municipio por ID",
        tags: ["geograficas"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: GeograficaParamsSchema,
        response: {
          200: z.object({ municipio: MunicipioResponseSchema }),
          401: GeograficaErrorSchema,
          404: GeograficaErrorSchema,
          500: GeograficaErrorSchema,
        },
      },
    },
    async (request, reply) =>
      geograficasController.getMunicipioById(request, reply)
  );

  // POST /api/geograficas/municipios
  // Crea un nuevo municipio
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/municipios",
    {
      onRequest: [authenticate, requireRoles("gerente", "administrador")],
      schema: {
        description: "Crea un nuevo municipio",
        tags: ["geograficas"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        body: CreateMunicipioSchema,
        response: {
          201: z.object({
            municipio: MunicipioResponseSchema,
            message: z.string(),
          }),
          401: GeograficaErrorSchema,
          403: GeograficaErrorSchema,
          404: GeograficaErrorSchema,
          409: GeograficaErrorSchema,
          500: GeograficaErrorSchema,
        },
      },
    },
    async (request, reply) =>
      geograficasController.createMunicipio(request, reply)
  );

  // PUT /api/geograficas/municipios/:id
  // Actualiza un municipio existente
  fastify.withTypeProvider<ZodTypeProvider>().put(
    "/municipios/:id",
    {
      onRequest: [authenticate, requireRoles("gerente", "administrador")],
      schema: {
        description: "Actualiza un municipio existente",
        tags: ["geograficas"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: GeograficaParamsSchema,
        body: UpdateMunicipioSchema,
        response: {
          200: z.object({
            municipio: MunicipioResponseSchema,
            message: z.string(),
          }),
          401: GeograficaErrorSchema,
          403: GeograficaErrorSchema,
          404: GeograficaErrorSchema,
          500: GeograficaErrorSchema,
        },
      },
    },
    async (request, reply) =>
      geograficasController.updateMunicipio(request, reply)
  );

  // DELETE /api/geograficas/municipios/:id
  // Elimina (desactiva) un municipio
  fastify.withTypeProvider<ZodTypeProvider>().delete(
    "/municipios/:id",
    {
      onRequest: [authenticate, requireRoles("gerente", "administrador")],
      schema: {
        description: "Elimina (desactiva) un municipio",
        tags: ["geograficas"],
        headers: z.object({
          authorization: z.string().describe("Bearer token"),
        }),
        params: GeograficaParamsSchema,
        response: {
          204: {
            type: "null",
            description: "Municipio eliminado exitosamente",
          },
          401: GeograficaErrorSchema,
          403: GeograficaErrorSchema,
          404: GeograficaErrorSchema,
          500: GeograficaErrorSchema,
        },
      },
    },
    async (request, reply) =>
      geograficasController.deleteMunicipio(request, reply)
  );
}
