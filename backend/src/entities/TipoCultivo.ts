/**
 * Interfaz para datos de TipoCultivo desde BD
 */
export interface TipoCultivoData {
  id_tipo_cultivo: string;
  nombre_tipo_cultivo: string;
  rendimiento_promedio_qq_ha?: number;
  activo: boolean;
  created_at: Date;
}

/**
 * Interfaz para datos públicos de TipoCultivo (response)
 */
export interface TipoCultivoPublicData {
  id_tipo_cultivo: string;
  nombre_tipo_cultivo: string;
  rendimiento_promedio_qq_ha?: number;
  activo: boolean;
  created_at: string;
}

/**
 * Entidad TipoCultivo
 * Representa los tipos de cultivo disponibles en el sistema
 */
export class TipoCultivo {
  private data: TipoCultivoData;

  constructor(data: TipoCultivoData) {
    this.data = data;
  }

  // Getters
  get id(): string {
    return this.data.id_tipo_cultivo;
  }

  get nombre(): string {
    return this.data.nombre_tipo_cultivo;
  }

  get rendimientoPromedio(): number | undefined {
    return this.data.rendimiento_promedio_qq_ha;
  }

  get activo(): boolean {
    return this.data.activo;
  }

  get createdAt(): Date {
    return this.data.created_at;
  }

  /**
   * Crea una nueva instancia de TipoCultivo
   */
  static create(data: {
    nombre_tipo_cultivo: string;
    rendimiento_promedio_qq_ha?: number;
  }): TipoCultivo {
    return new TipoCultivo({
      id_tipo_cultivo: "", // Se genera en BD
      nombre_tipo_cultivo: data.nombre_tipo_cultivo,
      rendimiento_promedio_qq_ha: data.rendimiento_promedio_qq_ha,
      activo: true,
      created_at: new Date(),
    });
  }

  /**
   * Crea instancia desde datos de BD
   */
  static fromDatabase(data: TipoCultivoData): TipoCultivo {
    return new TipoCultivo(data);
  }

  /**
   * Valida los datos del tipo cultivo
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (
      !this.data.nombre_tipo_cultivo ||
      this.data.nombre_tipo_cultivo.trim().length < 2
    ) {
      errors.push("Nombre de tipo cultivo debe tener al menos 2 caracteres");
    }

    if (
      this.data.rendimiento_promedio_qq_ha !== undefined &&
      this.data.rendimiento_promedio_qq_ha <= 0
    ) {
      errors.push("Rendimiento promedio debe ser positivo");
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
    nombre_tipo_cultivo: string;
    rendimiento_promedio_qq_ha?: number;
    activo: boolean;
  } {
    return {
      nombre_tipo_cultivo: this.data.nombre_tipo_cultivo.trim(),
      rendimiento_promedio_qq_ha: this.data.rendimiento_promedio_qq_ha,
      activo: this.data.activo,
    };
  }

  /**
   * Convierte a formato para actualizar en BD
   */
  toDatabaseUpdate(): {
    nombre_tipo_cultivo?: string;
    rendimiento_promedio_qq_ha?: number;
    activo?: boolean;
  } {
    return {
      nombre_tipo_cultivo: this.data.nombre_tipo_cultivo?.trim(),
      rendimiento_promedio_qq_ha: this.data.rendimiento_promedio_qq_ha,
      activo: this.data.activo,
    };
  }

  /**
   * Convierte a formato JSON público (sin datos sensibles)
   */
  toJSON(): TipoCultivoPublicData {
    return {
      id_tipo_cultivo: this.data.id_tipo_cultivo,
      nombre_tipo_cultivo: this.data.nombre_tipo_cultivo,
      rendimiento_promedio_qq_ha: this.data.rendimiento_promedio_qq_ha,
      activo: this.data.activo,
      created_at: this.data.created_at.toISOString(),
    };
  }

  /**
   * Verifica si el tipo cultivo puede ser desactivado
   */
  puedeDesactivar(): { valid: boolean; error?: string } {
    if (!this.data.activo) {
      return {
        valid: false,
        error: "El tipo cultivo ya está inactivo",
      };
    }

    // Aquí se podría verificar si tiene cultivos asociados
    // Por ahora solo validamos el estado

    return { valid: true };
  }

  /**
   * Actualiza el rendimiento promedio
   */
  actualizarRendimiento(nuevoRendimiento: number): void {
    if (nuevoRendimiento <= 0) {
      throw new Error("Rendimiento debe ser positivo");
    }
    this.data.rendimiento_promedio_qq_ha = nuevoRendimiento;
  }

  /**
   * Actualiza el nombre
   */
  actualizarNombre(nuevoNombre: string): void {
    if (!nuevoNombre || nuevoNombre.trim().length < 2) {
      throw new Error("Nombre debe tener al menos 2 caracteres");
    }
    this.data.nombre_tipo_cultivo = nuevoNombre.trim();
  }

  /**
   * Activa el tipo cultivo
   */
  activar(): void {
    this.data.activo = true;
  }

  /**
   * Desactiva el tipo cultivo
   */
  desactivar(): void {
    this.data.activo = false;
  }
}
