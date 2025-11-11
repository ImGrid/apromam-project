import { randomUUID } from "crypto";
import { ReadQuery, WriteQuery } from "../config/connection.js";
import { Provincia, ProvinciaData } from "../entities/Provincia.js";

export class ProvinciaRepository {
  // Encuentra provincia por ID con datos enriquecidos
  // Incluye contadores de municipios, comunidades y productores
  // Usa LEFT JOIN para optimizar las consultas de conteo
  async findById(id: string): Promise<Provincia | null> {
    const query = {
      name: "find-provincia-by-id",
      text: `
        SELECT
          p.id_provincia,
          p.id_departamento,
          p.nombre_provincia,
          p.activo,
          p.created_at,
          d.nombre_departamento,
          COALESCE(muni.cantidad, 0) as cantidad_municipios,
          COALESCE(comu.cantidad, 0) as cantidad_comunidades,
          COALESCE(prod.cantidad, 0) as cantidad_productores
        FROM provincias p
        INNER JOIN departamentos d ON p.id_departamento = d.id_departamento
        LEFT JOIN (
          SELECT id_provincia, COUNT(*) as cantidad
          FROM municipios
          WHERE activo = true
          GROUP BY id_provincia
        ) muni ON p.id_provincia = muni.id_provincia
        LEFT JOIN (
          SELECT m.id_provincia, COUNT(*) as cantidad
          FROM municipios m
          INNER JOIN comunidades c ON m.id_municipio = c.id_municipio
          WHERE m.activo = true AND c.activo = true
          GROUP BY m.id_provincia
        ) comu ON p.id_provincia = comu.id_provincia
        LEFT JOIN (
          SELECT m.id_provincia, COUNT(*) as cantidad
          FROM municipios m
          INNER JOIN comunidades c ON m.id_municipio = c.id_municipio
          INNER JOIN productores pr ON c.id_comunidad = pr.id_comunidad
          WHERE m.activo = true AND c.activo = true AND pr.activo = true
          GROUP BY m.id_provincia
        ) prod ON p.id_provincia = prod.id_provincia
        WHERE p.id_provincia = $1
      `,
      values: [id],
    };

    const result = await ReadQuery.findOne<ProvinciaData>(query);
    return result ? Provincia.fromDatabase(result) : null;
  }

  // Lista todas las provincias activas
  // Ordenadas alfabeticamente para UI
  // Sin contadores para mejor performance en listas
  async findAll(): Promise<Provincia[]> {
    const query = {
      name: "find-all-provincias-activas",
      text: `
        SELECT
          p.id_provincia,
          p.id_departamento,
          p.nombre_provincia,
          p.activo,
          p.created_at,
          d.nombre_departamento
        FROM provincias p
        INNER JOIN departamentos d ON p.id_departamento = d.id_departamento
        WHERE p.activo = true
        ORDER BY p.nombre_provincia ASC
      `,
      values: [],
    };

    const results = await ReadQuery.execute<ProvinciaData>(query);
    return results.map((data) => Provincia.fromDatabase(data));
  }

  // Lista provincias con filtros opcionales
  // Incluye contadores optimizados con LEFT JOIN
  async findWithFilters(filters: {
    nombre?: string;
    departamentoId?: string;
    activo?: boolean;
  }): Promise<Provincia[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.nombre) {
      conditions.push(`p.nombre_provincia ILIKE $${paramIndex}`);
      values.push(`%${filters.nombre}%`);
      paramIndex++;
    }

    if (filters.departamentoId) {
      conditions.push(`p.id_departamento = $${paramIndex}`);
      values.push(filters.departamentoId);
      paramIndex++;
    }

    if (filters.activo !== undefined) {
      conditions.push(`p.activo = $${paramIndex}`);
      values.push(filters.activo);
      paramIndex++;
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const query = {
      name: "find-provincias-with-filters",
      text: `
        SELECT
          p.id_provincia,
          p.id_departamento,
          p.nombre_provincia,
          p.activo,
          p.created_at,
          d.nombre_departamento,
          COALESCE(muni.cantidad, 0) as cantidad_municipios,
          COALESCE(comu.cantidad, 0) as cantidad_comunidades,
          COALESCE(prod.cantidad, 0) as cantidad_productores
        FROM provincias p
        INNER JOIN departamentos d ON p.id_departamento = d.id_departamento
        LEFT JOIN (
          SELECT id_provincia, COUNT(*) as cantidad
          FROM municipios
          WHERE activo = true
          GROUP BY id_provincia
        ) muni ON p.id_provincia = muni.id_provincia
        LEFT JOIN (
          SELECT m.id_provincia, COUNT(*) as cantidad
          FROM municipios m
          INNER JOIN comunidades c ON m.id_municipio = c.id_municipio
          WHERE m.activo = true AND c.activo = true
          GROUP BY m.id_provincia
        ) comu ON p.id_provincia = comu.id_provincia
        LEFT JOIN (
          SELECT m.id_provincia, COUNT(*) as cantidad
          FROM municipios m
          INNER JOIN comunidades c ON m.id_municipio = c.id_municipio
          INNER JOIN productores pr ON c.id_comunidad = pr.id_comunidad
          WHERE m.activo = true AND c.activo = true AND pr.activo = true
          GROUP BY m.id_provincia
        ) prod ON p.id_provincia = prod.id_provincia
        ${whereClause}
        ORDER BY p.nombre_provincia ASC
      `,
      values,
    };

    const results = await ReadQuery.execute<ProvinciaData>(query);
    return results.map((data) => Provincia.fromDatabase(data));
  }

