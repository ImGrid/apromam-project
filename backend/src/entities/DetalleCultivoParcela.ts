// Tipos para detalle cultivo parcela
export type ProcedenciaSemilla =
  | "asociacion"
  | "propia"
  | "otro_productor"
  | "no_sembro";
export type CategoriaSemilla = "organica" | "transicion" | "convencional";

// Interfaz para datos de DetalleCultivoParcela desde BD
export interface DetalleCultivoParcelaData {
  id_detalle: string;
  id_ficha: string;
  id_parcela: string;
  id_tipo_cultivo: string;
  procedencia_semilla: ProcedenciaSemilla;
  categoria_semilla: CategoriaSemilla;
  tratamiento_semillas?: string | null;
  tipo_abonamiento?: string | null;
  metodo_aporque?: string | null;
  control_hierbas?: string | null;
  metodo_cosecha?: string | null;
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
  procedencia_semilla: ProcedenciaSemilla;
  categoria_semilla: CategoriaSemilla;
  tratamiento_semillas?: string | null;
  tipo_abonamiento?: string | null;
  metodo_aporque?: string | null;
  control_hierbas?: string | null;
  metodo_cosecha?: string | null;
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

  get procedenciaSemilla(): ProcedenciaSemilla {
    return this.data.procedencia_semilla;
  }

  get categoriaSemilla(): CategoriaSemilla {
    return this.data.categoria_semilla;
  }

  get tratamientoSemillas(): string | null {
    return this.data.tratamiento_semillas ?? null;
  }

  get tipoAbonamiento(): string | null {
    return this.data.tipo_abonamiento ?? null;
  }

  get metodoAporque(): string | null {
    return this.data.metodo_aporque ?? null;
  }

  get controlHierbas(): string | null {
    return this.data.control_hierbas ?? null;
  }

  get metodoCosecha(): string | null {
    return this.data.metodo_cosecha ?? null;
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
    procedencia_semilla?: ProcedenciaSemilla;
    categoria_semilla?: CategoriaSemilla;
    tratamiento_semillas?: string;
    tipo_abonamiento?: string;
    metodo_aporque?: string;
    control_hierbas?: string;
    metodo_cosecha?: string;
    rotacion?: boolean;
    insumos_organicos_usados?: string;
  }): DetalleCultivoParcela {
    return new DetalleCultivoParcela({
      id_detalle: "",
      id_ficha: data.id_ficha,
      id_parcela: data.id_parcela,
      id_tipo_cultivo: data.id_tipo_cultivo,
      procedencia_semilla: data.procedencia_semilla ?? "propia",
      categoria_semilla: data.categoria_semilla ?? "organica",
      tratamiento_semillas: data.tratamiento_semillas,
      tipo_abonamiento: data.tipo_abonamiento,
      metodo_aporque: data.metodo_aporque,
      control_hierbas: data.control_hierbas,
      metodo_cosecha: data.metodo_cosecha,
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
    ];
    if (!categoriasValidas.includes(this.data.categoria_semilla)) {
      errors.push("Categoria de semilla invalida");
    }

    if (
      this.data.tratamiento_semillas &&
      this.data.tratamiento_semillas.length > 100
    ) {
      errors.push("Tratamiento semillas no puede exceder 100 caracteres");
    }

    if (this.data.tipo_abonamiento && this.data.tipo_abonamiento.length > 100) {
      errors.push("Tipo abonamiento no puede exceder 100 caracteres");
    }

    if (this.data.metodo_aporque && this.data.metodo_aporque.length > 100) {
      errors.push("Metodo aporque no puede exceder 100 caracteres");
    }

    if (this.data.control_hierbas && this.data.control_hierbas.length > 100) {
      errors.push("Control hierbas no puede exceder 100 caracteres");
    }

    if (this.data.metodo_cosecha && this.data.metodo_cosecha.length > 100) {
      errors.push("Metodo cosecha no puede exceder 100 caracteres");
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
      procedencia_semilla: this.data.procedencia_semilla,
      categoria_semilla: this.data.categoria_semilla,
      tratamiento_semillas: this.data.tratamiento_semillas?.trim() || null,
      tipo_abonamiento: this.data.tipo_abonamiento?.trim() || null,
      metodo_aporque: this.data.metodo_aporque?.trim() || null,
      control_hierbas: this.data.control_hierbas?.trim() || null,
      metodo_cosecha: this.data.metodo_cosecha?.trim() || null,
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
      procedencia_semilla: this.data.procedencia_semilla,
      categoria_semilla: this.data.categoria_semilla,
      tratamiento_semillas: this.data.tratamiento_semillas?.trim() || null,
      tipo_abonamiento: this.data.tipo_abonamiento?.trim() || null,
      metodo_aporque: this.data.metodo_aporque?.trim() || null,
      control_hierbas: this.data.control_hierbas?.trim() || null,
      metodo_cosecha: this.data.metodo_cosecha?.trim() || null,
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
      procedencia_semilla: this.data.procedencia_semilla,
      categoria_semilla: this.data.categoria_semilla,
      tratamiento_semillas: this.data.tratamiento_semillas ?? null,
      tipo_abonamiento: this.data.tipo_abonamiento ?? null,
      metodo_aporque: this.data.metodo_aporque ?? null,
      control_hierbas: this.data.control_hierbas ?? null,
      metodo_cosecha: this.data.metodo_cosecha ?? null,
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
}
