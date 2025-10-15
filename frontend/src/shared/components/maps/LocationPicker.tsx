/**
 * Componente de mapa interactivo para seleccionar coordenadas GPS
 * Permite hacer click en el mapa para capturar lat/lng
 * Incluye botón para usar geolocalización del navegador
 */

import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import { MapPin, Navigation } from 'lucide-react';
import { Button, Alert } from '@/shared/components/ui';
import { useGeolocation } from '@/shared/hooks/useGeolocation';
import { formatCoordinates, validateCoordinates } from '@/shared/utils/gpsHelpers';
import { MapMarker } from './MapMarker';
import type { LatLngExpression } from 'leaflet';

export interface LocationPickerProps {
  /** Centro inicial del mapa */
  initialCenter?: LatLngExpression;
  /** Coordenadas iniciales seleccionadas */
  initialPosition?: { lat: number; lng: number } | null;
  /** Nivel de zoom inicial */
  initialZoom?: number;
  /** Callback cuando se selecciona una ubicación */
  onLocationSelect?: (position: { lat: number; lng: number }) => void;
  /** Altura del mapa */
  height?: string;
  /** Si muestra el botón de geolocalización */
  showGeolocationButton?: boolean;
}

/**
 * Componente interno para capturar clicks en el mapa
 */
function LocationSelector({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });

  return null;
}

// Centro por defecto: Sucre, Chuquisaca, Bolivia
const DEFAULT_CENTER: LatLngExpression = [-19.04, -65.26];
const DEFAULT_ZOOM = 13;

/**
 * Mapa interactivo para seleccionar ubicación GPS
 *
 * @example
 * ```tsx
 * <LocationPicker
 *   onLocationSelect={(pos) => {
 *     console.log('Ubicación seleccionada:', pos);
 *   }}
 * />
 * ```
 */
export function LocationPicker({
  initialCenter = DEFAULT_CENTER,
  initialPosition = null,
  initialZoom = DEFAULT_ZOOM,
  onLocationSelect,
  height = '400px',
  showGeolocationButton = true,
}: LocationPickerProps) {
  const [selectedPosition, setSelectedPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(initialPosition);

  const [mapCenter, setMapCenter] = useState<LatLngExpression>(
    initialPosition ? [initialPosition.lat, initialPosition.lng] : initialCenter
  );

  const {
    position: geoPosition,
    error: geoError,
    isLoading: geoLoading,
    requestLocation,
    clearError,
  } = useGeolocation();

  // Handler para click en mapa
  const handleLocationSelect = useCallback(
    (lat: number, lng: number) => {
      // Validar coordenadas
      const validation = validateCoordinates(lat, lng);

      if (!validation.valid) {
        // Puedes mostrar un toast o alerta aquí
        console.warn('Coordenadas inválidas:', validation.error);
        return;
      }

      const position = { lat, lng };
      setSelectedPosition(position);
      onLocationSelect?.(position);
    },
    [onLocationSelect]
  );

  // Handler para usar geolocalización
  const handleUseMyLocation = useCallback(() => {
    clearError();
    requestLocation();
  }, [requestLocation, clearError]);

  // Cuando se obtiene geolocalización, seleccionar esa ubicación
  useState(() => {
    if (geoPosition) {
      handleLocationSelect(geoPosition.lat, geoPosition.lng);
      setMapCenter([geoPosition.lat, geoPosition.lng]);
    }
  });

  return (
    <div className="space-y-4">
      {/* Mapa */}
      <div className="relative overflow-hidden border rounded-lg border-neutral-border">
        <MapContainer
          center={mapCenter}
          zoom={initialZoom}
          style={{ height, width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* Componente para capturar clicks */}
          <LocationSelector onLocationSelect={handleLocationSelect} />

          {/* Marcador en la ubicación seleccionada */}
          {selectedPosition && (
            <MapMarker
              position={[selectedPosition.lat, selectedPosition.lng]}
              type="default"
              tooltip="Ubicación seleccionada"
            />
          )}
        </MapContainer>

        {/* Botón de geolocalización flotante */}
        {showGeolocationButton && (
          <div className="absolute z-[1000] top-4 left-4">
            <Button
              variant="primary"
              size="small"
              onClick={handleUseMyLocation}
              isLoading={geoLoading}
              className="shadow-lg"
            >
              <Navigation className="w-4 h-4" />
              <span className="hidden sm:inline">Usar Mi Ubicación</span>
            </Button>
          </div>
        )}
      </div>

      {/* Errores de geolocalización */}
      {geoError && (
        <Alert
          type="error"
          message={geoError.message}
          onClose={clearError}
        />
      )}

      {/* Información de coordenadas seleccionadas */}
      {selectedPosition && (
        <div className="p-4 border rounded-lg bg-success/10 border-success/20">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-success">
                Coordenadas capturadas:
              </p>
              <p className="mt-1 text-xs font-mono text-text-primary">
                {formatCoordinates(selectedPosition.lat, selectedPosition.lng)}
              </p>
              {geoPosition?.accuracy && (
                <p className="mt-1 text-xs text-text-secondary">
                  Precisión: ±{Math.round(geoPosition.accuracy)}m
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instrucciones */}
      {!selectedPosition && (
        <div className="p-4 border rounded-lg bg-info/10 border-info/20">
          <p className="text-sm text-info">
            <strong>Instrucciones:</strong> Haz click en el mapa para seleccionar una ubicación,
            o usa el botón "Usar Mi Ubicación" para capturar tu ubicación actual con GPS.
          </p>
        </div>
      )}
    </div>
  );
}
