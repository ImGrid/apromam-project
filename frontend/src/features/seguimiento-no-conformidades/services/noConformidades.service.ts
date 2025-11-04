// Servicio API para No Conformidades
// Maneja todas las comunicaciones con el backend relacionadas a seguimiento de NC

import { apiClient, ENDPOINTS } from "@/shared/services/api";
import type {
  NoConformidadEnriquecida,
  NoConformidadesListResponse,
  UpdateNoConformidadInput,
  UpdateSeguimientoInput,
  NCFichaQuery,
  EstadisticasNCQuery,
  EstadisticasNC,
  ArchivoNC,
  ArchivosNCListResponse,
  TipoArchivoNC,
} from "../types/noConformidad.types";

// Servicio de No Conformidades
export const noConformidadesService = {
  // Lista todas las NC con filtros opcionales
  async getAll(
    params?: Partial<NCFichaQuery> & {
      codigo_productor?: string;
      id_comunidad?: string;
    }
  ): Promise<NoConformidadesListResponse> {
    const response = await apiClient.get<NoConformidadesListResponse>(
      ENDPOINTS.NO_CONFORMIDADES.BASE,
      { params }
    );
    return response.data;
  },

  // Obtiene una NC por ID con datos enriquecidos
  async getById(id: string): Promise<NoConformidadEnriquecida> {
    const response = await apiClient.get<{
      no_conformidad: NoConformidadEnriquecida;
    }>(ENDPOINTS.NO_CONFORMIDADES.BY_ID(id));
    return response.data.no_conformidad;
  },

  // Lista NC de una ficha especifica
  async getByFicha(
    idFicha: string,
    params?: NCFichaQuery
  ): Promise<NoConformidadesListResponse> {
    const response = await apiClient.get<NoConformidadesListResponse>(
      ENDPOINTS.NO_CONFORMIDADES.BY_FICHA(idFicha),
      { params }
    );
    return response.data;
  },

  // Actualiza datos basicos de la NC (descripcion, accion correctiva, fecha limite)
  async updateDatosBasicos(
    id: string,
    data: UpdateNoConformidadInput
  ): Promise<NoConformidadEnriquecida> {
    const response = await apiClient.put<{
      no_conformidad: NoConformidadEnriquecida;
    }>(ENDPOINTS.NO_CONFORMIDADES.UPDATE_DATOS(id), data);
    return response.data.no_conformidad;
  },

  // Actualiza seguimiento de la NC (estado y comentario)
  // Este es el endpoint CORE del modulo
  async updateSeguimiento(
    id: string,
    data: UpdateSeguimientoInput
  ): Promise<NoConformidadEnriquecida> {
    const response = await apiClient.put<{
      no_conformidad: NoConformidadEnriquecida;
    }>(ENDPOINTS.NO_CONFORMIDADES.UPDATE_SEGUIMIENTO(id), data);
    return response.data.no_conformidad;
  },

  // Obtiene estadisticas de NC
  async getEstadisticas(params?: EstadisticasNCQuery): Promise<EstadisticasNC> {
    const response = await apiClient.get<EstadisticasNC>(
      ENDPOINTS.NO_CONFORMIDADES.ESTADISTICAS,
      { params }
    );
    return response.data;
  },

  // Sube un archivo a una NC
  async uploadArchivo(
    idNoConformidad: string,
    file: File,
    tipoArchivo: TipoArchivoNC
  ): Promise<ArchivoNC> {
    const formData = new FormData();
    // IMPORTANTE: tipo_archivo debe ir ANTES del file
    // Fastify multipart con request.file() solo parsea campos que vienen antes del archivo
    formData.append("tipo_archivo", tipoArchivo);
    formData.append("file", file);

    // Eliminamos explícitamente Content-Type para que Axios lo genere con el boundary correcto
    const response = await apiClient.post<{ archivo: ArchivoNC }>(
      ENDPOINTS.NO_CONFORMIDADES.ARCHIVOS(idNoConformidad),
      formData,
      {
        headers: {
          "Content-Type": undefined,
        },
      }
    );
    return response.data.archivo;
  },

  // Lista archivos de una NC
  async getArchivos(idNoConformidad: string): Promise<ArchivosNCListResponse> {
    const response = await apiClient.get<ArchivosNCListResponse>(
      ENDPOINTS.NO_CONFORMIDADES.ARCHIVOS(idNoConformidad)
    );
    return response.data;
  },

  // Elimina un archivo de una NC
  async deleteArchivo(idNoConformidad: string, idArchivo: string): Promise<void> {
    await apiClient.delete(
      ENDPOINTS.NO_CONFORMIDADES.ARCHIVO_BY_ID(idNoConformidad, idArchivo)
    );
  },

  // Genera URL de descarga de un archivo
  // La descarga se hace mediante window.open o link directo
  getDownloadUrl(idNoConformidad: string, idArchivo: string): string {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
    return `${baseUrl}${ENDPOINTS.NO_CONFORMIDADES.DOWNLOAD_ARCHIVO(
      idNoConformidad,
      idArchivo
    )}`;
  },
};
