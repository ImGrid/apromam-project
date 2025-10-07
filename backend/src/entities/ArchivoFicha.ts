// Tipos para archivos
export type TipoArchivo = "croquis" | "foto_parcela" | "documento_pdf";
export type EstadoUpload = "pendiente" | "subido" | "error";

// Interfaz para datos de ArchivoFicha desde BD
export interface ArchivoFichaData {
  id_archivo: string;
  id_ficha: string;
  tipo_archivo: TipoArchivo;
  nombre_original: string;
  ruta_almacenamiento: string;
  tamaño_bytes: number;
  mime_type?: string | null;
  estado_upload: EstadoUpload;
  hash_archivo?: string | null;
  fecha_captura: Date;
  created_at: Date;
}

// Interfaz para datos publicos (response)
export interface ArchivoFichaPublicData {
  id_archivo: string;
  id_ficha: string;
  tipo_archivo: TipoArchivo;
  nombre_original: string;
  ruta_almacenamiento: string;
  tamaño_bytes: number;
  mime_type?: string | null;
  estado_upload: EstadoUpload;
  hash_archivo?: string | null;
  fecha_captura: string;
  created_at: string;
}

// Entity ArchivoFicha
// Representa un archivo adjunto a la ficha (foto, croquis, PDF)
export class ArchivoFicha {
  private data: ArchivoFichaData;

  constructor(data: ArchivoFichaData) {
    this.data = data;
  }

  // Getters
  get id(): string {
    return this.data.id_archivo;
  }

  get idFicha(): string {
    return this.data.id_ficha;
  }

  get tipoArchivo(): TipoArchivo {
    return this.data.tipo_archivo;
  }

  get nombreOriginal(): string {
    return this.data.nombre_original;
  }

  get rutaAlmacenamiento(): string {
    return this.data.ruta_almacenamiento;
  }

  get tamañoBytes(): number {
    return this.data.tamaño_bytes;
  }

  get mimeType(): string | null {
    return this.data.mime_type ?? null;
  }

  get estadoUpload(): EstadoUpload {
    return this.data.estado_upload;
  }

  get hashArchivo(): string | null {
    return this.data.hash_archivo ?? null;
  }

  get fechaCaptura(): Date {
    return this.data.fecha_captura;
  }

  get createdAt(): Date {
    return this.data.created_at;
  }

  // Crea una nueva instancia
  static create(data: {
    id_ficha: string;
    tipo_archivo: TipoArchivo;
    nombre_original: string;
    ruta_almacenamiento: string;
    tamaño_bytes: number;
    mime_type?: string;
    hash_archivo?: string;
    fecha_captura?: Date;
  }): ArchivoFicha {
    return new ArchivoFicha({
      id_archivo: "",
      id_ficha: data.id_ficha,
      tipo_archivo: data.tipo_archivo,
      nombre_original: data.nombre_original,
      ruta_almacenamiento: data.ruta_almacenamiento,
      tamaño_bytes: data.tamaño_bytes,
      mime_type: data.mime_type,
      estado_upload: "pendiente",
      hash_archivo: data.hash_archivo,
      fecha_captura: data.fecha_captura ?? new Date(),
      created_at: new Date(),
    });
  }

  // Crea instancia desde datos de BD
  static fromDatabase(data: ArchivoFichaData): ArchivoFicha {
    return new ArchivoFicha(data);
  }

  // Valida los datos
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.data.id_ficha) {
      errors.push("ID de ficha es requerido");
    }

    const tiposValidos: TipoArchivo[] = [
      "croquis",
      "foto_parcela",
      "documento_pdf",
    ];
    if (!tiposValidos.includes(this.data.tipo_archivo)) {
      errors.push("Tipo de archivo invalido");
    }

    if (
      !this.data.nombre_original ||
      this.data.nombre_original.trim().length === 0
    ) {
      errors.push("Nombre original es requerido");
    }

    if (this.data.nombre_original.length > 255) {
      errors.push("Nombre original no puede exceder 255 caracteres");
    }

    if (
      !this.data.ruta_almacenamiento ||
      this.data.ruta_almacenamiento.trim().length === 0
    ) {
      errors.push("Ruta de almacenamiento es requerida");
    }

    if (this.data.tamaño_bytes <= 0) {
      errors.push("Tamaño debe ser mayor a 0");
    }

    // Limite de 50MB
    if (this.data.tamaño_bytes > 50 * 1024 * 1024) {
      errors.push("Archivo no puede exceder 50MB");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Convierte a formato para insertar en BD
  toDatabaseInsert(): Omit<ArchivoFichaData, "id_archivo" | "created_at"> {
    return {
      id_ficha: this.data.id_ficha,
      tipo_archivo: this.data.tipo_archivo,
      nombre_original: this.data.nombre_original,
      ruta_almacenamiento: this.data.ruta_almacenamiento,
      tamaño_bytes: this.data.tamaño_bytes,
      mime_type: this.data.mime_type,
      estado_upload: this.data.estado_upload,
      hash_archivo: this.data.hash_archivo,
      fecha_captura: this.data.fecha_captura,
    };
  }

  // Convierte a formato para actualizar en BD
  toDatabaseUpdate(): Partial<
    Omit<ArchivoFichaData, "id_archivo" | "id_ficha" | "created_at">
  > {
    return {
      tipo_archivo: this.data.tipo_archivo,
      nombre_original: this.data.nombre_original,
      ruta_almacenamiento: this.data.ruta_almacenamiento,
      tamaño_bytes: this.data.tamaño_bytes,
      mime_type: this.data.mime_type,
      estado_upload: this.data.estado_upload,
      hash_archivo: this.data.hash_archivo,
      fecha_captura: this.data.fecha_captura,
    };
  }

  // Convierte a formato JSON publico
  toJSON(): ArchivoFichaPublicData {
    return {
      id_archivo: this.data.id_archivo,
      id_ficha: this.data.id_ficha,
      tipo_archivo: this.data.tipo_archivo,
      nombre_original: this.data.nombre_original,
      ruta_almacenamiento: this.data.ruta_almacenamiento,
      tamaño_bytes: this.data.tamaño_bytes,
      mime_type: this.data.mime_type ?? null,
      estado_upload: this.data.estado_upload,
      hash_archivo: this.data.hash_archivo ?? null,
      fecha_captura: this.data.fecha_captura.toISOString(),
      created_at: this.data.created_at.toISOString(),
    };
  }

  // Verifica si el archivo esta subido
  estaSubido(): boolean {
    return this.data.estado_upload === "subido";
  }

  // Verifica si hay error en el upload
  tieneError(): boolean {
    return this.data.estado_upload === "error";
  }

  // Obtiene tamaño en MB
  getTamañoMB(): number {
    return this.data.tamaño_bytes / (1024 * 1024);
  }

  // Marca como subido
  marcarSubido(): void {
    this.data.estado_upload = "subido";
  }

  // Marca con error
  marcarError(): void {
    this.data.estado_upload = "error";
  }

  // Actualiza hash
  actualizarHash(hash: string): void {
    this.data.hash_archivo = hash;
  }

  // Actualiza ruta de almacenamiento
  actualizarRuta(ruta: string): void {
    if (!ruta || ruta.trim().length === 0) {
      throw new Error("Ruta de almacenamiento es requerida");
    }

    this.data.ruta_almacenamiento = ruta;
  }
}
