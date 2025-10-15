import { FichaRepository } from "../repositories/FichaRepository.js";
import { ProductorRepository } from "../repositories/ProductorRepository.js";
import { ArchivoFichaRepository } from "../repositories/ArchivoFichaRepository.js";
import { Ficha } from "../entities/Ficha.js";
import { RevisionDocumentacion } from "../entities/RevisionDocumentacion.js";
import { AccionCorrectiva } from "../entities/AccionCorrectiva.js";
import { NoConformidad } from "../entities/NoConformidad.js";
import { EvaluacionMitigacion } from "../entities/EvaluacionMitigacion.js";
import { EvaluacionPoscosecha } from "../entities/EvaluacionPoscosecha.js";
import { EvaluacionConocimientoNormas } from "../entities/EvaluacionConocimientoNormas.js";
import { ActividadPecuaria } from "../entities/ActividadPecuaria.js";
import { DetalleCultivoParcela } from "../entities/DetalleCultivoParcela.js";
import { CosechaVentas } from "../entities/CosechaVentas.js";
import { ArchivoFicha } from "../entities/ArchivoFicha.js";
import { createAuthLogger } from "../utils/logger.js";
import { validarSuperficiesFicha } from "../utils/superficieValidation.js";
import type {
  CreateFichaInput,
  UpdateFichaInput,
  FichaResponse,
  EnviarRevisionInput,
  AprobarFichaInput,
  RechazarFichaInput,
  ArchivoFichaResponse,
} from "../schemas/fichas.schema.js";
import type { FichaCompleta } from "../repositories/FichaRepository.js";
import type { MultipartFile } from "@fastify/multipart";
import path from "path";
import fs from "fs/promises";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { randomUUID } from "crypto";

const logger = createAuthLogger();

// Service para gestion de fichas de inspeccion
// Incluye validacion de acceso por comunidad del productor
export class FichasService {
  private fichaRepository: FichaRepository;
  private productorRepository: ProductorRepository;
  private archivoFichaRepository: ArchivoFichaRepository;

  constructor(
    fichaRepository: FichaRepository,
    productorRepository: ProductorRepository,
    archivoFichaRepository: ArchivoFichaRepository
  ) {
    this.fichaRepository = fichaRepository;
    this.productorRepository = productorRepository;
    this.archivoFichaRepository = archivoFichaRepository;
  }

  // Lista fichas con filtros
  // Tecnico: solo su comunidad
  // Gerente/Admin: todas las comunidades
  async listFichas(
    usuarioComunidadId?: string,
    esAdminOGerente: boolean = false,
    gestion?: number,
    comunidadId?: string,
    codigoProductor?: string,
    estado?: string
  ): Promise<{ fichas: FichaResponse[]; total: number }> {
    let fichas: Ficha[];

    // Si es tecnico, filtrar solo su comunidad
    if (!esAdminOGerente && usuarioComunidadId) {
      if (gestion) {
        fichas = await this.fichaRepository.findByComunidadGestion(
          usuarioComunidadId,
          gestion
        );
      } else {
        // Obtener fichas de productores de su comunidad
        const productores = await this.productorRepository.findByComunidad(
          usuarioComunidadId
        );
        fichas = [];
        for (const productor of productores) {
          const fichasProductor = await this.fichaRepository.findByProductor(
            productor.codigo
          );
          fichas.push(...fichasProductor);
        }
      }
    }
    // Admin/gerente con filtros
    else if (gestion && comunidadId) {
      fichas = await this.fichaRepository.findByComunidadGestion(
        comunidadId,
        gestion
      );
    } else if (gestion) {
      fichas = await this.fichaRepository.findByGestion(gestion);
    } else if (codigoProductor) {
      fichas = await this.fichaRepository.findByProductor(codigoProductor);
    } else {
      // Por defecto, traer fichas del año actual
      const añoActual = new Date().getFullYear();
      fichas = await this.fichaRepository.findByGestion(añoActual);
    }

    // Filtrar por estado si se especifica
    if (estado) {
      fichas = fichas.filter((f) => f.estadoFicha === estado);
    }

    return {
      fichas: fichas.map((f) => f.toJSON()),
      total: fichas.length,
    };
  }

  // Obtiene una ficha por ID con todas sus secciones
  // Valida acceso segun rol
  async getFichaCompleta(
    id: string,
    usuarioComunidadId?: string,
    esAdminOGerente: boolean = false
  ): Promise<FichaCompleta> {
    const ficha = await this.fichaRepository.findById(id);

    if (!ficha) {
      throw new Error("Ficha no encontrada");
    }

    // Si es tecnico, validar acceso a la comunidad del productor
    if (!esAdminOGerente && usuarioComunidadId) {
      const productor = await this.productorRepository.findByCodigo(
        ficha.codigoProductor
      );

      if (!productor || productor.idComunidad !== usuarioComunidadId) {
        throw new Error("No tiene acceso a esta ficha");
      }
    }

    // Cargar ficha completa con todas sus secciones
    return await this.fichaRepository.loadFichaCompleta(id);
  }

