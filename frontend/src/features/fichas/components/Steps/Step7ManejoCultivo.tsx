/**
 * Step 7: Manejo del Cultivo de Maní
 * Sección 7 del documento oficial
 *
 * IMPORTANTE: Esta sección muestra UN SOLO formulario para el cultivo certificable.
 * Los valores se copian automáticamente a TODOS los cultivos certificables de la ficha.
 */

import { useFormContext } from "react-hook-form";
import { FormSection } from "@/shared/components/ui/FormSection";
import { FormField } from "@/shared/components/ui/FormField";
import { SimpleRadioGroup } from "../Specialized/SimpleRadioGroup";
import { Alert } from "@/shared/components/ui/Alert";
import { useTiposCultivo } from "@/features/catalogos/hooks/useTiposCultivo";
import type { CreateFichaCompletaInput } from "../../types/ficha.types";

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

export default function Step7ManejoCultivo() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateFichaCompletaInput>();

  const detallesCultivo = watch("detalles_cultivo") || [];
  const { tiposCultivo } = useTiposCultivo({ activo: true });

  // Encontrar el cultivo certificable (normalmente Maní)
  const cultivoCertificable = tiposCultivo.find(
    (t) => t.es_principal_certificable
  );

  // Encontrar TODOS los índices de cultivos certificables en detalles_cultivo
  const indicesCertificables: number[] = [];
  detallesCultivo.forEach((detalle, index) => {
    if (detalle.id_tipo_cultivo === cultivoCertificable?.id_tipo_cultivo) {
      indicesCertificables.push(index);
    }
  });

  // Usar el primer cultivo certificable para leer valores (si existe)
  const primerIndiceCertificable = indicesCertificables[0];
  const tieneCultivosCertificables = indicesCertificables.length > 0;

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

  // Función para actualizar TODOS los cultivos certificables al mismo tiempo
  const actualizarTodosCertificables = (
    campo: string,
    valor: any
  ) => {
    indicesCertificables.forEach((index) => {
      setValue(`detalles_cultivo.${index}.${campo}` as any, valor);
    });
  };

  if (!cultivoCertificable) {
    return (
      <FormSection>
        <Alert
          type="warning"
          message="No se encontró información del cultivo certificable en el catálogo"
        />
      </FormSection>
    );
  }

  if (!tieneCultivosCertificables) {
    return (
      <FormSection>
        <Alert
          type="info"
          message={`Primero debe registrar cultivos de ${cultivoCertificable.nombre_cultivo} en la Sección 4 (Inspección de Parcelas)`}
        />
      </FormSection>
    );
  }

  // Leer valores del primer cultivo certificable
  const error = errors.detalles_cultivo?.[primerIndiceCertificable];

  return (
    <FormSection>
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">Cultivo:</span>{" "}
          {cultivoCertificable.nombre_cultivo}
        </p>
        {indicesCertificables.length > 1 && (
          <p className="text-xs text-blue-700 mt-1">
            Los valores se aplicarán a todos los cultivos de{" "}
            {cultivoCertificable.nombre_cultivo.toLowerCase()} registrados (
            {indicesCertificables.length} cultivos)
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {campos.map((config) => {
          const valorActual = watch(
            `detalles_cultivo.${primerIndiceCertificable}.${config.campo}`
          );
          const mostrarCampoOtro = config.tieneOtro && valorActual === "otro";

          return (
            <div key={config.campo} className="space-y-2">
              <SimpleRadioGroup
                name={`seccion7_${config.campo}`}
                value={valorActual || ""}
                onChange={(value) =>
                  actualizarTodosCertificables(config.campo, value)
                }
                options={config.opciones}
                label={config.label}
                required
                error={error?.[config.campo]?.message}
                layout="vertical"
              />

              {mostrarCampoOtro && config.campoOtro && (
                <FormField
                  label="Especifique"
                  required
                  error={error?.[config.campoOtro]?.message}
                >
                  <input
                    type="text"
                    placeholder="Describa..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={
                      watch(
                        `detalles_cultivo.${primerIndiceCertificable}.${config.campoOtro}`
                      ) || ""
                    }
                    onChange={(e) =>
                      actualizarTodosCertificables(
                        config.campoOtro!,
                        e.target.value
                      )
                    }
                  />
                </FormField>
              )}
            </div>
          );
        })}
      </div>
    </FormSection>
  );
}
