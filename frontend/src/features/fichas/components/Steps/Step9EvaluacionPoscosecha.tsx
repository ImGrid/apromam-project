/**
 * Step 9: Evaluación Poscosecha
 * Evaluación del manejo de productos después de la cosecha
 */

import { useFormContext } from "react-hook-form";
import { FormSection } from "@/shared/components/ui/FormSection";
import { FormField } from "@/shared/components/ui/FormField";
import { ComplianceRadioGroup } from "../Specialized/ComplianceRadioGroup";
import type { CreateFichaCompletaInput } from "../../types/ficha.types";

// ============================================
// COMPONENT
// ============================================

export default function Step9EvaluacionPoscosecha() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateFichaCompletaInput>();

  // Observar valores actuales
  const evaluacionData = watch("evaluacion_poscosecha");

  // Datos de las preguntas según documento oficial
  const preguntas = [
    {
      campo: "secado_tendal" as const,
      label: "¿El productor(a) seca el maní sobre tendal u otra forma para evitar contaminación del producto?",
      showParcial: true,
    },
    {
      campo: "envases_limpios" as const,
      label: "¿El productor(a) utiliza envases limpios para el empacado de maní en vaina?",
      showParcial: true,
    },
    {
      campo: "almacen_protegido" as const,
      label: "¿El almacén o lugar de almacenamiento de maní está protegido contra riesgos de contaminación o presencia de plagas?",
      showParcial: true, // Parcial habilitado
    },
    {
      campo: "evidencia_comercializacion" as const,
      label: "¿Se cuenta con evidencia documentada de la cantidad comercializada?",
      showParcial: false, // Solo esta tiene Parcial deshabilitado (gris en documento)
    },
  ];

  return (
    <div className="space-y-6">
      {/* Preguntas */}
      <FormSection>
        {/* Vista Desktop - Tabla de 2 columnas */}
        <div className="hidden overflow-hidden border rounded-lg md:block border-neutral-border">
          {/* Header */}
          <div className="grid grid-cols-[40%,60%] bg-gray-50 border-b border-neutral-border">
            <div className="px-4 py-3 text-sm font-semibold text-text-primary">
              PREGUNTA
            </div>
            <div className="px-4 py-3 text-sm font-semibold text-text-primary border-l border-neutral-border">
              CUMPLIMIENTO
            </div>
          </div>

          {/* Filas de preguntas */}
          {preguntas.map((pregunta, index) => (
            <div
              key={pregunta.campo}
              className={`grid grid-cols-[40%,60%] ${
                index !== preguntas.length - 1 ? "border-b border-neutral-border" : ""
              } hover:bg-gray-50 transition-colors`}
            >
              {/* Columna 1: Pregunta */}
              <div className="flex items-center px-4 py-4 text-sm text-text-secondary">
                {pregunta.label}
              </div>

              {/* Columna 2: ComplianceRadioGroup */}
              <div className="px-4 py-4 border-l border-neutral-border">
                <ComplianceRadioGroup
                  name={`evaluacion_poscosecha.${pregunta.campo}`}
                  value={evaluacionData?.[pregunta.campo]}
                  onChange={(value) =>
                    setValue(`evaluacion_poscosecha.${pregunta.campo}`, value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  error={errors.evaluacion_poscosecha?.[pregunta.campo]?.message}
                  showParcial={pregunta.showParcial}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Vista Mobile - Lista vertical */}
        <div className="space-y-6 md:hidden">
          {preguntas.map((pregunta) => (
            <FormField key={pregunta.campo} label={pregunta.label}>
              <ComplianceRadioGroup
                name={`evaluacion_poscosecha.${pregunta.campo}`}
                value={evaluacionData?.[pregunta.campo]}
                onChange={(value) =>
                  setValue(`evaluacion_poscosecha.${pregunta.campo}`, value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                error={errors.evaluacion_poscosecha?.[pregunta.campo]?.message}
                showParcial={pregunta.showParcial}
              />
            </FormField>
          ))}
        </div>
      </FormSection>

      {/* Comentarios */}
      <FormSection>
        <FormField>
          <textarea
            {...register("evaluacion_poscosecha.comentarios_poscosecha")}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Escriba sus comentarios aquí..."
          />
          {errors.evaluacion_poscosecha?.comentarios_poscosecha && (
            <p className="mt-1 text-sm text-red-600">
              {errors.evaluacion_poscosecha.comentarios_poscosecha.message}
            </p>
          )}
        </FormField>
      </FormSection>
    </div>
  );
}
