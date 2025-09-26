import { ReadQuery, WriteQuery } from "../config/connection.js";
import { Gestion, GestionData } from "../entities/Gestion.js";

export class GestionRepository {
  /**
   * Lista todas las gestiones
   * Con opción de filtrar por activas
   */
  async findAll(soloActivas: boolean = true): Promise<Gestion[]> {
    const query = {
      name: "find-all-gestiones",
      text: `
        SELECT 
          id_gestion,
          anio_gestion,
          nombre_gestion,
          activo,
          created_at
        FROM gestiones
        ${soloActivas ? "WHERE activo = true" : ""}
        ORDER BY anio_gestion DESC
      `,
      values: [],
    };

    const results = await ReadQuery.execute<GestionData>(query);
    return results.map((data) => Gestion.fromDatabase(data));
  }

  /**
   * Encuentra gestión por ID
   */
  async findById(id: string): Promise<Gestion | null> {
    const query = {
      name: "find-gestion-by-id",
      text: `
        SELECT 
          id_gestion,
          anio_gestion,
          nombre_gestion,
          activo,
          created_at
        FROM gestiones
        WHERE id_gestion = $1
      `,
      values: [id],
    };

    const result = await ReadQuery.findOne<GestionData>(query);
    return result ? Gestion.fromDatabase(result) : null;
  }

  /**
   * Busca gestión por año
   */
  async findByAnio(anio: number): Promise<Gestion | null> {
    const query = {
      text: `
        SELECT 
          id_gestion,
          anio_gestion,
          nombre_gestion,
          activo,
          created_at
        FROM gestiones
        WHERE anio_gestion = $1
      `,
      values: [anio],
    };

    const result = await ReadQuery.findOne<GestionData>(query);
    return result ? Gestion.fromDatabase(result) : null;
  }

  /**
   * Verifica si existe gestión con el año
   */
  async existsByAnio(anio: number): Promise<boolean> {
    const query = {
      text: `
        SELECT EXISTS(
          SELECT 1 
          FROM gestiones 
          WHERE anio_gestion = $1
        ) as exists
      `,
      values: [anio],
    };

    const result = await ReadQuery.findOne<{ exists: boolean }>(query);
    return result?.exists ?? false;
  }

  /**
   * Obtiene la gestión actual (año actual)
   */
  async findActual(): Promise<Gestion | null> {
    const anioActual = new Date().getFullYear();
    return this.findByAnio(anioActual);
  }

  /**
   * Obtiene gestiones futuras
   */
  async findFuturas(): Promise<Gestion[]> {
    const anioActual = new Date().getFullYear();

    const query = {
      text: `
        SELECT 
          id_gestion,
          anio_gestion,
          nombre_gestion,
          activo,
          created_at
        FROM gestiones
        WHERE anio_gestion > $1 AND activo = true
        ORDER BY anio_gestion ASC
      `,
      values: [anioActual],
    };

    const results = await ReadQuery.execute<GestionData>(query);
    return results.map((data) => Gestion.fromDatabase(data));
  }

  /**
   * Crea una nueva gestión
   */
  async create(gestion: Gestion): Promise<Gestion> {
    const validation = gestion.validate();
    if (!validation.valid) {
      throw new Error(`Validación falló: ${validation.errors.join(", ")}`);
    }

    // Verificar duplicados
    const existe = await this.existsByAnio(gestion.anio);
    if (existe) {
      throw new Error(`Ya existe una gestión para el año ${gestion.anio}`);
    }

    const insertData = gestion.toDatabaseInsert();

    const query = {
      text: `
        INSERT INTO gestiones (
          anio_gestion,
          nombre_gestion,
          activo
        ) VALUES ($1, $2, $3)
        RETURNING 
          id_gestion,
          anio_gestion,
          nombre_gestion,
          activo,
          created_at
      `,
      values: [
        insertData.anio_gestion,
        insertData.nombre_gestion,
        insertData.activo,
      ],
    };

    const result = await WriteQuery.insert<GestionData>(query);
    if (!result.success || !result.data) {
      throw new Error(result.error || "Error al crear gestión");
    }

    return Gestion.fromDatabase(result.data);
  }

  /**
   * Actualiza una gestión existente
   */
  async update(id: string, gestion: Gestion): Promise<Gestion> {
    const validation = gestion.validate();
    if (!validation.valid) {
      throw new Error(`Validación falló: ${validation.errors.join(", ")}`);
    }

    const updateData = gestion.toDatabaseUpdate();
    const query = {
      text: `
        UPDATE gestiones
        SET 
          nombre_gestion = COALESCE($2, nombre_gestion),
          activo = COALESCE($3, activo)
        WHERE id_gestion = $1
        RETURNING 
          id_gestion,
          anio_gestion,
          nombre_gestion,
          activo,
          created_at
      `,
      values: [id, updateData.nombre_gestion, updateData.activo],
    };

    const result = await WriteQuery.execute(query);
    if (!result.success || result.affectedRows === 0) {
      throw new Error(result.error || "Gestión no encontrada");
    }

    const gestionActualizada = await this.findById(id);
    if (!gestionActualizada) {
      throw new Error("Gestión actualizada pero no se pudo recuperar");
    }

    return gestionActualizada;
  }

  /**
   * Desactiva una gestión (soft delete)
   */
  async softDelete(id: string): Promise<void> {
    const gestion = await this.findById(id);
    if (!gestion) {
      throw new Error("Gestión no encontrada");
    }

    const validacion = gestion.puedeDesactivar();
    if (!validacion.valid) {
      throw new Error(validacion.error);
    }

    const query = {
      text: `
        UPDATE gestiones
        SET activo = false
        WHERE id_gestion = $1
      `,
      values: [id],
    };

    const result = await WriteQuery.execute(query);
    if (!result.success) {
      throw new Error(result.error || "Error al desactivar gestión");
    }

    if (result.affectedRows === 0) {
      throw new Error("Gestión no encontrada");
    }
  }

  /**
   * Cuenta gestiones
   */
  async count(soloActivas: boolean = true): Promise<number> {
    const query = {
      text: `
        SELECT COUNT(*) as count
        FROM gestiones
        ${soloActivas ? "WHERE activo = true" : ""}
      `,
      values: [],
    };

    const result = await ReadQuery.findOne<{ count: string }>(query);
    return parseInt(result?.count || "0", 10);
  }
}
