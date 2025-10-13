import { useState } from 'react';
import { productoresService } from '../services/productores.service';
import { showToast } from '@/shared/components/ui';
import type { UpdateProductorInput, Productor } from '../types/productor.types';

export function useUpdateProductor() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProductor = async (
    codigo: string,
    data: UpdateProductorInput
  ): Promise<Productor> => {
    setIsLoading(true);
    setError(null);

    try {
      const productor = await productoresService.updateProductor(codigo, data);
      showToast.success(`Productor ${codigo} actualizado exitosamente`);
      return productor;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al actualizar productor';
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActivo = async (codigo: string, activo: boolean): Promise<Productor> => {
    return updateProductor(codigo, { activo });
  };

  return {
    updateProductor,
    toggleActivo,
    isLoading,
    error,
  };
}
