// Entity para Planificación de Siembras (Step 12)
// Representa la proyección de cultivos futuros planificados por parcela
// Los datos son capturados en la ficha ACTUAL para proyectar el próximo año

// Interface para datos de PlanificacionSiembra desde BD
export interface PlanificacionSiembraData {
  id_planificacion: string;
  id_ficha: string;
  id_parcela: string;

  // Superficie planificada (puede diferir de la actual)
  area_parcela_planificada_ha: number;

  // Superficies por cultivo (columnas fijas)
  mani_ha: number;
  maiz_ha: number;
  papa_ha: number;
  aji_ha: number;
  leguminosas_ha: number;
  otros_cultivos_ha: number;
  otros_cultivos_detalle?: string;
  descanso_ha: number;

  created_at: Date;
  updated_at: Date;

  // Datos enriquecidos por JOINs (opcional)
  numero_parcela?: number;
  superficie_actual_ha?: number;
}

// Interface para datos públicos de PlanificacionSiembra (response)
export interface PlanificacionSiembraPublicData {
  id_planificacion: string;
  id_ficha: string;
  id_parcela: string;
  area_parcela_planificada_ha: number;
  mani_ha: number;
  maiz_ha: number;
  papa_ha: number;
  aji_ha: number;
  leguminosas_ha: number;
  otros_cultivos_ha: number;
  otros_cultivos_detalle?: string;
  descanso_ha: number;
  created_at: string;
  updated_at: string;
  // Datos enriquecidos
  numero_parcela?: number;
  superficie_actual_ha?: number;
}

// Entidad PlanificacionSiembra
// Representa la planificación de cultivos futuros para una parcela
export class PlanificacionSiembra {
  private data: PlanificacionSiembraData;

  constructor(data: PlanificacionSiembraData) {
    this.data = data;
  }

  // Getters principales
  get id(): string {
    return this.data.id_planificacion;
  }

  get idFicha(): string {
    return this.data.id_ficha;
  }

  get idParcela(): string {
    return this.data.id_parcela;
  }

  get areaParcelaPlanificadaHa(): number {
    return this.data.area_parcela_planificada_ha;
  }

  get maniHa(): number {
    return this.data.mani_ha;
  }

  get maizHa(): number {
    return this.data.maiz_ha;
  }

  get papaHa(): number {
    return this.data.papa_ha;
  }

  get ajiHa(): number {
    return this.data.aji_ha;
  }

  get leguminosasHa(): number {
    return this.data.leguminosas_ha;
  }

  get otrosCultivosHa(): number {
    return this.data.otros_cultivos_ha;
  }

  get otrosCultivosDetalle(): string | undefined {
    return this.data.otros_cultivos_detalle;
  }

  get descansoHa(): number {
    return this.data.descanso_ha;
  }

  get createdAt(): Date {
    return this.data.created_at;
  }

  get updatedAt(): Date {
    return this.data.updated_at;
  }

  get numeroParcela(): number | undefined {
    return this.data.numero_parcela;
  }

  get superficieActualHa(): number | undefined {
    return this.data.superficie_actual_ha;
  }

