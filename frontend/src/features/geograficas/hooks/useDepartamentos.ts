import { useState, useEffect } from "react";
import { geograficasService } from "../services/geograficas.service";
import type { Departamento } from "../types/geografica.types";

const CACHE_TIME = 5 * 60 * 1000; // 5 minutos
let cachedDepartamentos: Departamento[] | null = null;
let cacheTimestamp: number | null = null;

export function useDepartamentos() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartamentos = async (force = false) => {
    const now = Date.now();

    // Usar cache si esta disponible y no ha expirado
    if (
      !force &&
      cachedDepartamentos &&
      cacheTimestamp &&
      now - cacheTimestamp < CACHE_TIME
    ) {
      setDepartamentos(cachedDepartamentos);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await geograficasService.listDepartamentos();
      cachedDepartamentos = data.departamentos;
      cacheTimestamp = now;
      setDepartamentos(data.departamentos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartamentos();
  }, []);

  return {
    departamentos,
    isLoading,
    error,
    refetch: () => fetchDepartamentos(true),
  };
}
