/**
 * Seccion7ManejoCultivo
 * Campos de manejo del cultivo (Sección 7 del documento oficial)
 * Solo se muestra para cultivos certificables
 */

import { useFormContext } from "react-hook-form";
import { FormField } from "@/shared/components/ui/FormField";
import { SimpleRadioGroup } from "../Specialized/SimpleRadioGroup";
import type { CreateFichaCompletaInput } from "../../types/ficha.types";

interface Seccion7ManejoCultivoProps {
  index: number;
}

interface CampoSeccion7 {
  campo:
    | "procedencia_semilla"
    | "categoria_semilla"
    | "tratamiento_semillas"
    | "tipo_abonamiento"
    | "metodo_aporque"
    | "control_hierbas"
    | "metodo_cosecha";
  label: string;
  opciones: Array<{ value: string; label: string }>;
  tieneOtro: boolean;
  campoOtro?:
    | "tratamiento_semillas_otro"
    | "tipo_abonamiento_otro"
    | "metodo_aporque_otro"
    | "control_hierbas_otro"
    | "metodo_cosecha_otro";
}

export default function Seccion7ManejoCultivo({
  index,
}: Seccion7ManejoCultivoProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateFichaCompletaInput>();

  const error = errors.detalles_cultivo?.[index];

  // Configuración de campos según documento oficial
  const campos: CampoSeccion7[] = [
    {
      campo: "procedencia_semilla",
      label: "Procedencia de semillas",
      opciones: [
        { value: "asociacion", label: "Asociación" },
        { value: "propia", label: "Propia" },
        { value: "otro_productor", label: "Otro productor" },
        { value: "no_sembro", label: "No sembró" },
      ],
      tieneOtro: false,
    },
    {
      campo: "categoria_semilla",
      label: "Categoría de la semilla",
      opciones: [
        { value: "organica", label: "Orgánica" },
        { value: "transicion", label: "En transición" },
        { value: "convencional", label: "Convencional" },
        { value: "ninguna", label: "Ninguna" },
      ],
      tieneOtro: false,
    },
    {
      campo: "tratamiento_semillas",
      label: "Tratamiento de semillas",
      opciones: [
        { value: "sin_tratamiento", label: "Sin tratamiento" },
        { value: "agroquimico", label: "Agroquímico" },
        { value: "insumos_organicos", label: "Insumos orgánicos" },
        { value: "otro", label: "Otro" },
      ],
      tieneOtro: true,
      campoOtro: "tratamiento_semillas_otro",
    },
    {
      campo: "tipo_abonamiento",
      label: "Abonamiento",
      opciones: [
        { value: "rastrojo", label: "Rastrojo" },
        { value: "guano", label: "Guano" },
        { value: "otro", label: "Otro" },
      ],
      tieneOtro: true,
      campoOtro: "tipo_abonamiento_otro",
    },
    {
      campo: "metodo_aporque",
      label: "Aporque",
      opciones: [
        { value: "con_yunta", label: "Con yunta" },
        { value: "manual", label: "Manual" },
        { value: "otro", label: "Otro" },
      ],
      tieneOtro: true,
      campoOtro: "metodo_aporque_otro",
    },
    {
      campo: "control_hierbas",
      label: "Control de hierbas",
      opciones: [
        { value: "con_bueyes", label: "Con bueyes" },
        { value: "carpida_manual", label: "Carpida manual" },
        { value: "otro", label: "Otro" },
      ],
      tieneOtro: true,
      campoOtro: "control_hierbas_otro",
    },
    {
      campo: "metodo_cosecha",
      label: "Cosecha",
      opciones: [
        { value: "con_yunta", label: "Con yunta" },
        { value: "manual", label: "Manual" },
        { value: "otro", label: "Otro" },
      ],
      tieneOtro: true,
      campoOtro: "metodo_cosecha_otro",
    },
  ];

  return (
    <div className="mt-4 pt-4 border-t border-neutral-200">
      <h4 className="text-sm font-semibold text-neutral-700 mb-3">
        Manejo del cultivo de maní
      </h4>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {campos.map((config) => {
          const valorActual = watch(`detalles_cultivo.${index}.${config.campo}`);
          const mostrarCampoOtro = config.tieneOtro && valorActual === "otro";

          return (
            <div key={config.campo} className="space-y-2">
              <SimpleRadioGroup
                name={`detalles_cultivo.${index}.${config.campo}`}
                value={valorActual || ""}
                onChange={(value) =>
                  setValue(`detalles_cultivo.${index}.${config.campo}`, value as any)
                }
                options={config.opciones}
                label={config.label}
                required
                error={error?.[config.campo]?.message}
                layout="vertical"
              />

              {/* Campo "Otro" condicional */}
              {mostrarCampoOtro && config.campoOtro && (
                <FormField
                  label="Especifique"
                  required
                  error={error?.[config.campoOtro]?.message}
                >
                  <input
                    type="text"
                    placeholder="Describa..."
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-2 focus:ring-info-500 focus:border-info-500"
                    {...register(`detalles_cultivo.${index}.${config.campoOtro}`)}
                  />
                </FormField>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
