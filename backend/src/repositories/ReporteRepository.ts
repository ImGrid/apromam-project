import { ReadQuery } from "../config/connection.js";
import { createAuthLogger } from "../utils/logger.js";

const logger = createAuthLogger();

// Interface para datos del reporte
export interface ProductorReporteRow {
  // Datos basicos productor
  codigo_productor: string;
  nombre_productor: string;
  ci_documento: string | null;
  nombre_organizacion: string;
  nombre_comunidad: string;
  nombre_provincia: string;
  anio_ingreso_programa: number;
  categoria_actual: string;

  // Datos de parcela individual
  numero_parcela: number;
  superficie_ha: number;
  latitud_sud: number | null;
  longitud_oeste: number | null;

  // Total parcelas del productor
  total_parcelas: number;

  // Gestion pasada (2024 o actual-1)
  pasada_mani: number;
  pasada_maiz: number;
  pasada_papa: number;
  pasada_aji: number;
  pasada_leguminosa: number;
  pasada_otros: number;
  pasada_descanso: number;
  pasada_total: number;
  pasada_prod_real: number;

  // Gestion actual (2025)
  actual_mani: number;
  actual_maiz: number;
  actual_papa: number;
  actual_aji: number;
  actual_leguminosa: number;
  actual_otros: number;
  actual_descanso: number;
  actual_total: number;
  actual_prod_estim: number;
  actual_prod_real: number;

  // Gestion futura (2026 o actual+1)
  futura_mani: number;
  futura_maiz: number;
  futura_papa: number;
  futura_aji: number;
  futura_leguminosa: number;
  futura_otros: number;
  futura_descanso: number;
  futura_total: number;

  // Datos ficha de gestion actual
  fecha_inspeccion: Date | null;
  inspector_interno: string | null;

  // No conformidades y acciones
  no_conformidades: string | null;
  acciones_correctivas: string | null;
}

export class ReporteRepository {

