// Tipo para estado de cumplimiento
export type ComplianceStatus = "cumple" | "parcial" | "no_cumple" | "no_aplica";

// Interfaz para datos de EvaluacionConocimientoNormas desde BD
export interface EvaluacionConocimientoNormasData {
  id_evaluacion_conocimiento: string;
  id_ficha: string;
  conoce_normas_organicas: ComplianceStatus;
  recibio_capacitacion: ComplianceStatus;
  comentarios_conocimiento?: string | null;
}

// Interfaz para datos publicos (response)
export interface EvaluacionConocimientoNormasPublicData {
  id_evaluacion_conocimiento: string;
  id_ficha: string;
  conoce_normas_organicas: ComplianceStatus;
  recibio_capacitacion: ComplianceStatus;
  comentarios_conocimiento?: string | null;
}

// Entity EvaluacionConocimientoNormas
// Representa la evaluacion del conocimiento del productor sobre normas organicas (Seccion 10)
export class EvaluacionConocimientoNormas {
  private data: EvaluacionConocimientoNormasData;

  constructor(data: EvaluacionConocimientoNormasData) {
    this.data = data;
  }

  // Getters
  get id(): string {
    return this.data.id_evaluacion_conocimiento;
  }

  get idFicha(): string {
    return this.data.id_ficha;
  }

  get conoceNormasOrganicas(): ComplianceStatus {
    return this.data.conoce_normas_organicas;
  }

  get recibioCapacitacion(): ComplianceStatus {
    return this.data.recibio_capacitacion;
  }

  get comentarios(): string | null {
    return this.data.comentarios_conocimiento ?? null;
  }

  // Crea una nueva instancia
  static create(data: {
    id_ficha: string;
    conoce_normas_organicas?: ComplianceStatus;
    recibio_capacitacion?: ComplianceStatus;
    comentarios_conocimiento?: string;
  }): EvaluacionConocimientoNormas {
    return new EvaluacionConocimientoNormas({
      id_evaluacion_conocimiento: "",
      id_ficha: data.id_ficha,
      conoce_normas_organicas: data.conoce_normas_organicas ?? "no_cumple",
      recibio_capacitacion: data.recibio_capacitacion ?? "no_cumple",
      comentarios_conocimiento: data.comentarios_conocimiento,
    });
  }

  // Crea instancia desde datos de BD
  static fromDatabase(
    data: EvaluacionConocimientoNormasData
  ): EvaluacionConocimientoNormas {
    return new EvaluacionConocimientoNormas(data);
  }

  // Valida los datos
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.data.id_ficha) {
      errors.push("ID de ficha es requerido");
    }

    const statusesValidos: ComplianceStatus[] = [
      "cumple",
      "parcial",
      "no_cumple",
      "no_aplica",
    ];

    if (!statusesValidos.includes(this.data.conoce_normas_organicas)) {
      errors.push("conoce_normas_organicas debe ser un estado valido");
    }

    if (!statusesValidos.includes(this.data.recibio_capacitacion)) {
      errors.push("recibio_capacitacion debe ser un estado valido");
    }

    if (
      this.data.comentarios_conocimiento &&
      this.data.comentarios_conocimiento.length > 1000
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
    EvaluacionConocimientoNormasData,
    "id_evaluacion_conocimiento"
  > {
    return {
      id_ficha: this.data.id_ficha,
      conoce_normas_organicas: this.data.conoce_normas_organicas,
      recibio_capacitacion: this.data.recibio_capacitacion,
      comentarios_conocimiento:
        this.data.comentarios_conocimiento?.trim() || null,
    };
  }

  // Convierte a formato para actualizar en BD
  toDatabaseUpdate(): Partial<
    Omit<
      EvaluacionConocimientoNormasData,
      "id_evaluacion_conocimiento" | "id_ficha"
    >
  > {
    return {
      conoce_normas_organicas: this.data.conoce_normas_organicas,
      recibio_capacitacion: this.data.recibio_capacitacion,
      comentarios_conocimiento:
        this.data.comentarios_conocimiento?.trim() || null,
    };
  }

  // Convierte a formato JSON publico
  toJSON(): EvaluacionConocimientoNormasPublicData {
    return {
      id_evaluacion_conocimiento: this.data.id_evaluacion_conocimiento,
      id_ficha: this.data.id_ficha,
      conoce_normas_organicas: this.data.conoce_normas_organicas,
      recibio_capacitacion: this.data.recibio_capacitacion,
      comentarios_conocimiento: this.data.comentarios_conocimiento ?? null,
    };
  }

  // Verifica si el productor tiene conocimiento adecuado
  tieneConocimientoAdecuado(): boolean {
    return (
      this.data.conoce_normas_organicas === "cumple" &&
      (this.data.recibio_capacitacion === "cumple" ||
        this.data.recibio_capacitacion === "parcial")
    );
  }

  // Actualiza conocimiento de normas
  actualizarConocimientoNormas(estado: ComplianceStatus): void {
    const statusesValidos: ComplianceStatus[] = [
      "cumple",
      "parcial",
      "no_cumple",
      "no_aplica",
    ];

    if (!statusesValidos.includes(estado)) {
      throw new Error("Estado invalido");
    }

    this.data.conoce_normas_organicas = estado;
  }

  // Actualiza capacitacion
  actualizarCapacitacion(estado: ComplianceStatus): void {
    const statusesValidos: ComplianceStatus[] = [
      "cumple",
      "parcial",
      "no_cumple",
      "no_aplica",
    ];

    if (!statusesValidos.includes(estado)) {
      throw new Error("Estado invalido");
    }

    this.data.recibio_capacitacion = estado;
  }

  // Actualiza comentarios
  actualizarComentarios(comentarios: string): void {
    if (comentarios.length > 1000) {
      throw new Error("Comentarios no pueden exceder 1000 caracteres");
    }

    this.data.comentarios_conocimiento = comentarios.trim();
  }
}
