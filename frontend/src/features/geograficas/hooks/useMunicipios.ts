import { useState, useEffect, useCallback } from "react";
import { geograficasService } from "../services/geograficas.service";
import type { Municipio } from "../types/geografica.types";

export function useMunicipios(provinciaId?: string) {
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMunicipios = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await geograficasService.listMunicipios(provinciaId);
      setMunicipios(data.municipios);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  }, [provinciaId]);

  useEffect(() => {
    fetchMunicipios();
  }, [fetchMunicipios]);

  return {
    municipios,
    isLoading,
    error,
    refetch: fetchMunicipios,
  };
}
