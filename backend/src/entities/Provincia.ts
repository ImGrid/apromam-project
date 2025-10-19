// Interfaz para datos de Provincia desde BD
export interface ProvinciaData {
  id_provincia: string;
  id_departamento: string;
  nombre_provincia: string;
  activo: boolean;
  created_at: Date;
  nombre_departamento?: string;
  cantidad_municipios?: number;
  cantidad_comunidades?: number;
  cantidad_productores?: number;
}

// Interfaz para datos publicos de Provincia (response)
export interface ProvinciaPublicData {
  id_provincia: string;
  id_departamento: string;
  nombre_provincia: string;
  activo: boolean;
  created_at: string;
  nombre_departamento?: string;
  cantidad_municipios?: number;
  cantidad_comunidades?: number;
  cantidad_productores?: number;
}

// Entidad Provincia
// Representa una provincia dentro del sistema geografico
// Nivel superior de la jerarquia: Provincia -> Municipio -> Comunidad
export class Provincia {
  private data: ProvinciaData;

  constructor(data: ProvinciaData) {
    this.data = data;
  }

  // Getters
  get id(): string {
    return this.data.id_provincia;
  }

  get idDepartamento(): string {
    return this.data.id_departamento;
  }

  get nombre(): string {
    return this.data.nombre_provincia;
  }

  get nombreDepartamento(): string | undefined {
    return this.data.nombre_departamento;
  }

  get activo(): boolean {
    return this.data.activo;
  }

  get createdAt(): Date {
    return this.data.created_at;
  }

  get cantidadMunicipios(): number | undefined {
    return this.data.cantidad_municipios;
  }

  get cantidadComunidades(): number | undefined {
    return this.data.cantidad_comunidades;
  }

  get cantidadProductores(): number | undefined {
    return this.data.cantidad_productores;
  }

  // Crea una nueva instancia de Provincia
  static create(data: {
    nombre_provincia: string;
    id_departamento: string;
  }): Provincia {
    return new Provincia({
      id_provincia: "",
      id_departamento: data.id_departamento,
      nombre_provincia: data.nombre_provincia,
      activo: true,
      created_at: new Date(),
    });
  }

  // Crea instancia desde datos de BD
  static fromDatabase(data: ProvinciaData): Provincia {
    return new Provincia(data);
  }

  // Valida los datos de la provincia
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (
      !this.data.nombre_provincia ||
      this.data.nombre_provincia.trim().length < 3
    ) {
      errors.push("Nombre de provincia debe tener al menos 3 caracteres");
    }

    if (
      this.data.nombre_provincia &&
      this.data.nombre_provincia.trim().length > 100
    ) {
      errors.push("Nombre de provincia no puede exceder 100 caracteres");
    }

    // Validar que no contenga caracteres especiales peligrosos
    if (
      this.data.nombre_provincia &&
      /[<>{}[\]\\]/.test(this.data.nombre_provincia)
    ) {
      errors.push("Nombre de provincia contiene caracteres no permitidos");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Convierte a formato para insertar en BD
  toDatabaseInsert(): {
    nombre_provincia: string;
    activo: boolean;
  } {
    return {
      nombre_provincia: this.data.nombre_provincia.trim(),
      activo: this.data.activo,
    };
  }

  // Convierte a formato para actualizar en BD
  toDatabaseUpdate(): {
    nombre_provincia?: string;
    activo?: boolean;
  } {
    return {
      nombre_provincia: this.data.nombre_provincia?.trim(),
      activo: this.data.activo,
    };
  }

  // Convierte a formato JSON publico (sin datos sensibles)
  toJSON(): ProvinciaPublicData {
    return {
      id_provincia: this.data.id_provincia,
      id_departamento: this.data.id_departamento,
      nombre_provincia: this.data.nombre_provincia,
      activo: this.data.activo,
      created_at: this.data.created_at.toISOString(),
      nombre_departamento: this.data.nombre_departamento,
      cantidad_municipios: this.data.cantidad_municipios,
      cantidad_comunidades: this.data.cantidad_comunidades,
      cantidad_productores: this.data.cantidad_productores,
    };
  }

  // Verifica si la provincia puede ser desactivada
  puedeDesactivar(): { valid: boolean; error?: string } {
    if (!this.data.activo) {
      return {
        valid: false,
        error: "La provincia ya está inactiva",
      };
    }

    if (this.data.cantidad_municipios && this.data.cantidad_municipios > 0) {
      return {
        valid: false,
        error: `La provincia tiene ${this.data.cantidad_municipios} municipio(s) asociado(s)`,
      };
    }

    return { valid: true };
  }

  // Verifica si tiene municipios asociados
  tieneMunicipios(): boolean {
    return (this.data.cantidad_municipios ?? 0) > 0;
  }

  // Verifica si tiene comunidades asociadas (transitivamente)
  tieneComunidades(): boolean {
    return (this.data.cantidad_comunidades ?? 0) > 0;
  }

  // Verifica si tiene productores asociados (transitivamente)
  tieneProductores(): boolean {
    return (this.data.cantidad_productores ?? 0) > 0;
  }

  // Actualiza el nombre de la provincia
  actualizarNombre(nuevoNombre: string): void {
    if (!nuevoNombre || nuevoNombre.trim().length < 3) {
      throw new Error("Nombre debe tener al menos 3 caracteres");
    }

    if (nuevoNombre.trim().length > 100) {
      throw new Error("Nombre no puede exceder 100 caracteres");
    }

    this.data.nombre_provincia = nuevoNombre.trim();
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
  actualizarContadores(
    municipios: number,
    comunidades: number,
    productores: number
  ): void {
    if (municipios < 0 || comunidades < 0 || productores < 0) {
      throw new Error("Los contadores no pueden ser negativos");
    }

    this.data.cantidad_municipios = municipios;
    this.data.cantidad_comunidades = comunidades;
    this.data.cantidad_productores = productores;
  }

  // Activa la provincia
  activar(): void {
    this.data.activo = true;
  }

  // Desactiva la provincia
  desactivar(): void {
    const validacion = this.puedeDesactivar();
    if (!validacion.valid) {
      throw new Error(validacion.error);
    }
    this.data.activo = false;
  }

  // Obtiene informacion resumida de la provincia
  getResumen(): string {
    const partes = [this.data.nombre_provincia];

    if (this.data.cantidad_municipios) {
      partes.push(`${this.data.cantidad_municipios} municipio(s)`);
    }

    if (this.data.cantidad_comunidades) {
      partes.push(`${this.data.cantidad_comunidades} comunidad(es)`);
    }

    if (this.data.cantidad_productores) {
      partes.push(`${this.data.cantidad_productores} productor(es)`);
    }

    return partes.join(", ");
  }

  // Verifica si es una provincia sin asignaciones
  estaSinAsignaciones(): boolean {
    return (
      !this.tieneMunicipios() &&
      !this.tieneComunidades() &&
      !this.tieneProductores()
    );
  }

  // Compara dos provincias por nombre (para ordenamiento)
  static compararPorNombre(a: Provincia, b: Provincia): number {
    return a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" });
  }
}
