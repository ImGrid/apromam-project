import { FastifyRequest, FastifyReply } from "fastify";
import { OrganizacionesService } from "../services/organizaciones.service.js";
import {
  CreateOrganizacionInput,
  UpdateOrganizacionInput,
  OrganizacionParams,
} from "../schemas/organizaciones.schema.js";

// Controlador para endpoints de organizaciones
// Las organizaciones son independientes de la jerarquia geografica
// Solo admin y gerente pueden crear, actualizar o eliminar
export class OrganizacionesController {
  constructor(private organizacionesService: OrganizacionesService) {}

  // GET /api/organizaciones
  // Lista todas las organizaciones
  // Acceso: todos los roles autenticados
  async listOrganizaciones(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await this.organizacionesService.listOrganizaciones();
      return reply.status(200).send(result);
    } catch (error) {
      request.log.error(error, "Error listing organizaciones");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al listar organizaciones",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // GET /api/organizaciones/:id
  // Obtiene una organizacion por ID
  // Acceso: todos los roles autenticados
  async getOrganizacionById(
    request: FastifyRequest<{ Params: OrganizacionParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const organizacion = await this.organizacionesService.getOrganizacionById(
        id
      );
      return reply.status(200).send({ organizacion });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Organización no encontrada"
      ) {
        return reply.status(404).send({
          error: "not_found",
          message: "Organización no encontrada",
          timestamp: new Date().toISOString(),
        });
      }
      request.log.error(error, "Error getting organizacion");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al obtener organización",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // POST /api/organizaciones
  // Crea una nueva organizacion
  // Acceso: solo admin y gerente
  async createOrganizacion(
    request: FastifyRequest<{ Body: CreateOrganizacionInput }>,
    reply: FastifyReply
  ) {
    try {
      const organizacion = await this.organizacionesService.createOrganizacion(
        request.body
      );
      return reply.status(201).send({
        organizacion,
        message: "Organización creada exitosamente",
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Ya existe")) {
        return reply.status(409).send({
          error: "conflict",
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      }
      request.log.error(error, "Error creating organizacion");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al crear organización",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // PUT /api/organizaciones/:id
  // Actualiza una organizacion existente
  // Acceso: solo admin y gerente
  async updateOrganizacion(
    request: FastifyRequest<{
      Params: OrganizacionParams;
      Body: UpdateOrganizacionInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const organizacion = await this.organizacionesService.updateOrganizacion(
        id,
        request.body
      );
      return reply.status(200).send({
        organizacion,
        message: "Organización actualizada exitosamente",
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Organización no encontrada"
      ) {
        return reply.status(404).send({
          error: "not_found",
          message: "Organización no encontrada",
          timestamp: new Date().toISOString(),
        });
      }
      request.log.error(error, "Error updating organizacion");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al actualizar organización",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // DELETE /api/organizaciones/:id
  // Elimina (desactiva) una organizacion
  // Acceso: solo admin y gerente
  async deleteOrganizacion(
    request: FastifyRequest<{ Params: OrganizacionParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      await this.organizacionesService.deleteOrganizacion(id);
      return reply.status(204).send();
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "Organización no encontrada" ||
          error.message.includes("tiene"))
      ) {
        return reply.status(404).send({
          error: "not_found",
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      }
      request.log.error(error, "Error deleting organizacion");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al eliminar organización",
        timestamp: new Date().toISOString(),
      });
    }
  }
}
