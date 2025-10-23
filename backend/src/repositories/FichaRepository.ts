import { ReadQuery, WriteQuery, Transaction } from "../config/connection.js";
import { Ficha, FichaData } from "../entities/Ficha.js";
import {
  RevisionDocumentacion,
  RevisionDocumentacionData,
} from "../entities/RevisionDocumentacion.js";
import {
  AccionCorrectiva,
  AccionCorrectivaData,
} from "../entities/AccionCorrectiva.js";
import { NoConformidad, NoConformidadData } from "../entities/NoConformidad.js";
import {
  EvaluacionMitigacion,
  EvaluacionMitigacionData,
} from "../entities/EvaluacionMitigacion.js";
import {
  EvaluacionPoscosecha,
  EvaluacionPoscosechaData,
} from "../entities/EvaluacionPoscosecha.js";
import {
  EvaluacionConocimientoNormas,
  EvaluacionConocimientoNormasData,
} from "../entities/EvaluacionConocimientoNormas.js";
import {
  ActividadPecuaria,
  ActividadPecuariaData,
} from "../entities/ActividadPecuaria.js";
import {
  DetalleCultivoParcela,
  DetalleCultivoParcelaData,
} from "../entities/DetalleCultivoParcela.js";
import { CosechaVentas, CosechaVentasData } from "../entities/CosechaVentas.js";
import { ArchivoFicha, ArchivoFichaData } from "../entities/ArchivoFicha.js";

// Interfaz para ficha completa con todas sus secciones
export interface FichaCompleta {
  ficha: Ficha;
  revision_documentacion?: RevisionDocumentacion;
  acciones_correctivas: AccionCorrectiva[];
  no_conformidades: NoConformidad[];
  evaluacion_mitigacion?: EvaluacionMitigacion;
  evaluacion_poscosecha?: EvaluacionPoscosecha;
  evaluacion_conocimiento?: EvaluacionConocimientoNormas;
  actividades_pecuarias: ActividadPecuaria[];
  detalles_cultivo: DetalleCultivoParcela[];
  cosecha_ventas: CosechaVentas[];
  archivos: ArchivoFicha[];
}

// Repository centralizado para fichas con transacciones atomicas
export class FichaRepository {
  // Encuentra ficha por ID con todos sus datos
  async findById(id: string): Promise<Ficha | null> {
    const query = {
      name: "find-ficha-by-id",
      text: `
        SELECT
          fi.id_ficha,
          fi.codigo_productor,
          fi.gestion,
          fi.fecha_inspeccion,
          fi.inspector_interno,
          fi.persona_entrevistada,
          fi.categoria_gestion_anterior,
          fi.origen_captura,
          fi.fecha_sincronizacion,
          fi.estado_sync,
          fi.estado_ficha,
          fi.resultado_certificacion,
          fi.recomendaciones,
          fi.comentarios_evaluacion,
          fi.firma_productor,
          fi.firma_inspector,
          fi.created_by,
          fi.created_at,
          fi.updated_at,
          p.nombre_productor,
          c.nombre_comunidad
        FROM ficha_inspeccion fi
        INNER JOIN productores p ON fi.codigo_productor = p.codigo_productor
        INNER JOIN comunidades c ON p.id_comunidad = c.id_comunidad
        WHERE fi.id_ficha = $1
      `,
      values: [id],
    };

    const result = await ReadQuery.findOne<FichaData>(query);
    return result ? Ficha.fromDatabase(result) : null;
  }

  // Encuentra ficha por productor y gestion
  async findByProductorGestion(
    codigoProductor: string,
    gestion: number
  ): Promise<Ficha | null> {
    const query = {
      name: "find-ficha-by-productor-gestion",
      text: `
        SELECT
          fi.id_ficha,
          fi.codigo_productor,
          fi.gestion,
          fi.fecha_inspeccion,
          fi.inspector_interno,
          fi.persona_entrevistada,
          fi.categoria_gestion_anterior,
          fi.origen_captura,
          fi.fecha_sincronizacion,
          fi.estado_sync,
          fi.estado_ficha,
          fi.resultado_certificacion,
          fi.recomendaciones,
          fi.comentarios_evaluacion,
          fi.firma_productor,
          fi.firma_inspector,
          fi.created_by,
          fi.created_at,
          fi.updated_at,
          p.nombre_productor,
          c.nombre_comunidad
        FROM ficha_inspeccion fi
        INNER JOIN productores p ON fi.codigo_productor = p.codigo_productor
        INNER JOIN comunidades c ON p.id_comunidad = c.id_comunidad
        WHERE fi.codigo_productor = $1 AND fi.gestion = $2
      `,
      values: [codigoProductor, gestion],
    };

    const result = await ReadQuery.findOne<FichaData>(query);
    return result ? Ficha.fromDatabase(result) : null;
  }

