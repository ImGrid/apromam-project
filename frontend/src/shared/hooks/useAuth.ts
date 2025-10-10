import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/stores/authStore";

// Hook para acceder al estado de autenticacion
// Integrado con authStore de Zustand
export function useAuth() {
  // Obtener datos del store
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

  // Cargar usuario desde storage al montar el componente
  // Solo si no esta autenticado y no esta cargando
  useEffect(() => {
    if (!isAuthenticated && !isLoading && status === "idle") {
      loadUserFromStorage();
    }
  }, [isAuthenticated, isLoading, status, loadUserFromStorage]);

  // Verificar si el usuario tiene un rol especifico
  const hasRole = (role: string): boolean => {
    return user?.nombre_rol.toLowerCase() === role.toLowerCase();
  };

  // Verificar si el usuario es administrador
  const isAdmin = (): boolean => {
    return hasRole("administrador");
  };

  // Verificar si el usuario es gerente
  const isGerente = (): boolean => {
    return hasRole("gerente");
  };

  // Verificar si el usuario es tecnico
  const isTecnico = (): boolean => {
    return hasRole("tecnico");
  };

  // Verificar si el usuario tiene acceso a una comunidad especifica
  const hasAccessToComunidad = (comunidadId: string): boolean => {
    // Admin tiene acceso a todas las comunidades
    if (isAdmin()) {
      return true;
    }

    // Gerente tiene acceso a todas las comunidades
    if (isGerente()) {
      return true;
    }

    // Tecnico solo tiene acceso a su comunidad
    return user?.id_comunidad === comunidadId;
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

    // Helpers
    hasRole,
    isAdmin,
    isGerente,
    isTecnico,
    hasAccessToComunidad,
  };
}
