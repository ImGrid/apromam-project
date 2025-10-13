/**
 * Hook para obtener la ubicación GPS del navegador
 * Usa la API Geolocation del navegador
 * Maneja permisos denegados y errores
 */

import { useState, useCallback } from 'react';
import { isInBolivia } from '../utils/gpsHelpers';

export interface GeolocationPosition {
  lat: number;
  lng: number;
  accuracy: number; // Precisión en metros
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export interface UseGeolocationResult {
  position: GeolocationPosition | null;
  error: GeolocationError | null;
  isLoading: boolean;
  requestLocation: (options?: PositionOptions) => void;
  clearError: () => void;
}

// Opciones por defecto para alta precisión
const DEFAULT_OPTIONS: PositionOptions = {
  enableHighAccuracy: true, // Usar GPS (no solo WiFi/torres)
  timeout: 10000, // 10 segundos máximo
  maximumAge: 0, // No usar caché
};

/**
 * Hook para geolocalización del navegador
 *
 * @example
 * ```tsx
 * const { position, error, isLoading, requestLocation } = useGeolocation();
 *
 * return (
 *   <button onClick={() => requestLocation()}>
 *     {isLoading ? 'Obteniendo ubicación...' : 'Obtener mi ubicación'}
 *   </button>
 * );
 * ```
 */
export function useGeolocation(): UseGeolocationResult {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const requestLocation = useCallback((options?: PositionOptions) => {
    // Verificar si el navegador soporta geolocalización
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: 'Tu navegador no soporta geolocalización',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    navigator.geolocation.getCurrentPosition(
      (geoPosition) => {
        const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } =
          geoPosition.coords;

        // Validar que las coordenadas estén en Bolivia
        if (!isInBolivia(latitude, longitude)) {
          setError({
            code: 1,
            message: 'Tu ubicación está fuera del territorio boliviano',
          });
          setIsLoading(false);
          return;
        }

        setPosition({
          lat: latitude,
          lng: longitude,
          accuracy,
          altitude: altitude ?? undefined,
          altitudeAccuracy: altitudeAccuracy ?? undefined,
          heading: heading ?? undefined,
          speed: speed ?? undefined,
        });

        setIsLoading(false);
      },
      (geoError) => {
        // Mapear códigos de error a mensajes amigables
        let message: string;

        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            message = 'Permiso de ubicación denegado. Por favor, habilita el acceso a tu ubicación.';
            break;
          case geoError.POSITION_UNAVAILABLE:
            message = 'No se pudo obtener tu ubicación. Verifica tu conexión y GPS.';
            break;
          case geoError.TIMEOUT:
            message = 'Tiempo de espera agotado. Intenta de nuevo.';
            break;
          default:
            message = geoError.message || 'Error desconocido al obtener ubicación';
        }

        setError({
          code: geoError.code,
          message,
        });

        setIsLoading(false);
      },
      mergedOptions
    );
  }, []);

  return {
    position,
    error,
    isLoading,
    requestLocation,
    clearError,
  };
}

/**
 * Hook para monitorear la posición en tiempo real
 * Usa watchPosition() para actualizaciones continuas
 *
 * @param onPositionChange Callback cuando la posición cambia
 * @param options Opciones de geolocalización
 *
 * @example
 * ```tsx
 * useGeolocationWatch(
 *   (position) => console.log('Nueva posición:', position),
 *   { enableHighAccuracy: true }
 * );
 * ```
 */
export function useGeolocationWatch(
  onPositionChange?: (position: GeolocationPosition) => void,
  options?: PositionOptions
): UseGeolocationResult {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const requestLocation = useCallback((opts?: PositionOptions) => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: 'Tu navegador no soporta geolocalización',
      });
      return;
    }

    // Detener watch anterior si existe
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }

    setIsLoading(true);
    setError(null);

    const mergedOptions = { ...DEFAULT_OPTIONS, ...opts, ...options };

    const id = navigator.geolocation.watchPosition(
      (geoPosition) => {
        const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } =
          geoPosition.coords;

        if (!isInBolivia(latitude, longitude)) {
          setError({
            code: 1,
            message: 'Tu ubicación está fuera del territorio boliviano',
          });
          setIsLoading(false);
          return;
        }

        const newPosition: GeolocationPosition = {
          lat: latitude,
          lng: longitude,
          accuracy,
          altitude: altitude ?? undefined,
          altitudeAccuracy: altitudeAccuracy ?? undefined,
          heading: heading ?? undefined,
          speed: speed ?? undefined,
        };

        setPosition(newPosition);
        setIsLoading(false);

        onPositionChange?.(newPosition);
      },
      (geoError) => {
        let message: string;

        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            message = 'Permiso de ubicación denegado';
            break;
          case geoError.POSITION_UNAVAILABLE:
            message = 'No se pudo obtener tu ubicación';
            break;
          case geoError.TIMEOUT:
            message = 'Tiempo de espera agotado';
            break;
          default:
            message = geoError.message || 'Error desconocido';
        }

        setError({
          code: geoError.code,
          message,
        });

        setIsLoading(false);
      },
      mergedOptions
    );

    setWatchId(id);
  }, [watchId, options, onPositionChange]);

  return {
    position,
    error,
    isLoading,
    requestLocation,
    clearError,
  };
}
