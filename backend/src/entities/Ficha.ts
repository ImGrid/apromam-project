// Tipos para Ficha
export type CategoriaProductor = "E" | "2T" | "1T" | "0T";
export type OrigenCaptura = "online" | "offline";
export type EstadoSync = "pendiente" | "sincronizado" | "conflicto";
export type EstadoFicha = "borrador" | "revision" | "aprobado" | "rechazado";
export type ResultadoCertificacion = "aprobado" | "rechazado" | "pendiente";

// Interfaz para datos de Ficha desde BD
export interface FichaData {
  id_ficha: string;
  codigo_productor: string;
  gestion: number;
  fecha_inspeccion: Date;
  inspector_interno: string;
  persona_entrevistada?: string | null;
  categoria_gestion_anterior?: CategoriaProductor | null;

  // Control PWA
  origen_captura: OrigenCaptura;
  fecha_sincronizacion?: Date | null;
  estado_sync: EstadoSync;

  // Workflow
  estado_ficha: EstadoFicha;
  resultado_certificacion: ResultadoCertificacion;

  // Contenido
  recomendaciones?: string | null;
  comentarios_evaluacion?: string | null;
  firma_productor?: string | null;
  firma_inspector?: string | null;

  // Auditoria
  created_by: string;
  created_at: Date;
  updated_at: Date;

  // Datos enriquecidos (JOINs)
  nombre_productor?: string;
  nombre_comunidad?: string;
}

// Interfaz para datos publicos (response)
export interface FichaPublicData {
  id_ficha: string;
  codigo_productor: string;
  nombre_productor?: string;
  nombre_comunidad?: string;
  gestion: number;
  fecha_inspeccion: string;
  inspector_interno: string;
  persona_entrevistada?: string;
  categoria_gestion_anterior?: CategoriaProductor;
  origen_captura: OrigenCaptura;
  fecha_sincronizacion?: string;
  estado_sync: EstadoSync;
  estado_ficha: EstadoFicha;
  resultado_certificacion: ResultadoCertificacion;
  recomendaciones?: string;
  comentarios_evaluacion?: string;
  firma_productor?: string;
  firma_inspector?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Entity Ficha
// Representa la ficha de inspeccion (tabla principal del sistema)
export class Ficha {
  private data: FichaData;

  constructor(data: FichaData) {
    this.data = data;
  }

  // Getters principales
  get id(): string {
    return this.data.id_ficha;
  }

  get codigoProductor(): string {
    return this.data.codigo_productor;
  }

  get gestion(): number {
    return this.data.gestion;
  }

  get fechaInspeccion(): Date {
    return this.data.fecha_inspeccion;
  }

  get inspectorInterno(): string {
    return this.data.inspector_interno;
  }

  get personaEntrevistada(): string | null {
    return this.data.persona_entrevistada ?? null;
  }

  get categoriaGestionAnterior(): CategoriaProductor | null {
    return this.data.categoria_gestion_anterior ?? null;
  }

  // Getters Control PWA
  get origenCaptura(): OrigenCaptura {
    return this.data.origen_captura;
  }

  get fechaSincronizacion(): Date | null {
    return this.data.fecha_sincronizacion ?? null;
  }

  get estadoSync(): EstadoSync {
    return this.data.estado_sync;
  }

  // Getters Workflow
  get estadoFicha(): EstadoFicha {
    return this.data.estado_ficha;
  }

  get resultadoCertificacion(): ResultadoCertificacion {
    return this.data.resultado_certificacion;
  }

  // Getters Contenido
  get recomendaciones(): string | null {
    return this.data.recomendaciones ?? null;
  }

  get comentariosEvaluacion(): string | null {
    return this.data.comentarios_evaluacion ?? null;
  }

  get firmaProductor(): string | null {
    return this.data.firma_productor ?? null;
  }

  get firmaInspector(): string | null {
    return this.data.firma_inspector ?? null;
  }

  // Getters Auditoria
  get createdBy(): string {
    return this.data.created_by;
  }

  get createdAt(): Date {
    return this.data.created_at;
  }

  get updatedAt(): Date {
    return this.data.updated_at;
  }

  // Getters datos enriquecidos
  get nombreProductor(): string | undefined {
    return this.data.nombre_productor;
  }

  get nombreComunidad(): string | undefined {
    return this.data.nombre_comunidad;
  }