  // Crea una nueva ficha completa con transaccion atomica
  // Tecnico solo puede crear en su comunidad
  async createFichaCompleta(
    input: CreateFichaInput,
    usuarioId: string,
    usuarioComunidadId?: string,
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

    // Si es tecnico, validar que sea de su comunidad
    if (!esAdminOGerente && usuarioComunidadId) {
      if (productor.idComunidad !== usuarioComunidadId) {
        throw new Error(
          "No puede crear fichas para productores de otra comunidad"
        );
      }
    }

    // Crear entity Ficha principal
    const ficha = Ficha.create({
      codigo_productor: input.codigo_productor,
      gestion: input.gestion,
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

    // Seccion 7: Detalle cultivo parcela
    if (
      input.detalle_cultivos_parcelas &&
      input.detalle_cultivos_parcelas.length > 0
    ) {
      fichaCompleta.detalles_cultivo = input.detalle_cultivos_parcelas.map(
        (dcp) =>
          DetalleCultivoParcela.create({
            id_ficha: "",
            ...dcp,
          })
      );
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

    return fichaCreada;
  }

  // Actualiza una ficha existente
  // Tecnico solo puede actualizar en su comunidad
  // Solo se puede actualizar si esta en borrador
  async updateFicha(
    id: string,
    input: UpdateFichaInput,
    usuarioComunidadId?: string,
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
    if (!esAdminOGerente && usuarioComunidadId) {
      const productor = await this.productorRepository.findByCodigo(
        fichaActual.codigoProductor
      );

      if (!productor || productor.idComunidad !== usuarioComunidadId) {
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

    if (input.recomendaciones) {
      fichaActual.actualizarRecomendaciones(input.recomendaciones);
    }

    if (input.firma_productor) {
      fichaActual.actualizarFirmaProductor(input.firma_productor);
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
    usuarioComunidadId: string | undefined,
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

    if (!esAdminOGerente && usuarioComunidadId) {
      const productor = await this.productorRepository.findByCodigo(
        ficha.codigoProductor
      );
      if (!productor || productor.idComunidad !== usuarioComunidadId) {
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
    usuarioComunidadId?: string,
    esAdminOGerente: boolean = false
  ): Promise<ArchivoFichaResponse[]> {
    // Validar acceso a la ficha
    const ficha = await this.fichaRepository.findById(fichaId);
    if (!ficha) {
      throw new Error("Ficha no encontrada");
    }

    if (!esAdminOGerente && usuarioComunidadId) {
      const productor = await this.productorRepository.findByCodigo(
        ficha.codigoProductor
      );
      if (!productor || productor.idComunidad !== usuarioComunidadId) {
        throw new Error("No tiene acceso a esta ficha");
      }
    }

    const archivos = await this.archivoFichaRepository.findByFichaId(fichaId);
    return archivos.map((a) => a.toJSON());
  }

  // Elimina un archivo de una ficha
  async deleteArchivo(
    archivoId: string,
    usuarioComunidadId?: string,
    esAdminOGerente: boolean = false
  ): Promise<void> {
    // TODO: Implementar método findById en ArchivoFichaRepository
    // Por ahora, buscar en la lista de archivos de la ficha
    throw new Error("Método deleteArchivo pendiente de implementación");
  }

  // METODOS DE WORKFLOW

  // Envia ficha a revision
  // Solo se puede enviar desde borrador
  async enviarRevision(
    id: string,
    input: EnviarRevisionInput,
    usuarioComunidadId?: string,
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
    if (!esAdminOGerente && usuarioComunidadId) {
      const productor = await this.productorRepository.findByCodigo(
        ficha.codigoProductor
      );

      if (!productor || productor.idComunidad !== usuarioComunidadId) {
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
      const validacion = validarSuperficiesFicha(
        productor.toDatabaseInsert(),
        detallesCultivo.map((dc) => ({
          id_detalle_cultivo: dc.id,
          id_ficha: dc.idFicha,
          id_parcela: dc.idParcela,
          id_tipo_cultivo: dc.idTipoCultivo,
          superficie_ha: dc.superficieHa,
          procedencia_semilla: dc.procedenciaSemilla,
          categoria_semilla: dc.categoriaSemilla,
          tratamiento_semillas: dc.tratamientoSemillas,
          tipo_abonamiento: dc.tipoAbonamiento,
          metodo_aporque: dc.metodoAporque,
          control_hierbas: dc.controlHierbas,
          metodo_cosecha: dc.metodoCosecha,
          rotacion: dc.rotacion,
          insumos_organicos_usados: dc.insumosOrganicosUsados,
          nombre_cultivo: undefined, // No lo tenemos aquí, se enriquece en la query
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
        logger.info(
          {
            id_ficha: id,
            superficie_total: validacion.detalles.superficie_total_productor,
            superficie_usada: validacion.detalles.superficie_usada_en_ficha,
            porcentaje_uso: validacion.detalles.porcentaje_uso.toFixed(1) + "%",
          },
          "Validación de superficies exitosa"
        );
      }
    }
    // ===== FIN VALIDACIÓN DE SUPERFICIES =====

    // Enviar a revision
    ficha.enviarRevision(input.recomendaciones, input.firma_inspector);

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

    logger.info(
      {
        id_ficha: id,
      },
      "Ficha aprobada exitosamente"
    );

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

  // Devuelve ficha a borrador
  // Solo admin puede devolver
  async devolverBorrador(id: string): Promise<FichaResponse> {
    logger.info(
      {
        id_ficha: id,
      },
      "Devolviendo ficha a borrador"
    );

    const ficha = await this.fichaRepository.findById(id);
    if (!ficha) {
      throw new Error("Ficha no encontrada");
    }

    // Devolver a borrador
    ficha.devolverBorrador();

    // Actualizar en BD
    const fichaActualizada = await this.fichaRepository.updateFicha(id, ficha);

    logger.info(
      {
        id_ficha: id,
      },
      "Ficha devuelta a borrador exitosamente"
    );

    return fichaActualizada.toJSON();
  }

  // METODOS DE ESTADISTICAS

  // Obtiene estadisticas de fichas
  async getEstadisticas(
    usuarioComunidadId?: string,
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

    if (!esAdminOGerente && usuarioComunidadId) {
      // Estadisticas solo de su comunidad
      fichas = await this.fichaRepository.findByComunidadGestion(
        usuarioComunidadId,
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
}
