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
    const response = await apiClient.get<FichaCompleta>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Obtiene solo la ficha principal (sin secciones)
   */
  async getFicha(id: string): Promise<Ficha> {
    const response = await apiClient.get<Ficha>(`${BASE_URL}/${id}/ficha`);
    return response.data;
  },

  /**
   * Crea una nueva ficha completa (con todas las secciones)
   */
  async create(data: CreateFichaCompletaInput): Promise<FichaCompleta> {
    const response = await apiClient.post<FichaCompleta>(BASE_URL, data);
    return response.data;
  },

  /**
   * Actualiza una ficha (solo borrador)
   */
  async update(id: string, data: UpdateFichaInput): Promise<Ficha> {
    const response = await apiClient.put<Ficha>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Actualiza una ficha completa (borrador)
   */
  async updateCompleta(
    id: string,
    data: Partial<CreateFichaCompletaInput>
  ): Promise<FichaCompleta> {
    const response = await apiClient.put<FichaCompleta>(
      `${BASE_URL}/${id}/completa`,
      data
    );
    return response.data;
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

  /**
   * Elimina un archivo
   */
  async deleteArchivo(idFicha: string, idArchivo: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${idFicha}/archivos/${idArchivo}`);
  },

  /**
   * Descarga un archivo
   */
  getArchivoUrl(idFicha: string, idArchivo: string): string {
    return `${apiClient.defaults.baseURL}${BASE_URL}/${idFicha}/archivos/${idArchivo}/download`;
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
  // QUERIES ESPECIFICAS
  // ============================================

  /**
   * Obtiene fichas por productor
   */
  async getByProductor(codigoProductor: string): Promise<Ficha[]> {
    const response = await apiClient.get<Ficha[]>(
      `${BASE_URL}/productor/${codigoProductor}`
    );
    return response.data;
  },

  /**
   * Obtiene fichas por gestión
   */
  async getByGestion(gestion: number): Promise<Ficha[]> {
    const response = await apiClient.get<Ficha[]>(
      `${BASE_URL}/gestion/${gestion}`
    );
    return response.data;
  },

  /**
   * Obtiene fichas en revisión (para gerente)
   */
  async getEnRevision(): Promise<Ficha[]> {
    const response = await apiClient.get<Ficha[]>(
      `${BASE_URL}/en-revision`
    );
    return response.data;
  },

  /**
   * Obtiene mis fichas (técnico)
   */
  async getMisFichas(filters?: {
    estado_ficha?: string;
  }): Promise<Ficha[]> {
    const response = await apiClient.get<Ficha[]>(
      `${BASE_URL}/mis-fichas`,
      {
        params: filters,
      }
    );
    return response.data;
  },

  /**
   * Verifica si existe una ficha para un productor en una gestión
   */
  async existsByProductorGestion(
    codigoProductor: string,
    gestion: number
  ): Promise<boolean> {
    const response = await apiClient.get<{ exists: boolean }>(
      `${BASE_URL}/exists`,
      {
        params: { codigo_productor: codigoProductor, gestion },
      }
    );
    return response.data.exists;
  },
};
