// Tipo para estado de cumplimiento
export type ComplianceStatus = "cumple" | "parcial" | "no_cumple" | "no_aplica";

// Interfaz para datos de RevisionDocumentacion desde BD
export interface RevisionDocumentacionData {
  id_revision: string;
  id_ficha: string;
  solicitud_ingreso: ComplianceStatus;
  normas_reglamentos: ComplianceStatus;
  contrato_produccion: ComplianceStatus;
  croquis_unidad: ComplianceStatus;
  diario_campo: ComplianceStatus;
  registro_cosecha: ComplianceStatus;
  recibo_pago: ComplianceStatus;
  observaciones_documentacion?: string | null;
}

// Interfaz para datos publicos (response)
export interface RevisionDocumentacionPublicData {
  id_revision: string;
  id_ficha: string;
  solicitud_ingreso: ComplianceStatus;
  normas_reglamentos: ComplianceStatus;
  contrato_produccion: ComplianceStatus;
  croquis_unidad: ComplianceStatus;
  diario_campo: ComplianceStatus;
  registro_cosecha: ComplianceStatus;
  recibo_pago: ComplianceStatus;
  observaciones_documentacion?: string | null;
}

// Entity RevisionDocumentacion
// Representa la evaluacion de documentacion requerida del productor (Seccion 2)
export class RevisionDocumentacion {
  private data: RevisionDocumentacionData;

  constructor(data: RevisionDocumentacionData) {
    this.data = data;
  }

  // Getters
  get id(): string {
    return this.data.id_revision;
  }

  get idFicha(): string {
    return this.data.id_ficha;
  }

  get solicitudIngreso(): ComplianceStatus {
    return this.data.solicitud_ingreso;
  }

  get normasReglamentos(): ComplianceStatus {
    return this.data.normas_reglamentos;
  }

  get contratoProduccion(): ComplianceStatus {
    return this.data.contrato_produccion;
  }

  get croquisUnidad(): ComplianceStatus {
    return this.data.croquis_unidad;
  }

  get diarioCampo(): ComplianceStatus {
    return this.data.diario_campo;
  }

  get registroCosecha(): ComplianceStatus {
    return this.data.registro_cosecha;
  }

  get reciboPago(): ComplianceStatus {
    return this.data.recibo_pago;
  }

  get observaciones(): string | null {
    return this.data.observaciones_documentacion ?? null;
  }

  // Crea una nueva instancia de RevisionDocumentacion
  static create(data: {
    id_ficha: string;
    solicitud_ingreso?: ComplianceStatus;
    normas_reglamentos?: ComplianceStatus;
    contrato_produccion?: ComplianceStatus;
    croquis_unidad?: ComplianceStatus;
    diario_campo?: ComplianceStatus;
    registro_cosecha?: ComplianceStatus;
    recibo_pago?: ComplianceStatus;
    observaciones_documentacion?: string;
  }): RevisionDocumentacion {
    return new RevisionDocumentacion({
      id_revision: "",
      id_ficha: data.id_ficha,
      solicitud_ingreso: data.solicitud_ingreso ?? "no_aplica",
      normas_reglamentos: data.normas_reglamentos ?? "no_aplica",
      contrato_produccion: data.contrato_produccion ?? "no_aplica",
      croquis_unidad: data.croquis_unidad ?? "no_aplica",
      diario_campo: data.diario_campo ?? "no_aplica",
      registro_cosecha: data.registro_cosecha ?? "no_aplica",
      recibo_pago: data.recibo_pago ?? "no_aplica",
      observaciones_documentacion: data.observaciones_documentacion,
    });
  }

  // Crea instancia desde datos de BD
  static fromDatabase(data: RevisionDocumentacionData): RevisionDocumentacion {
    return new RevisionDocumentacion(data);
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
      { campo: "solicitud_ingreso", valor: this.data.solicitud_ingreso },
      { campo: "normas_reglamentos", valor: this.data.normas_reglamentos },
      { campo: "contrato_produccion", valor: this.data.contrato_produccion },
      { campo: "croquis_unidad", valor: this.data.croquis_unidad },
      { campo: "diario_campo", valor: this.data.diario_campo },
      { campo: "registro_cosecha", valor: this.data.registro_cosecha },
      { campo: "recibo_pago", valor: this.data.recibo_pago },
    ];

