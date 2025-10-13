/**
 * Componente de marcador personalizado para mapas
 * Soporta diferentes tipos de marcadores con íconos y popups
 */

import { Marker, Popup, Tooltip } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';

// Colores para diferentes tipos de marcadores
const MARKER_COLORS = {
  productor: '#16a34a', // Verde
  parcela: '#eab308', // Amarillo
  tecnico: '#3b82f6', // Azul
  comunidad: '#9333ea', // Púrpura
  default: '#6b7280', // Gris
} as const;

export type MarkerType = keyof typeof MARKER_COLORS;

export interface MapMarkerProps {
  /** Posición del marcador [lat, lng] */
  position: LatLngExpression;
  /** Tipo de marcador (define el color) */
  type?: MarkerType;
  /** Contenido del popup (se muestra al hacer click) */
  popup?: React.ReactNode;
  /** Contenido del tooltip (se muestra al hacer hover) */
  tooltip?: string;
  /** Si el marcador es draggable */
  draggable?: boolean;
  /** Callback cuando se hace click */
  onClick?: () => void;
  /** Callback cuando se arrastra */
  onDragEnd?: (position: { lat: number; lng: number }) => void;
}

/**
 * Crea un ícono de marcador personalizado con color
 */
function createCustomIcon(type: MarkerType = 'default') {
  const color = MARKER_COLORS[type];

  // SVG del marcador con color personalizado
  const svgIcon = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="${color}" d="M12.5 0C5.596 0 0 5.596 0 12.5c0 9.375 12.5 28.125 12.5 28.125S25 21.875 25 12.5C25 5.596 19.404 0 12.5 0z"/>
      <circle fill="white" cx="12.5" cy="12.5" r="5"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker-icon',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
}

/**
 * Componente de marcador personalizado
 *
 * @example
 * ```tsx
 * <MapMarker
 *   position={[-17.78, -63.18]}
 *   type="productor"
 *   tooltip="Juan Pérez"
 *   popup={<ProductorInfo productor={data} />}
 * />
 * ```
 */
export function MapMarker({
  position,
  type = 'default',
  popup,
  tooltip,
  draggable = false,
  onClick,
  onDragEnd,
}: MapMarkerProps) {
  const icon = createCustomIcon(type);

  const handleDragEnd = (e: L.DragEndEvent) => {
    const marker = e.target as L.Marker;
    const position = marker.getLatLng();
    onDragEnd?.({ lat: position.lat, lng: position.lng });
  };

  return (
    <Marker
      position={position}
      icon={icon}
      draggable={draggable}
      eventHandlers={{
        click: onClick,
        dragend: handleDragEnd,
      }}
    >
      {tooltip && <Tooltip>{tooltip}</Tooltip>}
      {popup && <Popup>{popup}</Popup>}
    </Marker>
  );
}

/**
 * Marcador para productores con estilo específico
 */
export function ProductorMarker({
  position,
  tooltip,
  popup,
  onClick,
}: Omit<MapMarkerProps, 'type'>) {
  return (
    <MapMarker
      position={position}
      type="productor"
      tooltip={tooltip}
      popup={popup}
      onClick={onClick}
    />
  );
}

/**
 * Marcador para parcelas con estilo específico
 */
export function ParcelaMarker({
  position,
  tooltip,
  popup,
  onClick,
}: Omit<MapMarkerProps, 'type'>) {
  return (
    <MapMarker
      position={position}
      type="parcela"
      tooltip={tooltip}
      popup={popup}
      onClick={onClick}
    />
  );
}

/**
 * Marcador para técnicos con estilo específico
 */
export function TecnicoMarker({
  position,
  tooltip,
  popup,
  onClick,
}: Omit<MapMarkerProps, 'type'>) {
  return (
    <MapMarker
      position={position}
      type="tecnico"
      tooltip={tooltip}
      popup={popup}
      onClick={onClick}
    />
  );
}

/**
 * Marcador para comunidades con estilo específico
 */
export function ComunidadMarker({
  position,
  tooltip,
  popup,
  onClick,
}: Omit<MapMarkerProps, 'type'>) {
  return (
    <MapMarker
      position={position}
      type="comunidad"
      tooltip={tooltip}
      popup={popup}
      onClick={onClick}
    />
  );
}
