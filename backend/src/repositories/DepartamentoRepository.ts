import { randomUUID } from "crypto";
import { ReadQuery, WriteQuery } from "../config/connection.js";
import { Departamento, DepartamentoData } from "../entities/Departamento.js";

export class DepartamentoRepository {
  // Encuentra departamento por ID con datos enriquecidos
  // Incluye contadores de provincias, municipios, comunidades y productores
  // Usa LEFT JOIN para optimizar las consultas de conteo
  async findById(id: string): Promise<Departamento | null> {
    const query = {
      name: "find-departamento-by-id",
      text: `
        SELECT
          d.id_departamento,
          d.nombre_departamento,
          d.activo,
          d.created_at,
          COALESCE(prov.cantidad, 0) as cantidad_provincias,
          COALESCE(muni.cantidad, 0) as cantidad_municipios,
          COALESCE(comu.cantidad, 0) as cantidad_comunidades,
          COALESCE(prod.cantidad, 0) as cantidad_productores
        FROM departamentos d
        LEFT JOIN (
          SELECT id_departamento, COUNT(*) as cantidad
          FROM provincias
          WHERE activo = true
          GROUP BY id_departamento
        ) prov ON d.id_departamento = prov.id_departamento
        LEFT JOIN (
          SELECT p.id_departamento, COUNT(*) as cantidad
          FROM provincias p
          INNER JOIN municipios m ON p.id_provincia = m.id_provincia
          WHERE p.activo = true AND m.activo = true
          GROUP BY p.id_departamento
        ) muni ON d.id_departamento = muni.id_departamento
        LEFT JOIN (
          SELECT p.id_departamento, COUNT(*) as cantidad
          FROM provincias p
          INNER JOIN municipios m ON p.id_provincia = m.id_provincia
          INNER JOIN comunidades c ON m.id_municipio = c.id_municipio
          WHERE p.activo = true AND m.activo = true AND c.activo = true
          GROUP BY p.id_departamento
        ) comu ON d.id_departamento = comu.id_departamento
        LEFT JOIN (
          SELECT p.id_departamento, COUNT(*) as cantidad
          FROM provincias p
          INNER JOIN municipios m ON p.id_provincia = m.id_provincia
          INNER JOIN comunidades c ON m.id_municipio = c.id_municipio
          INNER JOIN productores pr ON c.id_comunidad = pr.id_comunidad
          WHERE p.activo = true AND m.activo = true AND c.activo = true AND pr.activo = true
          GROUP BY p.id_departamento
        ) prod ON d.id_departamento = prod.id_departamento
        WHERE d.id_departamento = $1
      `,
      values: [id],
    };

    const result = await ReadQuery.findOne<DepartamentoData>(query);
    return result ? Departamento.fromDatabase(result) : null;
  }

  // Lista todos los departamentos activos
  // Ordenados alfabeticamente para UI
  // Sin contadores para mejor performance en listas
  async findAll(): Promise<Departamento[]> {
    const query = {
      name: "find-all-departamentos-activos",
      text: `
        SELECT
          id_departamento,
          nombre_departamento,
          activo,
          created_at
        FROM departamentos
        WHERE activo = true
        ORDER BY nombre_departamento ASC
      `,
      values: [],
    };

    const results = await ReadQuery.execute<DepartamentoData>(query);
    return results.map((data) => Departamento.fromDatabase(data));
  }

  // Lista departamentos con filtros opcionales
  // Incluye contadores optimizados con LEFT JOIN
  async findWithFilters(filters: {
    nombre?: string;
    activo?: boolean;
  }): Promise<Departamento[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.nombre) {
      conditions.push(`d.nombre_departamento ILIKE $${paramIndex}`);
      values.push(`%${filters.nombre}%`);
      paramIndex++;
    }

