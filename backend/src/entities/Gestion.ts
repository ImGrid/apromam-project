/**
 * Interfaz para datos de Gestion desde BD
 */
export interface GestionData {
  id_gestion: string;
  anio_gestion: number;
  nombre_gestion?: string;
  activo: boolean;
  created_at: Date;
}

/**
 * Interfaz para datos públicos de Gestion (response)
 */
export interface GestionPublicData {
  id_gestion: string;
  anio_gestion: number;
  nombre_gestion?: string;
  activo: boolean;
  created_at: string;
}

/**
 * Entidad Gestion
 * Representa las gestiones agrícolas (años) del sistema
 */
export class Gestion {
  private data: GestionData;

  constructor(data: GestionData) {
    this.data = data;
  }

  // Getters
  get id(): string {
    return this.data.id_gestion;
  }

  get anio(): number {
    return this.data.anio_gestion;
  }

  get nombre(): string | undefined {
    return this.data.nombre_gestion;
  }

  get activo(): boolean {
    return this.data.activo;
  }

  get createdAt(): Date {
    return this.data.created_at;
  }

  /**
   * Crea una nueva instancia de Gestion
   */
  static create(data: {
    anio_gestion: number;
    nombre_gestion?: string;
  }): Gestion {
    return new Gestion({
      id_gestion: "", // Se genera en BD
      anio_gestion: data.anio_gestion,
      nombre_gestion: data.nombre_gestion || `Gestión ${data.anio_gestion}`,
      activo: true,
      created_at: new Date(),
    });
  }

  /**
   * Crea instancia desde datos de BD
   */
  static fromDatabase(data: GestionData): Gestion {
    return new Gestion(data);
  }

  /**
   * Valida los datos de la gestión
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.data.anio_gestion) {
      errors.push("Año de gestión es requerido");
    }

    if (this.data.anio_gestion < 2000) {
      errors.push("Año debe ser mayor a 2000");
    }

    if (this.data.anio_gestion > 2100) {
      errors.push("Año debe ser menor a 2100");
    }

    if (
      this.data.nombre_gestion &&
      this.data.nombre_gestion.trim().length < 4
    ) {
      errors.push("Nombre de gestión debe tener al menos 4 caracteres");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convierte a formato para insertar en BD
   */
  toDatabaseInsert(): {
    anio_gestion: number;
    nombre_gestion?: string;
    activo: boolean;
  } {
    return {
      anio_gestion: this.data.anio_gestion,
      nombre_gestion: this.data.nombre_gestion?.trim(),
      activo: this.data.activo,
    };
  }

  /**
   * Convierte a formato para actualizar en BD
   */
  toDatabaseUpdate(): {
    nombre_gestion?: string;
    activo?: boolean;
  } {
    return {
      nombre_gestion: this.data.nombre_gestion?.trim(),
      activo: this.data.activo,
    };
  }

  /**
   * Convierte a formato JSON público
   */
  toJSON(): GestionPublicData {
    return {
      id_gestion: this.data.id_gestion,
      anio_gestion: this.data.anio_gestion,
      nombre_gestion: this.data.nombre_gestion,
      activo: this.data.activo,
      created_at: this.data.created_at.toISOString(),
    };
  }

  /**
   * Verifica si la gestión puede ser desactivada
   */
  puedeDesactivar(): { valid: boolean; error?: string } {
    if (!this.data.activo) {
      return {
        valid: false,
        error: "La gestión ya está inactiva",
      };
    }

    // Aquí se podría verificar si tiene fichas asociadas
    // Por ahora solo validamos el estado

    return { valid: true };
  }

  /**
   * Verifica si la gestión es del año actual
   */
  esActual(): boolean {
    const anioActual = new Date().getFullYear();
    return this.data.anio_gestion === anioActual;
  }

  /**
   * Verifica si la gestión es futura
   */
  esFutura(): boolean {
    const anioActual = new Date().getFullYear();
    return this.data.anio_gestion > anioActual;
  }

  /**
   * Verifica si la gestión es pasada
   */
  esPasada(): boolean {
    const anioActual = new Date().getFullYear();
    return this.data.anio_gestion < anioActual;
  }

  /**
   * Actualiza el nombre de la gestión
   */
  actualizarNombre(nuevoNombre: string): void {
    if (!nuevoNombre || nuevoNombre.trim().length < 4) {
      throw new Error("Nombre debe tener al menos 4 caracteres");
    }
    this.data.nombre_gestion = nuevoNombre.trim();
  }

  /**
   * Activa la gestión
   */
  activar(): void {
    this.data.activo = true;
  }

  /**
   * Desactiva la gestión
   */
  desactivar(): void {
    this.data.activo = false;
  }
}
