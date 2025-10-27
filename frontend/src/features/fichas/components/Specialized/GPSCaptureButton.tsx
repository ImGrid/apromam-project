/**
 * GPSCaptureButton
 * Botón para capturar coordenadas GPS con validación y feedback
 */

import { useState } from "react";
import { MapPin, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { showToast } from "@/shared/hooks/useToast";
import {
  getCurrentPosition,
  validateCoordinates,
  formatCoordinate,
  formatAltitude,
  getAccuracyLabel,
  type Coordinates,
} from "../../utils/gpsHelpers";

interface GPSCaptureButtonProps {
  onCapture: (coords: {
    latitude: number;
    longitude: number;
    altitude?: number;
  }) => void;
  disabled?: boolean;
  label?: string;
  showCoordinates?: boolean;
  showHelp?: boolean;
  size?: "small" | "medium" | "large";
  className?: string;
}

export function GPSCaptureButton({
  onCapture,
  disabled = false,
  label = "Capturar Ubicación GPS",
  showCoordinates = true,
  showHelp = true,
  size = "medium",
  className = "",
}: GPSCaptureButtonProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastCapture, setLastCapture] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async () => {
    setIsCapturing(true);
    setError(null);

    try {
      const coords = await getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });

      // Validar coordenadas
      const validation = validateCoordinates(
        coords.latitude,
        coords.longitude
      );

      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Guardar última captura
      setLastCapture(coords);

      // Llamar callback
      onCapture({
        latitude: coords.latitude,
        longitude: coords.longitude,
        altitude: coords.altitude,
      });

      // Mostrar feedback de precisión
      const accuracy = coords.accuracy
        ? getAccuracyLabel(coords.accuracy)
        : null;

      const message = accuracy
        ? `Ubicación capturada. Precisión: ${accuracy.label} (±${coords.accuracy?.toFixed(0)}m)`
        : "Ubicación capturada. Coordenadas GPS guardadas correctamente";

      if (accuracy?.color === "error") {
        showToast.warning(message);
      } else {
        showToast.success(message);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al capturar GPS";
      setError(errorMessage);

      showToast.error(`Error al capturar GPS: ${errorMessage}`);
    } finally {
      setIsCapturing(false);
    }
  };

  const hasLabel = label && label.trim().length > 0;

  return (
    <div className="space-y-3">
      {/* Botón de captura */}
      <Button
        type="button"
        variant="secondary"
        size={size}
        onClick={handleCapture}
        disabled={disabled || isCapturing}
        isLoading={isCapturing}
        className={className || "w-full sm:w-auto"}
      >
        {!isCapturing && !lastCapture && (
          <MapPin className={`w-5 h-5 ${hasLabel ? "mr-2" : ""}`} />
        )}
        {isCapturing && (
          <Loader2 className={`w-5 h-5 animate-spin ${hasLabel ? "mr-2" : ""}`} />
        )}
        {!isCapturing && lastCapture && (
          <CheckCircle className={`w-5 h-5 text-success ${hasLabel ? "mr-2" : ""}`} />
        )}
        {hasLabel && (isCapturing ? "Capturando..." : label)}
      </Button>

      {/* Información de coordenadas capturadas */}
      {showCoordinates && lastCapture && !error && (
        <div className="p-3 space-y-2 rounded-lg bg-success/5 border border-success/20">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 mt-0.5 text-success flex-shrink-0" />
            <div className="flex-1 space-y-1 text-sm">
              <p className="font-medium text-success">GPS capturado</p>
              <div className="space-y-0.5 text-text-secondary">
                <p>
                  <span className="font-medium">Latitud:</span>{" "}
                  {formatCoordinate(lastCapture.latitude, "lat")}
                </p>
                <p>
                  <span className="font-medium">Longitud:</span>{" "}
                  {formatCoordinate(lastCapture.longitude, "lng")}
                </p>
                {lastCapture.altitude && (
                  <p>
                    <span className="font-medium">Altitud:</span>{" "}
                    {formatAltitude(lastCapture.altitude)}
                  </p>
                )}
                {lastCapture.accuracy && (
                  <p>
                    <span className="font-medium">Precisión:</span> ±
                    {lastCapture.accuracy.toFixed(0)}m (
                    {getAccuracyLabel(lastCapture.accuracy).label})
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-3 rounded-lg bg-error/5 border border-error/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 text-error flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-error">
                No se pudo capturar GPS
              </p>
              <p className="mt-1 text-xs text-text-secondary">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Ayuda contextual */}
      {showHelp && !lastCapture && !error && !isCapturing && (
        <p className="text-xs text-text-secondary">
          GPS: Presiona el botón para obtener coordenadas automáticamente.
          Asegúrate de tener GPS activado y permisos otorgados.
        </p>
      )}
    </div>
  );
}