    if (filters.activo !== undefined) {
      conditions.push(`d.activo = $${paramIndex}`);
      values.push(filters.activo);
      paramIndex++;
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const query = {
      name: "find-departamentos-with-filters",
      text: `
        SELECT
          d.id_departamento,
          d.nombre_departamento,
          d.activo,
          d.created_at,
          COALESCE(prov.cantidad, 0) as cantidad_provincias,
          COALESCE(muni.cantidad, 0) as cantidad_municipios,
          COALESCE(comu.cantidad, 0) as cantidad_comunidades,
          COALESCE(prod.cantidad, 0) as cantidad_productores
        FROM departamentos d
        LEFT JOIN (
          SELECT id_departamento, COUNT(*) as cantidad
          FROM provincias
          WHERE activo = true
          GROUP BY id_departamento
        ) prov ON d.id_departamento = prov.id_departamento
        LEFT JOIN (
          SELECT p.id_departamento, COUNT(*) as cantidad
          FROM provincias p
          INNER JOIN municipios m ON p.id_provincia = m.id_provincia
          WHERE p.activo = true AND m.activo = true
          GROUP BY p.id_departamento
        ) muni ON d.id_departamento = muni.id_departamento
        LEFT JOIN (
          SELECT p.id_departamento, COUNT(*) as cantidad
          FROM provincias p
          INNER JOIN municipios m ON p.id_provincia = m.id_provincia
          INNER JOIN comunidades c ON m.id_municipio = c.id_municipio
          WHERE p.activo = true AND m.activo = true AND c.activo = true
          GROUP BY p.id_departamento
        ) comu ON d.id_departamento = comu.id_departamento
        LEFT JOIN (
          SELECT p.id_departamento, COUNT(*) as cantidad
          FROM provincias p
          INNER JOIN municipios m ON p.id_provincia = m.id_provincia
          INNER JOIN comunidades c ON m.id_municipio = c.id_municipio
          INNER JOIN productores pr ON c.id_comunidad = pr.id_comunidad
          WHERE p.activo = true AND m.activo = true AND c.activo = true AND pr.activo = true
          GROUP BY p.id_departamento
        ) prod ON d.id_departamento = prod.id_departamento
        ${whereClause}
        ORDER BY d.nombre_departamento ASC
      `,
      values,
    };

    const results = await ReadQuery.execute<DepartamentoData>(query);
    return results.map((data) => Departamento.fromDatabase(data));
  }

  // Busca departamento por nombre (case-insensitive)
  // Util para validar duplicados
  async findByNombre(nombre: string): Promise<Departamento | null> {
    const query = {
      text: `
        SELECT
          id_departamento,
          nombre_departamento,
          activo,
          created_at
        FROM departamentos
        WHERE LOWER(nombre_departamento) = LOWER($1)
          AND activo = true
      `,
      values: [nombre],
    };

    const result = await ReadQuery.findOne<DepartamentoData>(query);
    return result ? Departamento.fromDatabase(result) : null;
  }

  // Verifica si existe departamento con el nombre
  // Para evitar duplicados
  async existsByNombre(nombre: string): Promise<boolean> {
    const query = {
      text: `
        SELECT EXISTS(
          SELECT 1
          FROM departamentos
          WHERE LOWER(nombre_departamento) = LOWER($1)
            AND activo = true
        ) as exists
      `,
      values: [nombre],
    };

    const result = await ReadQuery.findOne<{ exists: boolean }>(query);
    return result?.exists ?? false;
  }

  // Crea un nuevo departamento
  async create(departamento: Departamento): Promise<Departamento> {
    const validation = departamento.validate();
    if (!validation.valid) {
      throw new Error(`Validacion fallo: ${validation.errors.join(", ")}`);
    }

    // Verificar duplicados
    const existe = await this.existsByNombre(departamento.nombre);
    if (existe) {
      throw new Error(`Ya existe un departamento "${departamento.nombre}"`);
    }

    const insertData = departamento.toDatabaseInsert();
    const idDepartamento = randomUUID();

    const query = {
      text: `
        INSERT INTO departamentos (
          id_departamento,
          nombre_departamento,
          activo
        )
        VALUES ($1, $2, $3)
        RETURNING id_departamento, nombre_departamento, activo, created_at
      `,
      values: [idDepartamento, insertData.nombre_departamento, insertData.activo],
    };

    const result = await WriteQuery.execute(query);

    // Verificar que la operacion fue exitosa
    if (!result.success || !result.data || result.data.length === 0) {
      throw new Error(result.error || "Error al crear departamento");
    }

    const createdData = result.data[0] as DepartamentoData;

    return Departamento.fromDatabase(createdData);
  }

