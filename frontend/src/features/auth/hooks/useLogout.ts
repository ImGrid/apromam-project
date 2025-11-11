import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { ROUTES } from "@/shared/config/routes.config";
import { logger } from "@/shared/utils/logger";

// Hook personalizado para manejar el logout
// Encapsula la logica de cierre de sesion
export function useLogout() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Obtener la funcion logout del store
  const logoutAction = useAuthStore((state) => state.logout);

  // Funcion principal de logout
  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      // Llamar a la accion de logout del store
      // Esta funcion ya maneja:
      // - Invalidacion del token en el backend
      // - Limpieza del estado global
      // - Limpieza del localStorage
      await logoutAction();

      // Redirigir al login
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (err) {
      // Si falla el logout en el backend, igual limpiar localmente
      logger.error("Error en logout:", err);

      // Redirigir al login de todas formas
      navigate(ROUTES.LOGIN, { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    logout,
    isLoading,
  };
}
