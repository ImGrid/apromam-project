import { FichaRepository } from "../repositories/FichaRepository.js";
import { ProductorRepository } from "../repositories/ProductorRepository.js";
import { ParcelaRepository } from "../repositories/ParcelaRepository.js";
import { ArchivoFichaRepository } from "../repositories/ArchivoFichaRepository.js";
import { FichaDraftRepository } from "../repositories/FichaDraftRepository.js";
import { GestionRepository } from "../repositories/GestionRepository.js";
import { CultivosGestionRepository } from "../repositories/CultivosGestionRepository.js";
import { Ficha } from "../entities/Ficha.js";
import { RevisionDocumentacion } from "../entities/RevisionDocumentacion.js";
import { AccionCorrectiva } from "../entities/AccionCorrectiva.js";
import { NoConformidad } from "../entities/NoConformidad.js";
import { EvaluacionMitigacion } from "../entities/EvaluacionMitigacion.js";
import { EvaluacionPoscosecha } from "../entities/EvaluacionPoscosecha.js";
import { EvaluacionConocimientoNormas } from "../entities/EvaluacionConocimientoNormas.js";
import { ActividadPecuaria } from "../entities/ActividadPecuaria.js";
import { CosechaVentas } from "../entities/CosechaVentas.js";
import { ArchivoFicha } from "../entities/ArchivoFicha.js";
import { PlanificacionSiembra } from "../entities/PlanificacionSiembra.js";
import { FichaDraft, FichaDraftEntity } from "../entities/FichaDraft.js";
import { createAuthLogger } from "../utils/logger.js";
import { validarSuperficiesFicha } from "../utils/superficieValidation.js";
import type {
  CreateFichaInput,
  UpdateFichaInput,
  UpdateFichaCompletaInput,
  FichaResponse,
  EnviarRevisionInput,
  AprobarFichaInput,
  RechazarFichaInput,
  ArchivoFichaResponse,
} from "../schemas/fichas.schema.js";
import type { FichaCompleta } from "../repositories/FichaRepository.js";
import type { MultipartFile } from "@fastify/multipart";
import fs from "fs/promises";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";

const logger = createAuthLogger();

// Service para gestion de fichas de inspeccion
// Incluye validacion de acceso por comunidad del productor
export class FichasService {
  private fichaRepository: FichaRepository;
  private productorRepository: ProductorRepository;
  private parcelaRepository: ParcelaRepository;
  private archivoFichaRepository: ArchivoFichaRepository;
  private fichaDraftRepository: FichaDraftRepository;
  private gestionRepository: GestionRepository;
  private cultivosGestionRepository: CultivosGestionRepository;

  constructor(
    fichaRepository: FichaRepository,
    productorRepository: ProductorRepository,
    parcelaRepository: ParcelaRepository,
    archivoFichaRepository: ArchivoFichaRepository,
    fichaDraftRepository: FichaDraftRepository,
    gestionRepository: GestionRepository,
    cultivosGestionRepository: CultivosGestionRepository
  ) {
    this.fichaRepository = fichaRepository;
    this.productorRepository = productorRepository;
    this.parcelaRepository = parcelaRepository;
    this.archivoFichaRepository = archivoFichaRepository;
    this.fichaDraftRepository = fichaDraftRepository;
    this.gestionRepository = gestionRepository;
    this.cultivosGestionRepository = cultivosGestionRepository;
  }

  // Lista fichas con filtros y paginacion
  // Tecnico: solo sus comunidades asignadas (N:N)
  // Gerente/Admin: todas las comunidades
  async listFichas(
    usuarioComunidadesIds?: string[],
    esAdminOGerente: boolean = false,
    gestion?: number,
    comunidadId?: string,
    codigoProductor?: string,
    estado?: string,
    estadoSync?: string,
    inspectorInterno?: string,
    resultadoCertificacion?: string,
    fechaDesde?: string,
    fechaHasta?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ fichas: FichaResponse[]; total: number; page: number; limit: number; totalPages: number }> {
    // Determinar filtro de comunidades
    // Si es tecnico y tiene comunidades asignadas, filtrar por esas
    // Si es admin/gerente o hay filtro especifico, usar ese filtro
    let comunidadFiltro: string | undefined = undefined;
    let comunidadesFiltro: string[] | undefined = undefined;

    if (!esAdminOGerente && usuarioComunidadesIds && usuarioComunidadesIds.length > 0) {
      // Tecnico: usar sus comunidades asignadas
      comunidadesFiltro = usuarioComunidadesIds;
    } else if (comunidadId) {
      // Filtro especifico por una comunidad
      comunidadFiltro = comunidadId;
    }

    // Usar el nuevo metodo con paginacion
    const result = await this.fichaRepository.findWithPagination({
      gestion,
      estado,
      codigoProductor,
      comunidadId: comunidadFiltro,
      comunidadesIds: comunidadesFiltro,
      estadoSync,
      inspectorInterno,
      resultadoCertificacion,
      fechaDesde,
      fechaHasta,
      page,
      limit,
    });

    const totalPages = Math.ceil(result.total / limit);

    const response = {
      fichas: result.fichas.map((f) => f.toJSON()),
      total: result.total,
      page,
      limit,
      totalPages,
    };

    return response;
  }