  // Crea una nueva instancia de PlanificacionSiembra
  static create(data: {
    id_ficha: string;
    id_parcela: string;
    area_parcela_planificada_ha: number;
    mani_ha?: number;
    maiz_ha?: number;
    papa_ha?: number;
    aji_ha?: number;
    leguminosas_ha?: number;
    otros_cultivos_ha?: number;
    otros_cultivos_detalle?: string;
    descanso_ha?: number;
  }): PlanificacionSiembra {
    return new PlanificacionSiembra({
      id_planificacion: "",
      id_ficha: data.id_ficha,
      id_parcela: data.id_parcela,
      area_parcela_planificada_ha: data.area_parcela_planificada_ha,
      mani_ha: data.mani_ha || 0,
      maiz_ha: data.maiz_ha || 0,
      papa_ha: data.papa_ha || 0,
      aji_ha: data.aji_ha || 0,
      leguminosas_ha: data.leguminosas_ha || 0,
      otros_cultivos_ha: data.otros_cultivos_ha || 0,
      otros_cultivos_detalle: data.otros_cultivos_detalle,
      descanso_ha: data.descanso_ha || 0,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  // Crea instancia desde datos de BD
  static fromDatabase(data: PlanificacionSiembraData): PlanificacionSiembra {
    return new PlanificacionSiembra(data);
  }

  // Calcula la suma total de cultivos planificados
  getSumaCultivos(): number {
    return (
      this.data.mani_ha +
      this.data.maiz_ha +
      this.data.papa_ha +
      this.data.aji_ha +
      this.data.leguminosas_ha +
      this.data.otros_cultivos_ha +
      this.data.descanso_ha
    );
  }

  // Valida los datos de la planificación
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar id_ficha
    if (!this.data.id_ficha || this.data.id_ficha.trim().length === 0) {
      errors.push("ID de ficha es requerido");
    }

    // Validar id_parcela
    if (!this.data.id_parcela || this.data.id_parcela.trim().length === 0) {
      errors.push("ID de parcela es requerido");
    }

    // Validar area planificada
    if (this.data.area_parcela_planificada_ha < 0) {
      errors.push("Área planificada debe ser mayor o igual a 0");
    }

    if (this.data.area_parcela_planificada_ha > 10000) {
      errors.push("Área planificada no puede exceder 10,000 hectáreas");
    }

    // Validar que todas las superficies sean no negativas
    const superficies = [
      { nombre: "Maní", valor: this.data.mani_ha },
      { nombre: "Maíz", valor: this.data.maiz_ha },
      { nombre: "Papa", valor: this.data.papa_ha },
      { nombre: "Ají", valor: this.data.aji_ha },
      { nombre: "Leguminosas", valor: this.data.leguminosas_ha },
      { nombre: "Otros cultivos", valor: this.data.otros_cultivos_ha },
      { nombre: "Descanso", valor: this.data.descanso_ha },
    ];

    for (const sup of superficies) {
      if (sup.valor < 0) {
        errors.push(`Superficie de ${sup.nombre} no puede ser negativa`);
      }
    }

    // Validación NO restrictiva: solo advertencia si suma > área
    const sumaCultivos = this.getSumaCultivos();
    if (sumaCultivos > this.data.area_parcela_planificada_ha * 1.1) {
      // Tolerancia del 10%
      errors.push(
        `Advertencia: Suma de cultivos (${sumaCultivos.toFixed(2)} ha) excede el área planificada (${this.data.area_parcela_planificada_ha.toFixed(2)} ha)`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Convierte a formato para insertar en BD
  toDatabaseInsert(): {
    id_ficha: string;
    id_parcela: string;
    area_parcela_planificada_ha: number;
    mani_ha: number;
    maiz_ha: number;
    papa_ha: number;
    aji_ha: number;
    leguminosas_ha: number;
    otros_cultivos_ha: number;
    otros_cultivos_detalle?: string;
    descanso_ha: number;
  } {
    return {
      id_ficha: this.data.id_ficha,
      id_parcela: this.data.id_parcela,
      area_parcela_planificada_ha: this.data.area_parcela_planificada_ha,
      mani_ha: this.data.mani_ha,
      maiz_ha: this.data.maiz_ha,
      papa_ha: this.data.papa_ha,
      aji_ha: this.data.aji_ha,
      leguminosas_ha: this.data.leguminosas_ha,
      otros_cultivos_ha: this.data.otros_cultivos_ha,
      otros_cultivos_detalle: this.data.otros_cultivos_detalle,
      descanso_ha: this.data.descanso_ha,
    };
  }

  // Convierte a formato para actualizar en BD
  toDatabaseUpdate(): {
    area_parcela_planificada_ha?: number;
    mani_ha?: number;
    maiz_ha?: number;
    papa_ha?: number;
    aji_ha?: number;
    leguminosas_ha?: number;
    otros_cultivos_ha?: number;
    otros_cultivos_detalle?: string;
    descanso_ha?: number;
    updated_at: Date;
  } {
    return {
      area_parcela_planificada_ha: this.data.area_parcela_planificada_ha,
      mani_ha: this.data.mani_ha,
      maiz_ha: this.data.maiz_ha,
      papa_ha: this.data.papa_ha,
      aji_ha: this.data.aji_ha,
      leguminosas_ha: this.data.leguminosas_ha,
      otros_cultivos_ha: this.data.otros_cultivos_ha,
      otros_cultivos_detalle: this.data.otros_cultivos_detalle,
      descanso_ha: this.data.descanso_ha,
      updated_at: new Date(),
    };
  }

  // Convierte a formato JSON público
  toJSON(): PlanificacionSiembraPublicData {
    return {
      id_planificacion: this.data.id_planificacion,
      id_ficha: this.data.id_ficha,
      id_parcela: this.data.id_parcela,
      area_parcela_planificada_ha: this.data.area_parcela_planificada_ha,
      mani_ha: this.data.mani_ha,
      maiz_ha: this.data.maiz_ha,
      papa_ha: this.data.papa_ha,
      aji_ha: this.data.aji_ha,
      leguminosas_ha: this.data.leguminosas_ha,
      otros_cultivos_ha: this.data.otros_cultivos_ha,
      otros_cultivos_detalle: this.data.otros_cultivos_detalle,
      descanso_ha: this.data.descanso_ha,
      created_at: this.data.created_at.toISOString(),
      updated_at: this.data.updated_at.toISOString(),
      numero_parcela: this.data.numero_parcela,
      superficie_actual_ha: this.data.superficie_actual_ha,
    };
  }

  // Obtiene información resumida
  getResumen(): string {
    const parcela = this.data.numero_parcela
      ? `Parcela ${this.data.numero_parcela}`
      : `Parcela (${this.data.id_parcela.substring(0, 8)}...)`;
    return `${parcela}: ${this.data.area_parcela_planificada_ha.toFixed(2)} ha planificadas`;
  }

  // Compara dos planificaciones por número de parcela
  static compararPorParcela(
    a: PlanificacionSiembra,
    b: PlanificacionSiembra
  ): number {
    const numA = a.numeroParcela || 0;
    const numB = b.numeroParcela || 0;
    return numA - numB;
  }
}
