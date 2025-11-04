/**
 * Gestiones Service
 * Servicios para gestionar gestiones (años agrícolas)
 *
 * IMPORTANTE: Usa los endpoints de /api/gestiones (NO /api/catalogos/gestiones)
 * Verificado contra backend/src/routes/gestiones.routes.ts
 */

import { apiClient } from "@/shared/services/api";
import type {
  Gestion,
  CreateGestionInput,
  UpdateGestionInput,
  GestionesListResponse,
  GestionActivaResponse,
  ActivarGestionResponse,
} from "../types/gestion.types";

const BASE_URL = "/api/gestiones";

/**
 * GET /api/gestiones
 * Lista todas las gestiones
 * Backend: gestiones.routes.ts línea 37-64
 */
export const listGestiones = async (
  activo?: boolean
): Promise<GestionesListResponse> => {
  const params = new URLSearchParams();
  if (activo !== undefined) {
    params.append("activo", activo.toString());
  }

  const queryString = params.toString();
  const url = `${BASE_URL}${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get<GestionesListResponse>(url);
  return response.data;
};

/**
 * GET /api/gestiones/activa
 * Obtiene la gestión activa del sistema (activo_sistema = true)
 * Backend: gestiones.routes.ts línea 70-95
 */
export const getGestionActiva = async (): Promise<Gestion> => {
  const response = await apiClient.get<GestionActivaResponse>(
    `${BASE_URL}/activa`
  );
  return response.data.data;
};

/**
 * GET /api/gestiones/:id
 * Obtiene una gestión por ID
 * Backend: gestiones.routes.ts línea 101-128
 */
export const getGestionById = async (id: string): Promise<Gestion> => {
  const response = await apiClient.get<GestionActivaResponse>(
    `${BASE_URL}/${id}`
  );
  return response.data.data;
};

/**
 * POST /api/gestiones
 * Crea una nueva gestión
 * Solo admin
 * Backend: gestiones.routes.ts línea 135-161
 */
export const createGestion = async (
  data: CreateGestionInput
): Promise<Gestion> => {
  const response = await apiClient.post<ActivarGestionResponse>(
    BASE_URL,
    data
  );
  return response.data.data;
};

/**
 * PUT /api/gestiones/:id
 * Actualiza una gestión existente
 * Solo admin
 * Backend: gestiones.routes.ts línea 168-197
 */
export const updateGestion = async (
  id: string,
  data: UpdateGestionInput
): Promise<Gestion> => {
  const response = await apiClient.put<ActivarGestionResponse>(
    `${BASE_URL}/${id}`,
    data
  );
  return response.data.data;
};

/**
 * DELETE /api/gestiones/:id
 * Elimina (desactiva) una gestión
 * Solo admin
 * Backend: gestiones.routes.ts línea 204-231
 */
export const deleteGestion = async (id: string): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/${id}`);
};

/**
 * POST /api/gestiones/:id/activar
 * Activa una gestión como la gestión activa del sistema
 * ACCIÓN CRÍTICA: Afecta a TODO el sistema
 * Solo admin
 * Backend: gestiones.routes.ts línea 239-272
 *
 * @param id - ID de la gestión a activar
 * @returns La gestión activada y un mensaje de confirmación
 */
export const activarGestion = async (
  id: string
): Promise<{ gestion: Gestion; message: string }> => {
  const response = await apiClient.post<ActivarGestionResponse>(
    `${BASE_URL}/${id}/activar`
  );
  return {
    gestion: response.data.data,
    message: response.data.message,
  };
};

// Export como objeto para consistencia con otros servicios
export const gestionesService = {
  listGestiones,
  getGestionActiva,
  getGestionById,
  createGestion,
  updateGestion,
  deleteGestion,
  activarGestion,
};
