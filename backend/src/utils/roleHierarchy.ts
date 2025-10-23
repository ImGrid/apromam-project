/**
 * Jerarquia de roles del sistema APROMAM
 * Define niveles jerarquicos y funciones de validacion de permisos entre roles
 */

/**
 * Niveles jerarquicos de roles
 * Numero menor = mayor jerarquia/autoridad
 * Numero mayor = menor jerarquia/autoridad
 */
export const ROLE_HIERARCHY = {
  administrador: 1,
  gerente: 2,
  tecnico: 3,
  invitado: 4,
} as const;

export type RoleName = keyof typeof ROLE_HIERARCHY;

/**
 * Obtiene el nivel jerarquico numerico de un rol
 * Roles no reconocidos retornan 999 (menor autoridad)
 */
export function getRoleLevel(roleName: string): number {
  const normalizedRole = roleName.toLowerCase().trim();
  return (
    ROLE_HIERARCHY[normalizedRole as RoleName] ?? 999
  );
}

/**
 * Verifica si un usuario puede gestionar (crear/editar/eliminar) a otro usuario
 * basandose en la jerarquia de roles
 *
 * Regla: Solo puedes gestionar usuarios de nivel INFERIOR al tuyo
 * Ejemplo: gerente (nivel 2) puede gestionar tecnico (nivel 3) pero NO administrador (nivel 1)
 *
 * @param managerRole - Rol del usuario que quiere realizar la accion
 * @param targetRole - Rol del usuario objetivo
 * @returns true si puede gestionar, false si no
 */
export function canManageUser(
  managerRole: string,
  targetRole: string
): boolean {
  const managerLevel = getRoleLevel(managerRole);
  const targetLevel = getRoleLevel(targetRole);

  // Solo puedes gestionar usuarios de nivel INFERIOR (numero mayor)
  return managerLevel < targetLevel;
}

/**
 * Obtiene lista de nombres de roles que un usuario puede gestionar
 * basandose en su rol actual
 *
 * @param managerRole - Rol del usuario gestor
 * @returns Array de nombres de roles que puede gestionar
 *
 * Ejemplo:
 * - administrador -> ['gerente', 'tecnico', 'invitado']
 * - gerente -> ['tecnico', 'invitado']
 * - tecnico -> [] (no puede gestionar usuarios)
 */
export function getRolesManageableBy(managerRole: string): string[] {
  const managerLevel = getRoleLevel(managerRole);

  return Object.entries(ROLE_HIERARCHY)
    .filter(([_, level]) => level > managerLevel)
    .map(([role, _]) => role);
}

/**
 * Verifica si un rol puede crear usuarios
 * Solo administrador y gerente pueden crear usuarios
 */
export function canCreateUsers(roleName: string): boolean {
  const level = getRoleLevel(roleName);
  return level <= 2; // administrador o gerente
}

/**
 * Verifica si un rol es administrador
 */
export function isAdministrador(roleName: string): boolean {
  return getRoleLevel(roleName) === 1;
}

/**
 * Verifica si un rol es gerente
 */
export function isGerente(roleName: string): boolean {
  return getRoleLevel(roleName) === 2;
}

/**
 * Verifica si un rol es tecnico
 */
export function isTecnico(roleName: string): boolean {
  return getRoleLevel(roleName) === 3;
}
