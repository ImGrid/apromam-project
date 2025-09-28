import bcrypt from "bcryptjs";
import { createAuthLogger } from "./logger.js";
const logger = createAuthLogger();

// Rounds de salt para bcrypt
// 10 rounds = aproximadamente 100ms de tiempo de hash
// Balance entre seguridad y performance
// Ajustar segun el hardware del servidor
const SALT_ROUNDS = 10;

// Hashea un password usando bcrypt
// El salt se genera automaticamente
// Lanza error si el hash falla o el password es invalido
export async function hashPassword(plainPassword: string): Promise<string> {
  try {
    // Validar que el password no este vacio
    if (plainPassword.length < 1) {
      throw new Error("Password cannot be empty");
    }

    // bcrypt tiene limite de 72 bytes
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

// Verifica un password contra su hash
// Usa tiempo constante para prevenir timing attacks
// bcrypt.compare es constant-time por diseño
export async function verifyPassword(
  plainPassword: string,
  passwordHash: string
): Promise<boolean> {
  try {
    // Validar que los inputs no esten vacios
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

// Verifica un password con proteccion contra timing attacks
// Usa un hash dummy cuando el usuario no existe
// Siempre toma el mismo tiempo en responder
// Esto previene que un atacante pueda determinar si un usuario existe
export async function verifyPasswordSafe(
  plainPassword: string,
  passwordHash: string | null | undefined
): Promise<boolean> {
  try {
    // Hash dummy para timing attack prevention
    // Tiene el mismo formato que un hash real de bcrypt
    const dummyHash =
      "$2a$10$dummyhashfortimingattackprotectionxxxxxxxxxxxxxxxxxxxxxxxxx";

    // Siempre hacer compare, incluso si hash es null
    // Esto mantiene el tiempo de respuesta constante
    const hashToCompare = passwordHash || dummyHash;
    const isValid = await bcrypt.compare(plainPassword, hashToCompare);

    // Solo retornar true si hash existe Y password es valido
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

// Valida la fortaleza de un password antes de hashearlo
// Verifica requisitos minimos de seguridad
// Util para validacion en registro de usuarios
export function validatePasswordStrength(password: string): {
  valid: boolean;
  error?: string;
} {
  // Minimo 8 caracteres
  if (password.length < 8) {
    return {
      valid: false,
      error: "Password debe tener al menos 8 caracteres",
    };
  }

  // Maximo 72 caracteres (limite de bcrypt)
  if (password.length > 72) {
    return {
      valid: false,
      error: "Password no puede exceder 72 caracteres",
    };
  }

  // Al menos una mayuscula
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      error: "Password debe contener al menos una mayúscula",
    };
  }

  // Al menos una minuscula
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      error: "Password debe contener al menos una minúscula",
    };
  }

  // Al menos un numero
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      error: "Password debe contener al menos un número",
    };
  }

  return { valid: true };
}

// Genera un password aleatorio seguro
// Cumple con todos los requisitos de fortaleza
// Util para passwords temporales o testing
export function generateSecurePassword(length: number = 12): string {
  if (length < 8 || length > 72) {
    throw new Error("Password length must be between 8 and 72");
  }

  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const allChars = uppercase + lowercase + numbers + special;

  // Garantizar al menos un caracter de cada tipo
  let password = "";
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Rellenar el resto con caracteres aleatorios
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Mezclar los caracteres para evitar patron predecible
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

// Verifica si un hash necesita ser actualizado
// Retorna true si el hash usa menos rounds que el configurado actualmente
// Util para migrations o actualizaciones de seguridad
export function needsRehash(hash: string): boolean {
  try {
    // Extraer rounds del hash bcrypt
    // Formato bcrypt: $2a$10$... donde 10 es el numero de rounds
    const rounds = parseInt(hash.split("$")[2], 10);

    return rounds < SALT_ROUNDS;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "Failed to check if hash needs rehash"
    );
    // Si no podemos parsear el hash, asumir que necesita rehash
    return true;
  }
}
