import { ReadQuery, WriteQuery } from "../config/connection.js";
import { Usuario, UsuarioData } from "../entities/Usuario.js";

export class UsuarioRepository {
  /**
   * Encuentra usuario por ID
   * JOIN con roles y comunidades para info completa
   */
  async findById(id: string): Promise<Usuario | null> {
    const query = {
      name: "find-usuario-by-id",
      text: `
        SELECT 
          u.id_usuario,
          u.username,
          u.email,
          u.password_hash,
          u.nombre_completo,
          u.id_rol,
          u.id_comunidad,
          u.activo,
          u.last_login,
          u.created_at,
          u.updated_at,
          r.nombre_rol,
          c.nombre_comunidad,
          m.nombre_municipio,
          p.nombre_provincia
        FROM usuarios u
        INNER JOIN roles r ON u.id_rol = r.id_rol
        LEFT JOIN comunidades c ON u.id_comunidad = c.id_comunidad
        LEFT JOIN municipios m ON c.id_municipio = m.id_municipio
        LEFT JOIN provincias p ON m.id_provincia = p.id_provincia
        WHERE u.id_usuario = $1 AND u.activo = true
      `,
      values: [id],
    };

    const result = await ReadQuery.findOne<UsuarioData>(query);
    return result ? Usuario.fromDatabase(result) : null;
  }

  /**
   * Encuentra usuario por username
   * Usado en login - query crítica optimizada
   */
  async findByUsername(username: string): Promise<Usuario | null> {
    const query = {
      name: "find-usuario-by-username",
      text: `
        SELECT 
          u.id_usuario,
          u.username,
          u.email,
          u.password_hash,
          u.nombre_completo,
          u.id_rol,
          u.id_comunidad,
          u.activo,
          u.last_login,
          u.created_at,
          u.updated_at,
          r.nombre_rol,
          c.nombre_comunidad
        FROM usuarios u
        INNER JOIN roles r ON u.id_rol = r.id_rol
        LEFT JOIN comunidades c ON u.id_comunidad = c.id_comunidad
        WHERE LOWER(u.username) = LOWER($1) AND u.activo = true
      `,
      values: [username],
    };

    const result = await ReadQuery.findOne<UsuarioData>(query);
    return result ? Usuario.fromDatabase(result) : null;
  }

  /**
   * Encuentra usuario por email
   * Usado para verificar duplicados
   */
  async findByEmail(email: string): Promise<Usuario | null> {
    const query = {
      name: "find-usuario-by-email",
      text: `
        SELECT 
          u.id_usuario,
          u.username,
          u.email,
          u.password_hash,
          u.nombre_completo,
          u.id_rol,
          u.id_comunidad,
          u.activo,
          u.last_login,
          u.created_at,
          u.updated_at,
          r.nombre_rol
        FROM usuarios u
        INNER JOIN roles r ON u.id_rol = r.id_rol
        WHERE LOWER(u.email) = LOWER($1) AND u.activo = true
      `,
      values: [email],
    };

    const result = await ReadQuery.findOne<UsuarioData>(query);
    return result ? Usuario.fromDatabase(result) : null;
  }

  /**
   * Lista usuarios por comunidad
   * Usado para ver técnicos asignados a una comunidad
   */
  async findByComunidad(comunidadId: string): Promise<Usuario[]> {
    const query = {
      name: "find-usuarios-by-comunidad",
      text: `
        SELECT 
          u.id_usuario,
          u.username,
          u.email,
          u.password_hash,
          u.nombre_completo,
          u.id_rol,
          u.id_comunidad,
          u.activo,
          u.last_login,
          u.created_at,
          u.updated_at,
          r.nombre_rol,
          c.nombre_comunidad
        FROM usuarios u
        INNER JOIN roles r ON u.id_rol = r.id_rol
        INNER JOIN comunidades c ON u.id_comunidad = c.id_comunidad
        WHERE u.id_comunidad = $1 AND u.activo = true
        ORDER BY u.nombre_completo ASC
      `,
      values: [comunidadId],
    };

    const results = await ReadQuery.execute<UsuarioData>(query);
    return results.map((data) => Usuario.fromDatabase(data));
  }

