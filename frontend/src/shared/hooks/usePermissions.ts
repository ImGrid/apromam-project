/**
 * Hook para verificacion de permisos en componentes
 * Integrado con authStore y roleHelpers
 */

import { useAuthStore } from "@/features/auth/stores/authStore";
import {
  hasPermission,
  canAccessRoute,
  canApprove,
  canReject,
  canCreateUser,
  isSameComunidad,
  canEdit,
  canDelete,
  canCreate,
  canRead,
  getAllowedActions,
  isAdmin,
  isGerente,
  isTecnico,
  isInvitado,
} from "../utils/roleHelpers";
import type { Permission, ResourceName } from "../config/permissions.config";

/**
 * Hook principal de permisos
 * Proporciona funciones helper para validacion en UI
 */
export function usePermissions() {
  const user = useAuthStore((state) => state.user);

  return {
    // Validacion de permisos basicos
    hasPermission: (permission: Permission) => hasPermission(user, permission),

    // Validacion de acceso a recursos
    canAccess: (
      resource: ResourceName,
      action?: "create" | "edit" | "delete" | "read"
    ) => canAccessRoute(user, resource, action),

    // Validacion de acciones especificas
    canApprove: () => canApprove(user),
    canReject: () => canReject(user),
    canCreate: (resource: ResourceName) => canCreate(user, resource),
    canEdit: (resource: ResourceName, ownerId?: string) =>
      canEdit(user, resource, ownerId),
    canDelete: (resource: ResourceName) => canDelete(user, resource),
    canRead: (resource: ResourceName, ownerId?: string) =>
      canRead(user, resource, ownerId),

    // Validacion de usuarios
    canCreateUser: (targetRole?: string) => canCreateUser(user, targetRole),

    // Validacion de comunidad
    isSameComunidad: (comunidadId?: string) =>
      isSameComunidad(user, comunidadId),
    hasAccessToComunidad: (comunidadId: string) => {
      // Admin y gerente tienen acceso a todo
      if (isAdmin(user) || isGerente(user)) return true;
      // Tecnico solo su comunidad
      return isSameComunidad(user, comunidadId);
    },

    // Helpers de rol
    isAdmin: () => isAdmin(user),
    isGerente: () => isGerente(user),
    isTecnico: () => isTecnico(user),
    isInvitado: () => isInvitado(user),

    // Utiles
    getAllowedActions: (resource: ResourceName) =>
      getAllowedActions(user, resource),

    // Usuario actual
    user,
  };
}
