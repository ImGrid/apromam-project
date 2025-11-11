import { randomUUID } from "crypto";
import { ReadQuery, WriteQuery } from "../config/connection.js";
import { Comunidad, ComunidadData } from "../entities/Comunidad.js";

export class ComunidadRepository {
  // Encuentra comunidad por ID con datos enriquecidos
  // JOIN con municipios y provincias para jerarquia completa
  // Retorna comunidades activas e inactivas
  // Usa LEFT JOIN para optimizar las consultas de conteo
  async findById(id: string): Promise<Comunidad | null> {
    const query = {
      name: "find-comunidad-by-id",
      text: `
        SELECT
          c.id_comunidad,
          c.id_municipio,
          c.nombre_comunidad,
          c.abreviatura_comunidad,
          c.activo,
          c.created_at,
          m.nombre_municipio,
          p.nombre_provincia,
          COALESCE(tecn.cantidad, 0) as cantidad_tecnicos,
          COALESCE(prod.cantidad, 0) as cantidad_productores
        FROM comunidades c
        INNER JOIN municipios m ON c.id_municipio = m.id_municipio
        INNER JOIN provincias p ON m.id_provincia = p.id_provincia
        LEFT JOIN (
          SELECT u.id_comunidad, COUNT(*) as cantidad
          FROM usuarios u
          INNER JOIN roles r ON u.id_rol = r.id_rol
          WHERE LOWER(r.nombre_rol) = 'tecnico' AND u.activo = true
          GROUP BY u.id_comunidad
        ) tecn ON c.id_comunidad = tecn.id_comunidad
        LEFT JOIN (
          SELECT id_comunidad, COUNT(*) as cantidad
          FROM productores
          WHERE activo = true
          GROUP BY id_comunidad
        ) prod ON c.id_comunidad = prod.id_comunidad
        WHERE c.id_comunidad = $1
      `,
      values: [id],
    };

    const result = await ReadQuery.findOne<ComunidadData>(query);
    return result ? Comunidad.fromDatabase(result) : null;
  }

  // Lista comunidades por municipio
  // Ordenadas alfabeticamente
  async findByMunicipio(municipioId: string): Promise<Comunidad[]> {
    const query = {
      name: "find-comunidades-by-municipio",
      text: `
        SELECT 
          c.id_comunidad,
          c.id_municipio,
          c.nombre_comunidad,
          c.abreviatura_comunidad,
          c.activo,
          c.created_at,
          m.nombre_municipio,
          p.nombre_provincia
        FROM comunidades c
        INNER JOIN municipios m ON c.id_municipio = m.id_municipio
        INNER JOIN provincias p ON m.id_provincia = p.id_provincia
        WHERE c.id_municipio = $1 AND c.activo = true
        ORDER BY c.nombre_comunidad ASC
      `,
      values: [municipioId],
    };

    const results = await ReadQuery.execute<ComunidadData>(query);
    return results.map((data) => Comunidad.fromDatabase(data));
  }

  // Lista todas las comunidades activas
  // Sin contadores para mejor performance en listas
  async findAll(): Promise<Comunidad[]> {
    const query = {
      name: "find-all-comunidades-activas",
      text: `
        SELECT
          c.id_comunidad,
          c.id_municipio,
          c.nombre_comunidad,
          c.abreviatura_comunidad,
          c.activo,
          c.created_at,
          m.nombre_municipio,
          p.nombre_provincia
        FROM comunidades c
        INNER JOIN municipios m ON c.id_municipio = m.id_municipio
        INNER JOIN provincias p ON m.id_provincia = p.id_provincia
        WHERE c.activo = true
        ORDER BY p.nombre_provincia, m.nombre_municipio, c.nombre_comunidad
      `,
      values: [],
    };

    const results = await ReadQuery.execute<ComunidadData>(query);
    return results.map((data) => Comunidad.fromDatabase(data));
  }