  /**
   * Lista todos los usuarios
   * Con filtros opcionales por rol y estado activo
   */
  async findAll(rolNombre?: string, activo?: boolean): Promise<Usuario[]> {
    let queryText = `
      SELECT
        u.id_usuario,
        u.username,
        u.email,
        u.password_hash,
        u.nombre_completo,
        u.id_rol,
        u.id_comunidad,
        u.activo,
        u.last_login,
        u.created_at,
        u.updated_at,
        r.nombre_rol,
        c.nombre_comunidad
      FROM usuarios u
      INNER JOIN roles r ON u.id_rol = r.id_rol
      LEFT JOIN comunidades c ON u.id_comunidad = c.id_comunidad
      WHERE 1=1
    `;

    const values: any[] = [];
    let paramCount = 0;

    // Filtrar por estado activo si se especifica
    if (activo !== undefined) {
      paramCount++;
      queryText += ` AND u.activo = $${paramCount}`;
      values.push(activo);
    }

    // Filtrar por rol si se especifica
    if (rolNombre) {
      paramCount++;
      queryText += ` AND LOWER(r.nombre_rol) = LOWER($${paramCount})`;
      values.push(rolNombre);
    }

    queryText += ` ORDER BY u.created_at DESC`;

    const query = {
      text: queryText,
      values,
    };

    const results = await ReadQuery.execute<UsuarioData>(query);
    return results.map((data) => Usuario.fromDatabase(data));
  }

  /**
   * Verifica si existe username
   * Para evitar duplicados
   */
  async existsByUsername(username: string): Promise<boolean> {
    const query = {
      text: `
        SELECT EXISTS(
          SELECT 1 
          FROM usuarios 
          WHERE LOWER(username) = LOWER($1)
        ) as exists
      `,
      values: [username],
    };

    const result = await ReadQuery.findOne<{ exists: boolean }>(query);
    return result?.exists ?? false;
  }

  /**
   * Verifica si existe email
   * Para evitar duplicados
   */
  async existsByEmail(email: string): Promise<boolean> {
    const query = {
      text: `
        SELECT EXISTS(
          SELECT 1 
          FROM usuarios 
          WHERE LOWER(email) = LOWER($1)
        ) as exists
      `,
      values: [email],
    };

    const result = await ReadQuery.findOne<{ exists: boolean }>(query);
    return result?.exists ?? false;
  }

  /**
   * Crea un nuevo usuario
   * Retorna usuario creado con datos enriquecidos
   */
  async create(usuario: Usuario): Promise<Usuario> {
    const validation = usuario.validate();
    if (!validation.valid) {
      throw new Error(`Validación falló: ${validation.errors.join(", ")}`);
    }

    // Verificar duplicados
    const existeUsername = await this.existsByUsername(usuario.username);
    if (existeUsername) {
      throw new Error(
        `Ya existe un usuario con el username "${usuario.username}"`
      );
    }

    const existeEmail = await this.existsByEmail(usuario.email);
    if (existeEmail) {
      throw new Error(`Ya existe un usuario con el email "${usuario.email}"`);
    }

    const insertData = usuario.toDatabaseInsert();

    const query = {
      text: `
        INSERT INTO usuarios (
          username,
          email,
          password_hash,
          nombre_completo,
          id_rol,
          id_comunidad,
          activo,
          last_login
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING 
          id_usuario,
          username,
          email,
          password_hash,
          nombre_completo,
          id_rol,
          id_comunidad,
          activo,
          last_login,
          created_at,
          updated_at
      `,
      values: [
        insertData.username,
        insertData.email,
        insertData.password_hash,
        insertData.nombre_completo,
        insertData.id_rol,
        insertData.id_comunidad,
        insertData.activo,
        insertData.last_login,
      ],
    };

    const result = await WriteQuery.insert<UsuarioData>(query);
    if (!result.success || !result.data) {
      throw new Error(result.error || "Error al crear usuario");
    }

    // Obtener usuario con JOINs para retornar data completa
    const usuarioCreado = await this.findById(result.data.id_usuario);
    if (!usuarioCreado) {
      throw new Error("Usuario creado pero no se pudo recuperar");
    }

    return usuarioCreado;
  }

