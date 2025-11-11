/**
 * Step 2: Revisión Documentación
 * Verificación de documentos requeridos para la certificación orgánica
 */

import { useFormContext } from "react-hook-form";
import { FormSection } from "@/shared/components/ui/FormSection";
import { FormField } from "@/shared/components/ui/FormField";
import { ComplianceRadioGroup } from "../Specialized/ComplianceRadioGroup";
import type { CreateFichaCompletaInput } from "../../types/ficha.types";

// ============================================
// COMPONENT
// ============================================

export default function Step2RevisionDocumentacion() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateFichaCompletaInput>();

  // Observar valores actuales
  const revisionData = watch("revision_documentacion");

  // Datos de los documentos
  const documentos = [
    {
      campo: "solicitud_ingreso" as const,
      label: "Solicitud formal del productor para ingresar o renovar la certificación",
    },
    {
      campo: "normas_reglamentos" as const,
      label: "Conocimiento y documentación de normas orgánicas aplicables",
    },
    {
      campo: "contrato_produccion" as const,
      label: "Contrato de Producción ecológica",
    },
    {
      campo: "croquis_unidad" as const,
      label: "Croquis de la Unidad Productiva",
    },
    {
      campo: "diario_campo" as const,
      label: "Diario de Campo",
    },
    {
      campo: "registro_cosecha" as const,
      label: "Registro de cantidad cosechada",
    },
    {
      campo: "recibo_pago" as const,
      label: "Recibo de Pago",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Documentos */}
      <FormSection>
        {/* Vista Desktop - Tabla de 2 columnas */}
        <div className="hidden overflow-hidden border rounded-lg md:block border-neutral-border">
          {/* Header */}
          <div className="grid grid-cols-[40%,60%] bg-neutral-50 border-b border-neutral-border">
            <div className="px-4 py-3 text-sm font-semibold text-text-primary">
              DOCUMENTACIÓN
            </div>
            <div className="px-4 py-3 text-sm font-semibold text-text-primary border-l border-neutral-border">
              CUMPLIMIENTO
            </div>
          </div>

          {/* Filas de documentos */}
          {documentos.map((doc, index) => (
            <div
              key={doc.campo}
              className={`grid grid-cols-[40%,60%] ${
                index !== documentos.length - 1 ? "border-b border-neutral-border" : ""
              } hover:bg-neutral-50 transition-colors`}
            >
              {/* Columna 1: Nombre del documento */}
              <div className="flex items-center px-4 py-4 text-sm text-text-secondary">
                {doc.label}
              </div>

              {/* Columna 2: ComplianceRadioGroup */}
              <div className="px-4 py-4 border-l border-neutral-border">
                <ComplianceRadioGroup
                  name={`revision_documentacion.${doc.campo}`}
                  value={revisionData?.[doc.campo]}
                  onChange={(value) =>
                    setValue(`revision_documentacion.${doc.campo}`, value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  error={errors.revision_documentacion?.[doc.campo]?.message}
                  showParcial={false}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Vista Mobile - Lista vertical (como estaba antes) */}
        <div className="space-y-6 md:hidden">
          {documentos.map((doc) => (
            <FormField key={doc.campo} label={doc.label}>
              <ComplianceRadioGroup
                name={`revision_documentacion.${doc.campo}`}
                value={revisionData?.[doc.campo]}
                onChange={(value) =>
                  setValue(`revision_documentacion.${doc.campo}`, value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                error={errors.revision_documentacion?.[doc.campo]?.message}
                showParcial={false}
              />
            </FormField>
          ))}
        </div>
      </FormSection>

    </div>
  );
}
