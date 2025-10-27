/**
 * Step 5: Evaluación Mitigación
 * Descripción fuentes de contaminación y prácticas de mitigación
 */

import { useFormContext, Controller } from "react-hook-form";
import { FormSection } from "@/shared/components/ui/FormSection";
import { FormField } from "@/shared/components/ui/FormField";
import { ComplianceRadioGroup } from "../Specialized/ComplianceRadioGroup";
import type { CreateFichaCompletaInput } from "../../types/ficha.types";

// ============================================
// TYPES
// ============================================

interface PreguntaMitigacion {
  pregunta: string;
  campo:
    | "practica_mitigacion_riesgos"
    | "mitigacion_contaminacion"
    | "deposito_herramientas"
    | "deposito_insumos_organicos"
    | "evita_quema_residuos";
  campoTexto?:
    | "practica_mitigacion_riesgos_descripcion"
    | "mitigacion_contaminacion_descripcion";
  conParcial: boolean;
  textAreaRows?: number;
}

// ============================================
// COMPONENT
// ============================================

export default function Step5EvaluacionMitigacion() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateFichaCompletaInput>();

  // Observar valores actuales
  const evaluacionData = watch("evaluacion_mitigacion");

  // Configuración de preguntas según documento oficial
  const preguntas: PreguntaMitigacion[] = [
    {
      pregunta:
        "¿Realiza alguna práctica de mitigación sobre posibles riesgos de alguna fuente de contaminación a las parcelas ecológicas?",
      campo: "practica_mitigacion_riesgos",
      campoTexto: "practica_mitigacion_riesgos_descripcion",
      conParcial: true,
      textAreaRows: 3,
    },
    {
      pregunta:
        "¿Efectúa prácticas de mitigación en la unidad de producción para evitar contaminación por basura, frascos, plásticos, pilas y otros materiales?",
      campo: "mitigacion_contaminacion",
      campoTexto: "mitigacion_contaminacion_descripcion",
      conParcial: true,
      textAreaRows: 3,
    },
    {
      pregunta: "¿Tiene depósito de herramientas?",
      campo: "deposito_herramientas",
      conParcial: false,
    },
    {
      pregunta: "¿Tiene depósito para insumos orgánicos?",
      campo: "deposito_insumos_organicos",
      conParcial: false,
    },
    {
      pregunta:
        "¿Evita usted la quema de residuos de cosecha y/parcelas en barbecho en su unidad de producción certificada?",
      campo: "evita_quema_residuos",
      conParcial: true,
    },
  ];

  return (
    <div className="space-y-6">
      <FormSection>
        <div className="space-y-6">
          {/* Vista Desktop - Tabla */}
          <div className="hidden overflow-hidden border rounded-lg md:block border-neutral-border">
            {/* Header */}
            <div className="grid grid-cols-[40%,60%] bg-gray-50 border-b border-neutral-border">
              <div className="px-4 py-3 text-sm font-semibold text-text-primary">
                PREGUNTA
              </div>
              <div className="px-4 py-3 text-sm font-semibold border-l text-text-primary border-neutral-border">
                CUMPLIMIENTO
              </div>
            </div>

            {/* Filas de preguntas */}
            {preguntas.map((pregunta, index) => (
              <div key={pregunta.campo}>
                {/* Fila principal: Pregunta + Radio Buttons */}
                <div
                  className={`grid grid-cols-[40%,60%] ${
                    index !== preguntas.length - 1 && !pregunta.campoTexto
                      ? "border-b border-neutral-border"
                      : ""
                  } hover:bg-gray-50 transition-colors`}
                >
                  {/* Columna 1: Pregunta */}
                  <div className="flex items-center px-4 py-4 text-sm text-text-secondary">
                    {pregunta.pregunta}
                  </div>

                  {/* Columna 2: ComplianceRadioGroup */}
                  <div className="px-4 py-4 border-l border-neutral-border">
                    <ComplianceRadioGroup
                      name={`evaluacion_mitigacion.${pregunta.campo}`}
                      value={evaluacionData?.[pregunta.campo]}
                      onChange={(value) =>
                        setValue(
                          `evaluacion_mitigacion.${pregunta.campo}`,
                          value,
                          {
                            shouldValidate: true,
                            shouldDirty: true,
                          }
                        )
                      }
                      error={
                        errors.evaluacion_mitigacion?.[pregunta.campo]?.message
                      }
                      showParcial={pregunta.conParcial}
                      showNoAplica={false}
                    />
                  </div>
                </div>

                {/* Fila adicional: Campo de texto (solo para preguntas 1 y 2) */}
                {pregunta.campoTexto && (
                  <div
                    className={`grid grid-cols-[40%,60%] bg-gray-50 ${
                      index !== preguntas.length - 1
                        ? "border-b border-neutral-border"
                        : ""
                    }`}
                  >
                    {/* Columna 1: Label */}
                    <div className="flex items-center px-4 py-3 text-sm font-medium text-text-primary">
                      Práctica de mitigación:
                    </div>

                    {/* Columna 2: Textarea */}
                    <div className="px-4 py-3 border-l border-neutral-border">
                      <Controller
                        name={`evaluacion_mitigacion.${pregunta.campoTexto}` as const}
                        control={control}
                        render={({ field: fieldProps }) => (
                          <textarea
                            {...fieldProps}
                            rows={pregunta.textAreaRows}
                            autoComplete="off"
                            spellCheck={false}
                            placeholder="Describa la práctica implementada..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        )}
                      />
                      {errors.evaluacion_mitigacion?.[pregunta.campoTexto] && (
                        <p className="mt-1 text-xs text-red-600">
                          {
                            errors.evaluacion_mitigacion[pregunta.campoTexto]
                              ?.message
                          }
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Vista Mobile - Lista vertical */}
          <div className="space-y-6 md:hidden">
            {preguntas.map((pregunta) => (
              <div
                key={pregunta.campo}
                className="p-4 border rounded-lg border-neutral-border bg-gray-50"
              >
                {/* Pregunta */}
                <div className="mb-3">
                  <p className="text-sm text-text-secondary">
                    {pregunta.pregunta}
                  </p>
                </div>

                {/* Radio Buttons */}
                <FormField label="Cumplimiento">
                  <ComplianceRadioGroup
                    name={`evaluacion_mitigacion.${pregunta.campo}`}
                    value={evaluacionData?.[pregunta.campo]}
                    onChange={(value) =>
                      setValue(
                        `evaluacion_mitigacion.${pregunta.campo}`,
                        value,
                        {
                          shouldValidate: true,
                          shouldDirty: true,
                        }
                      )
                    }
                    error={
                      errors.evaluacion_mitigacion?.[pregunta.campo]?.message
                    }
                    showParcial={pregunta.conParcial}
                    showNoAplica={false}
                  />
                </FormField>

                {/* Campo de texto (solo para preguntas 1 y 2) */}
                {pregunta.campoTexto && (
                  <FormField label="Práctica de mitigación" className="mt-4">
                    <Controller
                      name={`evaluacion_mitigacion.${pregunta.campoTexto}` as const}
                      control={control}
                      render={({ field: fieldProps }) => (
                        <textarea
                          {...fieldProps}
                          rows={pregunta.textAreaRows}
                          autoComplete="off"
                          spellCheck={false}
                          placeholder="Describa la práctica implementada..."
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      )}
                    />
                    {errors.evaluacion_mitigacion?.[pregunta.campoTexto] && (
                      <p className="mt-1 text-xs text-red-600">
                        {
                          errors.evaluacion_mitigacion[pregunta.campoTexto]
                            ?.message
                        }
                      </p>
                    )}
                  </FormField>
                )}
              </div>
            ))}
          </div>
        </div>
      </FormSection>

      {/* Comentarios sobre práctica de mitigación */}
      <FormSection title="Comentarios extras">
        <FormField>
          <textarea
            {...register("evaluacion_mitigacion.comentarios_sobre_practica_mitigacion")}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Observaciones adicionales sobre riesgos y mitigación..."
          />
          {errors.evaluacion_mitigacion?.comentarios_sobre_practica_mitigacion && (
            <p className="mt-1 text-sm text-red-600">
              {errors.evaluacion_mitigacion.comentarios_sobre_practica_mitigacion.message}
            </p>
          )}
        </FormField>
      </FormSection>
    </div>
  );
}
