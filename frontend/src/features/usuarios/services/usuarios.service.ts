import { apiClient, ENDPOINTS, getErrorMessage } from "@/shared/services/api";
import type {
  Usuario,
  CreateUsuarioInput,
  UpdateUsuarioInput,
  UsuarioFilters,
  UsuarioListResponse,
} from "../types/usuario.types";

export const usuariosService = {
  async createUsuario(data: CreateUsuarioInput): Promise<Usuario> {
    try {
      const response = await apiClient.post<{
        usuario: Usuario;
        message: string;
      }>(ENDPOINTS.USUARIOS.BASE, data);
      return response.data.usuario;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async listUsuarios(filters?: UsuarioFilters): Promise<UsuarioListResponse> {
    try {
      const response = await apiClient.get<UsuarioListResponse>(
        ENDPOINTS.USUARIOS.BASE,
        { params: filters }
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getUsuarioById(id: string): Promise<Usuario> {
    try {
      const response = await apiClient.get<{ usuario: Usuario }>(
        ENDPOINTS.USUARIOS.BY_ID(id)
      );
      return response.data.usuario;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async updateUsuario(id: string, data: UpdateUsuarioInput): Promise<Usuario> {
    try {
      const response = await apiClient.put<{
        usuario: Usuario;
        message: string;
      }>(ENDPOINTS.USUARIOS.BY_ID(id), data);
      return response.data.usuario;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async deleteUsuario(id: string): Promise<void> {
    try {
      await apiClient.delete(ENDPOINTS.USUARIOS.BY_ID(id));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
