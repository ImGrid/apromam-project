import { ReadQuery, WriteQuery } from "../config/connection.js";
import { NoConformidad, NoConformidadData } from "../entities/NoConformidad.js";
import logger from "../utils/logger.js";

// Interfaz para NC enriquecida con datos de ficha y productor
export interface NoConformidadEnriquecida extends NoConformidadData {
  codigo_productor?: string;
  nombre_productor?: string;
  nombre_comunidad?: string;
  gestion?: number;
  nombre_usuario_seguimiento?: string;
}

// Interfaz para estadisticas
export interface EstadisticasNC {
  total: number;
  por_estado: {
    pendiente: number;
    seguimiento: number;
    corregido: number;
  };
  vencidas: number;
  proximas_vencer: number;
}

// Repository para no conformidades
export class NoConformidadRepository {
  // Encuentra NC por ID
  async findById(id: string): Promise<NoConformidad | null> {
    const query = {
      name: "find-no-conformidad-by-id",
      text: `
        SELECT
          nc.id_no_conformidad,
          nc.id_ficha,
          nc.descripcion_no_conformidad,
          nc.accion_correctiva_propuesta,
          nc.fecha_limite_implementacion,
          nc.estado_seguimiento,
          nc.comentario_seguimiento,
          nc.fecha_seguimiento,
          nc.realizado_por_usuario,
          nc.updated_at,
          nc.created_at
        FROM no_conformidades nc
        WHERE nc.id_no_conformidad = $1
      `,
      values: [id],
    };

    const result = await ReadQuery.findOne<NoConformidadData>(query);
    return result ? NoConformidad.fromDatabase(result) : null;
  }

  // Encuentra NC por ID con datos enriquecidos (ficha, productor, comunidad)
  async findByIdEnriquecida(id: string): Promise<NoConformidadEnriquecida | null> {
    const query = {
      name: "find-no-conformidad-enriquecida-by-id",
      text: `
        SELECT
          nc.id_no_conformidad,
          nc.id_ficha,
          nc.descripcion_no_conformidad,
          nc.accion_correctiva_propuesta,
          nc.fecha_limite_implementacion,
          nc.estado_seguimiento,
          nc.comentario_seguimiento,
          nc.fecha_seguimiento,
          nc.realizado_por_usuario,
          nc.updated_at,
          nc.created_at,
          fi.codigo_productor,
          fi.gestion,
          p.nombre_productor,
          c.nombre_comunidad,
          u.nombre_completo as nombre_usuario_seguimiento
        FROM no_conformidades nc
        INNER JOIN ficha_inspeccion fi ON nc.id_ficha = fi.id_ficha
        INNER JOIN productores p ON fi.codigo_productor = p.codigo_productor
        INNER JOIN comunidades c ON p.id_comunidad = c.id_comunidad
        LEFT JOIN usuarios u ON nc.realizado_por_usuario = u.id_usuario
        WHERE nc.id_no_conformidad = $1
      `,
      values: [id],
    };

    return await ReadQuery.findOne<NoConformidadEnriquecida>(query);
  }

  // Lista todas las NC de una ficha
  async findByFicha(
    idFicha: string,
    estadoSeguimiento?: string
  ): Promise<NoConformidadEnriquecida[]> {
    let queryText = `
      SELECT
        nc.id_no_conformidad,
        nc.id_ficha,
        nc.descripcion_no_conformidad,
        nc.accion_correctiva_propuesta,
        nc.fecha_limite_implementacion,
        nc.estado_seguimiento,
        nc.comentario_seguimiento,
        nc.fecha_seguimiento,
        nc.realizado_por_usuario,
        nc.updated_at,
        nc.created_at,
        fi.codigo_productor,
        fi.gestion,
        p.nombre_productor,
        c.nombre_comunidad,
        u.nombre_completo as nombre_usuario_seguimiento
      FROM no_conformidades nc
      INNER JOIN ficha_inspeccion fi ON nc.id_ficha = fi.id_ficha
      INNER JOIN productores p ON fi.codigo_productor = p.codigo_productor
      INNER JOIN comunidades c ON p.id_comunidad = c.id_comunidad
      LEFT JOIN usuarios u ON nc.realizado_por_usuario = u.id_usuario
      WHERE nc.id_ficha = $1
    `;

    const values: unknown[] = [idFicha];

    if (estadoSeguimiento) {
      queryText += ` AND nc.estado_seguimiento = $2`;
      values.push(estadoSeguimiento);
    }

    queryText += ` ORDER BY nc.created_at DESC`;

    const query = {
      name: estadoSeguimiento
        ? "find-nc-by-ficha-and-estado"
        : "find-nc-by-ficha",
      text: queryText,
      values,
    };

    return await ReadQuery.execute<NoConformidadEnriquecida>(query);
  }

