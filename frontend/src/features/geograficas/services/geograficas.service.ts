import { apiClient, ENDPOINTS, getErrorMessage } from "@/shared/services/api";
import type {
  Departamento,
  Provincia,
  Municipio,
  CreateDepartamentoInput,
  UpdateDepartamentoInput,
  CreateProvinciaInput,
  UpdateProvinciaInput,
  CreateMunicipioInput,
  UpdateMunicipioInput,
} from "../types/geografica.types";

export const geograficasService = {
  // Departamentos
  async listDepartamentos(): Promise<{
    departamentos: Departamento[];
    total: number;
  }> {
    try {
      const response = await apiClient.get<{
        departamentos: Departamento[];
        total: number;
      }>(ENDPOINTS.GEOGRAFICAS.DEPARTAMENTOS);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getDepartamentoById(id: string): Promise<Departamento> {
    try {
      const response = await apiClient.get<{ departamento: Departamento }>(
        ENDPOINTS.GEOGRAFICAS.DEPARTAMENTOS_BY_ID(id)
      );
      return response.data.departamento;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async createDepartamento(data: CreateDepartamentoInput): Promise<Departamento> {
    try {
      const response = await apiClient.post<{
        departamento: Departamento;
        message: string;
      }>(ENDPOINTS.GEOGRAFICAS.DEPARTAMENTOS, data);
      return response.data.departamento;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async updateDepartamento(
    id: string,
    data: UpdateDepartamentoInput
  ): Promise<Departamento> {
    try {
      const response = await apiClient.put<{
        departamento: Departamento;
        message: string;
      }>(ENDPOINTS.GEOGRAFICAS.DEPARTAMENTOS_BY_ID(id), data);
      return response.data.departamento;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async deleteDepartamento(id: string): Promise<void> {
    try {
      await apiClient.delete(ENDPOINTS.GEOGRAFICAS.DEPARTAMENTOS_BY_ID(id));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Provincias
  async listProvincias(): Promise<{ provincias: Provincia[]; total: number }> {
    try {
      const response = await apiClient.get<{
        provincias: Provincia[];
        total: number;
      }>(ENDPOINTS.GEOGRAFICAS.PROVINCIAS);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getProvinciaById(id: string): Promise<Provincia> {
    try {
      const response = await apiClient.get<{ provincia: Provincia }>(
        ENDPOINTS.GEOGRAFICAS.PROVINCIAS_BY_ID(id)
      );
      return response.data.provincia;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async createProvincia(data: CreateProvinciaInput): Promise<Provincia> {
    try {
      const response = await apiClient.post<{
        provincia: Provincia;
        message: string;
      }>(ENDPOINTS.GEOGRAFICAS.PROVINCIAS, data);
      return response.data.provincia;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async updateProvincia(
    id: string,
    data: UpdateProvinciaInput
  ): Promise<Provincia> {
    try {
      const response = await apiClient.put<{
        provincia: Provincia;
        message: string;
      }>(ENDPOINTS.GEOGRAFICAS.PROVINCIAS_BY_ID(id), data);
      return response.data.provincia;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async deleteProvincia(id: string): Promise<void> {
    try {
      await apiClient.delete(ENDPOINTS.GEOGRAFICAS.PROVINCIAS_BY_ID(id));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Municipios
  async listMunicipios(
    provinciaId?: string
  ): Promise<{ municipios: Municipio[]; total: number }> {
    try {
      const params = provinciaId ? { provincia_id: provinciaId } : undefined;
      const response = await apiClient.get<{
        municipios: Municipio[];
        total: number;
      }>(ENDPOINTS.GEOGRAFICAS.MUNICIPIOS, { params });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getMunicipioById(id: string): Promise<Municipio> {
    try {
      const response = await apiClient.get<{ municipio: Municipio }>(
        ENDPOINTS.GEOGRAFICAS.MUNICIPIOS_BY_ID(id)
      );
      return response.data.municipio;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async createMunicipio(data: CreateMunicipioInput): Promise<Municipio> {
    try {
      const response = await apiClient.post<{
        municipio: Municipio;
        message: string;
      }>(ENDPOINTS.GEOGRAFICAS.MUNICIPIOS, data);
      return response.data.municipio;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async updateMunicipio(
    id: string,
    data: UpdateMunicipioInput
  ): Promise<Municipio> {
    try {
      const response = await apiClient.put<{
        municipio: Municipio;
        message: string;
      }>(ENDPOINTS.GEOGRAFICAS.MUNICIPIOS_BY_ID(id), data);
      return response.data.municipio;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async deleteMunicipio(id: string): Promise<void> {
    try {
      await apiClient.delete(ENDPOINTS.GEOGRAFICAS.MUNICIPIOS_BY_ID(id));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
