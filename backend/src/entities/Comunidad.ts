// Interfaz para datos de Comunidad desde BD
export interface ComunidadData {
  id_comunidad: string;
  id_municipio: string;
  nombre_comunidad: string;
  abreviatura_comunidad: string;
  nombre_municipio?: string;
  nombre_provincia?: string;
  cantidad_tecnicos?: number;
  cantidad_productores?: number;
  activo: boolean;
  created_at: Date;
}

// Interfaz para datos publicos de Comunidad (response)
export interface ComunidadPublicData {
  id_comunidad: string;
  id_municipio: string;
  nombre_comunidad: string;
  abreviatura_comunidad: string;
  nombre_municipio?: string;
  nombre_provincia?: string;
  cantidad_tecnicos?: number;
  cantidad_productores?: number;
  activo: boolean;
  created_at: string;
}

// Entidad Comunidad
// Representa una comunidad dentro de un municipio
export class Comunidad {
  private data: ComunidadData;

  constructor(data: ComunidadData) {
    this.data = data;
  }

  // Getters
  get id(): string {
    return this.data.id_comunidad;
  }

  get idMunicipio(): string {
    return this.data.id_municipio;
  }

  get nombre(): string {
    return this.data.nombre_comunidad;
  }

  get abreviatura(): string {
    return this.data.abreviatura_comunidad;
  }

  get nombreMunicipio(): string | undefined {
    return this.data.nombre_municipio;
  }

  get nombreProvincia(): string | undefined {
    return this.data.nombre_provincia;
  }

  get cantidadTecnicos(): number | undefined {
    return this.data.cantidad_tecnicos;
  }

  get cantidadProductores(): number | undefined {
    return this.data.cantidad_productores;
  }

  get activo(): boolean {
    return this.data.activo;
  }

  get createdAt(): Date {
    return this.data.created_at;
  }

  // Crea una nueva instancia de Comunidad
  static create(data: {
    id_municipio: string;
    nombre_comunidad: string;
    abreviatura_comunidad: string;
  }): Comunidad {
    return new Comunidad({
      id_comunidad: "",
      id_municipio: data.id_municipio,
      nombre_comunidad: data.nombre_comunidad,
      abreviatura_comunidad: data.abreviatura_comunidad,
      activo: true,
      created_at: new Date(),
    });
  }

  // Crea instancia desde datos de BD
  static fromDatabase(data: ComunidadData): Comunidad {
    return new Comunidad(data);
  }

  // Valida los datos de la comunidad
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (
      !this.data.nombre_comunidad ||
      this.data.nombre_comunidad.trim().length < 3
    ) {
      errors.push("Nombre de comunidad debe tener al menos 3 caracteres");
    }

    if (!this.data.id_municipio) {
      errors.push("ID de municipio es requerido");
    }

    if (
      !this.data.abreviatura_comunidad ||
      this.data.abreviatura_comunidad.trim().length < 2 ||
      this.data.abreviatura_comunidad.trim().length > 5
    ) {
      errors.push("Abreviatura debe tener entre 2 y 5 caracteres");
    }

