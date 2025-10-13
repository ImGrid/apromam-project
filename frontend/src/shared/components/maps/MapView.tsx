/**
 * Componente base de mapa usando React Leaflet
 * Muestra un mapa interactivo con marcadores opcionales
 */

import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import type { ReactNode } from 'react';
import type { LatLngExpression } from 'leaflet';

export interface MapViewProps {
  /** Centro del mapa [lat, lng] */
  center?: LatLngExpression;
  /** Nivel de zoom (1-18) */
  zoom?: number;
  /** Altura del mapa */
  height?: string;
  /** Ancho del mapa */
  width?: string;
  /** Clases CSS adicionales */
  className?: string;
  /** Contenido del mapa (marcadores, etc.) */
  children?: ReactNode;
  /** Si debe mostrar el control de zoom */
  showZoom?: boolean;
  /** Posición del control de zoom */
  zoomPosition?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  /** Si el scroll del mouse hace zoom */
  scrollWheelZoom?: boolean;
  /** Si se puede hacer zoom con doble click */
  doubleClickZoom?: boolean;
  /** Si se puede arrastrar el mapa */
  dragging?: boolean;
}

// Centro por defecto: Bolivia (aproximadamente)
const DEFAULT_CENTER: LatLngExpression = [-16.5, -68.15];
const DEFAULT_ZOOM = 6;

/**
 * Componente de mapa base
 *
 * @example
 * ```tsx
 * <MapView center={[-17.78, -63.18]} zoom={12}>
 *   <MapMarker position={[-17.78, -63.18]} />
 * </MapView>
 * ```
 */
export function MapView({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  height = '400px',
  width = '100%',
  className = '',
  children,
  showZoom = true,
  zoomPosition = 'topright',
  scrollWheelZoom = true,
  doubleClickZoom = true,
  dragging = true,
}: MapViewProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-neutral-border ${className}`}
      style={{ height, width }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={scrollWheelZoom}
        doubleClickZoom={doubleClickZoom}
        dragging={dragging}
        zoomControl={false} // Usamos ZoomControl personalizado
        style={{ height: '100%', width: '100%' }}
      >
        {/* Tile layer de OpenStreetMap (gratuito) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Control de zoom personalizado */}
        {showZoom && <ZoomControl position={zoomPosition} />}

        {/* Contenido del mapa (marcadores, etc.) */}
        {children}
      </MapContainer>
    </div>
  );
}

/**
 * Variante de mapa más pequeño para vistas previas
 */
export function MapPreview({
  center = DEFAULT_CENTER,
  zoom = 12,
  children,
  className = '',
}: Pick<MapViewProps, 'center' | 'zoom' | 'children' | 'className'>) {
  return (
    <MapView
      center={center}
      zoom={zoom}
      height="200px"
      className={className}
      showZoom={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      dragging={false}
    >
      {children}
    </MapView>
  );
}

/**
 * Variante de mapa a pantalla completa
 */
export function MapFullScreen({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  children,
  className = '',
}: Pick<MapViewProps, 'center' | 'zoom' | 'children' | 'className'>) {
  return (
    <MapView
      center={center}
      zoom={zoom}
      height="calc(100vh - 200px)" // Altura dinámica
      className={className}
    >
      {children}
    </MapView>
  );
}
