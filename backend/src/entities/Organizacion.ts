// Interfaz para datos de Organizacion desde BD
export interface OrganizacionData {
  id_organizacion: string;
  nombre_organizacion: string;
  abreviatura_organizacion: string;
  activo: boolean;
  created_at: Date;
  cantidad_productores?: number;
}

// Interfaz para datos publicos de Organizacion (response)
export interface OrganizacionPublicData {
  id_organizacion: string;
  nombre_organizacion: string;
  abreviatura_organizacion: string;
  activo: boolean;
  created_at: string;
  cantidad_productores?: number;
}

// Entidad Organizacion
// Representa una organizacion o asociacion de productores
// Es independiente de la jerarquia geografica
export class Organizacion {
  private data: OrganizacionData;

  constructor(data: OrganizacionData) {
    this.data = data;
  }

  // Getters
  get id(): string {
    return this.data.id_organizacion;
  }

  get nombre(): string {
    return this.data.nombre_organizacion;
  }

  get abreviatura(): string {
    return this.data.abreviatura_organizacion;
  }

  get activo(): boolean {
    return this.data.activo;
  }

  get createdAt(): Date {
    return this.data.created_at;
  }

  get cantidadProductores(): number | undefined {
    return this.data.cantidad_productores;
  }

  // Crea una nueva instancia de Organizacion
  static create(data: {
    nombre_organizacion: string;
    abreviatura_organizacion: string;
  }): Organizacion {
    return new Organizacion({
      id_organizacion: "",
      nombre_organizacion: data.nombre_organizacion,
      abreviatura_organizacion: data.abreviatura_organizacion,
      activo: true,
      created_at: new Date(),
    });
  }

  // Crea instancia desde datos de BD
  static fromDatabase(data: OrganizacionData): Organizacion {
    return new Organizacion(data);
  }

  // Valida los datos de la organizacion
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (
      !this.data.nombre_organizacion ||
      this.data.nombre_organizacion.trim().length < 3
    ) {
      errors.push("Nombre de organización debe tener al menos 3 caracteres");
    }

    if (
      this.data.nombre_organizacion &&
      this.data.nombre_organizacion.trim().length > 100
    ) {
      errors.push("Nombre de organización no puede exceder 100 caracteres");
    }

    if (
      !this.data.abreviatura_organizacion ||
      this.data.abreviatura_organizacion.trim().length < 2 ||
      this.data.abreviatura_organizacion.trim().length > 5
    ) {
      errors.push("Abreviatura debe tener entre 2 y 5 caracteres");
    }

    // Validar que abreviatura sea solo letras mayusculas
    if (
      this.data.abreviatura_organizacion &&
      !/^[A-Z]+$/.test(this.data.abreviatura_organizacion.trim())
    ) {
      errors.push(
        "Abreviatura debe contener solo letras mayúsculas sin espacios"
      );
    }

