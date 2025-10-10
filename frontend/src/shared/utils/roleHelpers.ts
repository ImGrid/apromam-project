/**
 * Helpers para validacion de roles y permisos
 * Funciones puras sin dependencias de estado
 */

import type { User } from "@/features/auth/types/auth.types";
import {
  PERMISSIONS,
  RESOURCE_PERMISSIONS,
} from "../config/permissions.config";
import type {
  Permission,
  RoleName,
  ResourceName,
} from "../config/permissions.config";

/**
 * Verifica si un usuario tiene un permiso especifico
 */
export function hasPermission(
  user: User | null,
  permission: Permission
): boolean {
  if (!user) return false;

  const roleName = user.nombre_rol.toLowerCase() as RoleName;
  const rolePermissions = PERMISSIONS[roleName];

  if (!rolePermissions) return false;

  // Si tiene permiso 'all', puede hacer todo
  if (rolePermissions.all === true) return true;

  // Verificar permiso especifico
  return rolePermissions[permission] === true;
}

/**
 * Verifica si un usuario puede acceder a una ruta
 * Basado en el nombre del recurso
 */
export function canAccessRoute(
  user: User | null,
  resource: ResourceName,
  action: "create" | "edit" | "delete" | "read" = "read"
): boolean {
  if (!user) return false;

  const resourceConfig = RESOURCE_PERMISSIONS[resource];
  if (!resourceConfig || !(action in resourceConfig)) return false;

  const requiredPermissions = (
    resourceConfig as Record<typeof action, readonly Permission[]>
  )[action];

  return requiredPermissions.some((permission) =>
    hasPermission(user, permission as Permission)
  );
}

/**
 * Verifica si un usuario puede aprobar fichas
 * Solo gerente y admin
 */
export function canApprove(user: User | null): boolean {
  return hasPermission(user, "approve");
}

/**
 * Verifica si un usuario puede rechazar fichas
 * Solo gerente y admin
 */
export function canReject(user: User | null): boolean {
  return hasPermission(user, "reject");
}

/**
 * Verifica si un usuario puede crear otro usuario
 * Admin puede crear cualquier rol
 * Gerente solo puede crear tecnicos
 */
export function canCreateUser(user: User | null, targetRole?: string): boolean {
  if (!user) return false;

  // Admin puede crear cualquier rol
  if (hasPermission(user, "all")) return true;

  // Gerente solo puede crear tecnicos
  if (hasPermission(user, "createTecnico")) {
    if (!targetRole) return true;
    return targetRole.toLowerCase() === "tecnico";
  }

  return false;
}

/**
 * Verifica si un usuario pertenece a la misma comunidad
 * Util para validar acceso de tecnicos
 */
export function isSameComunidad(
  user: User | null,
  comunidadId?: string
): boolean {
  if (!user || !comunidadId) return false;

  // Admin y gerente tienen acceso a todas las comunidades
  if (hasPermission(user, "all")) return true;

  // Tecnico solo su comunidad
  return user.id_comunidad === comunidadId;
}

/**
 * Verifica si un usuario puede editar un recurso
 * Considera ownership para permisos 'editOwn'
 */
export function canEdit(
  user: User | null,
  resource: ResourceName,
  ownerId?: string
): boolean {
  if (!user) return false;

  // Admin puede editar todo
  if (hasPermission(user, "all")) return true;

  // Si tiene permiso general de edit
  if (canAccessRoute(user, resource, "edit")) {
    return true;
  }

  // Si tiene permiso editOwn y es el owner
  if (hasPermission(user, "editOwn") && ownerId) {
    return user.id_usuario === ownerId;
  }

  return false;
}

/**
 * Verifica si un usuario puede eliminar un recurso
 * Solo admin
 */
export function canDelete(user: User | null, resource: ResourceName): boolean {
  return canAccessRoute(user, resource, "delete");
}

/**
 * Verifica si un usuario puede crear un recurso
 */
export function canCreate(user: User | null, resource: ResourceName): boolean {
  return canAccessRoute(user, resource, "create");
}

/**
 * Verifica si un usuario puede leer un recurso
 * Considera ownership para permisos 'readOwn'
 */
export function canRead(
  user: User | null,
  resource: ResourceName,
  ownerId?: string
): boolean {
  if (!user) return false;

  // Si tiene permiso general de read
  if (canAccessRoute(user, resource, "read")) {
    return true;
  }

  // Si tiene permiso readOwn y es el owner
  if (hasPermission(user, "readOwn") && ownerId) {
    return user.id_usuario === ownerId;
  }

  return false;
}

/**
 * Obtiene lista de acciones permitidas para un recurso
 */
export function getAllowedActions(
  user: User | null,
  resource: ResourceName
): Array<"create" | "read" | "edit" | "delete"> {
  const actions: Array<"create" | "read" | "edit" | "delete"> = [];

  if (canCreate(user, resource)) actions.push("create");
  if (canAccessRoute(user, resource, "read")) actions.push("read");
  if (canAccessRoute(user, resource, "edit")) actions.push("edit");
  if (canDelete(user, resource)) actions.push("delete");

  return actions;
}

/**
 * Verifica si es administrador
 */
export function isAdmin(user: User | null): boolean {
  return hasPermission(user, "all");
}

/**
 * Verifica si es gerente
 */
export function isGerente(user: User | null): boolean {
  if (!user) return false;
  return user.nombre_rol.toLowerCase() === "gerente";
}

/**
 * Verifica si es tecnico
 */
export function isTecnico(user: User | null): boolean {
  if (!user) return false;
  return user.nombre_rol.toLowerCase() === "tecnico";
}

/**
 * Verifica si es productor
 */
export function isProductor(user: User | null): boolean {
  if (!user) return false;
  return user.nombre_rol.toLowerCase() === "productor";
}

/**
 * Verifica si es invitado
 */
export function isInvitado(user: User | null): boolean {
  if (!user) return false;
  return user.nombre_rol.toLowerCase() === "invitado";
}