  // Lista fichas por productor
  async findByProductor(codigoProductor: string): Promise<Ficha[]> {
    const query = {
      name: "find-fichas-by-productor",
      text: `
        SELECT
          fi.id_ficha,
          fi.codigo_productor,
          fi.gestion,
          fi.fecha_inspeccion,
          fi.inspector_interno,
          fi.persona_entrevistada,
          fi.categoria_gestion_anterior,
          fi.origen_captura,
          fi.fecha_sincronizacion,
          fi.estado_sync,
          fi.estado_ficha,
          fi.resultado_certificacion,
          fi.recomendaciones,
          fi.comentarios_evaluacion,
          fi.firma_productor,
          fi.firma_inspector,
          fi.created_by,
          fi.created_at,
          fi.updated_at,
          p.nombre_productor,
          c.nombre_comunidad
        FROM ficha_inspeccion fi
        INNER JOIN productores p ON fi.codigo_productor = p.codigo_productor
        INNER JOIN comunidades c ON p.id_comunidad = c.id_comunidad
        WHERE fi.codigo_productor = $1
        ORDER BY fi.gestion DESC
      `,
      values: [codigoProductor],
    };

    const results = await ReadQuery.execute<FichaData>(query);
    return results.map((data) => Ficha.fromDatabase(data));
  }

  // Lista fichas por gestion
  async findByGestion(gestion: number): Promise<Ficha[]> {
    const query = {
      name: "find-fichas-by-gestion",
      text: `
        SELECT
          fi.id_ficha,
          fi.codigo_productor,
          fi.gestion,
          fi.fecha_inspeccion,
          fi.inspector_interno,
          fi.persona_entrevistada,
          fi.categoria_gestion_anterior,
          fi.origen_captura,
          fi.fecha_sincronizacion,
          fi.estado_sync,
          fi.estado_ficha,
          fi.resultado_certificacion,
          fi.recomendaciones,
          fi.comentarios_evaluacion,
          fi.firma_productor,
          fi.firma_inspector,
          fi.created_by,
          fi.created_at,
          fi.updated_at,
          p.nombre_productor,
          c.nombre_comunidad
        FROM ficha_inspeccion fi
        INNER JOIN productores p ON fi.codigo_productor = p.codigo_productor
        INNER JOIN comunidades c ON p.id_comunidad = c.id_comunidad
        WHERE fi.gestion = $1
        ORDER BY p.codigo_productor
      `,
      values: [gestion],
    };

    const results = await ReadQuery.execute<FichaData>(query);
    return results.map((data) => Ficha.fromDatabase(data));
  }

  // Lista fichas por comunidad y gestion
  async findByComunidadGestion(
    comunidadId: string,
    gestion: number
  ): Promise<Ficha[]> {
    const query = {
      name: "find-fichas-by-comunidad-gestion",
      text: `
        SELECT
          fi.id_ficha,
          fi.codigo_productor,
          fi.gestion,
          fi.fecha_inspeccion,
          fi.inspector_interno,
          fi.persona_entrevistada,
          fi.categoria_gestion_anterior,
          fi.origen_captura,
          fi.fecha_sincronizacion,
          fi.estado_sync,
          fi.estado_ficha,
          fi.resultado_certificacion,
          fi.recomendaciones,
          fi.comentarios_evaluacion,
          fi.firma_productor,
          fi.firma_inspector,
          fi.created_by,
          fi.created_at,
          fi.updated_at,
          p.nombre_productor,
          c.nombre_comunidad
        FROM ficha_inspeccion fi
        INNER JOIN productores p ON fi.codigo_productor = p.codigo_productor
        INNER JOIN comunidades c ON p.id_comunidad = c.id_comunidad
        WHERE c.id_comunidad = $1 AND fi.gestion = $2
        ORDER BY p.codigo_productor
      `,
      values: [comunidadId, gestion],
    };

    const results = await ReadQuery.execute<FichaData>(query);
    return results.map((data) => Ficha.fromDatabase(data));
  }

