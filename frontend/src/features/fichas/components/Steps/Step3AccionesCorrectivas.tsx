/**
 * Step3AccionesCorrectivas
 * Sección 3: Seguimiento de implementación acciones correctivas (gestión anterior)
 */

import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { FormField } from "@/shared/components/ui/FormField";
import type { CreateFichaCompletaInput } from "../../types/ficha.types";

export default function Step3AccionesCorrectivas() {
  const {
    register,
    control,
    formState: { errors, isSubmitting },
  } = useFormContext<CreateFichaCompletaInput>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "acciones_correctivas",
  });

  const handleAddAccion = () => {
    append({
      numero_accion: fields.length + 1,
      descripcion_accion: "",
      implementacion_descripcion: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Sección: Acciones Correctivas */}
      <FormSection>
        {/* Botón agregar */}
        <div className="flex justify-end mb-4">
          <Button type="button" onClick={handleAddAccion} variant="primary" size="medium">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Acción
          </Button>
        </div>

        {/* Desktop: Tabla */}
        <div className="hidden overflow-hidden border rounded-lg md:block border-neutral-border">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-border">
                <th className="px-4 py-3 text-sm font-semibold text-center text-text-primary w-[10%]">
                  No
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-left text-text-primary border-l border-neutral-border w-[45%]">
                  Acción correctiva
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-left text-text-primary border-l border-neutral-border w-[35%]">
                  Implementación
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
                    colSpan={4}
                    className="px-4 py-8 text-center text-text-secondary"
                  >
                    No hay acciones correctivas registradas. Haga clic en "Agregar Acción" si el productor tiene pendientes.
                  </td>
                </tr>
              ) : (
                fields.map((field, index) => (
                  <tr
                    key={field.id}
                    className={`hover:bg-neutral-50 transition-colors ${
                      index !== fields.length - 1
                        ? "border-b border-neutral-border"
                        : ""
                    }`}
                  >
                    {/* Número (automático, no editable) */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center w-8 h-8 mx-auto font-semibold rounded-full bg-primary/10 text-primary">
                        {index + 1}
                      </div>
                      {/* Campo oculto para mantener el valor */}
                      <input
                        type="hidden"
                        {...register(
                          `acciones_correctivas.${index}.numero_accion` as const,
                          {
                            valueAsNumber: true,
                          }
                        )}
                        value={index + 1}
                      />
                    </td>

                    {/* Descripción de la acción */}
                    <td className="px-4 py-3 border-l border-neutral-border">
                      <Controller
                        name={`acciones_correctivas.${index}.descripcion_accion` as const}
                        control={control}
                        render={({ field: fieldProps }) => (
                          <textarea
                            {...fieldProps}
                            rows={2}
                            autoComplete="off"
                            spellCheck={false}
                            placeholder="Ej: Mejorar el sistema de almacenamiento de insumos orgánicos"
                            className="w-full px-3 py-2 text-sm border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                          />
                        )}
                      />
                      {errors.acciones_correctivas?.[index]
                        ?.descripcion_accion && (
                        <p className="mt-1 text-xs text-error">
                          {
                            errors.acciones_correctivas[index]
                              ?.descripcion_accion?.message
                          }
                        </p>
                      )}
                    </td>

                    {/* Implementación */}
                    <td className="px-4 py-3 border-l border-neutral-border">
                      <Controller
                        name={`acciones_correctivas.${index}.implementacion_descripcion` as const}
                        control={control}
                        render={({ field: fieldProps }) => (
                          <textarea
                            {...fieldProps}
                            rows={2}
                            autoComplete="off"
                            spellCheck={false}
                            placeholder="Ej: Se construyó un almacén techado"
                            className="w-full px-3 py-2 text-sm border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                          />
                        )}
                      />
                      {errors.acciones_correctivas?.[index]
                        ?.implementacion_descripcion && (
                        <p className="mt-1 text-xs text-error">
                          {
                            errors.acciones_correctivas[index]
                              ?.implementacion_descripcion?.message
                          }
                        </p>
                      )}
                    </td>

                    {/* Acción */}
                    <td className="px-4 py-3 text-center border-l border-neutral-border">
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          remove(index);
                        }}
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
              <p className="text-base text-text-secondary">
                No hay acciones correctivas registradas
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Agrega acciones correctivas si el productor tiene pendientes
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
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 font-semibold rounded-full bg-primary/10 text-primary">
                      {index + 1}
                    </div>
                    <span className="font-semibold text-text-primary">
                      Acción Correctiva
                    </span>
                  </div>
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      remove(index);
                    }}
                    variant="danger"
                    size="small"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Eliminar
                  </Button>
                </div>

                {/* Campo oculto para numero_accion */}
                <input
                  type="hidden"
                  {...register(
                    `acciones_correctivas.${index}.numero_accion` as const,
                    {
                      valueAsNumber: true,
                    }
                  )}
                  value={index + 1}
                />

                {/* Campos */}
                <div className="space-y-3">
                  <FormField
                    label="Acción correctiva"
                    required
                    error={
                      errors.acciones_correctivas?.[index]?.descripcion_accion
                        ?.message
                    }
                  >
                    <Controller
                      name={`acciones_correctivas.${index}.descripcion_accion` as const}
                      control={control}
                      render={({ field: fieldProps }) => (
                        <textarea
                          {...fieldProps}
                          rows={3}
                          autoComplete="off"
                          spellCheck={false}
                          placeholder="Ej: Mejorar el sistema de almacenamiento de insumos orgánicos"
                          className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        />
                      )}
                    />
                  </FormField>

                  <FormField
                    label="Implementación"
                    error={
                      errors.acciones_correctivas?.[index]
                        ?.implementacion_descripcion?.message
                    }
                  >
                    <Controller
                      name={`acciones_correctivas.${index}.implementacion_descripcion` as const}
                      control={control}
                      render={({ field: fieldProps }) => (
                        <textarea
                          {...fieldProps}
                          rows={3}
                          autoComplete="off"
                          spellCheck={false}
                          placeholder="Ej: Se construyó un almacén techado"
                          className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        />
                      )}
                    />
                  </FormField>
                </div>
              </div>
            ))
          )}
        </div>
      </FormSection>
    </div>
  );
}