  // Busca comunidad por nombre (case-insensitive)
  // Util para validar duplicados
  async findByNombre(
    nombre: string,
    municipioId: string
  ): Promise<Comunidad | null> {
    const query = {
      text: `
        SELECT 
          c.id_comunidad,
          c.id_municipio,
          c.nombre_comunidad,
          c.abreviatura_comunidad,
          c.activo,
          c.created_at,
          m.nombre_municipio
        FROM comunidades c
        INNER JOIN municipios m ON c.id_municipio = m.id_municipio
        WHERE LOWER(c.nombre_comunidad) = LOWER($1) 
          AND c.id_municipio = $2
          AND c.activo = true
      `,
      values: [nombre, municipioId],
    };

    const result = await ReadQuery.findOne<ComunidadData>(query);
    return result ? Comunidad.fromDatabase(result) : null;
  }

  // Verifica si existe comunidad con el nombre en el municipio
  // Para evitar duplicados
  async existsByNombreInMunicipio(
    nombre: string,
    municipioId: string
  ): Promise<boolean> {
    const query = {
      text: `
        SELECT EXISTS(
          SELECT 1 
          FROM comunidades
          WHERE LOWER(nombre_comunidad) = LOWER($1) 
            AND id_municipio = $2
        ) as exists
      `,
      values: [nombre, municipioId],
    };

    const result = await ReadQuery.findOne<{ exists: boolean }>(query);
    return result?.exists ?? false;
  }

  // Verifica si existe comunidad con la abreviatura en el municipio
  // Para evitar duplicados de abreviatura
  async existsByAbreviaturaInMunicipio(
    abreviatura: string,
    municipioId: string
  ): Promise<boolean> {
    const query = {
      text: `
        SELECT EXISTS(
          SELECT 1 
          FROM comunidades
          WHERE UPPER(abreviatura_comunidad) = UPPER($1)
            AND id_municipio = $2
            AND activo = true
        ) as exists
      `,
      values: [abreviatura, municipioId],
    };

    const result = await ReadQuery.findOne<{ exists: boolean }>(query);
    return result?.exists ?? false;
  }

  // Crea una nueva comunidad
  // Retorna comunidad creada con datos enriquecidos
  async create(comunidad: Comunidad): Promise<Comunidad> {
    const validation = comunidad.validate();
    if (!validation.valid) {
      throw new Error(`Validacion fallo: ${validation.errors.join(", ")}`);
    }

    // Verificar duplicados por nombre en mismo municipio
    const existeNombre = await this.existsByNombreInMunicipio(
      comunidad.nombre,
      comunidad.idMunicipio
    );

    if (existeNombre) {
      throw new Error(
        `Ya existe una comunidad "${comunidad.nombre}" en este municipio`
      );
    }

    // Verificar duplicados por abreviatura en mismo municipio
    const existeAbreviatura = await this.existsByAbreviaturaInMunicipio(
      comunidad.abreviatura,
      comunidad.idMunicipio
    );

    if (existeAbreviatura) {
      throw new Error(
        `Ya existe una comunidad con abreviatura "${comunidad.abreviatura}" en este municipio`
      );
    }

    const insertData = comunidad.toDatabaseInsert();
    const idComunidad = randomUUID();

    const query = {
      text: `
        INSERT INTO comunidades (
          id_comunidad,
          id_municipio,
          nombre_comunidad,
          abreviatura_comunidad,
          activo
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING 
          id_comunidad,
          id_municipio,
          nombre_comunidad,
          abreviatura_comunidad,
          activo,
          created_at
      `,
      values: [
        idComunidad,
        insertData.id_municipio,
        insertData.nombre_comunidad,
        insertData.abreviatura_comunidad,
        insertData.activo,
      ],
    };

    const result = await WriteQuery.insert<ComunidadData>(query);
    if (!result.success || !result.data) {
      throw new Error(result.error || "Error al crear comunidad");
    }

    // Obtener comunidad con JOINs para retornar data completa
    const comunidadCreada = await this.findById(result.data.id_comunidad);
    if (!comunidadCreada) {
      throw new Error("Comunidad creada pero no se pudo recuperar");
    }

    return comunidadCreada;
  }

