/**
 * Datos públicos del usuario autenticado
 * Retornado por el backend en login/register/me
 */
export interface User {
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
 * Permisos del usuario por rol
 * Retornado por /api/auth/me
 */
export interface UserPermissions {
  [key: string]: boolean | string | number | undefined;
}

/**
 * Par de tokens JWT retornados por el backend
 */
export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number; // Segundos hasta expiración
}

/**
 * Payload decodificado del JWT (estándar)
 */
export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
  comunidadId?: string;
  iat: number; // Issued at (timestamp)
  exp: number; // Expiration (timestamp)
}

/**
 * Input para registro de usuario
 */
export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  nombre_completo: string;
  id_rol: string;
  id_comunidad?: string;
}

/**
 * Input para login
 */
export interface LoginInput {
  username: string;
  password: string;
}

/**
 * Input para refresh token
 */
export interface RefreshTokenInput {
  refresh_token: string;
}

/**
 * Respuesta de login/register exitoso
 */
export interface AuthResponse {
  user: User;
  tokens: TokenPair;
  message?: string;
}

/**
 * Respuesta de /api/auth/me
 */
export interface MeResponse {
  user: User;
  permisos: UserPermissions;
}

/**
 * Respuesta de refresh token
 */
export interface RefreshResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
}

/**
 * Estructura de error del backend
 */
export interface AuthError {
  error: string;
  message: string;
  timestamp: string;
}

/**
 * Tipos de errores comunes
 */
export type AuthErrorType =
  | "unauthorized"
  | "invalid_credentials"
  | "token_expired"
  | "invalid_refresh_token"
  | "too_many_requests"
  | "conflict"
  | "validation_error"
  | "internal_error"
  | "network_error";

/**
 * Estado de la sesión del usuario
 */
export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated";

/**
 * Estado completo del store de autenticación
 */
export interface AuthState {
  // Datos del usuario
  user: User | null;
  permisos: UserPermissions | null;

  // Estado de la sesión
  status: AuthStatus;
  isAuthenticated: boolean;

  // Tokens (solo se usan para verificación, no se exponen)
  tokens: TokenPair | null;

  // Estado de carga
  isLoading: boolean;
  error: string | null;
}

/**
 * Acciones del store de autenticación
 */
export interface AuthActions {
  // Autenticación
  login: (credentials: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;

  // Gestión de sesión
  refreshSession: () => Promise<void>;
  loadUserFromStorage: () => Promise<void>;

  // Actualización de datos
  updateUser: (user: User) => void;
  updateTokens: (tokens: TokenPair) => void;

  // Limpieza
  clearAuth: () => void;
  clearError: () => void;
}

/**
 * Store completo de autenticación
 */
export type AuthStore = AuthState & AuthActions;