  // Obtiene una ficha por ID con todas sus secciones
  // Valida acceso segun rol
  async getFichaCompleta(
    id: string,
    usuarioComunidadesIds?: string[],
    esAdminOGerente: boolean = false
  ): Promise<FichaCompleta> {
    const ficha = await this.fichaRepository.findById(id);

    if (!ficha) {
      throw new Error("Ficha no encontrada");
    }

    // Si es tecnico, validar acceso a la comunidad del productor
    if (!esAdminOGerente && usuarioComunidadesIds && usuarioComunidadesIds.length > 0) {
      const productor = await this.productorRepository.findByCodigo(
        ficha.codigoProductor
      );

      if (!productor || !usuarioComunidadesIds.includes(productor.idComunidad)) {
        throw new Error("No tiene acceso a esta ficha");
      }
    }

    // Cargar ficha completa con todas sus secciones
    return await this.fichaRepository.loadFichaCompleta(id);
  }

  // Crea una nueva ficha completa con transaccion atomica
  // Tecnico solo puede crear en sus comunidades asignadas
  async createFichaCompleta(
    input: CreateFichaInput,
    usuarioId: string,
    usuarioComunidadesIds?: string[],
    esAdminOGerente: boolean = false
  ): Promise<FichaCompleta> {
    logger.info(
      {
        codigo_productor: input.codigo_productor,
        gestion: input.gestion,
      },
      "Creating ficha completa"
    );

    // Verificar que el productor existe
    const productor = await this.productorRepository.findByCodigo(
      input.codigo_productor
    );

    if (!productor) {
      throw new Error("Productor no encontrado");
    }

    // Si es tecnico, validar que el productor sea de una de sus comunidades
    if (!esAdminOGerente && usuarioComunidadesIds && usuarioComunidadesIds.length > 0) {
      if (!usuarioComunidadesIds.includes(productor.idComunidad)) {
        throw new Error(
          "No puede crear fichas para productores de otra comunidad"
        );
      }
    }

    // Obtener UUID de la gestion a partir del año
    const gestion = await this.gestionRepository.findByAnio(input.gestion);
    if (!gestion) {
      throw new Error(`Gestión ${input.gestion} no encontrada`);
    }

    // Validar que fecha_inspeccion corresponde al año de la gestión
    const fechaInspeccion = new Date(input.fecha_inspeccion);
    const anioFechaInspeccion = fechaInspeccion.getFullYear();
    if (anioFechaInspeccion !== input.gestion) {
      throw new Error(
        `La fecha de inspección (${anioFechaInspeccion}) no corresponde al año de la gestión (${input.gestion})`
      );
    }

    // Crear entity Ficha principal
    const ficha = Ficha.create({
      codigo_productor: input.codigo_productor,
      gestion: input.gestion,
      id_gestion: gestion.id,
      fecha_inspeccion: new Date(input.fecha_inspeccion),
      inspector_interno: input.inspector_interno,
      persona_entrevistada: input.persona_entrevistada,
      categoria_gestion_anterior: input.categoria_gestion_anterior,
      origen_captura: input.origen_captura,
      created_by: usuarioId,
    });

    // Crear entities de las secciones opcionales
    const fichaCompleta: Parameters<
      typeof this.fichaRepository.createFichaCompleta
    >[0] = {
      ficha,
    };

    // Seccion 2: Revision documentacion
    if (input.revision_documentacion) {
      fichaCompleta.revision_documentacion = RevisionDocumentacion.create({
        id_ficha: "", // Se asignara en el repository
        ...input.revision_documentacion,
      });
    }

    // Seccion 5: Evaluacion mitigacion
    if (input.evaluacion_mitigacion) {
      fichaCompleta.evaluacion_mitigacion = EvaluacionMitigacion.create({
        id_ficha: "",
        ...input.evaluacion_mitigacion,
      });
    }

    // Seccion 9: Evaluacion poscosecha
    if (input.evaluacion_poscosecha) {
      fichaCompleta.evaluacion_poscosecha = EvaluacionPoscosecha.create({
        id_ficha: "",
        ...input.evaluacion_poscosecha,
      });
    }

    // Seccion 10: Evaluacion conocimiento normas
    if (input.evaluacion_conocimiento_normas) {
      fichaCompleta.evaluacion_conocimiento =
        EvaluacionConocimientoNormas.create({
          id_ficha: "",
          ...input.evaluacion_conocimiento_normas,
        });
    }

    // Seccion 3: Acciones correctivas (gestión anterior)
    if (input.acciones_correctivas && input.acciones_correctivas.length > 0) {
      fichaCompleta.acciones_correctivas = input.acciones_correctivas.map(
        (ac) =>
          AccionCorrectiva.create({
            id_ficha: "",
            ...ac,
          })
      );
    }

    // Seccion 11: No conformidades
    if (input.no_conformidades && input.no_conformidades.length > 0) {
      fichaCompleta.no_conformidades = input.no_conformidades.map((nc) =>
        NoConformidad.create({
          id_ficha: "",
          ...nc,
          fecha_limite_implementacion: nc.fecha_limite_implementacion
            ? new Date(nc.fecha_limite_implementacion)
            : undefined,
        })
      );
    }

    // Seccion 6: Actividades pecuarias
    if (input.actividades_pecuarias && input.actividades_pecuarias.length > 0) {
      fichaCompleta.actividades_pecuarias = input.actividades_pecuarias.map(
        (ap) =>
          ActividadPecuaria.create({
            id_ficha: "",
            ...ap,
          })
      );
    }

    // Seccion 4/7: Detalle cultivo parcela
    // Pasamos los datos raw al repository que los separará en dos tablas:
    // - detalle_cultivo_parcela (seccion 4 - todos los cultivos)
    // - manejo_cultivo_mani (seccion 7 - solo cultivos certificables)
    if (
      input.detalle_cultivos_parcelas &&
      input.detalle_cultivos_parcelas.length > 0
    ) {
      fichaCompleta.detalles_cultivo = input.detalle_cultivos_parcelas;
    }

    // Seccion 8: Cosecha ventas
    if (input.cosecha_ventas && input.cosecha_ventas.length > 0) {
      fichaCompleta.cosecha_ventas = input.cosecha_ventas.map((cv) =>
        CosechaVentas.create({
          id_ficha: "",
          ...cv,
        })
      );
    }

    // Seccion 12: Planificacion de siembras
    if (input.planificacion_siembras && input.planificacion_siembras.length > 0) {
      fichaCompleta.planificacion_siembras = input.planificacion_siembras.map((ps) =>
        PlanificacionSiembra.create({
          id_ficha: "",
          ...ps,
          otros_cultivos_detalle: ps.otros_cultivos_detalle || undefined,
        })
      );
    }

    // Datos de inspeccion de parcelas (se actualizan en la tabla parcelas)
    if (input.parcelas_inspeccionadas && input.parcelas_inspeccionadas.length > 0) {
      fichaCompleta.parcelas_inspeccionadas = input.parcelas_inspeccionadas;
      logger.info(
        {
          cantidad: input.parcelas_inspeccionadas.length,
        },
        "Parcelas inspeccionadas recibidas para actualizar"
      );
    }

    // Crear ficha completa con transaccion atomica
    const fichaCreada = await this.fichaRepository.createFichaCompleta(
      fichaCompleta
    );

    logger.info(
      {
        id_ficha: fichaCreada.ficha.id,
        codigo_productor: fichaCreada.ficha.codigoProductor,
        gestion: fichaCreada.ficha.gestion,
      },
      "Ficha completa created successfully"
    );

    // Eliminar draft si existe
    try {
      await this.fichaDraftRepository.deleteDraft(
        input.codigo_productor,
        input.gestion,
        usuarioId
      );
      logger.info(
        {
          codigo_productor: input.codigo_productor,
          gestion: input.gestion
        },
        "Draft eliminado después de crear ficha"
      );
    } catch (error) {
      // No es crítico si falla, solo loguear
      logger.warn(error, "No se pudo eliminar draft al crear ficha");
    }

    return fichaCreada;
  }

