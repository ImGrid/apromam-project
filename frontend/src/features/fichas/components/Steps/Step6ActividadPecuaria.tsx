/**
 * Step6ActividadPecuaria
 * Sección 6: Registro de actividades pecuarias
 */

import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { FormField } from "@/shared/components/ui/FormField";
import type { CreateFichaCompletaInput } from "../../types/ficha.types";

const TIPOS_GANADO = [
  { value: "mayor", label: "Mayor" },
  { value: "menor", label: "Menor" },
  { value: "aves", label: "Aves" },
] as const;

export default function Step6ActividadPecuaria() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateFichaCompletaInput>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "actividades_pecuarias",
  });

  const handleAddActividad = () => {
    append({
      tipo_ganado: "mayor",
      animal_especifico: "",
      cantidad: 0,
      sistema_manejo: "",
      uso_guano: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Sección: Actividades Pecuarias */}
      <FormSection>
        {/* Botón agregar */}
        <div className="flex justify-end mb-4">
          <Button onClick={handleAddActividad} variant="primary" size="medium">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Actividad
          </Button>
        </div>

        {/* Desktop: Tabla */}
        <div className="hidden overflow-hidden border rounded-lg md:block border-neutral-border">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-neutral-border">
                <th className="px-4 py-3 text-sm font-semibold text-left text-text-primary w-[15%]">
                  Tipo de Ganado
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-left text-text-primary border-l border-neutral-border w-[15%]">
                  Animal Específico
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-left text-text-primary border-l border-neutral-border w-[10%]">
                  Cantidad
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-left text-text-primary border-l border-neutral-border w-[20%]">
                  Sistema de Manejo
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-left text-text-primary border-l border-neutral-border w-[30%]">
                  ¿Cómo usa el Guano?
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-center text-text-primary border-l border-neutral-border w-[10%]">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {fields.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-text-secondary"
                  >
                    No hay actividades registradas. Haga clic en "Agregar Actividad" para comenzar.
                  </td>
                </tr>
              ) : (
                fields.map((field, index) => (
                  <tr
                    key={field.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      index !== fields.length - 1
                        ? "border-b border-neutral-border"
                        : ""
                    }`}
                  >
                    {/* Tipo de ganado */}
                    <td className="px-4 py-3">
                      <select
                        {...register(
                          `actividades_pecuarias.${index}.tipo_ganado` as const
                        )}
                        className="w-full px-3 py-2 text-sm border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        {TIPOS_GANADO.map((tipo) => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
                      </select>
                      {errors.actividades_pecuarias?.[index]?.tipo_ganado && (
                        <p className="mt-1 text-xs text-error">
                          {
                            errors.actividades_pecuarias[index]?.tipo_ganado
                              ?.message
                          }
                        </p>
                      )}
                    </td>

                    {/* Animal específico */}
                    <td className="px-4 py-3 border-l border-neutral-border">
                      <input
                        type="text"
                        placeholder="Ej: Vacas"
                        {...register(
                          `actividades_pecuarias.${index}.animal_especifico` as const
                        )}
                        className="w-full px-3 py-2 text-sm border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      {errors.actividades_pecuarias?.[index]
                        ?.animal_especifico && (
                        <p className="mt-1 text-xs text-error">
                          {
                            errors.actividades_pecuarias[index]
                              ?.animal_especifico?.message
                          }
                        </p>
                      )}
                    </td>

                    {/* Cantidad */}
                    <td className="px-4 py-3 border-l border-neutral-border">
                      <input
                        type="number"
                        min="0"
                        {...register(
                          `actividades_pecuarias.${index}.cantidad` as const,
                          {
                            valueAsNumber: true,
                          }
                        )}
                        className="w-full px-3 py-2 text-sm border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      {errors.actividades_pecuarias?.[index]?.cantidad && (
                        <p className="mt-1 text-xs text-error">
                          {
                            errors.actividades_pecuarias[index]?.cantidad
                              ?.message
                          }
                        </p>
                      )}
                    </td>

                    {/* Sistema de manejo */}
                    <td className="px-4 py-3 border-l border-neutral-border">
                      <input
                        type="text"
                        placeholder="Ej: Estabulado"
                        {...register(
                          `actividades_pecuarias.${index}.sistema_manejo` as const
                        )}
                        className="w-full px-3 py-2 text-sm border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      {errors.actividades_pecuarias?.[index]
                        ?.sistema_manejo && (
                        <p className="mt-1 text-xs text-error">
                          {
                            errors.actividades_pecuarias[index]?.sistema_manejo
                              ?.message
                          }
                        </p>
                      )}
                    </td>

                    {/* Uso del guano */}
                    <td className="px-4 py-3 border-l border-neutral-border">
                      <textarea
                        rows={2}
                        placeholder="Describa cómo usa el guano"
                        {...register(
                          `actividades_pecuarias.${index}.uso_guano` as const
                        )}
                        className="w-full px-3 py-2 text-sm border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      />
                      {errors.actividades_pecuarias?.[index]?.uso_guano && (
                        <p className="mt-1 text-xs text-error">
                          {
                            errors.actividades_pecuarias[index]?.uso_guano
                              ?.message
                          }
                        </p>
                      )}
                    </td>

                    {/* Acción */}
                    <td className="px-4 py-3 text-center border-l border-neutral-border">
                      <Button
                        onClick={() => remove(index)}
                        variant="danger"
                        size="small"
                        className="mx-auto"
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

        {/* Mobile: Cards */}
        <div className="space-y-4 md:hidden">
          {fields.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed rounded-lg border-neutral-border bg-neutral-bg">
              <p className="text-base text-gray-600">
                No hay actividades registradas
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Agrega actividades pecuarias para continuar
              </p>
            </div>
          ) : (
            fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 space-y-4 border rounded-lg border-neutral-border bg-white"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-border">
                  <span className="font-semibold text-text-primary">
                    Actividad #{index + 1}
                  </span>
                  <Button
                    onClick={() => remove(index)}
                    variant="danger"
                    size="small"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Eliminar
                  </Button>
                </div>

                {/* Campos */}
                <div className="space-y-3">
                  <FormField
                    label="Tipo de Ganado"
                    error={
                      errors.actividades_pecuarias?.[index]?.tipo_ganado
                        ?.message
                    }
                  >
                    <select
                      {...register(
                        `actividades_pecuarias.${index}.tipo_ganado` as const
                      )}
                      className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {TIPOS_GANADO.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField
                    label="Animal Específico"
                    error={
                      errors.actividades_pecuarias?.[index]?.animal_especifico
                        ?.message
                    }
                  >
                    <input
                      type="text"
                      placeholder="Ej: Vacas"
                      {...register(
                        `actividades_pecuarias.${index}.animal_especifico` as const
                      )}
                      className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </FormField>

                  <FormField
                    label="Cantidad"
                    error={
                      errors.actividades_pecuarias?.[index]?.cantidad?.message
                    }
                  >
                    <input
                      type="number"
                      min="0"
                      {...register(
                        `actividades_pecuarias.${index}.cantidad` as const,
                        {
                          valueAsNumber: true,
                        }
                      )}
                      className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </FormField>

                  <FormField
                    label="Sistema de Manejo"
                    error={
                      errors.actividades_pecuarias?.[index]?.sistema_manejo
                        ?.message
                    }
                  >
                    <input
                      type="text"
                      placeholder="Ej: Estabulado"
                      {...register(
                        `actividades_pecuarias.${index}.sistema_manejo` as const
                      )}
                      className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </FormField>

                  <FormField
                    label="¿Cómo usa el Guano?"
                    error={
                      errors.actividades_pecuarias?.[index]?.uso_guano?.message
                    }
                  >
                    <textarea
                      rows={3}
                      placeholder="Describa cómo usa el guano"
                      {...register(
                        `actividades_pecuarias.${index}.uso_guano` as const
                      )}
                      className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    />
                  </FormField>
                </div>
              </div>
            ))
          )}
        </div>
      </FormSection>

      {/* Campo general: Descripción uso guano */}
      <FormSection>
        <FormField
          error={errors.ficha?.descripcion_uso_guano_general?.message}
        >
          <textarea
            {...register("ficha.descripcion_uso_guano_general")}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej: En las parcelas de papa, en el almácigo, como abono en la huerta familiar..."
          />
        </FormField>
      </FormSection>
    </div>
  );
}
