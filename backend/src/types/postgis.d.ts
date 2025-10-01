// Tipos TypeScript para integracion PostGIS con node-postgres
// Version simplificada sin dependencias externas

import { QueryResult } from "pg";

// Tipos base para coordenadas
export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
}

// Interfaz para datos combinados (decimal + PostGIS)
export interface CoordinateData {
  // Campos decimales (para compatibilidad y queries simples)
  latitud_domicilio?: number;
  longitud_domicilio?: number;
  altitud_domicilio?: number;
}

// Tipos para configuracion PostGIS
export interface PostGISConfig {
  enabled: boolean;
  srid: number;
  precision: number;
  validateBounds: boolean;
}

// Tipos para queries espaciales comunes
export interface SpatialQueryOptions {
  srid?: number;
  precision?: number;
  bufferDistance?: number;
  useGeography?: boolean; // true para calculos en metros reales
}

// Tipo para resultados de busqueda por proximidad
export interface ProximitySearchResult {
  record: any;
  distance: number; // en metros si useGeography=true
  coordinates: Coordinates;
}

// Tipos para validacion de coordenadas
export interface CoordinateValidation {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

// Interfaz para bounds geograficos
export interface GeographicBounds {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
  name?: string; // ej: "Bolivia", "Region Norte"
}

// Export de constantes utiles
export const SPATIAL_REFERENCE_SYSTEMS = {
  WGS84: 4326,
  WEB_MERCATOR: 3857,
  UTM_ZONE_20S: 32720, // Para Bolivia
} as const;

export const GEOMETRY_TYPES = {
  POINT: "Point",
  LINESTRING: "LineString",
  POLYGON: "Polygon",
  MULTIPOINT: "MultiPoint",
  MULTILINESTRING: "MultiLineString",
  MULTIPOLYGON: "MultiPolygon",
  GEOMETRYCOLLECTION: "GeometryCollection",
} as const;
