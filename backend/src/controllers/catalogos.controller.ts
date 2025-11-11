import { FastifyRequest, FastifyReply } from "fastify";
import { CatalogosService } from "../services/catalogos.service.js";
import {
  CreateTipoCultivoInput,
  UpdateTipoCultivoInput,
  CatalogoParams,
  CatalogoQuery,
} from "../schemas/catalogos.schema.js";

// Controlador para endpoints de catalogos (solo tipos de cultivo)
// NOTA: Gestiones ahora tienen su propio controller en gestiones.controller.ts
// Solo admin puede crear, actualizar o eliminar catalogos
export class CatalogosController {
  constructor(private catalogosService: CatalogosService) {}

  // GET /api/catalogos/tipos-cultivo
  // Lista todos los tipos de cultivo disponibles
  // Puede filtrar solo los activos con query param activo=true
  // Acceso: todos los roles autenticados
  async listTiposCultivo(
    request: FastifyRequest<{ Querystring: CatalogoQuery }>,
    reply: FastifyReply
  ) {
    try {
      const { activo } = request.query;
      const soloActivos = activo !== undefined ? activo : true;
      const result = await this.catalogosService.listTiposCultivo(soloActivos);
      return reply.status(200).send(result);
    } catch (error) {
      request.log.error(error, "Error listing tipos cultivo");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al listar tipos de cultivo",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // GET /api/catalogos/tipos-cultivo/:id
  // Obtiene un tipo cultivo especifico por su ID
  // Acceso: todos los roles autenticados
  async getTipoCultivoById(
    request: FastifyRequest<{ Params: CatalogoParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const tipoCultivo = await this.catalogosService.getTipoCultivoById(id);
      return reply.status(200).send({ tipo_cultivo: tipoCultivo });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Tipo cultivo no encontrado"
      ) {
        return reply.status(404).send({
          error: "not_found",
          message: "Tipo cultivo no encontrado",
          timestamp: new Date().toISOString(),
        });
      }
      request.log.error(error, "Error getting tipo cultivo");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al obtener tipo cultivo",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // POST /api/catalogos/tipos-cultivo
  // Crea un nuevo tipo de cultivo en el sistema
  // Valida que no exista duplicado por nombre
  // Acceso: solo admin
  async createTipoCultivo(
    request: FastifyRequest<{ Body: CreateTipoCultivoInput }>,
    reply: FastifyReply
  ) {
    try {
      const tipoCultivo = await this.catalogosService.createTipoCultivo(
        request.body
      );
      return reply.status(201).send({
        tipo_cultivo: tipoCultivo,
        message: "Tipo cultivo creado exitosamente",
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Ya existe")) {
        return reply.status(409).send({
          error: "conflict",
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      }
      request.log.error(error, "Error creating tipo cultivo");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al crear tipo cultivo",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // PUT /api/catalogos/tipos-cultivo/:id
  // Actualiza un tipo cultivo existente
  // Puede modificar nombre, descripcion, rendimiento, etc
  // Acceso: solo admin
  async updateTipoCultivo(
    request: FastifyRequest<{
      Params: CatalogoParams;
      Body: UpdateTipoCultivoInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const tipoCultivo = await this.catalogosService.updateTipoCultivo(
        id,
        request.body
      );
      return reply.status(200).send({
        tipo_cultivo: tipoCultivo,
        message: "Tipo cultivo actualizado exitosamente",
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Tipo cultivo no encontrado"
      ) {
        return reply.status(404).send({
          error: "not_found",
          message: "Tipo cultivo no encontrado",
          timestamp: new Date().toISOString(),
        });
      }
      request.log.error(error, "Error updating tipo cultivo");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al actualizar tipo cultivo",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // DELETE /api/catalogos/tipos-cultivo/:id
  // Elimina (desactiva) un tipo cultivo
  // No borra fisicamente, solo marca como inactivo
  // Acceso: solo admin
  async deleteTipoCultivo(
    request: FastifyRequest<{ Params: CatalogoParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      await this.catalogosService.deleteTipoCultivo(id);
      return reply.status(204).send();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Tipo cultivo no encontrado"
      ) {
        return reply.status(404).send({
          error: "not_found",
          message: "Tipo cultivo no encontrado",
          timestamp: new Date().toISOString(),
        });
      }
      request.log.error(error, "Error deleting tipo cultivo");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al eliminar tipo cultivo",
        timestamp: new Date().toISOString(),
      });
    }
  }

}
