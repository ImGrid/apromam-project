import { apiClient, ENDPOINTS, getErrorMessage } from "@/shared/services/api";

export interface CreateComunidadInput {
  nombre_comunidad: string;
  abreviatura_comunidad: string;
  id_municipio: string;
}

export interface UpdateComunidadInput {
  nombre_comunidad?: string;
  abreviatura_comunidad?: string;
  activo?: boolean;
}

export interface Comunidad {
  id_comunidad: string;
  nombre_comunidad: string;
  abreviatura_comunidad: string;
  id_municipio: string;
  nombre_municipio: string;
  nombre_provincia: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export const comunidadesService = {
  async createComunidad(data: CreateComunidadInput): Promise<Comunidad> {
    try {
      const response = await apiClient.post<{
        comunidad: Comunidad;
        message: string;
      }>(ENDPOINTS.COMUNIDADES.BASE, data);
      return response.data.comunidad;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async listComunidades(filters?: {
    municipio_id?: string;
    provincia_id?: string;
  }): Promise<{ comunidades: Comunidad[]; total: number }> {
    try {
      const response = await apiClient.get<{
        comunidades: Comunidad[];
        total: number;
      }>(ENDPOINTS.COMUNIDADES.BASE, { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getComunidadById(id: string): Promise<Comunidad> {
    try {
      const response = await apiClient.get<{ comunidad: Comunidad }>(
        ENDPOINTS.COMUNIDADES.BY_ID(id)
      );
      return response.data.comunidad;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async updateComunidad(
    id: string,
    data: UpdateComunidadInput
  ): Promise<Comunidad> {
    try {
      const response = await apiClient.put<{
        comunidad: Comunidad;
        message: string;
      }>(ENDPOINTS.COMUNIDADES.BY_ID(id), data);
      return response.data.comunidad;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async deleteComunidad(id: string): Promise<void> {
    try {
      await apiClient.delete(ENDPOINTS.COMUNIDADES.BY_ID(id));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
