import { createDatabaseLogger } from "./logger.js";

const logger = createDatabaseLogger();

// Bounds geograficos de Bolivia para validaciones
// Coordenadas extremas del territorio boliviano
export const BOLIVIA_BOUNDS = {
  MIN_LATITUDE: -22.896,
  MAX_LATITUDE: -9.68,
  MIN_LONGITUDE: -69.651,
  MAX_LONGITUDE: -57.453,
} as const;

// Precision minima requerida para coordenadas GPS
// 6 decimales proporcionan precision de aproximadamente 0.1 metros
export const GPS_PRECISION = {
  MIN_DECIMAL_PLACES: 6,
  MAX_DECIMAL_PLACES: 8,
} as const;

// SRID estandar para coordenadas GPS
export const WGS84_SRID = 4326;

// Interfaz para coordenadas decimales simples
export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
}

// Validar que las coordenadas esten dentro del territorio boliviano
// Retorna true si las coordenadas son validas para Bolivia
export function validateBolivianCoordinates(
  latitude: number,
  longitude: number
): { valid: boolean; error?: string } {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return {
      valid: false,
      error: "Latitude and longitude must be numbers",
    };
  }

  if (isNaN(latitude) || isNaN(longitude)) {
    return {
      valid: false,
      error: "Latitude and longitude cannot be NaN",
    };
  }

  if (
    latitude < BOLIVIA_BOUNDS.MIN_LATITUDE ||
    latitude > BOLIVIA_BOUNDS.MAX_LATITUDE
  ) {
    return {
      valid: false,
      error: `Latitude ${latitude} is outside Bolivia bounds (${BOLIVIA_BOUNDS.MIN_LATITUDE} to ${BOLIVIA_BOUNDS.MAX_LATITUDE})`,
    };
  }

  if (
    longitude < BOLIVIA_BOUNDS.MIN_LONGITUDE ||
    longitude > BOLIVIA_BOUNDS.MAX_LONGITUDE
  ) {
    return {
      valid: false,
      error: `Longitude ${longitude} is outside Bolivia bounds (${BOLIVIA_BOUNDS.MIN_LONGITUDE} to ${BOLIVIA_BOUNDS.MAX_LONGITUDE})`,
    };
  }

  return { valid: true };
}

// Validar precision de coordenadas GPS
// Verifica que tengan suficientes decimales para precision requerida
export function validateGPSPrecision(
  latitude: number,
  longitude: number
): { valid: boolean; error?: string } {
  const latStr = latitude.toString();
  const lngStr = longitude.toString();

  const latDecimals = latStr.includes(".") ? latStr.split(".")[1].length : 0;
  const lngDecimals = lngStr.includes(".") ? lngStr.split(".")[1].length : 0;

  if (latDecimals < GPS_PRECISION.MIN_DECIMAL_PLACES) {
    return {
      valid: false,
      error: `Latitude precision too low: ${latDecimals} decimals, minimum ${GPS_PRECISION.MIN_DECIMAL_PLACES} required`,
    };
  }

  if (lngDecimals < GPS_PRECISION.MIN_DECIMAL_PLACES) {
    return {
      valid: false,
      error: `Longitude precision too low: ${lngDecimals} decimals, minimum ${GPS_PRECISION.MIN_DECIMAL_PLACES} required`,
    };
  }

  return { valid: true };
}

// ========================================
// REFACTORIZADO: Crear WKT en lugar de SQL
// ========================================

/**
 * Crea un string WKT (Well-Known Text) para un POINT
 * Este string se puede usar como parametro en queries preparados
 *
 * @example
 * const wkt = createPointWKT(-17.123456, -64.123456);
 * // Retorna: "POINT(-64.123456 -17.123456)"
 *
 * // Usar en query:
 * const query = {
 *   text: "INSERT INTO table (geom) VALUES (ST_GeomFromText($1, 4326))",
 *   values: [wkt]
 * };
 */
export function createPointWKT(latitude: number, longitude: number): string {
  const validation = validateBolivianCoordinates(latitude, longitude);
  if (!validation.valid) {
    throw new Error(`Invalid coordinates: ${validation.error}`);
  }

  // WKT usa orden: POINT(longitud latitud)
  // NO es POINT(lat lng) - esto es importante
  return `POINT(${longitude} ${latitude})`;
}

