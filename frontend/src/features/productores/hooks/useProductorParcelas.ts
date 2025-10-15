/**
 * Hook para obtener las parcelas de un productor específico
 * Se usa en la Sección 4 de las fichas para seleccionar parcelas
 */

import { useState, useEffect } from "react";
import {
  parcelasService,
  type ParcelasProductorResponse,
} from "@/features/parcelas";

export function useProductorParcelas(codigoProductor: string | undefined) {
  const [data, setData] = useState<ParcelasProductorResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // No hacer fetch si no hay código de productor
    if (!codigoProductor || codigoProductor.trim() === "") {
      setData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const fetchParcelas = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const parcelas = await parcelasService.getParcelasByProductor(
          codigoProductor
        );
        setData(parcelas);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error al obtener las parcelas del productor";
        setError(errorMessage);
        console.error("Error fetching parcelas:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParcelas();
  }, [codigoProductor]);

  return {
    parcelas: data?.parcelas || [],
    total: data?.total || 0,
    superficieTotal: data?.superficie_total || 0,
    isLoading,
    error,
    hasData: data !== null,
  };
}
