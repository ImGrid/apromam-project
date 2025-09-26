// Interfaz para datos de Gestion desde BD
export interface GestionData {
  id_gestion: string;
  anio_gestion: number;
  descripcion?: string;
  fecha_inicio?: Date;
  fecha_fin?: Date;
  estado_gestion: "planificada" | "activa" | "finalizada";
  activa: boolean;
}

// Interfaz para datos publicos de Gestion (response)
export interface GestionPublicData {
  id_gestion: string;
  anio_gestion: number;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado_gestion: string;
  activa: boolean;
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

  get descripcion(): string | undefined {
    return this.data.descripcion;
  }

  get fechaInicio(): Date | undefined {
    return this.data.fecha_inicio;
  }

  get fechaFin(): Date | undefined {
    return this.data.fecha_fin;
  }

  get estadoGestion(): "planificada" | "activa" | "finalizada" {
    return this.data.estado_gestion;
  }

  get activa(): boolean {
    return this.data.activa;
  }

  // Crea una nueva instancia de Gestion
  static create(data: {
    anio_gestion: number;
    descripcion?: string;
    fecha_inicio?: Date;
    fecha_fin?: Date;
  }): Gestion {
    return new Gestion({
      id_gestion: "",
      anio_gestion: data.anio_gestion,
      descripcion: data.descripcion || `Gestion Agricola ${data.anio_gestion}`,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      estado_gestion: "planificada",
      activa: true,
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

    if (this.data.descripcion && this.data.descripcion.trim().length < 4) {
      errors.push("Descripcion de gestion debe tener al menos 4 caracteres");
    }

    if (this.data.fecha_inicio && this.data.fecha_fin) {
      if (this.data.fecha_inicio > this.data.fecha_fin) {
        errors.push("Fecha inicio debe ser anterior a fecha fin");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Convierte a formato para insertar en BD
  toDatabaseInsert(): {
    anio_gestion: number;
    descripcion?: string;
    fecha_inicio?: Date;
    fecha_fin?: Date;
    estado_gestion: "planificada" | "activa" | "finalizada";
    activa: boolean;
  } {
    return {
      anio_gestion: this.data.anio_gestion,
      descripcion: this.data.descripcion?.trim(),
      fecha_inicio: this.data.fecha_inicio,
      fecha_fin: this.data.fecha_fin,
      estado_gestion: this.data.estado_gestion,
      activa: this.data.activa,
    };
  }

  // Convierte a formato para actualizar en BD
  toDatabaseUpdate(): {
    descripcion?: string;
    fecha_inicio?: Date;
    fecha_fin?: Date;
    estado_gestion?: "planificada" | "activa" | "finalizada";
    activa?: boolean;
  } {
    return {
      descripcion: this.data.descripcion?.trim(),
      fecha_inicio: this.data.fecha_inicio,
      fecha_fin: this.data.fecha_fin,
      estado_gestion: this.data.estado_gestion,
      activa: this.data.activa,
    };
  }

  // Convierte a formato JSON publico
  toJSON(): GestionPublicData {
    return {
      id_gestion: this.data.id_gestion,
      anio_gestion: this.data.anio_gestion,
      descripcion: this.data.descripcion,
      fecha_inicio: this.data.fecha_inicio?.toISOString(),
      fecha_fin: this.data.fecha_fin?.toISOString(),
      estado_gestion: this.data.estado_gestion,
      activa: this.data.activa,
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

  // Actualiza la descripcion de la gestion
  actualizarDescripcion(nuevaDescripcion: string): void {
    if (!nuevaDescripcion || nuevaDescripcion.trim().length < 4) {
      throw new Error("Descripcion debe tener al menos 4 caracteres");
    }
    this.data.descripcion = nuevaDescripcion.trim();
  }

  // Actualiza las fechas de la gestion
  actualizarFechas(fechaInicio: Date, fechaFin: Date): void {
    if (fechaInicio > fechaFin) {
      throw new Error("Fecha inicio debe ser anterior a fecha fin");
    }
    this.data.fecha_inicio = fechaInicio;
    this.data.fecha_fin = fechaFin;
  }

  // Actualiza el estado de la gestion
  actualizarEstado(nuevoEstado: "planificada" | "activa" | "finalizada"): void {
    this.data.estado_gestion = nuevoEstado;
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
