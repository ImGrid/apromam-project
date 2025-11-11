import { FastifyRequest, FastifyReply } from "fastify";
import { FichasService } from "../services/fichas.service.js";
import { FichaDraftEntity } from "../entities/FichaDraft.js";
import {
  CreateFichaInput,
  UpdateFichaInput,
  UpdateFichaCompletaInput,
  FichaParams,
  FichaQuery,
  EnviarRevisionInput,
  AprobarFichaInput,
  RechazarFichaInput,
  CreateFichaDraftInput,
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
  // IMPORTANTE: Filtra automaticamente por gestion activa del sistema
  async list(request: FastifyRequest<{ Querystring: FichaQuery }>, reply: FastifyReply) {
    try {
      const {
        gestion,
        estado,
        productor,
        comunidad,
        estado_sync,
        inspector_interno,
        resultado_certificacion,
        fecha_desde,
        fecha_hasta,
        page,
        limit
      } = request.query;
      const usuarioComunidadesIds = request.user?.comunidadesIds;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      // Obtener gestion activa del sistema
      const gestionActiva = (request as any).gestionActiva;

      if (!gestionActiva) {
        return reply.status(500).send({
          error: "NO_ACTIVE_GESTION",
          message: "No hay gestion activa configurada en el sistema",
          timestamp: new Date().toISOString(),
        });
      }

      // Usar gestión del query param si existe, sino usar gestión activa como fallback
      // Nota: gestion ya viene como number gracias al transform de Zod
      const gestionAUsar = gestion || gestionActiva.anio;

      const result = await this.fichasService.listFichas(
        usuarioComunidadesIds,
        esAdminOGerente,
        gestionAUsar,
        comunidad,
        productor,
        estado,
        estado_sync,
        inspector_interno,
        resultado_certificacion,
        fecha_desde,
        fecha_hasta,
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
  // IMPORTANTE: Verifica que la ficha pertenezca a la gestion activa
  async getById(request: FastifyRequest<{ Params: FichaParams }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const usuarioComunidadesIds = request.user?.comunidadesIds;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      // Obtener gestion activa del sistema
      const gestionActiva = (request as any).gestionActiva;

      if (!gestionActiva) {
        return reply.status(500).send({
          error: "NO_ACTIVE_GESTION",
          message: "No hay gestion activa configurada en el sistema",
          timestamp: new Date().toISOString(),
        });
      }

      const fichaCompleta = await this.fichasService.getFichaCompleta(
        id,
        usuarioComunidadesIds,
        esAdminOGerente
      );

      // No verificamos gestión - permitimos ver fichas de cualquier gestión (pasadas o activas)
      // El control de acceso se hace por comunidad, no por gestión

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
  // IMPORTANTE: Fuerza la gestion activa del sistema, ignora la gestion del frontend
  async create(request: FastifyRequest<{ Body: CreateFichaInput }>, reply: FastifyReply) {
    try {
      const usuarioId = request.user!.userId;
      const usuarioComunidadesIds = request.user?.comunidadesIds;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      // Obtener gestion activa del sistema
      const gestionActiva = (request as any).gestionActiva;

      if (!gestionActiva) {
        return reply.status(500).send({
          error: "NO_ACTIVE_GESTION",
          message: "No hay gestion activa configurada en el sistema",
          timestamp: new Date().toISOString(),
        });
      }

      // Usar gestión del body si existe, sino usar gestión activa como fallback
      const gestionBody = request.body.gestion;
      const gestionAUsar = gestionBody || gestionActiva.anio;

      const inputConGestion = {
        ...request.body,
        gestion: gestionAUsar,
      };

      const fichaCompleta = await this.fichasService.createFichaCompleta(
        inputConGestion,
        usuarioId,
        usuarioComunidadesIds,
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
  async update(request: FastifyRequest<{ Params: FichaParams; Body: UpdateFichaInput }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const usuarioComunidadesIds = request.user?.comunidadesIds;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      const ficha = await this.fichasService.updateFicha(
        id,
        request.body,
        usuarioComunidadesIds,
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

  // PUT /api/fichas/:id/completa
  // Actualiza una ficha completa con todas las secciones
  // Solo se puede actualizar si esta en borrador
  async updateCompleta(request: FastifyRequest<{ Params: FichaParams; Body: UpdateFichaCompletaInput }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const usuarioId = request.user.userId;

      const fichaActualizada = await this.fichasService.updateFichaCompleta(
        id,
        request.body,
        usuarioId
      );

      return reply.status(200).send({
        ficha: fichaActualizada,
        message: "Ficha completa actualizada exitosamente",
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
        if (error.message.includes("No tienes permiso")) {
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
      request.log.error(error, "Error updating ficha completa");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al actualizar ficha completa",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // DELETE /api/fichas/:id
  // Elimina (desactiva) una ficha
  // Solo admin puede eliminar
  // Solo se puede eliminar si esta en borrador
  async delete(request: FastifyRequest<{ Params: FichaParams }>, reply: FastifyReply) {
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
  async enviarRevision(request: FastifyRequest<{ Params: FichaParams; Body: EnviarRevisionInput }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const usuarioComunidadesIds = request.user?.comunidadesIds;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      const ficha = await this.fichasService.enviarRevision(
        id,
        request.body,
        usuarioComunidadesIds,
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
  async aprobar(request: FastifyRequest<{ Params: FichaParams; Body: AprobarFichaInput }>, reply: FastifyReply) {
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
  async rechazar(request: FastifyRequest<{ Params: FichaParams; Body: RechazarFichaInput }>, reply: FastifyReply) {
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


  // GET /api/fichas/estadisticas
  // Obtiene estadisticas de fichas
  // Tecnico: solo su comunidad
  // Gerente/Admin: estadisticas globales
  async getEstadisticas(request: FastifyRequest<{ Querystring: { gestion?: string } }>, reply: FastifyReply) {
    try {
      const gestion = request.query.gestion
        ? parseInt(request.query.gestion, 10)
        : undefined;
      const usuarioComunidadesIds = request.user?.comunidadesIds;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      const estadisticas = await this.fichasService.getEstadisticas(
        usuarioComunidadesIds,
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
  async uploadArchivo(request: FastifyRequest<{ Params: FichaParams }>, reply: FastifyReply) {
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
      const usuarioComunidadesIds = request.user?.comunidadesIds;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      const nuevoArchivo = await this.fichasService.addArchivoToFicha(
        fichaId,
        usuarioId,
        usuarioComunidadesIds,
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
        if (error.message.includes("no encontrado") || error.message.includes("no encontrada")) {
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
  async listArchivos(request: FastifyRequest<{ Params: FichaParams }>, reply: FastifyReply) {
    try {
      const { id: fichaId } = request.params;
      const usuarioComunidadesIds = request.user?.comunidadesIds;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      const archivos = await this.fichasService.listArchivos(
        fichaId,
        usuarioComunidadesIds,
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

  // GET /api/fichas/:id/archivos/:idArchivo/download
  // Descarga un archivo específico
  async downloadArchivo(request: FastifyRequest<{ Params: { id: string; idArchivo: string } }>, reply: FastifyReply) {
    try {
      const { id: fichaId, idArchivo } = request.params;
      const usuarioComunidadesIds = request.user?.comunidadesIds;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      // Buscar archivo en BD
      const archivo = await this.fichasService["archivoFichaRepository"].findById(
        idArchivo
      );

      if (!archivo) {
        return reply.status(404).send({
          error: "not_found",
          message: "Archivo no encontrado",
        });
      }

      // Verificar que el archivo pertenece a la ficha solicitada
      if (archivo.idFicha !== fichaId) {
        return reply.status(400).send({
          error: "bad_request",
          message: "El archivo no pertenece a la ficha especificada",
        });
      }

      // Validar acceso a la ficha
      const ficha = await this.fichasService["fichaRepository"].findById(
        archivo.idFicha
      );
      if (!ficha) {
        return reply.status(404).send({
          error: "not_found",
          message: "Ficha no encontrada",
        });
      }

      if (!esAdminOGerente && usuarioComunidadesIds && usuarioComunidadesIds.length > 0) {
        const productor = await this.fichasService[
          "productorRepository"
        ].findByCodigo(ficha.codigoProductor);
        if (!productor || !usuarioComunidadesIds.includes(productor.idComunidad)) {
          return reply.status(403).send({
            error: "forbidden",
            message: "No tiene acceso a esta ficha",
          });
        }
      }

      // Construir ruta completa del archivo
      const path = await import("path");
      const fs = await import("fs/promises");
      const { config } = await import("../config/environment.js");

      const rutaCompleta = path.default.join(
        config.upload.path,
        archivo.rutaAlmacenamiento
      );

      // Validar seguridad: evitar path traversal
      const rutaNormalizada = path.default.normalize(rutaCompleta);
      if (!rutaNormalizada.startsWith(config.upload.path)) {
        return reply.status(400).send({
          error: "bad_request",
          message: "Ruta de archivo inválida",
        });
      }

      // Verificar que el archivo existe en disco
      try {
        await fs.access(rutaCompleta);
      } catch (error) {
        request.log.error(
          { ruta: rutaCompleta, error },
          "Archivo no encontrado en disco"
        );
        return reply.status(404).send({
          error: "not_found",
          message: "El archivo no existe en el servidor",
        });
      }

      // Configurar headers para descarga
      const mimeType = archivo.mimeType || "application/octet-stream";
      reply.header("Content-Type", mimeType);
      reply.header(
        "Content-Disposition",
        `attachment; filename="${archivo.nombreOriginal}"`
      );

      // Enviar archivo usando stream
      const stream = await import("fs");
      const fileStream = stream.createReadStream(rutaCompleta);

      return reply.send(fileStream);
    } catch (error) {
      request.log.error(error, "Error downloading archivo");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al descargar archivo",
      });
    }
  }

  // DELETE /api/fichas/:id/archivos/:idArchivo
  // Elimina un archivo de una ficha
  async deleteArchivoFicha(request: FastifyRequest<{ Params: { id: string; idArchivo: string } }>, reply: FastifyReply) {
    try {
      const { idArchivo } = request.params;
      const usuarioComunidadesIds = request.user?.comunidadesIds;
      const esAdminOGerente =
        request.user?.role === "administrador" ||
        request.user?.role === "gerente";

      await this.fichasService.deleteArchivo(
        idArchivo,
        usuarioComunidadesIds,
        esAdminOGerente
      );

      return reply.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("no encontrado") || error.message.includes("no encontrada")) {
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
      request.log.error(error, "Error deleting archivo");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al eliminar archivo",
      });
    }
  }

  // METODOS PARA DRAFT

  // POST /api/fichas/draft
  // Guarda o actualiza un borrador
  async saveDraft(request: FastifyRequest<{ Body: CreateFichaDraftInput }>, reply: FastifyReply) {
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
  async getDraft(request: FastifyRequest<{ Params: GetDraftParams }>, reply: FastifyReply) {
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
  async deleteDraft(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
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

  // GET /api/fichas/check-exists
  // Verifica si existe una ficha para un productor en una gestion
  async checkExists(request: FastifyRequest<{ Querystring: { codigo_productor: string; gestion: string } }>, reply: FastifyReply) {
    try {
      const { codigo_productor, gestion } = request.query;
      const gestionNum = parseInt(gestion, 10);

      if (!codigo_productor || !gestion) {
        return reply.status(400).send({
          error: "bad_request",
          message: "codigo_productor y gestion son requeridos",
        });
      }

      if (isNaN(gestionNum)) {
        return reply.status(400).send({
          error: "bad_request",
          message: "gestion debe ser un número válido",
        });
      }

      const ficha = await this.fichasService.findByProductorGestion(
        codigo_productor,
        gestionNum
      );

      if (!ficha) {
        return reply.status(200).send({ exists: false });
      }

      return reply.status(200).send({
        exists: true,
        ficha: {
          id_ficha: ficha.id,
          estado_ficha: ficha.estadoFicha,
          resultado_certificacion: ficha.resultadoCertificacion,
          fecha_inspeccion: ficha.fechaInspeccion.toISOString(),
        },
      });
    } catch (error: any) {
      request.log.error(error, "Error checking if ficha exists");
      return reply.status(500).send({
        error: "internal_server_error",
        message: error.message || "Error al verificar ficha",
      });
    }
  }
}
