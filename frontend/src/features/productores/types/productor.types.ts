/**
 * Types y interfaces para productores
 */

// Categorías de certificación orgánica
export type CategoriaProductor = "E" | "T2" | "T1" | "T0";

// Interfaz completa de productor
export interface Productor {
  codigo_productor: string;
  nombre_productor: string;
  ci_documento?: string;
  id_organizacion?: string;
  nombre_organizacion?: string;
  abreviatura_organizacion?: string;
  nombre_comunidad?: string;
  nombre_municipio?: string;
  nombre_provincia?: string;
  categoria_actual: CategoriaProductor;
  superficie_total_has: number;
  numero_parcelas_total: number;
  año_ingreso_programa: number;
  inicio_conversion_organica?: string;
  coordenadas?: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  activo: boolean;
  created_at: string;
}

// Input para crear productor
export interface CreateProductorInput {
  nombre_productor: string;
  ci_documento?: string;
  id_comunidad: string;
  id_organizacion: string;
  año_ingreso_programa: number;
  categoria_actual?: CategoriaProductor;
  superficie_total_has?: number;
  numero_parcelas_total?: number;
  coordenadas?: {
    latitud: number;
    longitud: number;
    altitud?: number;
  };
  inicio_conversion_organica?: string;
}

// Input para actualizar productor
export interface UpdateProductorInput {
  nombre_productor?: string;
  ci_documento?: string;
  categoria_actual?: CategoriaProductor;
  superficie_total_has?: number;
  numero_parcelas_total?: number;
  coordenadas?: {
    latitud: number;
    longitud: number;
    altitud?: number;
  };
  inicio_conversion_organica?: string;
  activo?: boolean;
}

// Filtros para listar productores
export interface ProductorFiltersInput {
  comunidad?: string;
  categoria?: CategoriaProductor;
  con_coordenadas?: boolean;
  activo?: boolean;
  search?: string;
}

// Respuesta de lista de productores
export interface ProductoresListResponse {
  productores: Productor[];
  total: number;
}

// Estadísticas de productores
export interface ProductorStats {
  total: number;
  por_categoria: Record<CategoriaProductor, number>;
  con_coordenadas: number;
  sin_coordenadas?: number;
  activos?: number;
  inactivos?: number;
}

// Labels para categorías
export const CATEGORIA_LABELS: Record<CategoriaProductor, string> = {
  "E": "En transición",
  "T2": "Segundo año de transición",
  "T1": "Primer año de transición",
  "T0": "Inicio transición",
};

// Colores para categorías
export const CATEGORIA_COLORS: Record<CategoriaProductor, string> = {
  "E": "warning",
  "T2": "info",
  "T1": "success",
  "T0": "neutral",
};
