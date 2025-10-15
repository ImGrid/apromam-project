/**
 * Step8CosechaVentas
 * Sección 8: Producción estimada y distribución de cosechas
 * Validación compleja: suma de destinos no debe exceder cosecha_estimada * 1.1
 */

import { useFormContext, useFieldArray } from "react-hook-form";
import {
  Plus,
  Trash2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { Alert } from "@/shared/components/ui/Alert";
import type { CreateFichaCompletaInput } from "../../types/ficha.types";

export default function Step8CosechaVentas() {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<CreateFichaCompletaInput>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "cosecha_ventas",
  });

  const handleAddCosecha = () => {
    append({
      id_tipo_cultivo: "",
      superficie_actual_ha: 0,
      cosecha_estimada_qq: 0,
      numero_parcelas: 0,
      destino_consumo_qq: 0,
      destino_semilla_qq: 0,
      destino_ventas_qq: 0,
      observaciones: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Lista de cosechas */}
      <div className="space-y-6">
        {fields.length === 0 ? (
          <Alert
            type="info"
            message={
              <p className="text-sm">
                No hay registros de cosecha. Agrega al menos un cultivo para
                continuar.
              </p>
            }
          />
        ) : (
          fields.map((field, index) => {
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
                <div className="flex items-center justify-between pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-text-primary">
                      Cultivo #{index + 1}
                    </h3>
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    size="small"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                </div>

                {/* Información del cultivo */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* ID tipo cultivo */}
                  <FormField
                    label="Tipo de Cultivo"
                    required
                    helperText="Selecciona el cultivo de la lista de cultivos registrados"
                    error={
                      errors.cosecha_ventas?.[index]?.id_tipo_cultivo?.message
                    }
                  >
                    <input
                      type="number"
                      min="1"
                      {...register(`cosecha_ventas.${index}.id_tipo_cultivo`, {
                        valueAsNumber: true,
                      })}
                      className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="ID del cultivo"
                    />
                    <p className="mt-1 text-xs text-text-secondary">
                      Nota: En una versión futura esto será un selector
                      automático
                    </p>
                  </FormField>

                  {/* Número de parcelas */}
                  <FormField
                    label="Número de Parcelas"
                    required
                    error={
                      errors.cosecha_ventas?.[index]?.numero_parcelas?.message
                    }
                  >
                    <input
                      type="number"
                      min="1"
                      step="1"
                      {...register(`cosecha_ventas.${index}.numero_parcelas`, {
                        valueAsNumber: true,
                      })}
                      className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Ej: 3"
                    />
                  </FormField>
                </div>

                {/* Superficie y cosecha */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Superficie actual */}
                  <FormField
                    label="Superficie Actual (ha)"
                    required
                    error={
                      errors.cosecha_ventas?.[index]?.superficie_actual_ha
                        ?.message
                    }
                  >
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      {...register(
                        `cosecha_ventas.${index}.superficie_actual_ha`,
                        {
                          valueAsNumber: true,
                        }
                      )}
                      className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Ej: 2.5"
                    />
                  </FormField>

                  {/* Cosecha estimada */}
                  <FormField
                    label="Cosecha Estimada (qq)"
                    required
                    helperText="1 quintal (qq) = 46 kg"
                    error={
                      errors.cosecha_ventas?.[index]?.cosecha_estimada_qq
                        ?.message
                    }
                  >
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      {...register(
                        `cosecha_ventas.${index}.cosecha_estimada_qq`,
                        {
                          valueAsNumber: true,
                        }
                      )}
                      className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
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
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        {...register(
                          `cosecha_ventas.${index}.destino_consumo_qq`,
                          {
                            valueAsNumber: true,
                          }
                        )}
                        className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
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
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        {...register(
                          `cosecha_ventas.${index}.destino_semilla_qq`,
                          {
                            valueAsNumber: true,
                          }
                        )}
                        className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
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
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        {...register(
                          `cosecha_ventas.${index}.destino_ventas_qq`,
                          {
                            valueAsNumber: true,
                          }
                        )}
                        className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
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
                                La suma de destinos excede el 110% de la cosecha
                                estimada. Por favor, verifica los valores.
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
                                Distribución correcta. Los valores están dentro
                                del rango esperado.
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
                                  La distribución parece incompleta (
                                  {porcentajeDistribucion.toFixed(1)}%).
                                  Verifica si falta distribuir parte de la
                                  cosecha.
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
                  helperText="Información adicional sobre esta cosecha"
                  error={errors.cosecha_ventas?.[index]?.observaciones?.message}
                >
                  <textarea
                    {...register(`cosecha_ventas.${index}.observaciones`)}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ej: Parte de la cosecha se perdió por sequía..."
                  />
                </FormField>
              </div>
            );
          })
        )}
      </div>

      {/* Botón agregar cosecha */}
      <div className="flex justify-center pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={handleAddCosecha}
          className="w-full sm:w-auto"
        >
          <Plus className="w-5 h-5 mr-2" />
          Agregar Cultivo
        </Button>
      </div>
    </div>
  );
}