  // Actualiza una comunidad existente
  // Solo campos modificables
  async update(id: string, comunidad: Comunidad): Promise<Comunidad> {
    const validation = comunidad.validate();
    if (!validation.valid) {
      throw new Error(`Validacion fallo: ${validation.errors.join(", ")}`);
    }

    const updateData = comunidad.toDatabaseUpdate();

    const query = {
      text: `
        UPDATE comunidades
        SET
          nombre_comunidad = $2,
          abreviatura_comunidad = $3,
          activo = $4
        WHERE id_comunidad = $1
        RETURNING id_comunidad
      `,
      values: [
        id,
        updateData.nombre_comunidad,
        updateData.abreviatura_comunidad,
        updateData.activo,
      ],
    };

    const result = await WriteQuery.execute(query);
    if (!result.success || result.affectedRows === 0) {
      throw new Error(result.error || "Comunidad no encontrada");
    }

    // Retornar comunidad actualizada con JOINs
    const comunidadActualizada = await this.findById(id);
    if (!comunidadActualizada) {
      throw new Error("Comunidad actualizada pero no se pudo recuperar");
    }

    return comunidadActualizada;
  }

  // Desactiva una comunidad (soft delete)
  // Verifica que no tenga tecnicos o productores activos
  async softDelete(id: string): Promise<void> {
    // Obtener comunidad con contadores
    const comunidad = await this.findById(id);
    if (!comunidad) {
      throw new Error("Comunidad no encontrada");
    }

    // Validar que puede desactivarse
    const validacion = comunidad.puedeDesactivar();
    if (!validacion.valid) {
      throw new Error(validacion.error);
    }

    const query = {
      text: `
        UPDATE comunidades
        SET activo = false
        WHERE id_comunidad = $1 AND activo = true
      `,
      values: [id],
    };

    const result = await WriteQuery.execute(query);
    if (!result.success) {
      throw new Error(result.error || "Error al desactivar comunidad");
    }

    if (result.affectedRows === 0) {
      throw new Error("Comunidad no encontrada o ya inactiva");
    }
  }

  // Elimina PERMANENTEMENTE una comunidad
  // Verifica que no tenga usuarios ni productores (activos o inactivos)
  async hardDelete(id: string): Promise<void> {
    const comunidad = await this.findById(id);
    if (!comunidad) {
      throw new Error("Comunidad no encontrada");
    }

    // Verificar que no tenga usuarios (activos o inactivos)
    const checkUsuariosQuery = {
      text: `
        SELECT COUNT(*) as count
        FROM usuarios
        WHERE id_comunidad = $1
      `,
      values: [id],
    };

    const usuariosResult = await ReadQuery.findOne<{ count: string }>(checkUsuariosQuery);
    const countUsuarios = parseInt(usuariosResult?.count || "0", 10);

    if (countUsuarios > 0) {
      throw new Error(
        `No se puede eliminar la comunidad porque tiene ${countUsuarios} usuario(s) asociado(s). Elimine primero los usuarios.`
      );
    }

    // Verificar que no tenga productores (activos o inactivos)
    const checkProductoresQuery = {
      text: `
        SELECT COUNT(*) as count
        FROM productores
        WHERE id_comunidad = $1
      `,
      values: [id],
    };

    const productoresResult = await ReadQuery.findOne<{ count: string }>(checkProductoresQuery);
    const countProductores = parseInt(productoresResult?.count || "0", 10);

    if (countProductores > 0) {
      throw new Error(
        `No se puede eliminar la comunidad porque tiene ${countProductores} productor(es) asociado(s). Elimine primero los productores.`
      );
    }

    // Eliminar permanentemente
    const deleteQuery = {
      text: `
        DELETE FROM comunidades
        WHERE id_comunidad = $1
      `,
      values: [id],
    };

    const deleteResult = await WriteQuery.execute(deleteQuery);
    if (!deleteResult.success || deleteResult.affectedRows === 0) {
      throw new Error("No se pudo eliminar la comunidad");
    }
  }

