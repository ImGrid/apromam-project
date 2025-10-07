// Tipo para estado de cumplimiento
export type ComplianceStatus = "cumple" | "parcial" | "no_cumple" | "no_aplica";

// Interfaz para datos de EvaluacionMitigacion desde BD
export interface EvaluacionMitigacionData {
  id_evaluacion: string;
  id_ficha: string;
  practica_mitigacion_riesgos: ComplianceStatus;
  mitigacion_contaminacion: ComplianceStatus;
  deposito_herramientas: ComplianceStatus;
  deposito_insumos_organicos: ComplianceStatus;
  evita_quema_residuos: ComplianceStatus;
  comentarios_mitigacion?: string | null;
  practicas_implementadas?: string | null;
}

// Interfaz para datos publicos (response)
export interface EvaluacionMitigacionPublicData {
  id_evaluacion: string;
  id_ficha: string;
  practica_mitigacion_riesgos: ComplianceStatus;
  mitigacion_contaminacion: ComplianceStatus;
  deposito_herramientas: ComplianceStatus;
  deposito_insumos_organicos: ComplianceStatus;
  evita_quema_residuos: ComplianceStatus;
  comentarios_mitigacion?: string | null;
  practicas_implementadas?: string | null;
}

// Entity EvaluacionMitigacion
// Representa la evaluacion de practicas de mitigacion de riesgos (Seccion 5)
export class EvaluacionMitigacion {
  private data: EvaluacionMitigacionData;

  constructor(data: EvaluacionMitigacionData) {
    this.data = data;
  }

  // Getters
  get id(): string {
    return this.data.id_evaluacion;
  }

  get idFicha(): string {
    return this.data.id_ficha;
  }

  get practicaMitigacionRiesgos(): ComplianceStatus {
    return this.data.practica_mitigacion_riesgos;
  }

  get mitigacionContaminacion(): ComplianceStatus {
    return this.data.mitigacion_contaminacion;
  }

  get depositoHerramientas(): ComplianceStatus {
    return this.data.deposito_herramientas;
  }

  get depositoInsumosOrganicos(): ComplianceStatus {
    return this.data.deposito_insumos_organicos;
  }

  get evitaQuemaResiduos(): ComplianceStatus {
    return this.data.evita_quema_residuos;
  }

  get comentarios(): string | null {
    return this.data.comentarios_mitigacion ?? null;
  }

  get practicasImplementadas(): string | null {
    return this.data.practicas_implementadas ?? null;
  }

  // Crea una nueva instancia de EvaluacionMitigacion
  static create(data: {
    id_ficha: string;
    practica_mitigacion_riesgos?: ComplianceStatus;
    mitigacion_contaminacion?: ComplianceStatus;
    deposito_herramientas?: ComplianceStatus;
    deposito_insumos_organicos?: ComplianceStatus;
    evita_quema_residuos?: ComplianceStatus;
    comentarios_mitigacion?: string;
    practicas_implementadas?: string;
  }): EvaluacionMitigacion {
    return new EvaluacionMitigacion({
      id_evaluacion: "",
      id_ficha: data.id_ficha,
      practica_mitigacion_riesgos:
        data.practica_mitigacion_riesgos ?? "no_cumple",
      mitigacion_contaminacion: data.mitigacion_contaminacion ?? "no_cumple",
      deposito_herramientas: data.deposito_herramientas ?? "no_cumple",
      deposito_insumos_organicos:
        data.deposito_insumos_organicos ?? "no_cumple",
      evita_quema_residuos: data.evita_quema_residuos ?? "no_cumple",
      comentarios_mitigacion: data.comentarios_mitigacion,
      practicas_implementadas: data.practicas_implementadas,
    });
  }

  // Crea instancia desde datos de BD
  static fromDatabase(data: EvaluacionMitigacionData): EvaluacionMitigacion {
    return new EvaluacionMitigacion(data);
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
      {
        campo: "practica_mitigacion_riesgos",
        valor: this.data.practica_mitigacion_riesgos,
      },
      {
        campo: "mitigacion_contaminacion",
        valor: this.data.mitigacion_contaminacion,
      },
      {
        campo: "deposito_herramientas",
        valor: this.data.deposito_herramientas,
      },
      {
        campo: "deposito_insumos_organicos",
        valor: this.data.deposito_insumos_organicos,
      },
      { campo: "evita_quema_residuos", valor: this.data.evita_quema_residuos },
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
      this.data.comentarios_mitigacion &&
      this.data.comentarios_mitigacion.length > 1000
    ) {
      errors.push("Comentarios no pueden exceder 1000 caracteres");
    }

