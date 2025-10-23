/**
 * Step1DatosGenerales - Sección 1: Datos Generales
 *
 * COINCIDE 100% CON EL DOCUMENTO OFICIAL DE LA FICHA
 *
 * Campos del documento oficial:
 * - Nombre productor (autorellenado)
 * - Código productor (autorellenado)
 * - N° de parcelas (autorellenado)
 * - Superficie total (has) (autorellenado)
 * - Categoría de la gestión anterior (editable)
 * - Año de ingreso al programa de certificación (autorellenado)
 * - Comunidad (autorellenado)
 * - Persona entrevistada (editable)
 * - Fecha de visita (editable)
 * - Latitud Sud-Domicilio (editable, puede capturar GPS)
 * - Longitud Oeste-Dom. (editable, puede capturar GPS)
 * - Altitud Domicilio (msnm) (editable, puede capturar GPS)
 */

import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { MapPin, User, Calendar } from "lucide-react";
import { ProductorSearchInput } from "../ProductorSearchInput";
import { FormField } from "@/shared/components/ui/FormField";
import { GPSCaptureButton } from "../Specialized/GPSCaptureButton";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { productoresService } from "@/features/productores/services/productores.service";
import type {
  CreateFichaCompletaInput,
} from "../../types/ficha.types";
import type { Productor } from "@/features/productores/types/productor.types";

