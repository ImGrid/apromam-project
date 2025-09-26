import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { RolRepository } from "../repositories/RolRepository.js";
import { Usuario } from "../entities/Usuario.js";
import {
  hashPassword,
  verifyPasswordSafe,
  validatePasswordStrength,
} from "../utils/hash.utils.js";
import {
  generateTokenPair,
  verifyRefreshToken,
  blacklistToken,
  TokenPair,
} from "../utils/jwt.utils.js";
import { createAuthLogger } from "../utils/logger.js";
import type {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  UserPublicData,
} from "../schemas/auth.schema.js";

const logger = createAuthLogger();

/**
 * Resultado de operación de registro
 */
export interface RegisterResult {
  user: UserPublicData;
  tokens: TokenPair;
}

/**
 * Resultado de operación de login
 */
export interface LoginResult {
  user: UserPublicData;
  tokens: TokenPair;
}

/**
 * Resultado de operación de refresh
 */
export interface RefreshResult {
  accessToken: string;
  expiresIn: number;
}

/**
 * Resultado de operación me (usuario autenticado)
 */
export interface MeResult {
  user: UserPublicData;
  permisos: Record<string, any>;
}

/**
 * Rate limiting para login (in-memory)
 * En producción usar Redis
 */
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

/**
 * Límite de intentos de login
 */
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutos

export class AuthService {
  private usuarioRepository: UsuarioRepository;
  private rolRepository: RolRepository;

  constructor(
    usuarioRepository: UsuarioRepository,
    rolRepository: RolRepository
  ) {
    this.usuarioRepository = usuarioRepository;
    this.rolRepository = rolRepository;
  }

  /**
   * Registra un nuevo usuario en el sistema
   *
   * @param input - Datos de registro validados por Zod
   * @returns Usuario creado con tokens
   * @throws Error si validación falla o username/email ya existen
   */
  async register(input: RegisterInput): Promise<RegisterResult> {
    logger.info(
      {
        username: input.username,
        email: input.email,
        id_rol: input.id_rol,
      },
      "Starting user registration"
    );

    // Validar fortaleza del password
    const passwordValidation = validatePasswordStrength(input.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.error);
    }

    // Verificar que el rol existe
    const rol = await this.rolRepository.findById(input.id_rol);
    if (!rol) {
      throw new Error("Rol no encontrado");
    }

    // Validar que técnico tenga comunidad asignada
    if (rol.esTecnico() && !input.id_comunidad) {
      throw new Error("Técnico debe tener comunidad asignada");
    }

    // Verificar que username no existe
    const existeUsername = await this.usuarioRepository.existsByUsername(
      input.username
    );
    if (existeUsername) {
      throw new Error("Username ya existe");
    }

    // Verificar que email no existe
    const existeEmail = await this.usuarioRepository.existsByEmail(input.email);
    if (existeEmail) {
      throw new Error("Email ya existe");
    }

    // Hashear password
    const passwordHash = await hashPassword(input.password);

    // Crear entidad Usuario
    const usuario = Usuario.create(
      {
        username: input.username,
        email: input.email,
        password: input.password, // No se usa, solo para tipo
        nombre_completo: input.nombre_completo,
        id_rol: input.id_rol,
        id_comunidad: input.id_comunidad ?? undefined,
      },
      passwordHash
    );

    // Guardar en base de datos
    const usuarioCreado = await this.usuarioRepository.create(usuario);

    logger.info(
      {
        user_id: usuarioCreado.id,
        username: usuarioCreado.username,
        role: usuarioCreado.nombreRol,
      },
      "User registered successfully"
    );

    // Generar tokens JWT
    const tokens = generateTokenPair({
      userId: usuarioCreado.id,
      username: usuarioCreado.username,
      role: usuarioCreado.nombreRol || "unknown",
      comunidadId: usuarioCreado.idComunidad || undefined,
    });

