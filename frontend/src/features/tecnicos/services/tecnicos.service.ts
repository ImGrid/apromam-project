/**
 * Service para gestión de técnicos
 * Utiliza el endpoint de usuarios con filtro rol=tecnico
 */

import { apiClient, ENDPOINTS, getErrorMessage } from "@/shared/services/api";
import type {
  Tecnico,
  TecnicoFilters,
  TecnicoListResponse,
  AsignarComunidadInput,
} from "../types/tecnico.types";

export const tecnicosService = {
  /**
   * Lista todos los técnicos con filtros opcionales
   */
  async listTecnicos(filters?: TecnicoFilters): Promise<TecnicoListResponse> {
    try {
      // Siempre incluir el filtro rol=tecnico
      const params = {
        rol: "tecnico",
        ...(filters?.comunidad_id && { comunidad: filters.comunidad_id }),
        ...(filters?.activo !== undefined && { activo: filters.activo }),
      };

      const response = await apiClient.get<TecnicoListResponse>(
        ENDPOINTS.USUARIOS.BASE,
        { params }
      );

      // Filtrar sin comunidad si se requiere
      let usuarios = response.data.usuarios;
      if (filters?.sin_comunidad) {
        usuarios = usuarios.filter((t) => !t.id_comunidad);
      }

      // Filtrar por búsqueda si se requiere
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        usuarios = usuarios.filter(
          (t) =>
            t.nombre_completo.toLowerCase().includes(searchLower) ||
            t.email.toLowerCase().includes(searchLower) ||
            t.username.toLowerCase().includes(searchLower)
        );
      }

      return {
        usuarios,
        total: usuarios.length,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Asigna o remueve comunidad de un técnico
   */
  async asignarComunidad(
    id_usuario: string,
    data: AsignarComunidadInput
  ): Promise<Tecnico> {
    try {
      const response = await apiClient.put<{
        usuario: Tecnico;
        message: string;
      }>(ENDPOINTS.USUARIOS.BY_ID(id_usuario), {
        id_comunidad: data.id_comunidad,
      });
      return response.data.usuario;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Activa o desactiva un técnico
   */
  async toggleActivo(id_usuario: string, activo: boolean): Promise<Tecnico> {
    try {
      const response = await apiClient.put<{
        usuario: Tecnico;
        message: string;
      }>(ENDPOINTS.USUARIOS.BY_ID(id_usuario), {
        activo,
      });
      return response.data.usuario;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
