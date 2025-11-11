import { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { showToast } from "@/shared/hooks/useToast";
import { logger } from "@/shared/utils/logger";
import type { LoginInput } from "../types/auth.types";

// Hook personalizado para manejar el login
// Encapsula toda la logica de autenticacion y errores
export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);

  // Obtener la funcion login del store
  const loginAction = useAuthStore((state) => state.login);

  // Funcion principal de login
  const login = async (credentials: LoginInput): Promise<void> => {
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

      // Mostrar error con toast (objeto con métodos, no función)
      try {
        showToast.error(errorMessage);
      } catch (toastError) {
        // Si falla el toast, solo logueamos en consola (solo desarrollo)
        logger.error('[LOGIN] Error al mostrar toast:', toastError);
      }

      // SIEMPRE detener loading, incluso si el toast falla
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
  };
}
