import { apiClient } from "@/shared/services/api";
import type {
  TipoCultivo,
  CreateTipoCultivoInput,
  UpdateTipoCultivoInput,
  Gestion,
  CreateGestionInput,
  UpdateGestionInput,
  TiposCultivoListResponse,
  GestionesListResponse,
  CatalogoFilters,
} from "../types/catalogo.types";

// Servicios para gestion de catalogos (Tipos Cultivo y Gestiones)
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

// GESTIONES

export const listGestiones = async (
  filters?: CatalogoFilters
): Promise<GestionesListResponse> => {
  const params = new URLSearchParams();
  if (filters?.activo !== undefined) {
    params.append("activo", filters.activo.toString());
  }

  const queryString = params.toString();
  const url = `/api/catalogos/gestiones${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get<GestionesListResponse>(url);
  return response.data;
};

export const getGestionById = async (id: string): Promise<Gestion> => {
  const response = await apiClient.get<{ gestion: Gestion }>(
    `/api/catalogos/gestiones/${id}`
  );
  return response.data.gestion;
};

export const getGestionActual = async (): Promise<Gestion | null> => {
  const response = await apiClient.get<{ gestion: Gestion | null }>(
    "/api/catalogos/gestiones/actual"
  );
  return response.data.gestion;
};

export const createGestion = async (
  data: CreateGestionInput
): Promise<Gestion> => {
  const response = await apiClient.post<{ gestion: Gestion }>(
    "/api/catalogos/gestiones",
    data
  );
  return response.data.gestion;
};

export const updateGestion = async (
  id: string,
  data: UpdateGestionInput
): Promise<Gestion> => {
  const response = await apiClient.put<{ gestion: Gestion }>(
    `/api/catalogos/gestiones/${id}`,
    data
  );
  return response.data.gestion;
};

export const catalogosService = {
  listTiposCultivo,
  getTipoCultivoById,
  createTipoCultivo,
  updateTipoCultivo,
  listGestiones,
  getGestionById,
  getGestionActual,
  createGestion,
  updateGestion,
};
