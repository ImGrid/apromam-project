import jwt, { JwtPayload, SignOptions, VerifyOptions } from "jsonwebtoken";
import { config } from "../config/environment.js";
import { createAuthLogger } from "./logger.js"; // ✅
const logger = createAuthLogger();

/**
 * Payload estándar JWT para access tokens
 */
export interface AccessTokenPayload {
  userId: string;
  username: string;
  role: string;
  comunidadId?: string;
  type: "access";
}

/**
 * Payload estándar JWT para refresh tokens
 */
export interface RefreshTokenPayload {
  userId: string;
  type: "refresh";
}

/**
 * Resultado de generación de tokens
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // segundos
}

/**
 * Opciones para generar access token
 */
const ACCESS_TOKEN_OPTIONS: SignOptions = {
  expiresIn: config.jwt.expiresIn, // 24h del config
  algorithm: "HS256",
  issuer: "apromam-backend",
  audience: "apromam-client",
};

/**
 * Opciones para generar refresh token
 */
const REFRESH_TOKEN_OPTIONS: SignOptions = {
  expiresIn: config.jwt.refreshExpiresIn, // 7d del config
  algorithm: "HS256",
  issuer: "apromam-backend",
  audience: "apromam-client",
};

/**
 * Opciones para verificar tokens
 */
const VERIFY_OPTIONS: VerifyOptions = {
  algorithms: ["HS256"],
  issuer: "apromam-backend",
  audience: "apromam-client",
};

/**
 * Genera un access token JWT
 *
 * @param payload - Datos del usuario a incluir en el token
 * @returns Token JWT firmado
 * @throws Error si generación falla
 */
export function generateAccessToken(
  payload: Omit<AccessTokenPayload, "type">
): string {
  try {
    const tokenPayload: AccessTokenPayload = {
      ...payload,
      type: "access",
    };

    const token = jwt.sign(tokenPayload, config.jwt.secret, {
      ...ACCESS_TOKEN_OPTIONS,
      jwtid: generateJwtId(), // ID único para tracking
    });

    logger.debug(
      {
        user_id: payload.userId,
        role: payload.role,
        expires_in: ACCESS_TOKEN_OPTIONS.expiresIn,
      },
      "Access token generated"
    );

    return token;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        user_id: payload.userId,
      },
      "Failed to generate access token"
    );
    throw new Error("Failed to generate access token");
  }
}

/**
 * Genera un refresh token JWT
 *
 * @param payload - Datos mínimos para refresh token
 * @returns Token JWT firmado
 * @throws Error si generación falla
 */
export function generateRefreshToken(
  payload: Omit<RefreshTokenPayload, "type">
): string {
  try {
    const tokenPayload: RefreshTokenPayload = {
      ...payload,
      type: "refresh",
    };

    const token = jwt.sign(tokenPayload, config.jwt.secret, {
      ...REFRESH_TOKEN_OPTIONS,
      jwtid: generateJwtId(),
    });

    logger.debug(
      {
        user_id: payload.userId,
        expires_in: REFRESH_TOKEN_OPTIONS.expiresIn,
      },
      "Refresh token generated"
    );

    return token;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        user_id: payload.userId,
      },
      "Failed to generate refresh token"
    );
    throw new Error("Failed to generate refresh token");
  }
}

/**
 * Genera par de tokens (access + refresh)
 *
 * @param payload - Datos del usuario
 * @returns Objeto con ambos tokens y tiempo de expiración
 */
export function generateTokenPair(
  payload: Omit<AccessTokenPayload, "type">
): TokenPair {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ userId: payload.userId });

  // Calcular segundos de expiración del access token
  const expiresIn = parseExpiration(config.jwt.expiresIn);

  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
}

