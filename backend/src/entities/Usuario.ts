// src/entities/Usuario.ts
/**
 * Entidad Usuario - Domain Layer
 * Representa un usuario del sistema APROMAM con uno de los 5 roles
 * NO contiene SQL queries (eso va en UsuarioRepository)
 */

export interface UsuarioData {
  id_usuario: string;
  username: string;
  email: string;
  password_hash: string;
  nombre_completo: string;
  id_rol: string;
  id_comunidad?: string | null;
  activo: boolean;
  last_login?: Date | null;
  created_at: Date;
  updated_at: Date;
  // Datos enriquecidos por JOINs
  nombre_rol?: string;
  nombre_comunidad?: string;
}

export interface CreateUsuarioInput {
  username: string;
  email: string;
  password: string; // Plain text, se hasheará en service
  nombre_completo: string;
  id_rol: string;
  id_comunidad?: string;
}

export interface UsuarioPublicData {
  id_usuario: string;
  username: string;
  email: string;
  nombre_completo: string;
  nombre_rol: string;
  id_comunidad?: string;
  nombre_comunidad?: string;
  activo: boolean;
  last_login?: string;
  created_at: string;
}

export class Usuario {
  private data: UsuarioData;

  constructor(data: UsuarioData) {
    this.data = data;
  }

  // Getters - Acceso controlado a propiedades
  get id(): string {
    return this.data.id_usuario;
  }

  get username(): string {
    return this.data.username;
  }

  get email(): string {
    return this.data.email;
  }

  get nombreCompleto(): string {
    return this.data.nombre_completo;
  }

  get idRol(): string {
    return this.data.id_rol;
  }

  get nombreRol(): string | undefined {
    return this.data.nombre_rol;
  }

  get idComunidad(): string | null | undefined {
    return this.data.id_comunidad;
  }

  get nombreComunidad(): string | undefined {
    return this.data.nombre_comunidad;
  }

  get activo(): boolean {
    return this.data.activo;
  }

  get lastLogin(): Date | null | undefined {
    return this.data.last_login;
  }

  get passwordHash(): string {
    return this.data.password_hash;
  }

  // Validaciones de negocio

  /**
   * Valida formato username según reglas APROMAM
   * - 5-50 caracteres
   * - Solo alfanuméricos y underscore
   * - Debe empezar con letra
   */
  validarUsername(): { valid: boolean; error?: string } {
    const username = this.data.username;

    if (username.length < 5 || username.length > 50) {
      return {
        valid: false,
        error: "Username debe tener entre 5 y 50 caracteres",
      };
    }

    const regex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
    if (!regex.test(username)) {
      return {
        valid: false,
        error:
          "Username debe empezar con letra y contener solo letras, números y guión bajo",
      };
    }

    return { valid: true };
  }

  /**
   * Valida formato email
   */
  validarEmail(): { valid: boolean; error?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(this.data.email)) {
      return { valid: false, error: "Formato de email inválido" };
    }

