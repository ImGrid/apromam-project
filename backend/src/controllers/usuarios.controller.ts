import { FastifyRequest, FastifyReply } from "fastify";
import { UsuariosService } from "../services/usuarios.service.js";
import type {
  CreateUsuarioInput,
  UpdateUsuarioInput,
  UsuarioParams,
  UsuarioQuery,
} from "../schemas/usuarios.schema.js";

// Controlador para endpoints de usuarios
// Gerente puede crear tecnicos y productores, NO administradores ni gerentes
// Admin puede crear cualquier rol
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  // GET /api/usuarios
  // Lista todos los usuarios con filtros opcionales
  // Aplica filtros de jerarquia basados en el rol del usuario autenticado
  async list(
    request: FastifyRequest<{ Querystring: UsuarioQuery }>,
    reply: FastifyReply
  ) {
    try {
      const { rol, activo } = request.query;

      // Extraer informacion del usuario autenticado
      // Type assertion segura para acceder a request.user
      const user = (request as any).user;
      const usuarioActual = user
        ? {
            userId: user.userId,
            role: user.role,
          }
        : undefined;

      const result = await this.usuariosService.listUsuarios(
        rol,
        activo,
        usuarioActual
      );
      return reply.status(200).send(result);
    } catch (error) {
      request.log.error(error, "Error listing usuarios");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al listar usuarios",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // GET /api/usuarios/:id
  // Obtiene un usuario por ID
  async getById(
    request: FastifyRequest<{ Params: UsuarioParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const usuario = await this.usuariosService.getUsuarioById(id);
      return reply.status(200).send({ usuario });
    } catch (error) {
      if (error instanceof Error && error.message === "Usuario no encontrado") {
        return reply.status(404).send({
          error: "not_found",
          message: "Usuario no encontrado",
          timestamp: new Date().toISOString(),
        });
      }
      request.log.error(error, "Error getting usuario");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al obtener usuario",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // POST /api/usuarios
  // Crea un nuevo usuario
  // Gerente puede crear tecnicos y productores, NO administradores ni gerentes
  async create(
    request: FastifyRequest<{ Body: CreateUsuarioInput }>,
    reply: FastifyReply
  ) {
    try {
      // Type assertion segura para acceder a request.user
      const user = (request as any).user;
      const usuarioCreadorRol = user?.role || "";
      const usuario = await this.usuariosService.createUsuario(
        request.body,
        usuarioCreadorRol
      );
      return reply.status(201).send({
        usuario,
        message: "Usuario creado exitosamente",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Ya existe")) {
          return reply.status(409).send({
            error: "conflict",
            message: error.message,
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message.includes("solo puede crear")) {
          return reply.status(400).send({
            error: "validation_error",
            message: error.message,
            timestamp: new Date().toISOString(),
          });
        }
        if (error.message === "Rol no encontrado") {
          return reply.status(404).send({
            error: "not_found",
            message: "Rol no encontrado",
            timestamp: new Date().toISOString(),
          });
        }
      }
      request.log.error(error, "Error creating usuario");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al crear usuario",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // PUT /api/usuarios/:id
  // Actualiza un usuario existente
  // Valida jerarquia y previene auto-modificacion
  async update(
    request: FastifyRequest<{
      Params: UsuarioParams;
      Body: UpdateUsuarioInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      // Extraer informacion del usuario autenticado
      // Type assertion segura para acceder a request.user
      const user = (request as any).user;
      const usuarioActual = user
        ? {
            userId: user.userId,
            role: user.role,
          }
        : undefined;

      const usuario = await this.usuariosService.updateUsuario(
        id,
        request.body,
        usuarioActual
      );
      return reply.status(200).send({
        usuario,
        message: "Usuario actualizado exitosamente",
      });
    } catch (error) {
      if (error instanceof Error) {
        // Errores de permisos
        if (
          error.message.includes("No puedes modificar") ||
          error.message.includes("No tienes permisos")
        ) {
          return reply.status(403).send({
            error: "forbidden",
            message: error.message,
            timestamp: new Date().toISOString(),
          });
        }

        // Usuario no encontrado
        if (error.message === "Usuario no encontrado") {
          return reply.status(404).send({
            error: "not_found",
            message: "Usuario no encontrado",
            timestamp: new Date().toISOString(),
          });
        }
      }

      request.log.error(error, "Error updating usuario");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al actualizar usuario",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // DELETE /api/usuarios/:id
  // Elimina (desactiva) un usuario
  // Valida jerarquia y previene auto-desactivacion
  async delete(
    request: FastifyRequest<{ Params: UsuarioParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      // Extraer informacion del usuario autenticado
      // Type assertion segura para acceder a request.user
      const user = (request as any).user;
      const usuarioActual = user
        ? {
            userId: user.userId,
            role: user.role,
          }
        : undefined;

      await this.usuariosService.deleteUsuario(id, usuarioActual);
      return reply.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        // Errores de permisos
        if (
          error.message.includes("No puedes desactivar") ||
          error.message.includes("No tienes permisos")
        ) {
          return reply.status(403).send({
            error: "forbidden",
            message: error.message,
            timestamp: new Date().toISOString(),
          });
        }

        // Usuario no encontrado
        if (error.message === "Usuario no encontrado") {
          return reply.status(404).send({
            error: "not_found",
            message: "Usuario no encontrado",
            timestamp: new Date().toISOString(),
          });
        }
      }

      request.log.error(error, "Error deleting usuario");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al eliminar usuario",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // GET /api/usuarios/comunidad/:id
  // Lista usuarios de una comunidad
  async listByComunidad(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const result = await this.usuariosService.listUsuariosByComunidad(id);
      return reply.status(200).send(result);
    } catch (error) {
      request.log.error(error, "Error listing usuarios by comunidad");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al listar usuarios por comunidad",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // GET /api/usuarios/roles
  // Lista todos los roles disponibles del sistema
  async listRoles(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await this.usuariosService.listRoles();
      return reply.status(200).send(result);
    } catch (error) {
      request.log.error(error, "Error listing roles");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al listar roles",
        timestamp: new Date().toISOString(),
      });
    }
  }
}