  // Crea una nueva instancia
  static create(data: {
    codigo_productor: string;
    gestion: number;
    fecha_inspeccion: Date;
    inspector_interno: string;
    persona_entrevistada?: string;
    categoria_gestion_anterior?: CategoriaProductor;
    origen_captura?: OrigenCaptura;
    created_by: string;
  }): Ficha {
    return new Ficha({
      id_ficha: "",
      codigo_productor: data.codigo_productor,
      gestion: data.gestion,
      fecha_inspeccion: data.fecha_inspeccion,
      inspector_interno: data.inspector_interno,
      persona_entrevistada: data.persona_entrevistada,
      categoria_gestion_anterior: data.categoria_gestion_anterior,
      origen_captura: data.origen_captura ?? "online",
      estado_sync: "pendiente",
      estado_ficha: "revision",
      resultado_certificacion: "pendiente",
      created_by: data.created_by,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  // Crea instancia desde datos de BD
  static fromDatabase(data: FichaData): Ficha {
    return new Ficha(data);
  }

  // Valida los datos
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (
      !this.data.codigo_productor ||
      this.data.codigo_productor.trim().length < 5
    ) {
      errors.push("Codigo de productor es requerido");
    }

    if (this.data.gestion < 2000 || this.data.gestion > 2050) {
      errors.push("Gestion debe estar entre 2000 y 2050");
    }

    if (!this.data.fecha_inspeccion) {
      errors.push("Fecha de inspeccion es requerida");
    }

    if (
      !this.data.inspector_interno ||
      this.data.inspector_interno.trim().length < 3
    ) {
      errors.push("Inspector interno es requerido");
    }

    if (this.data.inspector_interno.length > 100) {
      errors.push("Inspector interno no puede exceder 100 caracteres");
    }

    if (
      this.data.persona_entrevistada &&
      this.data.persona_entrevistada.length > 100
    ) {
      errors.push("Persona entrevistada no puede exceder 100 caracteres");
    }

    if (this.data.categoria_gestion_anterior) {
      const categoriasValidas: CategoriaProductor[] = ["E", "2T", "1T", "0T"];
      if (!categoriasValidas.includes(this.data.categoria_gestion_anterior)) {
        errors.push("Categoria gestion anterior invalida");
      }
    }

    const origenesValidos: OrigenCaptura[] = ["online", "offline"];
    if (!origenesValidos.includes(this.data.origen_captura)) {
      errors.push("Origen captura invalido");
    }

    const estadosSyncValidos: EstadoSync[] = [
      "pendiente",
      "sincronizado",
      "conflicto",
    ];
    if (!estadosSyncValidos.includes(this.data.estado_sync)) {
      errors.push("Estado sync invalido");
    }

    const estadosFichaValidos: EstadoFicha[] = [
      "borrador",
      "revision",
      "aprobado",
      "rechazado",
    ];
    if (!estadosFichaValidos.includes(this.data.estado_ficha)) {
      errors.push("Estado ficha invalido");
    }

    const resultadosValidos: ResultadoCertificacion[] = [
      "aprobado",
      "rechazado",
      "pendiente",
    ];
    if (!resultadosValidos.includes(this.data.resultado_certificacion)) {
      errors.push("Resultado certificacion invalido");
    }

    if (this.data.recomendaciones && this.data.recomendaciones.length > 2000) {
      errors.push("Recomendaciones no pueden exceder 2000 caracteres");
    }

    if (
      this.data.comentarios_evaluacion &&
      this.data.comentarios_evaluacion.length > 2000
    ) {
      errors.push("Comentarios evaluacion no pueden exceder 2000 caracteres");
    }

    if (this.data.firma_productor && this.data.firma_productor.length > 100) {
      errors.push("Firma productor no puede exceder 100 caracteres");
    }

    if (this.data.firma_inspector && this.data.firma_inspector.length > 100) {
      errors.push("Firma inspector no puede exceder 100 caracteres");
    }

    if (!this.data.created_by) {
      errors.push("Usuario creador es requerido");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Convierte a formato para insertar en BD
  toDatabaseInsert(): Omit<
    FichaData,
    | "id_ficha"
    | "created_at"
    | "updated_at"
    | "nombre_productor"
    | "nombre_comunidad"
  > {
    return {
      codigo_productor: this.data.codigo_productor.trim().toUpperCase(),
      gestion: this.data.gestion,
      fecha_inspeccion: this.data.fecha_inspeccion,
      inspector_interno: this.data.inspector_interno.trim(),
      persona_entrevistada: this.data.persona_entrevistada?.trim() || null,
      categoria_gestion_anterior: this.data.categoria_gestion_anterior,
      origen_captura: this.data.origen_captura,
      fecha_sincronizacion: this.data.fecha_sincronizacion,
      estado_sync: this.data.estado_sync,
      estado_ficha: this.data.estado_ficha,
      resultado_certificacion: this.data.resultado_certificacion,
      recomendaciones: this.data.recomendaciones?.trim() || null,
      comentarios_evaluacion: this.data.comentarios_evaluacion?.trim() || null,
      firma_productor: this.data.firma_productor?.trim() || null,
      firma_inspector: this.data.firma_inspector?.trim() || null,
      created_by: this.data.created_by,
    };
  }

  // Convierte a formato para actualizar en BD
  toDatabaseUpdate(): Partial<
    Omit<
      FichaData,
      | "id_ficha"
      | "codigo_productor"
      | "gestion"
      | "created_by"
      | "created_at"
      | "nombre_productor"
      | "nombre_comunidad"
    >
  > {
    return {
      fecha_inspeccion: this.data.fecha_inspeccion,
      inspector_interno: this.data.inspector_interno.trim(),
      persona_entrevistada: this.data.persona_entrevistada?.trim() || null,
      categoria_gestion_anterior: this.data.categoria_gestion_anterior,
      origen_captura: this.data.origen_captura,
      fecha_sincronizacion: this.data.fecha_sincronizacion,
      estado_sync: this.data.estado_sync,
      estado_ficha: this.data.estado_ficha,
      resultado_certificacion: this.data.resultado_certificacion,
      recomendaciones: this.data.recomendaciones?.trim() || null,
      comentarios_evaluacion: this.data.comentarios_evaluacion?.trim() || null,
      firma_productor: this.data.firma_productor?.trim() || null,
      firma_inspector: this.data.firma_inspector?.trim() || null,
      updated_at: new Date(),
    };
  }

  // Convierte a formato JSON publico
  toJSON(): FichaPublicData {
    return {
      id_ficha: this.data.id_ficha,
      codigo_productor: this.data.codigo_productor,
      nombre_productor: this.data.nombre_productor,
      nombre_comunidad: this.data.nombre_comunidad,
      gestion: this.data.gestion,
      fecha_inspeccion: this.data.fecha_inspeccion.toISOString(),
      inspector_interno: this.data.inspector_interno,
      persona_entrevistada: this.data.persona_entrevistada ?? undefined,
      categoria_gestion_anterior: this.data.categoria_gestion_anterior ?? undefined,
      origen_captura: this.data.origen_captura,
      fecha_sincronizacion:
        this.data.fecha_sincronizacion?.toISOString() ?? undefined,
      estado_sync: this.data.estado_sync,
      estado_ficha: this.data.estado_ficha,
      resultado_certificacion: this.data.resultado_certificacion,
      recomendaciones: this.data.recomendaciones ?? undefined,
      comentarios_evaluacion: this.data.comentarios_evaluacion ?? undefined,
      firma_productor: this.data.firma_productor ?? undefined,
      firma_inspector: this.data.firma_inspector ?? undefined,
      created_by: this.data.created_by,
      created_at: this.data.created_at.toISOString(),
      updated_at: this.data.updated_at.toISOString(),
    };
  }

  // METODOS DE ESTADO Y WORKFLOW

  // Verifica si es borrador
  esBorrador(): boolean {
    return this.data.estado_ficha === "borrador";
  }

  // Verifica si esta en revision
  estaEnRevision(): boolean {
    return this.data.estado_ficha === "revision";
  }

  // Verifica si esta aprobada
  estaAprobada(): boolean {
    return this.data.estado_ficha === "aprobado";
  }

  // Verifica si esta rechazada
  estaRechazada(): boolean {
    return this.data.estado_ficha === "rechazado";
  }

  // Verifica si puede enviarse a revision
  puedeEnviarRevision(): boolean {
    return this.data.estado_ficha === "borrador";
  }

  // Verifica si puede aprobarse
  puedeAprobar(): boolean {
    return this.data.estado_ficha === "revision";
  }

  // Verifica si puede rechazarse
  puedeRechazar(): boolean {
    return this.data.estado_ficha === "revision";
  }

  // Envia a revision
  enviarRevision(recomendaciones: string, firmaInspector: string): void {
    if (!this.puedeEnviarRevision()) {
      throw new Error("Solo se puede enviar a revision una ficha en borrador");
    }

    if (!recomendaciones || recomendaciones.trim().length < 10) {
      throw new Error("Recomendaciones son requeridas (minimo 10 caracteres)");
    }

    if (!firmaInspector || firmaInspector.trim().length < 3) {
      throw new Error("Firma del inspector es requerida");
    }

    this.data.recomendaciones = recomendaciones.trim();
    this.data.firma_inspector = firmaInspector.trim();
    this.data.estado_ficha = "revision";
    this.data.updated_at = new Date();
  }

  // Aprueba la ficha
  aprobar(comentarios?: string): void {
    if (!this.puedeAprobar()) {
      throw new Error("Solo se puede aprobar una ficha en revision");
    }

    if (comentarios) {
      this.data.comentarios_evaluacion = comentarios.trim();
    }

    this.data.estado_ficha = "aprobado";
    this.data.resultado_certificacion = "aprobado";
    this.data.updated_at = new Date();
  }

  // Rechaza la ficha
  rechazar(motivo: string): void {
    if (!this.puedeRechazar()) {
      throw new Error("Solo se puede rechazar una ficha en revision");
    }

    if (!motivo || motivo.trim().length < 10) {
      throw new Error("Motivo de rechazo es requerido (minimo 10 caracteres)");
    }

    this.data.comentarios_evaluacion = motivo.trim();
    this.data.estado_ficha = "rechazado";
    this.data.resultado_certificacion = "rechazado";
    this.data.updated_at = new Date();
  }

  // Devuelve a borrador (para correccion)
  devolverBorrador(): void {
    if (this.data.estado_ficha !== "rechazado") {
      throw new Error("Solo se puede devolver a borrador una ficha rechazada");
    }

    this.data.estado_ficha = "borrador";
    this.data.resultado_certificacion = "pendiente";
    this.data.updated_at = new Date();
  }

  // METODOS DE CONTROL PWA

  // Verifica si fue capturada offline
  esCapturaOffline(): boolean {
    return this.data.origen_captura === "offline";
  }

  // Verifica si esta sincronizada
  estaSincronizada(): boolean {
    return this.data.estado_sync === "sincronizado";
  }

  // Verifica si tiene conflicto
  tieneConflicto(): boolean {
    return this.data.estado_sync === "conflicto";
  }

  // Marca como sincronizada
  marcarSincronizada(): void {
    this.data.estado_sync = "sincronizado";
    this.data.fecha_sincronizacion = new Date();
    this.data.updated_at = new Date();
  }

  // Marca conflicto de sincronizacion
  marcarConflicto(): void {
    this.data.estado_sync = "conflicto";
    this.data.updated_at = new Date();
  }

  // METODOS DE ACTUALIZACION

  // Actualiza inspector
  actualizarInspector(inspector: string): void {
    if (!inspector || inspector.trim().length < 3) {
      throw new Error("Inspector interno es requerido");
    }

    if (inspector.length > 100) {
      throw new Error("Inspector interno no puede exceder 100 caracteres");
    }

    this.data.inspector_interno = inspector.trim();
    this.data.updated_at = new Date();
  }

  // Actualiza persona entrevistada
  actualizarPersonaEntrevistada(persona: string): void {
    if (persona.length > 100) {
      throw new Error("Persona entrevistada no puede exceder 100 caracteres");
    }

    this.data.persona_entrevistada = persona.trim();
    this.data.updated_at = new Date();
  }

  // Actualiza recomendaciones
  actualizarRecomendaciones(recomendaciones: string): void {
    if (recomendaciones.length > 2000) {
      throw new Error("Recomendaciones no pueden exceder 2000 caracteres");
    }

    this.data.recomendaciones = recomendaciones.trim();
    this.data.updated_at = new Date();
  }

  // Actualiza firma productor
  actualizarFirmaProductor(firma: string): void {
    if (firma.length > 100) {
      throw new Error("Firma productor no puede exceder 100 caracteres");
    }

    this.data.firma_productor = firma.trim();
    this.data.updated_at = new Date();
  }
}
