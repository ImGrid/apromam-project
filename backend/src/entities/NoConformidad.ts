// Tipo para estado de seguimiento
export type EstadoSeguimiento = "pendiente" | "seguimiento" | "corregido";

// Interfaz para datos de NoConformidad desde BD
export interface NoConformidadData {
  id_no_conformidad: string;
  id_ficha: string;
  descripcion_no_conformidad: string;
  accion_correctiva_propuesta?: string | null;
  fecha_limite_implementacion?: Date | null;
  estado_seguimiento: EstadoSeguimiento;
  comentario_seguimiento?: string | null;
  fecha_seguimiento?: Date | null;
  realizado_por_usuario?: string | null;
  updated_at: Date;
  created_at: Date;
}

// Interfaz para datos publicos (response)
export interface NoConformidadPublicData {
  id_no_conformidad: string;
  id_ficha: string;
  descripcion_no_conformidad: string;
  accion_correctiva_propuesta?: string | null;
  fecha_limite_implementacion?: string | null;
  estado_seguimiento: EstadoSeguimiento;
  comentario_seguimiento?: string | null;
  fecha_seguimiento?: string | null;
  realizado_por_usuario?: string | null;
  updated_at: string;
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

  get estadoSeguimiento(): EstadoSeguimiento {
    return this.data.estado_seguimiento;
  }

  get comentarioSeguimiento(): string | null {
    return this.data.comentario_seguimiento ?? null;
  }

  get fechaSeguimiento(): Date | null {
    return this.data.fecha_seguimiento ?? null;
  }

  get realizadoPorUsuario(): string | null {
    return this.data.realizado_por_usuario ?? null;
  }

  get updatedAt(): Date {
    return this.data.updated_at;
  }

  get createdAt(): Date {
    return this.data.created_at;
  }

  // Crea una nueva instancia (para crear en fichas)
  static create(data: {
    id_ficha: string;
    descripcion_no_conformidad: string;
    accion_correctiva_propuesta?: string;
    fecha_limite_implementacion?: Date;
    estado_seguimiento?: EstadoSeguimiento; // Opcional, default 'pendiente'
    comentario_seguimiento?: string;
  }): NoConformidad {
    return new NoConformidad({
      id_no_conformidad: "",
      id_ficha: data.id_ficha,
      descripcion_no_conformidad: data.descripcion_no_conformidad,
      accion_correctiva_propuesta: data.accion_correctiva_propuesta,
      fecha_limite_implementacion: data.fecha_limite_implementacion,
      estado_seguimiento: data.estado_seguimiento || "pendiente",
      comentario_seguimiento: data.comentario_seguimiento,
      fecha_seguimiento: undefined,
      realizado_por_usuario: undefined,
      updated_at: new Date(),
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

    if (
      this.data.comentario_seguimiento &&
      this.data.comentario_seguimiento.length > 1000
    ) {
      errors.push("Comentario de seguimiento no puede exceder 1000 caracteres");
    }

    // Validar estado
    const estadosValidos: EstadoSeguimiento[] = ["pendiente", "seguimiento", "corregido"];
    if (!estadosValidos.includes(this.data.estado_seguimiento)) {
      errors.push("Estado de seguimiento inválido");
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
      estado_seguimiento: this.data.estado_seguimiento,
      comentario_seguimiento: this.data.comentario_seguimiento?.trim() || null,
      fecha_seguimiento: this.data.fecha_seguimiento,
      realizado_por_usuario: this.data.realizado_por_usuario,
      updated_at: this.data.updated_at,
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
      estado_seguimiento: this.data.estado_seguimiento,
      comentario_seguimiento: this.data.comentario_seguimiento?.trim() || null,
      fecha_seguimiento: this.data.fecha_seguimiento,
      realizado_por_usuario: this.data.realizado_por_usuario,
      updated_at: new Date(),
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
      estado_seguimiento: this.data.estado_seguimiento,
      comentario_seguimiento: this.data.comentario_seguimiento ?? null,
      fecha_seguimiento: this.data.fecha_seguimiento?.toISOString() ?? null,
      realizado_por_usuario: this.data.realizado_por_usuario ?? null,
      updated_at: this.data.updated_at.toISOString(),
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

  // Actualiza seguimiento completo
  // IMPORTANTE: fecha_seguimiento es opcional para permitir entrada manual (gestiones historicas)
  // Si no se proporciona, se usa la fecha actual
  actualizarSeguimiento(data: {
    estado_seguimiento: EstadoSeguimiento;
    comentario_seguimiento?: string;
    fecha_seguimiento?: Date; // Opcional: permite entrada manual
    realizado_por_usuario: string;
  }): void {
    this.data.estado_seguimiento = data.estado_seguimiento;
    this.data.comentario_seguimiento = data.comentario_seguimiento?.trim() || null;
    this.data.fecha_seguimiento = data.fecha_seguimiento ?? new Date();
    this.data.realizado_por_usuario = data.realizado_por_usuario;
    this.data.updated_at = new Date();
  }

  // Verifica si está pendiente
  estaPendiente(): boolean {
    return this.data.estado_seguimiento === "pendiente";
  }

  // Verifica si está en seguimiento
  estaEnSeguimiento(): boolean {
    return this.data.estado_seguimiento === "seguimiento";
  }

  // Verifica si está corregida
  estaCorregida(): boolean {
    return this.data.estado_seguimiento === "corregido";
  }
}
