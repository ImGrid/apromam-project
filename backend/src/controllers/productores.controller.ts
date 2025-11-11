import { FastifyRequest, FastifyReply } from "fastify";
import { ProductoresService } from "../services/productores.service.js";
import {
  CreateProductorInput,
  UpdateProductorInput,
  ProductorParams,
  ProductorQuery,
} from "../schemas/productores.schema.js";

// Controlador para endpoints de productores
// Gestiona CRUD de productores con control de acceso por comunidad
// Tecnico: solo su comunidad
// Gerente/Admin: todas las comunidades
export class ProductoresController {
  constructor(private productoresService: ProductoresService) {}

  // GET /api/productores
  // Lista productores con filtros opcionales
  // Acceso: tecnico (su comunidad), gerente/admin (todas)
  async list(
    request: FastifyRequest<{ Querystring: ProductorQuery }>,
    reply: FastifyReply
  ) {
    try {
      const { comunidad, categoria } = request.query;
      const usuarioComunidadesIds = request.user?.comunidadesIds;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      const result = await this.productoresService.listProductores(
        usuarioComunidadesIds,
        esAdminOGerente,
        comunidad,
        categoria
      );

      return reply.status(200).send(result);
    } catch (error) {
      request.log.error(error, "Error listing productores");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al listar productores",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // GET /api/productores/:codigo
  // Obtiene un productor por codigo
  // Acceso: tecnico (su comunidad), gerente/admin (todos)
  async getByCodigo(
    request: FastifyRequest<{ Params: ProductorParams }>,
    reply: FastifyReply
  ) {
    try {
      const { codigo } = request.params;
      const usuarioComunidadesIds = request.user?.comunidadesIds;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      const productor = await this.productoresService.getProductorByCodigo(
        codigo,
        usuarioComunidadesIds,
        esAdminOGerente
      );

      return reply.status(200).send({ productor });
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
      request.log.error(error, "Error getting productor");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al obtener productor",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // POST /api/productores
  // Crea un nuevo productor
  // Acceso: tecnico (su comunidad), admin (cualquier comunidad)
  async create(
    request: FastifyRequest<{ Body: CreateProductorInput }>,
    reply: FastifyReply
  ) {
    try {
      const usuarioComunidadesIds = request.user?.comunidadesIds;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      const productor = await this.productoresService.createProductor(
        request.body,
        usuarioComunidadesIds,
        esAdminOGerente
      );

      return reply.status(201).send({
        productor,
        message: "Productor creado exitosamente",
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
        if (error.message === "Comunidad no encontrada") {
          return reply.status(404).send({
            error: "not_found",
            message: "Comunidad no encontrada",
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
      request.log.error(error, "Error creating productor");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al crear productor",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // PUT /api/productores/:codigo
  // Actualiza un productor existente
  // Acceso: tecnico (su comunidad), admin (cualquier comunidad)
  async update(
    request: FastifyRequest<{
      Params: ProductorParams;
      Body: UpdateProductorInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { codigo } = request.params;
      const usuarioComunidadesIds = request.user?.comunidadesIds;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      const productor = await this.productoresService.updateProductor(
        codigo,
        request.body,
        usuarioComunidadesIds,
        esAdminOGerente
      );

      return reply.status(200).send({
        productor,
        message: "Productor actualizado exitosamente",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Productor no encontrado") {
          return reply.status(404).send({
            error: "not_found",
            message: "Productor no encontrado",
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
      request.log.error(error, "Error updating productor");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al actualizar productor",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // DELETE /api/productores/:codigo
  // Elimina (desactiva) un productor
  // Acceso: solo admin
  async delete(
    request: FastifyRequest<{ Params: ProductorParams }>,
    reply: FastifyReply
  ) {
    try {
      const { codigo } = request.params;
      await this.productoresService.deleteProductor(codigo);
      return reply.status(204).send();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Productor no encontrado"
      ) {
        return reply.status(404).send({
          error: "not_found",
          message: "Productor no encontrado",
          timestamp: new Date().toISOString(),
        });
      }
      request.log.error(error, "Error deleting productor");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al eliminar productor",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // GET /api/productores/estadisticas
  // Obtiene estadisticas de productores
  // Acceso: tecnico (su comunidad), gerente/admin (globales)
  async getEstadisticas(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuarioComunidadesIds = request.user?.comunidadesIds;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      const estadisticas = await this.productoresService.getEstadisticas(
        usuarioComunidadesIds,
        esAdminOGerente
      );

      return reply.status(200).send(estadisticas);
    } catch (error) {
      request.log.error(error, "Error getting estadisticas");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al obtener estadisticas",
        timestamp: new Date().toISOString(),
      });
    }
  }
}
