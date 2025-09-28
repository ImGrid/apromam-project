// Interfaz para datos de TipoCultivo desde BD
export interface TipoCultivoData {
  id_tipo_cultivo: string;
  nombre_cultivo: string;
  descripcion?: string | null;
  es_principal_certificable: boolean | null;
  rendimiento_promedio_qq_ha?: number | null;
  activo: boolean | null;
}

// Interfaz para datos publicos de TipoCultivo (response)
export interface TipoCultivoPublicData {
  id_tipo_cultivo: string;
  nombre_cultivo: string;
  descripcion: string | null;
  es_principal_certificable: boolean | null;
  rendimiento_promedio_qq_ha: number | null;
  activo: boolean | null;
}

// Entidad TipoCultivo
// Representa los tipos de cultivo disponibles en el sistema
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
    return this.data.nombre_cultivo;
  }

  get descripcion(): string | null {
    return this.data.descripcion ?? null;
  }

  get esPrincipalCertificable(): boolean | null {
    return this.data.es_principal_certificable;
  }

  get rendimientoPromedio(): number | null {
    return this.data.rendimiento_promedio_qq_ha ?? null;
  }

  get activo(): boolean | null {
    return this.data.activo;
  }

  // Crea una nueva instancia de TipoCultivo
  static create(data: {
    nombre_cultivo: string;
    descripcion?: string;
    es_principal_certificable?: boolean;
    rendimiento_promedio_qq_ha?: number;
  }): TipoCultivo {
    return new TipoCultivo({
      id_tipo_cultivo: "",
      nombre_cultivo: data.nombre_cultivo,
      descripcion: data.descripcion ?? null,
      es_principal_certificable: data.es_principal_certificable ?? false,
      rendimiento_promedio_qq_ha: data.rendimiento_promedio_qq_ha ?? null,
      activo: true,
    });
  }

  // Crea instancia desde datos de BD
  static fromDatabase(data: TipoCultivoData): TipoCultivo {
    return new TipoCultivo(data);
  }

  // Valida los datos del tipo cultivo
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (
      !this.data.nombre_cultivo ||
      this.data.nombre_cultivo.trim().length < 2
    ) {
      errors.push("Nombre de tipo cultivo debe tener al menos 2 caracteres");
    }

    if (
      this.data.rendimiento_promedio_qq_ha !== undefined &&
      this.data.rendimiento_promedio_qq_ha !== null &&
      this.data.rendimiento_promedio_qq_ha <= 0
    ) {
      errors.push("Rendimiento promedio debe ser positivo");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Convierte a formato para insertar en BD
  toDatabaseInsert(): {
    nombre_cultivo: string;
    descripcion: string | null;
    es_principal_certificable: boolean | null;
    rendimiento_promedio_qq_ha: number | null;
    activo: boolean | null;
  } {
    return {
      nombre_cultivo: this.data.nombre_cultivo.trim(),
      descripcion: this.data.descripcion?.trim() ?? null,
      es_principal_certificable: this.data.es_principal_certificable,
      rendimiento_promedio_qq_ha: this.data.rendimiento_promedio_qq_ha ?? null,
      activo: this.data.activo,
    };
  }

  // Convierte a formato para actualizar en BD
  toDatabaseUpdate(): {
    nombre_cultivo?: string;
    descripcion?: string | null;
    es_principal_certificable?: boolean | null;
    rendimiento_promedio_qq_ha?: number | null;
    activo?: boolean | null;
  } {
    return {
      nombre_cultivo: this.data.nombre_cultivo?.trim(),
      descripcion: this.data.descripcion?.trim() ?? null,
      es_principal_certificable: this.data.es_principal_certificable,
      rendimiento_promedio_qq_ha: this.data.rendimiento_promedio_qq_ha ?? null,
      activo: this.data.activo,
    };
  }

  // Convierte a formato JSON publico (sin datos sensibles)
  toJSON(): TipoCultivoPublicData {
    return {
      id_tipo_cultivo: this.data.id_tipo_cultivo,
      nombre_cultivo: this.data.nombre_cultivo,
      descripcion: this.data.descripcion ?? null,
      es_principal_certificable: this.data.es_principal_certificable,
      rendimiento_promedio_qq_ha: this.data.rendimiento_promedio_qq_ha ?? null,
      activo: this.data.activo,
    };
  }

  // Verifica si el tipo cultivo puede ser desactivado
  puedeDesactivar(): { valid: boolean; error?: string } {
    if (!this.data.activo) {
      return {
        valid: false,
        error: "El tipo cultivo ya esta inactivo",
      };
    }

    return { valid: true };
  }

  // Actualiza el rendimiento promedio
  actualizarRendimiento(nuevoRendimiento: number): void {
    if (nuevoRendimiento <= 0) {
      throw new Error("Rendimiento debe ser positivo");
    }
    this.data.rendimiento_promedio_qq_ha = nuevoRendimiento;
  }

  // Actualiza el nombre
  actualizarNombre(nuevoNombre: string): void {
    if (!nuevoNombre || nuevoNombre.trim().length < 2) {
      throw new Error("Nombre debe tener al menos 2 caracteres");
    }
    this.data.nombre_cultivo = nuevoNombre.trim();
  }

  // Actualiza la descripcion
  actualizarDescripcion(nuevaDescripcion: string): void {
    this.data.descripcion = nuevaDescripcion.trim();
  }

  // Actualiza si es principal certificable
  actualizarPrincipalCertificable(valor: boolean): void {
    this.data.es_principal_certificable = valor;
  }

  // Activa el tipo cultivo
  activar(): void {
    this.data.activo = true;
  }

  // Desactiva el tipo cultivo
  desactivar(): void {
    this.data.activo = false;
  }
}
