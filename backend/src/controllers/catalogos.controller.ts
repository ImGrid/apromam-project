import { FastifyRequest, FastifyReply } from "fastify";
import { CatalogosService } from "../services/catalogos.service.js";
import type {
  CreateTipoCultivoInput,
  UpdateTipoCultivoInput,
  CreateGestionInput,
  UpdateGestionInput,
  CatalogoParams,
  CatalogoQuery,
} from "../schemas/catalogos.schema.js";

/**
 * Controller para endpoints de catálogos
 */
export class CatalogosController {
  constructor(private catalogosService: CatalogosService) {}

  // ==========================================
  // TIPOS CULTIVO
  // ==========================================

  /**
   * GET /api/catalogos/tipos-cultivo
   * Lista todos los tipos de cultivo
   * Acceso: todos los roles autenticados
   */
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

  /**
   * GET /api/catalogos/tipos-cultivo/:id
   * Obtiene un tipo cultivo por ID
   * Acceso: todos los roles autenticados
   */
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

  /**
   * POST /api/catalogos/tipos-cultivo
   * Crea un nuevo tipo cultivo
   * Acceso: solo admin
   */
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

  /**
   * PUT /api/catalogos/tipos-cultivo/:id
   * Actualiza un tipo cultivo existente
   * Acceso: solo admin
   */
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

  /**
   * DELETE /api/catalogos/tipos-cultivo/:id
   * Elimina (desactiva) un tipo cultivo
   * Acceso: solo admin
   */
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

  // ==========================================
  // GESTIONES
  // ==========================================

  /**
   * GET /api/catalogos/gestiones
   * Lista todas las gestiones
   * Acceso: todos los roles autenticados
   */
  async listGestiones(
    request: FastifyRequest<{ Querystring: CatalogoQuery }>,
    reply: FastifyReply
  ) {
    try {
      const { activo } = request.query;
      const soloActivas = activo !== undefined ? activo : true;
      const result = await this.catalogosService.listGestiones(soloActivas);
      return reply.status(200).send(result);
    } catch (error) {
      request.log.error(error, "Error listing gestiones");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al listar gestiones",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * GET /api/catalogos/gestiones/:id
   * Obtiene una gestión por ID
   * Acceso: todos los roles autenticados
   */
  async getGestionById(
    request: FastifyRequest<{ Params: CatalogoParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const gestion = await this.catalogosService.getGestionById(id);
      return reply.status(200).send({ gestion });
    } catch (error) {
      if (error instanceof Error && error.message === "Gestión no encontrada") {
        return reply.status(404).send({
          error: "not_found",
          message: "Gestión no encontrada",
          timestamp: new Date().toISOString(),
        });
      }
      request.log.error(error, "Error getting gestion");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al obtener gestión",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * GET /api/catalogos/gestiones/actual
   * Obtiene la gestión actual (año actual)
   * Acceso: todos los roles autenticados
   */
  async getGestionActual(request: FastifyRequest, reply: FastifyReply) {
    try {
      const gestion = await this.catalogosService.getGestionActual();
      if (!gestion) {
        return reply.status(404).send({
          error: "not_found",
          message: "No existe gestión para el año actual",
          timestamp: new Date().toISOString(),
        });
      }
      return reply.status(200).send({ gestion });
    } catch (error) {
      request.log.error(error, "Error getting gestion actual");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al obtener gestión actual",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * POST /api/catalogos/gestiones
   * Crea una nueva gestión
   * Acceso: solo admin
   */
  async createGestion(
    request: FastifyRequest<{ Body: CreateGestionInput }>,
    reply: FastifyReply
  ) {
    try {
      const gestion = await this.catalogosService.createGestion(request.body);
      return reply.status(201).send({
        gestion,
        message: "Gestión creada exitosamente",
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Ya existe")) {
        return reply.status(409).send({
          error: "conflict",
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      }
      request.log.error(error, "Error creating gestion");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al crear gestión",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * PUT /api/catalogos/gestiones/:id
   * Actualiza una gestión existente
   * Acceso: solo admin
   */
  async updateGestion(
    request: FastifyRequest<{
      Params: CatalogoParams;
      Body: UpdateGestionInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const gestion = await this.catalogosService.updateGestion(
        id,
        request.body
      );
      return reply.status(200).send({
        gestion,
        message: "Gestión actualizada exitosamente",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Gestión no encontrada") {
        return reply.status(404).send({
          error: "not_found",
          message: "Gestión no encontrada",
          timestamp: new Date().toISOString(),
        });
      }
      request.log.error(error, "Error updating gestion");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al actualizar gestión",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * DELETE /api/catalogos/gestiones/:id
   * Elimina (desactiva) una gestión
   * Acceso: solo admin
   */
  async deleteGestion(
    request: FastifyRequest<{ Params: CatalogoParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      await this.catalogosService.deleteGestion(id);
      return reply.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === "Gestión no encontrada") {
        return reply.status(404).send({
          error: "not_found",
          message: "Gestión no encontrada",
          timestamp: new Date().toISOString(),
        });
      }
      request.log.error(error, "Error deleting gestion");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al eliminar gestión",
        timestamp: new Date().toISOString(),
      });
    }
  }
}
