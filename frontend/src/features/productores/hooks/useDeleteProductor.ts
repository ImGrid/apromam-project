import { useState } from 'react';
import { productoresService } from '../services/productores.service';
import { showToast } from '@/shared/components/ui';

export function useDeleteProductor() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteProductor = async (codigo: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await productoresService.deleteProductor(codigo);
      showToast.success(`Productor ${codigo} eliminado exitosamente`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al eliminar productor';
      setError(errorMessage);
      showToast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteProductor,
    isLoading,
    error,
  };
}
