import {
  validateBolivianCoordinates,
  validateGPSPrecision,
  createPointWKT,
  type Coordinates,
} from "../utils/postgis.utils.js";

// Enums para tipos especificos de parcela
export type TipoBarrera = "ninguna" | "viva" | "muerta";

// Interfaz para datos de Parcela desde BD
export interface ParcelaData {
  id_parcela: string;
  codigo_productor: string;
  numero_parcela: number;
  superficie_ha: number;

  // Coordenadas decimales
  latitud_sud?: number;
  longitud_oeste?: number;

  // Caracteristicas agronomicas
  utiliza_riego: boolean;
  situacion_cumple: boolean;
  tipo_barrera: TipoBarrera;

  activo: boolean;
  created_at: Date;

  // Datos enriquecidos por JOINs
  nombre_productor?: string;
  nombre_comunidad?: string;
}

// Interfaz para datos publicos de Parcela (response)
export interface ParcelaPublicData {
  id_parcela: string;
  codigo_productor: string;
  nombre_productor?: string;
  numero_parcela: number;
  superficie_ha: number;
  coordenadas?: Coordinates;
  utiliza_riego: boolean;
  situacion_cumple: boolean;
  tipo_barrera: TipoBarrera;
  activo: boolean;
  created_at: string;
}

// Entidad Parcela
// Representa una parcela de cultivo con coordenadas GPS
export class Parcela {
  private data: ParcelaData;

  constructor(data: ParcelaData) {
    this.data = data;
  }

  // Getters principales
  get id(): string {
    return this.data.id_parcela;
  }

  get codigoProductor(): string {
    return this.data.codigo_productor;
  }

  get numeroParcela(): number {
    return this.data.numero_parcela;
  }

  get superficie(): number {
    return this.data.superficie_ha;
  }

  get latitudSud(): number | undefined {
    return this.data.latitud_sud;
  }

  get longitudOeste(): number | undefined {
    return this.data.longitud_oeste;
  }

  get utilizaRiego(): boolean {
    return this.data.utiliza_riego;
  }

  get situacionCumple(): boolean {
    return this.data.situacion_cumple;
  }

  get tipoBarrera(): TipoBarrera {
    return this.data.tipo_barrera;
  }

  get activo(): boolean {
    return this.data.activo;
  }

  get createdAt(): Date {
    return this.data.created_at;
  }

  get nombreProductor(): string | undefined {
    return this.data.nombre_productor;
  }

  get nombreComunidad(): string | undefined {
    return this.data.nombre_comunidad;
  }

  // Getter coordenadas como objeto
  get coordenadas(): Coordinates | null {
    if (this.data.latitud_sud == null || this.data.longitud_oeste == null) {
      return null;
    }

    return {
      latitude: this.data.latitud_sud,
      longitude: this.data.longitud_oeste,
    };
  }

  // Crea una nueva instancia de Parcela
  static create(data: {
    codigo_productor: string;
    numero_parcela: number;
    superficie_ha: number;
    latitud_sud?: number;
    longitud_oeste?: number;
    utiliza_riego?: boolean;
    situacion_cumple?: boolean;
    tipo_barrera?: TipoBarrera;
  }): Parcela {
    return new Parcela({
      id_parcela: "",
      codigo_productor: data.codigo_productor,
      numero_parcela: data.numero_parcela,
      superficie_ha: data.superficie_ha,
      latitud_sud: data.latitud_sud,
      longitud_oeste: data.longitud_oeste,
      utiliza_riego: data.utiliza_riego || false,
      situacion_cumple: data.situacion_cumple !== false,
      tipo_barrera: data.tipo_barrera || "ninguna",
      activo: true,
      created_at: new Date(),
    });
  }

  // Crea instancia desde datos de BD
  static fromDatabase(data: ParcelaData): Parcela {
    return new Parcela(data);
  }

  // Valida los datos de la parcela
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar codigo productor
    if (
      !this.data.codigo_productor ||
      this.data.codigo_productor.trim().length < 5
    ) {
      errors.push("Codigo de productor es requerido");
    }

    // Validar numero de parcela
    if (this.data.numero_parcela < 1 || this.data.numero_parcela > 100) {
      errors.push("Numero de parcela debe estar entre 1 y 100");
    }

    // Validar superficie
    if (this.data.superficie_ha <= 0) {
      errors.push("Superficie debe ser mayor a 0");
    }

    if (this.data.superficie_ha > 10000) {
      errors.push("Superficie no puede exceder 10,000 hectareas");
    }

    // Validar coordenadas si existen
    if (
      this.data.latitud_sud !== undefined &&
      this.data.longitud_oeste !== undefined
    ) {
      const coordValidation = validateBolivianCoordinates(
        this.data.latitud_sud,
        this.data.longitud_oeste
      );

      if (!coordValidation.valid) {
        errors.push(`Coordenadas invalidas: ${coordValidation.error}`);
      }

      const precisionValidation = validateGPSPrecision(
        this.data.latitud_sud,
        this.data.longitud_oeste
      );

      if (!precisionValidation.valid) {
        errors.push(`Precision GPS insuficiente: ${precisionValidation.error}`);
      }
    }

    // Validar que si tiene una coordenada, tenga la otra
    const hasLat = this.data.latitud_sud !== undefined;
    const hasLng = this.data.longitud_oeste !== undefined;

    if (hasLat !== hasLng) {
      errors.push("Debe proporcionar tanto latitud como longitud, o ninguna");
    }