    return { valid: true };
  }

  /**
   * Verifica si el usuario pertenece a un rol específico
   */
  tieneRol(nombreRol: string): boolean {
    return this.data.nombre_rol?.toLowerCase() === nombreRol.toLowerCase();
  }

  /**
   * Verifica si el usuario es administrador
   */
  esAdministrador(): boolean {
    return this.tieneRol("administrador");
  }

  /**
   * Verifica si el usuario es gerente
   */
  esGerente(): boolean {
    return this.tieneRol("gerente");
  }

  /**
   * Verifica si el usuario es técnico
   */
  esTecnico(): boolean {
    return this.tieneRol("tecnico");
  }

  /**
   * Verifica si el usuario puede aprobar fichas
   * Solo gerentes y admins pueden aprobar
   */
  puedeAprobarFichas(): boolean {
    return this.esGerente() || this.esAdministrador();
  }

  /**
   * Verifica si el usuario necesita comunidad asignada
   * Técnicos DEBEN tener comunidad
   */
  requiereComunidad(): boolean {
    return this.esTecnico();
  }

  /**
   * Valida que técnico tenga comunidad asignada
   */
  validarComunidadTecnico(): { valid: boolean; error?: string } {
    if (this.esTecnico() && !this.data.id_comunidad) {
      return {
        valid: false,
        error: "Técnico debe tener comunidad asignada",
      };
    }
    return { valid: true };
  }

  /**
   * Verifica si usuario puede acceder a una comunidad específica
   */
  puedeAccederComunidad(comunidadId: string): boolean {
    // Admin puede acceder a todo
    if (this.esAdministrador()) {
      return true;
    }

    // Técnico solo su comunidad
    if (this.esTecnico()) {
      return this.data.id_comunidad === comunidadId;
    }

    // Gerentes e invitados pueden acceder a todo
    return this.esGerente() || this.tieneRol("invitado");
  }

  /**
   * Actualiza last_login timestamp
   */
  actualizarLastLogin(): void {
    this.data.last_login = new Date();
    this.data.updated_at = new Date();
  }

  // Transformaciones para diferentes contextos

  /**
   * Para respuestas API públicas
   * NO incluye password_hash ni datos sensibles
   */
  toJSON(): UsuarioPublicData {
    return {
      id_usuario: this.data.id_usuario,
      username: this.data.username,
      email: this.data.email,
      nombre_completo: this.data.nombre_completo,
      nombre_rol: this.data.nombre_rol || "unknown",
      id_comunidad: this.data.id_comunidad || undefined,
      nombre_comunidad: this.data.nombre_comunidad || undefined,
      activo: this.data.activo,
      last_login: this.data.last_login?.toISOString(),
      created_at: this.data.created_at.toISOString(),
    };
  }

  /**
   * Para JWT payload - información mínima
   */
  toJWTPayload(): {
    userId: string;
    username: string;
    role: string;
    comunidadId?: string;
  } {
    return {
      userId: this.data.id_usuario,
      username: this.data.username,
      role: this.data.nombre_rol || "unknown",
      comunidadId: this.data.id_comunidad || undefined,
    };
  }

  /**
   * Para INSERT en base de datos
   * Usado por UsuarioRepository.create()
   */
  toDatabaseInsert(): Omit<
    UsuarioData,
    | "id_usuario"
    | "created_at"
    | "updated_at"
    | "nombre_rol"
    | "nombre_comunidad"
  > {
    return {
      username: this.data.username,
      email: this.data.email,
      password_hash: this.data.password_hash,
      nombre_completo: this.data.nombre_completo,
      id_rol: this.data.id_rol,
      id_comunidad: this.data.id_comunidad || null,
      activo: this.data.activo,
      last_login: this.data.last_login || null,
    };
  }

  /**
   * Para UPDATE en base de datos
   * Solo campos modificables
   */
  toDatabaseUpdate(): Partial<
    Pick<UsuarioData, "email" | "nombre_completo" | "id_comunidad" | "activo">
  > {
    return {
      email: this.data.email,
      nombre_completo: this.data.nombre_completo,
      id_comunidad: this.data.id_comunidad,
      activo: this.data.activo,
    };
  }

  /**
   * Factory method: crear desde resultado BD
   */
  static fromDatabase(data: UsuarioData): Usuario {
    return new Usuario(data);
  }

  /**
   * Factory method: crear nuevo usuario para insertar
   */
  static create(input: CreateUsuarioInput, passwordHash: string): Usuario {
    return new Usuario({
      id_usuario: "", // Se genera en BD con uuid_generate_v4()
      username: input.username,
      email: input.email,
      password_hash: passwordHash,
      nombre_completo: input.nombre_completo,
      id_rol: input.id_rol,
      id_comunidad: input.id_comunidad || null,
      activo: true,
      last_login: null,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  /**
   * Validación completa antes de persistir
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const usernameValidation = this.validarUsername();
    if (!usernameValidation.valid && usernameValidation.error) {
      errors.push(usernameValidation.error);
    }

    const emailValidation = this.validarEmail();
    if (!emailValidation.valid && emailValidation.error) {
      errors.push(emailValidation.error);
    }

    const comunidadValidation = this.validarComunidadTecnico();
    if (!comunidadValidation.valid && comunidadValidation.error) {
      errors.push(comunidadValidation.error);
    }

    if (
      !this.data.nombre_completo ||
      this.data.nombre_completo.trim().length < 3
    ) {
      errors.push("Nombre completo debe tener al menos 3 caracteres");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
