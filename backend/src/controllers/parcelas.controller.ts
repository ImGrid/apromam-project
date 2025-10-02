import { FastifyRequest, FastifyReply } from "fastify";
import { ParcelasService } from "../services/parcelas.service.js";
import type {
  CreateParcelaInput,
  UpdateParcelaInput,
  ParcelaParams,
  ProductorParcelaParams,
  ProximitySearchParcelaInput,
} from "../schemas/parcelas.schema.js";

// Controlador para endpoints de parcelas
// Gestiona CRUD de parcelas con control de acceso por comunidad
export class ParcelasController {
  constructor(private parcelasService: ParcelasService) {}

  // GET /api/productores/:codigo/parcelas
  // Lista todas las parcelas de un productor
  // Técnico: solo si es de su comunidad
  // Gerente/Admin: cualquier productor
  async listByProductor(
    request: FastifyRequest<{ Params: ProductorParcelaParams }>,
    reply: FastifyReply
  ) {
    try {
      const { codigo } = request.params;
      const usuarioComunidadId = request.user?.comunidadId;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      const result = await this.parcelasService.listParcelasByProductor(
        codigo,
        usuarioComunidadId,
        esAdminOGerente
      );

      return reply.status(200).send(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Productor no encontrado") {
          return reply.status(404).send({
            error: "not_found",
            message: "Productor no encontrado",
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message === "No tiene acceso a este productor") {
          return reply.status(403).send({
            error: "forbidden",
            message: "No tiene acceso a este productor",
            timestamp: new Date().toISOString(),
          });
        }
      }
      request.log.error(error, "Error listing parcelas by productor");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al listar parcelas",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // GET /api/parcelas/:id
  // Obtiene una parcela por ID
  // Técnico: solo si el productor es de su comunidad
  // Gerente/Admin: cualquier parcela
  async getById(
    request: FastifyRequest<{ Params: ParcelaParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const usuarioComunidadId = request.user?.comunidadId;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      const parcela = await this.parcelasService.getParcelaById(
        id,
        usuarioComunidadId,
        esAdminOGerente
      );

      return reply.status(200).send({ parcela });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Parcela no encontrada") {
          return reply.status(404).send({
            error: "not_found",
            message: "Parcela no encontrada",
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message === "No tiene acceso a esta parcela") {
          return reply.status(403).send({
            error: "forbidden",
            message: "No tiene acceso a esta parcela",
            timestamp: new Date().toISOString(),
          });
        }
      }
      request.log.error(error, "Error getting parcela");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al obtener parcela",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // POST /api/parcelas/nearby
  // Busca parcelas cercanas a una ubicación GPS
  // Técnico: solo de su comunidad
  // Gerente/Admin: de todas las comunidades
  async searchNearby(
    request: FastifyRequest<{ Body: ProximitySearchParcelaInput }>,
    reply: FastifyReply
  ) {
    try {
      const usuarioComunidadId = request.user?.comunidadId;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      const result = await this.parcelasService.searchNearby(
        request.body,
        usuarioComunidadId,
        esAdminOGerente
      );

      return reply.status(200).send(result);
    } catch (error) {
      request.log.error(error, "Error searching nearby parcelas");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al buscar parcelas cercanas",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // POST /api/productores/:codigo/parcelas
  // Crea una nueva parcela para un productor
  // Técnico: solo para productores de su comunidad
  // Admin: para cualquier productor
  async create(
    request: FastifyRequest<{
      Params: ProductorParcelaParams;
      Body: Omit<CreateParcelaInput, "codigo_productor">;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { codigo } = request.params;
      const usuarioComunidadId = request.user?.comunidadId;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      // Agregar código de productor al body
      const input: CreateParcelaInput = {
        ...request.body,
        codigo_productor: codigo,
      };

      const parcela = await this.parcelasService.createParcela(
        input,
        usuarioComunidadId,
        esAdminOGerente
      );

      return reply.status(201).send({
        parcela,
        message: "Parcela creada exitosamente",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Ya existe")) {
          return reply.status(409).send({
            error: "conflict",
            message: error.message,
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message === "Productor no encontrado") {
          return reply.status(404).send({
            error: "not_found",
            message: "Productor no encontrado",
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message.includes("No puede crear")) {
          return reply.status(403).send({
            error: "forbidden",
            message: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      }
      request.log.error(error, "Error creating parcela");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al crear parcela",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // PUT /api/parcelas/:id
  // Actualiza una parcela existente
  // Técnico: solo de su comunidad
  // Admin: cualquier parcela
  async update(
    request: FastifyRequest<{
      Params: ParcelaParams;
      Body: UpdateParcelaInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const usuarioComunidadId = request.user?.comunidadId;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      const parcela = await this.parcelasService.updateParcela(
        id,
        request.body,
        usuarioComunidadId,
        esAdminOGerente
      );

      return reply.status(200).send({
        parcela,
        message: "Parcela actualizada exitosamente",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Parcela no encontrada") {
          return reply.status(404).send({
            error: "not_found",
            message: "Parcela no encontrada",
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message.includes("No puede actualizar")) {
          return reply.status(403).send({
            error: "forbidden",
            message: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      }
      request.log.error(error, "Error updating parcela");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al actualizar parcela",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // DELETE /api/parcelas/:id
  // Elimina (desactiva) una parcela
  // Solo admin puede eliminar
  async delete(
    request: FastifyRequest<{ Params: ParcelaParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      await this.parcelasService.deleteParcela(id);
      return reply.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === "Parcela no encontrada") {
        return reply.status(404).send({
          error: "not_found",
          message: "Parcela no encontrada",
          timestamp: new Date().toISOString(),
        });
      }
      request.log.error(error, "Error deleting parcela");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al eliminar parcela",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // GET /api/parcelas/estadisticas
  // Obtiene estadísticas de parcelas
  // Técnico: solo su comunidad
  // Gerente/Admin: estadísticas globales
  async getEstadisticas(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuarioComunidadId = request.user?.comunidadId;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      const estadisticas = await this.parcelasService.getEstadisticas(
        usuarioComunidadId,
        esAdminOGerente
      );

      return reply.status(200).send(estadisticas);
    } catch (error) {
      request.log.error(error, "Error getting estadisticas");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al obtener estadísticas",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // GET /api/parcelas/sin-coordenadas
  // Lista parcelas sin coordenadas GPS
  // Útil para alertas y seguimiento
  // Técnico: solo su comunidad
  // Gerente/Admin: todas
  async listSinCoordenadas(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuarioComunidadId = request.user?.comunidadId;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      const result = await this.parcelasService.listParcelasSinCoordenadas(
        usuarioComunidadId,
        esAdminOGerente
      );

      return reply.status(200).send(result);
    } catch (error) {
      request.log.error(error, "Error listing parcelas sin coordenadas");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al listar parcelas sin coordenadas",
        timestamp: new Date().toISOString(),
      });
    }
  }
}
