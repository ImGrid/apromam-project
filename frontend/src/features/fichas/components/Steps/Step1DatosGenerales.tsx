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
import { LocationPicker } from "@/shared/components/maps/LocationPicker";
import { Tooltip } from "@/shared/components/ui/Tooltip";
import { Button } from "@/shared/components/ui/Button";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { productoresService } from "@/features/productores/services/productores.service";
import { fichasService } from "../../services/fichas.service";
import { showToast } from "@/shared/hooks/useToast";
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
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Observar el codigo_productor del formulario
  const codigoProductorFromForm = watch("ficha.codigo_productor");
  // Detectar modo edit: si hay código de productor inicial, estamos editando
  const [isEditMode] = useState(() => !!codigoProductorFromForm);


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
  const handleSelectProductor = async (productor: Productor | null) => {
    if (!productor) {
      setSelectedProductor(null);
      // Limpiar campos autorellenados
      setValue("ficha.codigo_productor", "");
      setCoordenadas({ latitud: 0, longitud: 0, altitud: 0 });
      return;
    }

    const currentYear = new Date().getFullYear();

    // Validar si ya existe una ficha para este productor en la gestión actual
    try {
      const exists = await fichasService.checkExists(
        productor.codigo_productor,
        currentYear
      );

      if (exists.exists && exists.ficha) {
        const { estado_ficha, resultado_certificacion } = exists.ficha;

        // Mostrar advertencia según el estado, SIN redirigir
        let mensaje = '';
        if (estado_ficha === "borrador") {
          mensaje = `El productor ${productor.nombre_productor} ya tiene una ficha en borrador para ${currentYear}. No puede crear una nueva ficha.`;
        } else if (resultado_certificacion === "rechazado" || estado_ficha === "rechazado") {
          mensaje = `El productor ${productor.nombre_productor} tiene una ficha rechazada para ${currentYear}. No puede crear una nueva ficha.`;
        } else if (estado_ficha === "revision") {
          mensaje = `El productor ${productor.nombre_productor} ya tiene una ficha en revisión para ${currentYear}. No puede crear una nueva ficha.`;
        } else if (estado_ficha === "aprobado") {
          mensaje = `El productor ${productor.nombre_productor} ya tiene una ficha aprobada para ${currentYear}. No puede crear una nueva ficha.`;
        } else {
          mensaje = `El productor ${productor.nombre_productor} ya tiene una ficha para ${currentYear} (estado: ${estado_ficha}). No puede crear una nueva ficha.`;
        }

        showToast.error(mensaje, { duration: 6000 });
        return;
      }

      // No existe ficha, continuar normalmente
      setSelectedProductor(productor);

      // Auto-rellenar código de productor
      setValue("ficha.codigo_productor", productor.codigo_productor, {
        shouldValidate: true,
        shouldDirty: true,
      });

      // Auto-rellenar gestión (año actual)
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
    } catch (error) {
      console.error('[Step1] Error verificando ficha existente:', error);
      showToast.error('Error al verificar si el productor ya tiene ficha');
    }
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
          disabled={isEditMode}
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
            {/* Campos de coordenadas en una sola fila compacta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coordenadas del Domicilio
              </label>
              <div className="flex gap-2">
                {/* Latitud */}
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
                  className="flex-1 px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Latitud (°)"
                />

                {/* Longitud */}
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
                  className="flex-1 px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Longitud (°)"
                />

                {/* Altitud */}
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
                  className="flex-1 px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Altitud (msnm)"
                />

                {/* Botón para abrir mapa */}
                <Tooltip content="Seleccionar ubicación en mapa" position="top">
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    onClick={() => setShowLocationPicker(!showLocationPicker)}
                  >
                    <MapPin className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </div>
            </div>

            {/* Mapa para seleccionar ubicación */}
            {showLocationPicker && (
              <div className="mt-3">
                <LocationPicker
                  initialPosition={
                    coordenadas.latitud && coordenadas.longitud
                      ? { lat: coordenadas.latitud, lng: coordenadas.longitud }
                      : selectedProductor?.coordenadas
                      ? {
                          lat: selectedProductor.coordenadas.latitude,
                          lng: selectedProductor.coordenadas.longitude,
                        }
                      : null
                  }
                  onLocationSelect={(pos) => {
                    setCoordenadas({
                      ...coordenadas,
                      latitud: pos.lat,
                      longitud: pos.lng,
                    });
                  }}
                  height="400px"
                />
              </div>
            )}
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
