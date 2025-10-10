/**
 * HOC que renderiza hijos solo si el usuario tiene los permisos requeridos
 * Alternativa limpia a condicionales inline
 */

import type { ReactNode } from "react";
import { usePermissions } from "@/shared/hooks/usePermissions";
import type {
  Permission,
  ResourceName,
} from "@/shared/config/permissions.config";

interface PermissionGateProps {
  children: ReactNode;

  // Opcion 1: Validar por permiso directo
  permission?: Permission;

  // Opcion 2: Validar por recurso y accion
  resource?: ResourceName;
  action?: "create" | "read" | "edit" | "delete";

  // Opcion 3: Validar ownership
  ownerId?: string;

  // Opcion 4: Funcion custom de validacion
  validate?: () => boolean;

  // Que renderizar si no tiene permiso
  fallback?: ReactNode;
}

/**
 * Componente PermissionGate
 *
 * Ejemplos de uso:
 *
 * // Por permiso directo
 * <PermissionGate permission="approve">
 *   <Button>Aprobar</Button>
 * </PermissionGate>
 *
 * // Por recurso y accion
 * <PermissionGate resource="fichas" action="create">
 *   <Button>Nueva Ficha</Button>
 * </PermissionGate>
 *
 * // Con ownership
 * <PermissionGate resource="fichas" action="edit" ownerId={ficha.created_by}>
 *   <Button>Editar</Button>
 * </PermissionGate>
 *
 * // Con funcion custom
 * <PermissionGate validate={() => user?.id_comunidad === comunidad.id}>
 *   <Button>Ver Detalles</Button>
 * </PermissionGate>
 *
 * // Con fallback
 * <PermissionGate permission="approve" fallback={<p>No autorizado</p>}>
 *   <Button>Aprobar</Button>
 * </PermissionGate>
 */
export function PermissionGate({
  children,
  permission,
  resource,
  action = "read",
  ownerId,
  validate,
  fallback = null,
}: PermissionGateProps) {
  const permissions = usePermissions();

  // Validacion custom
  if (validate) {
    return validate() ? <>{children}</> : <>{fallback}</>;
  }

  // Validacion por permiso directo
  if (permission) {
    return permissions.hasPermission(permission) ? (
      <>{children}</>
    ) : (
      <>{fallback}</>
    );
  }

  // Validacion por recurso y accion
  if (resource) {
    let hasAccess = false;

    if (action === "edit" && ownerId) {
      hasAccess = permissions.canEdit(resource, ownerId);
    } else if (action === "read" && ownerId) {
      hasAccess = permissions.canRead(resource, ownerId);
    } else {
      hasAccess = permissions.canAccess(resource, action);
    }

    return hasAccess ? <>{children}</> : <>{fallback}</>;
  }

  // Si no se especifica validacion, no renderizar
  console.warn("PermissionGate: No validation criteria provided");
  return <>{fallback}</>;
}
