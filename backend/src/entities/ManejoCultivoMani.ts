// Tipos compartidos para manejo de cultivo
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
  | "insumos_organicos";

export type TipoAbonamiento = "rastrojo" | "guano" | "otro";
export type MetodoAporque = "con_yunta" | "manual" | "otro";
export type ControlHierbas = "con_bueyes" | "carpida_manual" | "otro";
export type MetodoCosecha = "con_yunta" | "manual" | "otro";

// Interfaz para datos de ManejoCultivoMani desde BD
export interface ManejoCultivoManiData {
  id_manejo: string;
  id_detalle: string;
  procedencia_semilla?: ProcedenciaSemilla | null;
  categoria_semilla?: CategoriaSemilla | null;
  tratamiento_semillas?: TratamientoSemillas | null;
  tipo_abonamiento?: TipoAbonamiento | null;
  tipo_abonamiento_otro?: string | null;
  metodo_aporque?: MetodoAporque | null;
  metodo_aporque_otro?: string | null;
  control_hierbas?: ControlHierbas | null;
  control_hierbas_otro?: string | null;
  metodo_cosecha?: MetodoCosecha | null;
  metodo_cosecha_otro?: string | null;
  created_at: Date;
}

// Interfaz para datos publicos (response)
export interface ManejoCultivoManiPublicData {
  id_manejo: string;
  id_detalle: string;
  procedencia_semilla: ProcedenciaSemilla | null;
  categoria_semilla: CategoriaSemilla | null;
  tratamiento_semillas: TratamientoSemillas | null;
  tipo_abonamiento: TipoAbonamiento | null;
  tipo_abonamiento_otro: string | null;
  metodo_aporque: MetodoAporque | null;
  metodo_aporque_otro: string | null;
  control_hierbas: ControlHierbas | null;
  control_hierbas_otro: string | null;
  metodo_cosecha: MetodoCosecha | null;
  metodo_cosecha_otro: string | null;
  created_at: string;
}

// Entity ManejoCultivoMani
// Representa el manejo del cultivo de mani (Seccion 7)
// Solo se crea para cultivos certificables (tipos_cultivo.es_principal_certificable = true)
export class ManejoCultivoMani {
  private data: ManejoCultivoManiData;

  constructor(data: ManejoCultivoManiData) {
    this.data = data;
  }

  // Getters
  get id(): string {
    return this.data.id_manejo;
  }

  get idDetalle(): string {
    return this.data.id_detalle;
  }

  get procedenciaSemilla(): ProcedenciaSemilla | null {
    return this.data.procedencia_semilla ?? null;
  }

  get categoriaSemilla(): CategoriaSemilla | null {
    return this.data.categoria_semilla ?? null;
  }

  get tratamientoSemillas(): TratamientoSemillas | null {
    return this.data.tratamiento_semillas ?? null;
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

  get createdAt(): Date {
    return this.data.created_at;
  }

  // Crea una nueva instancia
  static create(data: {
    id_detalle: string;
    procedencia_semilla?: ProcedenciaSemilla;
    categoria_semilla?: CategoriaSemilla;
    tratamiento_semillas?: TratamientoSemillas;
    tipo_abonamiento?: TipoAbonamiento;
    tipo_abonamiento_otro?: string;
    metodo_aporque?: MetodoAporque;
    metodo_aporque_otro?: string;
    control_hierbas?: ControlHierbas;
    control_hierbas_otro?: string;
    metodo_cosecha?: MetodoCosecha;
    metodo_cosecha_otro?: string;
  }): ManejoCultivoMani {
    return new ManejoCultivoMani({
      id_manejo: "",
      id_detalle: data.id_detalle,
      procedencia_semilla: data.procedencia_semilla ?? null,
      categoria_semilla: data.categoria_semilla ?? null,
      tratamiento_semillas: data.tratamiento_semillas ?? null,
      tipo_abonamiento: data.tipo_abonamiento ?? null,
      tipo_abonamiento_otro: data.tipo_abonamiento_otro ?? null,
      metodo_aporque: data.metodo_aporque ?? null,
      metodo_aporque_otro: data.metodo_aporque_otro ?? null,
      control_hierbas: data.control_hierbas ?? null,
      control_hierbas_otro: data.control_hierbas_otro ?? null,
      metodo_cosecha: data.metodo_cosecha ?? null,
      metodo_cosecha_otro: data.metodo_cosecha_otro ?? null,
      created_at: new Date(),
    });
  }

  // Crea instancia desde datos de BD
  static fromDatabase(data: ManejoCultivoManiData): ManejoCultivoMani {
    return new ManejoCultivoMani(data);
  }

  // Valida los datos
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.data.id_detalle) {
      errors.push("ID de detalle es requerido");
    }

    // Validar campos _otro: solo si el campo principal es 'otro'
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

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Convierte a formato para insertar en BD
  toDatabaseInsert(): Omit<ManejoCultivoManiData, "id_manejo" | "created_at"> {
    return {
      id_detalle: this.data.id_detalle,
      procedencia_semilla: this.data.procedencia_semilla ?? null,
      categoria_semilla: this.data.categoria_semilla ?? null,
      tratamiento_semillas: this.data.tratamiento_semillas ?? null,
      tipo_abonamiento: this.data.tipo_abonamiento ?? null,
      tipo_abonamiento_otro: this.data.tipo_abonamiento_otro?.trim() || null,
      metodo_aporque: this.data.metodo_aporque ?? null,
      metodo_aporque_otro: this.data.metodo_aporque_otro?.trim() || null,
      control_hierbas: this.data.control_hierbas ?? null,
      control_hierbas_otro: this.data.control_hierbas_otro?.trim() || null,
      metodo_cosecha: this.data.metodo_cosecha ?? null,
      metodo_cosecha_otro: this.data.metodo_cosecha_otro?.trim() || null,
    };
  }

  // Convierte a formato JSON publico
  toJSON(): ManejoCultivoManiPublicData {
    return {
      id_manejo: this.data.id_manejo,
      id_detalle: this.data.id_detalle,
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
      created_at: this.data.created_at.toISOString(),
    };
  }
}
