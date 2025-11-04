import { MultipartFile } from "@fastify/multipart";
import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";
import fs from "fs/promises";
import {
  NoConformidadRepository,
  NoConformidadEnriquecida,
  EstadisticasNC,
} from "../repositories/NoConformidadRepository.js";
import { ArchivoNoConformidadRepository } from "../repositories/ArchivoNoConformidadRepository.js";
import { FichaRepository } from "../repositories/FichaRepository.js";
import { ProductorRepository } from "../repositories/ProductorRepository.js";
import { ArchivoNoConformidad } from "../entities/ArchivoNoConformidad.js";
import {
  NoConformidadResponse,
  NoConformidadEnriquecidaResponse,
  ArchivoNCResponse,
} from "../schemas/noConformidades.schema.js";
import logger from "../utils/logger.js";

export class NoConformidadesService {
  private ncRepository: NoConformidadRepository;
  private archivoNCRepository: ArchivoNoConformidadRepository;
  private fichaRepository: FichaRepository;
  private productorRepository: ProductorRepository;

  constructor() {
    this.ncRepository = new NoConformidadRepository();
    this.archivoNCRepository = new ArchivoNoConformidadRepository();
    this.fichaRepository = new FichaRepository();
    this.productorRepository = new ProductorRepository();
  }

  // Obtiene una NC por ID con validacion de acceso
  async getById(
    id: string,
    usuarioComunidadId: string | undefined,
    esGerente: boolean
  ): Promise<NoConformidadEnriquecidaResponse> {
    const nc = await this.ncRepository.findByIdEnriquecida(id);

    if (!nc) {
      throw new Error("No conformidad no encontrada");
    }

    // Validar acceso por comunidad si no es gerente
    if (!esGerente && usuarioComunidadId) {
      const ficha = await this.fichaRepository.findById(nc.id_ficha);
      if (!ficha) {
        throw new Error("Ficha asociada no encontrada");
      }

      const productor = await this.productorRepository.findByCodigo(
        ficha.codigoProductor
      );
      if (!productor || productor.idComunidad !== usuarioComunidadId) {
        throw new Error("No tiene acceso a esta no conformidad");
      }
    }

    return this.mapToEnriquecidaResponse(nc);
  }

  // Lista NC de una ficha con validacion de acceso
  async getByFicha(
    idFicha: string,
    estadoSeguimiento: string | undefined,
    usuarioComunidadId: string | undefined,
    esGerente: boolean
  ): Promise<NoConformidadEnriquecidaResponse[]> {
    // Validar acceso a la ficha
    const ficha = await this.fichaRepository.findById(idFicha);
    if (!ficha) {
      throw new Error("Ficha no encontrada");
    }

    if (!esGerente && usuarioComunidadId) {
      const productor = await this.productorRepository.findByCodigo(
        ficha.codigoProductor
      );
      if (!productor || productor.idComunidad !== usuarioComunidadId) {
        throw new Error("No tiene acceso a esta ficha");
      }
    }

    const ncs = await this.ncRepository.findByFicha(idFicha, estadoSeguimiento);
    return ncs.map((nc) => this.mapToEnriquecidaResponse(nc));
  }

  // Actualiza datos basicos de una NC
  async update(
    id: string,
    data: {
      descripcion_no_conformidad?: string;
      accion_correctiva_propuesta?: string;
      fecha_limite_implementacion?: string;
    },
    usuarioComunidadId: string | undefined,
    esGerente: boolean
  ): Promise<NoConformidadResponse> {
    // Validar acceso
    const ncExistente = await this.ncRepository.findByIdEnriquecida(id);
    if (!ncExistente) {
      throw new Error("No conformidad no encontrada");
    }

    if (!esGerente && usuarioComunidadId) {
      const ficha = await this.fichaRepository.findById(ncExistente.id_ficha);
      if (!ficha) {
        throw new Error("Ficha asociada no encontrada");
      }

      const productor = await this.productorRepository.findByCodigo(
        ficha.codigoProductor
      );
      if (!productor || productor.idComunidad !== usuarioComunidadId) {
        throw new Error("No tiene acceso a esta no conformidad");
      }
    }

    // Preparar datos para actualizar
    const updateData: {
      descripcion_no_conformidad?: string;
      accion_correctiva_propuesta?: string;
      fecha_limite_implementacion?: Date;
    } = {};

    if (data.descripcion_no_conformidad !== undefined) {
      updateData.descripcion_no_conformidad = data.descripcion_no_conformidad;
    }

    if (data.accion_correctiva_propuesta !== undefined) {
      updateData.accion_correctiva_propuesta = data.accion_correctiva_propuesta;
    }

    if (data.fecha_limite_implementacion !== undefined) {
      updateData.fecha_limite_implementacion = new Date(
        data.fecha_limite_implementacion
      );
    }

    const ncActualizada = await this.ncRepository.update(id, updateData);

    if (!ncActualizada) {
      throw new Error("Error al actualizar la no conformidad");
    }

    logger.info({ id_no_conformidad: id }, "NC updated successfully");

    return ncActualizada.toJSON();
  }

