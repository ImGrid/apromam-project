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

const CACHE_TIME = 5 * 60 * 1000; // 5 minutos
let cachedUsuarios: Usuario[] | null = null;
let cacheTimestamp: number | null = null;

export function useUsuarios(): UseUsuariosReturn {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<UsuarioFilters>({});

  const hasFilters = !!(
    filters?.nombre ||
    filters?.rol ||
    filters?.comunidad ||
    filters?.activo !== undefined
  );

  const fetchUsuarios = useCallback(
    async (force = false) => {
      const now = Date.now();

      // Usar cache solo si no hay filtros y no ha expirado
      if (
        !force &&
        !hasFilters &&
        cachedUsuarios &&
        cacheTimestamp &&
        now - cacheTimestamp < CACHE_TIME
      ) {
        setUsuarios(cachedUsuarios);
        setTotal(cachedUsuarios.length);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await usuariosService.listUsuarios(filters);

        // Solo cachear si no hay filtros
        if (!hasFilters) {
          cachedUsuarios = response.usuarios;
          cacheTimestamp = now;
        }

        setUsuarios(response.usuarios);
        setTotal(response.total);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar usuarios"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [filters?.nombre, filters?.rol, filters?.comunidad, filters?.activo, hasFilters]
  );

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