  // Lista todas las NC con filtros opcionales (para GET /api/no-conformidades)
  async findAll(filters?: {
    estadoSeguimiento?: string;
    idComunidad?: string;
    gestion?: number;
    codigoProductor?: string;
  }): Promise<NoConformidadEnriquecida[]> {
    let queryText = `
      SELECT
        nc.id_no_conformidad,
        nc.id_ficha,
        nc.descripcion_no_conformidad,
        nc.accion_correctiva_propuesta,
        nc.fecha_limite_implementacion,
        nc.estado_seguimiento,
        nc.comentario_seguimiento,
        nc.fecha_seguimiento,
        nc.realizado_por_usuario,
        nc.updated_at,
        nc.created_at,
        fi.codigo_productor,
        fi.gestion,
        p.nombre_productor,
        c.nombre_comunidad,
        u.nombre_completo as nombre_usuario_seguimiento
      FROM no_conformidades nc
      INNER JOIN ficha_inspeccion fi ON nc.id_ficha = fi.id_ficha
      INNER JOIN productores p ON fi.codigo_productor = p.codigo_productor
      INNER JOIN comunidades c ON p.id_comunidad = c.id_comunidad
      LEFT JOIN usuarios u ON nc.realizado_por_usuario = u.id_usuario
      WHERE 1=1
    `;

    const values: unknown[] = [];
    let paramIndex = 1;

    // Agregar filtros dinámicos
    if (filters?.estadoSeguimiento) {
      queryText += ` AND nc.estado_seguimiento = $${paramIndex++}`;
      values.push(filters.estadoSeguimiento);
    }

    if (filters?.idComunidad) {
      queryText += ` AND p.id_comunidad = $${paramIndex++}`;
      values.push(filters.idComunidad);
    }

    if (filters?.gestion) {
      queryText += ` AND fi.gestion = $${paramIndex++}`;
      values.push(filters.gestion);
    }

    if (filters?.codigoProductor) {
      queryText += ` AND fi.codigo_productor = $${paramIndex++}`;
      values.push(filters.codigoProductor);
    }

    queryText += ` ORDER BY nc.created_at DESC`;

    const query = {
      name: "find-all-nc",
      text: queryText,
      values,
    };

    return await ReadQuery.execute<NoConformidadEnriquecida>(query);
  }

  // Actualiza datos basicos de una NC
  async update(
    id: string,
    data: {
      descripcion_no_conformidad?: string;
      accion_correctiva_propuesta?: string;
      fecha_limite_implementacion?: Date;
    }
  ): Promise<NoConformidad | null> {
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.descripcion_no_conformidad !== undefined) {
      setClauses.push(`descripcion_no_conformidad = $${paramIndex++}`);
      values.push(data.descripcion_no_conformidad);
    }

    if (data.accion_correctiva_propuesta !== undefined) {
      setClauses.push(`accion_correctiva_propuesta = $${paramIndex++}`);
      values.push(data.accion_correctiva_propuesta);
    }

    if (data.fecha_limite_implementacion !== undefined) {
      setClauses.push(`fecha_limite_implementacion = $${paramIndex++}`);
      values.push(data.fecha_limite_implementacion);
    }

    if (setClauses.length === 0) {
      logger.warn({ id }, "No fields to update in NoConformidad");
      return await this.findById(id);
    }

    // El trigger se encarga de actualizar updated_at
    values.push(id);

    const query = {
      name: "update-no-conformidad",
      text: `
        UPDATE no_conformidades
        SET ${setClauses.join(", ")}
        WHERE id_no_conformidad = $${paramIndex}
        RETURNING *
      `,
      values,
    };

