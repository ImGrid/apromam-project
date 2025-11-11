import { randomUUID } from "crypto";
import { ReadQuery, WriteQuery } from "../config/connection.js";
import { createAuthLogger } from "../utils/logger.js";

const logger = createAuthLogger();

// Repository para la tabla cultivos_gestion
// Esta tabla almacena datos agregados de cultivos por productor y gestion
// Se llena automaticamente cuando se aprueba una ficha
export class CultivosGestionRepository {

  // Sincroniza datos de una ficha aprobada a cultivos_gestion
  // Agrega superficie total, producciones y cultivo principal
  // Usa ON CONFLICT para actualizar si ya existe (permite re-sincronizacion)
  async sincronizarDesdeFicha(idFicha: string): Promise<void> {
    logger.info({ id_ficha: idFicha }, "Sincronizando cultivos_gestion desde ficha");

    const idCultivoGestion = randomUUID();

    const query = {
      name: "sincronizar-cultivos-gestion",
      text: `
        INSERT INTO cultivos_gestion (
          id_cultivo_gestion,
          codigo_productor,
          gestion,
          superficie_total,
          produccion_estimada_mani,
          produccion_real_mani,
          cultivo_principal
        )
        SELECT
          $2,
          fi.codigo_productor,
          fi.gestion,

          -- Superficie total del productor
          COALESCE(SUM(dcp.superficie_ha), 0) as superficie_total,

          -- Producciones (usando subconsulta para evitar duplicacion por cross join)
          (
            SELECT COALESCE(SUM(cv_sub.cosecha_estimada_qq), 0)
            FROM cosecha_ventas cv_sub
            WHERE cv_sub.id_ficha = fi.id_ficha
          ) as produccion_estimada_mani,
          (
            SELECT COALESCE(SUM(cv_sub.produccion_real_mani), 0)
            FROM cosecha_ventas cv_sub
            WHERE cv_sub.id_ficha = fi.id_ficha
          ) as produccion_real_mani,

          -- Cultivo principal (el de mayor superficie)
          -- Usar CAST para convertir a tipo enum cultivo_principal
          CAST(
            COALESCE(
              (
                SELECT
                  CASE tc2.nombre_cultivo
                    WHEN 'Maní' THEN 'mani'
                    WHEN 'Maíz' THEN 'maiz'
                    WHEN 'Papa' THEN 'papa'
                    WHEN 'Ají' THEN 'aji'
                    WHEN 'Leguminosa' THEN 'leguminosa'
                    WHEN 'Otros cultivos' THEN 'otros'
                    ELSE 'otros'
                  END
                FROM detalle_cultivo_parcela dcp2
                INNER JOIN tipos_cultivo tc2 ON dcp2.id_tipo_cultivo = tc2.id_tipo_cultivo
                WHERE dcp2.id_ficha = fi.id_ficha
                GROUP BY tc2.nombre_cultivo
                ORDER BY SUM(dcp2.superficie_ha) DESC
                LIMIT 1
              ),
              'mani'  -- Default si no hay cultivos
            ) AS cultivo_principal
          )

        FROM ficha_inspeccion fi
        LEFT JOIN detalle_cultivo_parcela dcp ON fi.id_ficha = dcp.id_ficha

        WHERE fi.id_ficha = $1
          AND fi.estado_ficha = 'aprobado'  -- Solo fichas aprobadas

        GROUP BY fi.codigo_productor, fi.gestion, fi.id_ficha

        ON CONFLICT (codigo_productor, gestion)
        DO UPDATE SET
          superficie_total = EXCLUDED.superficie_total,
          produccion_estimada_mani = EXCLUDED.produccion_estimada_mani,
          produccion_real_mani = EXCLUDED.produccion_real_mani,
          cultivo_principal = EXCLUDED.cultivo_principal,
          updated_at = CURRENT_TIMESTAMP
      `,
      values: [idFicha, idCultivoGestion],
    };

    await WriteQuery.execute(query);

    logger.info(
      { id_ficha: idFicha },
      "Cultivos_gestion sincronizado exitosamente"
    );
  }

  // Elimina registro de cultivos_gestion por codigo_productor y gestion
  // Usado en caso de rollback o eliminacion de ficha
  async deleteByCodProduGestion(
    codigoProductor: string,
    gestion: number
  ): Promise<void> {
    const query = {
      name: "delete-cultivos-gestion-by-cod-prod-gest",
      text: `
        DELETE FROM cultivos_gestion
        WHERE codigo_productor = $1 AND gestion = $2
      `,
      values: [codigoProductor, gestion],
    };

    await WriteQuery.execute(query);

    logger.info(
      { codigo_productor: codigoProductor, gestion },
      "Registro eliminado de cultivos_gestion"
    );
  }

  // Verifica si existe registro para un productor en una gestion
  async exists(codigoProductor: string, gestion: number): Promise<boolean> {
    const query = {
      text: `
        SELECT EXISTS(
          SELECT 1
          FROM cultivos_gestion
          WHERE codigo_productor = $1 AND gestion = $2
        ) as exists
      `,
      values: [codigoProductor, gestion],
    };

    const result = await ReadQuery.findOne<{ exists: boolean }>(query);
    return result?.exists ?? false;
  }
}