  // Busca provincia por nombre (case-insensitive)
  // Util para validar duplicados
  async findByNombre(nombre: string): Promise<Provincia | null> {
    const query = {
      text: `
        SELECT
          p.id_provincia,
          p.id_departamento,
          p.nombre_provincia,
          p.activo,
          p.created_at
        FROM provincias p
        WHERE LOWER(p.nombre_provincia) = LOWER($1)
          AND p.activo = true
      `,
      values: [nombre],
    };

    const result = await ReadQuery.findOne<ProvinciaData>(query);
    return result ? Provincia.fromDatabase(result) : null;
  }

  // Verifica si existe provincia con el nombre
  // Para evitar duplicados
  async existsByNombre(nombre: string): Promise<boolean> {
    const query = {
      text: `
        SELECT EXISTS(
          SELECT 1 
          FROM provincias
          WHERE LOWER(nombre_provincia) = LOWER($1)
        ) as exists
      `,
      values: [nombre],
    };

    const result = await ReadQuery.findOne<{ exists: boolean }>(query);
    return result?.exists ?? false;
  }

  // Crea una nueva provincia
  async create(provincia: Provincia): Promise<Provincia> {
    const validation = provincia.validate();
    if (!validation.valid) {
      throw new Error(`Validacion fallo: ${validation.errors.join(", ")}`);
    }

    // Verificar duplicados
    const existe = await this.existsByNombre(provincia.nombre);
    if (existe) {
      throw new Error(`Ya existe una provincia "${provincia.nombre}"`);
    }

    const insertData = provincia.toDatabaseInsert();
    const idProvincia = randomUUID();

    const query = {
      text: `
        INSERT INTO provincias (
          id_provincia,
          id_departamento,
          nombre_provincia,
          activo
        ) VALUES ($1, $2, $3, $4)
        RETURNING
          id_provincia,
          id_departamento,
          nombre_provincia,
          activo,
          created_at
      `,
      values: [
        idProvincia,
        provincia.idDepartamento,
        insertData.nombre_provincia,
        insertData.activo,
      ],
    };

    const result = await WriteQuery.insert<ProvinciaData>(query);
    if (!result.success || !result.data) {
      throw new Error(result.error || "Error al crear provincia");
    }

    return Provincia.fromDatabase(result.data);
  }

  // Actualiza una provincia existente
  async update(id: string, provincia: Provincia): Promise<Provincia> {
    const validation = provincia.validate();
    if (!validation.valid) {
      throw new Error(`Validacion fallo: ${validation.errors.join(", ")}`);
    }

    const updateData = provincia.toDatabaseUpdate();

    const query = {
      text: `
        UPDATE provincias
        SET
          nombre_provincia = $2,
          activo = $3
        WHERE id_provincia = $1
        RETURNING
          id_provincia,
          id_departamento,
          nombre_provincia,
          activo,
          created_at
      `,
      values: [id, updateData.nombre_provincia, updateData.activo],
    };

    const result = await WriteQuery.execute(query);
    if (!result.success || result.affectedRows === 0) {
      throw new Error(result.error || "Provincia no encontrada");
    }

    const provinciaActualizada = await this.findById(id);
    if (!provinciaActualizada) {
      throw new Error("Provincia actualizada pero no se pudo recuperar");
    }

    return provinciaActualizada;
  }

  // Desactiva una provincia (soft delete)
  // Verifica que no tenga municipios activos
  async softDelete(id: string): Promise<void> {
    const provincia = await this.findById(id);
    if (!provincia) {
      throw new Error("Provincia no encontrada");
    }

    const validacion = provincia.puedeDesactivar();
    if (!validacion.valid) {
      throw new Error(validacion.error);
    }

    const query = {
      text: `
        UPDATE provincias
        SET activo = false
        WHERE id_provincia = $1 AND activo = true
      `,
      values: [id],
    };

    const result = await WriteQuery.execute(query);
    if (!result.success) {
      throw new Error(result.error || "Error al desactivar provincia");
    }

    if (result.affectedRows === 0) {
      throw new Error("Provincia no encontrada o ya inactiva");
    }
  }

  // Elimina PERMANENTEMENTE una provincia
  // Verifica que no tenga municipios (activos o inactivos)
  async hardDelete(id: string): Promise<void> {
    const provincia = await this.findById(id);
    if (!provincia) {
      throw new Error("Provincia no encontrada");
    }

    // Verificar que no tenga municipios (activos o inactivos)
    const checkQuery = {
      text: `
        SELECT COUNT(*) as count
        FROM municipios
        WHERE id_provincia = $1
      `,
      values: [id],
    };

    const result = await ReadQuery.findOne<{ count: string }>(checkQuery);
    const count = parseInt(result?.count || "0", 10);

    if (count > 0) {
      throw new Error(
        `No se puede eliminar la provincia porque tiene ${count} municipio(s) asociado(s). Elimine primero los municipios.`
      );
    }

    // Eliminar permanentemente
    const deleteQuery = {
      text: `
        DELETE FROM provincias
        WHERE id_provincia = $1
      `,
      values: [id],
    };

    const deleteResult = await WriteQuery.execute(deleteQuery);
    if (!deleteResult.success || deleteResult.affectedRows === 0) {
      throw new Error("No se pudo eliminar la provincia");
    }
  }

  // Cuenta provincias activas
  async count(): Promise<number> {
    const query = {
      text: `
        SELECT COUNT(*) as count
        FROM provincias
        WHERE activo = true
      `,
      values: [],
    };

    const result = await ReadQuery.findOne<{ count: string }>(query);
    return parseInt(result?.count || "0", 10);
  }
}
