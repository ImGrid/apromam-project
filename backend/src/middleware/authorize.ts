import { FastifyRequest, FastifyReply } from "fastify";
import { createAuthLogger } from "../utils/logger.js";

const logger = createAuthLogger();

/**
 * Roles del sistema APROMAM
 */
export const ROLES = {
  ADMINISTRADOR: "administrador",
  GERENTE: "gerente",
  TECNICO: "tecnico",
  INVITADO: "invitado",
  PRODUCTOR: "productor",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

/**
 * Factory function para autorización por roles
 * Retorna middleware que valida si usuario tiene uno de los roles permitidos
 *
 * @param allowedRoles - Array de roles permitidos
 * @returns Middleware function
 *
 * Uso:
 * fastify.get('/api/admin/users', {
 *   onRequest: [fastify.authenticate],
 *   preHandler: [requireRoles('administrador')]
 * }, handler)
 */
export function requireRoles(...allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Validar que usuario esté autenticado
    if (!request.user) {
      logger.warn(
        {
          method: request.method,
          url: request.url,
          required_roles: allowedRoles,
        },
        "Authorization failed: User not authenticated"
      );

      return reply.code(401).send({
        error: "unauthorized",
        message: "Autenticación requerida",
        timestamp: new Date().toISOString(),
      });
    }

    const userRole = request.user.role?.toLowerCase();

    // Verificar si usuario tiene uno de los roles permitidos
    const hasPermission = allowedRoles.some(
      (role) => role.toLowerCase() === userRole
    );

    if (!hasPermission) {
      logger.warn(
        {
          user_id: request.user.userId,
          user_role: userRole,
          required_roles: allowedRoles,
          method: request.method,
          url: request.url,
        },
        "Authorization failed: Insufficient permissions"
      );

      return reply.code(403).send({
        error: "forbidden",
        message: `Acceso denegado. Se requiere rol: ${allowedRoles.join(
          " o "
        )}`,
        timestamp: new Date().toISOString(),
      });
    }

    logger.debug(
      {
        user_id: request.user.userId,
        user_role: userRole,
        required_roles: allowedRoles,
      },
      "Authorization successful"
    );
  };
}

/**
 * Middleware para requerir rol de administrador
 * Atajo para requireRoles('administrador')
 */
export const requireAdmin = requireRoles(ROLES.ADMINISTRADOR);

/**
 * Middleware para requerir rol de gerente o superior
 * Gerentes y admins pueden aprobar fichas
 */
export const requireGerente = requireRoles(ROLES.GERENTE, ROLES.ADMINISTRADOR);

/**
 * Middleware para requerir rol de técnico
 * Solo técnicos capturan datos en campo
 */
export const requireTecnico = requireRoles(ROLES.TECNICO);

/**
 * Middleware para requerir técnico, gerente o admin
 * Para operaciones comunes del sistema
 */
export const requireStaff = requireRoles(
  ROLES.TECNICO,
  ROLES.GERENTE,
  ROLES.ADMINISTRADOR
);

/**
 * Factory function para autorización basada en permisos JSONB
 * Verifica permisos específicos en lugar de roles
 *
 * @param requiredPermission - Permiso requerido (ej: 'approve', 'create')
 * @returns Middleware function
 *
 * Uso:
 * preHandler: [requirePermission('approve')]
 */
export function requirePermission(requiredPermission: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.code(401).send({
        error: "unauthorized",
        message: "Autenticación requerida",
        timestamp: new Date().toISOString(),
      });
    }

    const permisos = request.user.permisos || {};

    // Si tiene permiso 'all', puede hacer todo
    if (permisos.all === true) {
      logger.debug(
        {
          user_id: request.user.userId,
          permission: requiredPermission,
        },
        "Permission granted: User has 'all' permission"
      );
      return;
    }

    // Verificar permiso específico
    if (permisos[requiredPermission] !== true) {
      logger.warn(
        {
          user_id: request.user.userId,
          user_role: request.user.role,
          required_permission: requiredPermission,
          user_permissions: permisos,
        },
        "Authorization failed: Missing required permission"
      );

      return reply.code(403).send({
        error: "forbidden",
        message: `Permiso insuficiente. Se requiere: ${requiredPermission}`,
        timestamp: new Date().toISOString(),
      });
    }

    logger.debug(
      {
        user_id: request.user.userId,
        permission: requiredPermission,
      },
      "Permission granted"
    );
  };
}

