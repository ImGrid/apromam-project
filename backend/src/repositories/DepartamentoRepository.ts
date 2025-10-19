import { ReadQuery, WriteQuery } from "../config/connection.js";
import { Departamento, DepartamentoData } from "../entities/Departamento.js";

export class DepartamentoRepository {
  // Encuentra departamento por ID con datos enriquecidos
  // Incluye contadores de provincias, municipios, comunidades y productores
  async findById(id: string): Promise<Departamento | null> {
    const query = {
      name: "find-departamento-by-id",
      text: `
        SELECT
          d.id_departamento,
          d.nombre_departamento,
          d.activo,
          d.created_at,
          (
            SELECT COUNT(*)
            FROM provincias p
            WHERE p.id_departamento = d.id_departamento
              AND p.activo = true
          ) as cantidad_provincias,
          (
            SELECT COUNT(*)
            FROM provincias p
            INNER JOIN municipios m ON p.id_provincia = m.id_provincia
            WHERE p.id_departamento = d.id_departamento
              AND p.activo = true
              AND m.activo = true
          ) as cantidad_municipios,
          (
            SELECT COUNT(*)
            FROM provincias p
            INNER JOIN municipios m ON p.id_provincia = m.id_provincia
            INNER JOIN comunidades c ON m.id_municipio = c.id_municipio
            WHERE p.id_departamento = d.id_departamento
              AND p.activo = true
              AND m.activo = true
              AND c.activo = true
          ) as cantidad_comunidades,
          (
            SELECT COUNT(*)
            FROM provincias p
            INNER JOIN municipios m ON p.id_provincia = m.id_provincia
            INNER JOIN comunidades c ON m.id_municipio = c.id_municipio
            INNER JOIN productores pr ON c.id_comunidad = pr.id_comunidad
            WHERE p.id_departamento = d.id_departamento
              AND p.activo = true
              AND m.activo = true
              AND c.activo = true
              AND pr.activo = true
          ) as cantidad_productores
        FROM departamentos d
        WHERE d.id_departamento = $1 AND d.activo = true
      `,
      values: [id],
    };

    const result = await ReadQuery.findOne<DepartamentoData>(query);
    return result ? Departamento.fromDatabase(result) : null;
  }

  // Lista todos los departamentos activos
  // Ordenados alfabeticamente para UI
  async findAll(): Promise<Departamento[]> {
    const query = {
      name: "find-all-departamentos-activos",
      text: `
        SELECT
          d.id_departamento,
          d.nombre_departamento,
          d.activo,
          d.created_at,
          (
            SELECT COUNT(*)
            FROM provincias p
            WHERE p.id_departamento = d.id_departamento
              AND p.activo = true
          ) as cantidad_provincias,
          (
            SELECT COUNT(*)
            FROM provincias p
            INNER JOIN municipios m ON p.id_provincia = m.id_provincia
            WHERE p.id_departamento = d.id_departamento
              AND p.activo = true
              AND m.activo = true
          ) as cantidad_municipios,
          (
            SELECT COUNT(*)
            FROM provincias p
            INNER JOIN municipios m ON p.id_provincia = m.id_provincia
            INNER JOIN comunidades c ON m.id_municipio = c.id_municipio
            WHERE p.id_departamento = d.id_departamento
              AND p.activo = true
              AND m.activo = true
              AND c.activo = true
          ) as cantidad_comunidades,
          (
            SELECT COUNT(*)
            FROM provincias p
            INNER JOIN municipios m ON p.id_provincia = m.id_provincia
            INNER JOIN comunidades c ON m.id_municipio = c.id_municipio
            INNER JOIN productores pr ON c.id_comunidad = pr.id_comunidad
            WHERE p.id_departamento = d.id_departamento
              AND p.activo = true
              AND m.activo = true
              AND c.activo = true
              AND pr.activo = true
          ) as cantidad_productores
        FROM departamentos d
        WHERE d.activo = true
        ORDER BY d.nombre_departamento ASC
      `,
      values: [],
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

    const query = {
      text: `
        INSERT INTO departamentos (
          nombre_departamento,
          activo
        )
        VALUES ($1, $2)
        RETURNING id_departamento, nombre_departamento, activo, created_at
      `,
      values: [insertData.nombre_departamento, insertData.activo],
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