    return {
      user: usuarioCreado.toJSON(),
      tokens,
    };
  }

  /**
   * Autentica un usuario con username y password
   *
   * @param input - Credenciales validadas por Zod
   * @returns Usuario autenticado con tokens
   * @throws Error si credenciales inválidas o rate limit excedido
   */
  async login(input: LoginInput): Promise<LoginResult> {
    const { username, password } = input;

    logger.info(
      {
        username,
        ip: "unknown", // El controller debe pasar esto
      },
      "Login attempt"
    );

    // Verificar rate limiting
    this.checkLoginRateLimit(username);

    // Buscar usuario por username
    const usuario = await this.usuarioRepository.findByUsername(username);

    // Verificar password con timing attack prevention
    const isValidPassword = await verifyPasswordSafe(
      password,
      usuario?.passwordHash
    );

    // Si usuario no existe O password inválido
    if (!usuario || !isValidPassword) {
      // Incrementar intentos fallidos
      this.incrementLoginAttempts(username);

      logger.warn(
        {
          username,
          user_exists: !!usuario,
        },
        "Login failed: Invalid credentials"
      );

      throw new Error("Credenciales inválidas");
    }

    // Verificar que usuario esté activo
    if (!usuario.activo) {
      logger.warn(
        {
          user_id: usuario.id,
          username,
        },
        "Login failed: User inactive"
      );

      throw new Error("Usuario inactivo");
    }

    // Login exitoso - resetear intentos
    this.resetLoginAttempts(username);

    logger.info(
      {
        user_id: usuario.id,
        username: usuario.username,
        role: usuario.nombreRol,
      },
      "Login successful"
    );

    // Actualizar last_login (async, no esperar)
    this.usuarioRepository
      .updateLastLogin(usuario.id)
      .catch((err) =>
        logger.error({ error: err.message }, "Failed to update last_login")
      );

    // Generar tokens JWT
    const tokens = generateTokenPair({
      userId: usuario.id,
      username: usuario.username,
      role: usuario.nombreRol || "unknown",
      comunidadId: usuario.idComunidad || undefined,
    });

    return {
      user: usuario.toJSON(),
      tokens,
    };
  }

  /**
   * Renueva access token usando refresh token
   *
   * @param input - Refresh token validado por Zod
   * @returns Nuevo access token
   * @throws Error si refresh token inválido o expirado
   */
  async refresh(input: RefreshTokenInput): Promise<RefreshResult> {
    logger.debug("Refresh token request");

    // Verificar refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(input.refresh_token);
    } catch (error) {
      logger.warn(
        {
          error: error instanceof Error ? error.message : "Unknown error",
        },
        "Refresh token verification failed"
      );

      throw new Error("Refresh token inválido o expirado");
    }

    // Obtener usuario actualizado de BD
    const usuario = await this.usuarioRepository.findById(decoded.userId);

    if (!usuario) {
      logger.error(
        {
          user_id: decoded.userId,
        },
        "User not found for refresh token"
      );

      throw new Error("Usuario no encontrado");
    }

    if (!usuario.activo) {
      logger.warn(
        {
          user_id: usuario.id,
        },
        "Refresh failed: User inactive"
      );

      throw new Error("Usuario inactivo");
    }

    // Generar nuevo access token
    const tokens = generateTokenPair({
      userId: usuario.id,
      username: usuario.username,
      role: usuario.nombreRol || "unknown",
      comunidadId: usuario.idComunidad || undefined,
    });

    logger.info(
      {
        user_id: usuario.id,
        username: usuario.username,
      },
      "Access token refreshed"
    );

    return {
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
    };
  }

  /**
   * Cierra sesión del usuario (invalida token)
   *
   * @param token - Access token a invalidar
   */
  async logout(token: string): Promise<void> {
    logger.info("Logout request");

    // Agregar token a blacklist
    blacklistToken(token);

    logger.info("User logged out successfully");
  }

  /**
   * Obtiene información del usuario autenticado
   *
   * @param userId - ID del usuario autenticado
   * @returns Usuario con permisos completos
   * @throws Error si usuario no encontrado
   */
  async me(userId: string): Promise<MeResult> {
    const usuario = await this.usuarioRepository.findById(userId);

    if (!usuario) {
      logger.error(
        {
          user_id: userId,
        },
        "User not found for /me endpoint"
      );

      throw new Error("Usuario no encontrado");
    }

    // Obtener permisos del rol
    const rol = await this.rolRepository.findById(usuario.idRol);
    const permisos = rol?.permisos || {};

    logger.debug(
      {
        user_id: usuario.id,
        username: usuario.username,
      },
      "User info retrieved"
    );

    return {
      user: usuario.toJSON(),
      permisos,
    };
  }

  /**
   * Verifica rate limit de login
   * @throws Error si límite excedido
   */
  private checkLoginRateLimit(username: string): void {
    const now = Date.now();
    const attempts = loginAttempts.get(username);

    if (!attempts) {
      return; // Sin intentos previos
    }

    // Si ventana expiró, resetear
    if (now > attempts.resetAt) {
      loginAttempts.delete(username);
      return;
    }

    // Verificar si excede límite
    if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
      const minutesRemaining = Math.ceil((attempts.resetAt - now) / 60000);

      logger.warn(
        {
          username,
          attempts: attempts.count,
          minutes_remaining: minutesRemaining,
        },
        "Login rate limit exceeded"
      );

      throw new Error(
        `Demasiados intentos de login. Intenta en ${minutesRemaining} minuto(s)`
      );
    }
  }

  /**
   * Incrementa contador de intentos fallidos
   */
  private incrementLoginAttempts(username: string): void {
    const now = Date.now();
    const attempts = loginAttempts.get(username);

    if (!attempts) {
      loginAttempts.set(username, {
        count: 1,
        resetAt: now + LOGIN_ATTEMPT_WINDOW,
      });
    } else {
      attempts.count += 1;
    }
  }

  /**
   * Resetea contador de intentos (login exitoso)
   */
  private resetLoginAttempts(username: string): void {
    loginAttempts.delete(username);
  }
}
