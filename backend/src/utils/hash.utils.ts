import bcrypt from "bcryptjs";
import { createAuthLogger } from "./logger.js"; // ✅
const logger = createAuthLogger();

/**
 * Salt rounds para bcrypt
 * 10 = ~100ms hash time (balance seguridad/performance)
 * Ajustar según hardware del servidor
 */
const SALT_ROUNDS = 10;

/**
 * Hashea un password usando bcrypt
 * Salt se genera automáticamente
 *
 * @param plainPassword - Password en texto plano
 * @returns Hash bcrypt del password
 * @throws Error si hash falla
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  try {
    // Validar longitud antes de hashear
    if (plainPassword.length < 1) {
      throw new Error("Password cannot be empty");
    }

    // bcrypt tiene límite de 72 bytes
    if (plainPassword.length > 72) {
      throw new Error("Password exceeds maximum length of 72 characters");
    }

    const hash = await bcrypt.hash(plainPassword, SALT_ROUNDS);

    logger.debug(
      {
        salt_rounds: SALT_ROUNDS,
        hash_length: hash.length,
      },
      "Password hashed successfully"
    );

    return hash;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        salt_rounds: SALT_ROUNDS,
      },
      "Failed to hash password"
    );
    throw error;
  }
}

/**
 * Verifica un password contra su hash
 * Tiempo constante para prevenir timing attacks
 *
 * @param plainPassword - Password a verificar
 * @param passwordHash - Hash almacenado en BD
 * @returns true si password coincide, false caso contrario
 * @throws Error si verificación falla
 */
export async function verifyPassword(
  plainPassword: string,
  passwordHash: string
): Promise<boolean> {
  try {
    // Validar inputs
    if (!plainPassword || !passwordHash) {
      logger.warn("Empty password or hash provided for verification");
      return false;
    }

    // bcrypt.compare es constant-time por diseño
    const isValid = await bcrypt.compare(plainPassword, passwordHash);

    logger.debug(
      {
        is_valid: isValid,
      },
      "Password verification completed"
    );

    return isValid;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "Failed to verify password"
    );
    throw error;
  }
}

/**
 * Verifica un password con protección contra timing attacks
 * Usa dummy hash cuando usuario no existe
 *
 * @param plainPassword - Password a verificar
 * @param passwordHash - Hash almacenado (o null si usuario no existe)
 * @returns true si password coincide Y hash existe, false caso contrario
 */
export async function verifyPasswordSafe(
  plainPassword: string,
  passwordHash: string | null | undefined
): Promise<boolean> {
  try {
    // Dummy hash para timing attack prevention
    // Mismo formato que hash real de bcrypt
    const dummyHash =
      "$2a$10$dummyhashfortimingattackprotectionxxxxxxxxxxxxxxxxxxxxxxxxx";

    // Siempre hacer compare, incluso si hash es null
    const hashToCompare = passwordHash || dummyHash;
    const isValid = await bcrypt.compare(plainPassword, hashToCompare);

    // Solo retornar true si hash existe Y password es válido
    const result = passwordHash ? isValid : false;

    logger.debug(
      {
        has_hash: !!passwordHash,
        is_valid: result,
      },
      "Safe password verification completed"
    );

    return result;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "Failed to verify password safely"
    );
    return false;
  }
}

/**
 * Valida fortaleza de password antes de hashear
 * Útil para validación en registro
 *
 * @param password - Password a validar
 * @returns Objeto con resultado y mensaje de error si aplica
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  error?: string;
} {
  // Mínimo 8 caracteres
  if (password.length < 8) {
    return {
      valid: false,
      error: "Password debe tener al menos 8 caracteres",
    };
  }

  // Máximo 72 caracteres (límite bcrypt)
  if (password.length > 72) {
    return {
      valid: false,
      error: "Password no puede exceder 72 caracteres",
    };
  }

  // Al menos una mayúscula
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      error: "Password debe contener al menos una mayúscula",
    };
  }

  // Al menos una minúscula
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      error: "Password debe contener al menos una minúscula",
    };
  }

  // Al menos un número
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      error: "Password debe contener al menos un número",
    };
  }

  return { valid: true };
}

/**
 * Genera un password aleatorio seguro
 * Útil para passwords temporales o testing
 *
 * @param length - Longitud del password (default: 12)
 * @returns Password aleatorio que cumple requisitos de fortaleza
 */
export function generateSecurePassword(length: number = 12): string {
  if (length < 8 || length > 72) {
    throw new Error("Password length must be between 8 and 72");
  }

  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const allChars = uppercase + lowercase + numbers + special;

  // Garantizar al menos un carácter de cada tipo
  let password = "";
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Rellenar el resto con caracteres aleatorios
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle para evitar patrón predecible
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

/**
 * Compara hash complexity (para migrations o updates)
 * Retorna true si el hash necesita ser actualizado
 *
 * @param hash - Hash bcrypt existente
 * @returns true si hash usa menos rounds que SALT_ROUNDS actual
 */
export function needsRehash(hash: string): boolean {
  try {
    // Extraer rounds del hash bcrypt
    // Formato: $2a$10$... donde 10 es el número de rounds
    const rounds = parseInt(hash.split("$")[2], 10);

    return rounds < SALT_ROUNDS;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "Failed to check if hash needs rehash"
    );
    // Si no podemos parsear, asumir que necesita rehash
    return true;
  }
}
