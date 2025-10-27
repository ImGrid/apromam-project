/**
 * Fichas Service
 * Servicios para gestionar fichas de inspección
 */

import apiClient from "@/shared/services/api/apiClient";
import type {
  Ficha,
  FichaCompleta,
  CreateFichaCompletaInput,
  UpdateFichaInput,
  UpdateFichaCompletaInput,
  FichasFilters,
  FichasListResponse,
  EnviarRevisionInput,
  AprobarFichaInput,
  RechazarFichaInput,
  FichaEstadisticas,
  ArchivoFicha,
} from "../types/ficha.types";

const BASE_URL = "/api/fichas";

export const fichasService = {
  /**
   * Lista fichas con filtros
   */
  async list(filters?: FichasFilters): Promise<FichasListResponse> {
    const response = await apiClient.get<FichasListResponse>(BASE_URL, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Obtiene una ficha completa por ID (con todas las secciones)
   */
  async getById(id: string): Promise<FichaCompleta> {
    const response = await apiClient.get<{ ficha: FichaCompleta }>(`${BASE_URL}/${id}`);
    return response.data.ficha;
  },

  /**
   * Crea una nueva ficha completa (con todas las secciones)
   */
  async create(data: CreateFichaCompletaInput): Promise<FichaCompleta> {
    const response = await apiClient.post<{ ficha: FichaCompleta; message: string }>(BASE_URL, data);
    return response.data.ficha;
  },

  /**
   * Actualiza una ficha (solo borrador o rechazado)
   */
  async update(id: string, data: UpdateFichaInput): Promise<Ficha> {
    const response = await apiClient.put<Ficha>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Actualiza una ficha completa (con todas las secciones)
   * Solo se puede actualizar si está en estado borrador
   */
  async updateCompleta(id: string, data: UpdateFichaCompletaInput): Promise<FichaCompleta> {
    const response = await apiClient.put<{
      ficha: FichaCompleta;
      message: string;
    }>(`${BASE_URL}/${id}/completa`, data);
    return response.data.ficha;
  },

  /**
   * Elimina una ficha (solo admin)
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  // ============================================
  // WORKFLOW
  // ============================================

  /**
   * Envía una ficha a revisión
   */
  async enviarRevision(
    id: string,
    data: EnviarRevisionInput
  ): Promise<Ficha> {
    const response = await apiClient.post<Ficha>(
      `${BASE_URL}/${id}/enviar-revision`,
      data
    );
    return response.data;
  },

  /**
   * Aprueba una ficha (gerente/admin)
   */
  async aprobar(id: string, data?: AprobarFichaInput): Promise<Ficha> {
    const response = await apiClient.post<Ficha>(
      `${BASE_URL}/${id}/aprobar`,
      data || {}
    );
    return response.data;
  },

  /**
   * Rechaza una ficha (gerente/admin)
   */
  async rechazar(id: string, data: RechazarFichaInput): Promise<Ficha> {
    const response = await apiClient.post<Ficha>(
      `${BASE_URL}/${id}/rechazar`,
      data
    );
    return response.data;
  },

  /**
   * Devuelve una ficha a borrador (admin)
   */
  async devolverBorrador(id: string): Promise<Ficha> {
    const response = await apiClient.post<Ficha>(
      `${BASE_URL}/${id}/devolver-borrador`
    );
    return response.data;
  },

  // ============================================
  // ARCHIVOS
  // ============================================

  /**
   * Lista archivos de una ficha
   */
  async getArchivos(id: string): Promise<ArchivoFicha[]> {
    const response = await apiClient.get<ArchivoFicha[]>(
      `${BASE_URL}/${id}/archivos`
    );
    return response.data;
  },

  /**
   * Sube un archivo a una ficha
   */
  async uploadArchivo(
    id: string,
    file: File,
    tipoArchivo: string
  ): Promise<ArchivoFicha> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tipo_archivo", tipoArchivo);

    const response = await apiClient.post<ArchivoFicha>(
      `${BASE_URL}/${id}/archivos`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // ============================================
  // ESTADISTICAS
  // ============================================

  /**
   * Obtiene estadísticas de fichas
   */
  async getEstadisticas(filters?: {
    gestion?: number;
    comunidad?: string;
  }): Promise<FichaEstadisticas> {
    const response = await apiClient.get<FichaEstadisticas>(
      `${BASE_URL}/estadisticas`,
      {
        params: filters,
      }
    );
    return response.data;
  },

  // ============================================
  // DRAFT MANAGEMENT
  // ============================================

  /**
   * Guarda un borrador de ficha en el servidor
   */
  async saveDraft(
    codigoProductor: string,
    gestion: number,
    stepActual: number,
    draftData: any
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(`${BASE_URL}/draft`, {
        codigo_productor: codigoProductor,
        gestion,
        step_actual: stepActual,
        draft_data: draftData,
      });

      return {
        success: true,
        message: 'Borrador guardado en servidor',
      };
    } catch (error) {
      console.error('[API] Error al guardar borrador:', error);
      return {
        success: false,
        message: 'Error al guardar en servidor',
      };
    }
  },

  /**
   * Obtiene un borrador por código de productor y gestión
   */
  async getDraft(
    codigoProductor: string,
    gestion: number
  ): Promise<any | null> {
    try {
      const response = await apiClient.get(
        `${BASE_URL}/draft/${codigoProductor}/${gestion}`
      );
      return response.data;
    } catch (error: any) {
      // 404 es esperado si no hay borrador
      if (error.response?.status === 404) {
        return null;
      }
      console.error('[API] Error al obtener borrador:', error);
      return null;
    }
  },

  /**
   * Lista todos los borradores del usuario actual
   */
  async listMyDrafts(): Promise<any[]> {
    try {
      const response = await apiClient.get(`${BASE_URL}/draft/my-drafts`);
      return response.data.drafts || [];
    } catch (error) {
      console.error('[API] Error al listar borradores:', error);
      return [];
    }
  },

  /**
   * Elimina un borrador del servidor
   */
  async deleteDraft(draftId: string): Promise<void> {
    try {
      await apiClient.delete(`${BASE_URL}/draft/${draftId}`);
    } catch (error) {
      console.error('[API] Error al eliminar borrador:', error);
      throw error;
    }
  },

  /**
   * Verifica si existe una ficha para un productor en una gestión
   */
  async checkExists(
    codigoProductor: string,
    gestion: number
  ): Promise<{
    exists: boolean;
    ficha?: {
      id_ficha: string;
      estado_ficha: string;
      resultado_certificacion: string;
      fecha_inspeccion: string;
    };
  }> {
    try {
      const response = await apiClient.get<{
        exists: boolean;
        ficha?: {
          id_ficha: string;
          estado_ficha: string;
          resultado_certificacion: string;
          fecha_inspeccion: string;
        };
      }>(`${BASE_URL}/check-exists`, {
        params: {
          codigo_productor: codigoProductor,
          gestion: gestion.toString(),
        },
      });
      return response.data;
    } catch (error) {
      console.error('[API] Error al verificar si ficha existe:', error);
      throw error;
    }
  },
};
