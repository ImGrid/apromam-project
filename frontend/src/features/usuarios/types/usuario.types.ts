// Usuario completo del sistema
export interface Usuario {
  id_usuario: string;
  username: string;
  email: string;
  nombre_completo: string;
  id_rol: string;
  nombre_rol: string;
  id_comunidad?: string;
  nombre_comunidad?: string;
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
  id_comunidad?: string;
}

// Datos para actualizar usuario
export interface UpdateUsuarioInput {
  email?: string;
  nombre_completo?: string;
  id_comunidad?: string | null;
  activo?: boolean;
}

// Filtros para listado
export interface UsuarioFilters {
  rol?: string;
  comunidad_id?: string;
  activo?: boolean;
  search?: string;
}

// Respuesta del backend con lista
export interface UsuarioListResponse {
  usuarios: Usuario[];
  total: number;
}
