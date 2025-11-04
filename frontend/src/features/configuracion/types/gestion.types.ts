/**
 * Tipos para Gestiones (Configuración del Sistema)
 *
 * IMPORTANTE: Estos tipos coinciden EXACTAMENTE con backend/src/entities/Gestion.ts
 * GestionPublicData (línea 12-19)
 */

// Gestion completa (coincide con GestionPublicData del backend)
export interface Gestion {
  id_gestion: string;
  anio_gestion: number;
  activa: boolean;
  activo_sistema: boolean;  // Campo que indica si es la gestión activa del sistema
}

// Input para crear gestión
// Coincide con CreateGestionSchema del backend
export interface CreateGestionInput {
  anio_gestion: number;
}

// Input para actualizar gestión
// Coincide con UpdateGestionSchema del backend (línea 90-100)
export interface UpdateGestionInput {
  activa?: boolean;
  activo_sistema?: boolean;  // Campo del backend schema línea 99
}

// Respuesta de lista de gestiones
// Coincide con response de GET /api/gestiones
export interface GestionesListResponse {
  data: Gestion[];
  total: number;
}

// Respuesta de gestión activa
// Coincide con response de GET /api/gestiones/activa
export interface GestionActivaResponse {
  data: Gestion;
}

// Respuesta de activar gestión
// Coincide con response de POST /api/gestiones/:id/activar
export interface ActivarGestionResponse {
  data: Gestion;
  message: string;
}
