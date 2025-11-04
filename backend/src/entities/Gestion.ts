// Interfaz para datos de Gestion desde BD
export interface GestionData {
  id_gestion: string;
  anio_gestion: number;
  activa: boolean;
  activo_sistema: boolean;
}

// Interfaz para datos publicos de Gestion (response)
export interface GestionPublicData {
  id_gestion: string;
  anio_gestion: number;
  activa: boolean;
  activo_sistema: boolean;
}

// Entidad Gestion
// Representa las gestiones agricolas (años) del sistema
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

  get activa(): boolean {
    return this.data.activa;
  }

  get activoSistema(): boolean {
    return this.data.activo_sistema;
  }

  // Crea una nueva instancia de Gestion
  static create(data: {
    anio_gestion: number;
  }): Gestion {
    return new Gestion({
      id_gestion: "",
      anio_gestion: data.anio_gestion,
      activa: true,
      activo_sistema: false,
    });
  }

  // Crea instancia desde datos de BD
  static fromDatabase(data: GestionData): Gestion {
    return new Gestion(data);
  }

  // Valida los datos de la gestion
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.data.anio_gestion) {
      errors.push("Año de gestion es requerido");
    }

    if (this.data.anio_gestion < 2000) {
      errors.push("Año debe ser mayor a 2000");
    }

    if (this.data.anio_gestion > 2100) {
      errors.push("Año debe ser menor a 2100");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Convierte a formato para insertar en BD
  toDatabaseInsert(): {
    anio_gestion: number;
    activa: boolean;
    activo_sistema: boolean;
  } {
    return {
      anio_gestion: this.data.anio_gestion,
      activa: this.data.activa,
      activo_sistema: this.data.activo_sistema,
    };
  }

  // Convierte a formato para actualizar en BD
  toDatabaseUpdate(): {
    activa?: boolean;
    activo_sistema?: boolean;
  } {
    return {
      activa: this.data.activa,
      activo_sistema: this.data.activo_sistema,
    };
  }

  // Convierte a formato JSON publico
  toJSON(): GestionPublicData {
    return {
      id_gestion: this.data.id_gestion,
      anio_gestion: this.data.anio_gestion,
      activa: this.data.activa,
      activo_sistema: this.data.activo_sistema,
    };
  }

  // Verifica si la gestion puede ser desactivada
  puedeDesactivar(): { valid: boolean; error?: string } {
    if (!this.data.activa) {
      return {
        valid: false,
        error: "La gestion ya esta inactiva",
      };
    }

    return { valid: true };
  }

  // Verifica si la gestion es del año actual
  esActual(): boolean {
    const anioActual = new Date().getFullYear();
    return this.data.anio_gestion === anioActual;
  }

  // Verifica si la gestion es futura
  esFutura(): boolean {
    const anioActual = new Date().getFullYear();
    return this.data.anio_gestion > anioActual;
  }

  // Verifica si la gestion es pasada
  esPasada(): boolean {
    const anioActual = new Date().getFullYear();
    return this.data.anio_gestion < anioActual;
  }

  // Verifica si es la gestion activa del sistema
  esGestionActiva(): boolean {
    return this.data.activo_sistema === true;
  }

  // Establece como gestion activa del sistema
  establecerComoActiva(): void {
    this.data.activo_sistema = true;
  }

  // Quita de gestion activa del sistema
  quitarComoActiva(): void {
    this.data.activo_sistema = false;
  }

  // Activa la gestion
  activar(): void {
    this.data.activa = true;
  }

  // Desactiva la gestion
  desactivar(): void {
    this.data.activa = false;
  }
}
