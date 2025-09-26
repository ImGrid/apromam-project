/**
 * Interfaz para datos de Comunidad desde BD
 */
export interface ComunidadData {
  id_comunidad: string;
  id_municipio: string;
  nombre_comunidad: string;
  nombre_municipio?: string;
  nombre_provincia?: string;
  cantidad_tecnicos?: number;
  cantidad_productores?: number;
  activo: boolean;
  created_at: Date;
}

/**
 * Interfaz para datos públicos de Comunidad (response)
 */
export interface ComunidadPublicData {
  id_comunidad: string;
  id_municipio: string;
  nombre_comunidad: string;
  nombre_municipio?: string;
  nombre_provincia?: string;
  cantidad_tecnicos?: number;
  cantidad_productores?: number;
  activo: boolean;
  created_at: string;
}

/**
 * Entidad Comunidad
 * Representa una comunidad dentro de un municipio
 */
export class Comunidad {
  private data: ComunidadData;

  constructor(data: ComunidadData) {
    this.data = data;
  }

  // Getters
  get id(): string {
    return this.data.id_comunidad;
  }

  get idMunicipio(): string {
    return this.data.id_municipio;
  }

  get nombre(): string {
    return this.data.nombre_comunidad;
  }

  get nombreMunicipio(): string | undefined {
    return this.data.nombre_municipio;
  }

  get nombreProvincia(): string | undefined {
    return this.data.nombre_provincia;
  }

  get cantidadTecnicos(): number | undefined {
    return this.data.cantidad_tecnicos;
  }

  get cantidadProductores(): number | undefined {
    return this.data.cantidad_productores;
  }

  get activo(): boolean {
    return this.data.activo;
  }

  get createdAt(): Date {
    return this.data.created_at;
  }

  /**
   * Crea una nueva instancia de Comunidad
   */
  static create(data: {
    id_municipio: string;
    nombre_comunidad: string;
  }): Comunidad {
    return new Comunidad({
      id_comunidad: "", // Se genera en BD
      id_municipio: data.id_municipio,
      nombre_comunidad: data.nombre_comunidad,
      activo: true,
      created_at: new Date(),
    });
  }

  /**
   * Crea instancia desde datos de BD
   */
  static fromDatabase(data: ComunidadData): Comunidad {
    return new Comunidad(data);
  }

  /**
   * Valida los datos de la comunidad
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (
      !this.data.nombre_comunidad ||
      this.data.nombre_comunidad.trim().length < 3
    ) {
      errors.push("Nombre de comunidad debe tener al menos 3 caracteres");
    }

    if (!this.data.id_municipio) {
      errors.push("ID de municipio es requerido");
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
    id_municipio: string;
    nombre_comunidad: string;
    activo: boolean;
  } {
    return {
      id_municipio: this.data.id_municipio,
      nombre_comunidad: this.data.nombre_comunidad.trim(),
      activo: this.data.activo,
    };
  }

  /**
   * Convierte a formato para actualizar en BD
   */
  toDatabaseUpdate(): {
    nombre_comunidad?: string;
    activo?: boolean;
  } {
    return {
      nombre_comunidad: this.data.nombre_comunidad?.trim(),
      activo: this.data.activo,
    };
  }

  /**
   * Convierte a formato JSON público (sin datos sensibles)
   */
  toJSON(): ComunidadPublicData {
    return {
      id_comunidad: this.data.id_comunidad,
      id_municipio: this.data.id_municipio,
      nombre_comunidad: this.data.nombre_comunidad,
      nombre_municipio: this.data.nombre_municipio,
      nombre_provincia: this.data.nombre_provincia,
      cantidad_tecnicos: this.data.cantidad_tecnicos,
      cantidad_productores: this.data.cantidad_productores,
      activo: this.data.activo,
      created_at: this.data.created_at.toISOString(),
    };
  }

  /**
   * Verifica si la comunidad puede ser desactivada
   */
  puedeDesactivar(): { valid: boolean; error?: string } {
    if (!this.data.activo) {
      return {
        valid: false,
        error: "La comunidad ya está inactiva",
      };
    }

    // Verificar si tiene técnicos asignados
    if (this.data.cantidad_tecnicos && this.data.cantidad_tecnicos > 0) {
      return {
        valid: false,
        error: `La comunidad tiene ${this.data.cantidad_tecnicos} técnico(s) asignado(s)`,
      };
    }

    // Verificar si tiene productores asignados
    if (this.data.cantidad_productores && this.data.cantidad_productores > 0) {
      return {
        valid: false,
        error: `La comunidad tiene ${this.data.cantidad_productores} productor(es) asignado(s)`,
      };
    }

    return { valid: true };
  }

  /**
   * Verifica si tiene técnicos asignados
   */
  tieneTecnicos(): boolean {
    return (this.data.cantidad_tecnicos ?? 0) > 0;
  }

  /**
   * Verifica si tiene productores asignados
   */
  tieneProductores(): boolean {
    return (this.data.cantidad_productores ?? 0) > 0;
  }

  /**
   * Actualiza el nombre de la comunidad
   */
  actualizarNombre(nuevoNombre: string): void {
    if (!nuevoNombre || nuevoNombre.trim().length < 3) {
      throw new Error("Nombre debe tener al menos 3 caracteres");
    }
    this.data.nombre_comunidad = nuevoNombre.trim();
  }

  /**
   * Actualiza la cantidad de técnicos (usado internamente)
   */
  actualizarCantidadTecnicos(cantidad: number): void {
    if (cantidad < 0) {
      throw new Error("Cantidad de técnicos no puede ser negativa");
    }
    this.data.cantidad_tecnicos = cantidad;
  }

  /**
   * Actualiza la cantidad de productores (usado internamente)
   */
  actualizarCantidadProductores(cantidad: number): void {
    if (cantidad < 0) {
      throw new Error("Cantidad de productores no puede ser negativa");
    }
    this.data.cantidad_productores = cantidad;
  }

  /**
   * Activa la comunidad
   */
  activar(): void {
    this.data.activo = true;
  }

  /**
   * Desactiva la comunidad
   */
  desactivar(): void {
    const validacion = this.puedeDesactivar();
    if (!validacion.valid) {
      throw new Error(validacion.error);
    }
    this.data.activo = false;
  }

  /**
   * Obtiene información resumida de la comunidad
   */
  getResumen(): string {
    const partes = [this.data.nombre_comunidad];

    if (this.data.nombre_municipio) {
      partes.push(this.data.nombre_municipio);
    }

    if (this.data.nombre_provincia) {
      partes.push(this.data.nombre_provincia);
    }

    return partes.join(", ");
  }

  /**
   * Verifica si es una comunidad sin asignaciones
   */
  estaSinAsignaciones(): boolean {
    return !this.tieneTecnicos() && !this.tieneProductores();
  }
}
