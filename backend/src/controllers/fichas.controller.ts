import { FastifyRequest, FastifyReply } from "fastify";
import { FichasService } from "../services/fichas.service.js";
import { FichaDraftEntity } from "../entities/FichaDraft.js";
import type {
  CreateFichaInput,
  UpdateFichaInput,
  FichaParams,
  FichaQuery,
  EnviarRevisionInput,
  AprobarFichaInput,
  RechazarFichaInput,
  CreateFichaDraftInput,
  FichaDraftParams,
  GetDraftParams,
} from "../schemas/fichas.schema.js";

// Controlador para endpoints de fichas de inspeccion
// Gestiona CRUD de fichas con control de acceso por comunidad
// Incluye workflow de aprobacion (borrador -> revision -> aprobado/rechazado)
export class FichasController {
  constructor(private fichasService: FichasService) {}

  // GET /api/fichas
  // Lista fichas con filtros opcionales y paginacion
  // Tecnico: solo su comunidad
  // Gerente/Admin: todas las comunidades
  async list(
    request: FastifyRequest<{ Querystring: FichaQuery }>,
    reply: FastifyReply
  ) {
    try {
      const { gestion, estado, productor, comunidad, estado_sync, page, limit } =
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
        estado,
        estado_sync,
        page,
        limit
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
  // Usa request.file() para streaming y validación de magic numbers
  async uploadArchivo(
    request: FastifyRequest<{ Params: FichaParams }>,
    reply: FastifyReply
  ) {
    try {
      if (!request.isMultipart()) {
        return reply.status(400).send({
          error: "bad_request",
          message: "La solicitud debe ser multipart/form-data",
        });
      }

      // Obtener el archivo usando request.file()
      const fileData = await request.file();
      if (!fileData) {
        return reply.status(400).send({
          error: "bad_request",
          message: "No se ha subido ningún archivo",
        });
      }

      // Extraer tipo_archivo de los fields
      // Con request.file(), los campos están en data.fields
      const tipoArchivo = fileData.fields.tipo_archivo as any;
      if (!tipoArchivo || typeof tipoArchivo.value !== "string") {
        return reply.status(400).send({
          error: "bad_request",
          message:
            "El campo 'tipo_archivo' es requerido (croquis, foto_parcela, documento_pdf)",
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
        fileData,
        tipoArchivo.value
      );

      return reply.status(201).send({
        archivo: nuevoArchivo,
        message: "Archivo subido y asociado a la ficha exitosamente",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("no encontrado" || error.message.includes("no encontrada"))) {
          return reply.status(404).send({
            error: "not_found",
            message: error.message,
          });
        }
        if (error.message.includes("acceso")) {
          return reply.status(403).send({
            error: "forbidden",
            message: error.message,
          });
        }
        if (
          error.message.includes("Tipo de archivo") ||
          error.message.includes("Validación")
        ) {
          return reply.status(400).send({
            error: "bad_request",
            message: error.message,
          });
        }
      }
      request.log.error(error, "Error uploading archivo for ficha");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al subir el archivo",
      });
    }
  }

  // GET /api/fichas/:id/archivos
  // Lista todos los archivos de una ficha
  async listArchivos(
    request: FastifyRequest<{ Params: FichaParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id: fichaId } = request.params;
      const usuarioComunidadId = request.user?.comunidadId;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      const archivos = await this.fichasService.listArchivos(
        fichaId,
        usuarioComunidadId,
        esAdminOGerente
      );

      return reply.status(200).send({
        archivos,
        total: archivos.length,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("no encontrada")) {
          return reply.status(404).send({
            error: "not_found",
            message: error.message,
          });
        }
        if (error.message.includes("acceso")) {
          return reply.status(403).send({
            error: "forbidden",
            message: error.message,
          });
        }
      }
      request.log.error(error, "Error listing archivos");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al listar archivos",
      });
    }
  }

  // GET /api/archivos/:archivoId/download
  // Descarga un archivo específico
  async downloadArchivo(
    request: FastifyRequest<{ Params: { archivoId: string } }>,
    reply: FastifyReply
  ) {
    try {
      // TODO: Implementar cuando ArchivoFichaRepository tenga findById
      return reply.status(501).send({
        error: "not_implemented",
        message: "Endpoint de descarga pendiente de implementación",
      });
    } catch (error) {
      request.log.error(error, "Error downloading archivo");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al descargar archivo",
      });
    }
  }

  // METODOS PARA DRAFT

  // POST /api/fichas/draft
  // Guarda o actualiza un borrador
  async saveDraft(
    request: FastifyRequest<{
      Body: CreateFichaDraftInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { codigo_productor, gestion, draft_data, step_actual } =
        request.body;
      const userId = request.user!.userId;

      const draft = await this.fichasService.saveDraft(
        codigo_productor,
        gestion,
        step_actual,
        draft_data,
        userId
      );

      // Convertir Draft a entity para usar toJSON()
      const draftEntity = new FichaDraftEntity(draft);

      return reply.status(200).send({
        draft: draftEntity.toJSON(),
        message: "Borrador guardado exitosamente",
      });
    } catch (error: any) {
      request.log.error(error, "Error saving draft");
      return reply.status(500).send({
        error: "internal_server_error",
        message: error.message || "Error al guardar borrador",
      });
    }
  }

  // GET /api/fichas/draft/:codigoProductor/:gestion
  // Obtiene un borrador por código de productor y gestión
  async getDraft(
    request: FastifyRequest<{
      Params: GetDraftParams;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { codigoProductor, gestion } = request.params;
      const userId = request.user!.userId;

      const draft = await this.fichasService.getDraft(
        codigoProductor,
        gestion,
        userId
      );

      if (!draft) {
        return reply.status(404).send({
          error: "not_found",
          message: "Borrador no encontrado",
        });
      }

      const draftEntity = new FichaDraftEntity(draft);
      return reply.status(200).send({
        draft: draftEntity.toJSON(),
      });
    } catch (error: any) {
      request.log.error(error, "Error getting draft");
      return reply.status(500).send({
        error: "internal_server_error",
        message: error.message || "Error al obtener borrador",
      });
    }
  }

  // GET /api/fichas/draft/my-drafts
  // Lista todos los borradores del usuario actual
  async listMyDrafts(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;

      const drafts = await this.fichasService.listMyDrafts(userId);

      // Convertir cada draft a JSON
      const draftsJson = drafts.map(draft => new FichaDraftEntity(draft).toJSON());

      return reply.status(200).send({
        drafts: draftsJson,
        total: draftsJson.length,
      });
    } catch (error: any) {
      request.log.error(error, "Error listing my drafts");
      return reply.status(500).send({
        error: "internal_server_error",
        message: error.message || "Error al listar borradores",
      });
    }
  }

  // DELETE /api/fichas/draft/:id
  // Elimina un borrador
  async deleteDraft(
    request: FastifyRequest<{
      Params: FichaDraftParams;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const userId = request.user!.userId;

      await this.fichasService.deleteDraft(id, userId);

      return reply.status(200).send({
        message: "Borrador eliminado exitosamente",
      });
    } catch (error: any) {
      request.log.error(error, "Error deleting draft");

      if (error.message.includes("No tienes permiso")) {
        return reply.status(403).send({
          error: "forbidden",
          message: error.message,
        });
      }

      if (error.message.includes("no encontrado")) {
        return reply.status(404).send({
          error: "not_found",
          message: error.message,
        });
      }

      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al eliminar borrador",
      });
    }
  }
}
