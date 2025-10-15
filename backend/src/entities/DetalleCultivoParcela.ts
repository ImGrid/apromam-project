// Tipos para detalle cultivo parcela
export type ProcedenciaSemilla =
  | "asociacion"
  | "propia"
  | "otro_productor"
  | "no_sembro";
export type CategoriaSemilla =
  | "organica"
  | "transicion"
  | "convencional"
  | "ninguna";
export type TratamientoSemillas =
  | "sin_tratamiento"
  | "agroquimico"
  | "insumos_organicos"
  | "otro";
export type TipoAbonamiento = "rastrojo" | "guano" | "otro";
export type MetodoAporque = "con_yunta" | "manual" | "otro";
export type ControlHierbas = "con_bueyes" | "carpida_manual" | "otro";
export type MetodoCosecha = "con_yunta" | "manual" | "otro";

// Interfaz para datos de DetalleCultivoParcela desde BD
export interface DetalleCultivoParcelaData {
  id_detalle: string;
  id_ficha: string;
  id_parcela: string;
  id_tipo_cultivo: string;
  superficie_ha: number;
  procedencia_semilla: ProcedenciaSemilla;
  categoria_semilla: CategoriaSemilla;
  tratamiento_semillas?: TratamientoSemillas | null;
  tratamiento_semillas_otro?: string | null;
  tipo_abonamiento?: TipoAbonamiento | null;
  tipo_abonamiento_otro?: string | null;
  metodo_aporque?: MetodoAporque | null;
  metodo_aporque_otro?: string | null;
  control_hierbas?: ControlHierbas | null;
  control_hierbas_otro?: string | null;
  metodo_cosecha?: MetodoCosecha | null;
  metodo_cosecha_otro?: string | null;
  rotacion: boolean;
  insumos_organicos_usados?: string | null;
  created_at: Date;
}

// Interfaz para datos publicos (response)
export interface DetalleCultivoParcelaPublicData {
  id_detalle: string;
  id_ficha: string;
  id_parcela: string;
  id_tipo_cultivo: string;
  superficie_ha: number;
  procedencia_semilla: ProcedenciaSemilla;
  categoria_semilla: CategoriaSemilla;
  tratamiento_semillas?: TratamientoSemillas | null;
  tratamiento_semillas_otro?: string | null;
  tipo_abonamiento?: TipoAbonamiento | null;
  tipo_abonamiento_otro?: string | null;
  metodo_aporque?: MetodoAporque | null;
  metodo_aporque_otro?: string | null;
  control_hierbas?: ControlHierbas | null;
  control_hierbas_otro?: string | null;
  metodo_cosecha?: MetodoCosecha | null;
  metodo_cosecha_otro?: string | null;
  rotacion: boolean;
  insumos_organicos_usados?: string | null;
  created_at: string;
}

