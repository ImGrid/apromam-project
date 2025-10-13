import { useState } from "react";
import { usuariosService } from "../services/usuarios.service";
import type { CreateUsuarioInput, Usuario } from "../types/usuario.types";
import { showToast } from "@/shared/components/ui";

export function useCreateUsuario() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUsuario = async (data: CreateUsuarioInput): Promise<Usuario> => {
    setIsLoading(true);
    setError(null);

    try {
      const usuario = await usuariosService.createUsuario(data);
      showToast.success("Usuario creado exitosamente");
      return usuario;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al crear usuario";
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createUsuario,
    isLoading,
    error,
  };
}