/**
 * Middleware para verificar acceso a comunidad específica
 * Técnicos solo pueden acceder a su comunidad asignada
 * Gerentes y admins tienen acceso a todas
 *
 * @param getComunidadId - Function que extrae ID de comunidad del request
 * @returns Middleware function
 *
 * Uso:
 * preHandler: [requireComunidadAccess((req) => req.params.comunidadId)]
 */
export function requireComunidadAccess(
  getComunidadId: (request: FastifyRequest) => string | undefined
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.code(401).send({
        error: "unauthorized",
        message: "Autenticación requerida",
        timestamp: new Date().toISOString(),
      });
    }

    const userRole = request.user.role?.toLowerCase();
    const userComunidadId = request.user.comunidadId;
    const targetComunidadId = getComunidadId(request);

    // Admin tiene acceso a todo
    if (userRole === ROLES.ADMINISTRADOR) {
      logger.debug(
        {
          user_id: request.user.userId,
          target_comunidad: targetComunidadId,
        },
        "Comunidad access granted: Admin user"
      );
      return;
    }

    // Gerente tiene acceso a todas las comunidades de su región
    // Por ahora permitir acceso total, refinar después con región
    if (userRole === ROLES.GERENTE) {
      logger.debug(
        {
          user_id: request.user.userId,
          target_comunidad: targetComunidadId,
        },
        "Comunidad access granted: Gerente user"
      );
      return;
    }

    // Técnico solo puede acceder a su comunidad
    if (userRole === ROLES.TECNICO) {
      if (!userComunidadId) {
        logger.error(
          {
            user_id: request.user.userId,
            user_role: userRole,
          },
          "Técnico without assigned comunidad"
        );

        return reply.code(403).send({
          error: "forbidden",
          message: "Técnico sin comunidad asignada",
          timestamp: new Date().toISOString(),
        });
      }

      if (targetComunidadId && targetComunidadId !== userComunidadId) {
        logger.warn(
          {
            user_id: request.user.userId,
            user_comunidad: userComunidadId,
            target_comunidad: targetComunidadId,
          },
          "Comunidad access denied: Técnico accessing different comunidad"
        );

        return reply.code(403).send({
          error: "forbidden",
          message: "No tienes acceso a esta comunidad",
          timestamp: new Date().toISOString(),
        });
      }

      logger.debug(
        {
          user_id: request.user.userId,
          comunidad_id: userComunidadId,
        },
        "Comunidad access granted: Técnico accessing own comunidad"
      );
      return;
    }

    // Otros roles (invitado, productor) no tienen acceso
    logger.warn(
      {
        user_id: request.user.userId,
        user_role: userRole,
      },
      "Comunidad access denied: Insufficient role"
    );

    return reply.code(403).send({
      error: "forbidden",
      message: "No tienes permisos para acceder a comunidades",
      timestamp: new Date().toISOString(),
    });
  };
}

/**
 * Middleware para verificar que usuario puede editar recurso
 * Solo propietario o admin pueden editar
 *
 * @param getOwnerId - Function que extrae ID del propietario del recurso
 * @returns Middleware function
 *
 * Uso:
 * preHandler: [requireOwnership((req) => req.params.userId)]
 */
export function requireOwnership(
  getOwnerId: (request: FastifyRequest) => string | undefined
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.code(401).send({
        error: "unauthorized",
        message: "Autenticación requerida",
        timestamp: new Date().toISOString(),
      });
    }

    const userId = request.user.userId;
    const userRole = request.user.role?.toLowerCase();
    const ownerId = getOwnerId(request);

    // Admin puede editar todo
    if (userRole === ROLES.ADMINISTRADOR) {
      logger.debug(
        {
          user_id: userId,
          target_owner: ownerId,
        },
        "Ownership check passed: Admin user"
      );
      return;
    }

    // Verificar que sea el propietario
    if (ownerId && ownerId !== userId) {
      logger.warn(
        {
          user_id: userId,
          owner_id: ownerId,
          user_role: userRole,
        },
        "Ownership check failed: User not owner"
      );

      return reply.code(403).send({
        error: "forbidden",
        message: "Solo puedes editar tus propios recursos",
        timestamp: new Date().toISOString(),
      });
    }

    logger.debug(
      {
        user_id: userId,
        owner_id: ownerId,
      },
      "Ownership check passed"
    );
  };
}
