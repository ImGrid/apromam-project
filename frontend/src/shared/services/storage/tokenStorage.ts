/**
 * Token Storage
 * Manejo de tokens JWT en localStorage con validación de expiración
 * Actualizado con mejores prácticas 2024-2025
 */

import type { TokenPair, JWTPayload } from "@/features/auth/types/auth.types";

const TOKEN_KEYS = {
  ACCESS_TOKEN: "apromam_access_token",
  REFRESH_TOKEN: "apromam_refresh_token",
  EXPIRES_AT: "apromam_token_expires_at", // Timestamp de expiración
} as const;

/**
 * Decodifica un JWT sin verificar la firma
 * Solo para leer el payload y verificar expiración
 * IMPORTANTE: La firma se verifica en el backend
 */
function decodeJWT(token: string): JWTPayload | null {
  try {
    // JWT tiene formato: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Decodificar payload (segunda parte)
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verifica si un token JWT ha expirado
 */
export function isTokenExpired(
  token: string | null,
  bufferSeconds: number = 60
): boolean {
  if (!token) return true;

  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;

  // Comparar con timestamp actual (con buffer)
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = payload.exp - bufferSeconds;

  return now >= expiresAt;
}

/**
 * Obtiene el timestamp de expiración de un token
 */
export function getTokenExpirationTime(token: string | null): number | null {
  if (!token) return null;

  const payload = decodeJWT(token);
  return payload?.exp || null;
}

/**
 * Obtiene el payload completo de un token (sin verificar firma)
 */
export function getTokenPayload(token: string | null): JWTPayload | null {
  if (!token) return null;
  return decodeJWT(token);
}

/**
 * Guarda los tokens JWT en localStorage
 * También calcula y guarda el timestamp de expiración
 */
export function saveTokens(tokens: TokenPair): void {
  try {
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.access_token);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.refresh_token);

    // Calcular y guardar timestamp de expiración
    const expiresAt = getTokenExpirationTime(tokens.access_token);
    if (expiresAt) {
      localStorage.setItem(TOKEN_KEYS.EXPIRES_AT, expiresAt.toString());
    }
  } catch (error) {
  }
}

/**
 * Obtiene el access token desde localStorage
 */
export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  } catch (error) {
    return null;
  }
}

/**
 * Obtiene el refresh token desde localStorage
 */
export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  } catch (error) {
    return null;
  }
}

/**
 * Elimina todos los tokens del localStorage
 */
export function clearTokens(): void {
  try {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.EXPIRES_AT);
  } catch (error) {
  }
}

/**
 * Verifica si existe un access token válido (no expirado)
 */
export function hasValidToken(bufferSeconds: number = 60): boolean {
  const token = getAccessToken();
  if (!token) return false;

  return !isTokenExpired(token, bufferSeconds);
}

/**
 * Verifica si el access token necesita ser refrescado pronto
 */
export function shouldRefreshToken(thresholdSeconds: number = 300): boolean {
  const token = getAccessToken();
  if (!token) return false;

  const expiresAt = getTokenExpirationTime(token);
  if (!expiresAt) return false;

  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = expiresAt - now;

  return timeUntilExpiry > 0 && timeUntilExpiry <= thresholdSeconds;
}

/**
 * Obtiene el tiempo restante hasta la expiración en segundos
 */
export function getTimeUntilExpiry(): number | null {
  const token = getAccessToken();
  if (!token) return null;

  const expiresAt = getTokenExpirationTime(token);
  if (!expiresAt) return null;

  const now = Math.floor(Date.now() / 1000);
  const remaining = expiresAt - now;

  return remaining > 0 ? remaining : 0;
}

/**
 * Obtiene el ID del usuario del token actual
 */
export function getUserIdFromToken(): string | null {
  const token = getAccessToken();
  if (!token) return null;

  const payload = decodeJWT(token);
  return payload?.userId || null;
}

/**
 * Obtiene el rol del usuario del token actual
 */
export function getUserRoleFromToken(): string | null {
  const token = getAccessToken();
  if (!token) return null;

  const payload = decodeJWT(token);
  return payload?.role || null;
}

/**
 * Verifica si el usuario tiene un rol específico
 */
export function hasRole(role: string): boolean {
  const userRole = getUserRoleFromToken();
  return userRole === role;
}
