// src/entities/Rol.ts
/**
 * Entidad Rol - Domain Layer
 * Representa los 5 roles del sistema APROMAM con permisos JSONB
 * NO contiene SQL queries (eso va en RolRepository)
 */

export interface RolData {
  id_rol: string;
  nombre_rol: string;
  descripcion?: string | null;
  permisos: Record<string, any>; // JSONB flexible
  activo: boolean;
}

export interface CreateRolInput {
  nombre_rol: string;
  descripcion?: string;
  permisos: Record<string, any>;
}

export interface RolPublicData {
  id_rol: string;
  nombre_rol: string;
  descripcion?: string;
  permisos: Record<string, any>;
  activo: boolean;
}

// Roles específicos del sistema APROMAM
export const ROLES_SISTEMA = {
  ADMINISTRADOR: "administrador",
  GERENTE: "gerente",
  TECNICO: "tecnico",
  INVITADO: "invitado",
} as const;

export type RolNombre = (typeof ROLES_SISTEMA)[keyof typeof ROLES_SISTEMA];

// Estructura base de permisos esperada
export interface PermisosBase {
  all?: boolean;
  read?: boolean;
  create?: boolean;
  edit_own?: boolean;
  edit_all?: boolean;
  delete?: boolean;
  approve?: boolean;
  report?: boolean;
  read_reports?: boolean;
  read_own?: boolean;
  manage_users?: boolean;
  manage_system?: boolean;
}

export class Rol {
  private data: RolData;

  constructor(data: RolData) {
    this.data = data;
  }

  // Getters - Acceso controlado a propiedades
  get id(): string {
    return this.data.id_rol;
  }

  get nombre(): string {
    return this.data.nombre_rol;
  }

  get descripcion(): string | null | undefined {
    return this.data.descripcion;
  }

  get permisos(): Record<string, any> {
    return this.data.permisos;
  }

  get activo(): boolean {
    return this.data.activo;
  }

  // Validaciones de negocio

  /**
   * Valida que el nombre del rol sea uno de los 5 permitidos
   */
  validarNombreRol(): { valid: boolean; error?: string } {
    const rolesPermitidos = Object.values(ROLES_SISTEMA);

    if (!rolesPermitidos.includes(this.data.nombre_rol as RolNombre)) {
      return {
        valid: false,
        error: `Rol debe ser uno de: ${rolesPermitidos.join(", ")}`,
      };
    }

    return { valid: true };
  }

  /**
   * Valida estructura básica de permisos JSONB
   */
  validarPermisos(): { valid: boolean; error?: string } {
    if (!this.data.permisos || typeof this.data.permisos !== "object") {
      return {
        valid: false,
        error: "Permisos deben ser un objeto JSON válido",
      };
    }

    // Validar que al menos tenga algún permiso definido
    if (Object.keys(this.data.permisos).length === 0) {
      return {
        valid: false,
        error: "Debe definir al menos un permiso",
      };
    }

    return { valid: true };
  }

  /**
   * Valida que permisos sean consistentes con el rol
   */
  validarPermisosConsistentes(): { valid: boolean; error?: string } {
    const permisos = this.data.permisos as PermisosBase;

    switch (this.data.nombre_rol) {
      case ROLES_SISTEMA.ADMINISTRADOR:
        // Admin debe tener all: true
        if (!permisos.all) {
          return {
            valid: false,
            error: 'Administrador debe tener permiso "all"',
          };
        }
        break;

      case ROLES_SISTEMA.TECNICO:
        // Técnico NO puede tener approve
        if (permisos.approve) {
          return {
            valid: false,
            error: 'Técnico no puede tener permiso "approve"',
          };
        }
        break;

      case ROLES_SISTEMA.INVITADO:
        // Invitado solo lectura
        if (permisos.create || permisos.delete || permisos.edit_all) {
          return {
            valid: false,
            error: "Invitado solo puede tener permisos de lectura",
          };
        }
        break;
    }

    return { valid: true };
  }

  // Verificaciones de permisos específicos

  /**
   * Verifica si el rol tiene un permiso específico
   */
  tienePermiso(permiso: keyof PermisosBase): boolean {
    const permisos = this.data.permisos as PermisosBase;

    // Si tiene permiso "all", tiene todos los permisos
    if (permisos.all === true) {
      return true;
    }

    return permisos[permiso] === true;
  }

  /**
   * Verifica si el rol es administrador
   */
  esAdministrador(): boolean {
    return this.data.nombre_rol === ROLES_SISTEMA.ADMINISTRADOR;
  }

  /**
   * Verifica si el rol es gerente
   */
  esGerente(): boolean {
    return this.data.nombre_rol === ROLES_SISTEMA.GERENTE;
  }

