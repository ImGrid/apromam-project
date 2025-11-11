import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { RolRepository } from "../repositories/RolRepository.js";
import { Usuario } from "../entities/Usuario.js";
import { hashPassword } from "../utils/hash.utils.js";
import { createAuthLogger } from "../utils/logger.js";
import {
  canManageUser,
  getRolesManageableBy,
} from "../utils/roleHierarchy.js";
import type {
  CreateUsuarioInput,
  UpdateUsuarioInput,
  UsuarioResponse,
} from "../schemas/usuarios.schema.js";

const logger = createAuthLogger();

// Service para gestion de usuarios
// Gerente puede crear solo tecnicos
// Admin puede crear cualquier rol
export class UsuariosService {
  private usuarioRepository: UsuarioRepository;
  private rolRepository: RolRepository;

  constructor(
    usuarioRepository: UsuarioRepository,
    rolRepository: RolRepository
  ) {
    this.usuarioRepository = usuarioRepository;
    this.rolRepository = rolRepository;
  }

  // Lista usuarios con filtros opcionales
  // Aplica jerarquia de roles: solo muestra usuarios gestionables
  // Excluye al propio usuario para evitar auto-modificacion
  // Admin ve gerentes, tecnicos, productores, invitados (no se ve a si mismo)
  // Gerente ve solo tecnicos, productores, invitados (no ve admins ni otros gerentes)
  // Tecnico no tiene acceso a este endpoint
  async listUsuarios(
    nombre?: string,
    rolNombre?: string,
    comunidadId?: string,
    activo?: boolean,
    usuarioActual?: { userId: string; role: string }
  ): Promise<{ usuarios: UsuarioResponse[]; total: number }> {
    let usuarios: Usuario[];

    // Usar metodo optimizado si hay usuario autenticado
    if (usuarioActual) {
      const rolesPermitidos = getRolesManageableBy(usuarioActual.role);

      // Usar query optimizada que filtra directamente en SQL
      usuarios = await this.usuarioRepository.findAllManageableBy(
        usuarioActual.userId,
        rolesPermitidos,
        nombre,
        rolNombre,
        comunidadId,
        activo
      );

      logger.debug(
        {
          usuario_actual_id: usuarioActual.userId,
          usuario_actual_rol: usuarioActual.role,
          roles_permitidos: rolesPermitidos,
          usuarios_filtrados: usuarios.length,
          filtro_nombre: nombre,
          filtro_comunidad: comunidadId,
        },
        "Usuarios filtrados por jerarquia de roles (SQL optimizado)"
      );
    } else {
      // Sin usuario autenticado, retornar todos (caso edge)
      usuarios = await this.usuarioRepository.findAll(
        nombre,
        rolNombre,
        comunidadId,
        activo
      );

      logger.warn(
        "Lista de usuarios solicitada sin usuario autenticado - retornando todos"
      );
    }

    return {
      usuarios: usuarios.map((u) => u.toJSON()),
      total: usuarios.length,
    };
  }

  // Obtiene un usuario por ID
  async getUsuarioById(id: string): Promise<UsuarioResponse> {
    const usuario = await this.usuarioRepository.findById(id);

    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    return usuario.toJSON();
  }

  // Crea un nuevo usuario
  // Gerente puede crear tecnicos y productores, NO administradores ni gerentes
  // Admin puede crear cualquier rol
  async createUsuario(
    input: CreateUsuarioInput,
    usuarioCreadorRol: string
  ): Promise<UsuarioResponse> {
    logger.info(
      {
        username: input.username,
        rol_id: input.id_rol,
        creador_rol: usuarioCreadorRol,
      },
      "Creating usuario"
    );

    // Verificar que el rol existe
    const rol = await this.rolRepository.findById(input.id_rol);
    if (!rol) {
      throw new Error("Rol no encontrado");
    }

    // Si el creador es gerente, validar que NO cree administradores ni gerentes
    if (usuarioCreadorRol.toLowerCase() === "gerente") {
      if (rol.esAdministrador() || rol.esGerente()) {
        throw new Error(
          "Gerente no puede crear usuarios con rol administrador o gerente"
        );
      }
    }

    // Nota: Los tecnicos pueden ser creados sin comunidad
    // El gerente puede asignarles la comunidad posteriormente

    // Hashear password
    const passwordHash = await hashPassword(input.password);

    // Crear entidad
    const usuario = Usuario.create(
      {
        username: input.username,
        email: input.email,
        password: input.password,
        nombre_completo: input.nombre_completo,
        id_rol: input.id_rol,
        id_comunidad: input.comunidades_ids?.[0], // Usar primera comunidad para compatibilidad
      },
      passwordHash
    );

    // Guardar en BD
    const usuarioCreado = await this.usuarioRepository.create(usuario);

    // Si tiene comunidades asignadas, agregar a tabla usuarios_comunidades
    // Soporta N:N - técnicos pueden tener múltiples comunidades
    if (input.comunidades_ids && input.comunidades_ids.length > 0) {
      await this.usuarioRepository.updateComunidades(
        usuarioCreado.id,
        input.comunidades_ids
      );
    }

    logger.info(
      {
        usuario_id: usuarioCreado.id,
        username: usuarioCreado.username,
        rol: usuarioCreado.nombreRol,
        comunidades: input.comunidades_ids?.length || 0,
      },
      "Usuario creado exitosamente"
    );

    return usuarioCreado.toJSON();
  }