  // Actualiza seguimiento de una NC
  async updateSeguimiento(
    id: string,
    estadoSeguimiento: string,
    comentarioSeguimiento: string | undefined,
    usuarioId: string,
    usuarioComunidadId: string | undefined,
    esGerente: boolean
  ): Promise<NoConformidadResponse> {
    // Validar acceso
    const ncExistente = await this.ncRepository.findByIdEnriquecida(id);
    if (!ncExistente) {
      throw new Error("No conformidad no encontrada");
    }

    if (!esGerente && usuarioComunidadId) {
      const ficha = await this.fichaRepository.findById(ncExistente.id_ficha);
      if (!ficha) {
        throw new Error("Ficha asociada no encontrada");
      }

      const productor = await this.productorRepository.findByCodigo(
        ficha.codigoProductor
      );
      if (!productor || productor.idComunidad !== usuarioComunidadId) {
        throw new Error("No tiene acceso a esta no conformidad");
      }
    }

    const ncActualizada = await this.ncRepository.updateSeguimiento(
      id,
      estadoSeguimiento,
      comentarioSeguimiento,
      usuarioId
    );

    if (!ncActualizada) {
      throw new Error("Error al actualizar el seguimiento");
    }

    logger.info(
      {
        id_no_conformidad: id,
        estado_seguimiento: estadoSeguimiento,
        usuario: usuarioId,
      },
      "NC seguimiento updated successfully"
    );

    return ncActualizada.toJSON();
  }

  // Obtiene estadisticas de NC
  async getEstadisticas(
    gestion: number | undefined,
    idComunidad: string | undefined,
    usuarioComunidadId: string | undefined,
    esGerente: boolean
  ): Promise<EstadisticasNC> {
    // Si no es gerente, forzar filtro por su comunidad
    let comunidadFiltro = idComunidad;
    if (!esGerente && usuarioComunidadId) {
      comunidadFiltro = usuarioComunidadId;
    }

    return await this.ncRepository.getEstadisticas(gestion, comunidadFiltro);
  }

  // Lista todas las NC con filtros opcionales
  async getAll(
    estadoSeguimiento?: string,
    idComunidad?: string,
    gestion?: number,
    codigoProductor?: string,
    usuarioComunidadId?: string,
    esGerente?: boolean
  ): Promise<NoConformidadEnriquecidaResponse[]> {
    // Si no es gerente, forzar filtro por su comunidad
    let comunidadFiltro = idComunidad;
    if (!esGerente && usuarioComunidadId) {
      comunidadFiltro = usuarioComunidadId;
    }

    const ncs = await this.ncRepository.findAll({
      estadoSeguimiento,
      idComunidad: comunidadFiltro,
      gestion,
      codigoProductor,
    });

    return ncs.map((nc) => this.mapToEnriquecidaResponse(nc));
  }

