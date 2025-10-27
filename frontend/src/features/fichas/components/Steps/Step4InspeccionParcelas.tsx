/**
 * Step4InspeccionParcelas
 * Sección 4: Registro de inspección de parcelas certificables
 *
 * ESTRUCTURA CORRECTA:
 * - Campos de PARCELA aparecen UNA VEZ por parcela (situación, riego, barreras, rotación, coordenadas, insumos orgánicos)
 * - Campos de CULTIVO aparecen en cada fila de la tabla (tipo cultivo, superficie)
 */

import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { Plus, Trash2, MapPin } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Card, Alert, Button, Input, Select } from "@/shared/components/ui";
import { TiposCultivoSelect } from "@/features/catalogos/components/TiposCultivoSelect";
import { LocationPicker } from "@/shared/components/maps";
import { useProductorParcelas } from "@/features/productores/hooks/useProductorParcelas";
import type { CreateFichaCompletaInput } from "../../types/ficha.types";

export default function Step4InspeccionParcelas() {
  const { register, control, watch, setValue, formState: { errors } } = useFormContext<CreateFichaCompletaInput>();
  const { fields, append, remove } = useFieldArray({ control, name: "detalles_cultivo" });
  const { fields: parcelasInspeccionadasFields, append: appendParcelaInspeccionada, update: updateParcelaInspeccionada } = useFieldArray({ control, name: "parcelas_inspeccionadas" });

  const [showLocationPicker, setShowLocationPicker] = useState<{ [key: string]: boolean }>({});

  const codigoProductor = watch("ficha.codigo_productor");
  const { parcelas, superficieTotal, isLoading, error } = useProductorParcelas(codigoProductor);

  // Inicializar parcelas_inspeccionadas cuando se cargan las parcelas
  useEffect(() => {
    if (parcelas && parcelas.length > 0 && parcelasInspeccionadasFields.length === 0) {
      parcelas.forEach((parcela) => {
        appendParcelaInspeccionada({
          id_parcela: parcela.id_parcela,
          rotacion: parcela.rotacion ?? false,
          utiliza_riego: parcela.utiliza_riego ?? false,
          tipo_barrera: parcela.tipo_barrera ?? "ninguna",
          insumos_organicos: parcela.insumos_organicos ?? "",
          latitud_sud: parcela.ubicacion?.latitude,
          longitud_oeste: parcela.ubicacion?.longitude,
        });
      });
    }
  }, [parcelas]);

  // Mapear id_parcela a índice en parcelas_inspeccionadas
  const parcelaIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    parcelasInspeccionadasFields.forEach((field, index) => {
      map.set(field.id_parcela, index);
    });
    return map;
  }, [parcelasInspeccionadasFields]);

  // Agrupar cultivos por parcela
  const cultivosPorParcela = useMemo(() => {
    const grupos = new Map<string, number[]>();
    fields.forEach((_, index) => {
      const parcelaId = watch(`detalles_cultivo.${index}.id_parcela`);
      if (parcelaId) {
        const indices = grupos.get(parcelaId) || [];
        indices.push(index);
        grupos.set(parcelaId, indices);
      }
    });
    return grupos;
  }, [fields, watch]);

  // Validación Nivel 3
  const validacionesPorParcela = useMemo(() => {
    const validaciones = new Map<string, { error: boolean; mensaje: string }>();
    parcelas.forEach((parcela) => {
      const cultivosIndices = cultivosPorParcela.get(parcela.id_parcela) || [];
      const sumaCultivos = cultivosIndices.reduce((sum, idx) => {
        const sup = watch(`detalles_cultivo.${idx}.superficie_ha`);
        return sum + (sup && !isNaN(Number(sup)) ? Number(sup) : 0);
      }, 0);
      const excede = sumaCultivos > parcela.superficie_ha;
      validaciones.set(parcela.id_parcela, {
        error: excede,
        mensaje: excede
          ? `ERROR: Los cultivos suman ${sumaCultivos.toFixed(4)} ha pero la parcela tiene ${parcela.superficie_ha.toFixed(4)} ha`
          : "",
      });
    });
    return validaciones;
  }, [parcelas, cultivosPorParcela, watch]);

  const handleAddCultivo = (parcelaId: string) => {
    append({
      id_parcela: parcelaId,
      id_tipo_cultivo: "",
      superficie_ha: 0,
      situacion_actual: "",
      procedencia_semilla: undefined,
      categoria_semilla: undefined,
      tratamiento_semillas: undefined,
      tipo_abonamiento: undefined,
      tipo_abonamiento_otro: undefined,
      metodo_aporque: undefined,
      metodo_aporque_otro: undefined,
      control_hierbas: undefined,
      control_hierbas_otro: undefined,
      metodo_cosecha: undefined,
      metodo_cosecha_otro: undefined,
    });
  };


  if (!codigoProductor) {
    return (
      <Alert type="warning" message="Primero debe seleccionar un productor en la Sección 1" />
    );
  }

  if (isLoading) {
    return <div className="p-8 text-center text-gray-600">Cargando parcelas...</div>;
  }

  if (error || parcelas.length === 0) {
    return (
      <Alert
        type="warning"
        message={error || "Este productor no tiene parcelas registradas"}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Productor: {codigoProductor}</h3>
            <p className="text-xs text-gray-600">
              {parcelas.length} parcela{parcelas.length !== 1 ? "s" : ""} • Superficie total: {superficieTotal.toFixed(2)} ha
            </p>
          </div>
        </div>
      </Card>

      {/* Por cada parcela */}
      {parcelas.map((parcela) => {
        const cultivosIndices = cultivosPorParcela.get(parcela.id_parcela) || [];
        const validacion = validacionesPorParcela.get(parcela.id_parcela);
        // Obtener índice de la parcela en parcelas_inspeccionadas
        const parcelaIdx = parcelaIndexMap.get(parcela.id_parcela);

        return (
          <Card key={parcela.id_parcela}>
            {/* Título de parcela */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold">
                Parcela {parcela.numero_parcela} - {parcela.superficie_ha.toFixed(4)} ha
              </h4>
              {validacion?.error && (
                <Alert type="error" message={validacion.mensaje} />
              )}
            </div>

            {/* SECCIÓN 1: DATOS DE LA PARCELA (UNA VEZ) */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h5 className="text-xs font-semibold text-gray-700 mb-3">Datos de la Parcela</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Fila 1: Radio buttons juntos */}
                {/* Utiliza riego */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Utiliza riego
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center text-sm">
                      <input
                        type="radio"
                        checked={parcelaIdx !== undefined ? (watch(`parcelas_inspeccionadas.${parcelaIdx}.utiliza_riego`) ?? false) : false}
                        onChange={() => {
                          if (parcelaIdx !== undefined) {
                            setValue(`parcelas_inspeccionadas.${parcelaIdx}.utiliza_riego`, true, { shouldDirty: true });
                          }
                        }}
                        className="mr-2"
                      />
                      Sí
                    </label>
                    <label className="flex items-center text-sm">
                      <input
                        type="radio"
                        checked={parcelaIdx !== undefined ? !(watch(`parcelas_inspeccionadas.${parcelaIdx}.utiliza_riego`) ?? false) : true}
                        onChange={() => {
                          if (parcelaIdx !== undefined) {
                            setValue(`parcelas_inspeccionadas.${parcelaIdx}.utiliza_riego`, false, { shouldDirty: true });
                          }
                        }}
                        className="mr-2"
                      />
                      No
                    </label>
                  </div>
                </div>

                {/* Rotación */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Rotación
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center text-sm">
                      <input
                        type="radio"
                        checked={parcelaIdx !== undefined ? (watch(`parcelas_inspeccionadas.${parcelaIdx}.rotacion`) ?? false) : false}
                        onChange={() => {
                          if (parcelaIdx !== undefined) {
                            setValue(`parcelas_inspeccionadas.${parcelaIdx}.rotacion`, true, { shouldDirty: true });
                          }
                        }}
                        className="mr-2"
                      />
                      Sí
                    </label>
                    <label className="flex items-center text-sm">
                      <input
                        type="radio"
                        checked={parcelaIdx !== undefined ? !(watch(`parcelas_inspeccionadas.${parcelaIdx}.rotacion`) ?? false) : true}
                        onChange={() => {
                          if (parcelaIdx !== undefined) {
                            setValue(`parcelas_inspeccionadas.${parcelaIdx}.rotacion`, false, { shouldDirty: true });
                          }
                        }}
                        className="mr-2"
                      />
                      No
                    </label>
                  </div>
                </div>

                {/* Fila 2: Campos de texto */}
                {/* Tipo de barrera */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tipo de barrera
                  </label>
                  <Select
                    options={[
                      { value: "ninguna", label: "Ninguna" },
                      { value: "viva", label: "Viva" },
                      { value: "muerta", label: "Muerta" },
                    ]}
                    value={parcelaIdx !== undefined ? (watch(`parcelas_inspeccionadas.${parcelaIdx}.tipo_barrera`) ?? "ninguna") : "ninguna"}
                    onChange={(value) => {
                      if (parcelaIdx !== undefined) {
                        setValue(`parcelas_inspeccionadas.${parcelaIdx}.tipo_barrera`, value as "ninguna" | "viva" | "muerta", { shouldDirty: true });
                      }
                    }}
                  />
                </div>

                {/* Insumos orgánicos */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Insumos orgánicos utilizados
                  </label>
                  <Input
                    type="text"
                    value={parcelaIdx !== undefined ? (watch(`parcelas_inspeccionadas.${parcelaIdx}.insumos_organicos`) ?? "") : ""}
                    onChange={(e) => {
                      if (parcelaIdx !== undefined) {
                        setValue(`parcelas_inspeccionadas.${parcelaIdx}.insumos_organicos`, e.target.value, { shouldDirty: true });
                      }
                    }}
                    placeholder="Ej: Compost, humus, estiércol..."
                  />
                </div>

                {/* Fila 3: Coordenadas GPS (full width) */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Coordenadas GPS
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.000001"
                      value={parcelaIdx !== undefined ? (watch(`parcelas_inspeccionadas.${parcelaIdx}.latitud_sud`) ?? "") : ""}
                      onChange={(e) => {
                        if (parcelaIdx !== undefined) {
                          const value = parseFloat(e.target.value);
                          setValue(`parcelas_inspeccionadas.${parcelaIdx}.latitud_sud`, isNaN(value) ? undefined : value, { shouldDirty: true });
                        }
                      }}
                      placeholder="Latitud"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      step="0.000001"
                      value={parcelaIdx !== undefined ? (watch(`parcelas_inspeccionadas.${parcelaIdx}.longitud_oeste`) ?? "") : ""}
                      onChange={(e) => {
                        if (parcelaIdx !== undefined) {
                          const value = parseFloat(e.target.value);
                          setValue(`parcelas_inspeccionadas.${parcelaIdx}.longitud_oeste`, isNaN(value) ? undefined : value, { shouldDirty: true });
                        }
                      }}
                      placeholder="Longitud"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      onClick={() => {
                        setShowLocationPicker((prev) => ({
                          ...prev,
                          [parcela.id_parcela]: !prev[parcela.id_parcela],
                        }));
                      }}
                    >
                      <MapPin className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* GPS Picker */}
              {showLocationPicker[parcela.id_parcela] && parcelaIdx !== undefined && (
                <div className="mt-3">
                  <LocationPicker
                    initialPosition={
                      watch(`parcelas_inspeccionadas.${parcelaIdx}.latitud_sud`) && watch(`parcelas_inspeccionadas.${parcelaIdx}.longitud_oeste`)
                        ? {
                            lat: watch(`parcelas_inspeccionadas.${parcelaIdx}.latitud_sud`)!,
                            lng: watch(`parcelas_inspeccionadas.${parcelaIdx}.longitud_oeste`)!
                          }
                        : parcela.ubicacion
                        ? { lat: parcela.ubicacion.latitude, lng: parcela.ubicacion.longitude }
                        : null
                    }
                    onLocationSelect={(pos) => {
                      if (parcelaIdx !== undefined) {
                        setValue(`parcelas_inspeccionadas.${parcelaIdx}.latitud_sud`, pos.lat, { shouldDirty: true });
                        setValue(`parcelas_inspeccionadas.${parcelaIdx}.longitud_oeste`, pos.lng, { shouldDirty: true });
                      }
                    }}
                    height="300px"
                  />
                </div>
              )}
            </div>

            {/* SECCIÓN 2: TABLA DE CULTIVOS */}
            <div>
              <h5 className="text-xs font-semibold text-gray-700 mb-2">Cultivos de la Parcela</h5>

              {/* Vista Desktop: Tabla */}
              <div className="hidden md:block">
                <table className="w-full text-sm border-collapse border">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="px-3 py-2 text-left text-xs font-medium border-r">Cultivo</th>
                      <th className="px-3 py-2 text-left text-xs font-medium border-r">Sup. (ha)</th>
                      <th className="px-3 py-2 text-left text-xs font-medium border-r">Situación actual</th>
                      <th className="px-3 py-2 text-center text-xs font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cultivosIndices.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-8 text-center text-gray-500">
                          No hay cultivos registrados. Agrega un cultivo para empezar.
                        </td>
                      </tr>
                    ) : (
                      cultivosIndices.map((index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          {/* Cultivo */}
                          <td className="px-3 py-2 border-r">
                            <TiposCultivoSelect
                              value={watch(`detalles_cultivo.${index}.id_tipo_cultivo`) || ""}
                              onChange={(value) => setValue(`detalles_cultivo.${index}.id_tipo_cultivo`, value)}
                              placeholder="Seleccionar cultivo..."
                            />
                          </td>

                          {/* Superficie */}
                          <td className="px-3 py-2 border-r">
                            <Controller
                              name={`detalles_cultivo.${index}.superficie_ha` as const}
                              control={control}
                              render={({ field: fieldProps }) => (
                                <input
                                  {...fieldProps}
                                  type="number"
                                  step="0.0001"
                                  min="0"
                                  placeholder="0.0000"
                                  className="w-full px-3 py-2 text-sm border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                                  onChange={(e) => fieldProps.onChange(parseFloat(e.target.value) || 0)}
                                />
                              )}
                            />
                          </td>

                          {/* Situación actual */}
                          <td className="px-3 py-2 border-r">
                            <Controller
                              name={`detalles_cultivo.${index}.situacion_actual` as const}
                              control={control}
                              render={({ field: fieldProps }) => (
                                <input
                                  {...fieldProps}
                                  type="text"
                                  placeholder="Ej: Producción, Madurez..."
                                  className="w-full px-3 py-2 text-sm border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                              )}
                            />
                          </td>

                          {/* Eliminar */}
                          <td className="px-3 py-2 text-center">
                            <Button
                              type="button"
                              variant="danger"
                              size="small"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Vista Móvil: Cards */}
              <div className="block md:hidden space-y-3">
                {cultivosIndices.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    No hay cultivos registrados. Agrega un cultivo para empezar.
                  </div>
                ) : (
                  cultivosIndices.map((index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white space-y-3">
                      {/* Cultivo */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Cultivo
                        </label>
                        <TiposCultivoSelect
                          value={watch(`detalles_cultivo.${index}.id_tipo_cultivo`) || ""}
                          onChange={(value) => setValue(`detalles_cultivo.${index}.id_tipo_cultivo`, value)}
                          placeholder="Seleccionar cultivo..."
                        />
                      </div>

                      {/* Superficie */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Superficie (ha)
                        </label>
                        <Controller
                          name={`detalles_cultivo.${index}.superficie_ha` as const}
                          control={control}
                          render={({ field: fieldProps }) => (
                            <input
                              {...fieldProps}
                              type="number"
                              step="0.0001"
                              min="0"
                              placeholder="0.0000"
                              className="w-full px-3 py-2 text-sm border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                              onChange={(e) => fieldProps.onChange(parseFloat(e.target.value) || 0)}
                            />
                          )}
                        />
                      </div>

                      {/* Situación actual */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Situación actual
                        </label>
                        <Controller
                          name={`detalles_cultivo.${index}.situacion_actual` as const}
                          control={control}
                          render={({ field: fieldProps }) => (
                            <input
                              {...fieldProps}
                              type="text"
                              placeholder="Ej: Producción, Madurez..."
                              className="w-full px-3 py-2 text-sm border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          )}
                        />
                      </div>

                      {/* Eliminar */}
                      <div className="pt-2">
                        <Button
                          type="button"
                          variant="danger"
                          size="small"
                          onClick={() => remove(index)}
                          className="w-full"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar cultivo
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Agregar cultivo */}
              <div className="mt-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleAddCultivo(parcela.id_parcela)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar cultivo
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