  // Actualiza un usuario existente
  // Solo campos modificables: email, nombre, comunidad, activo
  // Valida jerarquia: solo puedes modificar usuarios de menor jerarquia
  // Previene auto-modificacion: no puedes modificar tu propia cuenta
  async updateUsuario(
    id: string,
    input: UpdateUsuarioInput,
    usuarioActual?: { userId: string; role: string }
  ): Promise<UsuarioResponse> {
    logger.info(
      {
        usuario_id: id,
        updates: input,
        usuario_actual: usuarioActual,
      },
      "Updating usuario"
    );

    const usuarioObjetivo = await this.usuarioRepository.findById(id);
    if (!usuarioObjetivo) {
      throw new Error("Usuario no encontrado");
    }

    // Validar permisos si hay usuario autenticado
    if (usuarioActual) {
      // Prevenir auto-modificacion
      if (id === usuarioActual.userId) {
        logger.warn(
          {
            usuario_id: id,
            usuario_actual_id: usuarioActual.userId,
          },
          "Intento de auto-modificacion bloqueado"
        );
        throw new Error(
          "No puedes modificar tu propia cuenta. Contacta a un administrador"
        );
      }

      // Validar jerarquia de roles
      if (!canManageUser(usuarioActual.role, usuarioObjetivo.nombreRol)) {
        logger.warn(
          {
            usuario_id: id,
            usuario_objetivo_rol: usuarioObjetivo.nombreRol,
            usuario_actual_rol: usuarioActual.role,
          },
          "Intento de modificacion sin permisos jerarquicos"
        );
        throw new Error(
          "No tienes permisos para modificar este usuario. Solo puedes gestionar usuarios de menor jerarquia"
        );
      }
    }

    // Crear nueva instancia con datos actualizados
    const usuarioData = {
      id_usuario: usuarioObjetivo.id,
      username: usuarioObjetivo.username,
      email: input.email || usuarioObjetivo.email,
      password_hash: usuarioObjetivo.passwordHash,
      nombre_completo:
        input.nombre_completo || usuarioObjetivo.nombreCompleto,
      id_rol: usuarioObjetivo.idRol,
      id_comunidad:
        input.comunidades_ids && input.comunidades_ids.length > 0
          ? input.comunidades_ids[0] // Usar primera comunidad para campo legacy
          : usuarioObjetivo.idComunidad,
      activo:
        input.activo !== undefined ? input.activo : usuarioObjetivo.activo,
      last_login: usuarioObjetivo.lastLogin || null,
      created_at: new Date(),
      updated_at: new Date(),
      nombre_rol: usuarioObjetivo.nombreRol,
      nombre_comunidad: usuarioObjetivo.nombreComunidad,
    };

    const usuarioActualizado = Usuario.fromDatabase(usuarioData);

    // Guardar cambios
    const resultado = await this.usuarioRepository.update(
      id,
      usuarioActualizado
    );

    // Si se proporcionaron comunidades_ids, actualizar tabla usuarios_comunidades
    // Soporta N:N - técnicos pueden tener múltiples comunidades
    if (input.comunidades_ids !== undefined) {
      // Reemplazar todas las comunidades con el nuevo array
      await this.usuarioRepository.updateComunidades(id, input.comunidades_ids);
    }

    logger.info(
      {
        usuario_id: id,
        comunidades_actualizadas: input.comunidades_ids?.length || 0,
      },
      "Usuario actualizado exitosamente"
    );

    return resultado.toJSON();
  }

  // Elimina (desactiva) un usuario
  // Solo admin y gerente pueden eliminar
  // Valida jerarquia: solo puedes desactivar usuarios de menor jerarquia
  // Previene auto-desactivacion: no puedes desactivar tu propia cuenta
  async deleteUsuario(
    id: string,
    usuarioActual?: { userId: string; role: string }
  ): Promise<void> {
    logger.info(
      {
        usuario_id: id,
        usuario_actual: usuarioActual,
      },
      "Deleting usuario"
    );

    // Validar permisos si hay usuario autenticado
    if (usuarioActual) {
      // Prevenir auto-desactivacion
      if (id === usuarioActual.userId) {
        logger.warn(
          {
            usuario_id: id,
            usuario_actual_id: usuarioActual.userId,
          },
          "Intento de auto-desactivacion bloqueado"
        );
        throw new Error(
          "No puedes desactivar tu propia cuenta. Contacta a un administrador"
        );
      }

      // Obtener usuario objetivo para validar jerarquia
      const usuarioObjetivo = await this.usuarioRepository.findById(id);
      if (!usuarioObjetivo) {
        throw new Error("Usuario no encontrado");
      }

      // Validar jerarquia de roles
      if (!canManageUser(usuarioActual.role, usuarioObjetivo.nombreRol)) {
        logger.warn(
          {
            usuario_id: id,
            usuario_objetivo_rol: usuarioObjetivo.nombreRol,
            usuario_actual_rol: usuarioActual.role,
          },
          "Intento de desactivacion sin permisos jerarquicos"
        );
        throw new Error(
          "No tienes permisos para desactivar este usuario. Solo puedes gestionar usuarios de menor jerarquia"
        );
      }
    }

    await this.usuarioRepository.softDelete(id);

    logger.info(
      {
        usuario_id: id,
      },
      "Usuario eliminado exitosamente"
    );
  }

  // Lista usuarios por comunidad
  async listUsuariosByComunidad(
    comunidadId: string
  ): Promise<{ usuarios: UsuarioResponse[]; total: number }> {
    const usuarios = await this.usuarioRepository.findByComunidad(comunidadId);

    return {
      usuarios: usuarios.map((u) => u.toJSON()),
      total: usuarios.length,
    };
  }

  // Lista todos los roles disponibles del sistema
  // Solo devuelve id y nombre, no permisos completos
  async listRoles(): Promise<{
    roles: Array<{ id_rol: string; nombre_rol: string }>;
  }> {
    const roles = await this.rolRepository.findAll();

    return {
      roles: roles.map((r) => ({
        id_rol: r.id,
        nombre_rol: r.nombre,
      })),
    };
  }
}
