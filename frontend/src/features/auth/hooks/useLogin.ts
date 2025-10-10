import { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import type { LoginInput } from "../types/auth.types";

// Hook personalizado para manejar el login
// Encapsula toda la logica de autenticacion y errores
export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener la funcion login del store
  const loginAction = useAuthStore((state) => state.login);

  // Funcion principal de login
  const login = async (credentials: LoginInput): Promise<void> => {
    // Resetear error previo
    setError(null);
    setIsLoading(true);

    try {
      // Llamar a la accion de login del store
      // Esta funcion ya maneja:
      // - Llamada al backend
      // - Guardado de tokens
      // - Actualizacion del estado global
      await loginAction(credentials);

      // Login exitoso
      setIsLoading(false);
    } catch (err) {
      // Extraer mensaje de error
      const errorMessage =
        err instanceof Error ? err.message : "Error al iniciar sesión";

      setError(errorMessage);
      setIsLoading(false);

      // Re-lanzar el error para que el componente pueda manejarlo si lo necesita
      throw err;
    }
  };

  // Limpiar el error manualmente si es necesario
  const clearError = () => {
    setError(null);
  };

  return {
    login,
    isLoading,
    error,
    clearError,
  };
}
