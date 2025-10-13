import { useState, useEffect } from "react";
import { geograficasService } from "../services/geograficas.service";
import type { Provincia } from "../types/geografica.types";

const CACHE_TIME = 5 * 60 * 1000; // 5 minutos
let cachedProvincias: Provincia[] | null = null;
let cacheTimestamp: number | null = null;

export function useProvincias() {
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProvincias = async (force = false) => {
    const now = Date.now();

    // Usar cache si esta disponible y no ha expirado
    if (
      !force &&
      cachedProvincias &&
      cacheTimestamp &&
      now - cacheTimestamp < CACHE_TIME
    ) {
      setProvincias(cachedProvincias);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await geograficasService.listProvincias();
      cachedProvincias = data.provincias;
      cacheTimestamp = now;
      setProvincias(data.provincias);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProvincias();
  }, []);

  return {
    provincias,
    isLoading,
    error,
    refetch: () => fetchProvincias(true),
  };
}