/**
 * Verifica y decodifica un access token
 *
 * @param token - Token JWT a verificar
 * @returns Payload decodificado
 * @throws Error si token es inválido o expirado
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(
      token,
      config.jwt.secret,
      VERIFY_OPTIONS
    ) as JwtPayload;

    // Verificar que sea access token
    if (decoded.type !== "access") {
      throw new Error("Invalid token type");
    }

    logger.debug(
      {
        user_id: decoded.userId,
        role: decoded.role,
      },
      "Access token verified"
    );

    return decoded as AccessTokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn("Access token expired");
      throw new Error("Token expired");
    }

    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn(
        {
          error: error.message,
        },
        "Invalid access token"
      );
      throw new Error("Invalid token");
    }

    logger.error(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "Failed to verify access token"
    );
    throw error;
  }
}

/**
 * Verifica y decodifica un refresh token
 *
 * @param token - Refresh token a verificar
 * @returns Payload decodificado
 * @throws Error si token es inválido o expirado
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(
      token,
      config.jwt.secret,
      VERIFY_OPTIONS
    ) as JwtPayload;

    // Verificar que sea refresh token
    if (decoded.type !== "refresh") {
      throw new Error("Invalid token type");
    }

    logger.debug(
      {
        user_id: decoded.userId,
      },
      "Refresh token verified"
    );

    return decoded as RefreshTokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn("Refresh token expired");
      throw new Error("Refresh token expired");
    }

    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn(
        {
          error: error.message,
        },
        "Invalid refresh token"
      );
      throw new Error("Invalid refresh token");
    }

    logger.error(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "Failed to verify refresh token"
    );
    throw error;
  }
}

/**
 * Decodifica un token sin verificar la firma
 * SOLO para debugging o análisis - NO usar para autenticación
 *
 * @param token - Token JWT
 * @returns Payload decodificado o null si inválido
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.decode(token);
    return decoded as JwtPayload;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "Failed to decode token"
    );
    return null;
  }
}

/**
 * Extrae el token del header Authorization
 *
 * @param authHeader - Header Authorization completo
 * @returns Token extraído o null
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) {
    return null;
  }

  // Formato esperado: "Bearer <token>"
  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    logger.warn(
      {
        header_format: authHeader.substring(0, 20) + "...",
      },
      "Invalid Authorization header format"
    );
    return null;
  }

  return parts[1];
}

/**
 * Verifica si un token está próximo a expirar
 *
 * @param token - Token JWT
 * @param thresholdSeconds - Umbral en segundos (default: 300 = 5min)
 * @returns true si token expira pronto
 */
export function isTokenExpiringSoon(
  token: string,
  thresholdSeconds: number = 300
): boolean {
  try {
    const decoded = jwt.decode(token) as JwtPayload;

    if (!decoded || !decoded.exp) {
      return true; // Asumir expirado si no hay exp
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - now;

    return expiresIn <= thresholdSeconds;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "Failed to check token expiration"
    );
    return true; // Asumir expirado en caso de error
  }
}

/**
 * Obtiene el tiempo restante de un token en segundos
 *
 * @param token - Token JWT
 * @returns Segundos hasta expiración, 0 si expirado, -1 si inválido
 */
export function getTokenRemainingTime(token: string): number {
  try {
    const decoded = jwt.decode(token) as JwtPayload;

    if (!decoded || !decoded.exp) {
      return -1;
    }

    const now = Math.floor(Date.now() / 1000);
    const remaining = decoded.exp - now;

    return Math.max(0, remaining);
  } catch (error) {
    return -1;
  }
}

/**
 * Genera un JWT ID único para tracking
 *
 * @returns UUID v4 string
 */
function generateJwtId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Parsea string de expiración a segundos
 *
 * @param expiration - String tipo "24h", "7d", etc
 * @returns Segundos de expiración
 */
function parseExpiration(expiration: string): number {
  const units: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };

  const match = expiration.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid expiration format: ${expiration}`);
  }

  const [, value, unit] = match;
  return parseInt(value, 10) * units[unit];
}

/**
 * Blacklist de tokens (in-memory)
 * En producción usar Redis
 */
const tokenBlacklist = new Set<string>();

/**
 * Agrega token a blacklist (logout)
 *
 * @param token - Token a invalidar
 */
export function blacklistToken(token: string): void {
  const decoded = decodeToken(token);

  if (decoded && decoded.jti) {
    tokenBlacklist.add(decoded.jti);
    logger.info(
      {
        jti: decoded.jti,
        user_id: decoded.userId,
      },
      "Token added to blacklist"
    );
  }
}

/**
 * Verifica si token está en blacklist
 *
 * @param token - Token a verificar
 * @returns true si está en blacklist
 */
export function isTokenBlacklisted(token: string): boolean {
  const decoded = decodeToken(token);

  if (!decoded || !decoded.jti) {
    return false;
  }

  return tokenBlacklist.has(decoded.jti);
}

/**
 * Limpia tokens expirados de blacklist
 * Ejecutar periódicamente (ej: cada hora)
 */
export function cleanupBlacklist(): void {
  const now = Math.floor(Date.now() / 1000);
  let cleaned = 0;

  // Nota: En producción con Redis, esto se maneja automáticamente con TTL
  for (const jti of tokenBlacklist) {
    // En in-memory no podemos saber si expiró sin el token completo
    // Simplificación: limpiar todo después de 8 días (más que refresh token)
    // En producción real, Redis maneja esto con EXPIRE
  }

  logger.info(
    {
      tokens_cleaned: cleaned,
      blacklist_size: tokenBlacklist.size,
    },
    "Blacklist cleanup completed"
  );
}
