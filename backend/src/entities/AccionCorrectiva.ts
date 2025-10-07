// Interfaz para datos de AccionCorrectiva desde BD
export interface AccionCorrectivaData {
  id_accion: string;
  id_ficha: string;
  numero_accion: number;
  descripcion_accion: string;
  implementacion_descripcion?: string | null;
  fecha_limite?: Date | null;
  estado_implementacion: string;
  es_gestion_anterior: boolean;
  created_at: Date;
}

// Interfaz para datos publicos (response)
export interface AccionCorrectivaPublicData {
  id_accion: string;
  id_ficha: string;
  numero_accion: number;
  descripcion_accion: string;
  implementacion_descripcion?: string | null;
  fecha_limite?: string | null;
  estado_implementacion: string;
  es_gestion_anterior: boolean;
  created_at: string;
}

// Entity AccionCorrectiva
// Representa una accion correctiva de gestion anterior o presente (Seccion 3)
export class AccionCorrectiva {
  private data: AccionCorrectivaData;

  constructor(data: AccionCorrectivaData) {
    this.data = data;
  }

  // Getters
  get id(): string {
    return this.data.id_accion;
  }

  get idFicha(): string {
    return this.data.id_ficha;
  }

  get numero(): number {
    return this.data.numero_accion;
  }

  get descripcion(): string {
    return this.data.descripcion_accion;
  }

  get implementacion(): string | null {
    return this.data.implementacion_descripcion ?? null;
  }

  get fechaLimite(): Date | null {
    return this.data.fecha_limite ?? null;
  }

  get estado(): string {
    return this.data.estado_implementacion;
  }

  get esGestionAnterior(): boolean {
    return this.data.es_gestion_anterior;
  }

  get createdAt(): Date {
    return this.data.created_at;
  }

  // Crea una nueva instancia
  static create(data: {
    id_ficha: string;
    numero_accion: number;
    descripcion_accion: string;
    implementacion_descripcion?: string;
    fecha_limite?: Date;
    estado_implementacion?: string;
    es_gestion_anterior?: boolean;
  }): AccionCorrectiva {
    return new AccionCorrectiva({
      id_accion: "",
      id_ficha: data.id_ficha,
      numero_accion: data.numero_accion,
      descripcion_accion: data.descripcion_accion,
      implementacion_descripcion: data.implementacion_descripcion,
      fecha_limite: data.fecha_limite,
      estado_implementacion: data.estado_implementacion ?? "pendiente",
      es_gestion_anterior: data.es_gestion_anterior ?? false,
      created_at: new Date(),
    });
  }

  // Crea instancia desde datos de BD
  static fromDatabase(data: AccionCorrectivaData): AccionCorrectiva {
    return new AccionCorrectiva(data);
  }

  // Valida los datos
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.data.id_ficha) {
      errors.push("ID de ficha es requerido");
    }

    if (this.data.numero_accion < 1) {
      errors.push("Numero de accion debe ser mayor a 0");
    }

    if (
      !this.data.descripcion_accion ||
      this.data.descripcion_accion.trim().length < 5
    ) {
      errors.push("Descripcion debe tener al menos 5 caracteres");
    }

    if (this.data.descripcion_accion.length > 500) {
      errors.push("Descripcion no puede exceder 500 caracteres");
    }

    if (
      this.data.implementacion_descripcion &&
      this.data.implementacion_descripcion.length > 500
    ) {
      errors.push("Implementacion no puede exceder 500 caracteres");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Convierte a formato para insertar en BD
  toDatabaseInsert(): Omit<AccionCorrectivaData, "id_accion" | "created_at"> {
    return {
      id_ficha: this.data.id_ficha,
      numero_accion: this.data.numero_accion,
      descripcion_accion: this.data.descripcion_accion.trim(),
      implementacion_descripcion:
        this.data.implementacion_descripcion?.trim() || null,
      fecha_limite: this.data.fecha_limite,
      estado_implementacion: this.data.estado_implementacion,
      es_gestion_anterior: this.data.es_gestion_anterior,
    };
  }

  // Convierte a formato para actualizar en BD
  toDatabaseUpdate(): Partial<
    Omit<AccionCorrectivaData, "id_accion" | "id_ficha" | "created_at">
  > {
    return {
      numero_accion: this.data.numero_accion,
      descripcion_accion: this.data.descripcion_accion.trim(),
      implementacion_descripcion:
        this.data.implementacion_descripcion?.trim() || null,
      fecha_limite: this.data.fecha_limite,
      estado_implementacion: this.data.estado_implementacion,
      es_gestion_anterior: this.data.es_gestion_anterior,
    };
  }

  // Convierte a formato JSON publico
  toJSON(): AccionCorrectivaPublicData {
    return {
      id_accion: this.data.id_accion,
      id_ficha: this.data.id_ficha,
      numero_accion: this.data.numero_accion,
      descripcion_accion: this.data.descripcion_accion,
      implementacion_descripcion: this.data.implementacion_descripcion ?? null,
      fecha_limite: this.data.fecha_limite?.toISOString() ?? null,
      estado_implementacion: this.data.estado_implementacion,
      es_gestion_anterior: this.data.es_gestion_anterior,
      created_at: this.data.created_at.toISOString(),
    };
  }

  // Verifica si esta pendiente
  estaPendiente(): boolean {
    return this.data.estado_implementacion === "pendiente";
  }

  // Verifica si esta completada
  estaCompletada(): boolean {
    return this.data.estado_implementacion === "completado";
  }

  // Actualiza descripcion
  actualizarDescripcion(descripcion: string): void {
    if (descripcion.trim().length < 5) {
      throw new Error("Descripcion debe tener al menos 5 caracteres");
    }

    if (descripcion.length > 500) {
      throw new Error("Descripcion no puede exceder 500 caracteres");
    }

    this.data.descripcion_accion = descripcion.trim();
  }

  // Actualiza implementacion
  actualizarImplementacion(implementacion: string): void {
    if (implementacion.length > 500) {
      throw new Error("Implementacion no puede exceder 500 caracteres");
    }

    this.data.implementacion_descripcion = implementacion.trim();
  }

  // Actualiza fecha limite
  actualizarFechaLimite(fecha: Date): void {
    this.data.fecha_limite = fecha;
  }

  // Actualiza estado
  actualizarEstado(estado: string): void {
    this.data.estado_implementacion = estado;
  }

  // Marca como completada
  marcarCompletada(descripcionImplementacion: string): void {
    if (
      !descripcionImplementacion ||
      descripcionImplementacion.trim().length < 5
    ) {
      throw new Error("Debe proporcionar una descripcion de la implementacion");
    }

    this.data.implementacion_descripcion = descripcionImplementacion.trim();
    this.data.estado_implementacion = "completado";
  }

  // Marca como pendiente
  marcarPendiente(): void {
    this.data.estado_implementacion = "pendiente";
  }
}
