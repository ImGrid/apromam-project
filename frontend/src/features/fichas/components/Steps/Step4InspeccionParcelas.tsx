/**
 * Step4InspeccionParcelas
 * Sección 4: Registro de inspección de parcelas certificables
 *
 * ESTRUCTURA CORRECTA:
 * - Campos de PARCELA aparecen UNA VEZ por parcela (situación, riego, barreras, rotación, coordenadas, insumos orgánicos)
 * - Campos de CULTIVO aparecen en cada fila de la tabla (tipo cultivo, superficie)
 */

import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus, Trash2, MapPin } from "lucide-react";
import { useState, useMemo } from "react";
import { Card, Alert, Button, Input, Select } from "@/shared/components/ui";
import { TiposCultivoSelect } from "@/features/catalogos/components/TiposCultivoSelect";
import { LocationPicker } from "@/shared/components/maps";
import { useProductorParcelas } from "@/features/productores/hooks/useProductorParcelas";
import { parcelasService } from "@/features/parcelas";
import type { CreateFichaCompletaInput } from "../../types/ficha.types";

export default function Step4InspeccionParcelas() {
  const { register, control, watch, setValue, formState: { errors } } = useFormContext<CreateFichaCompletaInput>();
  const { fields, append, remove } = useFieldArray({ control, name: "detalles_cultivo" });

  const [showLocationPicker, setShowLocationPicker] = useState<{ [key: string]: boolean }>({});
  const [parcelaData, setParcelaData] = useState<{
    [key: string]: {
      latitud_sud?: number;
      longitud_oeste?: number;
      utiliza_riego?: boolean;
      tipo_barrera?: "ninguna" | "viva" | "muerta";
      insumos_organicos?: string;
      rotacion?: boolean;
    };
  }>({});

  const codigoProductor = watch("ficha.codigo_productor");
  const { parcelas, superficieTotal, isLoading, error } = useProductorParcelas(codigoProductor);

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
      tratamiento_semillas_otro: undefined,
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

  const handleUpdateParcela = async (parcelaId: string) => {
    const data = parcelaData[parcelaId];
    if (!data) return;
    try {
      await parcelasService.updateParcela(parcelaId, {
        coordenadas: data.latitud_sud && data.longitud_oeste ? {
          latitud: data.latitud_sud,
          longitud: data.longitud_oeste,
        } : undefined,
        utiliza_riego: data.utiliza_riego,
        tipo_barrera: data.tipo_barrera,
        insumos_organicos: data.insumos_organicos,
        rotacion: data.rotacion,
      });
      window.location.reload();
    } catch (error) {
      console.error("Error al actualizar parcela:", error);
    }
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
        const currentData = parcelaData[parcela.id_parcela] || {};

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

                {/* Utiliza riego */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Utiliza riego
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center text-sm">
                      <input
                        type="radio"
                        checked={currentData.utiliza_riego ?? parcela.utiliza_riego ?? false}
                        onChange={() => {
                          setParcelaData((prev) => ({
                            ...prev,
                            [parcela.id_parcela]: { ...prev[parcela.id_parcela], utiliza_riego: true },
                          }));
                        }}
                        className="mr-2"
                      />
                      Sí
                    </label>
                    <label className="flex items-center text-sm">
                      <input
                        type="radio"
                        checked={!(currentData.utiliza_riego ?? parcela.utiliza_riego ?? false)}
                        onChange={() => {
                          setParcelaData((prev) => ({
                            ...prev,
                            [parcela.id_parcela]: { ...prev[parcela.id_parcela], utiliza_riego: false },
                          }));
                        }}
                        className="mr-2"
                      />
                      No
                    </label>
                  </div>
                </div>

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
                    value={currentData.tipo_barrera ?? parcela.tipo_barrera ?? "ninguna"}
                    onChange={(value) => {
                      setParcelaData((prev) => ({
                        ...prev,
                        [parcela.id_parcela]: {
                          ...prev[parcela.id_parcela],
                          tipo_barrera: value as "ninguna" | "viva" | "muerta",
                        },
                      }));
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
                    value={currentData.insumos_organicos ?? parcela.insumos_organicos ?? ""}
                    onChange={(e) => {
                      setParcelaData((prev) => ({
                        ...prev,
                        [parcela.id_parcela]: {
                          ...prev[parcela.id_parcela],
                          insumos_organicos: e.target.value,
                        },
                      }));
                    }}
                    placeholder="Ej: Compost, humus, estiércol..."
                  />
                </div>

                {/* Rotación */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Rotación
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center text-sm">
                      <input
                        type="radio"
                        checked={currentData.rotacion ?? parcela.rotacion ?? false}
                        onChange={() => {
                          setParcelaData((prev) => ({
                            ...prev,
                            [parcela.id_parcela]: { ...prev[parcela.id_parcela], rotacion: true },
                          }));
                        }}
                        className="mr-2"
                      />
                      Sí
                    </label>
                    <label className="flex items-center text-sm">
                      <input
                        type="radio"
                        checked={!(currentData.rotacion ?? parcela.rotacion ?? false)}
                        onChange={() => {
                          setParcelaData((prev) => ({
                            ...prev,
                            [parcela.id_parcela]: { ...prev[parcela.id_parcela], rotacion: false },
                          }));
                        }}
                        className="mr-2"
                      />
                      No
                    </label>
                  </div>
                </div>

                {/* Coordenadas */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Coordenadas GPS
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.000001"
                      value={currentData.latitud_sud ?? parcela.latitud_sud ?? ""}
                      onChange={(e) => {
                        setParcelaData((prev) => ({
                          ...prev,
                          [parcela.id_parcela]: {
                            ...prev[parcela.id_parcela],
                            latitud_sud: parseFloat(e.target.value) || undefined,
                          },
                        }));
                      }}
                      placeholder="Latitud"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      step="0.000001"
                      value={currentData.longitud_oeste ?? parcela.longitud_oeste ?? ""}
                      onChange={(e) => {
                        setParcelaData((prev) => ({
                          ...prev,
                          [parcela.id_parcela]: {
                            ...prev[parcela.id_parcela],
                            longitud_oeste: parseFloat(e.target.value) || undefined,
                          },
                        }));
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
              {showLocationPicker[parcela.id_parcela] && (
                <div className="mt-3">
                  <LocationPicker
                    initialPosition={
                      currentData.latitud_sud && currentData.longitud_oeste
                        ? { lat: currentData.latitud_sud, lng: currentData.longitud_oeste }
                        : parcela.coordenadas
                        ? { lat: parcela.coordenadas.latitude, lng: parcela.coordenadas.longitude }
                        : null
                    }
                    onLocationSelect={(pos) => {
                      setParcelaData((prev) => ({
                        ...prev,
                        [parcela.id_parcela]: {
                          ...prev[parcela.id_parcela],
                          latitud_sud: pos.lat,
                          longitud_oeste: pos.lng,
                        },
                      }));
                    }}
                    height="300px"
                  />
                </div>
              )}

              {/* Guardar datos de parcela */}
              {parcelaData[parcela.id_parcela] && (
                <div className="mt-3">
                  <Button
                    type="button"
                    variant="primary"
                    size="small"
                    onClick={() => handleUpdateParcela(parcela.id_parcela)}
                  >
                    Guardar datos de parcela
                  </Button>
                </div>
              )}
            </div>

            {/* SECCIÓN 2: TABLA DE CULTIVOS */}
            <div>
              <h5 className="text-xs font-semibold text-gray-700 mb-2">Cultivos de la Parcela</h5>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border-collapse border">
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
                            <Input
                              type="number"
                              step="0.0001"
                              min="0"
                              {...register(`detalles_cultivo.${index}.superficie_ha`, { valueAsNumber: true })}
                              placeholder="0.0000"
                            />
                          </td>

                          {/* Situación actual */}
                          <td className="px-3 py-2 border-r">
                            <Input
                              type="text"
                              {...register(`detalles_cultivo.${index}.situacion_actual`)}
                              placeholder="Ej: Producción, Madurez..."
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
