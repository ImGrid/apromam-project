import { FastifyRequest, FastifyReply } from "fastify";
import { GestionesService } from "../services/gestiones.service.js";
import {
  CreateGestionInput,
  UpdateGestionInput,
  CatalogoParams,
  CatalogoQuery,
} from "../schemas/catalogos.schema.js";

/**
 * Controller para gestión de gestiones (años agrícolas)
 * Gestiones es crítico porque define el alcance temporal de todas las operaciones
 */
export class GestionesController {
  private gestionesService: GestionesService;

  constructor(gestionesService: GestionesService) {
    this.gestionesService = gestionesService;
  }

  /**
   * GET /api/gestiones
   * Lista todas las gestiones
   */
  async listGestiones(
    request: FastifyRequest<{ Querystring: CatalogoQuery }>,
    reply: FastifyReply
  ) {
    try {
      const { activo } = request.query;
      const soloActivas = activo !== false;

      const result = await this.gestionesService.listGestiones(soloActivas);

      return reply.status(200).send({
        data: result.gestiones,
        total: result.total,
      });
    } catch (error) {
      request.log.error(
        {
          error: error instanceof Error ? error.message : "Unknown error",
        },
        "Error listing gestiones"
      );

      return reply.status(500).send({
        error: "INTERNAL_ERROR",
        message: "Error al obtener gestiones",
      });
    }
  }

  /**
   * GET /api/gestiones/activa
   * Obtiene la gestión activa del sistema (activo_sistema = true)
   */
  async getGestionActiva(request: FastifyRequest, reply: FastifyReply) {
    try {
      const gestion = await this.gestionesService.getGestionActiva();

      if (!gestion) {
        return reply.status(404).send({
          error: "NO_ACTIVE_GESTION",
          message: "No hay gestión activa configurada en el sistema",
        });
      }

      return reply.status(200).send({
        data: gestion,
      });
    } catch (error) {
      request.log.error(
        {
          error: error instanceof Error ? error.message : "Unknown error",
        },
        "Error getting gestion activa"
      );

      return reply.status(500).send({
        error: "INTERNAL_ERROR",
        message: "Error al obtener gestión activa",
      });
    }
  }

  /**
   * GET /api/gestiones/:id
   * Obtiene una gestión por ID
   */
  async getGestionById(
    request: FastifyRequest<{ Params: CatalogoParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const gestion = await this.gestionesService.getGestionById(id);

      return reply.status(200).send({
        data: gestion,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Gestión no encontrada"
      ) {
        return reply.status(404).send({
          error: "NOT_FOUND",
          message: error.message,
        });
      }

      request.log.error(
        {
          error: error instanceof Error ? error.message : "Unknown error",
          gestion_id: request.params.id,
        },
        "Error getting gestion by ID"
      );

      return reply.status(500).send({
        error: "INTERNAL_ERROR",
        message: "Error al obtener gestión",
      });
    }
  }

  /**
   * POST /api/gestiones
   * Crea una nueva gestión
   * Requiere: rol admin
   */
  async createGestion(
    request: FastifyRequest<{ Body: CreateGestionInput }>,
    reply: FastifyReply
  ) {
    try {
      const gestion = await this.gestionesService.createGestion(request.body);

      return reply.status(201).send({
        data: gestion,
        message: "Gestión creada exitosamente",
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Ya existe una gestión")
      ) {
        return reply.status(409).send({
          error: "CONFLICT",
          message: error.message,
        });
      }

      request.log.error(
        {
          error: error instanceof Error ? error.message : "Unknown error",
          body: request.body,
        },
        "Error creating gestion"
      );

      return reply.status(500).send({
        error: "INTERNAL_ERROR",
        message: "Error al crear gestión",
      });
    }
  }

  /**
   * PUT /api/gestiones/:id
   * Actualiza una gestión existente
   * Requiere: rol admin
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
      const gestion = await this.gestionesService.updateGestion(
        id,
        request.body
      );

      return reply.status(200).send({
        data: gestion,
        message: "Gestión actualizada exitosamente",
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Gestión no encontrada"
      ) {
        return reply.status(404).send({
          error: "NOT_FOUND",
          message: error.message,
        });
      }

      request.log.error(
        {
          error: error instanceof Error ? error.message : "Unknown error",
          gestion_id: request.params.id,
          body: request.body,
        },
        "Error updating gestion"
      );

      return reply.status(500).send({
        error: "INTERNAL_ERROR",
        message: "Error al actualizar gestión",
      });
    }
  }

  /**
   * DELETE /api/gestiones/:id
   * Elimina (desactiva) una gestión
   * Requiere: rol admin
   */
  async deleteGestion(
    request: FastifyRequest<{ Params: CatalogoParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      await this.gestionesService.deleteGestion(id);

      return reply.status(200).send({
        message: "Gestión eliminada exitosamente",
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("No se puede eliminar la gestión activa")
      ) {
        return reply.status(400).send({
          error: "BAD_REQUEST",
          message: error.message,
        });
      }

      request.log.error(
        {
          error: error instanceof Error ? error.message : "Unknown error",
          gestion_id: request.params.id,
        },
        "Error deleting gestion"
      );

      return reply.status(500).send({
        error: "INTERNAL_ERROR",
        message: "Error al eliminar gestión",
      });
    }
  }

  /**
   * POST /api/gestiones/:id/activar
   * Activa una gestión como la gestión activa del sistema
   * Solo una gestión puede estar activa a la vez
   * IMPORTANTE: Este cambio afecta a TODO el sistema
   * Requiere: rol admin
   */
  async activarGestion(
    request: FastifyRequest<{ Params: CatalogoParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const usuarioId = request.user?.userId;

      if (!usuarioId) {
        return reply.status(401).send({
          error: "UNAUTHORIZED",
          message: "Usuario no autenticado",
        });
      }

      const gestion = await this.gestionesService.activarGestion(id, usuarioId);

      return reply.status(200).send({
        data: gestion,
        message: `Gestión ${gestion.anio_gestion} activada como gestión del sistema`,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Gestión no encontrada"
      ) {
        return reply.status(404).send({
          error: "NOT_FOUND",
          message: error.message,
        });
      }

      if (
        error instanceof Error &&
        error.message.includes("No se puede activar una gestión desactivada")
      ) {
        return reply.status(400).send({
          error: "BAD_REQUEST",
          message: error.message,
        });
      }

      request.log.error(
        {
          error: error instanceof Error ? error.message : "Unknown error",
          gestion_id: request.params.id,
          usuario_id: request.user?.userId,
        },
        "Error activating gestion"
      );

      return reply.status(500).send({
        error: "INTERNAL_ERROR",
        message: "Error al activar gestión",
      });
    }
  }
}
