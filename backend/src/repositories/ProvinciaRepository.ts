import { ReadQuery, WriteQuery } from "../config/connection.js";
import { Provincia, ProvinciaData } from "../entities/Provincia.js";

export class ProvinciaRepository {
  // Encuentra provincia por ID con datos enriquecidos
  // Incluye contadores de municipios, comunidades y productores
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
          (
            SELECT COUNT(*)
            FROM municipios m
            WHERE m.id_provincia = p.id_provincia
              AND m.activo = true
          ) as cantidad_municipios,
          (
            SELECT COUNT(*)
            FROM municipios m
            INNER JOIN comunidades c ON m.id_municipio = c.id_municipio
            WHERE m.id_provincia = p.id_provincia
              AND m.activo = true
              AND c.activo = true
          ) as cantidad_comunidades,
          (
            SELECT COUNT(*)
            FROM municipios m
            INNER JOIN comunidades c ON m.id_municipio = c.id_municipio
            INNER JOIN productores pr ON c.id_comunidad = pr.id_comunidad
            WHERE m.id_provincia = p.id_provincia
              AND m.activo = true
              AND c.activo = true
              AND pr.activo = true
          ) as cantidad_productores
        FROM provincias p
        INNER JOIN departamentos d ON p.id_departamento = d.id_departamento
        WHERE p.id_provincia = $1 AND p.activo = true
      `,
      values: [id],
    };

    const result = await ReadQuery.findOne<ProvinciaData>(query);
    return result ? Provincia.fromDatabase(result) : null;
  }

  // Lista todas las provincias activas
  // Ordenadas alfabeticamente para UI
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
          d.nombre_departamento,
          (
            SELECT COUNT(*)
            FROM municipios m
            WHERE m.id_provincia = p.id_provincia
              AND m.activo = true
          ) as cantidad_municipios,
          (
            SELECT COUNT(*)
            FROM municipios m
            INNER JOIN comunidades c ON m.id_municipio = c.id_municipio
            WHERE m.id_provincia = p.id_provincia
              AND m.activo = true
              AND c.activo = true
          ) as cantidad_comunidades,
          (
            SELECT COUNT(*)
            FROM municipios m
            INNER JOIN comunidades c ON m.id_municipio = c.id_municipio
            INNER JOIN productores pr ON c.id_comunidad = pr.id_comunidad
            WHERE m.id_provincia = p.id_provincia
              AND m.activo = true
              AND c.activo = true
              AND pr.activo = true
          ) as cantidad_productores
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

    const query = {
      text: `
        INSERT INTO provincias (
          id_departamento,
          nombre_provincia,
          activo
        ) VALUES ($1, $2, $3)
        RETURNING
          id_provincia,
          id_departamento,
          nombre_provincia,
          activo,
          created_at
      `,
      values: [
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
        WHERE id_provincia = $1 AND activo = true
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
      throw new Error(result.error || "Provincia no encontrada o ya inactiva");
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
