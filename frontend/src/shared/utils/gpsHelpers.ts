/**
 * Utilidades para trabajar con GPS y coordenadas geográficas
 * Incluye validaciones, formateo y cálculos de distancia
 */

// Límites geográficos de Bolivia
export const BOLIVIA_BOUNDS = {
  MIN_LATITUDE: -22.896,
  MAX_LATITUDE: -9.68,
  MIN_LONGITUDE: -69.651,
  MAX_LONGITUDE: -57.453,
} as const;

// Precisión GPS requerida
export const GPS_PRECISION = {
  MIN_DECIMAL_PLACES: 6,
  MAX_DECIMAL_PLACES: 8,
} as const;

/**
 * Interfaz para coordenadas
 */
export interface Coordinates {
  lat: number;
  lng: number;
  alt?: number;
}

/**
 * Valida que una coordenada tenga el formato correcto
 * @param lat Latitud
 * @param lng Longitud
 * @returns true si las coordenadas son válidas
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return false;
  }

  if (isNaN(lat) || isNaN(lng)) {
    return false;
  }

  if (lat < -90 || lat > 90) {
    return false;
  }

  if (lng < -180 || lng > 180) {
    return false;
  }

  return true;
}

/**
 * Verifica si las coordenadas están dentro del territorio boliviano
 * @param lat Latitud
 * @param lng Longitud
 * @returns true si está en Bolivia
 */
export function isInBolivia(lat: number, lng: number): boolean {
  if (!isValidCoordinate(lat, lng)) {
    return false;
  }

  return (
    lat >= BOLIVIA_BOUNDS.MIN_LATITUDE &&
    lat <= BOLIVIA_BOUNDS.MAX_LATITUDE &&
    lng >= BOLIVIA_BOUNDS.MIN_LONGITUDE &&
    lng <= BOLIVIA_BOUNDS.MAX_LONGITUDE
  );
}

/**
 * Cuenta los decimales de un número
 * @param num Número
 * @returns Cantidad de decimales
 */
function countDecimals(num: number): number {
  const str = num.toString();
  if (!str.includes('.')) return 0;
  return str.split('.')[1].length;
}

/**
 * Valida que las coordenadas tengan la precisión mínima requerida
 * @param lat Latitud
 * @param lng Longitud
 * @returns true si tiene al menos 6 decimales
 */
export function hasMinimumPrecision(lat: number, lng: number): boolean {
  const latDecimals = countDecimals(lat);
  const lngDecimals = countDecimals(lng);

  return (
    latDecimals >= GPS_PRECISION.MIN_DECIMAL_PLACES &&
    lngDecimals >= GPS_PRECISION.MIN_DECIMAL_PLACES
  );
}

/**
 * Formatea una coordenada a 6 decimales
 * @param coord Coordenada (lat o lng)
 * @returns Coordenada formateada
 */
export function formatCoordinate(coord: number): string {
  return coord.toFixed(6);
}

/**
 * Formatea las coordenadas como string para mostrar
 * @param lat Latitud
 * @param lng Longitud
 * @returns String formateado "lat, lng"
 */
export function formatCoordinates(lat: number, lng: number): string {
  return `${formatCoordinate(lat)}, ${formatCoordinate(lng)}`;
}

/**
 * Calcula la distancia entre dos puntos usando la fórmula de Haversine
 * @param lat1 Latitud del punto 1
 * @param lng1 Longitud del punto 1
 * @param lat2 Latitud del punto 2
 * @param lng2 Longitud del punto 2
 * @returns Distancia en metros
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en metros
}

/**
 * Formatea una distancia en metros a un string legible
 * @param meters Distancia en metros
 * @returns String formateado (ej: "1.5 km" o "250 m")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

/**
 * Valida coordenadas completas (válidas, en Bolivia, con precisión)
 * @param lat Latitud
 * @param lng Longitud
 * @returns Objeto con validación y mensaje de error si aplica
 */
export function validateCoordinates(
  lat: number,
  lng: number
): { valid: boolean; error?: string } {
  if (!isValidCoordinate(lat, lng)) {
    return {
      valid: false,
      error: 'Coordenadas inválidas. Verifica el formato.',
    };
  }

  if (!isInBolivia(lat, lng)) {
    return {
      valid: false,
      error: 'Las coordenadas están fuera del territorio boliviano.',
    };
  }

  if (!hasMinimumPrecision(lat, lng)) {
    return {
      valid: false,
      error: 'Las coordenadas deben tener al menos 6 decimales de precisión.',
    };
  }

  return { valid: true };
}

/**
 * Parsea una cadena de coordenadas "lat,lng" o "lat, lng"
 * @param coordString String con coordenadas
 * @returns Coordenadas parseadas o null si es inválido
 */
export function parseCoordinateString(coordString: string): Coordinates | null {
  try {
    const parts = coordString.split(',').map((s) => s.trim());

    if (parts.length < 2) return null;

    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    const alt = parts[2] ? parseFloat(parts[2]) : undefined;

    if (isNaN(lat) || isNaN(lng)) return null;

    if (!isValidCoordinate(lat, lng)) return null;

    return { lat, lng, alt };
  } catch {
    return null;
  }
}

/**
 * Obtiene el centro geográfico de un conjunto de coordenadas
 * @param coordinates Array de coordenadas
 * @returns Centro geográfico
 */
export function getCenter(coordinates: Coordinates[]): Coordinates | null {
  if (coordinates.length === 0) return null;

  const sum = coordinates.reduce(
    (acc, coord) => ({
      lat: acc.lat + coord.lat,
      lng: acc.lng + coord.lng,
    }),
    { lat: 0, lng: 0 }
  );

  return {
    lat: sum.lat / coordinates.length,
    lng: sum.lng / coordinates.length,
  };
}

/**
 * Calcula el bounding box de un conjunto de coordenadas
 * @param coordinates Array de coordenadas
 * @returns Bounding box [southWest, northEast] o null si está vacío
 */
export function getBounds(
  coordinates: Coordinates[]
): [[number, number], [number, number]] | null {
  if (coordinates.length === 0) return null;

  let minLat = coordinates[0].lat;
  let maxLat = coordinates[0].lat;
  let minLng = coordinates[0].lng;
  let maxLng = coordinates[0].lng;

  coordinates.forEach((coord) => {
    minLat = Math.min(minLat, coord.lat);
    maxLat = Math.max(maxLat, coord.lat);
    minLng = Math.min(minLng, coord.lng);
    maxLng = Math.max(maxLng, coord.lng);
  });

  return [
    [minLat, minLng], // southWest
    [maxLat, maxLng], // northEast
  ];
}