  // Actualiza una ficha existente
  // Tecnico solo puede actualizar en su comunidad
  // Solo se puede actualizar si esta en borrador
  async updateFicha(
    id: string,
    input: UpdateFichaInput,
    usuarioComunidadesIds?: string[],
    esAdminOGerente: boolean = false
  ): Promise<FichaResponse> {
    logger.info(
      {
        id_ficha: id,
        updates: input,
      },
      "Updating ficha"
    );

    const fichaActual = await this.fichaRepository.findById(id);
    if (!fichaActual) {
      throw new Error("Ficha no encontrada");
    }

    // Si es tecnico, validar acceso
    if (!esAdminOGerente && usuarioComunidadesIds && usuarioComunidadesIds.length > 0) {
      const productor = await this.productorRepository.findByCodigo(
        fichaActual.codigoProductor
      );

      if (!productor || !usuarioComunidadesIds.includes(productor.idComunidad)) {
        throw new Error("No puede actualizar fichas de otra comunidad");
      }
    }

    // Validar que solo se puede actualizar en borrador
    if (!fichaActual.esBorrador()) {
      throw new Error("Solo se pueden actualizar fichas en borrador");
    }

    // Aplicar cambios a ficha principal

    if (input.inspector_interno) {
      fichaActual.actualizarInspector(input.inspector_interno);
    }

    if (input.persona_entrevistada) {
      fichaActual.actualizarPersonaEntrevistada(input.persona_entrevistada);
    }

    // Actualizar ficha principal
    const fichaActualizada = await this.fichaRepository.updateFicha(
      id,
      fichaActual
    );

    logger.info(
      {
        id_ficha: id,
      },
      "Ficha updated successfully"
    );

    return fichaActualizada.toJSON();
  }

