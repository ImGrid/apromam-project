import { FastifyRequest, FastifyReply } from "fastify";
import { createAuthLogger } from "../utils/logger.js";

const logger = createAuthLogger();

// Roles del sistema APROMAM
// Estos son los 4 roles definidos en la base de datos
export const ROLES = {
  ADMINISTRADOR: "administrador",
  GERENTE: "gerente",
  TECNICO: "tecnico",
  INVITADO: "invitado",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

// Crea un middleware que valida si el usuario tiene uno de los roles permitidos
// Retorna una funcion middleware que se usa en las rutas
// Ejemplo: requireRoles('administrador', 'gerente')
// Uso en ruta: preHandler: [requireRoles('administrador')]
export function requireRoles(...allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Validar que el usuario este autenticado primero
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

    // Verificar si el usuario tiene uno de los roles permitidos
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

// Middleware para requerir rol de administrador
// Atajo para requireRoles('administrador')
export const requireAdmin = requireRoles(ROLES.ADMINISTRADOR);

// Middleware para requerir rol de gerente o superior
// Gerentes y admins pueden aprobar fichas
export const requireGerente = requireRoles(ROLES.GERENTE, ROLES.ADMINISTRADOR);

// Middleware para requerir rol de tecnico
// Solo tecnicos capturan datos en campo
export const requireTecnico = requireRoles(ROLES.TECNICO);

// Middleware para requerir tecnico, gerente o admin
// Para operaciones comunes del sistema
export const requireStaff = requireRoles(
  ROLES.TECNICO,
  ROLES.GERENTE,
  ROLES.ADMINISTRADOR
);

// Crea un middleware que verifica permisos especificos del rol
// Los permisos estan almacenados en JSONB en la tabla roles
// Ejemplo: requirePermission('approve') para aprobar fichas
// Uso en ruta: preHandler: [requirePermission('approve')]
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

    // Verificar si tiene el permiso especifico requerido
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

// Middleware para verificar acceso a comunidad especifica
// Los tecnicos solo pueden acceder a sus comunidades asignadas (N:N)
// Gerentes y admins tienen acceso a todas las comunidades
// getComunidadId: funcion que extrae el ID de comunidad del request
// Ejemplo: requireComunidadAccess((req) => req.params.comunidadId)
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
    const userComunidadesIds = request.user.comunidadesIds;
    const targetComunidadId = getComunidadId(request);

    // Admin tiene acceso a todas las comunidades
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

    // Gerente tiene acceso a todas las comunidades
    // En el futuro se puede refinar para limitar por region
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

    // Tecnico solo puede acceder a sus comunidades asignadas
    if (userRole === ROLES.TECNICO) {
      if (!userComunidadesIds || userComunidadesIds.length === 0) {
        logger.error(
          {
            user_id: request.user.userId,
            user_role: userRole,
          },
          "Técnico without assigned comunidades"
        );

        return reply.code(403).send({
          error: "forbidden",
          message: "Técnico sin comunidades asignadas",
          timestamp: new Date().toISOString(),
        });
      }

      // Verificar que este accediendo a una de sus comunidades asignadas
      if (targetComunidadId && !userComunidadesIds.includes(targetComunidadId)) {
        logger.warn(
          {
            user_id: request.user.userId,
            user_comunidades: userComunidadesIds,
            target_comunidad: targetComunidadId,
          },
          "Comunidad access denied: Técnico accessing non-assigned comunidad"
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
          comunidades_ids: userComunidadesIds,
        },
        "Comunidad access granted: Técnico accessing assigned comunidad"
      );
      return;
    }

    // Invitado no tiene acceso a comunidades
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

// Middleware para verificar que el usuario puede editar un recurso
// Solo el propietario del recurso o un admin pueden editarlo
// getOwnerId: funcion que extrae el ID del propietario del recurso
// Ejemplo: requireOwnership((req) => req.params.userId)
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

    // Admin puede editar cualquier recurso
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

    // Verificar que el usuario sea el propietario del recurso
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
