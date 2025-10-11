import { apiClient, ENDPOINTS, getErrorMessage } from "@/shared/services/api";

export interface CreateUsuarioInput {
  username: string;
  email: string;
  password: string;
  nombre_completo: string;
  id_rol: string;
  id_comunidad?: string;
}

export interface UpdateUsuarioInput {
  email?: string;
  nombre_completo?: string;
  id_comunidad?: string | null;
  activo?: boolean;
}

export interface Usuario {
  id_usuario: string;
  username: string;
  email: string;
  nombre_completo: string;
  id_rol: string;
  nombre_rol: string;
  id_comunidad?: string;
  nombre_comunidad?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

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

  async listUsuarios(filters?: {
    rol?: string;
  }): Promise<{ usuarios: Usuario[]; total: number }> {
    try {
      const response = await apiClient.get<{
        usuarios: Usuario[];
        total: number;
      }>(ENDPOINTS.USUARIOS.BASE, { params: filters });
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
