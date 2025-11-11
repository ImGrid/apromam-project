import { randomUUID } from "crypto";
import { ReadQuery, WriteQuery } from "../config/connection.js";
import { Municipio, MunicipioData } from "../entities/Municipio.js";

export class MunicipioRepository {
  // Encuentra municipio por ID con datos enriquecidos
  // JOIN con provincia y contadores de comunidades/productores
  // Usa LEFT JOIN para optimizar las consultas de conteo
  async findById(id: string): Promise<Municipio | null> {
    const query = {
      name: "find-municipio-by-id",
      text: `
        SELECT
          m.id_municipio,
          m.id_provincia,
          m.nombre_municipio,
          m.activo,
          m.created_at,
          p.nombre_provincia,
          COALESCE(comu.cantidad, 0) as cantidad_comunidades,
          COALESCE(prod.cantidad, 0) as cantidad_productores
        FROM municipios m
        INNER JOIN provincias p ON m.id_provincia = p.id_provincia
        LEFT JOIN (
          SELECT id_municipio, COUNT(*) as cantidad
          FROM comunidades
          WHERE activo = true
          GROUP BY id_municipio
        ) comu ON m.id_municipio = comu.id_municipio
        LEFT JOIN (
          SELECT c.id_municipio, COUNT(*) as cantidad
          FROM comunidades c
          INNER JOIN productores pr ON c.id_comunidad = pr.id_comunidad
          WHERE c.activo = true AND pr.activo = true
          GROUP BY c.id_municipio
        ) prod ON m.id_municipio = prod.id_municipio
        WHERE m.id_municipio = $1
      `,
      values: [id],
    };

    const result = await ReadQuery.findOne<MunicipioData>(query);
    return result ? Municipio.fromDatabase(result) : null;
  }

  // Lista municipios por provincia
  // Ordenados alfabeticamente
  // Sin contadores para mejor performance en listas
  async findByProvincia(provinciaId: string): Promise<Municipio[]> {
    const query = {
      name: "find-municipios-by-provincia",
      text: `
        SELECT
          m.id_municipio,
          m.id_provincia,
          m.nombre_municipio,
          m.activo,
          m.created_at,
          p.nombre_provincia
        FROM municipios m
        INNER JOIN provincias p ON m.id_provincia = p.id_provincia
        WHERE m.id_provincia = $1 AND m.activo = true
        ORDER BY m.nombre_municipio ASC
      `,
      values: [provinciaId],
    };

    const results = await ReadQuery.execute<MunicipioData>(query);
    return results.map((data) => Municipio.fromDatabase(data));
  }

  // Lista todos los municipios activos
  // Ordenados por provincia y luego por nombre
  // Sin contadores para mejor performance en listas
  async findAll(): Promise<Municipio[]> {
    const query = {
      name: "find-all-municipios-activos",
      text: `
        SELECT
          m.id_municipio,
          m.id_provincia,
          m.nombre_municipio,
          m.activo,
          m.created_at,
          p.nombre_provincia
        FROM municipios m
        INNER JOIN provincias p ON m.id_provincia = p.id_provincia
        WHERE m.activo = true
        ORDER BY p.nombre_provincia, m.nombre_municipio
      `,
      values: [],
    };

    const results = await ReadQuery.execute<MunicipioData>(query);
    return results.map((data) => Municipio.fromDatabase(data));
  }

  // Lista municipios con filtros opcionales
  // Incluye contadores optimizados con LEFT JOIN
  async findWithFilters(filters: {
    nombre?: string;
    provinciaId?: string;
    activo?: boolean;
  }): Promise<Municipio[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.nombre) {
      conditions.push(`m.nombre_municipio ILIKE $${paramIndex}`);
      values.push(`%${filters.nombre}%`);
      paramIndex++;
    }

    if (filters.provinciaId) {
      conditions.push(`m.id_provincia = $${paramIndex}`);
      values.push(filters.provinciaId);
      paramIndex++;
    }

