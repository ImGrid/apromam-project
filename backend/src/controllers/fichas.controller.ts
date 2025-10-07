import { FastifyRequest, FastifyReply } from "fastify";
import { FichasService } from "../services/fichas.service.js";
import type {
  CreateFichaInput,
  UpdateFichaInput,
  FichaParams,
  FichaQuery,
  EnviarRevisionInput,
  AprobarFichaInput,
  RechazarFichaInput,
} from "../schemas/fichas.schema.js";

// Controlador para endpoints de fichas de inspeccion
// Gestiona CRUD de fichas con control de acceso por comunidad
// Incluye workflow de aprobacion (borrador -> revision -> aprobado/rechazado)
export class FichasController {
  constructor(private fichasService: FichasService) {}

  // GET /api/fichas
  // Lista fichas con filtros opcionales
  // Tecnico: solo su comunidad
  // Gerente/Admin: todas las comunidades
  async list(
    request: FastifyRequest<{ Querystring: FichaQuery }>,
    reply: FastifyReply
  ) {
    try {
      const { gestion, estado, productor, comunidad, estado_sync } =
        request.query;
      const usuarioComunidadId = request.user?.comunidadId;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      const result = await this.fichasService.listFichas(
        usuarioComunidadId,
        esAdminOGerente,
        gestion,
        comunidad,
        productor,
        estado
      );

      return reply.status(200).send(result);
    } catch (error) {
      request.log.error(error, "Error listing fichas");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al listar fichas",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // GET /api/fichas/:id
  // Obtiene una ficha completa con todas sus secciones
  // Tecnico: solo si es de su comunidad
  // Gerente/Admin: cualquier ficha
  async getById(
    request: FastifyRequest<{ Params: FichaParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const usuarioComunidadId = request.user?.comunidadId;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      const fichaCompleta = await this.fichasService.getFichaCompleta(
        id,
        usuarioComunidadId,
        esAdminOGerente
      );

      return reply.status(200).send({ ficha: fichaCompleta });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Ficha no encontrada") {
          return reply.status(404).send({
            error: "not_found",
            message: "Ficha no encontrada",
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message === "No tiene acceso a esta ficha") {
          return reply.status(403).send({
            error: "forbidden",
            message: "No tiene acceso a esta ficha",
            timestamp: new Date().toISOString(),
          });
        }
      }
      request.log.error(error, "Error getting ficha");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al obtener ficha",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // POST /api/fichas
  // Crea una nueva ficha completa con transaccion atomica
  // Tecnico: solo en su comunidad
  // Admin: en cualquier comunidad
  async create(
    request: FastifyRequest<{ Body: CreateFichaInput }>,
    reply: FastifyReply
  ) {
    try {
      const usuarioId = request.user!.userId;
      const usuarioComunidadId = request.user?.comunidadId;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      const fichaCompleta = await this.fichasService.createFichaCompleta(
        request.body,
        usuarioId,
        usuarioComunidadId,
        esAdminOGerente
      );

      return reply.status(201).send({
        ficha: fichaCompleta,
        message: "Ficha creada exitosamente",
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
        if (error.message.includes("Validacion")) {
          return reply.status(400).send({
            error: "validation_error",
            message: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      }
      request.log.error(error, "Error creating ficha");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al crear ficha",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // PUT /api/fichas/:id
  // Actualiza una ficha existente
  // Solo se puede actualizar si esta en borrador
  // Tecnico: solo de su comunidad
  // Admin: cualquier ficha
  async update(
    request: FastifyRequest<{
      Params: FichaParams;
      Body: UpdateFichaInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const usuarioComunidadId = request.user?.comunidadId;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      const ficha = await this.fichasService.updateFicha(
        id,
        request.body,
        usuarioComunidadId,
        esAdminOGerente
      );

      return reply.status(200).send({
        ficha,
        message: "Ficha actualizada exitosamente",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Ficha no encontrada") {
          return reply.status(404).send({
            error: "not_found",
            message: "Ficha no encontrada",
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
        if (error.message.includes("Solo se pueden actualizar")) {
          return reply.status(400).send({
            error: "bad_request",
            message: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      }
      request.log.error(error, "Error updating ficha");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al actualizar ficha",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // DELETE /api/fichas/:id
  // Elimina (desactiva) una ficha
  // Solo admin puede eliminar
  // Solo se puede eliminar si esta en borrador
  async delete(
    request: FastifyRequest<{ Params: FichaParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      await this.fichasService.deleteFicha(id);
      return reply.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Ficha no encontrada") {
          return reply.status(404).send({
            error: "not_found",
            message: "Ficha no encontrada",
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message.includes("Solo se pueden eliminar")) {
          return reply.status(400).send({
            error: "bad_request",
            message: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      }
      request.log.error(error, "Error deleting ficha");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al eliminar ficha",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // POST /api/fichas/:id/enviar-revision
  // Envia una ficha a revision
  // Solo se puede enviar desde borrador
  // Tecnico puede enviar fichas de su comunidad
  async enviarRevision(
    request: FastifyRequest<{
      Params: FichaParams;
      Body: EnviarRevisionInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const usuarioComunidadId = request.user?.comunidadId;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      const ficha = await this.fichasService.enviarRevision(
        id,
        request.body,
        usuarioComunidadId,
        esAdminOGerente
      );

      return reply.status(200).send({
        ficha,
        message: "Ficha enviada a revision exitosamente",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Ficha no encontrada") {
          return reply.status(404).send({
            error: "not_found",
            message: "Ficha no encontrada",
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message === "No tiene acceso a esta ficha") {
          return reply.status(403).send({
            error: "forbidden",
            message: "No tiene acceso a esta ficha",
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message.includes("no puede enviarse")) {
          return reply.status(400).send({
            error: "bad_request",
            message: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      }
      request.log.error(error, "Error enviando ficha a revision");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al enviar ficha a revision",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // POST /api/fichas/:id/aprobar
  // Aprueba una ficha
  // Solo gerente/admin pueden aprobar
  // Solo se puede aprobar si esta en revision
  async aprobar(
    request: FastifyRequest<{
      Params: FichaParams;
      Body: AprobarFichaInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      const ficha = await this.fichasService.aprobarFicha(id, request.body);

      return reply.status(200).send({
        ficha,
        message: "Ficha aprobada exitosamente",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Ficha no encontrada") {
          return reply.status(404).send({
            error: "not_found",
            message: "Ficha no encontrada",
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message.includes("no puede aprobarse")) {
          return reply.status(400).send({
            error: "bad_request",
            message: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      }
      request.log.error(error, "Error aprobando ficha");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al aprobar ficha",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // POST /api/fichas/:id/rechazar
  // Rechaza una ficha
  // Solo gerente/admin pueden rechazar
  // Solo se puede rechazar si esta en revision
  async rechazar(
    request: FastifyRequest<{
      Params: FichaParams;
      Body: RechazarFichaInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      const ficha = await this.fichasService.rechazarFicha(id, request.body);

      return reply.status(200).send({
        ficha,
        message: "Ficha rechazada exitosamente",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Ficha no encontrada") {
          return reply.status(404).send({
            error: "not_found",
            message: "Ficha no encontrada",
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message.includes("no puede rechazarse")) {
          return reply.status(400).send({
            error: "bad_request",
            message: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      }
      request.log.error(error, "Error rechazando ficha");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al rechazar ficha",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // POST /api/fichas/:id/devolver-borrador
  // Devuelve una ficha rechazada a borrador
  // Solo admin puede devolver
  async devolverBorrador(
    request: FastifyRequest<{ Params: FichaParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      const ficha = await this.fichasService.devolverBorrador(id);

      return reply.status(200).send({
        ficha,
        message: "Ficha devuelta a borrador exitosamente",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Ficha no encontrada") {
          return reply.status(404).send({
            error: "not_found",
            message: "Ficha no encontrada",
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message.includes("Solo se puede devolver")) {
          return reply.status(400).send({
            error: "bad_request",
            message: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      }
      request.log.error(error, "Error devolviendo ficha a borrador");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al devolver ficha a borrador",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // GET /api/fichas/estadisticas
  // Obtiene estadisticas de fichas
  // Tecnico: solo su comunidad
  // Gerente/Admin: estadisticas globales
  async getEstadisticas(
    request: FastifyRequest<{ Querystring: { gestion?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const gestion = request.query.gestion
        ? parseInt(request.query.gestion, 10)
        : undefined;
      const usuarioComunidadId = request.user?.comunidadId;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      const estadisticas = await this.fichasService.getEstadisticas(
        usuarioComunidadId,
        esAdminOGerente,
        gestion
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

  // POST /api/fichas/:id/archivos
  // Sube un archivo y lo asocia a una ficha
  async uploadArchivo(
    request: FastifyRequest<{ Params: FichaParams }>,
    reply: FastifyReply
  ) {
    try {
      if (!request.isMultipart()) {
        return reply
          .status(400)
          .send({
            error: "bad_request",
            message: "La solicitud debe ser multipart/form-data",
          });
      }

      const data = await request.file();
      if (!data) {
        return reply
          .status(400)
          .send({
            error: "bad_request",
            message: "No se ha subido ningún archivo",
          });
      }

      const { id: fichaId } = request.params;
      const usuarioId = request.user!.userId;
      const usuarioComunidadId = request.user?.comunidadId;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      const nuevoArchivo = await this.fichasService.addArchivoToFicha(
        fichaId,
        usuarioId,
        usuarioComunidadId,
        esAdminOGerente,
        data
      );

      return reply.status(201).send({
        archivo: nuevoArchivo,
        message: "Archivo subido y asociado a la ficha exitosamente",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("no encontrado")) {
          return reply
            .status(404)
            .send({ error: "not_found", message: error.message });
        }
        if (error.message.includes("acceso")) {
          return reply
            .status(403)
            .send({ error: "forbidden", message: error.message });
        }
        if (error.message.includes("Tipo de archivo")) {
          return reply
            .status(400)
            .send({ error: "bad_request", message: error.message });
        }
      }
      request.log.error(error, "Error uploading archivo for ficha");
      return reply
        .status(500)
        .send({
          error: "internal_server_error",
          message: "Error al subir el archivo",
        });
    }
  }
}
