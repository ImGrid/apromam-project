/**
 * API Types
 * Tipos compartidos para respuestas y errores de la API
 */

/**
 * Estructura de error estandar de la API
 */
export interface ApiErrorResponse {
  error: string;
  message: string;
  timestamp: string;
}

/**
 * Estructura de respuesta para paginacion
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
}

/**
 * Estructura de respuesta para listas simples
 * Usar con el nombre especifico del recurso
 * Ejemplo: { usuarios: User[], total: 5 }
 */
export interface ListResponse<T> {
  data?: T[];
  total: number;
}

/**
 * Estructura de respuesta para un solo item
 * Usar con el nombre especifico del recurso
 * Ejemplo: { usuario: User, message: "..." }
 */
export interface SingleItemResponse<T> {
  data?: T;
  message?: string;
}

/**
 * Estructura de respuesta con mensaje
 */
export interface MessageResponse {
  message: string;
}

/**
 * Estructura de tokens JWT
 */
export interface TokensResponse {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
}

/**
 * Estructura de usuario publico
 */
export interface UserPublicData {
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

/**
 * Estructura de respuesta de login/register
 */
export interface AuthResponse {
  user: UserPublicData;
  tokens: TokensResponse;
  message?: string;
}
