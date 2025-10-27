// Tipo para tipo de mani
export type TipoMani = "ecologico" | "transicion";

// Interfaz para datos de CosechaVentas desde BD
export interface CosechaVentasData {
  id_cosecha: string;
  id_ficha: string;
  tipo_mani: TipoMani;
  superficie_actual_ha: number;
  cosecha_estimada_qq: number;
  numero_parcelas: number;
  destino_consumo_qq: number;
  destino_semilla_qq: number;
  destino_ventas_qq: number;
  observaciones?: string | null;
  created_at: Date;
}

// Interfaz para datos publicos (response)
export interface CosechaVentasPublicData {
  id_cosecha: string;
  id_ficha: string;
  tipo_mani: TipoMani;
  superficie_actual_ha: number;
  cosecha_estimada_qq: number;
  numero_parcelas: number;
  destino_consumo_qq: number;
  destino_semilla_qq: number;
  destino_ventas_qq: number;
  observaciones?: string | null;
  created_at: string;
}

// Entity CosechaVentas
// Representa la cosecha y destino de ventas por tipo cultivo (Seccion 8)
export class CosechaVentas {
  private data: CosechaVentasData;

  constructor(data: CosechaVentasData) {
    this.data = data;
  }

  // Getters
  get id(): string {
    return this.data.id_cosecha;
  }

  get idFicha(): string {
    return this.data.id_ficha;
  }

  get tipoMani(): TipoMani {
    return this.data.tipo_mani;
  }

  get superficieActualHa(): number {
    return this.data.superficie_actual_ha;
  }

  get cosechaEstimadaQQ(): number {
    return this.data.cosecha_estimada_qq;
  }

  get numeroParcelas(): number {
    return this.data.numero_parcelas;
  }

  get destinoConsumoQQ(): number {
    return this.data.destino_consumo_qq;
  }

  get destinoSemillaQQ(): number {
    return this.data.destino_semilla_qq;
  }

  get destinoVentasQQ(): number {
    return this.data.destino_ventas_qq;
  }

  get observaciones(): string | null {
    return this.data.observaciones ?? null;
  }

  get createdAt(): Date {
    return this.data.created_at;
  }

  // Crea una nueva instancia
  static create(data: {
    id_ficha: string;
    tipo_mani: TipoMani;
    superficie_actual_ha?: number;
    cosecha_estimada_qq?: number;
    numero_parcelas?: number;
    destino_consumo_qq?: number;
    destino_semilla_qq?: number;
    destino_ventas_qq?: number;
    observaciones?: string;
  }): CosechaVentas {
    return new CosechaVentas({
      id_cosecha: "",
      id_ficha: data.id_ficha,
      tipo_mani: data.tipo_mani,
      superficie_actual_ha: data.superficie_actual_ha ?? 0,
      cosecha_estimada_qq: data.cosecha_estimada_qq ?? 0,
      numero_parcelas: data.numero_parcelas ?? 0,
      destino_consumo_qq: data.destino_consumo_qq ?? 0,
      destino_semilla_qq: data.destino_semilla_qq ?? 0,
      destino_ventas_qq: data.destino_ventas_qq ?? 0,
      observaciones: data.observaciones,
      created_at: new Date(),
    });
  }

  // Crea instancia desde datos de BD
  static fromDatabase(data: CosechaVentasData): CosechaVentas {
    return new CosechaVentas(data);
  }

