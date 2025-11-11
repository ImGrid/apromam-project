import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { GeograficasController } from "../controllers/geograficas.controller.js";
import { GeograficasService } from "../services/geograficas.service.js";
import { DepartamentoRepository } from "../repositories/DepartamentoRepository.js";
import { ProvinciaRepository } from "../repositories/ProvinciaRepository.js";
import { MunicipioRepository } from "../repositories/MunicipioRepository.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRoles } from "../middleware/authorize.js";
import {
  CreateDepartamentoSchema,
  UpdateDepartamentoSchema,
  DepartamentosListResponseSchema,
  DepartamentoResponseSchema,
  DepartamentoQuerySchema,
  CreateProvinciaSchema,
  UpdateProvinciaSchema,
  CreateMunicipioSchema,
  UpdateMunicipioSchema,
  GeograficaParamsSchema,
  ProvinciaQuerySchema,
  MunicipioQuerySchema,
  ProvinciasListResponseSchema,
  ProvinciaResponseSchema,
  MunicipiosListResponseSchema,
  MunicipioResponseSchema,
  GeograficaErrorSchema,
} from "../schemas/geograficas.schema.js";
import { z } from "zod";

// Plugin de rutas para jerarquia geografica
// Gestiona departamentos, provincias y municipios
const geograficasRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  // Inicializar dependencias
  const departamentoRepository = new DepartamentoRepository();
  const provinciaRepository = new ProvinciaRepository();
  const municipioRepository = new MunicipioRepository();
  const geograficasService = new GeograficasService(
    departamentoRepository,
    provinciaRepository,
    municipioRepository
  );
  const geograficasController = new GeograficasController(geograficasService);

  // RUTAS DEPARTAMENTOS

  // GET /api/geograficas/departamentos
  // Lista todos los departamentos con filtros opcionales
  fastify.route({
    method: "GET",
    url: "/departamentos",
    onRequest: [authenticate],
    schema: {
      description: "Lista todos los departamentos con filtros opcionales (nombre, activo)",
      tags: ["geograficas"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      querystring: DepartamentoQuerySchema,
      response: {
        200: DepartamentosListResponseSchema,
        401: GeograficaErrorSchema,
        500: GeograficaErrorSchema,
      },
    },
    handler: geograficasController.listDepartamentos.bind(geograficasController) as any,
  });

  // GET /api/geograficas/departamentos/:id
  // Obtiene un departamento por ID
  fastify.route({
    method: "GET",
    url: "/departamentos/:id",
    onRequest: [authenticate],
    schema: {
      description: "Obtiene un departamento por ID",
      tags: ["geograficas"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: GeograficaParamsSchema,
      response: {
        200: z.object({ departamento: DepartamentoResponseSchema }),
        401: GeograficaErrorSchema,
        404: GeograficaErrorSchema,
        500: GeograficaErrorSchema,
      },
    },
    handler: geograficasController.getDepartamentoById.bind(geograficasController) as any,
  });

  // POST /api/geograficas/departamentos
  // Crea un nuevo departamento
  fastify.route({
    method: "POST",
    url: "/departamentos",
    onRequest: [authenticate, requireRoles("gerente", "administrador")],
    schema: {
      description: "Crea un nuevo departamento",
      tags: ["geograficas"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      body: CreateDepartamentoSchema,
      response: {
        201: z.object({
          departamento: DepartamentoResponseSchema,
          message: z.string(),
        }),
        401: GeograficaErrorSchema,
        403: GeograficaErrorSchema,
        409: GeograficaErrorSchema,
        500: GeograficaErrorSchema,
      },
    },
    handler: geograficasController.createDepartamento.bind(geograficasController) as any,
  });

  // PUT /api/geograficas/departamentos/:id
  // Actualiza un departamento existente
  fastify.route({
    method: "PUT",
    url: "/departamentos/:id",
    onRequest: [authenticate, requireRoles("gerente", "administrador")],
    schema: {
      description: "Actualiza un departamento existente",
      tags: ["geograficas"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: GeograficaParamsSchema,
      body: UpdateDepartamentoSchema,
      response: {
        200: z.object({
          departamento: DepartamentoResponseSchema,
          message: z.string(),
        }),
        401: GeograficaErrorSchema,
        403: GeograficaErrorSchema,
        404: GeograficaErrorSchema,
        500: GeograficaErrorSchema,
      },
    },
    handler: geograficasController.updateDepartamento.bind(geograficasController) as any,
  });

  // DELETE /api/geograficas/departamentos/:id
  // Elimina (desactiva) un departamento
  fastify.route({
    method: "DELETE",
    url: "/departamentos/:id",
    onRequest: [authenticate, requireRoles("gerente", "administrador")],
    schema: {
      description: "Elimina (desactiva) un departamento",
      tags: ["geograficas"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: GeograficaParamsSchema,
      response: {
        204: {
          type: "null",
          description: "Departamento eliminado exitosamente",
        },
        401: GeograficaErrorSchema,
        403: GeograficaErrorSchema,
        404: GeograficaErrorSchema,
        500: GeograficaErrorSchema,
      },
    },
    handler: geograficasController.deleteDepartamento.bind(geograficasController) as any,
  });

  // RUTAS PROVINCIAS

  // GET /api/geograficas/provincias
  // Lista todas las provincias con filtros opcionales
  fastify.route({
    method: "GET",
    url: "/provincias",
    onRequest: [authenticate],
    schema: {
      description: "Lista todas las provincias con filtros opcionales (nombre, departamento, activo)",
      tags: ["geograficas"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      querystring: ProvinciaQuerySchema,
      response: {
        200: ProvinciasListResponseSchema,
        401: GeograficaErrorSchema,
        500: GeograficaErrorSchema,
      },
    },
    handler: geograficasController.listProvincias.bind(geograficasController) as any,
  });

  // GET /api/geograficas/provincias/:id
  // Obtiene una provincia por ID
  fastify.route({
    method: "GET",
    url: "/provincias/:id",
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
    handler: geograficasController.getProvinciaById.bind(geograficasController) as any,
  });

  // POST /api/geograficas/provincias
  // Crea una nueva provincia
  fastify.route({
    method: "POST",
    url: "/provincias",
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
    handler: geograficasController.createProvincia.bind(geograficasController) as any,
  });

  // PUT /api/geograficas/provincias/:id
  // Actualiza una provincia existente
  fastify.route({
    method: "PUT",
    url: "/provincias/:id",
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
    handler: geograficasController.updateProvincia.bind(geograficasController) as any,
  });

  // DELETE /api/geograficas/provincias/:id
  // Elimina (desactiva) una provincia
  fastify.route({
    method: "DELETE",
    url: "/provincias/:id",
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
    handler: geograficasController.deleteProvincia.bind(geograficasController) as any,
  });

  // RUTAS MUNICIPIOS

  // GET /api/geograficas/municipios
  // Lista municipios con filtros opcionales
  fastify.route({
    method: "GET",
    url: "/municipios",
    onRequest: [authenticate],
    schema: {
      description: "Lista municipios con filtros opcionales (nombre, provincia, activo)",
      tags: ["geograficas"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      querystring: MunicipioQuerySchema,
      response: {
        200: MunicipiosListResponseSchema,
        401: GeograficaErrorSchema,
        500: GeograficaErrorSchema,
      },
    },
    handler: geograficasController.listMunicipios.bind(geograficasController) as any,
  });

  // GET /api/geograficas/municipios/:id
  // Obtiene un municipio por ID
  fastify.route({
    method: "GET",
    url: "/municipios/:id",
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
    handler: geograficasController.getMunicipioById.bind(geograficasController) as any,
  });

  // POST /api/geograficas/municipios
  // Crea un nuevo municipio
  fastify.route({
    method: "POST",
    url: "/municipios",
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
    handler: geograficasController.createMunicipio.bind(geograficasController) as any,
  });

  // PUT /api/geograficas/municipios/:id
  // Actualiza un municipio existente
  fastify.route({
    method: "PUT",
    url: "/municipios/:id",
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
    handler: geograficasController.updateMunicipio.bind(geograficasController) as any,
  });

  // DELETE /api/geograficas/municipios/:id
  // Elimina (desactiva) un municipio
  fastify.route({
    method: "DELETE",
    url: "/municipios/:id",
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
    handler: geograficasController.deleteMunicipio.bind(geograficasController) as any,
  });

  // RUTAS HARD DELETE (ELIMINACION PERMANENTE)
  // Solo acceso para administrador

  // DELETE /api/geograficas/departamentos/:id/permanent
  // Elimina PERMANENTEMENTE un departamento
  fastify.route({
    method: "DELETE",
    url: "/departamentos/:id/permanent",
    onRequest: [authenticate, requireRoles("administrador")],
    schema: {
      description: "Elimina PERMANENTEMENTE un departamento (solo si no tiene provincias)",
      tags: ["geograficas"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: GeograficaParamsSchema,
      response: {
        204: {
          type: "null",
          description: "Departamento eliminado permanentemente",
        },
        400: GeograficaErrorSchema,
        401: GeograficaErrorSchema,
        403: GeograficaErrorSchema,
        500: GeograficaErrorSchema,
      },
    },
    handler: geograficasController.hardDeleteDepartamento.bind(geograficasController) as any,
  });

  // DELETE /api/geograficas/provincias/:id/permanent
  // Elimina PERMANENTEMENTE una provincia
  fastify.route({
    method: "DELETE",
    url: "/provincias/:id/permanent",
    onRequest: [authenticate, requireRoles("administrador")],
    schema: {
      description: "Elimina PERMANENTEMENTE una provincia (solo si no tiene municipios)",
      tags: ["geograficas"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: GeograficaParamsSchema,
      response: {
        204: {
          type: "null",
          description: "Provincia eliminada permanentemente",
        },
        400: GeograficaErrorSchema,
        401: GeograficaErrorSchema,
        403: GeograficaErrorSchema,
        500: GeograficaErrorSchema,
      },
    },
    handler: geograficasController.hardDeleteProvincia.bind(geograficasController) as any,
  });

  // DELETE /api/geograficas/municipios/:id/permanent
  // Elimina PERMANENTEMENTE un municipio
  fastify.route({
    method: "DELETE",
    url: "/municipios/:id/permanent",
    onRequest: [authenticate, requireRoles("administrador")],
    schema: {
      description: "Elimina PERMANENTEMENTE un municipio (solo si no tiene comunidades)",
      tags: ["geograficas"],
      headers: z.object({
        authorization: z.string().describe("Bearer token"),
      }),
      params: GeograficaParamsSchema,
      response: {
        204: {
          type: "null",
          description: "Municipio eliminado permanentemente",
        },
        400: GeograficaErrorSchema,
        401: GeograficaErrorSchema,
        403: GeograficaErrorSchema,
        500: GeograficaErrorSchema,
      },
    },
    handler: geograficasController.hardDeleteMunicipio.bind(geograficasController) as any,
  });
};

export default geograficasRoutes;
