// Types para modulo de Seguimiento de No Conformidades
// Replica exactamente los tipos del backend para consistencia

// Estado de seguimiento de la NC
export type EstadoSeguimiento = "pendiente" | "seguimiento" | "corregido";

// Tipos de archivo permitidos para evidencias
export type TipoArchivoNC =
  | "evidencia_correccion"
  | "documento_soporte"
  | "foto_antes"
  | "foto_despues";

// Estado de upload del archivo
export type EstadoUploadNC = "pendiente" | "subido" | "error";

// Datos basicos de una no conformidad (response del backend)
export interface NoConformidad {
  id_no_conformidad: string;
  id_ficha: string;
  descripcion_no_conformidad: string;
  accion_correctiva_propuesta?: string | null;
  fecha_limite_implementacion?: string | null;
  estado_seguimiento: EstadoSeguimiento;
  comentario_seguimiento?: string | null;
  fecha_seguimiento?: string | null;
  realizado_por_usuario?: string | null;
  updated_at: string;
  created_at: string;
}

// No Conformidad con datos enriquecidos (productor, ficha, comunidad)
export interface NoConformidadEnriquecida extends NoConformidad {
  codigo_productor?: string;
  nombre_productor?: string;
  nombre_comunidad?: string;
  gestion?: number;
  nombre_usuario_seguimiento?: string;
}

// Input para actualizar datos basicos de la NC
export interface UpdateNoConformidadInput {
  descripcion_no_conformidad?: string;
  accion_correctiva_propuesta?: string;
  fecha_limite_implementacion?: string;
}

// Input para actualizar seguimiento
export interface UpdateSeguimientoInput {
  estado_seguimiento: EstadoSeguimiento;
  comentario_seguimiento?: string;
}

// Filtros para query de NC por ficha
export interface NCFichaQuery {
  estado_seguimiento?: EstadoSeguimiento;
  page?: number;
  limit?: number;
}

// Filtros para estadisticas
export interface EstadisticasNCQuery {
  gestion?: number;
  id_comunidad?: string;
}

// Respuesta de listado de NC
export interface NoConformidadesListResponse {
  no_conformidades: NoConformidadEnriquecida[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Estadisticas de NC
export interface EstadisticasNC {
  total: number;
  por_estado: {
    pendiente: number;
    seguimiento: number;
    corregido: number;
  };
  vencidas: number;
  proximas_vencer: number;
}

// Archivo de no conformidad
export interface ArchivoNC {
  id_archivo: string;
  id_no_conformidad: string;
  tipo_archivo: TipoArchivoNC;
  nombre_original: string;
  ruta_almacenamiento: string;
  tamaño_bytes: number;
  mime_type?: string | null;
  estado_upload: EstadoUploadNC;
  hash_archivo?: string | null;
  fecha_captura: string;
  subido_por?: string | null;
  created_at: string;
}

// Respuesta de lista de archivos
export interface ArchivosNCListResponse {
  archivos: ArchivoNC[];
  total: number;
}

// Respuesta de error
export interface NCError {
  error: string;
  message: string;
  timestamp: string;
}
