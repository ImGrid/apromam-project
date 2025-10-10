import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/stores/authStore";
import {
  isAdmin,
  isGerente,
  isTecnico,
  isSameComunidad,
} from "../utils/roleHelpers";

export function useAuth() {
  // Estado del store
  const user = useAuthStore((state) => state.user);
  const permisos = useAuthStore((state) => state.permisos);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const status = useAuthStore((state) => state.status);
  const error = useAuthStore((state) => state.error);

  // Acciones del store
  const logout = useAuthStore((state) => state.logout);
  const loadUserFromStorage = useAuthStore(
    (state) => state.loadUserFromStorage
  );

  // Cargar usuario desde storage al montar
  useEffect(() => {
    if (!isAuthenticated && !isLoading && status === "idle") {
      loadUserFromStorage();
    }
  }, [isAuthenticated, isLoading, status, loadUserFromStorage]);

  // Helpers de rol (usando roleHelpers)
  const hasRole = (role: string): boolean => {
    return user?.nombre_rol.toLowerCase() === role.toLowerCase();
  };

  return {
    // Estado
    user,
    permisos,
    isAuthenticated,
    isLoading,
    status,
    error,

    // Acciones
    logout,

    // Helpers basicos
    hasRole,
    isAdmin: () => isAdmin(user),
    isGerente: () => isGerente(user),
    isTecnico: () => isTecnico(user),

    // Validacion de comunidad
    hasAccessToComunidad: (comunidadId: string) => {
      if (isAdmin(user) || isGerente(user)) return true;
      return isSameComunidad(user, comunidadId);
    },
  };
}
