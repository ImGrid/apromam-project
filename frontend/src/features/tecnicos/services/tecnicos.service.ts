/**
 * Service para gestión de técnicos
 * Utiliza el endpoint de usuarios con filtro rol=tecnico
 */

import { apiClient, ENDPOINTS, getErrorMessage } from "@/shared/services/api";
import type {
  Tecnico,
  TecnicoFilters,
  TecnicoListResponse,
  AsignarComunidadesInput,
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
        usuarios = usuarios.filter(
          (t) => !t.comunidades_ids || t.comunidades_ids.length === 0
        );
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
   * Asigna comunidades a un técnico (N:N)
   */
  async asignarComunidades(
    id_usuario: string,
    data: AsignarComunidadesInput
  ): Promise<Tecnico> {
    try {
      const response = await apiClient.put<{
        usuario: Tecnico;
        message: string;
      }>(ENDPOINTS.USUARIOS.BY_ID(id_usuario), {
        comunidades_ids: data.comunidades_ids,
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
