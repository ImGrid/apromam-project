/**
 * Token Storage
 * Manejo de tokens JWT en localStorage
 */

const TOKEN_KEYS = {
  ACCESS_TOKEN: "apromam_access_token",
  REFRESH_TOKEN: "apromam_refresh_token",
} as const;

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
}

/**
 * Guarda los tokens en localStorage
 */
export function saveTokens(tokens: AuthTokens): void {
  try {
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.access_token);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.refresh_token);
  } catch (error) {
    console.error("Error guardando tokens:", error);
  }
}

/**
 * Obtiene el access token desde localStorage
 */
export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error("Error obteniendo access token:", error);
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
    console.error("Error obteniendo refresh token:", error);
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
  } catch (error) {
    console.error("Error eliminando tokens:", error);
  }
}

/**
 * Verifica si existe un access token valido
 */
export function hasValidToken(): boolean {
  const token = getAccessToken();
  return token !== null && token.length > 0;
}
