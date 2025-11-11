import { randomUUID } from "crypto";
import { ReadQuery, WriteQuery } from "../config/connection.js";
import {
  PlanificacionSiembra,
  PlanificacionSiembraData,
} from "../entities/PlanificacionSiembra.js";
import { createAuthLogger } from "../utils/logger.js";

const logger = createAuthLogger();

export class PlanificacionSiembraRepository {
  // Encuentra planificación por ID
  async findById(id: string): Promise<PlanificacionSiembra | null> {
    const query = {
      name: "find-planificacion-by-id",
      text: `
        SELECT
          ps.id_planificacion,
          ps.id_ficha,
          ps.id_parcela,
          ps.area_parcela_planificada_ha,
          ps.mani_ha,
          ps.maiz_ha,
          ps.papa_ha,
          ps.aji_ha,
          ps.leguminosas_ha,
          ps.otros_cultivos_ha,
          ps.otros_cultivos_detalle,
          ps.descanso_ha,
          ps.created_at,
          ps.updated_at,
          pa.numero_parcela,
          pa.superficie_ha as superficie_actual_ha
        FROM planificacion_siembras ps
        INNER JOIN parcelas pa ON ps.id_parcela = pa.id_parcela
        WHERE ps.id_planificacion = $1
      `,
      values: [id],
    };

    const result = await ReadQuery.findOne<PlanificacionSiembraData>(query);
    return result ? PlanificacionSiembra.fromDatabase(result) : null;
  }

  // Lista planificaciones de una ficha
  async findByFicha(idFicha: string): Promise<PlanificacionSiembra[]> {
    const query = {
      name: "find-planificaciones-by-ficha",
      text: `
        SELECT
          ps.id_planificacion,
          ps.id_ficha,
          ps.id_parcela,
          ps.area_parcela_planificada_ha,
          ps.mani_ha,
          ps.maiz_ha,
          ps.papa_ha,
          ps.aji_ha,
          ps.leguminosas_ha,
          ps.otros_cultivos_ha,
          ps.otros_cultivos_detalle,
          ps.descanso_ha,
          ps.created_at,
          ps.updated_at,
          pa.numero_parcela,
          pa.superficie_ha as superficie_actual_ha
        FROM planificacion_siembras ps
        INNER JOIN parcelas pa ON ps.id_parcela = pa.id_parcela
        WHERE ps.id_ficha = $1
        ORDER BY pa.numero_parcela ASC
      `,
      values: [idFicha],
    };

    const results = await ReadQuery.execute<PlanificacionSiembraData>(query);
    return results.map((data) => PlanificacionSiembra.fromDatabase(data));
  }

  // Cuenta planificaciones de una ficha
  async countByFicha(idFicha: string): Promise<number> {
    const query = {
      name: "count-planificaciones-by-ficha",
      text: `
        SELECT COUNT(*)::int as count
        FROM planificacion_siembras
        WHERE id_ficha = $1
      `,
      values: [idFicha],
    };

    const result = await ReadQuery.findOne<{ count: number }>(query);
    return result ? result.count : 0;
  }

  // Crea una nueva planificación
  async create(
    planificacion: PlanificacionSiembra
  ): Promise<PlanificacionSiembra> {
    const id = randomUUID();
    const data = planificacion.toDatabaseInsert();

    const query = {
      name: "create-planificacion",
      text: `
        INSERT INTO planificacion_siembras (
          id_planificacion,
          id_ficha,
          id_parcela,
          area_parcela_planificada_ha,
          mani_ha,
          maiz_ha,
          papa_ha,
          aji_ha,
          leguminosas_ha,
          otros_cultivos_ha,
          otros_cultivos_detalle,
          descanso_ha
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id_planificacion
      `,
      values: [
        id,
        data.id_ficha,
        data.id_parcela,
        data.area_parcela_planificada_ha,
        data.mani_ha,
        data.maiz_ha,
        data.papa_ha,
        data.aji_ha,
        data.leguminosas_ha,
        data.otros_cultivos_ha,
        data.otros_cultivos_detalle || null,
        data.descanso_ha,
      ],
    };

    const result = await WriteQuery.execute(query);
    if (!result.success || result.affectedRows === 0) {
      throw new Error(result.error || "Error al crear planificación de siembra");
    }

    logger.info(
      { id_planificacion: id, id_ficha: data.id_ficha },
      "Planificación de siembra creada"
    );

    // Obtener la planificación creada con todos sus datos
    const created = await this.findById(id);
    if (!created) {
      throw new Error("Planificación creada pero no se pudo recuperar");
    }

    return created;
  }