  // Cuenta comunidades por municipio
  // Para estadisticas
  async countByMunicipio(municipioId: string): Promise<number> {
    const query = {
      text: `
        SELECT COUNT(*) as count
        FROM comunidades
        WHERE id_municipio = $1 AND activo = true
      `,
      values: [municipioId],
    };

    const result = await ReadQuery.findOne<{ count: string }>(query);
    return parseInt(result?.count || "0", 10);
  }

  // Obtiene comunidades con tecnicos asignados
  // Para dashboard y reportes
  async findWithTecnicos(): Promise<Comunidad[]> {
    const query = {
      text: `
        SELECT 
          c.id_comunidad,
          c.id_municipio,
          c.nombre_comunidad,
          c.abreviatura_comunidad,
          c.activo,
          c.created_at,
          m.nombre_municipio,
          p.nombre_provincia,
          COUNT(DISTINCT u.id_usuario) as cantidad_tecnicos
        FROM comunidades c
        INNER JOIN municipios m ON c.id_municipio = m.id_municipio
        INNER JOIN provincias p ON m.id_provincia = p.id_provincia
        INNER JOIN usuarios u ON u.id_comunidad = c.id_comunidad
        INNER JOIN roles r ON u.id_rol = r.id_rol
        WHERE c.activo = true 
          AND u.activo = true
          AND LOWER(r.nombre_rol) = 'tecnico'
        GROUP BY 
          c.id_comunidad,
          c.id_municipio,
          c.nombre_comunidad,
          c.abreviatura_comunidad,
          c.activo,
          c.created_at,
          m.nombre_municipio,
          p.nombre_provincia
        HAVING COUNT(DISTINCT u.id_usuario) > 0
        ORDER BY cantidad_tecnicos DESC
      `,
      values: [],
    };

    const results = await ReadQuery.execute<ComunidadData>(query);
    return results.map((data) => Comunidad.fromDatabase(data));
  }

  // Obtiene comunidades sin tecnicos asignados
  // Para alertas y gestion
  async findWithoutTecnicos(): Promise<Comunidad[]> {
    const query = {
      text: `
        SELECT 
          c.id_comunidad,
          c.id_municipio,
          c.nombre_comunidad,
          c.abreviatura_comunidad,
          c.activo,
          c.created_at,
          m.nombre_municipio,
          p.nombre_provincia,
          0 as cantidad_tecnicos
        FROM comunidades c
        INNER JOIN municipios m ON c.id_municipio = m.id_municipio
        INNER JOIN provincias p ON m.id_provincia = p.id_provincia
        WHERE c.activo = true
          AND NOT EXISTS (
            SELECT 1 
            FROM usuarios u
            INNER JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.id_comunidad = c.id_comunidad
              AND u.activo = true
              AND LOWER(r.nombre_rol) = 'tecnico'
          )
        ORDER BY p.nombre_provincia, m.nombre_municipio, c.nombre_comunidad
      `,
      values: [],
    };

    const results = await ReadQuery.execute<ComunidadData>(query);
    return results.map((data) => Comunidad.fromDatabase(data));
  }

  // Busca comunidades por provincia
  // Con jerarquia completa
  async findByProvincia(provinciaId: string): Promise<Comunidad[]> {
    const query = {
      text: `
        SELECT
          c.id_comunidad,
          c.id_municipio,
          c.nombre_comunidad,
          c.abreviatura_comunidad,
          c.activo,
          c.created_at,
          m.nombre_municipio,
          p.nombre_provincia
        FROM comunidades c
        INNER JOIN municipios m ON c.id_municipio = m.id_municipio
        INNER JOIN provincias p ON m.id_provincia = p.id_provincia
        WHERE p.id_provincia = $1 AND c.activo = true
        ORDER BY m.nombre_municipio, c.nombre_comunidad
      `,
      values: [provinciaId],
    };

    const results = await ReadQuery.execute<ComunidadData>(query);
    return results.map((data) => Comunidad.fromDatabase(data));
  }