    if (
      this.data.practicas_implementadas &&
      this.data.practicas_implementadas.length > 1000
    ) {
      errors.push("Practicas implementadas no pueden exceder 1000 caracteres");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Convierte a formato para insertar en BD
  toDatabaseInsert(): Omit<EvaluacionMitigacionData, "id_evaluacion"> {
    return {
      id_ficha: this.data.id_ficha,
      practica_mitigacion_riesgos: this.data.practica_mitigacion_riesgos,
      mitigacion_contaminacion: this.data.mitigacion_contaminacion,
      deposito_herramientas: this.data.deposito_herramientas,
      deposito_insumos_organicos: this.data.deposito_insumos_organicos,
      evita_quema_residuos: this.data.evita_quema_residuos,
      comentarios_mitigacion: this.data.comentarios_mitigacion?.trim() || null,
      practicas_implementadas:
        this.data.practicas_implementadas?.trim() || null,
    };
  }

  // Convierte a formato para actualizar en BD
  toDatabaseUpdate(): Partial<
    Omit<EvaluacionMitigacionData, "id_evaluacion" | "id_ficha">
  > {
    return {
      practica_mitigacion_riesgos: this.data.practica_mitigacion_riesgos,
      mitigacion_contaminacion: this.data.mitigacion_contaminacion,
      deposito_herramientas: this.data.deposito_herramientas,
      deposito_insumos_organicos: this.data.deposito_insumos_organicos,
      evita_quema_residuos: this.data.evita_quema_residuos,
      comentarios_mitigacion: this.data.comentarios_mitigacion?.trim() || null,
      practicas_implementadas:
        this.data.practicas_implementadas?.trim() || null,
    };
  }

  // Convierte a formato JSON publico
  toJSON(): EvaluacionMitigacionPublicData {
    return {
      id_evaluacion: this.data.id_evaluacion,
      id_ficha: this.data.id_ficha,
      practica_mitigacion_riesgos: this.data.practica_mitigacion_riesgos,
      mitigacion_contaminacion: this.data.mitigacion_contaminacion,
      deposito_herramientas: this.data.deposito_herramientas,
      deposito_insumos_organicos: this.data.deposito_insumos_organicos,
      evita_quema_residuos: this.data.evita_quema_residuos,
      comentarios_mitigacion: this.data.comentarios_mitigacion ?? null,
      practicas_implementadas: this.data.practicas_implementadas ?? null,
    };
  }

  // Cuenta cuantas practicas de mitigacion cumplen
  contarCumplimiento(): {
    cumple: number;
    parcial: number;
    no_cumple: number;
    no_aplica: number;
    total: number;
  } {
    const practicas = [
      this.data.practica_mitigacion_riesgos,
      this.data.mitigacion_contaminacion,
      this.data.deposito_herramientas,
      this.data.deposito_insumos_organicos,
      this.data.evita_quema_residuos,
    ];

    return {
      cumple: practicas.filter((p) => p === "cumple").length,
      parcial: practicas.filter((p) => p === "parcial").length,
      no_cumple: practicas.filter((p) => p === "no_cumple").length,
      no_aplica: practicas.filter((p) => p === "no_aplica").length,
      total: practicas.length,
    };
  }

  // Verifica si las practicas de mitigacion son adecuadas
  mitigacionAdecuada(): boolean {
    const conteo = this.contarCumplimiento();
    // Consideramos adecuada si al menos 4 de 5 cumplen o son parciales
    return conteo.cumple + conteo.parcial >= 4;
  }

  // Actualiza el estado de una practica
  actualizarPractica(
    practica: keyof Omit<
      EvaluacionMitigacionData,
      | "id_evaluacion"
      | "id_ficha"
      | "comentarios_mitigacion"
      | "practicas_implementadas"
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

    this.data.comentarios_mitigacion = comentarios.trim();
  }

  // Actualiza practicas implementadas
  actualizarPracticasImplementadas(practicas: string): void {
    if (practicas.length > 1000) {
      throw new Error(
        "Practicas implementadas no pueden exceder 1000 caracteres"
      );
    }

    this.data.practicas_implementadas = practicas.trim();
  }
}