export default function Step1DatosGenerales() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CreateFichaCompletaInput>();

  const user = useAuthStore((state) => state.user);

  const [selectedProductor, setSelectedProductor] = useState<Productor | null>(null);
  const [coordenadas, setCoordenadas] = useState({
    latitud: 0,
    longitud: 0,
    altitud: 0,
  });

  // Observar el codigo_productor del formulario
  const codigoProductorFromForm = watch("ficha.codigo_productor");

  // Auto-rellenar inspector_interno con el usuario logueado
  useEffect(() => {
    if (user) {
      setValue("ficha.inspector_interno", user.nombre_completo, {
        shouldValidate: true,
      });
    }
  }, [user, setValue]);

  // NUEVO: Recuperar el productor cuando el componente monta o cuando cambia el codigo
  useEffect(() => {
    const loadProductor = async () => {
      if (codigoProductorFromForm && !selectedProductor) {
        try {
          const productor = await productoresService.getProductorByCodigo(codigoProductorFromForm);
          setSelectedProductor(productor);

          // Restaurar coordenadas si existen
          if (productor.coordenadas) {
            setCoordenadas({
              latitud: productor.coordenadas.latitude,
              longitud: productor.coordenadas.longitude,
              altitud: productor.coordenadas.altitude || 0,
            });
          }
        } catch (error) {
          console.error('[Step1] Error recuperando productor:', error);
        }
      }
    };

    loadProductor();
  }, [codigoProductorFromForm]);

  // Manejar selección de productor
  const handleSelectProductor = (productor: Productor | null) => {
    if (!productor) {
      setSelectedProductor(null);
      // Limpiar campos autorellenados
      setValue("ficha.codigo_productor", "");
      setCoordenadas({ latitud: 0, longitud: 0, altitud: 0 });
      return;
    }

    setSelectedProductor(productor);

    // Auto-rellenar código de productor
    setValue("ficha.codigo_productor", productor.codigo_productor, {
      shouldValidate: true,
      shouldDirty: true,
    });

    // Auto-rellenar gestión (año actual)
    const currentYear = new Date().getFullYear();
    setValue("ficha.gestion", currentYear, {
      shouldValidate: true,
    });

    // Auto-rellenar coordenadas si existen
    if (productor.coordenadas) {
      setCoordenadas({
        latitud: productor.coordenadas.latitude,
        longitud: productor.coordenadas.longitude,
        altitud: productor.coordenadas.altitude || 0,
      });
    }
  };

  // Manejar captura de GPS
  const handleGPSCapture = (coords: {
    latitude: number;
    longitude: number;
    altitude?: number;
  }) => {
    setCoordenadas({
      latitud: coords.latitude,
      longitud: coords.longitude,
      altitud: coords.altitude || 0,
    });
  };

  return (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* BÚSQUEDA DE PRODUCTOR */}
      {/* ============================================ */}
      <div className="p-6 bg-white border rounded-lg border-neutral-border">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b">
          <User className="w-5 h-5 text-primary" />
          <h4 className="text-base font-semibold text-text-primary">
            Buscar Productor
          </h4>
        </div>

        <ProductorSearchInput
          onSelectProductor={handleSelectProductor}
          selectedProductor={selectedProductor}
        />
      </div>

      {/* ============================================ */}
      {/* DATOS DEL PRODUCTOR (AUTORELLENADOS) */}
      {/* ============================================ */}
      {selectedProductor && (
        <div className="p-6 bg-white border rounded-lg border-neutral-border">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b">
            <User className="w-5 h-5 text-primary" />
            <h4 className="text-base font-semibold text-text-primary">
              Datos del Productor
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Nombre productor */}
            <FormField label="Nombre del Productor">
              <input
                type="text"
                value={selectedProductor.nombre_productor}
                readOnly
                className="w-full px-3 py-2 font-medium bg-gray-50 border border-gray-300 rounded-md text-text-primary cursor-not-allowed"
              />
            </FormField>

            {/* Código productor */}
            <FormField label="Código del Productor">
              <input
                type="text"
                value={selectedProductor.codigo_productor}
                readOnly
                className="w-full px-3 py-2 font-mono font-semibold uppercase bg-gray-50 border border-gray-300 rounded-md text-text-primary cursor-not-allowed"
              />
            </FormField>

            {/* N° de parcelas */}
            <FormField label="N° de Parcelas">
              <input
                type="number"
                value={selectedProductor.numero_parcelas_total}
                readOnly
                className="w-full px-3 py-2 font-medium bg-gray-50 border border-gray-300 rounded-md text-text-primary cursor-not-allowed"
              />
            </FormField>

            {/* Superficie total */}
            <FormField label="Superficie Total (has)">
              <input
                type="number"
                step="0.01"
                value={selectedProductor.superficie_total_has}
                readOnly
                className="w-full px-3 py-2 font-medium bg-gray-50 border border-gray-300 rounded-md text-text-primary cursor-not-allowed"
              />
            </FormField>

            {/* Año de ingreso al programa */}
            <FormField label="Año de Ingreso al Programa">
              <input
                type="number"
                value={selectedProductor.año_ingreso_programa}
                readOnly
                className="w-full px-3 py-2 font-medium bg-gray-50 border border-gray-300 rounded-md text-text-primary cursor-not-allowed"
              />
            </FormField>

            {/* Comunidad */}
            <FormField label="Comunidad">
              <input
                type="text"
                value={
                  selectedProductor.nombre_comunidad ||
                  "No especificada"
                }
                readOnly
                className="w-full px-3 py-2 font-medium bg-gray-50 border border-gray-300 rounded-md text-text-primary cursor-not-allowed"
              />
            </FormField>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* DATOS DE LA VISITA (EDITABLES) */}
      {/* ============================================ */}
      {selectedProductor && (
        <div className="p-6 bg-white border rounded-lg border-neutral-border">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b">
            <Calendar className="w-5 h-5 text-primary" />
            <h4 className="text-base font-semibold text-text-primary">
              Datos de la Visita
            </h4>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Persona entrevistada */}
              <FormField
                label="Persona Entrevistada"
                error={errors.ficha?.persona_entrevistada?.message}
              >
                <input
                  type="text"
                  {...register("ficha.persona_entrevistada")}
                  className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ej: Juan Pérez"
                  maxLength={100}
                />
              </FormField>

              {/* Fecha de visita */}
              <FormField
                label="Fecha de Visita"
                required
                error={errors.ficha?.fecha_inspeccion?.message}
              >
                <input
                  type="date"
                  {...register("ficha.fecha_inspeccion")}
                  className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                  max={new Date().toISOString().split("T")[0]}
                />
              </FormField>
            </div>

            {/* Categoría de la gestión anterior */}
            <FormField
              label="Categoría de la Gestión Anterior"
              error={errors.ficha?.categoria_gestion_anterior?.message}
            >
              <div className="flex flex-wrap gap-4 mt-2">
                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    value="E"
                    {...register("ficha.categoria_gestion_anterior")}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">
                    E □ - Ecológico
                  </span>
                </label>

                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    value="0T"
                    {...register("ficha.categoria_gestion_anterior")}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">
                    T0 □ - Año cero
                  </span>
                </label>

                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    value="1T"
                    {...register("ficha.categoria_gestion_anterior")}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">
                    T1 □ - Primer año de transición
                  </span>
                </label>

                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    value="2T"
                    {...register("ficha.categoria_gestion_anterior")}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">
                    T2 □ - Segundo año de transición
                  </span>
                </label>
              </div>
            </FormField>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* COORDENADAS GPS DEL DOMICILIO */}
      {/* ============================================ */}
      {selectedProductor && (
        <div className="p-6 bg-white border rounded-lg border-neutral-border">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b">
            <MapPin className="w-5 h-5 text-primary" />
            <h4 className="text-base font-semibold text-text-primary">
              Coordenadas GPS del Domicilio
            </h4>
          </div>

          <div className="space-y-4">
            {/* Campos de coordenadas */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Latitud */}
              <FormField label="Latitud Sud-Domicilio (°)">
                <input
                  type="number"
                  step="0.000001"
                  value={coordenadas.latitud || ""}
                  onChange={(e) =>
                    setCoordenadas({
                      ...coordenadas,
                      latitud: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="-17.123456"
                />
              </FormField>

              {/* Longitud */}
              <FormField label="Longitud Oeste-Dom. (°)">
                <input
                  type="number"
                  step="0.000001"
                  value={coordenadas.longitud || ""}
                  onChange={(e) =>
                    setCoordenadas({
                      ...coordenadas,
                      longitud: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="-64.123456"
                />
              </FormField>

              {/* Altitud */}
              <FormField label="Altitud Domicilio (msnm)">
                <input
                  type="number"
                  step="1"
                  value={coordenadas.altitud || ""}
                  onChange={(e) =>
                    setCoordenadas({
                      ...coordenadas,
                      altitud: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="2500"
                />
              </FormField>
            </div>

            {/* Botón para capturar GPS del dispositivo */}
            <div className="flex justify-end">
              <GPSCaptureButton
                onCapture={handleGPSCapture}
                label="Capturar GPS"
                showCoordinates={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay productor seleccionado */}
      {!selectedProductor && (
        <div className="p-8 text-center border-2 border-dashed rounded-lg border-neutral-border bg-neutral-bg">
          <User className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-base font-medium text-gray-600">
            Seleccione un productor para continuar
          </p>
        </div>
      )}
    </div>
  );
}
