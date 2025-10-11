import { apiClient, ENDPOINTS, getErrorMessage } from "@/shared/services/api";

export interface CreateProductorInput {
  nombre_productor: string;
  ci_documento: string;
  id_comunidad: string;
  año_ingreso_programa: number;
  categoria_actual: "E" | "2T" | "1T" | "0T";
  superficie_total_has?: number;
  numero_parcelas_total?: number;
  coordenadas?: {
    latitud: number;
    longitud: number;
    altitud?: number;
  };
}

export interface UpdateProductorInput {
  nombre_productor?: string;
  categoria_actual?: "E" | "2T" | "1T" | "0T";
  superficie_total_has?: number;
  numero_parcelas_total?: number;
  coordenadas?: {
    latitud: number;
    longitud: number;
    altitud?: number;
  };
  activo?: boolean;
}

export interface Productor {
  codigo_productor: string;
  nombre_productor: string;
  ci_documento: string;
  id_comunidad: string;
  nombre_comunidad: string;
  año_ingreso_programa: number;
  categoria_actual: string;
  superficie_total_has: number;
  numero_parcelas_total: number;
  latitud_domicilio?: number;
  longitud_domicilio?: number;
  altitud_domicilio?: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

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

  async listProductores(filters?: {
    comunidad_id?: string;
    categoria?: string;
  }): Promise<{ productores: Productor[]; total: number }> {
    try {
      const response = await apiClient.get<{
        productores: Productor[];
        total: number;
      }>(ENDPOINTS.PRODUCTORES.BASE, { params: filters });
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

  async searchNearby(params: {
    latitud: number;
    longitud: number;
    radio_metros: number;
  }): Promise<{ productores: Productor[]; total: number }> {
    try {
      const response = await apiClient.post<{
        productores: Productor[];
        total: number;
      }>(ENDPOINTS.PRODUCTORES.NEARBY, params);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
