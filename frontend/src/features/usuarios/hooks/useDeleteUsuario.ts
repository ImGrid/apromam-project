import { useState } from "react";
import { usuariosService } from "../services/usuarios.service";
import type { Usuario } from "../types/usuario.types";
import { showToast } from "@/shared/components/ui";

interface UseDeleteUsuarioReturn {
  deleteUsuario: (usuario: Usuario) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useDeleteUsuario(): UseDeleteUsuarioReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUsuario = async (usuario: Usuario): Promise<void> => {
    const nuevoEstado = !usuario.activo;
    const accion = nuevoEstado ? "activar" : "desactivar";

    // Confirmacion antes de cambiar estado
    const confirmado = window.confirm(
      `¿Estás seguro de ${accion} este usuario?`
    );

    if (!confirmado) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await usuariosService.updateUsuario(usuario.id_usuario, {
        activo: nuevoEstado,
      });
      showToast.success(`Usuario ${nuevoEstado ? "activado" : "desactivado"} exitosamente`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : `Error al ${accion} usuario`;
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteUsuario,
    isLoading,
    error,
  };
}
