// Interfaz para datos de AccionCorrectiva desde BD
export interface AccionCorrectivaData {
  id_accion: string;
  id_ficha: string;
  numero_accion: number;
  descripcion_accion: string;
  implementacion_descripcion?: string | null;
  created_at: Date;
}

// Interfaz para datos publicos (response)
export interface AccionCorrectivaPublicData {
  id_accion: string;
  id_ficha: string;
  numero_accion: number;
  descripcion_accion: string;
  implementacion_descripcion?: string | null;
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

  get createdAt(): Date {
    return this.data.created_at;
  }

  // Crea una nueva instancia
  static create(data: {
    id_ficha: string;
    numero_accion: number;
    descripcion_accion: string;
    implementacion_descripcion?: string;
  }): AccionCorrectiva {
    return new AccionCorrectiva({
      id_accion: "",
      id_ficha: data.id_ficha,
      numero_accion: data.numero_accion,
      descripcion_accion: data.descripcion_accion,
      implementacion_descripcion: data.implementacion_descripcion,
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
      created_at: this.data.created_at.toISOString(),
    };
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
}
