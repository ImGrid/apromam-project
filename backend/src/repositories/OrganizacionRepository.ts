import { randomUUID } from "crypto";
import { ReadQuery, WriteQuery } from "../config/connection.js";
import { Organizacion, OrganizacionData } from "../entities/Organizacion.js";

export class OrganizacionRepository {
  // Encuentra organizacion por ID con datos enriquecidos
  // Incluye contador de productores
  async findById(id: string): Promise<Organizacion | null> {
    const query = {
      name: "find-organizacion-by-id",
      text: `
        SELECT
          o.id_organizacion,
          o.nombre_organizacion,
          o.abreviatura_organizacion,
          o.activo,
          o.created_at,
          (
            SELECT COUNT(*)
            FROM productores p
            WHERE p.id_organizacion = o.id_organizacion
              AND p.activo = true
          ) as cantidad_productores
        FROM organizaciones o
        WHERE o.id_organizacion = $1 AND o.activo = true
      `,
      values: [id],
    };

    const result = await ReadQuery.findOne<OrganizacionData>(query);
    return result ? Organizacion.fromDatabase(result) : null;
  }

  // Lista todas las organizaciones activas
  // Ordenadas alfabeticamente para UI
  async findAll(): Promise<Organizacion[]> {
    const query = {
      name: "find-all-organizaciones-activas",
      text: `
        SELECT
          o.id_organizacion,
          o.nombre_organizacion,
          o.abreviatura_organizacion,
          o.activo,
          o.created_at,
          (
            SELECT COUNT(*)
            FROM productores p
            WHERE p.id_organizacion = o.id_organizacion
              AND p.activo = true
          ) as cantidad_productores
        FROM organizaciones o
        WHERE o.activo = true
        ORDER BY o.nombre_organizacion ASC
      `,
      values: [],
    };

    const results = await ReadQuery.execute<OrganizacionData>(query);
    return results.map((data) => Organizacion.fromDatabase(data));
  }

  // Busca organizacion por nombre (case-insensitive)
  // Util para validar duplicados
  async findByNombre(nombre: string): Promise<Organizacion | null> {
    const query = {
      text: `
        SELECT
          id_organizacion,
          nombre_organizacion,
          abreviatura_organizacion,
          activo,
          created_at
        FROM organizaciones
        WHERE LOWER(nombre_organizacion) = LOWER($1)
          AND activo = true
      `,
      values: [nombre],
    };

    const result = await ReadQuery.findOne<OrganizacionData>(query);
    return result ? Organizacion.fromDatabase(result) : null;
  }

  // Busca organizacion por abreviatura (case-insensitive)
  // Util para validar duplicados
  async findByAbreviatura(abreviatura: string): Promise<Organizacion | null> {
    const query = {
      text: `
        SELECT
          id_organizacion,
          nombre_organizacion,
          abreviatura_organizacion,
          activo,
          created_at
        FROM organizaciones
        WHERE LOWER(abreviatura_organizacion) = LOWER($1)
          AND activo = true
      `,
      values: [abreviatura],
    };

    const result = await ReadQuery.findOne<OrganizacionData>(query);
    return result ? Organizacion.fromDatabase(result) : null;
  }

  // Verifica si existe organizacion con el nombre
  // Para evitar duplicados
  async existsByNombre(nombre: string): Promise<boolean> {
    const query = {
      text: `
        SELECT EXISTS(
          SELECT 1
          FROM organizaciones
          WHERE LOWER(nombre_organizacion) = LOWER($1)
            AND activo = true
        ) as exists
      `,
      values: [nombre],
    };

    const result = await ReadQuery.findOne<{ exists: boolean }>(query);
    return result?.exists ?? false;
  }

  // Verifica si existe organizacion con la abreviatura
  // Para evitar duplicados
  async existsByAbreviatura(abreviatura: string): Promise<boolean> {
    const query = {
      text: `
        SELECT EXISTS(
          SELECT 1
          FROM organizaciones
          WHERE LOWER(abreviatura_organizacion) = LOWER($1)
            AND activo = true
        ) as exists
      `,
      values: [abreviatura],
    };

    const result = await ReadQuery.findOne<{ exists: boolean }>(query);
    return result?.exists ?? false;
  }