    if (filters.activo !== undefined) {
      conditions.push(`m.activo = $${paramIndex}`);
      values.push(filters.activo);
      paramIndex++;
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const query = {
      name: "find-municipios-with-filters",
      text: `
        SELECT
          m.id_municipio,
          m.id_provincia,
          m.nombre_municipio,
          m.activo,
          m.created_at,
          p.nombre_provincia,
          COALESCE(comu.cantidad, 0) as cantidad_comunidades,
          COALESCE(prod.cantidad, 0) as cantidad_productores
        FROM municipios m
        INNER JOIN provincias p ON m.id_provincia = p.id_provincia
        LEFT JOIN (
          SELECT id_municipio, COUNT(*) as cantidad
          FROM comunidades
          WHERE activo = true
          GROUP BY id_municipio
        ) comu ON m.id_municipio = comu.id_municipio
        LEFT JOIN (
          SELECT c.id_municipio, COUNT(*) as cantidad
          FROM comunidades c
          INNER JOIN productores pr ON c.id_comunidad = pr.id_comunidad
          WHERE c.activo = true AND pr.activo = true
          GROUP BY c.id_municipio
        ) prod ON m.id_municipio = prod.id_municipio
        ${whereClause}
        ORDER BY p.nombre_provincia, m.nombre_municipio
      `,
      values,
    };

    const results = await ReadQuery.execute<MunicipioData>(query);
    return results.map((data) => Municipio.fromDatabase(data));
  }

  // Busca municipio por nombre dentro de una provincia
  // Util para validar duplicados
  async findByNombreInProvincia(
    nombre: string,
    provinciaId: string
  ): Promise<Municipio | null> {
    const query = {
      text: `
        SELECT 
          m.id_municipio,
          m.id_provincia,
          m.nombre_municipio,
          m.activo,
          m.created_at,
          p.nombre_provincia
        FROM municipios m
        INNER JOIN provincias p ON m.id_provincia = p.id_provincia
        WHERE LOWER(m.nombre_municipio) = LOWER($1)
          AND m.id_provincia = $2
          AND m.activo = true
      `,
      values: [nombre, provinciaId],
    };

    const result = await ReadQuery.findOne<MunicipioData>(query);
    return result ? Municipio.fromDatabase(result) : null;
  }

  // Verifica si existe municipio con el nombre en la provincia
  // Para evitar duplicados
  async existsByNombreInProvincia(
    nombre: string,
    provinciaId: string
  ): Promise<boolean> {
    const query = {
      text: `
        SELECT EXISTS(
          SELECT 1 
          FROM municipios
          WHERE LOWER(nombre_municipio) = LOWER($1)
            AND id_provincia = $2
        ) as exists
      `,
      values: [nombre, provinciaId],
    };

    const result = await ReadQuery.findOne<{ exists: boolean }>(query);
    return result?.exists ?? false;
  }

  // Crea un nuevo municipio
  async create(municipio: Municipio): Promise<Municipio> {
    const validation = municipio.validate();
    if (!validation.valid) {
      throw new Error(`Validacion fallo: ${validation.errors.join(", ")}`);
    }

    // Verificar duplicados en misma provincia
    const existe = await this.existsByNombreInProvincia(
      municipio.nombre,
      municipio.idProvincia
    );

    if (existe) {
      throw new Error(
        `Ya existe un municipio "${municipio.nombre}" en esta provincia`
      );
    }

    const insertData = municipio.toDatabaseInsert();
    const idMunicipio = randomUUID();

    const query = {
      text: `
        INSERT INTO municipios (
          id_municipio,
          id_provincia,
          nombre_municipio,
          activo
        ) VALUES ($1, $2, $3, $4)
        RETURNING
          id_municipio,
          id_provincia,
          nombre_municipio,
          activo,
          created_at
      `,
      values: [
        idMunicipio,
        insertData.id_provincia,
        insertData.nombre_municipio,
        insertData.activo,
      ],
    };

    const result = await WriteQuery.insert<MunicipioData>(query);
    if (!result.success || !result.data) {
      throw new Error(result.error || "Error al crear municipio");
    }

    const municipioCreado = await this.findById(result.data.id_municipio);
    if (!municipioCreado) {
      throw new Error("Municipio creado pero no se pudo recuperar");
    }

    return municipioCreado;
  }

