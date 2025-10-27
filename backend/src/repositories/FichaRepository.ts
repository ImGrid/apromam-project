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
import {
  ManejoCultivoMani,
} from "../entities/ManejoCultivoMani.js";
import { CosechaVentas, CosechaVentasData } from "../entities/CosechaVentas.js";
import { ArchivoFicha, ArchivoFichaData } from "../entities/ArchivoFicha.js";
import { ComplianceStatus } from "../types/ficha.types.js";

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
          fi.comentarios_evaluacion,
          fi.comentarios_actividad_pecuaria,
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
          fi.comentarios_evaluacion,
          fi.comentarios_actividad_pecuaria,
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
          fi.comentarios_evaluacion,
          fi.comentarios_actividad_pecuaria,
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
          fi.comentarios_evaluacion,
          fi.comentarios_actividad_pecuaria,
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
          fi.comentarios_evaluacion,
          fi.comentarios_actividad_pecuaria,
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
          fi.comentarios_evaluacion,
          fi.comentarios_actividad_pecuaria,
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
    detalles_cultivo?: Array<{
      id_parcela: string;
      id_tipo_cultivo: string;
      superficie_ha: number;
      situacion_actual?: string;
      // Seccion 7 - Solo para cultivos certificables
      procedencia_semilla?: string;
      categoria_semilla?: string;
      tratamiento_semillas?: string;
      tratamiento_semillas_otro?: string;
      tipo_abonamiento?: string;
      tipo_abonamiento_otro?: string;
      metodo_aporque?: string;
      metodo_aporque_otro?: string;
      control_hierbas?: string;
      control_hierbas_otro?: string;
      metodo_cosecha?: string;
      metodo_cosecha_otro?: string;
    }>;
    cosecha_ventas?: CosechaVentas[];
    archivos?: ArchivoFicha[];
    parcelas_inspeccionadas?: Array<{
      id_parcela: string;
      rotacion?: boolean;
      utiliza_riego?: boolean;
      tipo_barrera?: string;
      insumos_organicos?: string;
      latitud_sud?: number;
      longitud_oeste?: number;
    }>;
  }): Promise<FichaCompleta> {
    const { ficha } = fichaCompleta;

    console.log(
      `[FichaRepository] Iniciando createFichaCompleta para productor ${ficha.codigoProductor} - gestión ${ficha.gestion}`
    );
    console.log(
      `[FichaRepository] Secciones recibidas: revision_doc=${!!fichaCompleta.revision_documentacion}, ` +
      `acciones=${fichaCompleta.acciones_correctivas?.length || 0}, ` +
      `no_conformidades=${fichaCompleta.no_conformidades?.length || 0}, ` +
      `detalles_cultivo=${fichaCompleta.detalles_cultivo?.length || 0}, ` +
      `cosecha_ventas=${fichaCompleta.cosecha_ventas?.length || 0}, ` +
      `parcelas_inspeccionadas=${fichaCompleta.parcelas_inspeccionadas?.length || 0}`
    );

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
            comentarios_actividad_pecuaria,
            comentarios_evaluacion,
            created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
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
          fichaData.comentarios_actividad_pecuaria,
          fichaData.comentarios_evaluacion,
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
              recibo_pago
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
                fecha_limite_implementacion
              ) VALUES ($1, $2, $3, $4)
            `,
            values: [
              idFicha,
              ncData.descripcion_no_conformidad,
              ncData.accion_correctiva_propuesta,
              ncData.fecha_limite_implementacion,
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
      // Ahora separado en dos tablas: detalle_cultivo_parcela (seccion 4) y manejo_cultivo_mani (seccion 7)
      if (
        fichaCompleta.detalles_cultivo &&
        fichaCompleta.detalles_cultivo.length > 0
      ) {
        console.log(
          `[FichaRepository] Procesando ${fichaCompleta.detalles_cultivo.length} detalles de cultivo`
        );

        for (const detalleData of fichaCompleta.detalles_cultivo) {
          // Verificar si el cultivo es certificable
          const tipoCultivoQuery = await transaction.query({
            text: `
              SELECT es_principal_certificable
              FROM tipos_cultivo
              WHERE id_tipo_cultivo = $1
            `,
            values: [detalleData.id_tipo_cultivo],
          });

          const esCertificable =
            tipoCultivoQuery.rows[0]?.es_principal_certificable || false;

          console.log(
            `[FichaRepository] Cultivo ${detalleData.id_tipo_cultivo} - Certificable: ${esCertificable}`
          );

          // SIEMPRE insertar en detalle_cultivo_parcela (seccion 4 - todos los cultivos)
          const detalleResult = await transaction.query({
            text: `
              INSERT INTO detalle_cultivo_parcela (
                id_ficha,
                id_parcela,
                id_tipo_cultivo,
                superficie_ha,
                situacion_actual
              ) VALUES ($1, $2, $3, $4, $5)
              RETURNING id_detalle
            `,
            values: [
              idFicha,
              detalleData.id_parcela,
              detalleData.id_tipo_cultivo,
              detalleData.superficie_ha,
              detalleData.situacion_actual?.trim() || null,
            ],
          });

          const idDetalle = detalleResult.rows[0].id_detalle;
          console.log(
            `[FichaRepository] Insertado detalle_cultivo_parcela con id ${idDetalle}`
          );

          // Solo insertar en manejo_cultivo_mani si es cultivo certificable Y tiene datos de seccion 7
          if (esCertificable && detalleData.procedencia_semilla) {
            console.log(
              `[FichaRepository] Insertando manejo_cultivo_mani para detalle ${idDetalle}`
            );

            // Crear entity para validar datos de seccion 7
            const manejoMani = ManejoCultivoMani.create({
              id_detalle: idDetalle,
              procedencia_semilla: detalleData.procedencia_semilla as any,
              categoria_semilla: detalleData.categoria_semilla as any,
              tratamiento_semillas: detalleData.tratamiento_semillas as any,
              tipo_abonamiento: detalleData.tipo_abonamiento as any,
              tipo_abonamiento_otro: detalleData.tipo_abonamiento_otro,
              metodo_aporque: detalleData.metodo_aporque as any,
              metodo_aporque_otro: detalleData.metodo_aporque_otro,
              control_hierbas: detalleData.control_hierbas as any,
              control_hierbas_otro: detalleData.control_hierbas_otro,
              metodo_cosecha: detalleData.metodo_cosecha as any,
              metodo_cosecha_otro: detalleData.metodo_cosecha_otro,
            });

            // Validar datos de manejo de cultivo
            const validacionManejo = manejoMani.validate();
            if (!validacionManejo.valid) {
              throw new Error(
                `Validacion de manejo cultivo fallo: ${validacionManejo.errors.join(", ")}`
              );
            }

            const manejoData = manejoMani.toDatabaseInsert();

            await transaction.query({
              text: `
                INSERT INTO manejo_cultivo_mani (
                  id_detalle,
                  procedencia_semilla,
                  categoria_semilla,
                  tratamiento_semillas,
                  tipo_abonamiento,
                  tipo_abonamiento_otro,
                  metodo_aporque,
                  metodo_aporque_otro,
                  control_hierbas,
                  control_hierbas_otro,
                  metodo_cosecha,
                  metodo_cosecha_otro
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
              `,
              values: [
                idDetalle,
                manejoData.procedencia_semilla,
                manejoData.categoria_semilla,
                manejoData.tratamiento_semillas,
                manejoData.tipo_abonamiento,
                manejoData.tipo_abonamiento_otro,
                manejoData.metodo_aporque,
                manejoData.metodo_aporque_otro,
                manejoData.control_hierbas,
                manejoData.control_hierbas_otro,
                manejoData.metodo_cosecha,
                manejoData.metodo_cosecha_otro,
              ],
            });

            console.log(
              `[FichaRepository] manejo_cultivo_mani insertado para detalle ${idDetalle}`
            );
          } else if (esCertificable && !detalleData.procedencia_semilla) {
            console.log(
              `[FichaRepository] Cultivo certificable pero sin datos de seccion 7 - solo se inserto en detalle_cultivo_parcela`
            );
          }
        }
      }

      // 10. Insertar cosecha y ventas
      // Validar que sea exactamente 1 registro (ecologico O transicion, no ambos)
      if (
        !fichaCompleta.cosecha_ventas ||
        fichaCompleta.cosecha_ventas.length !== 1
      ) {
        throw new Error(
          "Debe incluir exactamente 1 registro de cosecha (maní ecológico O maní en transición)"
        );
      }

      const tipoMani = fichaCompleta.cosecha_ventas[0].tipoMani;
      if (tipoMani !== "ecologico" && tipoMani !== "transicion") {
        throw new Error(
          "Tipo de maní debe ser 'ecologico' o 'transicion'"
        );
      }

      console.log(
        `[FichaRepository] Insertando cosecha_ventas: tipo=${tipoMani}`
      );

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
                tipo_mani,
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
              cosData.tipo_mani,
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

      // 12. Actualizar datos de inspeccion en parcelas
      // Los datos capturados en campo se actualizan en la tabla parcelas
      if (
        fichaCompleta.parcelas_inspeccionadas &&
        fichaCompleta.parcelas_inspeccionadas.length > 0
      ) {
        console.log(
          `[FichaRepository] Actualizando ${fichaCompleta.parcelas_inspeccionadas.length} parcelas con datos de inspección`
        );

        for (const parcelaData of fichaCompleta.parcelas_inspeccionadas) {
          console.log(
            `[FichaRepository] Actualizando parcela ${parcelaData.id_parcela}`
          );

          await transaction.query({
            text: `
              UPDATE parcelas
              SET
                rotacion = COALESCE($2, rotacion),
                utiliza_riego = COALESCE($3, utiliza_riego),
                tipo_barrera = COALESCE($4, tipo_barrera),
                insumos_organicos = COALESCE($5, insumos_organicos),
                latitud_sud = COALESCE($6, latitud_sud),
                longitud_oeste = COALESCE($7, longitud_oeste),
                coordenadas = CASE
                  WHEN $6 IS NOT NULL AND $7 IS NOT NULL
                  THEN ST_SetSRID(ST_MakePoint($7, $6), 4326)
                  ELSE coordenadas
                END
              WHERE id_parcela = $1 AND activo = true
            `,
            values: [
              parcelaData.id_parcela,
              parcelaData.rotacion,
              parcelaData.utiliza_riego,
              parcelaData.tipo_barrera,
              parcelaData.insumos_organicos,
              parcelaData.latitud_sud,
              parcelaData.longitud_oeste,
            ],
          });
        }
      }

      // Commit transaccion
      await transaction.commit();

      console.log(
        `[FichaRepository] Transacción completada exitosamente para ficha ${idFicha}`
      );

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

  // Obtiene detalles cultivo por parcela (con JOIN a manejo_cultivo_mani, tipos_cultivo y parcelas)
  async getDetallesCultivo(idFicha: string): Promise<DetalleCultivoParcela[]> {
    const query = {
      text: `
        SELECT
          dcp.*,
          tc.nombre_cultivo,
          p.numero_parcela,
          p.rotacion,
          p.utiliza_riego,
          p.tipo_barrera,
          p.insumos_organicos,
          p.latitud_sud,
          p.longitud_oeste,
          mcm.procedencia_semilla,
          mcm.categoria_semilla,
          mcm.tratamiento_semillas,
          mcm.tipo_abonamiento,
          mcm.tipo_abonamiento_otro,
          mcm.metodo_aporque,
          mcm.metodo_aporque_otro,
          mcm.control_hierbas,
          mcm.control_hierbas_otro,
          mcm.metodo_cosecha,
          mcm.metodo_cosecha_otro
        FROM detalle_cultivo_parcela dcp
        LEFT JOIN manejo_cultivo_mani mcm ON dcp.id_detalle = mcm.id_detalle
        LEFT JOIN tipos_cultivo tc ON dcp.id_tipo_cultivo = tc.id_tipo_cultivo
        LEFT JOIN parcelas p ON dcp.id_parcela = p.id_parcela
        WHERE dcp.id_ficha = $1
        ORDER BY p.numero_parcela, dcp.created_at
      `,
      values: [idFicha],
    };

    const results = await ReadQuery.execute<DetalleCultivoParcelaData>(query);

    // DEBUG: Ver qué datos está trayendo el query
    console.log('[FichaRepository] getDetallesCultivo - Resultados del query:', JSON.stringify(results.slice(0, 1), null, 2));

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

  // Actualiza ficha completa con todas sus secciones usando DELETE + INSERT
  async updateFichaCompleta(
    id: string,
    input: {
      ficha: {
        fecha_inspeccion: string;
        inspector_interno: string;
        persona_entrevistada?: string;
        categoria_gestion_anterior?: string;
        comentarios_actividad_pecuaria?: string;
      };
      revision_documentacion?: {
        solicitud_ingreso: ComplianceStatus;
        normas_reglamentos: ComplianceStatus;
        contrato_produccion: ComplianceStatus;
        croquis_unidad: ComplianceStatus;
        diario_campo: ComplianceStatus;
        registro_cosecha: ComplianceStatus;
        recibo_pago: ComplianceStatus;
      };
      acciones_correctivas?: Array<{
        numero_accion: number;
        descripcion_accion: string;
        implementacion_descripcion?: string;
      }>;
      no_conformidades?: Array<{
        descripcion_no_conformidad: string;
        accion_correctiva_propuesta: string;
        fecha_limite_implementacion: string;
      }>;
      evaluacion_mitigacion?: {
        practica_mitigacion_riesgos: boolean;
        mitigacion_contaminacion: boolean;
        deposito_herramientas: boolean;
        deposito_insumos_organicos: boolean;
        evita_quema_residuos: boolean;
        practica_mitigacion_riesgos_descripcion?: string;
        mitigacion_contaminacion_descripcion?: string;
      };
      evaluacion_poscosecha?: {
        secado_tendal: boolean;
        envases_limpios: boolean;
        almacen_protegido: boolean;
        evidencia_comercializacion: boolean;
        comentarios_poscosecha?: string;
      };
      evaluacion_conocimiento?: {
        conoce_normas_organicas: boolean;
        recibio_capacitacion: boolean;
        comentarios_conocimiento?: string;
      };
      actividades_pecuarias?: Array<{
        tipo_ganado: string;
        animal_especifico?: string;
        cantidad: number;
        sistema_manejo?: string;
        uso_guano?: string;
      }>;
      detalles_cultivo?: Array<{
        id_parcela: string;
        id_tipo_cultivo: string;
        superficie_ha: number;
        situacion_actual?: string;
        procedencia_semilla?: string;
        categoria_semilla?: string;
        tratamiento_semillas?: string;
        tratamiento_semillas_otro?: string;
        tipo_abonamiento?: string;
        tipo_abonamiento_otro?: string;
        metodo_aporque?: string;
        metodo_aporque_otro?: string;
        control_hierbas?: string;
        control_hierbas_otro?: string;
        metodo_cosecha?: string;
        metodo_cosecha_otro?: string;
      }>;
      cosecha_ventas?: Array<{
        tipo_mani: string;
        superficie_actual_ha: number;
        cosecha_estimada_qq: number;
        numero_parcelas: number;
        destino_consumo_qq?: number;
        destino_semilla_qq?: number;
        destino_ventas_qq?: number;
        observaciones?: string;
      }>;
      parcelas_inspeccionadas?: Array<{
        id_parcela: string;
        rotacion?: boolean;
        utiliza_riego?: boolean;
        tipo_barrera?: string;
        insumos_organicos?: string;
        latitud_sud?: number;
        longitud_oeste?: number;
      }>;
    }
  ): Promise<FichaCompleta> {
    console.log(
      `[FichaRepository] Iniciando updateFichaCompleta para ficha ${id}`
    );

    const transaction = new Transaction();

    try {
      await transaction.begin();

      // 1. UPDATE ficha principal
      const fichaUpdateQuery = {
        text: `
          UPDATE ficha_inspeccion
          SET
            fecha_inspeccion = $2,
            inspector_interno = $3,
            persona_entrevistada = $4,
            categoria_gestion_anterior = $5,
            comentarios_actividad_pecuaria = $6,
            updated_at = NOW()
          WHERE id_ficha = $1
          RETURNING id_ficha
        `,
        values: [
          id,
          new Date(input.ficha.fecha_inspeccion),
          input.ficha.inspector_interno.trim(),
          input.ficha.persona_entrevistada?.trim() || null,
          input.ficha.categoria_gestion_anterior || null,
          input.ficha.comentarios_actividad_pecuaria?.trim() || null,
        ],
      };

      const updateResult = await transaction.query(fichaUpdateQuery);
      if (updateResult.rows.length === 0) {
        throw new Error("Ficha no encontrada");
      }

      console.log(`[FichaRepository] Ficha principal actualizada`);

      // 2. DELETE todas las secciones relacionadas (CASCADE se encarga de manejo_cultivo_mani)
      console.log(`[FichaRepository] Eliminando secciones existentes...`);

      await transaction.query({
        text: `DELETE FROM revision_documentacion WHERE id_ficha = $1`,
        values: [id],
      });

      await transaction.query({
        text: `DELETE FROM acciones_correctivas WHERE id_ficha = $1`,
        values: [id],
      });

      await transaction.query({
        text: `DELETE FROM no_conformidades WHERE id_ficha = $1`,
        values: [id],
      });

      await transaction.query({
        text: `DELETE FROM evaluacion_mitigacion WHERE id_ficha = $1`,
        values: [id],
      });

      await transaction.query({
        text: `DELETE FROM evaluacion_poscosecha WHERE id_ficha = $1`,
        values: [id],
      });

      await transaction.query({
        text: `DELETE FROM evaluacion_conocimiento_normas WHERE id_ficha = $1`,
        values: [id],
      });

      await transaction.query({
        text: `DELETE FROM actividad_pecuaria WHERE id_ficha = $1`,
        values: [id],
      });

      await transaction.query({
        text: `DELETE FROM detalle_cultivo_parcela WHERE id_ficha = $1`,
        values: [id],
      });

      await transaction.query({
        text: `DELETE FROM cosecha_ventas WHERE id_ficha = $1`,
        values: [id],
      });

      console.log(`[FichaRepository] Secciones eliminadas exitosamente`);

      // 3. INSERT revision documentacion si existe
      if (input.revision_documentacion) {
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
              recibo_pago
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `,
          values: [
            id,
            input.revision_documentacion.solicitud_ingreso,
            input.revision_documentacion.normas_reglamentos,
            input.revision_documentacion.contrato_produccion,
            input.revision_documentacion.croquis_unidad,
            input.revision_documentacion.diario_campo,
            input.revision_documentacion.registro_cosecha,
            input.revision_documentacion.recibo_pago,
          ],
        });
      }

      // 4. INSERT acciones correctivas
      if (input.acciones_correctivas && input.acciones_correctivas.length > 0) {
        for (const accion of input.acciones_correctivas) {
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
              id,
              accion.numero_accion,
              accion.descripcion_accion.trim(),
              accion.implementacion_descripcion?.trim() || null,
            ],
          });
        }
      }

      // 5. INSERT no conformidades
      if (input.no_conformidades && input.no_conformidades.length > 0) {
        for (const noConf of input.no_conformidades) {
          await transaction.query({
            text: `
              INSERT INTO no_conformidades (
                id_ficha,
                descripcion_no_conformidad,
                accion_correctiva_propuesta,
                fecha_limite_implementacion
              ) VALUES ($1, $2, $3, $4)
            `,
            values: [
              id,
              noConf.descripcion_no_conformidad.trim(),
              noConf.accion_correctiva_propuesta.trim(),
              new Date(noConf.fecha_limite_implementacion),
            ],
          });
        }
      }

      // 6. INSERT evaluacion mitigacion
      if (input.evaluacion_mitigacion) {
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
            id,
            input.evaluacion_mitigacion.practica_mitigacion_riesgos,
            input.evaluacion_mitigacion.mitigacion_contaminacion,
            input.evaluacion_mitigacion.deposito_herramientas,
            input.evaluacion_mitigacion.deposito_insumos_organicos,
            input.evaluacion_mitigacion.evita_quema_residuos,
            input.evaluacion_mitigacion.practica_mitigacion_riesgos_descripcion?.trim() || null,
            input.evaluacion_mitigacion.mitigacion_contaminacion_descripcion?.trim() || null,
          ],
        });
      }

      // 7. INSERT evaluacion poscosecha
      if (input.evaluacion_poscosecha) {
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
            id,
            input.evaluacion_poscosecha.secado_tendal,
            input.evaluacion_poscosecha.envases_limpios,
            input.evaluacion_poscosecha.almacen_protegido,
            input.evaluacion_poscosecha.evidencia_comercializacion,
            input.evaluacion_poscosecha.comentarios_poscosecha?.trim() || null,
          ],
        });
      }

      // 8. INSERT evaluacion conocimiento normas
      if (input.evaluacion_conocimiento) {
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
            id,
            input.evaluacion_conocimiento.conoce_normas_organicas,
            input.evaluacion_conocimiento.recibio_capacitacion,
            input.evaluacion_conocimiento.comentarios_conocimiento?.trim() || null,
          ],
        });
      }

      // 9. INSERT actividades pecuarias
      if (input.actividades_pecuarias && input.actividades_pecuarias.length > 0) {
        for (const actividad of input.actividades_pecuarias) {
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
              id,
              actividad.tipo_ganado,
              actividad.animal_especifico?.trim() || null,
              actividad.cantidad,
              actividad.sistema_manejo?.trim() || null,
              actividad.uso_guano?.trim() || null,
            ],
          });
        }
      }

      // 10. INSERT detalles cultivo por parcela
      if (input.detalles_cultivo && input.detalles_cultivo.length > 0) {
        console.log(
          `[FichaRepository] Insertando ${input.detalles_cultivo.length} detalles de cultivo`
        );

        for (const detalleData of input.detalles_cultivo) {
          // Verificar si el cultivo es certificable
          const tipoCultivoQuery = await transaction.query({
            text: `
              SELECT es_principal_certificable
              FROM tipos_cultivo
              WHERE id_tipo_cultivo = $1
            `,
            values: [detalleData.id_tipo_cultivo],
          });

          const esCertificable =
            tipoCultivoQuery.rows[0]?.es_principal_certificable || false;

          console.log(
            `[FichaRepository] Cultivo ${detalleData.id_tipo_cultivo} - Certificable: ${esCertificable}`
          );

          // INSERT en detalle_cultivo_parcela (seccion 4)
          const detalleResult = await transaction.query({
            text: `
              INSERT INTO detalle_cultivo_parcela (
                id_ficha,
                id_parcela,
                id_tipo_cultivo,
                superficie_ha,
                situacion_actual
              ) VALUES ($1, $2, $3, $4, $5)
              RETURNING id_detalle
            `,
            values: [
              id,
              detalleData.id_parcela,
              detalleData.id_tipo_cultivo,
              detalleData.superficie_ha,
              detalleData.situacion_actual?.trim() || null,
            ],
          });

          const idDetalle = detalleResult.rows[0].id_detalle;

          // Solo INSERT en manejo_cultivo_mani si es cultivo certificable Y tiene datos de seccion 7
          if (esCertificable && detalleData.procedencia_semilla) {
            console.log(
              `[FichaRepository] Insertando manejo_cultivo_mani para detalle ${idDetalle}`
            );

            const manejoMani = ManejoCultivoMani.create({
              id_detalle: idDetalle,
              procedencia_semilla: detalleData.procedencia_semilla as any,
              categoria_semilla: detalleData.categoria_semilla as any,
              tratamiento_semillas: detalleData.tratamiento_semillas as any,
              tipo_abonamiento: detalleData.tipo_abonamiento as any,
              tipo_abonamiento_otro: detalleData.tipo_abonamiento_otro,
              metodo_aporque: detalleData.metodo_aporque as any,
              metodo_aporque_otro: detalleData.metodo_aporque_otro,
              control_hierbas: detalleData.control_hierbas as any,
              control_hierbas_otro: detalleData.control_hierbas_otro,
              metodo_cosecha: detalleData.metodo_cosecha as any,
              metodo_cosecha_otro: detalleData.metodo_cosecha_otro,
            });

            const validacionManejo = manejoMani.validate();
            if (!validacionManejo.valid) {
              throw new Error(
                `Validacion de manejo cultivo fallo: ${validacionManejo.errors.join(", ")}`
              );
            }

            const manejoData = manejoMani.toDatabaseInsert();

            await transaction.query({
              text: `
                INSERT INTO manejo_cultivo_mani (
                  id_detalle,
                  procedencia_semilla,
                  categoria_semilla,
                  tratamiento_semillas,
                  tipo_abonamiento,
                  tipo_abonamiento_otro,
                  metodo_aporque,
                  metodo_aporque_otro,
                  control_hierbas,
                  control_hierbas_otro,
                  metodo_cosecha,
                  metodo_cosecha_otro
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
              `,
              values: [
                idDetalle,
                manejoData.procedencia_semilla,
                manejoData.categoria_semilla,
                manejoData.tratamiento_semillas,
                manejoData.tipo_abonamiento,
                manejoData.tipo_abonamiento_otro,
                manejoData.metodo_aporque,
                manejoData.metodo_aporque_otro,
                manejoData.control_hierbas,
                manejoData.control_hierbas_otro,
                manejoData.metodo_cosecha,
                manejoData.metodo_cosecha_otro,
              ],
            });
          }
        }
      }

      // 11. INSERT cosecha y ventas
      if (!input.cosecha_ventas || input.cosecha_ventas.length !== 1) {
        throw new Error(
          "Debe incluir exactamente 1 registro de cosecha (maní ecológico O maní en transición)"
        );
      }

      const tipoMani = input.cosecha_ventas[0].tipo_mani;
      if (tipoMani !== "ecologico" && tipoMani !== "transicion") {
        throw new Error(
          "Tipo de maní debe ser 'ecologico' o 'transicion'"
        );
      }

      for (const cosecha of input.cosecha_ventas) {
        await transaction.query({
          text: `
            INSERT INTO cosecha_ventas (
              id_ficha,
              tipo_mani,
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
            id,
            cosecha.tipo_mani,
            cosecha.superficie_actual_ha,
            cosecha.cosecha_estimada_qq,
            cosecha.numero_parcelas,
            cosecha.destino_consumo_qq || null,
            cosecha.destino_semilla_qq || null,
            cosecha.destino_ventas_qq || null,
            cosecha.observaciones?.trim() || null,
          ],
        });
      }

      // 12. UPDATE parcelas con datos de inspeccion
      if (input.parcelas_inspeccionadas && input.parcelas_inspeccionadas.length > 0) {
        console.log(
          `[FichaRepository] Actualizando ${input.parcelas_inspeccionadas.length} parcelas con datos de inspección`
        );

        for (const parcelaData of input.parcelas_inspeccionadas) {
          await transaction.query({
            text: `
              UPDATE parcelas
              SET
                rotacion = COALESCE($2, rotacion),
                utiliza_riego = COALESCE($3, utiliza_riego),
                tipo_barrera = COALESCE($4, tipo_barrera),
                insumos_organicos = COALESCE($5, insumos_organicos),
                latitud_sud = COALESCE($6, latitud_sud),
                longitud_oeste = COALESCE($7, longitud_oeste),
                coordenadas = CASE
                  WHEN $6 IS NOT NULL AND $7 IS NOT NULL
                  THEN ST_SetSRID(ST_MakePoint($7, $6), 4326)
                  ELSE coordenadas
                END
              WHERE id_parcela = $1 AND activo = true
            `,
            values: [
              parcelaData.id_parcela,
              parcelaData.rotacion,
              parcelaData.utiliza_riego,
              parcelaData.tipo_barrera,
              parcelaData.insumos_organicos,
              parcelaData.latitud_sud,
              parcelaData.longitud_oeste,
            ],
          });
        }
      }

      // Commit transaccion
      await transaction.commit();

      console.log(
        `[FichaRepository] Transacción completada exitosamente para ficha ${id}`
      );

      // Retornar ficha completa actualizada
      return await this.loadFichaCompleta(id);
    } catch (error) {
      await transaction.rollback();
      console.error(`[FichaRepository] Error en updateFichaCompleta:`, error);
      throw error;
    }
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
          comentarios_actividad_pecuaria = $11,
          comentarios_evaluacion = $12,
          updated_at = $13
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
        updateData.comentarios_actividad_pecuaria,
        updateData.comentarios_evaluacion,
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