  // Verifica si existe ficha para productor en gestion
  async existsByProductorGestion(
    codigoProductor: string,
    gestion: number
  ): Promise<boolean> {
    const query = {
      text: `
        SELECT EXISTS(
          SELECT 1
          FROM ficha_inspeccion
          WHERE codigo_productor = $1 AND gestion = $2
        ) as exists
      `,
      values: [codigoProductor, gestion],
    };

    const result = await ReadQuery.findOne<{ exists: boolean }>(query);
    return result?.exists ?? false;
  }

  // Lista fichas con paginacion y filtros dinamicos
  async findWithPagination(params: {
    gestion?: number;
    estado?: string;
    codigoProductor?: string;
    comunidadId?: string;
    estadoSync?: string;
    page: number;
    limit: number;
  }): Promise<{ fichas: Ficha[]; total: number }> {
    const { gestion, estado, codigoProductor, comunidadId, estadoSync, page, limit } = params;

    // Construir WHERE dinamico
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (gestion !== undefined) {
      conditions.push(`fi.gestion = $${paramIndex}`);
      values.push(gestion);
      paramIndex++;
    }

    if (estado) {
      conditions.push(`fi.estado_ficha = $${paramIndex}`);
      values.push(estado);
      paramIndex++;
    }

    if (codigoProductor) {
      conditions.push(`fi.codigo_productor = $${paramIndex}`);
      values.push(codigoProductor);
      paramIndex++;
    }

    if (comunidadId) {
      conditions.push(`c.id_comunidad = $${paramIndex}`);
      values.push(comunidadId);
      paramIndex++;
    }

    if (estadoSync) {
      conditions.push(`fi.estado_sync = $${paramIndex}`);
      values.push(estadoSync);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Calcular offset para paginacion
    const offset = (page - 1) * limit;

    // Query para contar total
    const countQuery = {
      text: `
        SELECT COUNT(*) as total
        FROM ficha_inspeccion fi
        INNER JOIN productores p ON fi.codigo_productor = p.codigo_productor
        INNER JOIN comunidades c ON p.id_comunidad = c.id_comunidad
        ${whereClause}
      `,
      values: values,
    };

    // Query para obtener fichas paginadas
    const dataQuery = {
      text: `
        SELECT
          fi.id_ficha,
          fi.codigo_productor,
          fi.gestion,
          fi.fecha_inspeccion,
          fi.inspector_interno,
          fi.persona_entrevistada,
          fi.categoria_gestion_anterior,
          fi.origen_captura,
          fi.fecha_sincronizacion,
          fi.estado_sync,
          fi.estado_ficha,
          fi.resultado_certificacion,
          fi.recomendaciones,
          fi.comentarios_evaluacion,
          fi.firma_productor,
          fi.firma_inspector,
          fi.created_by,
          fi.created_at,
          fi.updated_at,
          p.nombre_productor,
          c.nombre_comunidad
        FROM ficha_inspeccion fi
        INNER JOIN productores p ON fi.codigo_productor = p.codigo_productor
        INNER JOIN comunidades c ON p.id_comunidad = c.id_comunidad
        ${whereClause}
        ORDER BY fi.fecha_inspeccion DESC, fi.gestion DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `,
      values: [...values, limit, offset],
    };

    // Ejecutar ambas queries
    const [countResult, fichas] = await Promise.all([
      ReadQuery.findOne<{ total: string }>(countQuery),
      ReadQuery.execute<FichaData>(dataQuery),
    ]);

    const total = parseInt(countResult?.total || "0", 10);

    return {
      fichas: fichas.map((data) => Ficha.fromDatabase(data)),
      total,
    };
  }

  // Crea ficha completa con todas sus secciones en transaccion atomica
  async createFichaCompleta(fichaCompleta: {
    ficha: Ficha;
    revision_documentacion?: RevisionDocumentacion;
    acciones_correctivas?: AccionCorrectiva[];
    no_conformidades?: NoConformidad[];
    evaluacion_mitigacion?: EvaluacionMitigacion;
    evaluacion_poscosecha?: EvaluacionPoscosecha;
    evaluacion_conocimiento?: EvaluacionConocimientoNormas;
    actividades_pecuarias?: ActividadPecuaria[];
    detalles_cultivo?: DetalleCultivoParcela[];
    cosecha_ventas?: CosechaVentas[];
    archivos?: ArchivoFicha[];
  }): Promise<FichaCompleta> {
    const { ficha } = fichaCompleta;

    // Validar ficha
    const validation = ficha.validate();
    if (!validation.valid) {
      throw new Error(`Validacion fallo: ${validation.errors.join(", ")}`);
    }

    // Verificar duplicados
    const existe = await this.existsByProductorGestion(
      ficha.codigoProductor,
      ficha.gestion
    );

    if (existe) {
      throw new Error(
        `Ya existe una ficha para el productor ${ficha.codigoProductor} en la gestion ${ficha.gestion}`
      );
    }

    const transaction = new Transaction();

    try {
      await transaction.begin();

      // 1. Insertar ficha principal
      const fichaData = ficha.toDatabaseInsert();
      const fichaQuery = {
        text: `
          INSERT INTO ficha_inspeccion (
            codigo_productor,
            gestion,
            fecha_inspeccion,
            inspector_interno,
            persona_entrevistada,
            categoria_gestion_anterior,
            origen_captura,
            fecha_sincronizacion,
            estado_sync,
            estado_ficha,
            resultado_certificacion,
            recomendaciones,
            comentarios_evaluacion,
            firma_productor,
            firma_inspector,
            created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          RETURNING id_ficha, created_at, updated_at
        `,
        values: [
          fichaData.codigo_productor,
          fichaData.gestion,
          fichaData.fecha_inspeccion,
          fichaData.inspector_interno,
          fichaData.persona_entrevistada,
          fichaData.categoria_gestion_anterior,
          fichaData.origen_captura,
          fichaData.fecha_sincronizacion,
          fichaData.estado_sync,
          fichaData.estado_ficha,
          fichaData.resultado_certificacion,
          fichaData.recomendaciones,
          fichaData.comentarios_evaluacion,
          fichaData.firma_productor,
          fichaData.firma_inspector,
          fichaData.created_by,
        ],
      };

      const fichaResult = await transaction.query(fichaQuery);
      const idFicha = fichaResult.rows[0].id_ficha;

      // 2. Insertar revision documentacion si existe
      if (fichaCompleta.revision_documentacion) {
        const revData = fichaCompleta.revision_documentacion.toDatabaseInsert();
        await transaction.query({
          text: `
            INSERT INTO revision_documentacion (
              id_ficha,
              solicitud_ingreso,
              normas_reglamentos,
              contrato_produccion,
              croquis_unidad,
              diario_campo,
              registro_cosecha,
              recibo_pago,
              observaciones_documentacion
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `,
          values: [
            idFicha,
            revData.solicitud_ingreso,
            revData.normas_reglamentos,
            revData.contrato_produccion,
            revData.croquis_unidad,
            revData.diario_campo,
            revData.registro_cosecha,
            revData.recibo_pago,
            revData.observaciones_documentacion,
          ],
        });
      }

      // 3. Insertar acciones correctivas
      if (
        fichaCompleta.acciones_correctivas &&
        fichaCompleta.acciones_correctivas.length > 0
      ) {
        for (const accion of fichaCompleta.acciones_correctivas) {
          const acData = accion.toDatabaseInsert();
          await transaction.query({
            text: `
              INSERT INTO acciones_correctivas (
                id_ficha,
                numero_accion,
                descripcion_accion,
                implementacion_descripcion
              ) VALUES ($1, $2, $3, $4)
            `,
            values: [
              idFicha,
              acData.numero_accion,
              acData.descripcion_accion,
              acData.implementacion_descripcion,
            ],
          });
        }
      }

      // 4. Insertar no conformidades
      if (
        fichaCompleta.no_conformidades &&
        fichaCompleta.no_conformidades.length > 0
      ) {
        for (const noConf of fichaCompleta.no_conformidades) {
          const ncData = noConf.toDatabaseInsert();
          await transaction.query({
            text: `
              INSERT INTO no_conformidades (
                id_ficha,
                descripcion_no_conformidad,
                accion_correctiva_propuesta,
                fecha_limite_implementacion,
                estado_conformidad
              ) VALUES ($1, $2, $3, $4, $5)
            `,
            values: [
              idFicha,
              ncData.descripcion_no_conformidad,
              ncData.accion_correctiva_propuesta,
              ncData.fecha_limite_implementacion,
              ncData.estado_conformidad,
            ],
          });
        }
      }

      // 5. Insertar evaluacion mitigacion
      if (fichaCompleta.evaluacion_mitigacion) {
        const evalMitData =
          fichaCompleta.evaluacion_mitigacion.toDatabaseInsert();
        await transaction.query({
          text: `
            INSERT INTO evaluacion_mitigacion (
              id_ficha,
              practica_mitigacion_riesgos,
              mitigacion_contaminacion,
              deposito_herramientas,
              deposito_insumos_organicos,
              evita_quema_residuos,
              practica_mitigacion_riesgos_descripcion,
              mitigacion_contaminacion_descripcion
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `,
          values: [
            idFicha,
            evalMitData.practica_mitigacion_riesgos,
            evalMitData.mitigacion_contaminacion,
            evalMitData.deposito_herramientas,
            evalMitData.deposito_insumos_organicos,
            evalMitData.evita_quema_residuos,
            evalMitData.practica_mitigacion_riesgos_descripcion,
            evalMitData.mitigacion_contaminacion_descripcion,
          ],
        });
      }

      // 6. Insertar evaluacion poscosecha
      if (fichaCompleta.evaluacion_poscosecha) {
        const evalPosData =
          fichaCompleta.evaluacion_poscosecha.toDatabaseInsert();
        await transaction.query({
          text: `
            INSERT INTO evaluacion_poscosecha (
              id_ficha,
              secado_tendal,
              envases_limpios,
              almacen_protegido,
              evidencia_comercializacion,
              comentarios_poscosecha
            ) VALUES ($1, $2, $3, $4, $5, $6)
          `,
          values: [
            idFicha,
            evalPosData.secado_tendal,
            evalPosData.envases_limpios,
            evalPosData.almacen_protegido,
            evalPosData.evidencia_comercializacion,
            evalPosData.comentarios_poscosecha,
          ],
        });
      }

      // 7. Insertar evaluacion conocimiento normas
      if (fichaCompleta.evaluacion_conocimiento) {
        const evalConData =
          fichaCompleta.evaluacion_conocimiento.toDatabaseInsert();
        await transaction.query({
          text: `
            INSERT INTO evaluacion_conocimiento_normas (
              id_ficha,
              conoce_normas_organicas,
              recibio_capacitacion,
              comentarios_conocimiento
            ) VALUES ($1, $2, $3, $4)
          `,
          values: [
            idFicha,
            evalConData.conoce_normas_organicas,
            evalConData.recibio_capacitacion,
            evalConData.comentarios_conocimiento,
          ],
        });
      }

      // 8. Insertar actividades pecuarias
      if (
        fichaCompleta.actividades_pecuarias &&
        fichaCompleta.actividades_pecuarias.length > 0
      ) {
        for (const actividad of fichaCompleta.actividades_pecuarias) {
          const actData = actividad.toDatabaseInsert();
          await transaction.query({
            text: `
              INSERT INTO actividad_pecuaria (
                id_ficha,
                tipo_ganado,
                animal_especifico,
                cantidad,
                sistema_manejo,
                uso_guano
              ) VALUES ($1, $2, $3, $4, $5, $6)
            `,
            values: [
              idFicha,
              actData.tipo_ganado,
              actData.animal_especifico,
              actData.cantidad,
              actData.sistema_manejo,
              actData.uso_guano,
            ],
          });
        }
      }

      // 9. Insertar detalles cultivo por parcela
      if (
        fichaCompleta.detalles_cultivo &&
        fichaCompleta.detalles_cultivo.length > 0
      ) {
        for (const detalle of fichaCompleta.detalles_cultivo) {
          const detData = detalle.toDatabaseInsert();
          await transaction.query({
            text: `
              INSERT INTO detalle_cultivo_parcela (
                id_ficha,
                id_parcela,
                id_tipo_cultivo,
                superficie_ha,
                procedencia_semilla,
                categoria_semilla,
                tratamiento_semillas,
                tratamiento_semillas_otro,
                tipo_abonamiento,
                tipo_abonamiento_otro,
                metodo_aporque,
                metodo_aporque_otro,
                control_hierbas,
                control_hierbas_otro,
                metodo_cosecha,
                metodo_cosecha_otro,
                situacion_actual
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            `,
            values: [
              idFicha,
              detData.id_parcela,
              detData.id_tipo_cultivo,
              detData.superficie_ha,
              detData.procedencia_semilla,
              detData.categoria_semilla,
              detData.tratamiento_semillas,
              detData.tratamiento_semillas_otro,
              detData.tipo_abonamiento,
              detData.tipo_abonamiento_otro,
              detData.metodo_aporque,
              detData.metodo_aporque_otro,
              detData.control_hierbas,
              detData.control_hierbas_otro,
              detData.metodo_cosecha,
              detData.metodo_cosecha_otro,
              detData.situacion_actual,
            ],
          });
        }
      }

      // 10. Insertar cosecha y ventas
      if (
        fichaCompleta.cosecha_ventas &&
        fichaCompleta.cosecha_ventas.length > 0
      ) {
        for (const cosecha of fichaCompleta.cosecha_ventas) {
          const cosData = cosecha.toDatabaseInsert();
          await transaction.query({
            text: `
              INSERT INTO cosecha_ventas (
                id_ficha,
                id_tipo_cultivo,
                superficie_actual_ha,
                cosecha_estimada_qq,
                numero_parcelas,
                destino_consumo_qq,
                destino_semilla_qq,
                destino_ventas_qq,
                observaciones
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `,
            values: [
              idFicha,
              cosData.id_tipo_cultivo,
              cosData.superficie_actual_ha,
              cosData.cosecha_estimada_qq,
              cosData.numero_parcelas,
              cosData.destino_consumo_qq,
              cosData.destino_semilla_qq,
              cosData.destino_ventas_qq,
              cosData.observaciones,
            ],
          });
        }
      }

      // 11. Insertar archivos
      if (fichaCompleta.archivos && fichaCompleta.archivos.length > 0) {
        for (const archivo of fichaCompleta.archivos) {
          const arcData = archivo.toDatabaseInsert();
          await transaction.query({
            text: `
              INSERT INTO archivos_ficha (
                id_ficha,
                tipo_archivo,
                nombre_original,
                ruta_almacenamiento,
                tamaño_bytes,
                mime_type,
                estado_upload,
                hash_archivo,
                fecha_captura
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `,
            values: [
              idFicha,
              arcData.tipo_archivo,
              arcData.nombre_original,
              arcData.ruta_almacenamiento,
              arcData.tamaño_bytes,
              arcData.mime_type,
              arcData.estado_upload,
              arcData.hash_archivo,
              arcData.fecha_captura,
            ],
          });
        }
      }

      // Commit transaccion
      await transaction.commit();

      // Retornar ficha completa creada
      const fichaCreada = await this.findById(idFicha);
      if (!fichaCreada) {
        throw new Error("Ficha creada pero no se pudo recuperar");
      }

      // Cargar todas las secciones
      return await this.loadFichaCompleta(idFicha);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Carga ficha completa con todas sus secciones
  async loadFichaCompleta(idFicha: string): Promise<FichaCompleta> {
    const ficha = await this.findById(idFicha);
    if (!ficha) {
      throw new Error("Ficha no encontrada");
    }

    // Cargar todas las secciones
    const [
      revisionDoc,
      acciones,
      noConformidades,
      evaluacionMit,
      evaluacionPos,
      evaluacionCon,
      actividades,
      detallesCultivo,
      cosechaVentas,
      archivos,
    ] = await Promise.all([
      this.getRevisionDocumentacion(idFicha),
      this.getAccionesCorrectivas(idFicha),
      this.getNoConformidades(idFicha),
      this.getEvaluacionMitigacion(idFicha),
      this.getEvaluacionPoscosecha(idFicha),
      this.getEvaluacionConocimiento(idFicha),
      this.getActividadesPecuarias(idFicha),
      this.getDetallesCultivo(idFicha),
      this.getCosechaVentas(idFicha),
      this.getArchivos(idFicha),
    ]);

    return {
      ficha,
      revision_documentacion: revisionDoc ?? undefined,
      acciones_correctivas: acciones,
      no_conformidades: noConformidades,
      evaluacion_mitigacion: evaluacionMit ?? undefined,
      evaluacion_poscosecha: evaluacionPos ?? undefined,
      evaluacion_conocimiento: evaluacionCon ?? undefined,
      actividades_pecuarias: actividades,
      detalles_cultivo: detallesCultivo,
      cosecha_ventas: cosechaVentas,
      archivos: archivos,
    };
  }

  // Obtiene revision documentacion
  async getRevisionDocumentacion(
    idFicha: string
  ): Promise<RevisionDocumentacion | null> {
    const query = {
      text: `
        SELECT * FROM revision_documentacion
        WHERE id_ficha = $1
      `,
      values: [idFicha],
    };

    const result = await ReadQuery.findOne<RevisionDocumentacionData>(query);
    return result ? RevisionDocumentacion.fromDatabase(result) : null;
  }

  // Obtiene acciones correctivas
  async getAccionesCorrectivas(idFicha: string): Promise<AccionCorrectiva[]> {
    const query = {
      text: `
        SELECT * FROM acciones_correctivas
        WHERE id_ficha = $1
        ORDER BY numero_accion
      `,
      values: [idFicha],
    };

    const results = await ReadQuery.execute<AccionCorrectivaData>(query);
    return results.map((data) => AccionCorrectiva.fromDatabase(data));
  }

  // Obtiene no conformidades
  async getNoConformidades(idFicha: string): Promise<NoConformidad[]> {
    const query = {
      text: `
        SELECT * FROM no_conformidades
        WHERE id_ficha = $1
        ORDER BY created_at
      `,
      values: [idFicha],
    };

    const results = await ReadQuery.execute<NoConformidadData>(query);
    return results.map((data) => NoConformidad.fromDatabase(data));
  }

  // Obtiene evaluacion mitigacion
  async getEvaluacionMitigacion(
    idFicha: string
  ): Promise<EvaluacionMitigacion | null> {
    const query = {
      text: `
        SELECT * FROM evaluacion_mitigacion
        WHERE id_ficha = $1
      `,
      values: [idFicha],
    };

    const result = await ReadQuery.findOne<EvaluacionMitigacionData>(query);
    return result ? EvaluacionMitigacion.fromDatabase(result) : null;
  }

  // Obtiene evaluacion poscosecha
  async getEvaluacionPoscosecha(
    idFicha: string
  ): Promise<EvaluacionPoscosecha | null> {
    const query = {
      text: `
        SELECT * FROM evaluacion_poscosecha
        WHERE id_ficha = $1
      `,
      values: [idFicha],
    };

    const result = await ReadQuery.findOne<EvaluacionPoscosechaData>(query);
    return result ? EvaluacionPoscosecha.fromDatabase(result) : null;
  }

  // Obtiene evaluacion conocimiento normas
  async getEvaluacionConocimiento(
    idFicha: string
  ): Promise<EvaluacionConocimientoNormas | null> {
    const query = {
      text: `
        SELECT * FROM evaluacion_conocimiento_normas
        WHERE id_ficha = $1
      `,
      values: [idFicha],
    };

    const result = await ReadQuery.findOne<EvaluacionConocimientoNormasData>(
      query
    );
    return result ? EvaluacionConocimientoNormas.fromDatabase(result) : null;
  }

  // Obtiene actividades pecuarias
  async getActividadesPecuarias(idFicha: string): Promise<ActividadPecuaria[]> {
    const query = {
      text: `
        SELECT * FROM actividad_pecuaria
        WHERE id_ficha = $1
        ORDER BY created_at
      `,
      values: [idFicha],
    };

    const results = await ReadQuery.execute<ActividadPecuariaData>(query);
    return results.map((data) => ActividadPecuaria.fromDatabase(data));
  }

  // Obtiene detalles cultivo por parcela
  async getDetallesCultivo(idFicha: string): Promise<DetalleCultivoParcela[]> {
    const query = {
      text: `
        SELECT * FROM detalle_cultivo_parcela
        WHERE id_ficha = $1
        ORDER BY created_at
      `,
      values: [idFicha],
    };

    const results = await ReadQuery.execute<DetalleCultivoParcelaData>(query);
    return results.map((data) => DetalleCultivoParcela.fromDatabase(data));
  }

  // Obtiene cosecha y ventas
  async getCosechaVentas(idFicha: string): Promise<CosechaVentas[]> {
    const query = {
      text: `
        SELECT * FROM cosecha_ventas
        WHERE id_ficha = $1
        ORDER BY created_at
      `,
      values: [idFicha],
    };

    const results = await ReadQuery.execute<CosechaVentasData>(query);
    return results.map((data) => CosechaVentas.fromDatabase(data));
  }

  // Obtiene archivos
  async getArchivos(idFicha: string): Promise<ArchivoFicha[]> {
    const query = {
      text: `
        SELECT * FROM archivos_ficha
        WHERE id_ficha = $1
        ORDER BY created_at
      `,
      values: [idFicha],
    };

    const results = await ReadQuery.execute<ArchivoFichaData>(query);
    return results.map((data) => ArchivoFicha.fromDatabase(data));
  }

  // Actualiza solo la ficha principal
  async updateFicha(id: string, ficha: Ficha): Promise<Ficha> {
    const validation = ficha.validate();
    if (!validation.valid) {
      throw new Error(`Validacion fallo: ${validation.errors.join(", ")}`);
    }

    const updateData = ficha.toDatabaseUpdate();

    const query = {
      text: `
        UPDATE ficha_inspeccion
        SET
          fecha_inspeccion = $2,
          inspector_interno = $3,
          persona_entrevistada = $4,
          categoria_gestion_anterior = $5,
          origen_captura = $6,
          fecha_sincronizacion = $7,
          estado_sync = $8,
          estado_ficha = $9,
          resultado_certificacion = $10,
          recomendaciones = $11,
          comentarios_evaluacion = $12,
          firma_productor = $13,
          firma_inspector = $14,
          updated_at = $15
        WHERE id_ficha = $1
        RETURNING id_ficha
      `,
      values: [
        id,
        updateData.fecha_inspeccion,
        updateData.inspector_interno,
        updateData.persona_entrevistada,
        updateData.categoria_gestion_anterior,
        updateData.origen_captura,
        updateData.fecha_sincronizacion,
        updateData.estado_sync,
        updateData.estado_ficha,
        updateData.resultado_certificacion,
        updateData.recomendaciones,
        updateData.comentarios_evaluacion,
        updateData.firma_productor,
        updateData.firma_inspector,
        updateData.updated_at,
      ],
    };

    const result = await WriteQuery.execute(query);
    if (!result.success || result.affectedRows === 0) {
      throw new Error(result.error || "Ficha no encontrada");
    }

    const fichaActualizada = await this.findById(id);
    if (!fichaActualizada) {
      throw new Error("Ficha actualizada pero no se pudo recuperar");
    }

    return fichaActualizada;
  }

  // Elimina ficha (CASCADE elimina todas las secciones hijas)
  async softDelete(id: string): Promise<void> {
    const ficha = await this.findById(id);
    if (!ficha) {
      throw new Error("Ficha no encontrada");
    }

    const query = {
      text: `
        DELETE FROM ficha_inspeccion
        WHERE id_ficha = $1
      `,
      values: [id],
    };

    const result = await WriteQuery.execute(query);
    if (!result.success) {
      throw new Error(result.error || "Error al eliminar ficha");
    }

    if (result.affectedRows === 0) {
      throw new Error("Ficha no encontrada");
    }
  }

  // Cuenta fichas por estado
  async countByEstado(estado: string): Promise<number> {
    const query = {
      text: `
        SELECT COUNT(*) as count
        FROM ficha_inspeccion
        WHERE estado_ficha = $1
      `,
      values: [estado],
    };

    const result = await ReadQuery.findOne<{ count: string }>(query);
    return parseInt(result?.count || "0", 10);
  }

  // Cuenta fichas por gestion
  async countByGestion(gestion: number): Promise<number> {
    const query = {
      text: `
        SELECT COUNT(*) as count
        FROM ficha_inspeccion
        WHERE gestion = $1
      `,
      values: [gestion],
    };

    const result = await ReadQuery.findOne<{ count: string }>(query);
    return parseInt(result?.count || "0", 10);
  }
}
