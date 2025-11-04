// Tipos para archivos de no conformidades
export type TipoArchivoNC =
  | "evidencia_correccion"
  | "documento_soporte"
  | "foto_antes"
  | "foto_despues";

export type EstadoUpload = "pendiente" | "subido" | "error";

// Interfaz para datos de ArchivoNoConformidad desde BD
export interface ArchivoNoConformidadData {
  id_archivo: string;
  id_no_conformidad: string;
  tipo_archivo: TipoArchivoNC;
  nombre_original: string;
  ruta_almacenamiento: string;
  tamaño_bytes: number;
  mime_type?: string | null;
  estado_upload: EstadoUpload;
  hash_archivo?: string | null;
  fecha_captura: Date;
  subido_por?: string | null;
  created_at: Date;
}

// Interfaz para datos publicos (response)
export interface ArchivoNoConformidadPublicData {
  id_archivo: string;
  id_no_conformidad: string;
  tipo_archivo: TipoArchivoNC;
  nombre_original: string;
  ruta_almacenamiento: string;
  tamaño_bytes: number;
  mime_type?: string | null;
  estado_upload: EstadoUpload;
  hash_archivo?: string | null;
  fecha_captura: string;
  subido_por?: string | null;
  created_at: string;
}

// Entity ArchivoNoConformidad
// Representa un archivo adjunto a una no conformidad (evidencia, fotos, documentos)
export class ArchivoNoConformidad {
  private data: ArchivoNoConformidadData;

  constructor(data: ArchivoNoConformidadData) {
    this.data = data;
  }

  // Getters
  get id(): string {
    return this.data.id_archivo;
  }

  get idNoConformidad(): string {
    return this.data.id_no_conformidad;
  }

  get tipoArchivo(): TipoArchivoNC {
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

  get subidoPor(): string | null {
    return this.data.subido_por ?? null;
  }

  get createdAt(): Date {
    return this.data.created_at;
  }

  // Crea una nueva instancia
  static create(data: {
    id_no_conformidad: string;
    tipo_archivo: TipoArchivoNC;
    nombre_original: string;
    ruta_almacenamiento: string;
    tamaño_bytes: number;
    mime_type?: string;
    hash_archivo?: string;
    subido_por?: string;
    fecha_captura?: Date;
  }): ArchivoNoConformidad {
    return new ArchivoNoConformidad({
      id_archivo: "",
      id_no_conformidad: data.id_no_conformidad,
      tipo_archivo: data.tipo_archivo,
      nombre_original: data.nombre_original,
      ruta_almacenamiento: data.ruta_almacenamiento,
      tamaño_bytes: data.tamaño_bytes,
      mime_type: data.mime_type,
      estado_upload: "pendiente",
      hash_archivo: data.hash_archivo,
      fecha_captura: data.fecha_captura ?? new Date(),
      subido_por: data.subido_por,
      created_at: new Date(),
    });
  }

  // Crea instancia desde datos de BD
  static fromDatabase(data: ArchivoNoConformidadData): ArchivoNoConformidad {
    return new ArchivoNoConformidad(data);
  }

  // Valida los datos
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.data.id_no_conformidad) {
      errors.push("ID de no conformidad es requerido");
    }

    const tiposValidos: TipoArchivoNC[] = [
      "evidencia_correccion",
      "documento_soporte",
      "foto_antes",
      "foto_despues",
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
  toDatabaseInsert(): Omit<ArchivoNoConformidadData, "id_archivo" | "created_at"> {
    return {
      id_no_conformidad: this.data.id_no_conformidad,
      tipo_archivo: this.data.tipo_archivo,
      nombre_original: this.data.nombre_original,
      ruta_almacenamiento: this.data.ruta_almacenamiento,
      tamaño_bytes: this.data.tamaño_bytes,
      mime_type: this.data.mime_type,
      estado_upload: this.data.estado_upload,
      hash_archivo: this.data.hash_archivo,
      fecha_captura: this.data.fecha_captura,
      subido_por: this.data.subido_por,
    };
  }

  // Convierte a formato para actualizar en BD
  toDatabaseUpdate(): Partial<
    Omit<ArchivoNoConformidadData, "id_archivo" | "id_no_conformidad" | "created_at">
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
      subido_por: this.data.subido_por,
    };
  }

  // Convierte a formato JSON publico
  toJSON(): ArchivoNoConformidadPublicData {
    return {
      id_archivo: this.data.id_archivo,
      id_no_conformidad: this.data.id_no_conformidad,
      tipo_archivo: this.data.tipo_archivo,
      nombre_original: this.data.nombre_original,
      ruta_almacenamiento: this.data.ruta_almacenamiento,
      tamaño_bytes: this.data.tamaño_bytes,
      mime_type: this.data.mime_type ?? null,
      estado_upload: this.data.estado_upload,
      hash_archivo: this.data.hash_archivo ?? null,
      fecha_captura: this.data.fecha_captura.toISOString(),
      subido_por: this.data.subido_por ?? null,
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

  // Obtiene la descripción del tipo de archivo
  getDescripcionTipo(): string {
    const descripciones: Record<TipoArchivoNC, string> = {
      evidencia_correccion: "Evidencia de Corrección",
      documento_soporte: "Documento de Soporte",
      foto_antes: "Foto Antes",
      foto_despues: "Foto Después",
    };

    return descripciones[this.data.tipo_archivo] || "Archivo";
  }
}
