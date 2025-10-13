// Tipo de Cultivo completo
export interface TipoCultivo {
  id_tipo_cultivo: string;
  nombre_cultivo: string;
  descripcion?: string | null;
  es_principal_certificable: boolean;
  rendimiento_promedio_qq_ha?: number | null;
  activo: boolean;
}

// Datos para crear tipo cultivo
export interface CreateTipoCultivoInput {
  nombre_cultivo: string;
  descripcion?: string;
  es_principal_certificable?: boolean;
  rendimiento_promedio_qq_ha?: number;
}

// Datos para actualizar tipo cultivo
export interface UpdateTipoCultivoInput {
  nombre_cultivo?: string;
  descripcion?: string;
  es_principal_certificable?: boolean;
  rendimiento_promedio_qq_ha?: number;
  activo?: boolean;
}

// Gestion completa
export interface Gestion {
  id_gestion: string;
  anio_gestion: number;
  descripcion?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  estado_gestion: "planificada" | "activa" | "finalizada";
  activa: boolean;
}

// Datos para crear gestion
export interface CreateGestionInput {
  anio_gestion: number;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado_gestion?: "planificada" | "activa" | "finalizada";
}

// Datos para actualizar gestion
export interface UpdateGestionInput {
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado_gestion?: "planificada" | "activa" | "finalizada";
  activa?: boolean;
}

// Respuesta de lista de tipos cultivo
export interface TiposCultivoListResponse {
  tipos_cultivo: TipoCultivo[];
  total: number;
}

// Respuesta de lista de gestiones
export interface GestionesListResponse {
  gestiones: Gestion[];
  total: number;
}

// Filtros para catalogos
export interface CatalogoFilters {
  activo?: boolean;
}