  // Crea múltiples planificaciones (para una ficha)
  async createMany(
    planificaciones: PlanificacionSiembra[]
  ): Promise<PlanificacionSiembra[]> {
    if (planificaciones.length === 0) {
      return [];
    }

    const createdPlanificaciones: PlanificacionSiembra[] = [];

    for (const planificacion of planificaciones) {
      const created = await this.create(planificacion);
      createdPlanificaciones.push(created);
    }

    logger.info(
      { count: createdPlanificaciones.length },
      "Planificaciones de siembra creadas en lote"
    );

    return createdPlanificaciones;
  }

  // Actualiza una planificación
  async update(
    id: string,
    planificacion: PlanificacionSiembra
  ): Promise<PlanificacionSiembra> {
    const data = planificacion.toDatabaseUpdate();

    const query = {
      name: "update-planificacion",
      text: `
        UPDATE planificacion_siembras
        SET
          area_parcela_planificada_ha = $2,
          mani_ha = $3,
          maiz_ha = $4,
          papa_ha = $5,
          aji_ha = $6,
          leguminosas_ha = $7,
          otros_cultivos_ha = $8,
          otros_cultivos_detalle = $9,
          descanso_ha = $10,
          updated_at = CURRENT_TIMESTAMP
        WHERE id_planificacion = $1
      `,
      values: [
        id,
        data.area_parcela_planificada_ha,
        data.mani_ha,
        data.maiz_ha,
        data.papa_ha,
        data.aji_ha,
        data.leguminosas_ha,
        data.otros_cultivos_ha,
        data.otros_cultivos_detalle || null,
        data.descanso_ha,
      ],
    };

    const result = await WriteQuery.execute(query);
    if (!result.success || result.affectedRows === 0) {
      throw new Error(result.error || "Error al actualizar planificación de siembra");
    }

    logger.info({ id_planificacion: id }, "Planificación de siembra actualizada");

    // Obtener la planificación actualizada
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error("Planificación actualizada pero no se pudo recuperar");
    }

    return updated;
  }

  // Elimina una planificación
  async delete(id: string): Promise<void> {
    const query = {
      name: "delete-planificacion",
      text: `
        DELETE FROM planificacion_siembras
        WHERE id_planificacion = $1
      `,
      values: [id],
    };

    await WriteQuery.execute(query);

    logger.info({ id_planificacion: id }, "Planificación de siembra eliminada");
  }

  // Elimina todas las planificaciones de una ficha
  async deleteByFicha(idFicha: string): Promise<void> {
    const query = {
      name: "delete-planificaciones-by-ficha",
      text: `
        DELETE FROM planificacion_siembras
        WHERE id_ficha = $1
      `,
      values: [idFicha],
    };

    const result = await WriteQuery.execute(query);

    logger.info(
      { id_ficha: idFicha, deleted_count: result.affectedRows },
      "Planificaciones de siembra eliminadas por ficha"
    );
  }

  // Reemplaza todas las planificaciones de una ficha
  // Útil para update de ficha completa
  async replaceByFicha(
    idFicha: string,
    planificaciones: PlanificacionSiembra[]
  ): Promise<PlanificacionSiembra[]> {
    // Eliminar planificaciones existentes
    await this.deleteByFicha(idFicha);

    // Crear nuevas planificaciones
    const created = await this.createMany(planificaciones);

    logger.info(
      { id_ficha: idFicha, count: created.length },
      "Planificaciones de siembra reemplazadas"
    );

    return created;
  }

  // Verifica si existe planificación para una parcela en una ficha
  async existsByFichaAndParcela(
    idFicha: string,
    idParcela: string
  ): Promise<boolean> {
    const query = {
      name: "exists-planificacion-ficha-parcela",
      text: `
        SELECT EXISTS(
          SELECT 1
          FROM planificacion_siembras
          WHERE id_ficha = $1 AND id_parcela = $2
        ) as exists
      `,
      values: [idFicha, idParcela],
    };

    const result = await ReadQuery.findOne<{ exists: boolean }>(query);
    return result ? result.exists : false;
  }
}
