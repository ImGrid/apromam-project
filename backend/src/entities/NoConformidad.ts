// Interfaz para datos de NoConformidad desde BD
export interface NoConformidadData {
  id_no_conformidad: string;
  id_ficha: string;
  descripcion_no_conformidad: string;
  accion_correctiva_propuesta?: string | null;
  fecha_limite_implementacion?: Date | null;
  created_at: Date;
}

// Interfaz para datos publicos (response)
export interface NoConformidadPublicData {
  id_no_conformidad: string;
  id_ficha: string;
  descripcion_no_conformidad: string;
  accion_correctiva_propuesta?: string | null;
  fecha_limite_implementacion?: string | null;
  created_at: string;
}

// Entity NoConformidad
// Representa una no conformidad detectada en la gestion presente (Seccion 11)
export class NoConformidad {
  private data: NoConformidadData;

  constructor(data: NoConformidadData) {
    this.data = data;
  }

  // Getters
  get id(): string {
    return this.data.id_no_conformidad;
  }

  get idFicha(): string {
    return this.data.id_ficha;
  }

  get descripcion(): string {
    return this.data.descripcion_no_conformidad;
  }

  get accionCorrectivaPropuesta(): string | null {
    return this.data.accion_correctiva_propuesta ?? null;
  }

  get fechaLimite(): Date | null {
    return this.data.fecha_limite_implementacion ?? null;
  }

  get createdAt(): Date {
    return this.data.created_at;
  }

  // Crea una nueva instancia
  static create(data: {
    id_ficha: string;
    descripcion_no_conformidad: string;
    accion_correctiva_propuesta?: string;
    fecha_limite_implementacion?: Date;
  }): NoConformidad {
    return new NoConformidad({
      id_no_conformidad: "",
      id_ficha: data.id_ficha,
      descripcion_no_conformidad: data.descripcion_no_conformidad,
      accion_correctiva_propuesta: data.accion_correctiva_propuesta,
      fecha_limite_implementacion: data.fecha_limite_implementacion,
      created_at: new Date(),
    });
  }

  // Crea instancia desde datos de BD
  static fromDatabase(data: NoConformidadData): NoConformidad {
    return new NoConformidad(data);
  }

  // Valida los datos
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.data.id_ficha) {
      errors.push("ID de ficha es requerido");
    }

    if (
      !this.data.descripcion_no_conformidad ||
      this.data.descripcion_no_conformidad.trim().length < 5
    ) {
      errors.push("Descripcion debe tener al menos 5 caracteres");
    }

    if (this.data.descripcion_no_conformidad.length > 500) {
      errors.push("Descripcion no puede exceder 500 caracteres");
    }

    if (
      this.data.accion_correctiva_propuesta &&
      this.data.accion_correctiva_propuesta.length > 500
    ) {
      errors.push("Accion correctiva no puede exceder 500 caracteres");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Convierte a formato para insertar en BD
  toDatabaseInsert(): Omit<
    NoConformidadData,
    "id_no_conformidad" | "created_at"
  > {
    return {
      id_ficha: this.data.id_ficha,
      descripcion_no_conformidad: this.data.descripcion_no_conformidad.trim(),
      accion_correctiva_propuesta:
        this.data.accion_correctiva_propuesta?.trim() || null,
      fecha_limite_implementacion: this.data.fecha_limite_implementacion,
    };
  }

  // Convierte a formato para actualizar en BD
  toDatabaseUpdate(): Partial<
    Omit<NoConformidadData, "id_no_conformidad" | "id_ficha" | "created_at">
  > {
    return {
      descripcion_no_conformidad: this.data.descripcion_no_conformidad.trim(),
      accion_correctiva_propuesta:
        this.data.accion_correctiva_propuesta?.trim() || null,
      fecha_limite_implementacion: this.data.fecha_limite_implementacion,
    };
  }

  // Convierte a formato JSON publico
  toJSON(): NoConformidadPublicData {
    return {
      id_no_conformidad: this.data.id_no_conformidad,
      id_ficha: this.data.id_ficha,
      descripcion_no_conformidad: this.data.descripcion_no_conformidad,
      accion_correctiva_propuesta:
        this.data.accion_correctiva_propuesta ?? null,
      fecha_limite_implementacion:
        this.data.fecha_limite_implementacion?.toISOString() ?? null,
      created_at: this.data.created_at.toISOString(),
    };
  }

  // Verifica si tiene fecha limite
  tieneFechaLimite(): boolean {
    return this.data.fecha_limite_implementacion !== null;
  }

  // Actualiza descripcion
  actualizarDescripcion(descripcion: string): void {
    if (descripcion.trim().length < 5) {
      throw new Error("Descripcion debe tener al menos 5 caracteres");
    }

    if (descripcion.length > 500) {
      throw new Error("Descripcion no puede exceder 500 caracteres");
    }

    this.data.descripcion_no_conformidad = descripcion.trim();
  }

  // Actualiza accion correctiva propuesta
  actualizarAccionCorrectiva(accion: string): void {
    if (accion.length > 500) {
      throw new Error("Accion correctiva no puede exceder 500 caracteres");
    }

    this.data.accion_correctiva_propuesta = accion.trim();
  }

  // Actualiza fecha limite
  actualizarFechaLimite(fecha: Date): void {
    this.data.fecha_limite_implementacion = fecha;
  }
}