  // Actualiza una ficha completa con todas sus secciones
  // Solo se puede actualizar si esta en borrador
  // Usa estrategia DELETE + INSERT para todas las secciones
  async updateFichaCompleta(
    id: string,
    input: UpdateFichaCompletaInput,
    usuarioId: string
  ): Promise<FichaCompleta> {
    logger.info(
      {
        id_ficha: id,
        usuario: usuarioId,
      },
      "Updating ficha completa"
    );

    // Verificar que la ficha existe
    const fichaExistente = await this.fichaRepository.findById(id);
    if (!fichaExistente) {
      throw new Error("Ficha no encontrada");
    }

    // Verificar que esta en estado borrador
    if (!fichaExistente.esBorrador()) {
      throw new Error("Solo se pueden actualizar fichas en estado borrador");
    }

    // Verificar permisos: debe ser el creador
    // Los administradores pueden usar la ruta normal de actualización o editar directamente en BD
    if (fichaExistente.createdBy !== usuarioId) {
      throw new Error("Solo el creador de la ficha puede actualizarla");
    }

    // Actualizar en el repository (con transaccion)
    const fichaActualizada = await this.fichaRepository.updateFichaCompleta(
      id,
      input
    );

    logger.info(
      {
        id_ficha: id,
      },
      "Ficha completa updated successfully"
    );

    return fichaActualizada;
  }

  // Elimina (desactiva) una ficha
  // Solo admin puede eliminar
  // Solo se puede eliminar si esta en borrador
  async deleteFicha(id: string): Promise<void> {
    logger.info(
      {
        id_ficha: id,
      },
      "Deleting ficha"
    );

    const ficha = await this.fichaRepository.findById(id);
    if (!ficha) {
      throw new Error("Ficha no encontrada");
    }

    // Validar que solo se puede eliminar en borrador
    if (!ficha.esBorrador()) {
      throw new Error("Solo se pueden eliminar fichas en borrador");
    }

    await this.fichaRepository.softDelete(id);

    logger.info(
      {
        id_ficha: id,
      },
      "Ficha deleted successfully"
    );
  }

