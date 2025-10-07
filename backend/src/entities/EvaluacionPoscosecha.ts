// Tipo para estado de cumplimiento
export type ComplianceStatus = "cumple" | "parcial" | "no_cumple" | "no_aplica";

// Interfaz para datos de EvaluacionPoscosecha desde BD
export interface EvaluacionPoscosechaData {
  id_evaluacion_poscosecha: string;
  id_ficha: string;
  secado_tendal: ComplianceStatus;
  envases_limpios: ComplianceStatus;
  almacen_protegido: ComplianceStatus;
  evidencia_comercializacion: ComplianceStatus;
  comentarios_poscosecha?: string | null;
}

// Interfaz para datos publicos (response)
export interface EvaluacionPoscosechaPublicData {
  id_evaluacion_poscosecha: string;
  id_ficha: string;
  secado_tendal: ComplianceStatus;
  envases_limpios: ComplianceStatus;
  almacen_protegido: ComplianceStatus;
  evidencia_comercializacion: ComplianceStatus;
  comentarios_poscosecha?: string | null;
}

// Entity EvaluacionPoscosecha
// Representa la evaluacion de practicas de poscosecha (Seccion 9)
export class EvaluacionPoscosecha {
  private data: EvaluacionPoscosechaData;

  constructor(data: EvaluacionPoscosechaData) {
    this.data = data;
  }

  // Getters
  get id(): string {
    return this.data.id_evaluacion_poscosecha;
  }

  get idFicha(): string {
    return this.data.id_ficha;
  }

  get secadoTendal(): ComplianceStatus {
    return this.data.secado_tendal;
  }

  get envasesLimpios(): ComplianceStatus {
    return this.data.envases_limpios;
  }

  get almacenProtegido(): ComplianceStatus {
    return this.data.almacen_protegido;
  }

  get evidenciaComercializacion(): ComplianceStatus {
    return this.data.evidencia_comercializacion;
  }

  get comentarios(): string | null {
    return this.data.comentarios_poscosecha ?? null;
  }

  // Crea una nueva instancia de EvaluacionPoscosecha
  static create(data: {
    id_ficha: string;
    secado_tendal?: ComplianceStatus;
    envases_limpios?: ComplianceStatus;
    almacen_protegido?: ComplianceStatus;
    evidencia_comercializacion?: ComplianceStatus;
    comentarios_poscosecha?: string;
  }): EvaluacionPoscosecha {
    return new EvaluacionPoscosecha({
      id_evaluacion_poscosecha: "",
      id_ficha: data.id_ficha,
      secado_tendal: data.secado_tendal ?? "no_cumple",
      envases_limpios: data.envases_limpios ?? "no_cumple",
      almacen_protegido: data.almacen_protegido ?? "no_cumple",
      evidencia_comercializacion:
        data.evidencia_comercializacion ?? "no_cumple",
      comentarios_poscosecha: data.comentarios_poscosecha,
    });
  }

  // Crea instancia desde datos de BD
  static fromDatabase(data: EvaluacionPoscosechaData): EvaluacionPoscosecha {
    return new EvaluacionPoscosecha(data);
  }