  /**
   * Verifica si el rol es técnico
   */
  esTecnico(): boolean {
    return this.data.nombre_rol === ROLES_SISTEMA.TECNICO;
  }

  /**
   * Verifica si el rol puede aprobar fichas
   */
  puedeAprobarFichas(): boolean {
    return this.tienePermiso("approve");
  }

  /**
   * Verifica si el rol puede gestionar usuarios
   */
  puedeGestionarUsuarios(): boolean {
    return this.tienePermiso("manage_users");
  }

  /**
   * Verifica si el rol puede crear registros
   */
  puedeCrear(): boolean {
    return this.tienePermiso("create");
  }

  /**
   * Verifica si el rol puede editar todos los registros
   */
  puedeEditarTodos(): boolean {
    return this.tienePermiso("edit_all");
  }

  /**
   * Verifica si el rol puede generar reportes
   */
  puedeGenerarReportes(): boolean {
    return this.tienePermiso("report");
  }

  // Transformaciones para diferentes contextos

  /**
   * Para respuestas API públicas
   * NO incluye datos sensibles internos
   */
  toJSON(): RolPublicData {
    return {
      id_rol: this.data.id_rol,
      nombre_rol: this.data.nombre_rol,
      descripcion: this.data.descripcion || undefined,
      permisos: this.data.permisos,
      activo: this.data.activo,
    };
  }

  /**
   * Para INSERT en base de datos
   * Usado por RolRepository.create()
   */
  toDatabaseInsert(): Omit<RolData, "id_rol"> {
    return {
      nombre_rol: this.data.nombre_rol,
      descripcion: this.data.descripcion || null,
      permisos: this.data.permisos,
      activo: this.data.activo,
    };
  }

  /**
   * Para UPDATE en base de datos
   * Solo campos modificables
   */
  toDatabaseUpdate(): Partial<
    Pick<RolData, "descripcion" | "permisos" | "activo">
  > {
    return {
      descripcion: this.data.descripcion,
      permisos: this.data.permisos,
      activo: this.data.activo,
    };
  }

  /**
   * Factory method: crear desde resultado BD
   */
  static fromDatabase(data: RolData): Rol {
    return new Rol(data);
  }

  /**
   * Factory method: crear nuevo rol para insertar
   */
  static create(input: CreateRolInput): Rol {
    return new Rol({
      id_rol: "", // Se genera en BD con uuid_generate_v4()
      nombre_rol: input.nombre_rol,
      descripcion: input.descripcion || null,
      permisos: input.permisos,
      activo: true,
    });
  }

  /**
   * Factory method: crear roles predefinidos del sistema
   */
  static createRolAdministrador(): Rol {
    return new Rol({
      id_rol: "",
      nombre_rol: ROLES_SISTEMA.ADMINISTRADOR,
      descripcion: "Control total del sistema",
      permisos: { all: true },
      activo: true,
    });
  }

  static createRolGerente(): Rol {
    return new Rol({
      id_rol: "",
      nombre_rol: ROLES_SISTEMA.GERENTE,
      descripcion: "Supervisión y aprobación de fichas",
      permisos: {
        read: true,
        approve: true,
        report: true,
        edit_own: true,
      },
      activo: true,
    });
  }

  static createRolTecnico(): Rol {
    return new Rol({
      id_rol: "",
      nombre_rol: ROLES_SISTEMA.TECNICO,
      descripcion: "Captura de datos en campo",
      permisos: {
        read: true,
        create: true,
        edit_own: true,
      },
      activo: true,
    });
  }

  static createRolInvitado(): Rol {
    return new Rol({
      id_rol: "",
      nombre_rol: ROLES_SISTEMA.INVITADO,
      descripcion: "Solo lectura de reportes",
      permisos: {
        read_reports: true,
      },
      activo: true,
    });
  }

  /**
   * Validación completa antes de persistir
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const nombreValidation = this.validarNombreRol();
    if (!nombreValidation.valid && nombreValidation.error) {
      errors.push(nombreValidation.error);
    }

    const permisosValidation = this.validarPermisos();
    if (!permisosValidation.valid && permisosValidation.error) {
      errors.push(permisosValidation.error);
    }

    const permisosConsistentesValidation = this.validarPermisosConsistentes();
    if (
      !permisosConsistentesValidation.valid &&
      permisosConsistentesValidation.error
    ) {
      errors.push(permisosConsistentesValidation.error);
    }

    if (!this.data.nombre_rol || this.data.nombre_rol.trim().length === 0) {
      errors.push("Nombre de rol es requerido");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