  // Actualiza un municipio existente
  async update(id: string, municipio: Municipio): Promise<Municipio> {
    const validation = municipio.validate();
    if (!validation.valid) {
      throw new Error(`Validacion fallo: ${validation.errors.join(", ")}`);
    }

    const updateData = municipio.toDatabaseUpdate();

    const query = {
      text: `
        UPDATE municipios
        SET
          nombre_municipio = $2,
          activo = $3
        WHERE id_municipio = $1
        RETURNING id_municipio
      `,
      values: [id, updateData.nombre_municipio, updateData.activo],
    };

    const result = await WriteQuery.execute(query);
    if (!result.success || result.affectedRows === 0) {
      throw new Error(result.error || "Municipio no encontrado");
    }

    const municipioActualizado = await this.findById(id);
    if (!municipioActualizado) {
      throw new Error("Municipio actualizado pero no se pudo recuperar");
    }

    return municipioActualizado;
  }

  // Desactiva un municipio (soft delete)
  // Verifica que no tenga comunidades activas
  async softDelete(id: string): Promise<void> {
    const municipio = await this.findById(id);
    if (!municipio) {
      throw new Error("Municipio no encontrado");
    }

    const validacion = municipio.puedeDesactivar();
    if (!validacion.valid) {
      throw new Error(validacion.error);
    }

    const query = {
      text: `
        UPDATE municipios
        SET activo = false
        WHERE id_municipio = $1 AND activo = true
      `,
      values: [id],
    };

    const result = await WriteQuery.execute(query);
    if (!result.success) {
      throw new Error(result.error || "Error al desactivar municipio");
    }

    if (result.affectedRows === 0) {
      throw new Error("Municipio no encontrado o ya inactivo");
    }
  }

  // Elimina PERMANENTEMENTE un municipio
  // Verifica que no tenga comunidades (activas o inactivas)
  async hardDelete(id: string): Promise<void> {
    const municipio = await this.findById(id);
    if (!municipio) {
      throw new Error("Municipio no encontrado");
    }

    // Verificar que no tenga comunidades (activas o inactivas)
    const checkQuery = {
      text: `
        SELECT COUNT(*) as count
        FROM comunidades
        WHERE id_municipio = $1
      `,
      values: [id],
    };

    const result = await ReadQuery.findOne<{ count: string }>(checkQuery);
    const count = parseInt(result?.count || "0", 10);

    if (count > 0) {
      throw new Error(
        `No se puede eliminar el municipio porque tiene ${count} comunidad(es) asociada(s). Elimine primero las comunidades.`
      );
    }

    // Eliminar permanentemente
    const deleteQuery = {
      text: `
        DELETE FROM municipios
        WHERE id_municipio = $1
      `,
      values: [id],
    };

    const deleteResult = await WriteQuery.execute(deleteQuery);
    if (!deleteResult.success || deleteResult.affectedRows === 0) {
      throw new Error("No se pudo eliminar el municipio");
    }
  }

  // Cuenta municipios por provincia
  async countByProvincia(provinciaId: string): Promise<number> {
    const query = {
      text: `
        SELECT COUNT(*) as count
        FROM municipios
        WHERE id_provincia = $1 AND activo = true
      `,
      values: [provinciaId],
    };

    const result = await ReadQuery.findOne<{ count: string }>(query);
    return parseInt(result?.count || "0", 10);
  }
}
