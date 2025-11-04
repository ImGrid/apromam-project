/**
 * Step8CosechaVentas
 * Sección 8: Producción estimada y distribución de cosechas
 * Validación compleja: suma de destinos no debe exceder cosecha_estimada * 1.1
 */

import { useFormContext, useFieldArray } from "react-hook-form";
import {
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { FormField } from "@/shared/components/ui/FormField";
import { Alert } from "@/shared/components/ui/Alert";
import { Input } from "@/shared/components/ui/Input";
import { SimpleRadioGroup } from "../Specialized/SimpleRadioGroup";
import type { CreateFichaCompletaInput } from "../../types/ficha.types";

export default function Step8CosechaVentas() {
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateFichaCompletaInput>();

  const { fields } = useFieldArray({
    control,
    name: "cosecha_ventas",
  });

  return (
    <div className="space-y-6">
      {/* Formulario de cosecha (siempre visible) */}
      {fields.map((field, index) => {
            // Watch campos numéricos para validación
            const cosechaEstimada =
              watch(`cosecha_ventas.${index}.cosecha_estimada_qq`) || 0;
            const destinoConsumo =
              watch(`cosecha_ventas.${index}.destino_consumo_qq`) || 0;
            const destinoSemilla =
              watch(`cosecha_ventas.${index}.destino_semilla_qq`) || 0;
            const destinoVentas =
              watch(`cosecha_ventas.${index}.destino_ventas_qq`) || 0;

            // Calcular totales y validación
            const totalDestinos =
              destinoConsumo + destinoSemilla + destinoVentas;
            const porcentajeDistribucion =
              cosechaEstimada > 0 ? (totalDestinos / cosechaEstimada) * 100 : 0;
            const excedeLimite = porcentajeDistribucion > 110;
            const distribuidoCompleto =
              porcentajeDistribucion >= 95 && porcentajeDistribucion <= 110;

            return (
              <div
                key={field.id}
                className="p-6 space-y-4 bg-white border rounded-lg border-neutral-border"
              >
                {/* Header del cultivo */}
                <div className="flex items-center gap-2 pb-3 border-b">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-text-primary">
                    Producción y Distribución de Maní
                  </h3>
                </div>

                {/* Información del cultivo - Grid compacto */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Tipo de Maní */}
                  <FormField
                    label="Tipo de Maní"
                    required
                    error={
                      errors.cosecha_ventas?.[index]?.tipo_mani?.message
                    }
                  >
                    <SimpleRadioGroup
                      name={`cosecha_ventas.${index}.tipo_mani`}
                      value={watch(`cosecha_ventas.${index}.tipo_mani`) || "ecologico"}
                      onChange={(value) =>
                        setValue(`cosecha_ventas.${index}.tipo_mani`, value as "ecologico" | "transicion", {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                      options={[
                        { value: "ecologico", label: "Ecológico" },
                        { value: "transicion", label: "En Transición" },
                      ]}
                      required
                      error={errors.cosecha_ventas?.[index]?.tipo_mani?.message}
                      layout="horizontal"
                    />
                  </FormField>

                  {/* Número de parcelas */}
                  <FormField
                    label="Número de Parcelas"
                    required
                    error={
                      errors.cosecha_ventas?.[index]?.numero_parcelas?.message
                    }
                  >
                    <Input
                      inputType="number"
                      min={1}
                      step={1}
                      {...register(`cosecha_ventas.${index}.numero_parcelas`, {
                        valueAsNumber: true,
                      })}
                      placeholder="Ej: 3"
                    />
                  </FormField>

                  {/* Superficie actual */}
                  <FormField
                    label="Superficie Actual (ha)"
                    required
                    error={
                      errors.cosecha_ventas?.[index]?.superficie_actual_ha
                        ?.message
                    }
                  >
                    <Input
                      inputType="number"
                      min={0}
                      step={0.01}
                      {...register(
                        `cosecha_ventas.${index}.superficie_actual_ha`,
                        {
                          valueAsNumber: true,
                        }
                      )}
                      placeholder="Ej: 2.5"
                    />
                  </FormField>

                  {/* Cosecha estimada */}
                  <FormField
                    label="Cosecha Estimada (qq)"
                    required
                    error={
                      errors.cosecha_ventas?.[index]?.cosecha_estimada_qq
                        ?.message
                    }
                  >
                    <Input
                      inputType="number"
                      min={0}
                      step={0.1}
                      {...register(
                        `cosecha_ventas.${index}.cosecha_estimada_qq`,
                        {
                          valueAsNumber: true,
                        }
                      )}
                      placeholder="Ej: 120"
                    />
                  </FormField>
                </div>

                {/* Distribución de la cosecha */}
                <div className="p-4 rounded-lg bg-primary/5">
                  <h4 className="mb-3 text-sm font-semibold text-text-primary">
                    Distribución de la Cosecha (qq)
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Destino consumo */}
                    <FormField
                      label="Consumo Propio"
                      required
                      error={
                        errors.cosecha_ventas?.[index]?.destino_consumo_qq
                          ?.message
                      }
                    >
                      <Input
                        inputType="number"
                        min={0}
                        step={0.1}
                        {...register(
                          `cosecha_ventas.${index}.destino_consumo_qq`,
                          {
                            valueAsNumber: true,
                          }
                        )}
                        placeholder="0"
                      />
                    </FormField>

                    {/* Destino semilla */}
                    <FormField
                      label="Semilla"
                      required
                      error={
                        errors.cosecha_ventas?.[index]?.destino_semilla_qq
                          ?.message
                      }
                    >
                      <Input
                        inputType="number"
                        min={0}
                        step={0.1}
                        {...register(
                          `cosecha_ventas.${index}.destino_semilla_qq`,
                          {
                            valueAsNumber: true,
                          }
                        )}
                        placeholder="0"
                      />
                    </FormField>

                    {/* Destino ventas */}
                    <FormField
                      label="Ventas"
                      required
                      error={
                        errors.cosecha_ventas?.[index]?.destino_ventas_qq
                          ?.message
                      }
                    >
                      <Input
                        inputType="number"
                        min={0}
                        step={0.1}
                        {...register(
                          `cosecha_ventas.${index}.destino_ventas_qq`,
                          {
                            valueAsNumber: true,
                          }
                        )}
                        placeholder="0"
                      />
                    </FormField>
                  </div>

                  {/* Resumen de distribución */}
                  <div className="p-3 mt-4 rounded-md bg-white/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-text-secondary">
                        Total distribuido:
                      </span>
                      <span className="font-bold text-text-primary">
                        {totalDestinos.toFixed(1)} qq
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-sm">
                      <span className="font-medium text-text-secondary">
                        Cosecha estimada:
                      </span>
                      <span className="font-bold text-text-primary">
                        {cosechaEstimada.toFixed(1)} qq
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 mt-2 border-t">
                      <span className="font-medium text-text-secondary">
                        Porcentaje distribuido:
                      </span>
                      <span
                        className={`font-bold ${
                          excedeLimite
                            ? "text-error"
                            : distribuidoCompleto
                            ? "text-success"
                            : "text-warning"
                        }`}
                      >
                        {porcentajeDistribucion.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Validación visual */}
                  {cosechaEstimada > 0 && (
                    <>
                      {excedeLimite && (
                        <Alert
                          type="error"
                          message={
                            <div className="flex items-start">
                              <AlertCircle className="w-4 h-4 mt-0.5" />
                              <p className="ml-2 text-sm">
                                Excede el 110% de la cosecha estimada
                              </p>
                            </div>
                          }
                        />
                      )}
                      {distribuidoCompleto && (
                        <Alert
                          type="success"
                          message={
                            <div className="flex items-start">
                              <CheckCircle className="w-4 h-4 mt-0.5" />
                              <p className="ml-2 text-sm">
                                Distribución correcta
                              </p>
                            </div>
                          }
                        />
                      )}
                      {!excedeLimite &&
                        !distribuidoCompleto &&
                        porcentajeDistribucion < 95 &&
                        totalDestinos > 0 && (
                          <Alert
                            type="warning"
                            message={
                              <div className="flex items-start">
                                <AlertCircle className="w-4 h-4 mt-0.5" />
                                <p className="ml-2 text-sm">
                                  Distribución incompleta ({porcentajeDistribucion.toFixed(1)}%)
                                </p>
                              </div>
                            }
                          />
                        )}
                    </>
                  )}
                </div>

                {/* Observaciones */}
                <FormField
                  label="Observaciones"
                  error={errors.cosecha_ventas?.[index]?.observaciones?.message}
                >
                  <textarea
                    {...register(`cosecha_ventas.${index}.observaciones`)}
                    rows={2}
                    className="w-full min-h-[48px] px-4 py-3 text-base border rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 border-neutral-border focus:ring-primary focus:border-primary"
                    placeholder="Opcional"
                  />
                </FormField>
              </div>
            );
          })}
    </div>
  );
}
