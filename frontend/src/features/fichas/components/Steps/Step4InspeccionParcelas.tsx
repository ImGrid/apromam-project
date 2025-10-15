/**
 * Step4InspeccionParcelas
 * Sección 4: Registro de inspección de parcelas certificables
 *
 * MODELO CORRECTO:
 * - Las parcelas NO tienen superficie fija
 * - La superficie se define por cultivo
 * - Validación: suma_total_cultivos <= superficie_total_productor
 * - Diseño compacto similar al documento oficial
 */

import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus, Trash2, MapPin } from "lucide-react";
import { useMemo } from "react";
import { FormSection } from "@/shared/components/ui/FormSection";
import { FormField } from "@/shared/components/ui/FormField";
import { Button } from "@/shared/components/ui/Button";
import { Accordion } from "@/shared/components/ui/Accordion";
import { Alert } from "@/shared/components/ui/Alert";
import { Radio } from "@/shared/components/ui/Radio";
import { TiposCultivoSelect } from "@/features/catalogos/components/TiposCultivoSelect";
import { useProductorParcelas } from "@/features/productores/hooks/useProductorParcelas";
import type { CreateFichaCompletaInput } from "../../types/ficha.types";

export default function Step4InspeccionParcelas() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateFichaCompletaInput>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "detalles_cultivo",
  });

  const codigoProductor = watch("ficha.codigo_productor");
  const { parcelas, superficieTotal, isLoading, error } =
    useProductorParcelas(codigoProductor);

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
  // Agregar cultivo a una parcela específica
  const handleAddCultivoAParcela = (parcelaId: string) => {
    append({
      id_parcela: parcelaId,
      id_tipo_cultivo: "",
      superficie_ha: 0,
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
      rotacion: false,
      insumos_organicos_usados: "",
    });
  };

  if (!codigoProductor) {
    return (
      <FormSection>
        <Alert
          type="warning"
          message="Primero debe seleccionar un productor en la Sección 1 (Datos Generales)"
        />
      </FormSection>
    );
  }

  if (isLoading) {
    return (
      <FormSection>
        <div className="p-8 text-center">
          <p className="text-gray-600">Cargando parcelas del productor...</p>
        </div>
      </FormSection>
    );
  }

  if (error || parcelas.length === 0) {
    return (
      <FormSection>
        <Alert
          type="warning"
          message={
            error ||
            "Este productor no tiene parcelas registradas. Debe crear las parcelas primero."
          }
        />
      </FormSection>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header compacto */}
      <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Productor: {codigoProductor}
            </p>
            <p className="text-xs text-blue-700">
              {parcelas.length} parcela{parcelas.length !== 1 ? "s" : ""} •
              Superficie total: {superficieTotal.toFixed(2)} ha
            </p>
          </div>
        </div>
      </div>

      <FormSection>
        <div className="space-y-3">
          {parcelas.map((parcela) => {
            const cultivosIndices =
              cultivosPorParcela.get(parcela.id_parcela) || [];
            const superficieParcela = cultivosIndices.reduce((sum, idx) => {
              const sup = watch(`detalles_cultivo.${idx}.superficie_ha`);
              return sum + (sup && !isNaN(Number(sup)) ? Number(sup) : 0);
            }, 0);

            return (
              <Accordion
                key={parcela.id_parcela}
                title={`Parcela ${parcela.numero_parcela}${
                  parcela.utiliza_riego ? " • Con riego" : ""
                }${
                  superficieParcela > 0
                    ? ` • ${superficieParcela.toFixed(2)} ha cultivadas`
                    : ""
                }`}
                defaultOpen={true}
              >
                <div className="p-3 space-y-4">
                  {/* DATOS DE LA PARCELA - Read-only, datos precargados */}
                  <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <h4 className="mb-3 text-sm font-semibold text-gray-700">
                      Características de la Parcela (datos precargados)
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                      {/* Situación actual */}
                      <div>
                        <p className="mb-1 text-xs text-gray-600">
                          Situación actual:
                        </p>
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                            parcela.situacion_cumple
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {parcela.situacion_cumple ? "Cumple" : "No cumple"}
                        </span>
                      </div>

                      {/* Utiliza riego */}
                      <div>
                        <p className="mb-1 text-xs text-gray-600">
                          Utiliza riego:
                        </p>
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                            parcela.utiliza_riego
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {parcela.utiliza_riego ? "Sí" : "No"}
                        </span>
                      </div>

                      {/* Barreras de protección */}
                      <div>
                        <p className="mb-1 text-xs text-gray-600">Barreras:</p>
                        <span className="inline-block px-2 py-1 text-xs font-medium text-purple-800 capitalize bg-purple-100 rounded">
                          {parcela.tipo_barrera === "ninguna"
                            ? "Ninguna"
                            : parcela.tipo_barrera === "viva"
                            ? "Viva"
                            : "Muerta"}
                        </span>
                      </div>

                      {/* Coordenadas */}
                      <div>
                        <p className="mb-1 text-xs text-gray-600">
                          <MapPin className="inline w-3 h-3 mr-1" />
                          Coordenadas GPS:
                        </p>
                        {parcela.coordenadas ? (
                          <div className="text-xs text-gray-700">
                            <div>
                              Lat: {parcela.coordenadas.latitude.toFixed(6)}
                            </div>
                            <div>
                              Long: {parcela.coordenadas.longitude.toFixed(6)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">Sin GPS</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* LISTA DE CULTIVOS - Diseño tabla compacta */}
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">
                      Cultivos en esta parcela
                    </h4>

                    {cultivosIndices.length === 0 ? (
                      <div className="p-4 text-center border-2 border-gray-300 border-dashed rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-600">
                          No hay cultivos registrados
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {cultivosIndices.map((index, i) => (
                          <div
                            key={index}
                            className="p-3 bg-white border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-semibold text-gray-600">
                                Cultivo {i + 1}
                              </span>
                              <Button
                                onClick={() => remove(index)}
                                variant="danger"
                                size="small"
                                type="button"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                              {/* Cultivo */}
                              <FormField
                                label="Cultivo"
                                required
                                error={
                                  errors.detalles_cultivo?.[index]
                                    ?.id_tipo_cultivo?.message
                                }
                              >
                                <TiposCultivoSelect
                                  value={
                                    watch(
                                      `detalles_cultivo.${index}.id_tipo_cultivo`
                                    ) || ""
                                  }
                                  onChange={(value) =>
                                    setValue(
                                      `detalles_cultivo.${index}.id_tipo_cultivo`,
                                      value
                                    )
                                  }
                                  placeholder="Seleccionar..."
                                />
                              </FormField>

                              {/* Superficie */}
                              <FormField
                                label="Sup. (ha)"
                                required
                                error={
                                  errors.detalles_cultivo?.[index]
                                    ?.superficie_ha?.message
                                }
                              >
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...register(
                                    `detalles_cultivo.${index}.superficie_ha`,
                                    { valueAsNumber: true }
                                  )}
                                  className="w-full px-2 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-primary"
                                  placeholder="0.00"
                                />
                              </FormField>

                              {/* Rotación */}
                              <FormField label="Rotación">
                                <div className="flex gap-2 mt-1">
                                  <Radio
                                    label="Sí"
                                    value="true"
                                    checked={
                                      watch(
                                        `detalles_cultivo.${index}.rotacion`
                                      ) === true
                                    }
                                    onChange={() =>
                                      setValue(
                                        `detalles_cultivo.${index}.rotacion`,
                                        true
                                      )
                                    }
                                  />
                                  <Radio
                                    label="No"
                                    value="false"
                                    checked={
                                      watch(
                                        `detalles_cultivo.${index}.rotacion`
                                      ) === false
                                    }
                                    onChange={() =>
                                      setValue(
                                        `detalles_cultivo.${index}.rotacion`,
                                        false
                                      )
                                    }
                                  />
                                </div>
                              </FormField>

                              {/* Insumos orgánicos - full width */}
                              <div className="md:col-span-4">
                                <FormField label="¿Utiliza insumos orgánicos? Cuáles:">
                                  <input
                                    type="text"
                                    {...register(
                                      `detalles_cultivo.${index}.insumos_organicos_usados`
                                    )}
                                    className="w-full px-2 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-primary"
                                    placeholder="Ej: Compost, humus de lombriz, bocashi..."
                                  />
                                </FormField>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Botón agregar cultivo - más compacto */}
                    <Button
                      onClick={() =>
                        handleAddCultivoAParcela(parcela.id_parcela)
                      }
                      variant="secondary"
                      size="small"
                      type="button"
                      className="w-full mt-2"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar cultivo
                    </Button>
                  </div>
                </div>
              </Accordion>
            );
          })}
        </div>
      </FormSection>
    </div>
  );
}
