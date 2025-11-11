// Usuario completo del sistema
export interface Usuario {
  id_usuario: string;
  username: string;
  email: string;
  nombre_completo: string;
  id_rol: string;
  nombre_rol: string;
  comunidades_ids?: string[];
  comunidades?: Array<{
    id_comunidad: string;
    nombre_comunidad: string;
  }>;
  activo: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

// Datos para crear usuario
export interface CreateUsuarioInput {
  username: string;
  email: string;
  password: string;
  nombre_completo: string;
  id_rol: string;
  comunidades_ids?: string[];
}

// Datos para actualizar usuario
export interface UpdateUsuarioInput {
  email?: string;
  nombre_completo?: string;
  comunidades_ids?: string[];
  activo?: boolean;
}

// Filtros para listado
export interface UsuarioFilters {
  nombre?: string;
  rol?: string;
  comunidad?: string;
  activo?: boolean;
}

// Respuesta del backend con lista
export interface UsuarioListResponse {
  usuarios: Usuario[];
  total: number;
}