  // Valida los datos
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.data.id_ficha) {
      errors.push("ID de ficha es requerido");
    }

    // Validar que todos los campos de compliance son valores validos
    const statusesValidos: ComplianceStatus[] = [
      "cumple",
      "parcial",
      "no_cumple",
      "no_aplica",
    ];

    const campos = [
      { campo: "secado_tendal", valor: this.data.secado_tendal },
      { campo: "envases_limpios", valor: this.data.envases_limpios },
      { campo: "almacen_protegido", valor: this.data.almacen_protegido },
      {
        campo: "evidencia_comercializacion",
        valor: this.data.evidencia_comercializacion,
      },
    ];

    for (const { campo, valor } of campos) {
      if (!statusesValidos.includes(valor)) {
        errors.push(
          `${campo} debe ser: cumple, parcial, no_cumple o no_aplica`
        );
      }
    }

    // Validar comentarios si existen
    if (
      this.data.comentarios_poscosecha &&
      this.data.comentarios_poscosecha.length > 1000
    ) {
      errors.push("Comentarios no pueden exceder 1000 caracteres");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Convierte a formato para insertar en BD
  toDatabaseInsert(): Omit<
    EvaluacionPoscosechaData,
    "id_evaluacion_poscosecha"
  > {
    return {
      id_ficha: this.data.id_ficha,
      secado_tendal: this.data.secado_tendal,
      envases_limpios: this.data.envases_limpios,
      almacen_protegido: this.data.almacen_protegido,
      evidencia_comercializacion: this.data.evidencia_comercializacion,
      comentarios_poscosecha: this.data.comentarios_poscosecha?.trim() || null,
    };
  }

  // Convierte a formato para actualizar en BD
  toDatabaseUpdate(): Partial<
    Omit<EvaluacionPoscosechaData, "id_evaluacion_poscosecha" | "id_ficha">
  > {
    return {
      secado_tendal: this.data.secado_tendal,
      envases_limpios: this.data.envases_limpios,
      almacen_protegido: this.data.almacen_protegido,
      evidencia_comercializacion: this.data.evidencia_comercializacion,
      comentarios_poscosecha: this.data.comentarios_poscosecha?.trim() || null,
    };
  }

  // Convierte a formato JSON publico
  toJSON(): EvaluacionPoscosechaPublicData {
    return {
      id_evaluacion_poscosecha: this.data.id_evaluacion_poscosecha,
      id_ficha: this.data.id_ficha,
      secado_tendal: this.data.secado_tendal,
      envases_limpios: this.data.envases_limpios,
      almacen_protegido: this.data.almacen_protegido,
      evidencia_comercializacion: this.data.evidencia_comercializacion,
      comentarios_poscosecha: this.data.comentarios_poscosecha ?? null,
    };
  }

  // Cuenta cuantas practicas de poscosecha cumplen
  contarCumplimiento(): {
    cumple: number;
    parcial: number;
    no_cumple: number;
    no_aplica: number;
    total: number;
  } {
    const practicas = [
      this.data.secado_tendal,
      this.data.envases_limpios,
      this.data.almacen_protegido,
      this.data.evidencia_comercializacion,
    ];

    return {
      cumple: practicas.filter((p) => p === "cumple").length,
      parcial: practicas.filter((p) => p === "parcial").length,
      no_cumple: practicas.filter((p) => p === "no_cumple").length,
      no_aplica: practicas.filter((p) => p === "no_aplica").length,
      total: practicas.length,
    };
  }

  // Verifica si las practicas de poscosecha son adecuadas
  poscosechaAdecuada(): boolean {
    const conteo = this.contarCumplimiento();
    // Consideramos adecuada si al menos 3 de 4 cumplen
    return conteo.cumple >= 3 || conteo.cumple + conteo.parcial >= 4;
  }

  // Actualiza el estado de una practica
  actualizarPractica(
    practica: keyof Omit<
      EvaluacionPoscosechaData,
      "id_evaluacion_poscosecha" | "id_ficha" | "comentarios_poscosecha"
    >,
    estado: ComplianceStatus
  ): void {
    const statusesValidos: ComplianceStatus[] = [
      "cumple",
      "parcial",
      "no_cumple",
      "no_aplica",
    ];

    if (!statusesValidos.includes(estado)) {
      throw new Error("Estado de practica invalido");
    }

    this.data[practica] = estado;
  }

  // Actualiza comentarios
  actualizarComentarios(comentarios: string): void {
    if (comentarios.length > 1000) {
      throw new Error("Comentarios no pueden exceder 1000 caracteres");
    }

    this.data.comentarios_poscosecha = comentarios.trim();
  }
}
