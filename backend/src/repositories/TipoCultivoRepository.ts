import { randomUUID } from "crypto";
import { ReadQuery, WriteQuery } from "../config/connection.js";
import { TipoCultivo, TipoCultivoData } from "../entities/TipoCultivo.js";

export class TipoCultivoRepository {
  // Lista todos los tipos de cultivo
  // Con opcion de filtrar por activos
  async findAll(soloActivos: boolean = true): Promise<TipoCultivo[]> {
    const query = {
      name: "find-all-tipos-cultivo",
      text: `
        SELECT 
          id_tipo_cultivo,
          nombre_cultivo,
          descripcion,
          es_principal_certificable,
          rendimiento_promedio_qq_ha,
          activo
        FROM tipos_cultivo
        ${soloActivos ? "WHERE activo = true" : ""}
        ORDER BY nombre_cultivo ASC
      `,
      values: [],
    };

    const results = await ReadQuery.execute<TipoCultivoData>(query);
    return results.map((data) => TipoCultivo.fromDatabase(data));
  }

  // Encuentra tipo cultivo por ID
  async findById(id: string): Promise<TipoCultivo | null> {
    const query = {
      name: "find-tipo-cultivo-by-id",
      text: `
        SELECT 
          id_tipo_cultivo,
          nombre_cultivo,
          descripcion,
          es_principal_certificable,
          rendimiento_promedio_qq_ha,
          activo
        FROM tipos_cultivo
        WHERE id_tipo_cultivo = $1
      `,
      values: [id],
    };

    const result = await ReadQuery.findOne<TipoCultivoData>(query);
    return result ? TipoCultivo.fromDatabase(result) : null;
  }

  // Busca tipo cultivo por nombre (case-insensitive)
  async findByNombre(nombre: string): Promise<TipoCultivo | null> {
    const query = {
      text: `
        SELECT 
          id_tipo_cultivo,
          nombre_cultivo,
          descripcion,
          es_principal_certificable,
          rendimiento_promedio_qq_ha,
          activo
        FROM tipos_cultivo
        WHERE LOWER(nombre_cultivo) = LOWER($1)
      `,
      values: [nombre],
    };

    const result = await ReadQuery.findOne<TipoCultivoData>(query);
    return result ? TipoCultivo.fromDatabase(result) : null;
  }

  // Verifica si existe tipo cultivo con el nombre
  async existsByNombre(nombre: string): Promise<boolean> {
    const query = {
      text: `
        SELECT EXISTS(
          SELECT 1 
          FROM tipos_cultivo 
          WHERE LOWER(nombre_cultivo) = LOWER($1)
        ) as exists
      `,
      values: [nombre],
    };

    const result = await ReadQuery.findOne<{ exists: boolean }>(query);
    return result?.exists ?? false;
  }

  // Crea un nuevo tipo cultivo
  async create(tipoCultivo: TipoCultivo): Promise<TipoCultivo> {
    const validation = tipoCultivo.validate();
    if (!validation.valid) {
      throw new Error(`Validacion fallo: ${validation.errors.join(", ")}`);
    }

    // Verificar duplicados
    const existe = await this.existsByNombre(tipoCultivo.nombre);
    if (existe) {
      throw new Error(`Ya existe un tipo cultivo "${tipoCultivo.nombre}"`);
    }

    const insertData = tipoCultivo.toDatabaseInsert();
    const idTipoCultivo = randomUUID();

    const query = {
      text: `
        INSERT INTO tipos_cultivo (
          id_tipo_cultivo,
          nombre_cultivo,
          descripcion,
          es_principal_certificable,
          rendimiento_promedio_qq_ha,
          activo
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING 
          id_tipo_cultivo,
          nombre_cultivo,
          descripcion,
          es_principal_certificable,
          rendimiento_promedio_qq_ha,
          activo
      `,
      values: [
        idTipoCultivo,
        insertData.nombre_cultivo,
        insertData.descripcion,
        insertData.es_principal_certificable,
        insertData.rendimiento_promedio_qq_ha,
        insertData.activo,
      ],
    };

    const result = await WriteQuery.insert<TipoCultivoData>(query);
    if (!result.success || !result.data) {
      throw new Error(result.error || "Error al crear tipo cultivo");
    }

    return TipoCultivo.fromDatabase(result.data);
  }

  // Actualiza un tipo cultivo existente
  async update(id: string, tipoCultivo: TipoCultivo): Promise<TipoCultivo> {
    const validation = tipoCultivo.validate();
    if (!validation.valid) {
      throw new Error(`Validacion fallo: ${validation.errors.join(", ")}`);
    }

    const updateData = tipoCultivo.toDatabaseUpdate();
    const query = {
      text: `
        UPDATE tipos_cultivo
        SET 
          nombre_cultivo = COALESCE($2, nombre_cultivo),
          descripcion = COALESCE($3, descripcion),
          es_principal_certificable = COALESCE($4, es_principal_certificable),
          rendimiento_promedio_qq_ha = COALESCE($5, rendimiento_promedio_qq_ha),
          activo = COALESCE($6, activo)
        WHERE id_tipo_cultivo = $1
        RETURNING 
          id_tipo_cultivo,
          nombre_cultivo,
          descripcion,
          es_principal_certificable,
          rendimiento_promedio_qq_ha,
          activo
      `,
      values: [
        id,
        updateData.nombre_cultivo,
        updateData.descripcion,
        updateData.es_principal_certificable,
        updateData.rendimiento_promedio_qq_ha,
        updateData.activo,
      ],
    };

    const result = await WriteQuery.execute(query);
    if (!result.success || result.affectedRows === 0) {
      throw new Error(result.error || "Tipo cultivo no encontrado");
    }

    const tipoCultivoActualizado = await this.findById(id);
    if (!tipoCultivoActualizado) {
      throw new Error("Tipo cultivo actualizado pero no se pudo recuperar");
    }

    return tipoCultivoActualizado;
  }

  // Desactiva un tipo cultivo (soft delete)
  async softDelete(id: string): Promise<void> {
    const tipoCultivo = await this.findById(id);
    if (!tipoCultivo) {
      throw new Error("Tipo cultivo no encontrado");
    }

    const validacion = tipoCultivo.puedeDesactivar();
    if (!validacion.valid) {
      throw new Error(validacion.error);
    }

    const query = {
      text: `
        UPDATE tipos_cultivo
        SET activo = false
        WHERE id_tipo_cultivo = $1
      `,
      values: [id],
    };

    const result = await WriteQuery.execute(query);
    if (!result.success) {
      throw new Error(result.error || "Error al desactivar tipo cultivo");
    }

    if (result.affectedRows === 0) {
      throw new Error("Tipo cultivo no encontrado");
    }
  }

  // Cuenta tipos de cultivo
  async count(soloActivos: boolean = true): Promise<number> {
    const query = {
      text: `
        SELECT COUNT(*) as count
        FROM tipos_cultivo
        ${soloActivos ? "WHERE activo = true" : ""}
      `,
      values: [],
    };

    const result = await ReadQuery.findOne<{ count: string }>(query);
    return parseInt(result?.count || "0", 10);
  }
}
