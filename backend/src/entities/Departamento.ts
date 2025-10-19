// Interfaz para datos de Departamento desde BD
export interface DepartamentoData {
  id_departamento: string;
  nombre_departamento: string;
  activo: boolean;
  created_at: Date;
  cantidad_provincias?: number;
  cantidad_municipios?: number;
  cantidad_comunidades?: number;
  cantidad_productores?: number;
}

// Interfaz para datos publicos de Departamento (response)
export interface DepartamentoPublicData {
  id_departamento: string;
  nombre_departamento: string;
  activo: boolean;
  created_at: string;
  cantidad_provincias?: number;
  cantidad_municipios?: number;
  cantidad_comunidades?: number;
  cantidad_productores?: number;
}

// Entidad Departamento
// Representa un departamento dentro del sistema geografico
// Nivel superior de la jerarquia: Departamento -> Provincia -> Municipio -> Comunidad
export class Departamento {
  private data: DepartamentoData;

  constructor(data: DepartamentoData) {
    this.data = data;
  }

  // Getters
  get id(): string {
    return this.data.id_departamento;
  }

  get nombre(): string {
    return this.data.nombre_departamento;
  }

  get activo(): boolean {
    return this.data.activo;
  }

  get createdAt(): Date {
    return this.data.created_at;
  }

  get cantidadProvincias(): number | undefined {
    return this.data.cantidad_provincias;
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

  // Crea una nueva instancia de Departamento
  static create(data: { nombre_departamento: string }): Departamento {
    return new Departamento({
      id_departamento: "",
      nombre_departamento: data.nombre_departamento,
      activo: true,
      created_at: new Date(),
    });
  }

  // Crea instancia desde datos de BD
  static fromDatabase(data: DepartamentoData): Departamento {
    return new Departamento(data);
  }

  // Valida los datos del departamento
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (
      !this.data.nombre_departamento ||
      this.data.nombre_departamento.trim().length < 3
    ) {
      errors.push("Nombre de departamento debe tener al menos 3 caracteres");
    }

    if (
      this.data.nombre_departamento &&
      this.data.nombre_departamento.trim().length > 100
    ) {
      errors.push("Nombre de departamento no puede exceder 100 caracteres");
    }

    // Validar que no contenga caracteres especiales peligrosos
    if (
      this.data.nombre_departamento &&
      /[<>{}[\]\\]/.test(this.data.nombre_departamento)
    ) {
      errors.push("Nombre de departamento contiene caracteres no permitidos");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Convierte a formato para insertar en BD
  toDatabaseInsert(): {
    nombre_departamento: string;
    activo: boolean;
  } {
    return {
      nombre_departamento: this.data.nombre_departamento.trim(),
      activo: this.data.activo,
    };
  }

  // Convierte a formato para actualizar en BD
  toDatabaseUpdate(): {
    nombre_departamento?: string;
    activo?: boolean;
  } {
    return {
      nombre_departamento: this.data.nombre_departamento?.trim(),
      activo: this.data.activo,
    };
  }

  // Convierte a formato JSON publico (sin datos sensibles)
  toJSON(): DepartamentoPublicData {
    return {
      id_departamento: this.data.id_departamento,
      nombre_departamento: this.data.nombre_departamento,
      activo: this.data.activo,
      created_at: this.data.created_at.toISOString(),
      cantidad_provincias: this.data.cantidad_provincias,
      cantidad_municipios: this.data.cantidad_municipios,
      cantidad_comunidades: this.data.cantidad_comunidades,
      cantidad_productores: this.data.cantidad_productores,
    };
  }

  // Verifica si el departamento puede ser desactivado
  puedeDesactivar(): { valid: boolean; error?: string } {
    if (!this.data.activo) {
      return {
        valid: false,
        error: "El departamento ya está inactivo",
      };
    }

    if (this.data.cantidad_provincias && this.data.cantidad_provincias > 0) {
      return {
        valid: false,
        error: `El departamento tiene ${this.data.cantidad_provincias} provincia(s) asociada(s)`,
      };
    }

    return { valid: true };
  }

  // Verifica si tiene provincias asociadas
  tieneProvincias(): boolean {
    return (this.data.cantidad_provincias ?? 0) > 0;
  }

  // Verifica si tiene municipios asociados (transitivamente)
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

  // Actualiza el nombre del departamento
  actualizarNombre(nuevoNombre: string): void {
    if (!nuevoNombre || nuevoNombre.trim().length < 3) {
      throw new Error("Nombre debe tener al menos 3 caracteres");
    }

    if (nuevoNombre.trim().length > 100) {
      throw new Error("Nombre no puede exceder 100 caracteres");
    }

    this.data.nombre_departamento = nuevoNombre.trim();
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
    provincias: number,
    municipios: number,
    comunidades: number,
    productores: number
  ): void {
    if (
      provincias < 0 ||
      municipios < 0 ||
      comunidades < 0 ||
      productores < 0
    ) {
      throw new Error("Los contadores no pueden ser negativos");
    }

    this.data.cantidad_provincias = provincias;
    this.data.cantidad_municipios = municipios;
    this.data.cantidad_comunidades = comunidades;
    this.data.cantidad_productores = productores;
  }

  // Activa el departamento
  activar(): void {
    this.data.activo = true;
  }

  // Desactiva el departamento
  desactivar(): void {
    const validacion = this.puedeDesactivar();
    if (!validacion.valid) {
      throw new Error(validacion.error);
    }
    this.data.activo = false;
  }

  // Obtiene informacion resumida del departamento
  getResumen(): string {
    const partes = [this.data.nombre_departamento];

    if (this.data.cantidad_provincias) {
      partes.push(`${this.data.cantidad_provincias} provincia(s)`);
    }

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

  // Verifica si es un departamento sin asignaciones
  estaSinAsignaciones(): boolean {
    return (
      !this.tieneProvincias() &&
      !this.tieneMunicipios() &&
      !this.tieneComunidades() &&
      !this.tieneProductores()
    );
  }

  // Compara dos departamentos por nombre (para ordenamiento)
  static compararPorNombre(a: Departamento, b: Departamento): number {
    return a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" });
  }
}
