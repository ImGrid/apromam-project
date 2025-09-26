import { FastifyRequest, FastifyReply } from "fastify";
import { ComunidadesService } from "../services/comunidades.service.js";
import type {
  CreateComunidadInput,
  UpdateComunidadInput,
  ComunidadParams,
  ComunidadQuery,
} from "../schemas/comunidades.schema.js";

/**
 * Controller para endpoints de comunidades
 */
export class ComunidadesController {
  constructor(private comunidadesService: ComunidadesService) {}

  /**
   * GET /api/comunidades
   * Lista todas las comunidades con filtros opcionales
   * Acceso: técnico, gerente, admin
   */
  async list(
    request: FastifyRequest<{ Querystring: ComunidadQuery }>,
    reply: FastifyReply
  ) {
    try {
      const { municipio, provincia, sin_tecnicos } = request.query;
      const result = await this.comunidadesService.listAll(
        municipio,
        provincia,
        sin_tecnicos
      );
      return reply.status(200).send(result);
    } catch (error) {
      request.log.error(error, "Error listing comunidades");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al listar comunidades",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * GET /api/comunidades/:id
   * Obtiene una comunidad por ID
   * Acceso: técnico, gerente, admin
   */
  async getById(
    request: FastifyRequest<{ Params: ComunidadParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const comunidad = await this.comunidadesService.getById(id);
      return reply.status(200).send({ comunidad });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Comunidad no encontrada"
      ) {
        return reply.status(404).send({
          error: "not_found",
          message: "Comunidad no encontrada",
          timestamp: new Date().toISOString(),
        });
      }
      request.log.error(error, "Error getting comunidad");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al obtener comunidad",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * POST /api/comunidades
   * Crea una nueva comunidad
   * Acceso: solo admin
   */
  async create(
    request: FastifyRequest<{ Body: CreateComunidadInput }>,
    reply: FastifyReply
  ) {
    try {
      const comunidad = await this.comunidadesService.create(request.body);
      return reply.status(201).send({
        comunidad,
        message: "Comunidad creada exitosamente",
      });
    } catch (error) {
      if (error instanceof Error) {
        // Error de duplicado
        if (error.message.includes("Ya existe")) {
          return reply.status(409).send({
            error: "conflict",
            message: error.message,
            timestamp: new Date().toISOString(),
          });
        }
        // Error de validación
        if (error.message.includes("Validación falló")) {
          return reply.status(400).send({
            error: "validation_error",
            message: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      }
      request.log.error(error, "Error creating comunidad");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al crear comunidad",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * PUT /api/comunidades/:id
   * Actualiza una comunidad existente
   * Acceso: solo admin
   */
  async update(
    request: FastifyRequest<{
      Params: ComunidadParams;
      Body: UpdateComunidadInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const comunidad = await this.comunidadesService.update(id, request.body);
      return reply.status(200).send({
        comunidad,
        message: "Comunidad actualizada exitosamente",
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Comunidad no encontrada"
      ) {
        return reply.status(404).send({
          error: "not_found",
          message: "Comunidad no encontrada",
          timestamp: new Date().toISOString(),
        });
      }
      request.log.error(error, "Error updating comunidad");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al actualizar comunidad",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * DELETE /api/comunidades/:id
   * Elimina (desactiva) una comunidad
   * Acceso: solo admin
   */
  async delete(
    request: FastifyRequest<{ Params: ComunidadParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      await this.comunidadesService.delete(id);
      return reply.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Comunidad no encontrada") {
          return reply.status(404).send({
            error: "not_found",
            message: "Comunidad no encontrada",
            timestamp: new Date().toISOString(),
          });
        }
        // Error de integridad referencial
        if (error.message.includes("tiene")) {
          return reply.status(409).send({
            error: "conflict",
            message: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      }
      request.log.error(error, "Error deleting comunidad");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al eliminar comunidad",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * GET /api/comunidades/sin-tecnicos
   * Lista comunidades sin técnicos asignados
   * Acceso: gerente, admin
   */
  async listWithoutTecnicos(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await this.comunidadesService.listWithoutTecnicos();
      return reply.status(200).send(result);
    } catch (error) {
      request.log.error(error, "Error listing comunidades sin tecnicos");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al listar comunidades sin técnicos",
        timestamp: new Date().toISOString(),
      });
    }
  }
}