  // Obtiene datos completos para el reporte
  // Retorna una fila por cada parcela de cada productor
  // Lee superficies de cultivos desde detalle_cultivo_parcela (por parcela) para gestiones pasada y actual
  // Lee planificación futura desde planificacion_siembras (Step 12 de ficha actual)
  // Lee producciones desde cultivos_gestion (por productor)
  async obtenerDatosReporte(
    gestionActual: number
  ): Promise<ProductorReporteRow[]> {

    const gestionPasada = gestionActual - 1;
    const gestionFutura = gestionActual + 1;

    logger.info(
      { gestionPasada, gestionActual, gestionFutura },
      "Obteniendo datos para reporte"
    );

    const query = {
      text: `
        SELECT
          -- Datos basicos productor
          p.codigo_productor,
          p.nombre_productor,
          p.ci_documento,
          o.nombre_organizacion,
          c.nombre_comunidad,
          prov.nombre_provincia,
          p."año_ingreso_programa" as anio_ingreso_programa,
          p.categoria_actual::text as categoria_actual,

          -- Datos parcela individual
          par.numero_parcela,
          COALESCE(par.superficie_ha, 0) as superficie_ha,
          par.latitud_sud,
          par.longitud_oeste,

          -- Total parcelas del productor
          p.numero_parcelas_total as total_parcelas,

          -- Gestion pasada - superficies por cultivo desde detalle_cultivo_parcela (por parcela)
          COALESCE(SUM(CASE
            WHEN tc_pasada.nombre_cultivo = 'Maní' AND fi_pasada.gestion = $1
            THEN dcp_pasada.superficie_ha
            ELSE 0
          END), 0)::numeric(10,4) as pasada_mani,

          COALESCE(SUM(CASE
            WHEN tc_pasada.nombre_cultivo = 'Maíz' AND fi_pasada.gestion = $1
            THEN dcp_pasada.superficie_ha
            ELSE 0
          END), 0)::numeric(10,4) as pasada_maiz,

          COALESCE(SUM(CASE
            WHEN tc_pasada.nombre_cultivo = 'Papa' AND fi_pasada.gestion = $1
            THEN dcp_pasada.superficie_ha
            ELSE 0
          END), 0)::numeric(10,4) as pasada_papa,

          COALESCE(SUM(CASE
            WHEN tc_pasada.nombre_cultivo = 'Ají' AND fi_pasada.gestion = $1
            THEN dcp_pasada.superficie_ha
            ELSE 0
          END), 0)::numeric(10,4) as pasada_aji,

          COALESCE(SUM(CASE
            WHEN tc_pasada.nombre_cultivo = 'Leguminosa' AND fi_pasada.gestion = $1
            THEN dcp_pasada.superficie_ha
            ELSE 0
          END), 0)::numeric(10,4) as pasada_leguminosa,

          COALESCE(SUM(CASE
            WHEN tc_pasada.nombre_cultivo = 'Otros cultivos' AND fi_pasada.gestion = $1
            THEN dcp_pasada.superficie_ha
            ELSE 0
          END), 0)::numeric(10,4) as pasada_otros,

          -- Superficie descanso = superficie_parcela - suma cultivos
          (COALESCE(par.superficie_ha, 0) - COALESCE(SUM(
            CASE WHEN fi_pasada.gestion = $1 THEN dcp_pasada.superficie_ha ELSE 0 END
          ), 0))::numeric(10,4) as pasada_descanso,

          -- Superficie total y produccion desde cultivos_gestion (por productor)
          COALESCE(cg_pasada.superficie_total, 0)::numeric(10,4) as pasada_total,
          COALESCE(cg_pasada.produccion_real_mani, 0)::numeric(10,2) as pasada_prod_real,

          -- Gestion actual - superficies por cultivo desde detalle_cultivo_parcela (por parcela)
          COALESCE(SUM(CASE
            WHEN tc_actual.nombre_cultivo = 'Maní' AND fi_actual.gestion = $2
            THEN dcp_actual.superficie_ha
            ELSE 0
          END), 0)::numeric(10,4) as actual_mani,

          COALESCE(SUM(CASE
            WHEN tc_actual.nombre_cultivo = 'Maíz' AND fi_actual.gestion = $2
            THEN dcp_actual.superficie_ha
            ELSE 0
          END), 0)::numeric(10,4) as actual_maiz,

          COALESCE(SUM(CASE
            WHEN tc_actual.nombre_cultivo = 'Papa' AND fi_actual.gestion = $2
            THEN dcp_actual.superficie_ha
            ELSE 0
          END), 0)::numeric(10,4) as actual_papa,

          COALESCE(SUM(CASE
            WHEN tc_actual.nombre_cultivo = 'Ají' AND fi_actual.gestion = $2
            THEN dcp_actual.superficie_ha
            ELSE 0
          END), 0)::numeric(10,4) as actual_aji,

          COALESCE(SUM(CASE
            WHEN tc_actual.nombre_cultivo = 'Leguminosa' AND fi_actual.gestion = $2
            THEN dcp_actual.superficie_ha
            ELSE 0
          END), 0)::numeric(10,4) as actual_leguminosa,

          COALESCE(SUM(CASE
            WHEN tc_actual.nombre_cultivo = 'Otros cultivos' AND fi_actual.gestion = $2
            THEN dcp_actual.superficie_ha
            ELSE 0
          END), 0)::numeric(10,4) as actual_otros,

          -- Superficie descanso = superficie_parcela - suma cultivos
          (COALESCE(par.superficie_ha, 0) - COALESCE(SUM(
            CASE WHEN fi_actual.gestion = $2 THEN dcp_actual.superficie_ha ELSE 0 END
          ), 0))::numeric(10,4) as actual_descanso,

          -- Superficie total y producciones desde cultivos_gestion (por productor)
          COALESCE(cg_actual.superficie_total, 0)::numeric(10,4) as actual_total,
          COALESCE(cg_actual.produccion_estimada_mani, 0)::numeric(10,2) as actual_prod_estim,
          COALESCE(cg_actual.produccion_real_mani, 0)::numeric(10,2) as actual_prod_real,

          -- Gestion futura - PLANIFICACION desde planificacion_siembras de ficha ACTUAL
          -- La planificación PARA la gestión futura está EN la ficha DE la gestión actual
          COALESCE(ps_actual.mani_ha, 0)::numeric(10,4) as futura_mani,
          COALESCE(ps_actual.maiz_ha, 0)::numeric(10,4) as futura_maiz,
          COALESCE(ps_actual.papa_ha, 0)::numeric(10,4) as futura_papa,
          COALESCE(ps_actual.aji_ha, 0)::numeric(10,4) as futura_aji,
          COALESCE(ps_actual.leguminosas_ha, 0)::numeric(10,4) as futura_leguminosa,
          COALESCE(ps_actual.otros_cultivos_ha, 0)::numeric(10,4) as futura_otros,
          COALESCE(ps_actual.descanso_ha, 0)::numeric(10,4) as futura_descanso,
          COALESCE(ps_actual.area_parcela_planificada_ha, 0)::numeric(10,4) as futura_total,

          -- Datos ficha de gestion actual
          fi_actual.fecha_inspeccion,
          fi_actual.inspector_interno,

          -- No conformidades (concatenadas)
          (
            SELECT string_agg(nc.descripcion_no_conformidad, '; ')
            FROM no_conformidades nc
            WHERE nc.id_ficha = fi_actual.id_ficha
          ) as no_conformidades,

          -- Acciones correctivas (concatenadas desde no_conformidades)
          (
            SELECT string_agg(nc.accion_correctiva_propuesta, '; ')
            FROM no_conformidades nc
            WHERE nc.id_ficha = fi_actual.id_ficha
              AND nc.accion_correctiva_propuesta IS NOT NULL
          ) as acciones_correctivas

        FROM productores p

        -- JOIN a organizacion, comunidad, provincia
        INNER JOIN organizaciones o ON p.id_organizacion = o.id_organizacion
        INNER JOIN comunidades c ON p.id_comunidad = c.id_comunidad
        INNER JOIN municipios m ON c.id_municipio = m.id_municipio
        INNER JOIN provincias prov ON m.id_provincia = prov.id_provincia

        -- LEFT JOIN a parcelas (puede no tener parcelas)
        LEFT JOIN parcelas par ON p.codigo_productor = par.codigo_productor
          AND par.activo = true

        -- LEFT JOIN a fichas aprobadas para las 3 gestiones
        LEFT JOIN ficha_inspeccion fi_pasada
          ON p.codigo_productor = fi_pasada.codigo_productor
          AND fi_pasada.gestion = $1
          AND fi_pasada.estado_ficha = 'aprobado'

        LEFT JOIN ficha_inspeccion fi_actual
          ON p.codigo_productor = fi_actual.codigo_productor
          AND fi_actual.gestion = $2
          AND fi_actual.estado_ficha = 'aprobado'

        -- LEFT JOIN a detalle_cultivo_parcela para las 2 gestiones (pasada y actual)
        LEFT JOIN detalle_cultivo_parcela dcp_pasada
          ON fi_pasada.id_ficha = dcp_pasada.id_ficha
          AND par.id_parcela = dcp_pasada.id_parcela
        LEFT JOIN tipos_cultivo tc_pasada
          ON dcp_pasada.id_tipo_cultivo = tc_pasada.id_tipo_cultivo

        LEFT JOIN detalle_cultivo_parcela dcp_actual
          ON fi_actual.id_ficha = dcp_actual.id_ficha
          AND par.id_parcela = dcp_actual.id_parcela
        LEFT JOIN tipos_cultivo tc_actual
          ON dcp_actual.id_tipo_cultivo = tc_actual.id_tipo_cultivo

        -- LEFT JOIN a cultivos_gestion para superficie_total y producciones (por productor)
        LEFT JOIN cultivos_gestion cg_pasada
          ON p.codigo_productor = cg_pasada.codigo_productor
          AND cg_pasada.gestion = $1

        LEFT JOIN cultivos_gestion cg_actual
          ON p.codigo_productor = cg_actual.codigo_productor
          AND cg_actual.gestion = $2

        -- LEFT JOIN a planificacion_siembras de la ficha ACTUAL (contiene planificación para gestión futura)
        LEFT JOIN planificacion_siembras ps_actual
          ON fi_actual.id_ficha = ps_actual.id_ficha
          AND par.id_parcela = ps_actual.id_parcela

        WHERE p.activo = true

        GROUP BY
          p.codigo_productor,
          p.nombre_productor,
          p.ci_documento,
          p.numero_parcelas_total,
          p."año_ingreso_programa",
          p.categoria_actual,
          o.nombre_organizacion,
          c.nombre_comunidad,
          prov.nombre_provincia,
          par.id_parcela,
          par.numero_parcela,
          par.superficie_ha,
          par.latitud_sud,
          par.longitud_oeste,
          cg_pasada.superficie_total,
          cg_pasada.produccion_real_mani,
          cg_actual.superficie_total,
          cg_actual.produccion_estimada_mani,
          cg_actual.produccion_real_mani,
          ps_actual.mani_ha,
          ps_actual.maiz_ha,
          ps_actual.papa_ha,
          ps_actual.aji_ha,
          ps_actual.leguminosas_ha,
          ps_actual.otros_cultivos_ha,
          ps_actual.descanso_ha,
          ps_actual.area_parcela_planificada_ha,
          fi_actual.id_ficha,
          fi_actual.fecha_inspeccion,
          fi_actual.inspector_interno

        ORDER BY
          c.nombre_comunidad ASC,
          p.codigo_productor ASC,
          par.numero_parcela ASC NULLS FIRST
      `,
      values: [gestionPasada, gestionActual],
    };

    const result = await ReadQuery.execute<ProductorReporteRow>(query);

    logger.info(
      { total_filas: result.length },
      "Datos obtenidos para reporte"
    );

    return result;
  }

  // Obtiene la gestion activa del sistema
  async obtenerGestionActiva(): Promise<number> {
    const query = {
      text: `
        SELECT anio_gestion
        FROM gestiones
        WHERE activo_sistema = true
        LIMIT 1
      `,
    };

    const result = await ReadQuery.findOne<{ anio_gestion: number }>(query);

    if (!result) {
      throw new Error("No hay gestión activa en el sistema");
    }

    return result.anio_gestion;
  }

  // Obtiene el nombre del cultivo certificable
  async obtenerCultivoCertificable(): Promise<string> {
    const query = {
      text: `
        SELECT nombre_cultivo
        FROM tipos_cultivo
        WHERE es_principal_certificable = true
          AND activo = true
        LIMIT 1
      `,
    };

    const result = await ReadQuery.findOne<{ nombre_cultivo: string }>(query);

    if (!result) {
      logger.warn("No hay cultivo certificable configurado, usando 'Maní' por defecto");
      return "Maní";
    }

    return result.nombre_cultivo;
  }
}