  // Valida los datos
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.data.id_ficha) {
      errors.push("ID de ficha es requerido");
    }

    if (!this.data.tipo_mani) {
      errors.push("Tipo de mani es requerido");
    }

    const tiposManiValidos: TipoMani[] = ["ecologico", "transicion"];
    if (!tiposManiValidos.includes(this.data.tipo_mani)) {
      errors.push("Tipo de mani debe ser: ecologico o transicion");
    }

    if (this.data.superficie_actual_ha < 0) {
      errors.push("Superficie no puede ser negativa");
    }

    if (this.data.superficie_actual_ha > 10000) {
      errors.push("Superficie no puede exceder 10000 hectareas");
    }

    if (this.data.cosecha_estimada_qq < 0) {
      errors.push("Cosecha estimada no puede ser negativa");
    }

    if (this.data.numero_parcelas < 0) {
      errors.push("Numero de parcelas no puede ser negativo");
    }

    if (this.data.numero_parcelas > 100) {
      errors.push("Numero de parcelas no puede exceder 100");
    }

    if (this.data.destino_consumo_qq < 0) {
      errors.push("Destino consumo no puede ser negativo");
    }

    if (this.data.destino_semilla_qq < 0) {
      errors.push("Destino semilla no puede ser negativo");
    }

    if (this.data.destino_ventas_qq < 0) {
      errors.push("Destino ventas no puede ser negativo");
    }

    if (this.data.observaciones && this.data.observaciones.length > 1000) {
      errors.push("Observaciones no pueden exceder 1000 caracteres");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Convierte a formato para insertar en BD
  toDatabaseInsert(): Omit<CosechaVentasData, "id_cosecha" | "created_at"> {
    return {
      id_ficha: this.data.id_ficha,
      tipo_mani: this.data.tipo_mani,
      superficie_actual_ha: this.data.superficie_actual_ha,
      cosecha_estimada_qq: this.data.cosecha_estimada_qq,
      numero_parcelas: this.data.numero_parcelas,
      destino_consumo_qq: this.data.destino_consumo_qq,
      destino_semilla_qq: this.data.destino_semilla_qq,
      destino_ventas_qq: this.data.destino_ventas_qq,
      observaciones: this.data.observaciones?.trim() || null,
    };
  }

  // Convierte a formato para actualizar en BD
  toDatabaseUpdate(): Partial<
    Omit<CosechaVentasData, "id_cosecha" | "id_ficha" | "created_at">
  > {
    return {
      tipo_mani: this.data.tipo_mani,
      superficie_actual_ha: this.data.superficie_actual_ha,
      cosecha_estimada_qq: this.data.cosecha_estimada_qq,
      numero_parcelas: this.data.numero_parcelas,
      destino_consumo_qq: this.data.destino_consumo_qq,
      destino_semilla_qq: this.data.destino_semilla_qq,
      destino_ventas_qq: this.data.destino_ventas_qq,
      observaciones: this.data.observaciones?.trim() || null,
    };
  }

  // Convierte a formato JSON publico
  toJSON(): CosechaVentasPublicData {
    return {
      id_cosecha: this.data.id_cosecha,
      id_ficha: this.data.id_ficha,
      tipo_mani: this.data.tipo_mani,
      superficie_actual_ha: this.data.superficie_actual_ha,
      cosecha_estimada_qq: this.data.cosecha_estimada_qq,
      numero_parcelas: this.data.numero_parcelas,
      destino_consumo_qq: this.data.destino_consumo_qq,
      destino_semilla_qq: this.data.destino_semilla_qq,
      destino_ventas_qq: this.data.destino_ventas_qq,
      observaciones: this.data.observaciones ?? null,
      created_at: this.data.created_at.toISOString(),
    };
  }

  // Calcula total de destinos en quintales
  getTotalDestinosQQ(): number {
    return (
      this.data.destino_consumo_qq +
      this.data.destino_semilla_qq +
      this.data.destino_ventas_qq
    );
  }

  // Verifica si tiene ventas
  tieneVentas(): boolean {
    return this.data.destino_ventas_qq > 0;
  }

  // Calcula porcentaje destinado a ventas
  getPorcentajeVentas(): number {
    const total = this.getTotalDestinosQQ();
    if (total === 0) return 0;
    return (this.data.destino_ventas_qq / total) * 100;
  }

  // Actualiza superficie
  actualizarSuperficie(superficie: number): void {
    if (superficie < 0) {
      throw new Error("Superficie no puede ser negativa");
    }

    if (superficie > 10000) {
      throw new Error("Superficie no puede exceder 10000 hectareas");
    }

    this.data.superficie_actual_ha = superficie;
  }

  // Actualiza cosecha estimada
  actualizarCosechaEstimada(cosecha: number): void {
    if (cosecha < 0) {
      throw new Error("Cosecha estimada no puede ser negativa");
    }

    this.data.cosecha_estimada_qq = cosecha;
  }

  // Actualiza numero de parcelas
  actualizarNumeroParcelas(numero: number): void {
    if (numero < 0) {
      throw new Error("Numero de parcelas no puede ser negativo");
    }

    if (numero > 100) {
      throw new Error("Numero de parcelas no puede exceder 100");
    }

    this.data.numero_parcelas = numero;
  }

  // Actualiza destinos
  actualizarDestinos(consumo: number, semilla: number, ventas: number): void {
    if (consumo < 0 || semilla < 0 || ventas < 0) {
      throw new Error("Los destinos no pueden ser negativos");
    }

    this.data.destino_consumo_qq = consumo;
    this.data.destino_semilla_qq = semilla;
    this.data.destino_ventas_qq = ventas;
  }

  // Actualiza observaciones
  actualizarObservaciones(observaciones: string): void {
    if (observaciones.length > 1000) {
      throw new Error("Observaciones no pueden exceder 1000 caracteres");
    }

    this.data.observaciones = observaciones.trim();
  }
}