    // Validar que abreviatura sea solo letras mayusculas
    if (
      this.data.abreviatura_comunidad &&
      !/^[A-Z]+$/.test(this.data.abreviatura_comunidad.trim())
    ) {
      errors.push(
        "Abreviatura debe contener solo letras mayusculas sin espacios"
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Convierte a formato para insertar en BD
  toDatabaseInsert(): {
    id_municipio: string;
    nombre_comunidad: string;
    abreviatura_comunidad: string;
    activo: boolean;
  } {
    return {
      id_municipio: this.data.id_municipio,
      nombre_comunidad: this.data.nombre_comunidad.trim(),
      abreviatura_comunidad: this.data.abreviatura_comunidad
        .trim()
        .toUpperCase(),
      activo: this.data.activo,
    };
  }

  // Convierte a formato para actualizar en BD
  toDatabaseUpdate(): {
    nombre_comunidad?: string;
    abreviatura_comunidad?: string;
    activo?: boolean;
  } {
    return {
      nombre_comunidad: this.data.nombre_comunidad?.trim(),
      abreviatura_comunidad: this.data.abreviatura_comunidad
        ?.trim()
        .toUpperCase(),
      activo: this.data.activo,
    };
  }

  // Convierte a formato JSON publico (sin datos sensibles)
  toJSON(): ComunidadPublicData {
    return {
      id_comunidad: this.data.id_comunidad,
      id_municipio: this.data.id_municipio,
      nombre_comunidad: this.data.nombre_comunidad,
      abreviatura_comunidad: this.data.abreviatura_comunidad,
      nombre_municipio: this.data.nombre_municipio,
      nombre_provincia: this.data.nombre_provincia,
      cantidad_tecnicos: this.data.cantidad_tecnicos,
      cantidad_productores: this.data.cantidad_productores,
      activo: this.data.activo,
      created_at: this.data.created_at.toISOString(),
    };
  }

  // Verifica si la comunidad puede ser desactivada
  puedeDesactivar(): { valid: boolean; error?: string } {
    if (!this.data.activo) {
      return {
        valid: false,
        error: "La comunidad ya está inactiva",
      };
    }

    if (this.data.cantidad_tecnicos && this.data.cantidad_tecnicos > 0) {
      return {
        valid: false,
        error: `La comunidad tiene ${this.data.cantidad_tecnicos} tecnico(s) asignado(s)`,
      };
    }

    if (this.data.cantidad_productores && this.data.cantidad_productores > 0) {
      return {
        valid: false,
        error: `La comunidad tiene ${this.data.cantidad_productores} productor(es) asignado(s)`,
      };
    }

    return { valid: true };
  }

  // Verifica si tiene tecnicos asignados
  tieneTecnicos(): boolean {
    return (this.data.cantidad_tecnicos ?? 0) > 0;
  }

  // Verifica si tiene productores asignados
  tieneProductores(): boolean {
    return (this.data.cantidad_productores ?? 0) > 0;
  }

  // Actualiza el nombre de la comunidad
  actualizarNombre(nuevoNombre: string): void {
    if (!nuevoNombre || nuevoNombre.trim().length < 3) {
      throw new Error("Nombre debe tener al menos 3 caracteres");
    }
    this.data.nombre_comunidad = nuevoNombre.trim();
  }

  // Actualiza la abreviatura de la comunidad
  actualizarAbreviatura(nuevaAbreviatura: string): void {
    const abrev = nuevaAbreviatura.trim().toUpperCase();

    if (abrev.length < 2 || abrev.length > 5) {
      throw new Error("Abreviatura debe tener entre 2 y 5 caracteres");
    }

    if (!/^[A-Z]+$/.test(abrev)) {
      throw new Error("Abreviatura debe contener solo letras mayusculas");
    }

    this.data.abreviatura_comunidad = abrev;
  }

  // Actualiza la cantidad de tecnicos (usado internamente)
  actualizarCantidadTecnicos(cantidad: number): void {
    if (cantidad < 0) {
      throw new Error("Cantidad de tecnicos no puede ser negativa");
    }
    this.data.cantidad_tecnicos = cantidad;
  }

  // Actualiza la cantidad de productores (usado internamente)
  actualizarCantidadProductores(cantidad: number): void {
    if (cantidad < 0) {
      throw new Error("Cantidad de productores no puede ser negativa");
    }
    this.data.cantidad_productores = cantidad;
  }

  // Activa la comunidad
  activar(): void {
    this.data.activo = true;
  }

  // Desactiva la comunidad
  desactivar(): void {
    const validacion = this.puedeDesactivar();
    if (!validacion.valid) {
      throw new Error(validacion.error);
    }
    this.data.activo = false;
  }

  // Obtiene informacion resumida de la comunidad
  getResumen(): string {
    const partes = [this.data.nombre_comunidad];

    if (this.data.nombre_municipio) {
      partes.push(this.data.nombre_municipio);
    }

    if (this.data.nombre_provincia) {
      partes.push(this.data.nombre_provincia);
    }

    return partes.join(", ");
  }

  // Verifica si es una comunidad sin asignaciones
  estaSinAsignaciones(): boolean {
    return !this.tieneTecnicos() && !this.tieneProductores();
  }
}