    for (const { campo, valor } of campos) {
      if (!statusesValidos.includes(valor)) {
        errors.push(
          `${campo} debe ser: cumple, parcial, no_cumple o no_aplica`
        );
      }
    }

    // Validar observaciones si existen
    if (
      this.data.observaciones_documentacion &&
      this.data.observaciones_documentacion.length > 1000
    ) {
      errors.push("Observaciones no pueden exceder 1000 caracteres");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Convierte a formato para insertar en BD
  toDatabaseInsert(): Omit<RevisionDocumentacionData, "id_revision"> {
    return {
      id_ficha: this.data.id_ficha,
      solicitud_ingreso: this.data.solicitud_ingreso,
      normas_reglamentos: this.data.normas_reglamentos,
      contrato_produccion: this.data.contrato_produccion,
      croquis_unidad: this.data.croquis_unidad,
      diario_campo: this.data.diario_campo,
      registro_cosecha: this.data.registro_cosecha,
      recibo_pago: this.data.recibo_pago,
      observaciones_documentacion:
        this.data.observaciones_documentacion?.trim() || null,
    };
  }

  // Convierte a formato para actualizar en BD
  toDatabaseUpdate(): Partial<
    Omit<RevisionDocumentacionData, "id_revision" | "id_ficha">
  > {
    return {
      solicitud_ingreso: this.data.solicitud_ingreso,
      normas_reglamentos: this.data.normas_reglamentos,
      contrato_produccion: this.data.contrato_produccion,
      croquis_unidad: this.data.croquis_unidad,
      diario_campo: this.data.diario_campo,
      registro_cosecha: this.data.registro_cosecha,
      recibo_pago: this.data.recibo_pago,
      observaciones_documentacion:
        this.data.observaciones_documentacion?.trim() || null,
    };
  }

  // Convierte a formato JSON publico
  toJSON(): RevisionDocumentacionPublicData {
    return {
      id_revision: this.data.id_revision,
      id_ficha: this.data.id_ficha,
      solicitud_ingreso: this.data.solicitud_ingreso,
      normas_reglamentos: this.data.normas_reglamentos,
      contrato_produccion: this.data.contrato_produccion,
      croquis_unidad: this.data.croquis_unidad,
      diario_campo: this.data.diario_campo,
      registro_cosecha: this.data.registro_cosecha,
      recibo_pago: this.data.recibo_pago,
      observaciones_documentacion:
        this.data.observaciones_documentacion ?? null,
    };
  }

  // Cuenta cuantos documentos cumplen
  contarCumplimiento(): {
    cumple: number;
    parcial: number;
    no_cumple: number;
    no_aplica: number;
    total: number;
  } {
    const documentos = [
      this.data.solicitud_ingreso,
      this.data.normas_reglamentos,
      this.data.contrato_produccion,
      this.data.croquis_unidad,
      this.data.diario_campo,
      this.data.registro_cosecha,
      this.data.recibo_pago,
    ];

    return {
      cumple: documentos.filter((d) => d === "cumple").length,
      parcial: documentos.filter((d) => d === "parcial").length,
      no_cumple: documentos.filter((d) => d === "no_cumple").length,
      no_aplica: documentos.filter((d) => d === "no_aplica").length,
      total: documentos.length,
    };
  }

  // Verifica si la documentacion esta completa
  documentacionCompleta(): boolean {
    const conteo = this.contarCumplimiento();
    // Consideramos completa si todos cumplen o son parciales
    return conteo.no_cumple === 0 && conteo.cumple + conteo.parcial >= 5;
  }

  // Actualiza el estado de un documento
  actualizarDocumento(
    documento: keyof Omit<
      RevisionDocumentacionData,
      "id_revision" | "id_ficha" | "observaciones_documentacion"
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
      throw new Error("Estado de documento invalido");
    }

    this.data[documento] = estado;
  }

  // Actualiza observaciones
  actualizarObservaciones(observaciones: string): void {
    if (observaciones.length > 1000) {
      throw new Error("Observaciones no pueden exceder 1000 caracteres");
    }

    this.data.observaciones_documentacion = observaciones.trim();
  }
}