  // Añade un archivo a una NC
  async addArchivo(
    ncId: string,
    usuarioId: string,
    usuarioComunidadId: string | undefined,
    esGerente: boolean,
    fileData: MultipartFile,
    tipoArchivo: string
  ): Promise<ArchivoNCResponse> {
    logger.info(
      {
        id_no_conformidad: ncId,
        filename: fileData.filename,
        mimetype: fileData.mimetype,
        tipo_archivo: tipoArchivo,
      },
      "Adding archivo to NC"
    );

    // 1. Validar acceso a la NC
    const nc = await this.ncRepository.findByIdEnriquecida(ncId);
    if (!nc) {
      throw new Error("No conformidad no encontrada");
    }

    if (!esGerente && usuarioComunidadId) {
      const ficha = await this.fichaRepository.findById(nc.id_ficha);
      if (!ficha) {
        throw new Error("Ficha asociada no encontrada");
      }

      const productor = await this.productorRepository.findByCodigo(
        ficha.codigoProductor
      );
      if (!productor || productor.idComunidad !== usuarioComunidadId) {
        throw new Error("No tiene acceso a esta no conformidad");
      }
    }

    // 2. Validar tipo de archivo
    if (
      !tipoArchivo ||
      ![
        "evidencia_correccion",
        "documento_soporte",
        "foto_antes",
        "foto_despues",
      ].includes(tipoArchivo)
    ) {
      throw new Error(
        "Tipo de archivo no válido. Debe ser: evidencia_correccion, documento_soporte, foto_antes o foto_despues"
      );
    }

    // 3. Importar utilidades de uploads y validación
    const {
      generateUniqueFilename,
      buildFilePathNC,
      buildRelativePathNC,
      initializeNCDirectory,
    } = await import("../utils/uploads.js");
    const { validateFile } = await import("../utils/fileValidation.js");

    // 4. Inicializar directorio para esta NC
    await initializeNCDirectory(ncId);

    // 5. Generar nombre único y paths
    const uniqueFilename = generateUniqueFilename(fileData.filename, ncId);
    const fullPath = buildFilePathNC(ncId, uniqueFilename);
    const relativePath = buildRelativePathNC(ncId, uniqueFilename);

    let tempPath: string | null = null;

    try {
      // 6. Guardar archivo temporalmente para validación
      tempPath = `${fullPath}.tmp`;
      await pipeline(fileData.file, createWriteStream(tempPath));

      // 7. Leer archivo para validación de magic numbers
      const fileBuffer = await fs.readFile(tempPath);

      // 8. Validar archivo (tipo y tamaño) con magic numbers
      const validation = await validateFile(fileBuffer, tipoArchivo as any);
      if (!validation.valid) {
        const errorMessages = validation.errors.map((e) => e.message).join(", ");
        throw new Error(`Validación de archivo falló: ${errorMessages}`);
      }

      // 9. Renombrar de temporal a definitivo
      await fs.rename(tempPath, fullPath);
      tempPath = null;

      // 10. Obtener tamaño del archivo
      const stats = await fs.stat(fullPath);

      logger.info(
        {
          id_no_conformidad: ncId,
          filename: uniqueFilename,
          detectedMime: validation.detectedMimeType,
          size: stats.size,
        },
        "File validated and saved successfully"
      );

      // 11. Crear y guardar la entidad ArchivoNoConformidad
      const archivo = ArchivoNoConformidad.create({
        id_no_conformidad: ncId,
        tipo_archivo: tipoArchivo as any,
        nombre_original: fileData.filename,
        ruta_almacenamiento: relativePath,
        tamaño_bytes: stats.size,
        mime_type: validation.detectedMimeType || fileData.mimetype,
        subido_por: usuarioId,
      });

      archivo.marcarSubido();

      const nuevoArchivo = await this.archivoNCRepository.create(archivo);

      logger.info(
        {
          id_archivo: nuevoArchivo.id,
          id_no_conformidad: ncId,
          path: relativePath,
        },
        "Archivo added to NC successfully"
      );

      return nuevoArchivo.toJSON();
    } catch (error) {
      // Cleanup: eliminar archivo temporal o definitivo en caso de error
      const pathToClean = tempPath || fullPath;
      try {
        await fs.unlink(pathToClean);
        logger.debug({ path: pathToClean }, "Cleaned up file after error");
      } catch (cleanupError) {
        logger.warn(
          { path: pathToClean, error: cleanupError },
          "Failed to cleanup file"
        );
      }

      logger.error(
        {
          error: error instanceof Error ? error.message : "Unknown error",
          id_no_conformidad: ncId,
        },
        "Error adding archivo to NC"
      );

      throw error;
    }
  }

  // Lista archivos de una NC
  async getArchivos(
    ncId: string,
    usuarioComunidadId: string | undefined,
    esGerente: boolean
  ): Promise<ArchivoNCResponse[]> {
    // Validar acceso a la NC
    const nc = await this.ncRepository.findByIdEnriquecida(ncId);
    if (!nc) {
      throw new Error("No conformidad no encontrada");
    }

    if (!esGerente && usuarioComunidadId) {
      const ficha = await this.fichaRepository.findById(nc.id_ficha);
      if (!ficha) {
        throw new Error("Ficha asociada no encontrada");
      }

      const productor = await this.productorRepository.findByCodigo(
        ficha.codigoProductor
      );
      if (!productor || productor.idComunidad !== usuarioComunidadId) {
        throw new Error("No tiene acceso a esta no conformidad");
      }
    }

    const archivos = await this.archivoNCRepository.findByNoConformidadId(ncId);
    return archivos.map((archivo) => archivo.toJSON());
  }

