import { FastifyRequest, FastifyReply } from "fastify";
import { ComunidadesService } from "../services/comunidades.service.js";
import {
  CreateComunidadInput,
  UpdateComunidadInput,
  ComunidadParams,
  ComunidadQuery,
} from "../schemas/comunidades.schema.js";

// Controlador para endpoints de comunidades
// Gestiona la estructura geografica donde trabajan los tecnicos
// Solo admin puede crear, actualizar o eliminar comunidades
export class ComunidadesController {
  constructor(private comunidadesService: ComunidadesService) {}

  // GET /api/comunidades
  // Lista todas las comunidades con filtros opcionales
  // Puede filtrar por nombre, municipio, provincia, sin_tecnicos o activo
  // Acceso: tecnico, gerente, admin
  async list(
    request: FastifyRequest<{ Querystring: ComunidadQuery }>,
    reply: FastifyReply
  ) {
    try {
      const { nombre, municipio, provincia, sin_tecnicos, activo } =
        request.query;
      const result = await this.comunidadesService.listAll(
        nombre,
        municipio,
        provincia,
        sin_tecnicos,
        activo
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

  // GET /api/comunidades/:id
  // Obtiene una comunidad especifica por su ID
  // Incluye datos de municipio, provincia y contadores de tecnicos/productores
  // Acceso: tecnico, gerente, admin
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

  // POST /api/comunidades
  // Crea una nueva comunidad en el sistema
  // Requiere municipio existente y nombre unico dentro del municipio
  // Acceso: solo admin
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
        // Error 409: Ya existe comunidad con ese nombre en el municipio
        if (error.message.includes("Ya existe")) {
          return reply.status(409).send({
            error: "conflict",
            message: error.message,
            timestamp: new Date().toISOString(),
          });
        }
        // Error 400: Validacion de datos fallida
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

  // PUT /api/comunidades/:id
  // Actualiza una comunidad existente
  // Puede modificar nombre o estado activo/inactivo
  // Acceso: solo admin
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

  // DELETE /api/comunidades/:id
  // Elimina (desactiva) una comunidad
  // No borra fisicamente, solo marca como inactiva
  // No permite eliminar si tiene tecnicos o productores asignados
  // Acceso: solo admin
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
        // Error 409: No se puede eliminar por tener asignaciones
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

  // DELETE /api/comunidades/:id/permanent
  // Elimina PERMANENTEMENTE una comunidad
  // Verifica que no tenga usuarios ni productores asociados
  // Acceso: admin
  async hardDelete(
    request: FastifyRequest<{ Params: ComunidadParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      request.log.info({ comunidad_id: id }, "Hard deleting comunidad");

      await this.comunidadesService.hardDelete(id);

      request.log.info({ comunidad_id: id }, "Comunidad permanently deleted");
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
        // Error 409: No se puede eliminar por tener dependencias
        if (error.message.includes("tiene") || error.message.includes("asociado")) {
          return reply.status(409).send({
            error: "conflict",
            message: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      }
      request.log.error(error, "Error hard deleting comunidad");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al eliminar permanentemente comunidad",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // GET /api/comunidades/sin-tecnicos
  // Lista comunidades que no tienen tecnicos asignados
  // Util para alertas y gestion de asignaciones
  // Acceso: gerente, admin
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
