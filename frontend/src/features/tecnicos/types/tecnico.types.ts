/**
 * Tipos para la gestión de técnicos
 * Basado en el tipo Usuario pero especializado para técnicos
 */

// Técnico es un tipo de usuario con rol "tecnico"
export interface Tecnico {
  id_usuario: string;
  username: string;
  email: string;
  nombre_completo: string;
  comunidades_ids?: string[];
  comunidades?: Array<{
    id_comunidad: string;
    nombre_comunidad: string;
  }>;
  activo: boolean;
  created_at: string;
  last_login?: string;
}

// Filtros específicos para técnicos
export interface TecnicoFilters {
  comunidad_id?: string;
  activo?: boolean;
  sin_comunidad?: boolean;
  search?: string;
}

// Input para asignar comunidades a técnico (N:N)
export interface AsignarComunidadesInput {
  comunidades_ids: string[];
}

// Respuesta del backend con lista de técnicos
export interface TecnicoListResponse {
  usuarios: Tecnico[];
  total: number;
}
