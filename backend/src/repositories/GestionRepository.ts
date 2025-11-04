import { ReadQuery, WriteQuery } from "../config/connection.js";
import { Gestion, GestionData } from "../entities/Gestion.js";

export class GestionRepository {
  // Lista todas las gestiones
  // Con opcion de filtrar por activas
  async findAll(soloActivas: boolean = true): Promise<Gestion[]> {
    const query = {
      name: "find-all-gestiones",
      text: `
        SELECT
          id_gestion,
          anio_gestion,
          activa,
          activo_sistema
        FROM gestiones
        ${soloActivas ? "WHERE activa = true" : ""}
        ORDER BY anio_gestion DESC
      `,
      values: [],
    };

    const results = await ReadQuery.execute<GestionData>(query);
    return results.map((data) => Gestion.fromDatabase(data));
  }

  // Encuentra gestion por ID
  async findById(id: string): Promise<Gestion | null> {
    const query = {
      name: "find-gestion-by-id",
      text: `
        SELECT
          id_gestion,
          anio_gestion,
          activa,
          activo_sistema
        FROM gestiones
        WHERE id_gestion = $1
      `,
      values: [id],
    };

    const result = await ReadQuery.findOne<GestionData>(query);
    return result ? Gestion.fromDatabase(result) : null;
  }

  // Busca gestion por año
  async findByAnio(anio: number): Promise<Gestion | null> {
    const query = {
      text: `
        SELECT
          id_gestion,
          anio_gestion,
          activa,
          activo_sistema
        FROM gestiones
        WHERE anio_gestion = $1
      `,
      values: [anio],
    };

    const result = await ReadQuery.findOne<GestionData>(query);
    return result ? Gestion.fromDatabase(result) : null;
  }

  // Verifica si existe gestion con el año
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

  // Obtiene la gestion actual (año actual)
  async findActual(): Promise<Gestion | null> {
    const anioActual = new Date().getFullYear();
    return this.findByAnio(anioActual);
  }

  // Obtiene gestiones futuras
  async findFuturas(): Promise<Gestion[]> {
    const anioActual = new Date().getFullYear();

    const query = {
      text: `
        SELECT
          id_gestion,
          anio_gestion,
          activa,
          activo_sistema
        FROM gestiones
        WHERE anio_gestion > $1 AND activa = true
        ORDER BY anio_gestion ASC
      `,
      values: [anioActual],
    };

    const results = await ReadQuery.execute<GestionData>(query);
    return results.map((data) => Gestion.fromDatabase(data));
  }

  // Crea una nueva gestion
  async create(gestion: Gestion): Promise<Gestion> {
    const validation = gestion.validate();
    if (!validation.valid) {
      throw new Error(`Validacion fallo: ${validation.errors.join(", ")}`);
    }

    // Verificar duplicados
    const existe = await this.existsByAnio(gestion.anio);
    if (existe) {
      throw new Error(`Ya existe una gestion para el año ${gestion.anio}`);
    }

    const insertData = gestion.toDatabaseInsert();

    const query = {
      text: `
        INSERT INTO gestiones (
          anio_gestion,
          activa,
          activo_sistema
        ) VALUES ($1, $2, $3)
        RETURNING
          id_gestion,
          anio_gestion,
          activa,
          activo_sistema
      `,
      values: [
        insertData.anio_gestion,
        insertData.activa,
        insertData.activo_sistema,
      ],
    };

    const result = await WriteQuery.insert<GestionData>(query);
    if (!result.success || !result.data) {
      throw new Error(result.error || "Error al crear gestion");
    }

    return Gestion.fromDatabase(result.data);
  }

  // Actualiza una gestion existente
  async update(id: string, gestion: Gestion): Promise<Gestion> {
    const validation = gestion.validate();
    if (!validation.valid) {
      throw new Error(`Validacion fallo: ${validation.errors.join(", ")}`);
    }

    const updateData = gestion.toDatabaseUpdate();
    const query = {
      text: `
        UPDATE gestiones
        SET
          activa = COALESCE($2, activa),
          activo_sistema = COALESCE($3, activo_sistema)
        WHERE id_gestion = $1
        RETURNING
          id_gestion,
          anio_gestion,
          activa,
          activo_sistema
      `,
      values: [
        id,
        updateData.activa,
        updateData.activo_sistema,
      ],
    };

    const result = await WriteQuery.execute(query);
    if (!result.success || result.affectedRows === 0) {
      throw new Error(result.error || "Gestion no encontrada");
    }

    const gestionActualizada = await this.findById(id);
    if (!gestionActualizada) {
      throw new Error("Gestion actualizada pero no se pudo recuperar");
    }

    return gestionActualizada;
  }

  // Desactiva una gestion (soft delete)
  async softDelete(id: string): Promise<void> {
    const gestion = await this.findById(id);
    if (!gestion) {
      throw new Error("Gestion no encontrada");
    }

    const validacion = gestion.puedeDesactivar();
    if (!validacion.valid) {
      throw new Error(validacion.error);
    }

    const query = {
      text: `
        UPDATE gestiones
        SET activa = false
        WHERE id_gestion = $1
      `,
      values: [id],
    };

    const result = await WriteQuery.execute(query);
    if (!result.success) {
      throw new Error(result.error || "Error al desactivar gestion");
    }

    if (result.affectedRows === 0) {
      throw new Error("Gestion no encontrada");
    }
  }

  // Cuenta gestiones
  async count(soloActivas: boolean = true): Promise<number> {
    const query = {
      text: `
        SELECT COUNT(*) as count
        FROM gestiones
        ${soloActivas ? "WHERE activa = true" : ""}
      `,
      values: [],
    };

    const result = await ReadQuery.findOne<{ count: string }>(query);
    return parseInt(result?.count || "0", 10);
  }

  // Obtiene la gestion activa del sistema
  async getGestionActiva(): Promise<Gestion | null> {
    const query = {
      name: "get-gestion-activa-sistema",
      text: `
        SELECT
          id_gestion,
          anio_gestion,
          activa,
          activo_sistema
        FROM gestiones
        WHERE activo_sistema = true
        LIMIT 1
      `,
      values: [],
    };

    const result = await ReadQuery.findOne<GestionData>(query);
    return result ? Gestion.fromDatabase(result) : null;
  }

  // Establece una gestion como activa del sistema
  // Automaticamente desactiva las demas
  async setGestionActiva(id: string): Promise<Gestion> {
    const gestion = await this.findById(id);
    if (!gestion) {
      throw new Error("Gestion no encontrada");
    }

    // Desactivar todas las gestiones
    const desactivarQuery = {
      text: `
        UPDATE gestiones
        SET activo_sistema = false
        WHERE activo_sistema = true
      `,
      values: [],
    };

    await WriteQuery.execute(desactivarQuery);

    // Activar la gestion seleccionada
    const activarQuery = {
      text: `
        UPDATE gestiones
        SET activo_sistema = true
        WHERE id_gestion = $1
        RETURNING
          id_gestion,
          anio_gestion,
          activa,
          activo_sistema
      `,
      values: [id],
    };

    const result = await WriteQuery.execute(activarQuery);
    if (!result.success || result.affectedRows === 0) {
      throw new Error("Error al establecer gestion activa");
    }

    const gestionActualizada = await this.findById(id);
    if (!gestionActualizada) {
      throw new Error("Gestion actualizada pero no se pudo recuperar");
    }

    return gestionActualizada;
  }
}