// Convertir coordenadas decimales a formato GeoJSON Point
// Para APIs que requieren formato GeoJSON estandar
export function coordinatesToGeoJSON(latitude: number, longitude: number): any {
  const validation = validateBolivianCoordinates(latitude, longitude);
  if (!validation.valid) {
    throw new Error(`Invalid coordinates: ${validation.error}`);
  }

  return {
    type: "Point",
    coordinates: [longitude, latitude], // GeoJSON usa [lng, lat]
  };
}

/**
 * Crea un string GeoJSON para un POINT que puede usarse con ST_GeomFromGeoJSON
 *
 * @example
 * const geojson = createPointGeoJSON(-17.123456, -64.123456);
 * const query = {
 *   text: "INSERT INTO table (geom) VALUES (ST_GeomFromGeoJSON($1))",
 *   values: [geojson]
 * };
 */
export function createPointGeoJSON(
  latitude: number,
  longitude: number
): string {
  const geojson = coordinatesToGeoJSON(latitude, longitude);
  return JSON.stringify(geojson);
}

// Calcular distancia aproximada entre dos puntos en metros
// Formula haversine para distancias cortas sin usar PostGIS
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Generar bounds para busquedas por proximidad
// Calcula rectangulo aproximado para consultas ST_Within optimizadas
export function generateProximityBounds(
  centerLat: number,
  centerLng: number,
  radiusMeters: number
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  // Aproximacion simple: 1 grado ≈ 111km
  const latDegreeDistance = 111000; // metros por grado de latitud
  const lngDegreeDistance = 111000 * Math.cos((centerLat * Math.PI) / 180); // ajustado por latitud

  const latOffset = radiusMeters / latDegreeDistance;
  const lngOffset = radiusMeters / lngDegreeDistance;

  return {
    minLat: centerLat - latOffset,
    maxLat: centerLat + latOffset,
    minLng: centerLng - lngOffset,
    maxLng: centerLng + lngOffset,
  };
}

// Validar formato de string de coordenadas
// Para parsing de inputs de usuario como "lat,lng"
export function parseCoordinateString(coordStr: string): Coordinates | null {
  try {
    const trimmed = coordStr.trim();
    const parts = trimmed.split(",");

    if (parts.length < 2 || parts.length > 3) {
      return null;
    }

    const latitude = parseFloat(parts[0].trim());
    const longitude = parseFloat(parts[1].trim());
    const altitude = parts[2] ? parseFloat(parts[2].trim()) : undefined;

    if (isNaN(latitude) || isNaN(longitude)) {
      return null;
    }

    const validation = validateBolivianCoordinates(latitude, longitude);
    if (!validation.valid) {
      return null;
    }

    return { latitude, longitude, altitude };
  } catch (error) {
    return null;
  }
}

/**
 * Crea un WKT POLYGON desde un array de coordenadas
 * Util para parcelas con multiples vertices
 *
 * @param coordinates Array de [longitude, latitude] pairs
 * @returns WKT string para POLYGON
 *
 * @example
 * const coords = [
 *   [-64.1, -17.1],
 *   [-64.2, -17.1],
 *   [-64.2, -17.2],
 *   [-64.1, -17.2],
 *   [-64.1, -17.1]  // Debe cerrar el polígono
 * ];
 * const wkt = createPolygonWKT(coords);
 * // Retorna: "POLYGON((-64.1 -17.1, -64.2 -17.1, ...))"
 */
export function createPolygonWKT(coordinates: Array<[number, number]>): string {
  if (coordinates.length < 4) {
    throw new Error("Polygon must have at least 4 coordinates");
  }

  // Verificar que el polígono esté cerrado
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    throw new Error("Polygon must be closed (first point = last point)");
  }

  // Validar todas las coordenadas
  for (const [lng, lat] of coordinates) {
    const validation = validateBolivianCoordinates(lat, lng);
    if (!validation.valid) {
      throw new Error(
        `Invalid coordinate [${lng}, ${lat}]: ${validation.error}`
      );
    }
  }

  // Crear WKT
  const coordPairs = coordinates
    .map(([lng, lat]) => `${lng} ${lat}`)
    .join(", ");

  return `POLYGON((${coordPairs}))`;
}
