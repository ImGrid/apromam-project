import { useState, useEffect, useCallback } from "react";
import { usuariosService } from "../services/usuarios.service";
import type { Usuario, UsuarioFilters } from "../types/usuario.types";

interface UseUsuariosReturn {
  usuarios: Usuario[];
  isLoading: boolean;
  error: string | null;
  total: number;
  filters: UsuarioFilters;
  setFilters: (filters: UsuarioFilters) => void;
  refetch: () => void;
}

const CACHE_TIME = 2 * 60 * 1000; // 2 minutos

export function useUsuarios(): UseUsuariosReturn {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<UsuarioFilters>({});
  const [lastFetch, setLastFetch] = useState<number>(0);

  const fetchUsuarios = useCallback(
    async (force = false) => {
      const now = Date.now();

      // Usar cache si no ha pasado el tiempo
      if (!force && lastFetch && now - lastFetch < CACHE_TIME) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await usuariosService.listUsuarios(filters);
        setUsuarios(response.usuarios);
        setTotal(response.total);
        setLastFetch(now);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar usuarios"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [filters, lastFetch]
  );

  // Cargar al montar o cambiar filtros
  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const refetch = useCallback(() => {
    fetchUsuarios(true);
  }, [fetchUsuarios]);

  return {
    usuarios,
    isLoading,
    error,
    total,
    filters,
    setFilters,
    refetch,
  };
}
