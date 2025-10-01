// Interfaz para datos de Municipio desde BD
export interface MunicipioData {
  id_municipio: string;
  id_provincia: string;
  nombre_municipio: string;
  activo: boolean;
  created_at: Date;
  nombre_provincia?: string;
  cantidad_comunidades?: number;
  cantidad_productores?: number;
}

// Interfaz para datos publicos de Municipio (response)
export interface MunicipioPublicData {
  id_municipio: string;
  id_provincia: string;
  nombre_municipio: string;
  nombre_provincia?: string;
  activo: boolean;
  created_at: string;
  cantidad_comunidades?: number;
  cantidad_productores?: number;
}

// Entidad Municipio
// Representa un municipio dentro de una provincia
// Nivel medio de la jerarquia: Provincia -> Municipio -> Comunidad
export class Municipio {
  private data: MunicipioData;

  constructor(data: MunicipioData) {
    this.data = data;
  }

  // Getters
  get id(): string {
    return this.data.id_municipio;
  }

  get idProvincia(): string {
    return this.data.id_provincia;
  }

  get nombre(): string {
    return this.data.nombre_municipio;
  }

  get nombreProvincia(): string | undefined {
    return this.data.nombre_provincia;
  }

  get activo(): boolean {
    return this.data.activo;
  }

  get createdAt(): Date {
    return this.data.created_at;
  }

  get cantidadComunidades(): number | undefined {
    return this.data.cantidad_comunidades;
  }

  get cantidadProductores(): number | undefined {
    return this.data.cantidad_productores;
  }

  // Crea una nueva instancia de Municipio
  static create(data: {
    id_provincia: string;
    nombre_municipio: string;
  }): Municipio {
    return new Municipio({
      id_municipio: "",
      id_provincia: data.id_provincia,
      nombre_municipio: data.nombre_municipio,
      activo: true,
      created_at: new Date(),
    });
  }

  // Crea instancia desde datos de BD
  static fromDatabase(data: MunicipioData): Municipio {
    return new Municipio(data);
  }

  // Valida los datos del municipio
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (
      !this.data.nombre_municipio ||
      this.data.nombre_municipio.trim().length < 3
    ) {
      errors.push("Nombre de municipio debe tener al menos 3 caracteres");
    }

    if (
      this.data.nombre_municipio &&
      this.data.nombre_municipio.trim().length > 100
    ) {
      errors.push("Nombre de municipio no puede exceder 100 caracteres");
    }

    if (!this.data.id_provincia) {
      errors.push("ID de provincia es requerido");
    }

    // Validar que no contenga caracteres especiales peligrosos
    if (
      this.data.nombre_municipio &&
      /[<>{}[\]\\]/.test(this.data.nombre_municipio)
    ) {
      errors.push("Nombre de municipio contiene caracteres no permitidos");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Convierte a formato para insertar en BD
  toDatabaseInsert(): {
    id_provincia: string;
    nombre_municipio: string;
    activo: boolean;
  } {
    return {
      id_provincia: this.data.id_provincia,
      nombre_municipio: this.data.nombre_municipio.trim(),
      activo: this.data.activo,
    };
  }

  // Convierte a formato para actualizar en BD
  toDatabaseUpdate(): {
    nombre_municipio?: string;
    activo?: boolean;
  } {
    return {
      nombre_municipio: this.data.nombre_municipio?.trim(),
      activo: this.data.activo,
    };
  }

  // Convierte a formato JSON publico (sin datos sensibles)
  toJSON(): MunicipioPublicData {
    return {
      id_municipio: this.data.id_municipio,
      id_provincia: this.data.id_provincia,
      nombre_municipio: this.data.nombre_municipio,
      nombre_provincia: this.data.nombre_provincia,
      activo: this.data.activo,
      created_at: this.data.created_at.toISOString(),
      cantidad_comunidades: this.data.cantidad_comunidades,
      cantidad_productores: this.data.cantidad_productores,
    };
  }

  // Verifica si el municipio puede ser desactivado
  puedeDesactivar(): { valid: boolean; error?: string } {
    if (!this.data.activo) {
      return {
        valid: false,
        error: "El municipio ya está inactivo",
      };
    }

    if (this.data.cantidad_comunidades && this.data.cantidad_comunidades > 0) {
      return {
        valid: false,
        error: `El municipio tiene ${this.data.cantidad_comunidades} comunidad(es) asociada(s)`,
      };
    }

    return { valid: true };
  }

  // Verifica si tiene comunidades asociadas
  tieneComunidades(): boolean {
    return (this.data.cantidad_comunidades ?? 0) > 0;
  }

  // Verifica si tiene productores asociados (transitivamente)
  tieneProductores(): boolean {
    return (this.data.cantidad_productores ?? 0) > 0;
  }

  // Actualiza el nombre del municipio
  actualizarNombre(nuevoNombre: string): void {
    if (!nuevoNombre || nuevoNombre.trim().length < 3) {
      throw new Error("Nombre debe tener al menos 3 caracteres");
    }

    if (nuevoNombre.trim().length > 100) {
      throw new Error("Nombre no puede exceder 100 caracteres");
    }

    this.data.nombre_municipio = nuevoNombre.trim();
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

  // Actualiza contadores de entidades relacionadas (uso interno)
  actualizarContadores(comunidades: number, productores: number): void {
    if (comunidades < 0 || productores < 0) {
      throw new Error("Los contadores no pueden ser negativos");
    }

    this.data.cantidad_comunidades = comunidades;
    this.data.cantidad_productores = productores;
  }

  // Activa el municipio
  activar(): void {
    this.data.activo = true;
  }

  // Desactiva el municipio
  desactivar(): void {
    const validacion = this.puedeDesactivar();
    if (!validacion.valid) {
      throw new Error(validacion.error);
    }
    this.data.activo = false;
  }

  // Obtiene informacion resumida del municipio
  getResumen(): string {
    const partes = [this.data.nombre_municipio];

    if (this.data.nombre_provincia) {
      partes.push(this.data.nombre_provincia);
    }

    if (this.data.cantidad_comunidades) {
      partes.push(`${this.data.cantidad_comunidades} comunidad(es)`);
    }

    if (this.data.cantidad_productores) {
      partes.push(`${this.data.cantidad_productores} productor(es)`);
    }

    return partes.join(", ");
  }

  // Verifica si es un municipio sin asignaciones
  estaSinAsignaciones(): boolean {
    return !this.tieneComunidades() && !this.tieneProductores();
  }

  // Obtiene el nombre completo (municipio, provincia)
  getNombreCompleto(): string {
    if (this.data.nombre_provincia) {
      return `${this.data.nombre_municipio}, ${this.data.nombre_provincia}`;
    }
    return this.data.nombre_municipio;
  }

  // Compara dos municipios por nombre (para ordenamiento)
  static compararPorNombre(a: Municipio, b: Municipio): number {
    return a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" });
  }

  // Compara dos municipios por provincia y luego por nombre
  static compararPorProvinciaYNombre(a: Municipio, b: Municipio): number {
    // Primero comparar por provincia
    const provinciaComparison = (a.nombreProvincia || "").localeCompare(
      b.nombreProvincia || "",
      "es",
      { sensitivity: "base" }
    );

    if (provinciaComparison !== 0) {
      return provinciaComparison;
    }

    // Si son de la misma provincia, comparar por nombre de municipio
    return a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" });
  }
}
