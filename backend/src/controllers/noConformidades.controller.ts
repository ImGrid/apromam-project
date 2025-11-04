import { FastifyRequest, FastifyReply } from "fastify";
import { MultipartFile } from "@fastify/multipart";
import { NoConformidadesService } from "../services/noConformidades.service.js";
import type {
  NoConformidadParams,
  FichaNCParams,
  ArchivoNCParams,
  UpdateNoConformidadInput,
  UpdateSeguimientoNCInput,
  EstadisticasNCQuery,
  NCFichaQuery,
  NCListQuery,
} from "../schemas/noConformidades.schema.js";

// Controlador para endpoints de no conformidades
// Gestiona seguimiento de NC con control de acceso por comunidad
// Solo técnicos y gerentes tienen acceso (NO admin)
export class NoConformidadesController {
  constructor(private ncService: NoConformidadesService) {}

  // GET /api/no-conformidades/:id
  // Obtiene una NC por ID con datos enriquecidos
  // Técnico: solo si es de su comunidad
  // Gerente: cualquier NC
  async getById(
    request: FastifyRequest<{ Params: NoConformidadParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const usuarioComunidadId = request.user?.comunidadId;
      const esGerente = request.user?.role === "gerente";

      const nc = await this.ncService.getById(
        id,
        usuarioComunidadId,
        esGerente
      );

      return reply.status(200).send({ no_conformidad: nc });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No conformidad no encontrada") {
          return reply.status(404).send({
            error: "not_found",
            message: "No conformidad no encontrada",
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message === "No tiene acceso a esta no conformidad") {
          return reply.status(403).send({
            error: "forbidden",
            message: "No tiene acceso a esta no conformidad",
            timestamp: new Date().toISOString(),
          });
        }
      }

      request.log.error(error, "Error getting NC by ID");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al obtener la no conformidad",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // GET /api/no-conformidades/ficha/:id_ficha
  // Lista todas las NC de una ficha con filtro opcional por estado
  async getByFicha(
    request: FastifyRequest<{
      Params: FichaNCParams;
      Querystring: NCFichaQuery;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id_ficha } = request.params;
      const { estado_seguimiento, page = 1, limit = 20 } = request.query;
      const usuarioComunidadId = request.user?.comunidadId;
      const esGerente = request.user?.role === "gerente";

      const ncs = await this.ncService.getByFicha(
        id_ficha,
        estado_seguimiento,
        usuarioComunidadId,
        esGerente
      );

      const totalPages = Math.ceil(ncs.length / limit);

      return reply.status(200).send({
        no_conformidades: ncs,
        total: ncs.length,
        page,
        limit,
        totalPages,
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
      }

      request.log.error(error, "Error listing NCs by ficha");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al listar las no conformidades",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // PUT /api/no-conformidades/:id
  // Actualiza datos básicos de una NC
  async update(
    request: FastifyRequest<{
      Params: NoConformidadParams;
      Body: UpdateNoConformidadInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const data = request.body;
      const usuarioComunidadId = request.user?.comunidadId;
      const esGerente = request.user?.role === "gerente";

      const ncActualizada = await this.ncService.update(
        id,
        data,
        usuarioComunidadId,
        esGerente
      );

      return reply.status(200).send({ no_conformidad: ncActualizada });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No conformidad no encontrada") {
          return reply.status(404).send({
            error: "not_found",
            message: "No conformidad no encontrada",
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message === "No tiene acceso a esta no conformidad") {
          return reply.status(403).send({
            error: "forbidden",
            message: "No tiene acceso a esta no conformidad",
            timestamp: new Date().toISOString(),
          });
        }
      }

      request.log.error(error, "Error updating NC");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al actualizar la no conformidad",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // PUT /api/no-conformidades/:id/seguimiento
  // Actualiza el estado de seguimiento de una NC
  async updateSeguimiento(
    request: FastifyRequest<{
      Params: NoConformidadParams;
      Body: UpdateSeguimientoNCInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const { estado_seguimiento, comentario_seguimiento } = request.body;
      const usuarioId = request.user!.userId;
      const usuarioComunidadId = request.user?.comunidadId;
      const esGerente = request.user?.role === "gerente";

      const ncActualizada = await this.ncService.updateSeguimiento(
        id,
        estado_seguimiento,
        comentario_seguimiento,
        usuarioId,
        usuarioComunidadId,
        esGerente
      );

      return reply.status(200).send({ no_conformidad: ncActualizada });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No conformidad no encontrada") {
          return reply.status(404).send({
            error: "not_found",
            message: "No conformidad no encontrada",
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message === "No tiene acceso a esta no conformidad") {
          return reply.status(403).send({
            error: "forbidden",
            message: "No tiene acceso a esta no conformidad",
            timestamp: new Date().toISOString(),
          });
        }
      }

      request.log.error(error, "Error updating NC seguimiento");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al actualizar el seguimiento",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // GET /api/no-conformidades/estadisticas
  // Obtiene estadísticas de NC con filtros opcionales
  async getEstadisticas(
    request: FastifyRequest<{ Querystring: EstadisticasNCQuery }>,
    reply: FastifyReply
  ) {
    try {
      const { gestion, id_comunidad } = request.query;
      const usuarioComunidadId = request.user?.comunidadId;
      const esGerente = request.user?.role === "gerente";

      // Obtener gestión activa desde el middleware
      const gestionActiva = (request as any).gestionActiva;

      console.log('🔍 [NC-CONTROLLER] Gestión activa del sistema:', {
        id: gestionActiva.id,
        anio: gestionActiva.anio,
        tipo: typeof gestionActiva.anio
      });

      // Usar gestion del query param o fallback a gestion activa
      const gestionAUsar = gestion || gestionActiva.anio;

      console.log('🔍 [NC-CONTROLLER] Gestión a usar para estadísticas:', {
        gestionQueryParam: gestion,
        gestionActiva: gestionActiva.anio,
        gestionFinal: gestionAUsar,
        origen: gestion ? 'query_param' : 'gestion_activa'
      });

      const estadisticas = await this.ncService.getEstadisticas(
        gestionAUsar,
        id_comunidad,
        usuarioComunidadId,
        esGerente
      );

      console.log('🔍 [NC-CONTROLLER] Estadísticas retornadas:', {
        total_nc: estadisticas.total,
        gestion_usada: gestionAUsar
      });

      return reply.status(200).send(estadisticas);
    } catch (error) {
      request.log.error(error, "Error getting NC estadisticas");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al obtener las estadísticas",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // GET /api/no-conformidades
  // Lista todas las NC con filtros opcionales
  async getAll(
    request: FastifyRequest<{ Querystring: NCListQuery }>,
    reply: FastifyReply
  ) {
    try {
      const {
        estado_seguimiento,
        id_comunidad,
        gestion,
        codigo_productor,
        page = 1,
        limit = 20,
      } = request.query;
      const usuarioComunidadId = request.user?.comunidadId;
      const esGerente = request.user?.role === "gerente";

      // Obtener gestión activa desde el middleware
      const gestionActiva = (request as any).gestionActiva;

      console.log('🔍 [NC-CONTROLLER] Gestión activa del sistema:', {
        id: gestionActiva.id,
        anio: gestionActiva.anio,
        tipo: typeof gestionActiva.anio
      });

      // Usar gestion del query param o fallback a gestion activa
      const gestionAUsar = gestion || gestionActiva.anio;

      console.log('🔍 [NC-CONTROLLER] Gestión a usar para listado:', {
        gestionQueryParam: gestion,
        gestionActiva: gestionActiva.anio,
        gestionFinal: gestionAUsar,
        origen: gestion ? 'query_param' : 'gestion_activa'
      });

      const ncs = await this.ncService.getAll(
        estado_seguimiento,
        id_comunidad,
        gestionAUsar,
        codigo_productor,
        usuarioComunidadId,
        esGerente
      );

      const totalPages = Math.ceil(ncs.length / limit);

      console.log('🔍 [NC-CONTROLLER] NCs retornadas:', {
        total: ncs.length,
        gestion_usada: gestionAUsar,
        page,
        totalPages
      });

      return reply.status(200).send({
        no_conformidades: ncs,
        total: ncs.length,
        page,
        limit,
        totalPages,
      });
    } catch (error) {
      request.log.error(error, "Error listing all NCs");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al listar las no conformidades",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // POST /api/no-conformidades/:id/archivos
  // Sube un archivo a una NC
  async uploadArchivo(
    request: FastifyRequest<{ Params: NoConformidadParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const usuarioId = request.user!.userId;
      const usuarioComunidadId = request.user?.comunidadId;
      const esGerente = request.user?.role === "gerente";

      // Obtener archivo multipart
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({
          error: "bad_request",
          message: "No se recibió ningún archivo",
          timestamp: new Date().toISOString(),
        });
      }

      // Obtener tipo_archivo desde los fields
      // IMPORTANTE: Con request.file(), solo se parsean campos que vienen ANTES del archivo
      const tipoArchivo = data.fields.tipo_archivo as any;
      if (!tipoArchivo || typeof tipoArchivo.value !== "string") {
        return reply.status(400).send({
          error: "bad_request",
          message: "Falta el campo tipo_archivo",
          timestamp: new Date().toISOString(),
        });
      }

      const archivo = await this.ncService.addArchivo(
        id,
        usuarioId,
        usuarioComunidadId,
        esGerente,
        data as MultipartFile,
        tipoArchivo.value
      );

      return reply.status(201).send({ archivo });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No conformidad no encontrada") {
          return reply.status(404).send({
            error: "not_found",
            message: "No conformidad no encontrada",
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message === "No tiene acceso a esta no conformidad") {
          return reply.status(403).send({
            error: "forbidden",
            message: "No tiene acceso a esta no conformidad",
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message.includes("Tipo de archivo no válido")) {
          return reply.status(400).send({
            error: "bad_request",
            message: error.message,
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message.includes("Validación de archivo falló")) {
          return reply.status(400).send({
            error: "validation_error",
            message: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      }

      request.log.error(error, "Error uploading archivo to NC");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al subir el archivo",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // GET /api/no-conformidades/:id/archivos
  // Lista todos los archivos de una NC
  async getArchivos(
    request: FastifyRequest<{ Params: NoConformidadParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const usuarioComunidadId = request.user?.comunidadId;
      const esGerente = request.user?.role === "gerente";

      const archivos = await this.ncService.getArchivos(
        id,
        usuarioComunidadId,
        esGerente
      );

      return reply.status(200).send({
        archivos,
        total: archivos.length,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No conformidad no encontrada") {
          return reply.status(404).send({
            error: "not_found",
            message: "No conformidad no encontrada",
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message === "No tiene acceso a esta no conformidad") {
          return reply.status(403).send({
            error: "forbidden",
            message: "No tiene acceso a esta no conformidad",
            timestamp: new Date().toISOString(),
          });
        }
      }

      request.log.error(error, "Error listing archivos for NC");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al listar los archivos",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // DELETE /api/no-conformidades/:id/archivos/:id_archivo
  // Elimina un archivo de una NC
  async deleteArchivo(
    request: FastifyRequest<{ Params: ArchivoNCParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id, id_archivo } = request.params;
      const usuarioComunidadId = request.user?.comunidadId;
      const esGerente = request.user?.role === "gerente";

      await this.ncService.deleteArchivo(
        id,
        id_archivo,
        usuarioComunidadId,
        esGerente
      );

      return reply.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No conformidad no encontrada") {
          return reply.status(404).send({
            error: "not_found",
            message: "No conformidad no encontrada",
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message === "Archivo no encontrado") {
          return reply.status(404).send({
            error: "not_found",
            message: "Archivo no encontrado",
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message === "No tiene acceso a esta no conformidad") {
          return reply.status(403).send({
            error: "forbidden",
            message: "No tiene acceso a esta no conformidad",
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message === "El archivo no pertenece a esta no conformidad") {
          return reply.status(400).send({
            error: "bad_request",
            message: "El archivo no pertenece a esta no conformidad",
            timestamp: new Date().toISOString(),
          });
        }
      }

      request.log.error(error, "Error deleting archivo from NC");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al eliminar el archivo",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // GET /api/no-conformidades/:id/archivos/:id_archivo/download
  // Descarga un archivo de una NC
  async downloadArchivo(
    request: FastifyRequest<{ Params: ArchivoNCParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id, id_archivo } = request.params;
      const usuarioComunidadId = request.user?.comunidadId;
      const esGerente = request.user?.role === "gerente";

      const filePath = await this.ncService.getArchivoPath(
        id,
        id_archivo,
        usuarioComunidadId,
        esGerente
      );

      // Enviar archivo como stream
      const path = await import("path");
      const filename = path.basename(filePath);
      const rootPath = path.dirname(filePath);

      return reply.sendFile(filename, rootPath);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No conformidad no encontrada") {
          return reply.status(404).send({
            error: "not_found",
            message: "No conformidad no encontrada",
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message === "Archivo no encontrado") {
          return reply.status(404).send({
            error: "not_found",
            message: "Archivo no encontrado",
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message === "No tiene acceso a esta no conformidad") {
          return reply.status(403).send({
            error: "forbidden",
            message: "No tiene acceso a esta no conformidad",
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message === "El archivo no pertenece a esta no conformidad") {
          return reply.status(400).send({
            error: "bad_request",
            message: "El archivo no pertenece a esta no conformidad",
            timestamp: new Date().toISOString(),
          });
        }
      }

      request.log.error(error, "Error downloading archivo from NC");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al descargar el archivo",
        timestamp: new Date().toISOString(),
      });
    }
  }
}
