import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { RolRepository } from "../repositories/RolRepository.js";
import { Usuario } from "../entities/Usuario.js";
import { hashPassword } from "../utils/hash.utils.js";
import { createAuthLogger } from "../utils/logger.js";
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
  // Gerente ve todos
  // Tecnico no tiene acceso a este endpoint
  async listUsuarios(
    rolNombre?: string
  ): Promise<{ usuarios: UsuarioResponse[]; total: number }> {
    const usuarios = await this.usuarioRepository.findAll(rolNombre);

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
  // Gerente solo puede crear tecnicos
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

    // Si el creador es gerente, validar que solo cree tecnicos
    if (usuarioCreadorRol.toLowerCase() === "gerente") {
      if (!rol.esTecnico()) {
        throw new Error("Gerente solo puede crear usuarios con rol técnico");
      }
    }

    // Los tecnicos deben tener comunidad asignada
    if (rol.esTecnico() && !input.id_comunidad) {
      throw new Error("Técnico debe tener comunidad asignada");
    }

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
        id_comunidad: input.id_comunidad,
      },
      passwordHash
    );

    // Guardar en BD
    const usuarioCreado = await this.usuarioRepository.create(usuario);

    logger.info(
      {
        usuario_id: usuarioCreado.id,
        username: usuarioCreado.username,
        rol: usuarioCreado.nombreRol,
      },
      "Usuario creado exitosamente"
    );

    return usuarioCreado.toJSON();
  }

  // Actualiza un usuario existente
  // Solo campos modificables: email, nombre, comunidad, activo
  async updateUsuario(
    id: string,
    input: UpdateUsuarioInput
  ): Promise<UsuarioResponse> {
    logger.info(
      {
        usuario_id: id,
        updates: input,
      },
      "Updating usuario"
    );

    const usuarioActual = await this.usuarioRepository.findById(id);
    if (!usuarioActual) {
      throw new Error("Usuario no encontrado");
    }

    // Crear nueva instancia con datos actualizados
    const usuarioData = {
      id_usuario: usuarioActual.id,
      username: usuarioActual.username,
      email: input.email || usuarioActual.email,
      password_hash: usuarioActual.passwordHash,
      nombre_completo: input.nombre_completo || usuarioActual.nombreCompleto,
      id_rol: usuarioActual.idRol,
      id_comunidad:
        input.id_comunidad !== undefined
          ? input.id_comunidad
          : usuarioActual.idComunidad,
      activo: input.activo !== undefined ? input.activo : usuarioActual.activo,
      last_login: usuarioActual.lastLogin || null,
      created_at: new Date(),
      updated_at: new Date(),
      nombre_rol: usuarioActual.nombreRol,
      nombre_comunidad: usuarioActual.nombreComunidad,
    };

    const usuarioActualizado = Usuario.fromDatabase(usuarioData);

    // Guardar cambios
    const resultado = await this.usuarioRepository.update(
      id,
      usuarioActualizado
    );

    logger.info(
      {
        usuario_id: id,
      },
      "Usuario actualizado exitosamente"
    );

    return resultado.toJSON();
  }

  // Elimina (desactiva) un usuario
  // Solo admin y gerente pueden eliminar
  async deleteUsuario(id: string): Promise<void> {
    logger.info(
      {
        usuario_id: id,
      },
      "Deleting usuario"
    );

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
}