  // Actualiza un departamento existente
  async update(
    id: string,
    departamento: Departamento
  ): Promise<Departamento | null> {
    const validation = departamento.validate();
    if (!validation.valid) {
      throw new Error(`Validacion fallo: ${validation.errors.join(", ")}`);
    }

    // Si se actualiza el nombre, verificar que no exista otro con ese nombre
    const existing = await this.findByNombre(departamento.nombre);
    if (existing && existing.id !== id) {
      throw new Error(`Ya existe un departamento "${departamento.nombre}"`);
    }

    const updateData = departamento.toDatabaseUpdate();

    const query = {
      text: `
        UPDATE departamentos
        SET
          nombre_departamento = COALESCE($2, nombre_departamento),
          activo = COALESCE($3, activo)
        WHERE id_departamento = $1
        RETURNING id_departamento, nombre_departamento, activo, created_at
      `,
      values: [id, updateData.nombre_departamento, updateData.activo],
    };

    const result = await WriteQuery.execute(query);

    // Verificar que la operacion fue exitosa
    if (!result.success) {
      throw new Error(result.error || "Error al actualizar departamento");
    }

    if (!result.data || result.data.length === 0) {
      return null;
    }

    const updatedData = result.data[0] as DepartamentoData;
    return Departamento.fromDatabase(updatedData);
  }

  // Elimina (desactiva) un departamento
  // Solo si no tiene provincias asociadas
  async delete(id: string): Promise<boolean> {
    const departamento = await this.findById(id);
    if (!departamento) {
      throw new Error("Departamento no encontrado");
    }

    const validacion = departamento.puedeDesactivar();
    if (!validacion.valid) {
      throw new Error(validacion.error!);
    }

    const query = {
      text: `
        UPDATE departamentos
        SET activo = false
        WHERE id_departamento = $1
      `,
      values: [id],
    };

    await WriteQuery.execute(query);
    return true;
  }

  // Elimina PERMANENTEMENTE un departamento
  // Verifica que no tenga provincias (activas o inactivas)
  async hardDelete(id: string): Promise<void> {
    const departamento = await this.findById(id);
    if (!departamento) {
      throw new Error("Departamento no encontrado");
    }

    // Verificar que no tenga provincias (activas o inactivas)
    const checkQuery = {
      text: `
        SELECT COUNT(*) as count
        FROM provincias
        WHERE id_departamento = $1
      `,
      values: [id],
    };

    const result = await ReadQuery.findOne<{ count: string }>(checkQuery);
    const count = parseInt(result?.count || "0", 10);

    if (count > 0) {
      throw new Error(
        `No se puede eliminar el departamento porque tiene ${count} provincia(s) asociada(s). Elimine primero las provincias.`
      );
    }

    // Eliminar permanentemente
    const deleteQuery = {
      text: `
        DELETE FROM departamentos
        WHERE id_departamento = $1
      `,
      values: [id],
    };

    const deleteResult = await WriteQuery.execute(deleteQuery);
    if (!deleteResult.success || deleteResult.affectedRows === 0) {
      throw new Error("No se pudo eliminar el departamento");
    }
  }

  // Verifica si existe por ID
  async existsById(id: string): Promise<boolean> {
    const query = {
      text: `
        SELECT EXISTS(
          SELECT 1
          FROM departamentos
          WHERE id_departamento = $1 AND activo = true
        ) as exists
      `,
      values: [id],
    };

    const result = await ReadQuery.findOne<{ exists: boolean }>(query);
    return result?.exists ?? false;
  }

  // Cuenta total de departamentos activos
  async count(): Promise<number> {
    const query = {
      text: `
        SELECT COUNT(*) as count
        FROM departamentos
        WHERE activo = true
      `,
      values: [],
    };

    const result = await ReadQuery.findOne<{ count: string }>(query);
    return parseInt(result?.count ?? "0", 10);
  }
}