// Entity DetalleCultivoParcela
// Representa el detalle de cultivo por parcela en la ficha (Seccion 7)
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

  get procedenciaSemilla(): ProcedenciaSemilla {
    return this.data.procedencia_semilla;
  }

  get categoriaSemilla(): CategoriaSemilla {
    return this.data.categoria_semilla;
  }

  get tratamientoSemillas(): TratamientoSemillas | null {
    return this.data.tratamiento_semillas ?? null;
  }

  get tratamientoSemillasOtro(): string | null {
    return this.data.tratamiento_semillas_otro ?? null;
  }

  get tipoAbonamiento(): TipoAbonamiento | null {
    return this.data.tipo_abonamiento ?? null;
  }

  get tipoAbonamientoOtro(): string | null {
    return this.data.tipo_abonamiento_otro ?? null;
  }

  get metodoAporque(): MetodoAporque | null {
    return this.data.metodo_aporque ?? null;
  }

  get metodoAporqueOtro(): string | null {
    return this.data.metodo_aporque_otro ?? null;
  }

  get controlHierbas(): ControlHierbas | null {
    return this.data.control_hierbas ?? null;
  }

  get controlHierbasOtro(): string | null {
    return this.data.control_hierbas_otro ?? null;
  }

  get metodoCosecha(): MetodoCosecha | null {
    return this.data.metodo_cosecha ?? null;
  }

  get metodoCosechaOtro(): string | null {
    return this.data.metodo_cosecha_otro ?? null;
  }

  get rotacion(): boolean {
    return this.data.rotacion;
  }

  get insumosOrganicos(): string | null {
    return this.data.insumos_organicos_usados ?? null;
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
    procedencia_semilla?: ProcedenciaSemilla;
    categoria_semilla?: CategoriaSemilla;
    tratamiento_semillas?: TratamientoSemillas;
    tratamiento_semillas_otro?: string;
    tipo_abonamiento?: TipoAbonamiento;
    tipo_abonamiento_otro?: string;
    metodo_aporque?: MetodoAporque;
    metodo_aporque_otro?: string;
    control_hierbas?: ControlHierbas;
    control_hierbas_otro?: string;
    metodo_cosecha?: MetodoCosecha;
    metodo_cosecha_otro?: string;
    rotacion?: boolean;
    insumos_organicos_usados?: string;
  }): DetalleCultivoParcela {
    return new DetalleCultivoParcela({
      id_detalle: "",
      id_ficha: data.id_ficha,
      id_parcela: data.id_parcela,
      id_tipo_cultivo: data.id_tipo_cultivo,
      superficie_ha: data.superficie_ha,
      procedencia_semilla: data.procedencia_semilla ?? "propia",
      categoria_semilla: data.categoria_semilla ?? "organica",
      tratamiento_semillas: data.tratamiento_semillas,
      tratamiento_semillas_otro: data.tratamiento_semillas_otro,
      tipo_abonamiento: data.tipo_abonamiento,
      tipo_abonamiento_otro: data.tipo_abonamiento_otro,
      metodo_aporque: data.metodo_aporque,
      metodo_aporque_otro: data.metodo_aporque_otro,
      control_hierbas: data.control_hierbas,
      control_hierbas_otro: data.control_hierbas_otro,
      metodo_cosecha: data.metodo_cosecha,
      metodo_cosecha_otro: data.metodo_cosecha_otro,
      rotacion: data.rotacion ?? false,
      insumos_organicos_usados: data.insumos_organicos_usados,
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

    const procedenciasValidas: ProcedenciaSemilla[] = [
      "asociacion",
      "propia",
      "otro_productor",
      "no_sembro",
    ];
    if (!procedenciasValidas.includes(this.data.procedencia_semilla)) {
      errors.push("Procedencia de semilla invalida");
    }

    const categoriasValidas: CategoriaSemilla[] = [
      "organica",
      "transicion",
      "convencional",
      "ninguna",
    ];
    if (!categoriasValidas.includes(this.data.categoria_semilla)) {
      errors.push("Categoria de semilla invalida");
    }

    // Validar campos _otro: solo si el campo principal es 'otro'
    if (
      this.data.tratamiento_semillas === "otro" &&
      (!this.data.tratamiento_semillas_otro ||
        this.data.tratamiento_semillas_otro.trim().length === 0)
    ) {
      errors.push(
        "Debe especificar el tratamiento cuando selecciona 'otro'"
      );
    }

    if (
      this.data.tratamiento_semillas_otro &&
      this.data.tratamiento_semillas_otro.length > 200
    ) {
      errors.push(
        "Descripcion de tratamiento otro no puede exceder 200 caracteres"
      );
    }

    if (
      this.data.tipo_abonamiento === "otro" &&
      (!this.data.tipo_abonamiento_otro ||
        this.data.tipo_abonamiento_otro.trim().length === 0)
    ) {
      errors.push("Debe especificar el abonamiento cuando selecciona 'otro'");
    }

    if (
      this.data.tipo_abonamiento_otro &&
      this.data.tipo_abonamiento_otro.length > 200
    ) {
      errors.push(
        "Descripcion de abonamiento otro no puede exceder 200 caracteres"
      );
    }

    if (
      this.data.metodo_aporque === "otro" &&
      (!this.data.metodo_aporque_otro ||
        this.data.metodo_aporque_otro.trim().length === 0)
    ) {
      errors.push("Debe especificar el aporque cuando selecciona 'otro'");
    }

    if (
      this.data.metodo_aporque_otro &&
      this.data.metodo_aporque_otro.length > 200
    ) {
      errors.push(
        "Descripcion de aporque otro no puede exceder 200 caracteres"
      );
    }

    if (
      this.data.control_hierbas === "otro" &&
      (!this.data.control_hierbas_otro ||
        this.data.control_hierbas_otro.trim().length === 0)
    ) {
      errors.push(
        "Debe especificar el control de hierbas cuando selecciona 'otro'"
      );
    }

    if (
      this.data.control_hierbas_otro &&
      this.data.control_hierbas_otro.length > 200
    ) {
      errors.push(
        "Descripcion de control de hierbas otro no puede exceder 200 caracteres"
      );
    }

    if (
      this.data.metodo_cosecha === "otro" &&
      (!this.data.metodo_cosecha_otro ||
        this.data.metodo_cosecha_otro.trim().length === 0)
    ) {
      errors.push("Debe especificar la cosecha cuando selecciona 'otro'");
    }

    if (
      this.data.metodo_cosecha_otro &&
      this.data.metodo_cosecha_otro.length > 200
    ) {
      errors.push(
        "Descripcion de cosecha otro no puede exceder 200 caracteres"
      );
    }

    if (
      this.data.insumos_organicos_usados &&
      this.data.insumos_organicos_usados.length > 500
    ) {
      errors.push("Insumos organicos no pueden exceder 500 caracteres");
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
      procedencia_semilla: this.data.procedencia_semilla,
      categoria_semilla: this.data.categoria_semilla,
      tratamiento_semillas: this.data.tratamiento_semillas || null,
      tratamiento_semillas_otro:
        this.data.tratamiento_semillas_otro?.trim() || null,
      tipo_abonamiento: this.data.tipo_abonamiento || null,
      tipo_abonamiento_otro: this.data.tipo_abonamiento_otro?.trim() || null,
      metodo_aporque: this.data.metodo_aporque || null,
      metodo_aporque_otro: this.data.metodo_aporque_otro?.trim() || null,
      control_hierbas: this.data.control_hierbas || null,
      control_hierbas_otro: this.data.control_hierbas_otro?.trim() || null,
      metodo_cosecha: this.data.metodo_cosecha || null,
      metodo_cosecha_otro: this.data.metodo_cosecha_otro?.trim() || null,
      rotacion: this.data.rotacion,
      insumos_organicos_usados:
        this.data.insumos_organicos_usados?.trim() || null,
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
      procedencia_semilla: this.data.procedencia_semilla,
      categoria_semilla: this.data.categoria_semilla,
      tratamiento_semillas: this.data.tratamiento_semillas || null,
      tratamiento_semillas_otro:
        this.data.tratamiento_semillas_otro?.trim() || null,
      tipo_abonamiento: this.data.tipo_abonamiento || null,
      tipo_abonamiento_otro: this.data.tipo_abonamiento_otro?.trim() || null,
      metodo_aporque: this.data.metodo_aporque || null,
      metodo_aporque_otro: this.data.metodo_aporque_otro?.trim() || null,
      control_hierbas: this.data.control_hierbas || null,
      control_hierbas_otro: this.data.control_hierbas_otro?.trim() || null,
      metodo_cosecha: this.data.metodo_cosecha || null,
      metodo_cosecha_otro: this.data.metodo_cosecha_otro?.trim() || null,
      rotacion: this.data.rotacion,
      insumos_organicos_usados:
        this.data.insumos_organicos_usados?.trim() || null,
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
      procedencia_semilla: this.data.procedencia_semilla,
      categoria_semilla: this.data.categoria_semilla,
      tratamiento_semillas: this.data.tratamiento_semillas ?? null,
      tratamiento_semillas_otro: this.data.tratamiento_semillas_otro ?? null,
      tipo_abonamiento: this.data.tipo_abonamiento ?? null,
      tipo_abonamiento_otro: this.data.tipo_abonamiento_otro ?? null,
      metodo_aporque: this.data.metodo_aporque ?? null,
      metodo_aporque_otro: this.data.metodo_aporque_otro ?? null,
      control_hierbas: this.data.control_hierbas ?? null,
      control_hierbas_otro: this.data.control_hierbas_otro ?? null,
      metodo_cosecha: this.data.metodo_cosecha ?? null,
      metodo_cosecha_otro: this.data.metodo_cosecha_otro ?? null,
      rotacion: this.data.rotacion,
      insumos_organicos_usados: this.data.insumos_organicos_usados ?? null,
      created_at: this.data.created_at.toISOString(),
    };
  }

  // Verifica si tiene rotacion
  tieneRotacion(): boolean {
    return this.data.rotacion;
  }

  // Verifica si usa semilla organica
  esSemillaOrganica(): boolean {
    return this.data.categoria_semilla === "organica";
  }

  // Verifica si es semilla propia
  esSemillaPropia(): boolean {
    return this.data.procedencia_semilla === "propia";
  }

  // Actualiza procedencia de semilla
  actualizarProcedenciaSemilla(procedencia: ProcedenciaSemilla): void {
    const procedenciasValidas: ProcedenciaSemilla[] = [
      "asociacion",
      "propia",
      "otro_productor",
      "no_sembro",
    ];

    if (!procedenciasValidas.includes(procedencia)) {
      throw new Error("Procedencia de semilla invalida");
    }

    this.data.procedencia_semilla = procedencia;
  }

  // Actualiza categoria de semilla
  actualizarCategoriaSemilla(categoria: CategoriaSemilla): void {
    const categoriasValidas: CategoriaSemilla[] = [
      "organica",
      "transicion",
      "convencional",
    ];

    if (!categoriasValidas.includes(categoria)) {
      throw new Error("Categoria de semilla invalida");
    }

    this.data.categoria_semilla = categoria;
  }

  // Actualiza rotacion
  actualizarRotacion(rotacion: boolean): void {
    this.data.rotacion = rotacion;
  }

  // Actualiza tratamiento semillas
  actualizarTratamientoSemillas(tratamiento: string): void {
    if (tratamiento.length > 100) {
      throw new Error("Tratamiento semillas no puede exceder 100 caracteres");
    }

    this.data.tratamiento_semillas = tratamiento.trim();
  }

  // Actualiza tipo abonamiento
  actualizarTipoAbonamiento(abonamiento: string): void {
    if (abonamiento.length > 100) {
      throw new Error("Tipo abonamiento no puede exceder 100 caracteres");
    }

    this.data.tipo_abonamiento = abonamiento.trim();
  }

  // Actualiza insumos organicos
  actualizarInsumosOrganicos(insumos: string): void {
    if (insumos.length > 500) {
      throw new Error("Insumos organicos no pueden exceder 500 caracteres");
    }

    this.data.insumos_organicos_usados = insumos.trim();
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