    const results = await ReadQuery.execute<NoConformidadData>(query);
    return results.length > 0 ? NoConformidad.fromDatabase(results[0]) : null;
  }

  // Actualiza seguimiento de NC
  async updateSeguimiento(
    id: string,
    estadoSeguimiento: string,
    comentarioSeguimiento: string | undefined,
    userId: string
  ): Promise<NoConformidad | null> {
    const query = {
      name: "update-seguimiento-nc",
      text: `
        UPDATE no_conformidades
        SET
          estado_seguimiento = $1,
          comentario_seguimiento = $2,
          fecha_seguimiento = CURRENT_TIMESTAMP,
          realizado_por_usuario = $3
        WHERE id_no_conformidad = $4
        RETURNING *
      `,
      values: [estadoSeguimiento, comentarioSeguimiento || null, userId, id],
    };

    const results = await ReadQuery.execute<NoConformidadData>(query);
    return results.length > 0 ? NoConformidad.fromDatabase(results[0]) : null;
  }

  // Obtiene estadisticas de NC
  async getEstadisticas(
    gestion?: number,
    idComunidad?: string
  ): Promise<EstadisticasNC> {
    let whereConditions = "";
    const values: unknown[] = [];
    let paramIndex = 1;

    if (gestion) {
      whereConditions += ` AND fi.gestion = $${paramIndex++}`;
      values.push(gestion);
    }

    if (idComunidad) {
      whereConditions += ` AND p.id_comunidad = $${paramIndex++}`;
      values.push(idComunidad);
    }

    const query = {
      name: gestion || idComunidad ? "estadisticas-nc-filtradas" : "estadisticas-nc",
      text: `
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE nc.estado_seguimiento = 'pendiente') as pendiente,
          COUNT(*) FILTER (WHERE nc.estado_seguimiento = 'seguimiento') as seguimiento,
          COUNT(*) FILTER (WHERE nc.estado_seguimiento = 'corregido') as corregido,
          COUNT(*) FILTER (
            WHERE nc.fecha_limite_implementacion < CURRENT_DATE
            AND nc.estado_seguimiento IN ('pendiente', 'seguimiento')
          ) as vencidas,
          COUNT(*) FILTER (
            WHERE nc.fecha_limite_implementacion BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
            AND nc.estado_seguimiento IN ('pendiente', 'seguimiento')
          ) as proximas_vencer
        FROM no_conformidades nc
        INNER JOIN ficha_inspeccion fi ON nc.id_ficha = fi.id_ficha
        INNER JOIN productores p ON fi.codigo_productor = p.codigo_productor
        WHERE 1=1 ${whereConditions}
      `,
      values,
    };

    const result = await ReadQuery.findOne<{
      total: string;
      pendiente: string;
      seguimiento: string;
      corregido: string;
      vencidas: string;
      proximas_vencer: string;
    }>(query);

    if (!result) {
      return {
        total: 0,
        por_estado: { pendiente: 0, seguimiento: 0, corregido: 0 },
        vencidas: 0,
        proximas_vencer: 0,
      };
    }

    return {
      total: parseInt(result.total, 10),
      por_estado: {
        pendiente: parseInt(result.pendiente, 10),
        seguimiento: parseInt(result.seguimiento, 10),
        corregido: parseInt(result.corregido, 10),
      },
      vencidas: parseInt(result.vencidas, 10),
      proximas_vencer: parseInt(result.proximas_vencer, 10),
    };
  }

  // Verifica si existe una NC
  async exists(id: string): Promise<boolean> {
    const query = {
      name: "nc-exists",
      text: `
        SELECT EXISTS(
          SELECT 1 FROM no_conformidades
          WHERE id_no_conformidad = $1
        ) as exists
      `,
      values: [id],
    };

    const result = await ReadQuery.findOne<{ exists: boolean }>(query);
    return result?.exists ?? false;
  }

  // Elimina una NC (archivos se eliminan por CASCADE)
  async delete(id: string): Promise<boolean> {
    const query = {
      name: "delete-no-conformidad",
      text: `
        DELETE FROM no_conformidades
        WHERE id_no_conformidad = $1
        RETURNING id_no_conformidad
      `,
      values: [id],
    };

    const result = await WriteQuery.execute(query);
    return result.success;
  }

  // Cuenta NC por ficha (util para validaciones)
  async countByFicha(idFicha: string, estadoSeguimiento?: string): Promise<number> {
    let queryText = `
      SELECT COUNT(*) as count
      FROM no_conformidades
      WHERE id_ficha = $1
    `;

    const values: unknown[] = [idFicha];

    if (estadoSeguimiento) {
      queryText += ` AND estado_seguimiento = $2`;
      values.push(estadoSeguimiento);
    }

    const query = {
      name: estadoSeguimiento ? "count-nc-by-ficha-estado" : "count-nc-by-ficha",
      text: queryText,
      values,
    };

    const result = await ReadQuery.findOne<{ count: string }>(query);
    return parseInt(result?.count ?? "0", 10);
  }
}