  // Elimina un archivo de una NC
  async deleteArchivo(
    ncId: string,
    archivoId: string,
    usuarioComunidadId: string | undefined,
    esGerente: boolean
  ): Promise<void> {
    // Validar acceso a la NC
    const nc = await this.ncRepository.findByIdEnriquecida(ncId);
    if (!nc) {
      throw new Error("No conformidad no encontrada");
    }

    if (!esGerente && usuarioComunidadId) {
      const ficha = await this.fichaRepository.findById(nc.id_ficha);
      if (!ficha) {
        throw new Error("Ficha asociada no encontrada");
      }

      const productor = await this.productorRepository.findByCodigo(
        ficha.codigoProductor
      );
      if (!productor || productor.idComunidad !== usuarioComunidadId) {
        throw new Error("No tiene acceso a esta no conformidad");
      }
    }

    // Buscar archivo
    const archivo = await this.archivoNCRepository.findById(archivoId);
    if (!archivo) {
      throw new Error("Archivo no encontrado");
    }

    // Verificar que el archivo pertenece a esta NC
    if (archivo.idNoConformidad !== ncId) {
      throw new Error("El archivo no pertenece a esta no conformidad");
    }

    // Eliminar archivo físico
    const { config } = await import("../config/environment.js");
    const path = await import("path");
    const fullPath = path.join(
      config.upload.path,
      archivo.rutaAlmacenamiento
    );

    try {
      await fs.unlink(fullPath);
      logger.debug({ path: fullPath }, "Physical file deleted");
    } catch (error) {
      logger.warn(
        {
          path: fullPath,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        "Failed to delete physical file"
      );
    }

    // Eliminar registro de BD
    await this.archivoNCRepository.delete(archivoId);

    logger.info(
      {
        id_archivo: archivoId,
        id_no_conformidad: ncId,
      },
      "Archivo deleted from NC successfully"
    );
  }

  // Obtiene la ruta fisica de un archivo
  async getArchivoPath(
    ncId: string,
    archivoId: string,
    usuarioComunidadId: string | undefined,
    esGerente: boolean
  ): Promise<string> {
    // Validar acceso a la NC
    const nc = await this.ncRepository.findByIdEnriquecida(ncId);
    if (!nc) {
      throw new Error("No conformidad no encontrada");
    }

    if (!esGerente && usuarioComunidadId) {
      const ficha = await this.fichaRepository.findById(nc.id_ficha);
      if (!ficha) {
        throw new Error("Ficha asociada no encontrada");
      }

      const productor = await this.productorRepository.findByCodigo(
        ficha.codigoProductor
      );
      if (!productor || productor.idComunidad !== usuarioComunidadId) {
        throw new Error("No tiene acceso a esta no conformidad");
      }
    }

    // Buscar archivo
    const archivo = await this.archivoNCRepository.findById(archivoId);
    if (!archivo) {
      throw new Error("Archivo no encontrado");
    }

    // Verificar que el archivo pertenece a esta NC
    if (archivo.idNoConformidad !== ncId) {
      throw new Error("El archivo no pertenece a esta no conformidad");
    }

    const { config } = await import("../config/environment.js");
    const path = await import("path");
    return path.join(config.upload.path, archivo.rutaAlmacenamiento);
  }

  // Helper para mapear NC enriquecida a response
  private mapToEnriquecidaResponse(
    nc: NoConformidadEnriquecida
  ): NoConformidadEnriquecidaResponse {
    return {
      id_no_conformidad: nc.id_no_conformidad,
      id_ficha: nc.id_ficha,
      descripcion_no_conformidad: nc.descripcion_no_conformidad,
      accion_correctiva_propuesta: nc.accion_correctiva_propuesta ?? null,
      fecha_limite_implementacion:
        nc.fecha_limite_implementacion?.toISOString() ?? null,
      estado_seguimiento: nc.estado_seguimiento,
      comentario_seguimiento: nc.comentario_seguimiento ?? null,
      fecha_seguimiento: nc.fecha_seguimiento?.toISOString() ?? null,
      realizado_por_usuario: nc.realizado_por_usuario ?? null,
      updated_at: nc.updated_at.toISOString(),
      created_at: nc.created_at.toISOString(),
      codigo_productor: nc.codigo_productor,
      nombre_productor: nc.nombre_productor,
      nombre_comunidad: nc.nombre_comunidad,
      gestion: nc.gestion,
      nombre_usuario_seguimiento: nc.nombre_usuario_seguimiento,
    };
  }
}