  // Añade un archivo a una ficha existente
  // Usa streaming y validación de magic numbers para mayor seguridad
  async addArchivoToFicha(
    fichaId: string,
    usuarioId: string,
    usuarioComunidadesIds: string[] | undefined,
    esAdminOGerente: boolean,
    fileData: MultipartFile,
    tipoArchivo: string
  ): Promise<ArchivoFichaResponse> {
    logger.info(
      {
        id_ficha: fichaId,
        filename: fileData.filename,
        mimetype: fileData.mimetype,
        tipo_archivo: tipoArchivo,
      },
      "Adding archivo to ficha"
    );

    // 1. Validar acceso a la ficha
    const ficha = await this.fichaRepository.findById(fichaId);
    if (!ficha) {
      throw new Error("Ficha no encontrada");
    }

    if (!esAdminOGerente && usuarioComunidadesIds && usuarioComunidadesIds.length > 0) {
      const productor = await this.productorRepository.findByCodigo(
        ficha.codigoProductor
      );
      if (!productor || !usuarioComunidadesIds.includes(productor.idComunidad)) {
        throw new Error("No tiene acceso a esta ficha");
      }
    }

    // 2. Validar tipo de archivo
    if (
      !tipoArchivo ||
      !["croquis", "foto_parcela", "documento_pdf"].includes(tipoArchivo)
    ) {
      throw new Error(
        "Tipo de archivo no válido. Debe ser: croquis, foto_parcela o documento_pdf"
      );
    }

    // 3. Importar utilidades de uploads y validación
    const { generateUniqueFilename, buildFilePath, buildRelativePath } =
      await import("../utils/uploads.js");
    const { validateFile } = await import("../utils/fileValidation.js");

    // 4. Generar nombre único y paths
    const uniqueFilename = generateUniqueFilename(fileData.filename, fichaId);
    const fullPath = buildFilePath(tipoArchivo, uniqueFilename);
    const relativePath = buildRelativePath(tipoArchivo, uniqueFilename);

    let tempPath: string | null = null;

    try {
      // 5. Guardar archivo temporalmente para validación
      // Usamos pipeline para streaming eficiente
      tempPath = `${fullPath}.tmp`;
      await pipeline(fileData.file, createWriteStream(tempPath));

      // 6. Leer archivo para validación de magic numbers
      const fileBuffer = await fs.readFile(tempPath);

      // 7. Validar archivo (tipo y tamaño) con magic numbers
      const validation = await validateFile(fileBuffer, tipoArchivo as any);
      if (!validation.valid) {
        const errorMessages = validation.errors.map((e) => e.message).join(", ");
        throw new Error(`Validación de archivo falló: ${errorMessages}`);
      }

      // 8. Renombrar de temporal a definitivo
      await fs.rename(tempPath, fullPath);
      tempPath = null; // Ya no es temporal

      // 9. Obtener tamaño del archivo
      const stats = await fs.stat(fullPath);

      logger.info(
        {
          id_ficha: fichaId,
          filename: uniqueFilename,
          detectedMime: validation.detectedMimeType,
          size: stats.size,
        },
        "File validated and saved successfully"
      );

      // 10. Crear y guardar la entidad ArchivoFicha
      const archivo = ArchivoFicha.create({
        id_ficha: fichaId,
        tipo_archivo: tipoArchivo as any,
        nombre_original: fileData.filename,
        ruta_almacenamiento: relativePath,
        tamaño_bytes: stats.size,
        mime_type: validation.detectedMimeType || fileData.mimetype,
      });

      // Marcar como subido ANTES de crear en BD
      archivo.marcarSubido();

      const nuevoArchivo = await this.archivoFichaRepository.create(archivo);

      logger.info(
        {
          id_archivo: nuevoArchivo.id,
          id_ficha: fichaId,
          path: relativePath,
        },
        "Archivo added to ficha successfully"
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
          id_ficha: fichaId,
        },
        "Error adding archivo to ficha"
      );

      throw error;
    }
  }

  // Lista archivos de una ficha
  async listArchivos(
    fichaId: string,
    usuarioComunidadesIds?: string[],
    esAdminOGerente: boolean = false
  ): Promise<ArchivoFichaResponse[]> {
    // Validar acceso a la ficha
    const ficha = await this.fichaRepository.findById(fichaId);
    if (!ficha) {
      throw new Error("Ficha no encontrada");
    }

    if (!esAdminOGerente && usuarioComunidadesIds && usuarioComunidadesIds.length > 0) {
      const productor = await this.productorRepository.findByCodigo(
        ficha.codigoProductor
      );
      if (!productor || !usuarioComunidadesIds.includes(productor.idComunidad)) {
        throw new Error("No tiene acceso a esta ficha");
      }
    }

    const archivos = await this.archivoFichaRepository.findByFichaId(fichaId);
    return archivos.map((a) => a.toJSON());
  }

  // Elimina un archivo de una ficha
  async deleteArchivo(
    archivoId: string,
    usuarioComunidadesIds?: string[],
    esAdminOGerente: boolean = false
  ): Promise<void> {
    logger.info(
      {
        id_archivo: archivoId,
      },
      "Eliminando archivo de ficha"
    );

    // Buscar archivo en BD
    const archivo = await this.archivoFichaRepository.findById(archivoId);
    if (!archivo) {
      throw new Error("Archivo no encontrado");
    }

    // Validar acceso a la ficha
    const ficha = await this.fichaRepository.findById(archivo.idFicha);
    if (!ficha) {
      throw new Error("Ficha no encontrada");
    }

    if (!esAdminOGerente && usuarioComunidadesIds && usuarioComunidadesIds.length > 0) {
      const productor = await this.productorRepository.findByCodigo(
        ficha.codigoProductor
      );
      if (!productor || !usuarioComunidadesIds.includes(productor.idComunidad)) {
        throw new Error("No tiene acceso a esta ficha");
      }
    }

    // Construir ruta completa del archivo físico
    const { config } = await import("../config/environment.js");
    const path = await import("path");
    const rutaCompleta = path.default.join(
      config.upload.path,
      archivo.rutaAlmacenamiento
    );

    // Intentar eliminar archivo físico
    try {
      await fs.unlink(rutaCompleta);
      logger.info(
        {
          ruta: rutaCompleta,
        },
        "Archivo físico eliminado exitosamente"
      );
    } catch (error) {
      // Si el archivo físico no existe o falla, solo loguear warning
      // No abortamos la operación porque queremos limpiar la BD de todos modos
      logger.warn(
        {
          error: error instanceof Error ? error.message : "Unknown error",
          ruta: rutaCompleta,
        },
        "No se pudo eliminar archivo físico (puede que ya no exista)"
      );
    }

    // Eliminar registro de BD
    await this.archivoFichaRepository.delete(archivoId);

    logger.info(
      {
        id_archivo: archivoId,
        id_ficha: archivo.idFicha,
      },
      "Archivo eliminado exitosamente de la base de datos"
    );
  }

  // METODOS DE WORKFLOW

  // Envia ficha a revision
  // Solo se puede enviar desde borrador
  async enviarRevision(
    id: string,
    input: EnviarRevisionInput,
    usuarioComunidadesIds?: string[],
    esAdminOGerente: boolean = false
  ): Promise<FichaResponse> {
    logger.info(
      {
        id_ficha: id,
      },
      "Enviando ficha a revision"
    );

    const ficha = await this.fichaRepository.findById(id);
    if (!ficha) {
      throw new Error("Ficha no encontrada");
    }

    // Si es tecnico, validar acceso
    if (!esAdminOGerente && usuarioComunidadesIds && usuarioComunidadesIds.length > 0) {
      const productor = await this.productorRepository.findByCodigo(
        ficha.codigoProductor
      );

      if (!productor || !usuarioComunidadesIds.includes(productor.idComunidad)) {
        throw new Error("No tiene acceso a esta ficha");
      }
    }

    // Validar que puede enviarse a revision
    if (!ficha.puedeEnviarRevision()) {
      throw new Error("La ficha no puede enviarse a revision");
    }

    // ===== VALIDACIÓN DE SUPERFICIES =====
    // Obtener productor y detalles de cultivo para validar
    const productor = await this.productorRepository.findByCodigo(
      ficha.codigoProductor
    );
    if (!productor) {
      throw new Error("Productor no encontrado para validar superficies");
    }

    // Obtener ficha completa con detalles de cultivo
    const fichaCompleta = await this.fichaRepository.loadFichaCompleta(id);
    const detallesCultivo = fichaCompleta.detalles_cultivo || [];

    // Validar superficies SOLO si hay cultivos registrados
    if (detallesCultivo.length > 0) {
      // Obtener parcelas del productor para validar superficies
      const parcelas = await this.parcelaRepository.findByProductor(
        ficha.codigoProductor
      );
      const parcelasData = parcelas.map((p) => ({
        id_parcela: p.id,
        codigo_productor: p.codigoProductor,
        numero_parcela: p.numeroParcela,
        superficie_ha: p.superficieHa,
        latitud_sud: p.latitudSud,
        longitud_oeste: p.longitudOeste,
        utiliza_riego: p.utilizaRiego,
        tipo_barrera: p.tipoBarrera,
        insumos_organicos: p.insumosOrganicos,
        rotacion: p.rotacion,
        activo: p.activo,
        created_at: p.createdAt,
        nombre_productor: p.nombreProductor,
        nombre_comunidad: p.nombreComunidad,
      }));

      const validacion = validarSuperficiesFicha(
        parcelasData,
        detallesCultivo.map((dc) => ({
          id_detalle: dc.id,
          id_ficha: dc.idFicha,
          id_parcela: dc.idParcela,
          id_tipo_cultivo: dc.idTipoCultivo,
          superficie_ha: dc.superficieHa,
          situacion_actual: dc.situacionActual,
          created_at: dc.createdAt,
        }))
      );

      // Si hay ERRORES, no permitir enviar
      if (!validacion.valid) {
        throw new Error(
          `Validación de superficies falló:\n${validacion.errors.join("\n")}`
        );
      }

      // Si hay WARNINGS, logearlos pero permitir continuar
      if (validacion.warnings.length > 0) {
        logger.warn(
          {
            id_ficha: id,
            warnings: validacion.warnings,
          },
          "Advertencias en validación de superficies"
        );
      }

      // Loggear detalles de la validación
      if (validacion.detalles) {
        const superficieTotalCultivada = validacion.detalles.resumen_por_parcela.reduce(
          (sum, p) => sum + p.superficie_cultivada,
          0
        );
        const porcentajeUsoTotal =
          validacion.detalles.superficie_total_productor > 0
            ? (superficieTotalCultivada / validacion.detalles.superficie_total_productor) * 100
            : 0;

        logger.info(
          {
            id_ficha: id,
            superficie_total_parcelas: validacion.detalles.superficie_total_parcelas,
            superficie_cultivada: superficieTotalCultivada,
            porcentaje_uso: porcentajeUsoTotal.toFixed(1) + "%",
            num_parcelas: validacion.detalles.resumen_por_parcela.length,
          },
          "Validación de superficies exitosa"
        );
      }
    }
    // ===== FIN VALIDACIÓN DE SUPERFICIES =====

    // Enviar a revision
    ficha.enviarRevision();

    // Actualizar en BD
    const fichaActualizada = await this.fichaRepository.updateFicha(id, ficha);

    logger.info(
      {
        id_ficha: id,
      },
      "Ficha enviada a revision exitosamente"
    );

    return fichaActualizada.toJSON();
  }

  // Aprueba una ficha
  // Solo gerente/admin pueden aprobar
  // Sincroniza automaticamente a cultivos_gestion
  async aprobarFicha(
    id: string,
    input: AprobarFichaInput
  ): Promise<FichaResponse> {
    logger.info(
      {
        id_ficha: id,
      },
      "Aprobando ficha"
    );

    const ficha = await this.fichaRepository.findById(id);
    if (!ficha) {
      throw new Error("Ficha no encontrada");
    }

    // Validar que puede aprobarse
    if (!ficha.puedeAprobar()) {
      throw new Error("La ficha no puede aprobarse");
    }

    // Aprobar
    ficha.aprobar(input.comentarios_evaluacion);

    // Actualizar en BD
    const fichaActualizada = await this.fichaRepository.updateFicha(id, ficha);

    // Sincronizar a cultivos_gestion
    // Si falla, revertir aprobacion
    try {
      logger.info(
        {
          id_ficha: id,
          codigo_productor: ficha.codigoProductor,
          gestion: ficha.gestion,
        },
        "Sincronizando cultivos_gestion"
      );

      await this.cultivosGestionRepository.sincronizarDesdeFicha(id);

      logger.info(
        {
          id_ficha: id,
        },
        "Ficha aprobada y sincronizada exitosamente"
      );
    } catch (error) {
      // Si falla la sincronizacion, revertir aprobacion
      logger.error(
        {
          id_ficha: id,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        "Error al sincronizar cultivos_gestion - Revirtiendo aprobacion"
      );

      // Revertir estado a revision
      ficha.rechazar("Error de sincronización: " + (error instanceof Error ? error.message : "Unknown error"));
      await this.fichaRepository.updateFicha(id, ficha);

      throw new Error(
        "Error al sincronizar datos de cultivos. La ficha fue revertida a estado rechazado. Intente nuevamente."
      );
    }

    return fichaActualizada.toJSON();
  }

  // Rechaza una ficha
  // Solo gerente/admin pueden rechazar
  async rechazarFicha(
    id: string,
    input: RechazarFichaInput
  ): Promise<FichaResponse> {
    logger.info(
      {
        id_ficha: id,
      },
      "Rechazando ficha"
    );

    const ficha = await this.fichaRepository.findById(id);
    if (!ficha) {
      throw new Error("Ficha no encontrada");
    }

    // Validar que puede rechazarse
    if (!ficha.puedeRechazar()) {
      throw new Error("La ficha no puede rechazarse");
    }

    // Rechazar
    ficha.rechazar(input.motivo);

    // Actualizar en BD
    const fichaActualizada = await this.fichaRepository.updateFicha(id, ficha);

    logger.info(
      {
        id_ficha: id,
      },
      "Ficha rechazada exitosamente"
    );

    return fichaActualizada.toJSON();
  }


  // METODOS DE ESTADISTICAS

  // Obtiene estadisticas de fichas
  async getEstadisticas(
    usuarioComunidadesIds?: string[],
    esAdminOGerente: boolean = false,
    gestion?: number
  ): Promise<{
    total: number;
    por_estado: Record<string, number>;
    por_resultado: Record<string, number>;
    pendientes_sincronizacion: number;
  }> {
    const añoConsulta = gestion ?? new Date().getFullYear();

    let fichas: Ficha[];

    if (!esAdminOGerente && usuarioComunidadesIds && usuarioComunidadesIds.length > 0) {
      // Estadisticas solo de sus comunidades asignadas
      fichas = await this.fichaRepository.findByComunidadesGestion(
        usuarioComunidadesIds,
        añoConsulta
      );
    } else {
      // Estadisticas globales
      fichas = await this.fichaRepository.findByGestion(añoConsulta);
    }

    const porEstado: Record<string, number> = {
      borrador: 0,
      revision: 0,
      aprobado: 0,
      rechazado: 0,
    };

    const porResultado: Record<string, number> = {
      aprobado: 0,
      rechazado: 0,
      pendiente: 0,
    };

    let pendientesSync = 0;

    for (const ficha of fichas) {
      porEstado[ficha.estadoFicha]++;
      porResultado[ficha.resultadoCertificacion]++;

      if (!ficha.estaSincronizada()) {
        pendientesSync++;
      }
    }

    return {
      total: fichas.length,
      por_estado: porEstado,
      por_resultado: porResultado,
      pendientes_sincronizacion: pendientesSync,
    };
  }

  // Cuenta fichas por estado
  async countByEstado(estado: string): Promise<number> {
    return await this.fichaRepository.countByEstado(estado);
  }

  // Cuenta fichas por gestion
  async countByGestion(gestion: number): Promise<number> {
    return await this.fichaRepository.countByGestion(gestion);
  }

  // METODOS PARA DRAFT

  // Guarda o actualiza un borrador de ficha
  async saveDraft(
    codigoProductor: string,
    gestion: number,
    stepActual: number,
    draftData: any,
    userId: string
  ): Promise<FichaDraft> {
    try {
      logger.info(
        `Guardando borrador: ${codigoProductor}-${gestion} (user: ${userId})`
      );

      const draft = await this.fichaDraftRepository.upsert({
        codigo_productor: codigoProductor,
        gestion,
        draft_data: draftData,
        step_actual: stepActual,
        created_by: userId,
      });

      return draft;
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : "Unknown error",
          codigo_productor: codigoProductor,
          gestion: gestion,
        },
        "Error en FichasService.saveDraft"
      );
      throw new Error("Error al guardar borrador de ficha");
    }
  }

  // Obtiene un borrador por productor y gestion del usuario actual
  async getDraft(
    codigoProductor: string,
    gestion: number,
    userId: string
  ): Promise<FichaDraft | null> {
    try {
      const draft = await this.fichaDraftRepository.findByProductorGestionUser(
        codigoProductor,
        gestion,
        userId
      );

      return draft;
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : "Unknown error",
          codigo_productor: codigoProductor,
          gestion: gestion,
        },
        "Error en FichasService.getDraft"
      );
      throw new Error("Error al obtener borrador de ficha");
    }
  }

  // Obtiene un borrador por ID
  async getDraftById(idDraft: string, userId: string): Promise<FichaDraft> {
    try {
      const draft = await this.fichaDraftRepository.findById(idDraft);

      if (!draft) {
        throw new Error("Borrador no encontrado");
      }

      // Verificar que el borrador pertenece al usuario
      const draftEntity = new FichaDraftEntity(draft);
      if (!draftEntity.belongsToUser(userId)) {
        throw new Error("No tienes permiso para acceder a este borrador");
      }

      return draft;
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : "Unknown error",
          id_draft: idDraft,
        },
        "Error en FichasService.getDraftById"
      );
      throw error;
    }
  }

  // Lista todos los borradores del usuario
  async listMyDrafts(userId: string): Promise<FichaDraft[]> {
    try {
      const drafts = await this.fichaDraftRepository.findByUser(userId);
      return drafts;
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : "Unknown error",
          user_id: userId,
        },
        "Error en FichasService.listMyDrafts"
      );
      throw new Error("Error al listar borradores");
    }
  }

  // Elimina un borrador
  async deleteDraft(idDraft: string, userId: string): Promise<void> {
    try {
      // Verificar que existe y pertenece al usuario
      void await this.getDraftById(idDraft, userId);

      await this.fichaDraftRepository.delete(idDraft);

      logger.info(`Borrador eliminado: ${idDraft}`);
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : "Unknown error",
          id_draft: idDraft,
        },
        "Error en FichasService.deleteDraft"
      );
      throw error;
    }
  }

  // Busca una ficha por codigo_productor y gestion
  // Usado para verificar si ya existe una ficha antes de crear una nueva
  async findByProductorGestion(
    codigoProductor: string,
    gestion: number
  ): Promise<Ficha | null> {
    try {
      const ficha = await this.fichaRepository.findByProductorGestion(
        codigoProductor,
        gestion
      );

      return ficha;
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : "Unknown error",
          codigo_productor: codigoProductor,
          gestion,
        },
        "Error en FichasService.findByProductorGestion"
      );
      throw new Error("Error al buscar ficha por productor y gestión");
    }
  }

  // Limpia borradores antiguos (tarea de mantenimiento)
  async cleanOldDrafts(): Promise<number> {
    try {
      const count = await this.fichaDraftRepository.deleteOldDrafts();
      logger.info(`Limpieza de borradores antiguos: ${count} eliminados`);
      return count;
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : "Unknown error",
        },
        "Error en FichasService.cleanOldDrafts"
      );
      throw new Error("Error al limpiar borradores antiguos");
    }
  }
}
