/**
 * GPS Helpers
 * Utilidades para validación y manejo de coordenadas GPS
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
}

export interface BoliviaBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

// Límites geográficos de Bolivia
export const BOLIVIA_BOUNDS: BoliviaBounds = {
  minLat: -23.0, // Sur
  maxLat: -9.0, // Norte
  minLng: -70.0, // Oeste
  maxLng: -57.0, // Este
};

/**
 * Valida si las coordenadas están dentro de Bolivia
 */
export function isWithinBolivia(
  latitude: number,
  longitude: number
): boolean {
  return (
    latitude >= BOLIVIA_BOUNDS.minLat &&
    latitude <= BOLIVIA_BOUNDS.maxLat &&
    longitude >= BOLIVIA_BOUNDS.minLng &&
    longitude <= BOLIVIA_BOUNDS.maxLng
  );
}

/**
 * Valida que las coordenadas tengan el formato correcto
 */
export function validateCoordinates(
  latitude: number,
  longitude: number
): { valid: boolean; error?: string } {
  // Validar rango de latitud (-90 a 90)
  if (latitude < -90 || latitude > 90) {
    return {
      valid: false,
      error: "Latitud debe estar entre -90° y 90°",
    };
  }

  // Validar rango de longitud (-180 a 180)
  if (longitude < -180 || longitude > 180) {
    return {
      valid: false,
      error: "Longitud debe estar entre -180° y 180°",
    };
  }

  // Validar que esté en Bolivia
  if (!isWithinBolivia(latitude, longitude)) {
    return {
      valid: false,
      error:
        "Las coordenadas están fuera de Bolivia. Verifica que hayas capturado la ubicación correcta.",
    };
  }

  return { valid: true };
}

/**
 * Formatea coordenadas para display
 */
export function formatCoordinate(value: number, type: "lat" | "lng"): string {
  const direction = type === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "O";
  return `${Math.abs(value).toFixed(6)}° ${direction}`;
}

/**
 * Formatea altitud para display
 */
export function formatAltitude(altitude: number): string {
  return `${Math.round(altitude)} msnm`;
}

/**
 * Obtiene la precisión del GPS en texto legible
 */
export function getAccuracyLabel(accuracy: number): {
  label: string;
  color: "success" | "warning" | "error";
} {
  if (accuracy <= 10) {
    return { label: "Excelente", color: "success" };
  } else if (accuracy <= 30) {
    return { label: "Buena", color: "success" };
  } else if (accuracy <= 50) {
    return { label: "Aceptable", color: "warning" };
  } else {
    return { label: "Baja precisión", color: "error" };
  }
}

/**
 * Obtiene la posición actual del GPS
 */
export function getCurrentPosition(
  options?: PositionOptions
): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalización no soportada en este navegador"));
      return;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 segundos
      maximumAge: 0, // No usar cache
      ...options,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude ?? undefined,
          accuracy: position.coords.accuracy,
        };

        // Validar coordenadas
        const validation = validateCoordinates(
          coords.latitude,
          coords.longitude
        );

        if (!validation.valid) {
          reject(new Error(validation.error));
          return;
        }

        resolve(coords);
      },
      (error) => {
        let errorMessage = "Error al obtener ubicación GPS";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Permiso de ubicación denegado. Por favor, habilita los permisos de ubicación en tu navegador.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "Ubicación no disponible. Verifica que tengas GPS activado.";
            break;
          case error.TIMEOUT:
            errorMessage =
              "Tiempo de espera agotado. Intenta de nuevo en un lugar con mejor señal GPS.";
            break;
        }

        reject(new Error(errorMessage));
      },
      defaultOptions
    );
  });
}

/**
 * Calcula la distancia entre dos puntos GPS en metros (fórmula de Haversine)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Radio de la Tierra en metros
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
