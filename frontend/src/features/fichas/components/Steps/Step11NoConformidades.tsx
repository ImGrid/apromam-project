/**
 * Step11NoConformidades
 * Sección 11: Registro de no conformidades detectadas durante la inspección
 * Usa useFieldArray para lista dinámica de no conformidades
 */

import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { Alert } from "@/shared/components/ui/Alert";
import type { CreateFichaCompletaInput } from "../../types/ficha.types";

export default function Step11NoConformidades() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<CreateFichaCompletaInput>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "no_conformidades",
  });

  const handleAddNoConformidad = () => {
    append({
      descripcion_no_conformidad: "",
      accion_correctiva_propuesta: "",
      fecha_limite_implementacion: "",
      estado_conformidad: "Detectado",
    });
  };

  return (
    <div className="space-y-6">
      {/* Lista de no conformidades */}
      <div className="space-y-4">
        {fields.length === 0 ? (
          <Alert
            type="success"
            message={
              <p className="text-sm">
                No hay no conformidades registradas. Si la inspección no reveló
                incumplimientos, puedes continuar al siguiente paso.
              </p>
            }
          />
        ) : (
          fields.map((field, index) => (
            <div
              key={field.id}
              className="p-6 space-y-4 border rounded-lg bg-error/5 border-error/20"
            >
              {/* Header de la no conformidad */}
              <div className="flex items-center justify-between pb-3 border-b border-error/20">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-error" />
                  <h3 className="text-lg font-semibold text-text-primary">
                    No Conformidad #{index + 1}
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

              {/* Descripción de la no conformidad */}
              <FormField
                label="Descripción de la No Conformidad"
                required
                helperText="Describe claramente el incumplimiento detectado (mínimo 5 caracteres)"
                error={
                  errors.no_conformidades?.[index]?.descripcion_no_conformidad
                    ?.message
                }
              >
                <textarea
                  {...register(
                    `no_conformidades.${index}.descripcion_no_conformidad`
                  )}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ej: Se detectó almacenamiento de fertilizantes convencionales cerca del área de producción orgánica..."
                />
              </FormField>

              {/* Acción correctiva propuesta */}
              <FormField
                label="Acción Correctiva Propuesta"
                required
                helperText="Propón una solución específica para resolver esta no conformidad"
                error={
                  errors.no_conformidades?.[index]?.accion_correctiva_propuesta
                    ?.message
                }
              >
                <textarea
                  {...register(
                    `no_conformidades.${index}.accion_correctiva_propuesta`
                  )}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ej: Retirar inmediatamente los fertilizantes convencionales y establecer una zona de almacenamiento separada con distancia mínima de 50m..."
                />
              </FormField>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Fecha límite */}
                <FormField
                  label="Fecha Límite de Implementación"
                  helperText="Fecha máxima para resolver la no conformidad"
                  error={
                    errors.no_conformidades?.[index]
                      ?.fecha_limite_implementacion?.message
                  }
                >
                  <input
                    type="date"
                    {...register(
                      `no_conformidades.${index}.fecha_limite_implementacion`
                    )}
                    className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </FormField>

                {/* Estado de conformidad */}
                <FormField
                  label="Estado"
                  error={
                    errors.no_conformidades?.[index]?.estado_conformidad
                      ?.message
                  }
                >
                  <select
                    {...register(
                      `no_conformidades.${index}.estado_conformidad`
                    )}
                    className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="Detectado">Detectado</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Resuelto">Resuelto</option>
                    <option value="Pendiente">Pendiente</option>
                  </select>
                </FormField>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Botón agregar no conformidad */}
      <div className="flex justify-center pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={handleAddNoConformidad}
          className="w-full sm:w-auto"
        >
          <Plus className="w-5 h-5 mr-2" />
          Registrar No Conformidad
        </Button>
      </div>
    </div>
  );
}
