/**
 * useAuth Hook
 * Hook simple para verificar autenticacion basica
 */

import { hasValidToken } from "../services/storage";

/**
 * Hook para verificar si el usuario esta autenticado
 * Por ahora solo verifica si existe un token valido
 */
export function useAuth() {
  const isAuthenticated = hasValidToken();

  return {
    isAuthenticated,
  };
}
