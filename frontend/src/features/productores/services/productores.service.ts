import { apiClient, ENDPOINTS, getErrorMessage } from "@/shared/services/api";
import type {
  Productor,
  CreateProductorInput,
  UpdateProductorInput,
  ProductorFiltersInput,
  ProductoresListResponse,
  ProximitySearchInput,
  ProductorStats,
} from "../types/productor.types";

export const productoresService = {
  async createProductor(data: CreateProductorInput): Promise<Productor> {
    try {
      const response = await apiClient.post<{
        productor: Productor;
        message: string;
      }>(ENDPOINTS.PRODUCTORES.BASE, data);
      return response.data.productor;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async listProductores(filters?: ProductorFiltersInput): Promise<ProductoresListResponse> {
    try {
      const params: Record<string, string> = {};

      if (filters?.comunidad) params.comunidad = filters.comunidad;
      if (filters?.categoria) params.categoria = filters.categoria;
      if (filters?.con_coordenadas !== undefined) {
        params.con_coordenadas = filters.con_coordenadas.toString();
      }
      if (filters?.activo !== undefined) {
        params.activo = filters.activo.toString();
      }

      const response = await apiClient.get<ProductoresListResponse>(
        ENDPOINTS.PRODUCTORES.BASE,
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getProductorByCodigo(codigo: string): Promise<Productor> {
    try {
      const response = await apiClient.get<{ productor: Productor }>(
        ENDPOINTS.PRODUCTORES.BY_CODIGO(codigo)
      );
      return response.data.productor;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async updateProductor(
    codigo: string,
    data: UpdateProductorInput
  ): Promise<Productor> {
    try {
      const response = await apiClient.put<{
        productor: Productor;
        message: string;
      }>(ENDPOINTS.PRODUCTORES.BY_CODIGO(codigo), data);
      return response.data.productor;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async deleteProductor(codigo: string): Promise<void> {
    try {
      await apiClient.delete(ENDPOINTS.PRODUCTORES.BY_CODIGO(codigo));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async searchNearby(params: ProximitySearchInput): Promise<ProductoresListResponse> {
    try {
      const response = await apiClient.post<ProductoresListResponse>(
        ENDPOINTS.PRODUCTORES.NEARBY,
        params
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getEstadisticas(): Promise<ProductorStats> {
    try {
      const response = await apiClient.get<ProductorStats>(
        ENDPOINTS.PRODUCTORES.ESTADISTICAS
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
