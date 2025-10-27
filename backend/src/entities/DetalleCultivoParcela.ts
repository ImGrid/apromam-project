// Interfaz para datos de DetalleCultivoParcela desde BD (con JOINs)
export interface DetalleCultivoParcelaData {
  id_detalle: string;
  id_ficha: string;
  id_parcela: string;
  id_tipo_cultivo: string;
  superficie_ha: number;
  situacion_actual?: string | null;
  created_at: Date;

  // Datos enriquecidos desde JOIN con tipos_cultivo
  nombre_cultivo?: string | null;

  // Datos enriquecidos desde JOIN con parcelas
  numero_parcela?: number | null;
  rotacion?: boolean | null;
  utiliza_riego?: boolean | null;
  tipo_barrera?: string | null;
  insumos_organicos?: string | null;
  latitud_sud?: number | null;
  longitud_oeste?: number | null;

  // Datos enriquecidos desde JOIN con manejo_cultivo_mani
  procedencia_semilla?: string | null;
  categoria_semilla?: string | null;
  tratamiento_semillas?: string | null;
  tipo_abonamiento?: string | null;
  tipo_abonamiento_otro?: string | null;
  metodo_aporque?: string | null;
  metodo_aporque_otro?: string | null;
  control_hierbas?: string | null;
  control_hierbas_otro?: string | null;
  metodo_cosecha?: string | null;
  metodo_cosecha_otro?: string | null;
}

// Interfaz para datos publicos (response)
export interface DetalleCultivoParcelaPublicData {
  id_detalle: string;
  id_ficha: string;
  id_parcela: string;
  id_tipo_cultivo: string;
  superficie_ha: number;
  situacion_actual: string | null;
  created_at: string;

  // Datos enriquecidos
  nombre_cultivo?: string | null;
  numero_parcela?: number | null;
  rotacion?: boolean | null;
  utiliza_riego?: boolean | null;
  tipo_barrera?: string | null;
  insumos_organicos?: string | null;
  latitud_sud?: number | null;
  longitud_oeste?: number | null;
  procedencia_semilla?: string | null;
  categoria_semilla?: string | null;
  tratamiento_semillas?: string | null;
  tipo_abonamiento?: string | null;
  tipo_abonamiento_otro?: string | null;
  metodo_aporque?: string | null;
  metodo_aporque_otro?: string | null;
  control_hierbas?: string | null;
  control_hierbas_otro?: string | null;
  metodo_cosecha?: string | null;
  metodo_cosecha_otro?: string | null;
}

// Entity DetalleCultivoParcela
// Representa el detalle de cultivo por parcela en la ficha (Seccion 4)
// Solo contiene campos comunes a todos los cultivos
export class DetalleCultivoParcela {
  private data: DetalleCultivoParcelaData;

  constructor(data: DetalleCultivoParcelaData) {
    this.data = data;
  }

  // Getters
  get id(): string {
    return this.data.id_detalle;
  }

  get idFicha(): string {
    return this.data.id_ficha;
  }

  get idParcela(): string {
    return this.data.id_parcela;
  }

  get idTipoCultivo(): string {
    return this.data.id_tipo_cultivo;
  }

  get superficieHa(): number {
    return this.data.superficie_ha;
  }

  get situacionActual(): string | null {
    return this.data.situacion_actual ?? null;
  }

  get createdAt(): Date {
    return this.data.created_at;
  }

  // Crea una nueva instancia
  static create(data: {
    id_ficha: string;
    id_parcela: string;
    id_tipo_cultivo: string;
    superficie_ha: number;
    situacion_actual?: string;
  }): DetalleCultivoParcela {
    return new DetalleCultivoParcela({
      id_detalle: "",
      id_ficha: data.id_ficha,
      id_parcela: data.id_parcela,
      id_tipo_cultivo: data.id_tipo_cultivo,
      superficie_ha: data.superficie_ha,
      situacion_actual: data.situacion_actual,
      created_at: new Date(),
    });
  }

  // Crea instancia desde datos de BD
  static fromDatabase(data: DetalleCultivoParcelaData): DetalleCultivoParcela {
    return new DetalleCultivoParcela(data);
  }

