import { ReadQuery, WriteQuery } from "../config/connection.js";
import { Rol, RolData } from "../entities/Rol.js";

export class RolRepository {
  /**
   * Encuentra rol por ID
   * Solo roles activos
   */
  async findById(id: string): Promise<Rol | null> {
    const query = {
      name: "find-rol-by-id",
      text: `
        SELECT 
          id_rol,
          nombre_rol,
          descripcion,
          permisos,
          activo
        FROM roles
        WHERE id_rol = $1 AND activo = true
      `,
      values: [id],
    };

    const result = await ReadQuery.findOne<RolData>(query);
    return result ? Rol.fromDatabase(result) : null;
  }

  /**
   * Encuentra rol por nombre
   * Usado en login/auth para verificar permisos
   */
  async findByNombre(nombre: string): Promise<Rol | null> {
    const query = {
      name: "find-rol-by-nombre",
      text: `
        SELECT 
          id_rol,
          nombre_rol,
          descripcion,
          permisos,
          activo
        FROM roles
        WHERE LOWER(nombre_rol) = LOWER($1) AND activo = true
      `,
      values: [nombre],
    };

    const result = await ReadQuery.findOne<RolData>(query);
    return result ? Rol.fromDatabase(result) : null;
  }

  /**
   * Lista todos los roles activos
   * Ordenados alfabéticamente para UI
   */
  async findAll(): Promise<Rol[]> {
    const query = {
      name: "find-all-roles-activos",
      text: `
        SELECT 
          id_rol,
          nombre_rol,
          descripcion,
          permisos,
          activo
        FROM roles
        WHERE activo = true
        ORDER BY nombre_rol ASC
      `,
      values: [],
    };

    const results = await ReadQuery.execute<RolData>(query);
    return results.map((data) => Rol.fromDatabase(data));
  }

  /**
   * Verifica si existe un rol con el nombre dado
   * Usado para evitar duplicados
   */
  async existsByNombre(nombre: string): Promise<boolean> {
    const query = {
      text: `
        SELECT EXISTS(
          SELECT 1 
          FROM roles 
          WHERE LOWER(nombre_rol) = LOWER($1)
        ) as exists
      `,
      values: [nombre],
    };

    const result = await ReadQuery.findOne<{ exists: boolean }>(query);
    return result?.exists ?? false;
  }

  /**
   * Crea un nuevo rol
   * Retorna el rol creado con el ID generado
   */
  async create(rol: Rol): Promise<Rol> {
    const validation = rol.validate();
    if (!validation.valid) {
      throw new Error(`Validación falló: ${validation.errors.join(", ")}`);
    }

    // Verificar duplicados
    const existe = await this.existsByNombre(rol.nombre);
    if (existe) {
      throw new Error(`Ya existe un rol con el nombre "${rol.nombre}"`);
    }

    const insertData = rol.toDatabaseInsert();

    const query = {
      text: `
        INSERT INTO roles (
          nombre_rol,
          descripcion,
          permisos,
          activo
        ) VALUES ($1, $2, $3, $4)
        RETURNING 
          id_rol,
          nombre_rol,
          descripcion,
          permisos,
          activo
      `,
      values: [
        insertData.nombre_rol,
        insertData.descripcion,
        JSON.stringify(insertData.permisos),
        insertData.activo,
      ],
    };

    const result = await WriteQuery.insert<RolData>(query);
    if (!result.success || !result.data) {
      throw new Error(result.error || "Error al crear rol");
    }

    return Rol.fromDatabase(result.data);
  }

  /**
   * Actualiza un rol existente
   * Solo actualiza campos modificables
   */
  async update(id: string, rol: Rol): Promise<Rol> {
    const validation = rol.validate();
    if (!validation.valid) {
      throw new Error(`Validación falló: ${validation.errors.join(", ")}`);
    }

    const updateData = rol.toDatabaseUpdate();

    const query = {
      text: `
        UPDATE roles
        SET 
          descripcion = $2,
          permisos = $3,
          activo = $4
        WHERE id_rol = $1 AND activo = true
        RETURNING 
          id_rol,
          nombre_rol,
          descripcion,
          permisos,
          activo
      `,
      values: [
        id,
        updateData.descripcion,
        JSON.stringify(updateData.permisos),
        updateData.activo,
      ],
    };

    const result = await WriteQuery.update<RolData>(query);
    if (!result.success || !result.data || result.data.length === 0) {
      throw new Error(result.error || "Rol no encontrado o ya inactivo");
    }

    return Rol.fromDatabase(result.data[0]);
  }

  /**
   * Desactiva un rol (soft delete)
   * No se puede desactivar si hay usuarios con ese rol
   */
  async softDelete(id: string): Promise<void> {
    // Verificar si hay usuarios con este rol
    const checkQuery = {
      text: `
        SELECT COUNT(*) as count
        FROM usuarios
        WHERE id_rol = $1 AND activo = true
      `,
      values: [id],
    };

    const countResult = await ReadQuery.findOne<{ count: string }>(checkQuery);
    const usuariosCount = parseInt(countResult?.count || "0", 10);

    if (usuariosCount > 0) {
      throw new Error(
        `No se puede desactivar el rol. Tiene ${usuariosCount} usuario(s) asignado(s)`
      );
    }

    const query = {
      text: `
        UPDATE roles
        SET activo = false
        WHERE id_rol = $1 AND activo = true
      `,
      values: [id],
    };

    const result = await WriteQuery.execute(query);
    if (!result.success) {
      throw new Error(result.error || "Error al desactivar rol");
    }

    if (result.affectedRows === 0) {
      throw new Error("Rol no encontrado o ya inactivo");
    }
  }

  /**
   * Obtiene los 5 roles del sistema
   * Para seed/verificación inicial
   */
  async findAllSystemRoles(): Promise<Rol[]> {
    const query = {
      text: `
        SELECT 
          id_rol,
          nombre_rol,
          descripcion,
          permisos,
          activo
        FROM roles
        WHERE nombre_rol IN ('administrador', 'gerente', 'tecnico', 'invitado', 'productor')
        ORDER BY 
          CASE nombre_rol
            WHEN 'administrador' THEN 1
            WHEN 'gerente' THEN 2
            WHEN 'tecnico' THEN 3
            WHEN 'invitado' THEN 4
            WHEN 'productor' THEN 5
          END
      `,
      values: [],
    };

    const results = await ReadQuery.execute<RolData>(query);
    return results.map((data) => Rol.fromDatabase(data));
  }
}
