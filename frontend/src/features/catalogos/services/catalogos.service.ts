import { apiClient } from "@/shared/services/api";
import type {
  TipoCultivo,
  CreateTipoCultivoInput,
  UpdateTipoCultivoInput,
  TiposCultivoListResponse,
  CatalogoFilters,
} from "../types/catalogo.types";

// Servicios para gestion de catalogos (solo Tipos Cultivo)
// NOTA: Gestiones se manejan en el módulo configuracion
// Admin y Gerente tienen acceso completo
// Tecnico solo puede ver

// TIPOS DE CULTIVO

export const listTiposCultivo = async (
  filters?: CatalogoFilters
): Promise<TiposCultivoListResponse> => {
  const params = new URLSearchParams();
  if (filters?.activo !== undefined) {
    params.append("activo", filters.activo.toString());
  }

  const queryString = params.toString();
  const url = `/api/catalogos/tipos-cultivo${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await apiClient.get<TiposCultivoListResponse>(url);
  return response.data;
};

export const getTipoCultivoById = async (id: string): Promise<TipoCultivo> => {
  const response = await apiClient.get<{ tipo_cultivo: TipoCultivo }>(
    `/api/catalogos/tipos-cultivo/${id}`
  );
  return response.data.tipo_cultivo;
};

export const createTipoCultivo = async (
  data: CreateTipoCultivoInput
): Promise<TipoCultivo> => {
  const response = await apiClient.post<{ tipo_cultivo: TipoCultivo }>(
    "/api/catalogos/tipos-cultivo",
    data
  );
  return response.data.tipo_cultivo;
};

export const updateTipoCultivo = async (
  id: string,
  data: UpdateTipoCultivoInput
): Promise<TipoCultivo> => {
  const response = await apiClient.put<{ tipo_cultivo: TipoCultivo }>(
    `/api/catalogos/tipos-cultivo/${id}`,
    data
  );
  return response.data.tipo_cultivo;
};

// Export service object
export const catalogosService = {
  listTiposCultivo,
  getTipoCultivoById,
  createTipoCultivo,
  updateTipoCultivo,
};