  // Valida los datos
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.data.id_ficha) {
      errors.push("ID de ficha es requerido");
    }

    if (!this.data.id_parcela) {
      errors.push("ID de parcela es requerido");
    }

    if (!this.data.id_tipo_cultivo) {
      errors.push("ID de tipo cultivo es requerido");
    }

    if (!this.data.superficie_ha || this.data.superficie_ha <= 0) {
      errors.push("Superficie debe ser mayor a 0");
    }

    if (this.data.superficie_ha > 10000) {
      errors.push("Superficie no puede exceder 10,000 hectareas");
    }

    if (
      this.data.situacion_actual &&
      this.data.situacion_actual.length > 100
    ) {
      errors.push("Situacion actual no puede exceder 100 caracteres");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Convierte a formato para insertar en BD
  toDatabaseInsert(): Omit<
    DetalleCultivoParcelaData,
    "id_detalle" | "created_at"
  > {
    return {
      id_ficha: this.data.id_ficha,
      id_parcela: this.data.id_parcela,
      id_tipo_cultivo: this.data.id_tipo_cultivo,
      superficie_ha: this.data.superficie_ha,
      situacion_actual: this.data.situacion_actual?.trim() || null,
    };
  }

  // Convierte a formato para actualizar en BD
  toDatabaseUpdate(): Partial<
    Omit<DetalleCultivoParcelaData, "id_detalle" | "id_ficha" | "created_at">
  > {
    return {
      id_parcela: this.data.id_parcela,
      id_tipo_cultivo: this.data.id_tipo_cultivo,
      superficie_ha: this.data.superficie_ha,
      situacion_actual: this.data.situacion_actual?.trim() || null,
    };
  }

  // Convierte a formato JSON publico
  toJSON(): DetalleCultivoParcelaPublicData {
    return {
      id_detalle: this.data.id_detalle,
      id_ficha: this.data.id_ficha,
      id_parcela: this.data.id_parcela,
      id_tipo_cultivo: this.data.id_tipo_cultivo,
      superficie_ha: this.data.superficie_ha,
      situacion_actual: this.data.situacion_actual ?? null,
      created_at: this.data.created_at.toISOString(),

      // Datos enriquecidos desde JOINs
      nombre_cultivo: this.data.nombre_cultivo ?? null,
      numero_parcela: this.data.numero_parcela ?? null,
      rotacion: this.data.rotacion ?? null,
      utiliza_riego: this.data.utiliza_riego ?? null,
      tipo_barrera: this.data.tipo_barrera ?? null,
      insumos_organicos: this.data.insumos_organicos ?? null,
      latitud_sud: this.data.latitud_sud ?? null,
      longitud_oeste: this.data.longitud_oeste ?? null,
      procedencia_semilla: this.data.procedencia_semilla ?? null,
      categoria_semilla: this.data.categoria_semilla ?? null,
      tratamiento_semillas: this.data.tratamiento_semillas ?? null,
      tipo_abonamiento: this.data.tipo_abonamiento ?? null,
      tipo_abonamiento_otro: this.data.tipo_abonamiento_otro ?? null,
      metodo_aporque: this.data.metodo_aporque ?? null,
      metodo_aporque_otro: this.data.metodo_aporque_otro ?? null,
      control_hierbas: this.data.control_hierbas ?? null,
      control_hierbas_otro: this.data.control_hierbas_otro ?? null,
      metodo_cosecha: this.data.metodo_cosecha ?? null,
      metodo_cosecha_otro: this.data.metodo_cosecha_otro ?? null,
    };
  }

  // Actualiza situacion actual
  actualizarSituacionActual(situacion: string): void {
    if (situacion.length > 100) {
      throw new Error("Situacion actual no puede exceder 100 caracteres");
    }

    this.data.situacion_actual = situacion.trim();
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

  // Obtiene la superficie en formato legible
  getSuperficieFormateada(): string {
    return `${this.data.superficie_ha.toFixed(4)} ha`;
  }
}