  // Crea una nueva organizacion
  async create(organizacion: Organizacion): Promise<Organizacion> {
    const validation = organizacion.validate();
    if (!validation.valid) {
      throw new Error(`Validacion fallo: ${validation.errors.join(", ")}`);
    }

    // Verificar duplicados por nombre
    const existeNombre = await this.existsByNombre(organizacion.nombre);
    if (existeNombre) {
      throw new Error(`Ya existe una organización "${organizacion.nombre}"`);
    }

    // Verificar duplicados por abreviatura
    const existeAbreviatura = await this.existsByAbreviatura(
      organizacion.abreviatura
    );
    if (existeAbreviatura) {
      throw new Error(
        `Ya existe una organización con abreviatura "${organizacion.abreviatura}"`
      );
    }

    const insertData = organizacion.toDatabaseInsert();
    const idOrganizacion = randomUUID();

    const query = {
      text: `
        INSERT INTO organizaciones (
          id_organizacion,
          nombre_organizacion,
          abreviatura_organizacion,
          activo
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id_organizacion, nombre_organizacion, abreviatura_organizacion, activo, created_at
      `,
      values: [
        idOrganizacion,
        insertData.nombre_organizacion,
        insertData.abreviatura_organizacion,
        insertData.activo,
      ],
    };

    const result = await WriteQuery.execute(query);

    // Verificar que la operacion fue exitosa
    if (!result.success || !result.data || result.data.length === 0) {
      throw new Error(result.error || "Error al crear organización");
    }

    const createdData = result.data[0] as OrganizacionData;

    return Organizacion.fromDatabase(createdData);
  }

  // Actualiza una organizacion existente
  async update(
    id: string,
    organizacion: Organizacion
  ): Promise<Organizacion | null> {
    const validation = organizacion.validate();
    if (!validation.valid) {
      throw new Error(`Validacion fallo: ${validation.errors.join(", ")}`);
    }

    // Si se actualiza el nombre, verificar que no exista otro con ese nombre
    const existingNombre = await this.findByNombre(organizacion.nombre);
    if (existingNombre && existingNombre.id !== id) {
      throw new Error(`Ya existe una organización "${organizacion.nombre}"`);
    }

    // Si se actualiza la abreviatura, verificar que no exista otra con esa abreviatura
    const existingAbreviatura = await this.findByAbreviatura(
      organizacion.abreviatura
    );
    if (existingAbreviatura && existingAbreviatura.id !== id) {
      throw new Error(
        `Ya existe una organización con abreviatura "${organizacion.abreviatura}"`
      );
    }

    const updateData = organizacion.toDatabaseUpdate();

    const query = {
      text: `
        UPDATE organizaciones
        SET
          nombre_organizacion = COALESCE($2, nombre_organizacion),
          abreviatura_organizacion = COALESCE($3, abreviatura_organizacion),
          activo = COALESCE($4, activo)
        WHERE id_organizacion = $1
        RETURNING id_organizacion, nombre_organizacion, abreviatura_organizacion, activo, created_at
      `,
      values: [
        id,
        updateData.nombre_organizacion,
        updateData.abreviatura_organizacion,
        updateData.activo,
      ],
    };

    const result = await WriteQuery.execute(query);

    // Verificar que la operacion fue exitosa
    if (!result.success) {
      throw new Error(result.error || "Error al actualizar organización");
    }

    if (!result.data || result.data.length === 0) {
      return null;
    }

    const updatedData = result.data[0] as OrganizacionData;
    return Organizacion.fromDatabase(updatedData);
  }

  // Elimina (desactiva) una organizacion
  // Solo si no tiene productores asociados
  async delete(id: string): Promise<boolean> {
    const organizacion = await this.findById(id);
    if (!organizacion) {
      throw new Error("Organización no encontrada");
    }

    const validacion = organizacion.puedeDesactivar();
    if (!validacion.valid) {
      throw new Error(validacion.error!);
    }

    const query = {
      text: `
        UPDATE organizaciones
        SET activo = false
        WHERE id_organizacion = $1
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
          FROM organizaciones
          WHERE id_organizacion = $1 AND activo = true
        ) as exists
      `,
      values: [id],
    };

    const result = await ReadQuery.findOne<{ exists: boolean }>(query);
    return result?.exists ?? false;
  }

  // Cuenta total de organizaciones activas
  async count(): Promise<number> {
    const query = {
      text: `
        SELECT COUNT(*) as count
        FROM organizaciones
        WHERE activo = true
      `,
      values: [],
    };

    const result = await ReadQuery.findOne<{ count: string }>(query);
    return parseInt(result?.count ?? "0", 10);
  }
}