  // Busca comunidades con filtros dinamicos
  // Soporta filtros por: nombre, municipio, provincia, sin_tecnicos, activo
  async findWithFilters(filters: {
    nombre?: string;
    municipioId?: string;
    provinciaId?: string;
    sinTecnicos?: boolean;
    activo?: boolean;
  }): Promise<Comunidad[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Filtro por nombre (case-insensitive)
    if (filters.nombre) {
      conditions.push(`c.nombre_comunidad ILIKE $${paramIndex}`);
      values.push(`%${filters.nombre}%`);
      paramIndex++;
    }

    // Filtro por municipio
    if (filters.municipioId) {
      conditions.push(`c.id_municipio = $${paramIndex}`);
      values.push(filters.municipioId);
      paramIndex++;
    }

    // Filtro por provincia
    if (filters.provinciaId) {
      conditions.push(`m.id_provincia = $${paramIndex}`);
      values.push(filters.provinciaId);
      paramIndex++;
    }

    // Filtro por estado activo
    if (filters.activo !== undefined) {
      conditions.push(`c.activo = $${paramIndex}`);
      values.push(filters.activo);
      paramIndex++;
    }

    // Agregar filtro sin_tecnicos a las condiciones si aplica
    if (filters.sinTecnicos !== undefined) {
      if (filters.sinTecnicos) {
        // Solo comunidades SIN tecnicos
        conditions.push(`NOT EXISTS (
          SELECT 1
          FROM usuarios u
          INNER JOIN roles r ON u.id_rol = r.id_rol
          WHERE u.id_comunidad = c.id_comunidad
            AND u.activo = true
            AND LOWER(r.nombre_rol) = 'tecnico'
        )`);
      } else {
        // Solo comunidades CON tecnicos
        conditions.push(`EXISTS (
          SELECT 1
          FROM usuarios u
          INNER JOIN roles r ON u.id_rol = r.id_rol
          WHERE u.id_comunidad = c.id_comunidad
            AND u.activo = true
            AND LOWER(r.nombre_rol) = 'tecnico'
        )`);
      }
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Query final con contadores optimizados usando LEFT JOIN
    const finalQuery = `
      SELECT
        c.id_comunidad,
        c.id_municipio,
        c.nombre_comunidad,
        c.abreviatura_comunidad,
        c.activo,
        c.created_at,
        m.nombre_municipio,
        p.nombre_provincia,
        COALESCE(tecn.cantidad, 0) as cantidad_tecnicos,
        COALESCE(prod.cantidad, 0) as cantidad_productores
      FROM comunidades c
      INNER JOIN municipios m ON c.id_municipio = m.id_municipio
      INNER JOIN provincias p ON m.id_provincia = p.id_provincia
      LEFT JOIN (
        SELECT u.id_comunidad, COUNT(*) as cantidad
        FROM usuarios u
        INNER JOIN roles r ON u.id_rol = r.id_rol
        WHERE LOWER(r.nombre_rol) = 'tecnico' AND u.activo = true
        GROUP BY u.id_comunidad
      ) tecn ON c.id_comunidad = tecn.id_comunidad
      LEFT JOIN (
        SELECT id_comunidad, COUNT(*) as cantidad
        FROM productores
        WHERE activo = true
        GROUP BY id_comunidad
      ) prod ON c.id_comunidad = prod.id_comunidad
      ${whereClause}
      ORDER BY p.nombre_provincia, m.nombre_municipio, c.nombre_comunidad
    `;

    const query = {
      text: finalQuery,
      values: values,
    };

    const results = await ReadQuery.execute<ComunidadData>(query);
    return results.map((data) => Comunidad.fromDatabase(data));
  }
}
