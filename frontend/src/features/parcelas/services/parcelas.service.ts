/**
 * Servicio de Parcelas
 * Maneja las operaciones relacionadas con parcelas de productores
 */

import { apiClient, ENDPOINTS, getErrorMessage } from "@/shared/services/api";

// Tipos
export interface ParcelaCoordenadas {
  latitude: number;
  longitude: number;
}

export interface Parcela {
  id_parcela: string;
  codigo_productor: string;
  nombre_productor?: string;
  numero_parcela: number;
  coordenadas?: ParcelaCoordenadas;
  utiliza_riego: boolean;
  situacion_cumple: boolean;
  tipo_barrera: "ninguna" | "viva" | "muerta";
  activo: boolean;
  created_at: string;
}

export interface ParcelasProductorResponse {
  parcelas: Parcela[];
  total: number;
  superficie_total: number;
}

// Servicio
export const parcelasService = {
  /**
   * Obtiene todas las parcelas de un productor específico
   * @param codigoProductor - Código del productor
   * @returns Lista de parcelas con superficie total
   */
  async getParcelasByProductor(
    codigoProductor: string
  ): Promise<ParcelasProductorResponse> {
    try {
      const response = await apiClient.get<ParcelasProductorResponse>(
        ENDPOINTS.PARCELAS.BY_PRODUCTOR(codigoProductor)
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Obtiene una parcela por su ID
   * @param id - ID de la parcela
   * @returns Parcela
   */
  async getParcelaById(id: string): Promise<Parcela> {
    try {
      const response = await apiClient.get<{ parcela: Parcela }>(
        ENDPOINTS.PARCELAS.BY_ID(id)
      );
      return response.data.parcela;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
