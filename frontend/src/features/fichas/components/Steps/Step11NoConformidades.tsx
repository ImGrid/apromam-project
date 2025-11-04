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
import { Input } from "@/shared/components/ui/Input";
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
    });
  };

  return (
    <div className="space-y-6">
      {/* Lista de no conformidades */}
      <div className="space-y-4">
        {fields.length === 0 ? (
          <Alert
            type="success"
            message="Sin no conformidades registradas"
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

              {/* Grid de 2 columnas para textareas en desktop */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Descripción de la no conformidad */}
                <FormField
                  label="Descripción de la No Conformidad"
                  required
                  error={
                    errors.no_conformidades?.[index]?.descripcion_no_conformidad
                      ?.message
                  }
                >
                  <textarea
                    {...register(
                      `no_conformidades.${index}.descripcion_no_conformidad`
                    )}
                    rows={4}
                    className="w-full min-h-[48px] px-4 py-3 text-base border rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 border-neutral-border focus:ring-primary focus:border-primary"
                    placeholder="Descripción del incumplimiento"
                  />
                </FormField>

                {/* Acción correctiva propuesta */}
                <FormField
                  label="Acción Correctiva Propuesta"
                  error={
                    errors.no_conformidades?.[index]?.accion_correctiva_propuesta
                      ?.message
                  }
                >
                  <textarea
                    {...register(
                      `no_conformidades.${index}.accion_correctiva_propuesta`
                    )}
                    rows={4}
                    className="w-full min-h-[48px] px-4 py-3 text-base border rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 border-neutral-border focus:ring-primary focus:border-primary"
                    placeholder="Solución propuesta"
                  />
                </FormField>
              </div>

              {/* Fecha límite - más compacta */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FormField
                  label="Fecha Límite de Implementación"
                  error={
                    errors.no_conformidades?.[index]
                      ?.fecha_limite_implementacion?.message
                  }
                >
                  <Input
                    inputType="date"
                    {...register(
                      `no_conformidades.${index}.fecha_limite_implementacion`
                    )}
                  />
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