    // Validar tipo barrera
    const barrerasValidas: TipoBarrera[] = ["ninguna", "viva", "muerta"];
    if (!barrerasValidas.includes(this.data.tipo_barrera)) {
      errors.push("Tipo de barrera invalido");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Convierte a formato para insertar en BD
  toDatabaseInsert(): {
    codigo_productor: string;
    numero_parcela: number;
    superficie_ha: number;
    latitud_sud?: number;
    longitud_oeste?: number;
    utiliza_riego: boolean;
    situacion_cumple: boolean;
    tipo_barrera: TipoBarrera;
    activo: boolean;
  } {
    return {
      codigo_productor: this.data.codigo_productor.trim().toUpperCase(),
      numero_parcela: this.data.numero_parcela,
      superficie_ha: this.data.superficie_ha,
      latitud_sud: this.data.latitud_sud,
      longitud_oeste: this.data.longitud_oeste,
      utiliza_riego: this.data.utiliza_riego,
      situacion_cumple: this.data.situacion_cumple,
      tipo_barrera: this.data.tipo_barrera,
      activo: this.data.activo,
    };
  }

  // Convierte a formato para actualizar en BD
  toDatabaseUpdate(): {
    superficie_ha?: number;
    latitud_sud?: number;
    longitud_oeste?: number;
    utiliza_riego?: boolean;
    situacion_cumple?: boolean;
    tipo_barrera?: TipoBarrera;
    activo?: boolean;
  } {
    return {
      superficie_ha: this.data.superficie_ha,
      latitud_sud: this.data.latitud_sud,
      longitud_oeste: this.data.longitud_oeste,
      utiliza_riego: this.data.utiliza_riego,
      situacion_cumple: this.data.situacion_cumple,
      tipo_barrera: this.data.tipo_barrera,
      activo: this.data.activo,
    };
  }

  // Convierte a formato JSON publico
  toJSON(): ParcelaPublicData {
    return {
      id_parcela: this.data.id_parcela,
      codigo_productor: this.data.codigo_productor,
      nombre_productor: this.data.nombre_productor,
      numero_parcela: this.data.numero_parcela,
      superficie_ha: this.data.superficie_ha,
      coordenadas: this.coordenadas || undefined,
      utiliza_riego: this.data.utiliza_riego,
      situacion_cumple: this.data.situacion_cumple,
      tipo_barrera: this.data.tipo_barrera,
      activo: this.data.activo,
      created_at: this.data.created_at.toISOString(),
    };
  }

  // Genera string WKT para coordenadas PostGIS
  // Usa latitud_sud y longitud_oeste
  getCoordenadasWKT(): string | null {
    if (
      this.data.latitud_sud === undefined ||
      this.data.longitud_oeste === undefined
    ) {
      return null;
    }

    try {
      return createPointWKT(this.data.latitud_sud, this.data.longitud_oeste);
    } catch (error) {
      return null;
    }
  }

  // Verifica si la parcela puede ser desactivada
  puedeDesactivar(): { valid: boolean; error?: string } {
    if (!this.data.activo) {
      return {
        valid: false,
        error: "La parcela ya esta inactiva",
      };
    }

    return { valid: true };
  }

  // Verifica si tiene coordenadas GPS
  tieneCoordenadas(): boolean {
    return (
      this.data.latitud_sud !== undefined &&
      this.data.longitud_oeste !== undefined
    );
  }

  // Actualiza coordenadas GPS
  actualizarCoordenadas(latitud: number, longitud: number): void {
    const validation = validateBolivianCoordinates(latitud, longitud);
    if (!validation.valid) {
      throw new Error(`Coordenadas invalidas: ${validation.error}`);
    }

    const precisionValidation = validateGPSPrecision(latitud, longitud);
    if (!precisionValidation.valid) {
      throw new Error(
        `Precision GPS insuficiente: ${precisionValidation.error}`
      );
    }

    this.data.latitud_sud = latitud;
    this.data.longitud_oeste = longitud;
  }

  // Actualiza superficie
  actualizarSuperficie(nuevaSuperficie: number): void {
    if (nuevaSuperficie <= 0) {
      throw new Error("Superficie debe ser mayor a 0");
    }

    if (nuevaSuperficie > 10000) {
      throw new Error("Superficie no puede exceder 10,000 hectareas");
    }

    this.data.superficie_ha = nuevaSuperficie;
  }

  // Actualiza uso de riego
  actualizarRiego(utilizaRiego: boolean): void {
    this.data.utiliza_riego = utilizaRiego;
  }

  // Actualiza situacion de cumplimiento
  actualizarSituacion(cumple: boolean): void {
    this.data.situacion_cumple = cumple;
  }

  // Actualiza barrera
  actualizarBarrera(tipo: TipoBarrera): void {
    this.data.tipo_barrera = tipo;
  }

  // Activa la parcela
  activar(): void {
    this.data.activo = true;
  }

  // Desactiva la parcela
  desactivar(): void {
    const validacion = this.puedeDesactivar();
    if (!validacion.valid) {
      throw new Error(validacion.error);
    }

    this.data.activo = false;
  }

  // Obtiene informacion resumida
  getResumen(): string {
    return `Parcela ${this.data.numero_parcela} - ${this.data.superficie_ha} ha (${this.data.codigo_productor})`;
  }

  // Compara dos parcelas por numero
  static compararPorNumero(a: Parcela, b: Parcela): number {
    return a.numeroParcela - b.numeroParcela;
  }

  // Compara dos parcelas por superficie
  static compararPorSuperficie(a: Parcela, b: Parcela): number {
    return b.superficie - a.superficie;
  }
}
