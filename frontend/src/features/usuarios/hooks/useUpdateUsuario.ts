import { useState } from "react";
import { usuariosService } from "../services/usuarios.service";
import { showToast } from "@/shared/components/ui";
import type { UpdateUsuarioInput, Usuario } from "../types/usuario.types";

interface UseUpdateUsuarioReturn {
  updateUsuario: (id: string, data: UpdateUsuarioInput) => Promise<Usuario>;
  isLoading: boolean;
  error: string | null;
}

export function useUpdateUsuario(): UseUpdateUsuarioReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUsuario = async (
    id: string,
    data: UpdateUsuarioInput
  ): Promise<Usuario> => {
    setIsLoading(true);
    setError(null);

    try {
      const usuario = await usuariosService.updateUsuario(id, data);
      showToast.success("Usuario actualizado exitosamente");
      return usuario;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al actualizar usuario";
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateUsuario,
    isLoading,
    error,
  };
}
