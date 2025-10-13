// frontend/src/features/comunidades/hooks/useComunidadesSinTecnicos.ts

import { useState, useEffect } from "react";
import { comunidadesService } from "../services/comunidades.service";
import type { Comunidad } from "../types/comunidad.types";

export function useComunidadesSinTecnicos() {
  const [comunidadesSinTecnicos, setComunidadesSinTecnicos] = useState<Comunidad[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await comunidadesService.listComunidadesSinTecnicos();
      setComunidadesSinTecnicos(data.comunidades);
      setCount(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    comunidadesSinTecnicos,
    count,
    isLoading,
    error,
    refetch: fetchData,
  };
}