// Tipo para ganado
export type TipoGanado = "mayor" | "menor" | "aves";

// Interfaz para datos de ActividadPecuaria desde BD
export interface ActividadPecuariaData {
  id_actividad: string;
  id_ficha: string;
  tipo_ganado: TipoGanado;
  animal_especifico?: string | null;
  cantidad: number;
  sistema_manejo?: string | null;
  uso_guano?: string | null;
  created_at: Date;
}

// Interfaz para datos publicos (response)
export interface ActividadPecuariaPublicData {
  id_actividad: string;
  id_ficha: string;
  tipo_ganado: TipoGanado;
  animal_especifico?: string | null;
  cantidad: number;
  sistema_manejo?: string | null;
  uso_guano?: string | null;
  created_at: string;
}

// Entity ActividadPecuaria
// Representa una actividad pecuaria del productor (Seccion 6)
export class ActividadPecuaria {
  private data: ActividadPecuariaData;

  constructor(data: ActividadPecuariaData) {
    this.data = data;
  }

  // Getters
  get id(): string {
    return this.data.id_actividad;
  }

  get idFicha(): string {
    return this.data.id_ficha;
  }

  get tipoGanado(): TipoGanado {
    return this.data.tipo_ganado;
  }

  get animalEspecifico(): string | null {
    return this.data.animal_especifico ?? null;
  }

  get cantidad(): number {
    return this.data.cantidad;
  }

  get sistemaManejo(): string | null {
    return this.data.sistema_manejo ?? null;
  }

  get usoGuano(): string | null {
    return this.data.uso_guano ?? null;
  }

  get createdAt(): Date {
    return this.data.created_at;
  }

  // Crea una nueva instancia
  static create(data: {
    id_ficha: string;
    tipo_ganado: TipoGanado;
    animal_especifico?: string;
    cantidad: number;
    sistema_manejo?: string;
    uso_guano?: string;
  }): ActividadPecuaria {
    return new ActividadPecuaria({
      id_actividad: "",
      id_ficha: data.id_ficha,
      tipo_ganado: data.tipo_ganado,
      animal_especifico: data.animal_especifico,
      cantidad: data.cantidad,
      sistema_manejo: data.sistema_manejo,
      uso_guano: data.uso_guano,
      created_at: new Date(),
    });
  }

  // Crea instancia desde datos de BD
  static fromDatabase(data: ActividadPecuariaData): ActividadPecuaria {
    return new ActividadPecuaria(data);
  }

  // Valida los datos
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.data.id_ficha) {
      errors.push("ID de ficha es requerido");
    }

    const tiposValidos: TipoGanado[] = ["mayor", "menor", "aves"];
    if (!tiposValidos.includes(this.data.tipo_ganado)) {
      errors.push("Tipo de ganado debe ser: mayor, menor o aves");
    }

    if (this.data.cantidad < 0) {
      errors.push("Cantidad no puede ser negativa");
    }

    if (this.data.cantidad > 10000) {
      errors.push("Cantidad no puede exceder 10000");
    }

    if (
      this.data.animal_especifico &&
      this.data.animal_especifico.length > 100
    ) {
      errors.push("Animal especifico no puede exceder 100 caracteres");
    }

    if (this.data.sistema_manejo && this.data.sistema_manejo.length > 200) {
      errors.push("Sistema de manejo no puede exceder 200 caracteres");
    }

    if (this.data.uso_guano && this.data.uso_guano.length > 500) {
      errors.push("Uso de guano no puede exceder 500 caracteres");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Convierte a formato para insertar en BD
  toDatabaseInsert(): Omit<
    ActividadPecuariaData,
    "id_actividad" | "created_at"
  > {
    return {
      id_ficha: this.data.id_ficha,
      tipo_ganado: this.data.tipo_ganado,
      animal_especifico: this.data.animal_especifico?.trim() || null,
      cantidad: this.data.cantidad,
      sistema_manejo: this.data.sistema_manejo?.trim() || null,
      uso_guano: this.data.uso_guano?.trim() || null,
    };
  }

  // Convierte a formato para actualizar en BD
  toDatabaseUpdate(): Partial<
    Omit<ActividadPecuariaData, "id_actividad" | "id_ficha" | "created_at">
  > {
    return {
      tipo_ganado: this.data.tipo_ganado,
      animal_especifico: this.data.animal_especifico?.trim() || null,
      cantidad: this.data.cantidad,
      sistema_manejo: this.data.sistema_manejo?.trim() || null,
      uso_guano: this.data.uso_guano?.trim() || null,
    };
  }

  // Convierte a formato JSON publico
  toJSON(): ActividadPecuariaPublicData {
    return {
      id_actividad: this.data.id_actividad,
      id_ficha: this.data.id_ficha,
      tipo_ganado: this.data.tipo_ganado,
      animal_especifico: this.data.animal_especifico ?? null,
      cantidad: this.data.cantidad,
      sistema_manejo: this.data.sistema_manejo ?? null,
      uso_guano: this.data.uso_guano ?? null,
      created_at: this.data.created_at.toISOString(),
    };
  }

  // Verifica si usa el guano
  usaGuano(): boolean {
    return (
      this.data.uso_guano !== null &&
      this.data.uso_guano !== undefined &&
      this.data.uso_guano.trim().length > 0
    );
  }

  // Actualiza cantidad
  actualizarCantidad(cantidad: number): void {
    if (cantidad < 0) {
      throw new Error("Cantidad no puede ser negativa");
    }

    if (cantidad > 10000) {
      throw new Error("Cantidad no puede exceder 10000");
    }

    this.data.cantidad = cantidad;
  }

  // Actualiza animal especifico
  actualizarAnimalEspecifico(animal: string): void {
    if (animal.length > 100) {
      throw new Error("Animal especifico no puede exceder 100 caracteres");
    }

    this.data.animal_especifico = animal.trim();
  }

  // Actualiza sistema de manejo
  actualizarSistemaManejo(sistema: string): void {
    if (sistema.length > 200) {
      throw new Error("Sistema de manejo no puede exceder 200 caracteres");
    }

    this.data.sistema_manejo = sistema.trim();
  }

  // Actualiza uso de guano
  actualizarUsoGuano(uso: string): void {
    if (uso.length > 500) {
      throw new Error("Uso de guano no puede exceder 500 caracteres");
    }

    this.data.uso_guano = uso.trim();
  }
}