  /**
   * Actualiza un usuario existente
   * Solo campos modificables
   */
  async update(id: string, usuario: Usuario): Promise<Usuario> {
    const validation = usuario.validate();
    if (!validation.valid) {
      throw new Error(`Validación falló: ${validation.errors.join(", ")}`);
    }

    const updateData = usuario.toDatabaseUpdate();

    const query = {
      text: `
        UPDATE usuarios
        SET 
          email = $2,
          nombre_completo = $3,
          id_comunidad = $4,
          activo = $5,
          updated_at = CURRENT_TIMESTAMP
        WHERE id_usuario = $1 AND activo = true
        RETURNING id_usuario
      `,
      values: [
        id,
        updateData.email,
        updateData.nombre_completo,
        updateData.id_comunidad,
        updateData.activo,
      ],
    };

    const result = await WriteQuery.execute(query);
    if (!result.success || result.affectedRows === 0) {
      throw new Error(result.error || "Usuario no encontrado o ya inactivo");
    }

    // Retornar usuario actualizado con JOINs
    const usuarioActualizado = await this.findById(id);
    if (!usuarioActualizado) {
      throw new Error("Usuario actualizado pero no se pudo recuperar");
    }

    return usuarioActualizado;
  }

  /**
   * Actualiza last_login timestamp
   * Query optimizada - solo actualiza un campo
   */
  async updateLastLogin(id: string): Promise<void> {
    const query = {
      name: "update-usuario-last-login",
      text: `
        UPDATE usuarios
        SET 
          last_login = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id_usuario = $1
      `,
      values: [id],
    };

    const result = await WriteQuery.execute(query);
    if (!result.success) {
      throw new Error(result.error || "Error al actualizar last_login");
    }
  }

  /**
   * Desactiva un usuario (soft delete)
   */
  async softDelete(id: string): Promise<void> {
    const query = {
      text: `
        UPDATE usuarios
        SET 
          activo = false,
          updated_at = CURRENT_TIMESTAMP
        WHERE id_usuario = $1 AND activo = true
      `,
      values: [id],
    };

    const result = await WriteQuery.execute(query);
    if (!result.success) {
      throw new Error(result.error || "Error al desactivar usuario");
    }

    if (result.affectedRows === 0) {
      throw new Error("Usuario no encontrado o ya inactivo");
    }
  }

  /**
   * Cuenta usuarios por rol
   * Usado para estadísticas
   */
  async countByRol(rolNombre: string): Promise<number> {
    const query = {
      text: `
        SELECT COUNT(*) as count
        FROM usuarios u
        INNER JOIN roles r ON u.id_rol = r.id_rol
        WHERE LOWER(r.nombre_rol) = LOWER($1) AND u.activo = true
      `,
      values: [rolNombre],
    };

    const result = await ReadQuery.findOne<{ count: string }>(query);
    return parseInt(result?.count || "0", 10);
  }

  /**
   * Cuenta técnicos por comunidad
   * Para validar asignaciones
   */
  async countTecnicosByComunidad(comunidadId: string): Promise<number> {
    const query = {
      text: `
        SELECT COUNT(*) as count
        FROM usuarios u
        INNER JOIN roles r ON u.id_rol = r.id_rol
        WHERE u.id_comunidad = $1 
          AND LOWER(r.nombre_rol) = 'tecnico'
          AND u.activo = true
      `,
      values: [comunidadId],
    };

    const result = await ReadQuery.findOne<{ count: string }>(query);
    return parseInt(result?.count || "0", 10);
  }
}