    // Validar que no contenga caracteres especiales peligrosos
    if (
      this.data.nombre_organizacion &&
      /[<>{}[\]\\]/.test(this.data.nombre_organizacion)
    ) {
      errors.push("Nombre de organización contiene caracteres no permitidos");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Convierte a formato para insertar en BD
  toDatabaseInsert(): {
    nombre_organizacion: string;
    abreviatura_organizacion: string;
    activo: boolean;
  } {
    return {
      nombre_organizacion: this.data.nombre_organizacion.trim(),
      abreviatura_organizacion: this.data.abreviatura_organizacion
        .trim()
        .toUpperCase(),
      activo: this.data.activo,
    };
  }

  // Convierte a formato para actualizar en BD
  toDatabaseUpdate(): {
    nombre_organizacion?: string;
    abreviatura_organizacion?: string;
    activo?: boolean;
  } {
    return {
      nombre_organizacion: this.data.nombre_organizacion?.trim(),
      abreviatura_organizacion: this.data.abreviatura_organizacion
        ?.trim()
        .toUpperCase(),
      activo: this.data.activo,
    };
  }

  // Convierte a formato JSON publico (sin datos sensibles)
  toJSON(): OrganizacionPublicData {
    return {
      id_organizacion: this.data.id_organizacion,
      nombre_organizacion: this.data.nombre_organizacion,
      abreviatura_organizacion: this.data.abreviatura_organizacion,
      activo: this.data.activo,
      created_at: this.data.created_at.toISOString(),
      cantidad_productores: this.data.cantidad_productores,
    };
  }

  // Verifica si la organizacion puede ser desactivada
  puedeDesactivar(): { valid: boolean; error?: string } {
    if (!this.data.activo) {
      return {
        valid: false,
        error: "La organización ya está inactiva",
      };
    }

    if (this.data.cantidad_productores && this.data.cantidad_productores > 0) {
      return {
        valid: false,
        error: `La organización tiene ${this.data.cantidad_productores} productor(es) asociado(s)`,
      };
    }

    return { valid: true };
  }

  // Verifica si tiene productores asociados
  tieneProductores(): boolean {
    return (this.data.cantidad_productores ?? 0) > 0;
  }

  // Actualiza el nombre de la organizacion
  actualizarNombre(nuevoNombre: string): void {
    if (!nuevoNombre || nuevoNombre.trim().length < 3) {
      throw new Error("Nombre debe tener al menos 3 caracteres");
    }

    if (nuevoNombre.trim().length > 100) {
      throw new Error("Nombre no puede exceder 100 caracteres");
    }

    this.data.nombre_organizacion = nuevoNombre.trim();
  }

  // Actualiza la abreviatura de la organizacion
  actualizarAbreviatura(nuevaAbreviatura: string): void {
    const abrev = nuevaAbreviatura.trim().toUpperCase();

    if (abrev.length < 2 || abrev.length > 5) {
      throw new Error("Abreviatura debe tener entre 2 y 5 caracteres");
    }

    if (!/^[A-Z]+$/.test(abrev)) {
      throw new Error("Abreviatura debe contener solo letras mayúsculas");
    }

    this.data.abreviatura_organizacion = abrev;
  }

  // Actualiza el estado activo
  actualizarEstado(activo: boolean): void {
    if (!activo) {
      const validacion = this.puedeDesactivar();
      if (!validacion.valid) {
        throw new Error(validacion.error);
      }
    }
    this.data.activo = activo;
  }

  // Actualiza la cantidad de productores (usado internamente)
  actualizarCantidadProductores(cantidad: number): void {
    if (cantidad < 0) {
      throw new Error("Cantidad de productores no puede ser negativa");
    }
    this.data.cantidad_productores = cantidad;
  }

  // Activa la organizacion
  activar(): void {
    this.data.activo = true;
  }

  // Desactiva la organizacion
  desactivar(): void {
    const validacion = this.puedeDesactivar();
    if (!validacion.valid) {
      throw new Error(validacion.error);
    }
    this.data.activo = false;
  }

  // Obtiene informacion resumida de la organizacion
  getResumen(): string {
    const partes = [
      `${this.data.nombre_organizacion} (${this.data.abreviatura_organizacion})`,
    ];

    if (this.data.cantidad_productores) {
      partes.push(`${this.data.cantidad_productores} productor(es)`);
    }

    return partes.join(" - ");
  }

  // Verifica si es una organizacion sin productores
  estaSinProductores(): boolean {
    return !this.tieneProductores();
  }

  // Compara dos organizaciones por nombre (para ordenamiento)
  static compararPorNombre(a: Organizacion, b: Organizacion): number {
    return a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" });
  }

  // Compara dos organizaciones por abreviatura (para ordenamiento)
  static compararPorAbreviatura(a: Organizacion, b: Organizacion): number {
    return a.abreviatura.localeCompare(b.abreviatura, "es", {
      sensitivity: "base",
    });
  }
}
