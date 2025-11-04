/**
 * Tipos para el módulo de Catálogos (solo Tipos de Cultivo)
 *
 * NOTA: Los tipos de Gestiones están en features/configuracion/types/gestion.types.ts
 */

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

// Respuesta de lista de tipos cultivo
export interface TiposCultivoListResponse {
  tipos_cultivo: TipoCultivo[];
  total: number;
}

// Filtros para catalogos
export interface CatalogoFilters {
  activo?: boolean;
}
