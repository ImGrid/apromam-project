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

// Resultado que retorna el metodo de registro
// Incluye datos del usuario creado y los tokens JWT
export interface RegisterResult {
  user: UserPublicData;
  tokens: TokenPair;
}

// Resultado que retorna el metodo de login
// Incluye datos del usuario autenticado y los tokens JWT
export interface LoginResult {
  user: UserPublicData;
  tokens: TokenPair;
}

// Resultado que retorna el metodo de refresh token
// Solo incluye el nuevo access token
export interface RefreshResult {
  accessToken: string;
  expiresIn: number;
}

// Resultado que retorna el metodo me
// Incluye datos del usuario y sus permisos completos
export interface MeResult {
  user: UserPublicData;
  permisos: Record<string, any>;
}

// Control de intentos de login fallidos en memoria
// En produccion se debe usar Redis para persistencia entre reinicios
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

// Configuracion de rate limit para login
// Maximo 5 intentos fallidos cada 15 minutos
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_ATTEMPT_WINDOW = 15 * 60 * 1000;

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

  // Registra un nuevo usuario en el sistema
  // Valida fortaleza del password, verifica duplicados y asigna rol
  // Los tecnicos deben tener comunidad asignada obligatoriamente
  async register(input: RegisterInput): Promise<RegisterResult> {
    logger.info(
      {
        username: input.username,
        email: input.email,
        id_rol: input.id_rol,
      },
      "Starting user registration"
    );

    // Validar que el password cumple los requisitos minimos
    const passwordValidation = validatePasswordStrength(input.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.error);
    }

    // Verificar que el rol existe en la base de datos
    const rol = await this.rolRepository.findById(input.id_rol);
    if (!rol) {
      throw new Error("Rol no encontrado");
    }

    // Los tecnicos obligatoriamente deben tener comunidad
    if (rol.esTecnico() && !input.id_comunidad) {
      throw new Error("Técnico debe tener comunidad asignada");
    }

    // Verificar que el username no este en uso
    const existeUsername = await this.usuarioRepository.existsByUsername(
      input.username
    );
    if (existeUsername) {
      throw new Error("Username ya existe");
    }

    // Verificar que el email no este en uso
    const existeEmail = await this.usuarioRepository.existsByEmail(input.email);
    if (existeEmail) {
      throw new Error("Email ya existe");
    }

    // Hashear el password antes de guardarlo
    const passwordHash = await hashPassword(input.password);

    // Crear la entidad Usuario con los datos validados
    const usuario = Usuario.create(
      {
        username: input.username,
        email: input.email,
        password: input.password,
        nombre_completo: input.nombre_completo,
        id_rol: input.id_rol,
        id_comunidad: input.id_comunidad ?? undefined,
      },
      passwordHash
    );

    // Guardar el usuario en la base de datos
    const usuarioCreado = await this.usuarioRepository.create(usuario);

    logger.info(
      {
        user_id: usuarioCreado.id,
        username: usuarioCreado.username,
        role: usuarioCreado.nombreRol,
      },
      "User registered successfully"
    );

    // Obtener comunidades asignadas (N:N)
    const comunidadesIds = await this.usuarioRepository.findComunidadesByUsuario(
      usuarioCreado.id
    );

    // Generar los tokens JWT para autenticacion
    const tokens = generateTokenPair({
      userId: usuarioCreado.id,
      username: usuarioCreado.username,
      role: usuarioCreado.nombreRol || "unknown",
      comunidadesIds: comunidadesIds.length > 0 ? comunidadesIds : undefined,
      permisos: rol.permisos || {},
    });

    return {
      user: usuarioCreado.toJSON(),
      tokens,
    };
  }

  // Autentica un usuario con username y password
  // Verifica credenciales, valida rate limit y retorna tokens
  // Incrementa contador de intentos fallidos para prevenir ataques de fuerza bruta
  async login(input: LoginInput): Promise<LoginResult> {
    const { username, password } = input;

    logger.info(
      {
        username,
        ip: "unknown",
      },
      "Login attempt"
    );

    // Verificar que no haya excedido el limite de intentos
    this.checkLoginRateLimit(username);

    // Buscar el usuario por username
    const usuario = await this.usuarioRepository.findByUsername(username);

    // Verificar password con proteccion contra timing attacks
    // Usa dummy hash si el usuario no existe para mantener tiempo constante
    const isValidPassword = await verifyPasswordSafe(
      password,
      usuario?.passwordHash
    );

    // Si usuario no existe o password es invalido
    if (!usuario || !isValidPassword) {
      // Incrementar contador de intentos fallidos
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

    // Verificar que el usuario este activo
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

    // Login exitoso: resetear contador de intentos
    this.resetLoginAttempts(username);

    logger.info(
      {
        user_id: usuario.id,
        username: usuario.username,
        role: usuario.nombreRol,
      },
      "Login successful"
    );

    // Actualizar fecha de ultimo login de forma asincrona
    // No esperar la respuesta para no retrasar el login
    this.usuarioRepository
      .updateLastLogin(usuario.id)
      .catch((err) =>
        logger.error({ error: err.message }, "Failed to update last_login")
      );

    // Obtener comunidades asignadas (N:N)
    const comunidadesIds = await this.usuarioRepository.findComunidadesByUsuario(
      usuario.id
    );

    // Obtener permisos del rol del usuario
    const rol = await this.rolRepository.findById(usuario.idRol);
    const permisos = rol?.permisos || {};

    // Generar tokens JWT para la sesion
    const tokens = generateTokenPair({
      userId: usuario.id,
      username: usuario.username,
      role: usuario.nombreRol || "unknown",
      comunidadesIds: comunidadesIds.length > 0 ? comunidadesIds : undefined,
      permisos,
    });

    return {
      user: usuario.toJSON(),
      tokens,
    };
  }

  // Renueva el access token usando un refresh token valido
  // Verifica que el usuario siga activo antes de generar nuevo token
  async refresh(input: RefreshTokenInput): Promise<RefreshResult> {
    logger.debug("Refresh token request");

    // Verificar que el refresh token sea valido
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

    // Obtener datos actualizados del usuario desde la base de datos
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

    // Verificar que el usuario siga activo
    if (!usuario.activo) {
      logger.warn(
        {
          user_id: usuario.id,
        },
        "Refresh failed: User inactive"
      );

      throw new Error("Usuario inactivo");
    }

    // Obtener comunidades asignadas (N:N)
    const comunidadesIds = await this.usuarioRepository.findComunidadesByUsuario(
      usuario.id
    );

    // Obtener permisos del rol del usuario
    const rol = await this.rolRepository.findById(usuario.idRol);
    const permisos = rol?.permisos || {};

    // Generar nuevo access token con datos actualizados
    const tokens = generateTokenPair({
      userId: usuario.id,
      username: usuario.username,
      role: usuario.nombreRol || "unknown",
      comunidadesIds: comunidadesIds.length > 0 ? comunidadesIds : undefined,
      permisos,
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

  // Cierra sesion del usuario invalidando su token
  // Agrega el token a una lista negra para que no pueda usarse mas
  async logout(token: string): Promise<void> {
    logger.info("Logout request");

    // Agregar token a blacklist para invalidarlo
    blacklistToken(token);

    logger.info("User logged out successfully");
  }

  // Obtiene informacion completa del usuario autenticado
  // Incluye datos personales y permisos de su rol
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

    // Obtener permisos completos del rol del usuario
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

  // Verifica si un usuario ha excedido el limite de intentos de login
  // Lanza error si ha alcanzado el maximo de intentos en la ventana de tiempo
  private checkLoginRateLimit(username: string): void {
    const now = Date.now();
    const attempts = loginAttempts.get(username);

    if (!attempts) {
      return;
    }

    // Si la ventana de tiempo expiro, resetear contador
    if (now > attempts.resetAt) {
      loginAttempts.delete(username);
      return;
    }

    // Verificar si excede el limite maximo
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

  // Incrementa el contador de intentos fallidos de login
  // Se resetea automaticamente despues de la ventana de tiempo
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

  // Resetea el contador de intentos fallidos
  // Se llama cuando el login es exitoso
  private resetLoginAttempts(username: string): void {
    loginAttempts.delete(username);
  }
}
