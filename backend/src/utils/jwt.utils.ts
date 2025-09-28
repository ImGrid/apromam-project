import jwt, { JwtPayload, SignOptions, VerifyOptions } from "jsonwebtoken";
import { config } from "../config/environment.js";
import { createAuthLogger } from "./logger.js";
const logger = createAuthLogger();

// Payload que se incluye en los access tokens
// Contiene informacion del usuario para identificarlo en cada request
export interface AccessTokenPayload {
  userId: string;
  username: string;
  role: string;
  comunidadId?: string;
  type: "access";
}

// Payload que se incluye en los refresh tokens
// Solo contiene el userId por seguridad
// Los refresh tokens son de larga duracion y solo sirven para renovar access tokens
export interface RefreshTokenPayload {
  userId: string;
  type: "refresh";
}

// Resultado que retorna la generacion de tokens
// Incluye ambos tokens y tiempo de expiracion
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Opciones para generar access tokens
// Configuracion de expiracion, algoritmo e issuer
const ACCESS_TOKEN_OPTIONS: SignOptions = {
  expiresIn: config.jwt.expiresIn,
  algorithm: "HS256",
  issuer: "apromam-backend",
  audience: "apromam-client",
};

// Opciones para generar refresh tokens
// Duracion mas larga que access tokens
const REFRESH_TOKEN_OPTIONS: SignOptions = {
  expiresIn: config.jwt.refreshExpiresIn,
  algorithm: "HS256",
  issuer: "apromam-backend",
  audience: "apromam-client",
};

// Opciones para verificar tokens
// Valida algoritmo, issuer y audience
const VERIFY_OPTIONS: VerifyOptions = {
  algorithms: ["HS256"],
  issuer: "apromam-backend",
  audience: "apromam-client",
};

// Genera un access token JWT
// Incluye datos del usuario y marca como tipo access
// Lanza error si la generacion falla
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
      jwtid: generateJwtId(),
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

// Genera un refresh token JWT
// Solo incluye userId por seguridad
// Lanza error si la generacion falla
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

// Genera un par de tokens (access y refresh)
// Retorna ambos tokens y el tiempo de expiracion del access token
export function generateTokenPair(
  payload: Omit<AccessTokenPayload, "type">
): TokenPair {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ userId: payload.userId });

  // Calcular segundos de expiracion del access token
  const expiresIn = parseExpiration(config.jwt.expiresIn);

  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
}

// Verifica y decodifica un access token
// Valida firma, expiracion, issuer y audience
// Lanza error si el token es invalido o expirado
export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(
      token,
      config.jwt.secret,
      VERIFY_OPTIONS
    ) as JwtPayload;

    // Verificar que sea access token y no refresh token
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

// Verifica y decodifica un refresh token
// Valida firma, expiracion, issuer y audience
// Lanza error si el token es invalido o expirado
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(
      token,
      config.jwt.secret,
      VERIFY_OPTIONS
    ) as JwtPayload;

    // Verificar que sea refresh token y no access token
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

// Decodifica un token sin verificar la firma
// SOLO para debugging o analisis, NO usar para autenticacion
// Retorna el payload o null si el token es invalido
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

// Extrae el token del header Authorization
// Formato esperado: "Bearer <token>"
// Retorna el token o null si el formato es invalido
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

// Verifica si un token esta proximo a expirar
// Util para renovar tokens automaticamente antes de que expiren
// thresholdSeconds: umbral en segundos (default: 300 = 5 minutos)
export function isTokenExpiringSoon(
  token: string,
  thresholdSeconds: number = 300
): boolean {
  try {
    const decoded = jwt.decode(token) as JwtPayload;

    if (!decoded || !decoded.exp) {
      return true;
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
    return true;
  }
}

// Obtiene el tiempo restante de un token en segundos
// Retorna 0 si esta expirado, -1 si es invalido
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

// Genera un ID unico para el JWT
// Se usa para tracking y revocacion de tokens
function generateJwtId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Convierte string de expiracion a segundos
// Formato: "24h", "7d", "30m", etc
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

// Blacklist de tokens en memoria
// En produccion se debe usar Redis para persistencia
const tokenBlacklist = new Set<string>();

// Agrega un token a la blacklist (logout)
// El token ya no podra ser usado para autenticacion
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

// Verifica si un token esta en la blacklist
// Retorna true si el token fue invalidado
export function isTokenBlacklisted(token: string): boolean {
  const decoded = decodeToken(token);

  if (!decoded || !decoded.jti) {
    return false;
  }

  return tokenBlacklist.has(decoded.jti);
}

// Limpia tokens expirados de la blacklist
// Se debe ejecutar periodicamente (ej: cada hora)
// En produccion con Redis esto se maneja automaticamente con TTL
export function cleanupBlacklist(): void {
  const now = Math.floor(Date.now() / 1000);
  let cleaned = 0;

  // Nota: En in-memory no podemos saber si expiro sin el token completo
  // En produccion con Redis, esto se maneja automaticamente con EXPIRE

  logger.info(
    {
      tokens_cleaned: cleaned,
      blacklist_size: tokenBlacklist.size,
    },
    "Blacklist cleanup completed"
  );
}
