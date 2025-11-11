import { apiClient, ENDPOINTS, getErrorMessage } from "@/shared/services/api";
import type {
  Comunidad,
  CreateComunidadInput,
  UpdateComunidadInput,
  ComunidadFilters,
} from "../types/comunidad.types";

export const comunidadesService = {
  // Crear comunidad
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

  // Listar comunidades con filtros
  async listComunidades(
    filters?: ComunidadFilters
  ): Promise<{ comunidades: Comunidad[]; total: number }> {
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

  // Obtener comunidad por ID
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

  // Actualizar comunidad
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

  // Eliminar comunidad
  async deleteComunidad(id: string): Promise<void> {
    try {
      await apiClient.delete(ENDPOINTS.COMUNIDADES.BY_ID(id));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Eliminar comunidad permanentemente
  async hardDeleteComunidad(id: string): Promise<void> {
    try {
      await apiClient.delete(ENDPOINTS.COMUNIDADES.PERMANENT(id));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Listar comunidades sin tecnicos
  async listComunidadesSinTecnicos(): Promise<{
    comunidades: Comunidad[];
    total: number;
  }> {
    try {
      const response = await apiClient.get<{
        comunidades: Comunidad[];
        total: number;
      }>(ENDPOINTS.COMUNIDADES.SIN_TECNICOS);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
