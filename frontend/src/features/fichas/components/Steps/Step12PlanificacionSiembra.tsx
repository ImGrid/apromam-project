import { useFormContext, useFieldArray } from "react-hook-form";
import { useState, useEffect } from "react";
import { Card, Alert, Input } from "@/shared/components/ui";
import { useProductorParcelas } from "@/features/productores/hooks/useProductorParcelas";
import type { CreateFichaCompletaInput } from "../../types/ficha.types";

export default function Step12PlanificacionSiembra() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateFichaCompletaInput>();
  const { fields, append } = useFieldArray({
    control,
    name: "planificacion_siembras",
  });

  const codigoProductor = watch("ficha.codigo_productor");
  const { parcelas, isLoading, error } = useProductorParcelas(codigoProductor);

  // Estado para controlar si ya se inicializó
  const [initialized, setInitialized] = useState(false);

  // Inicializar planificación con todas las parcelas del productor
  useEffect(() => {
    if (
      parcelas &&
      parcelas.length > 0 &&
      fields.length === 0 &&
      !initialized
    ) {
      parcelas.forEach((parcela) => {
        append({
          id_parcela: parcela.id_parcela,
          area_parcela_planificada_ha: parcela.superficie_ha,
          mani_ha: 0,
          maiz_ha: 0,
          papa_ha: 0,
          aji_ha: 0,
          leguminosas_ha: 0,
          otros_cultivos_ha: 0,
          otros_cultivos_detalle: "",
          descanso_ha: parcela.superficie_ha, // Default: todo en descanso
        });
      });
      setInitialized(true);
    }
  }, [parcelas, fields.length, initialized, append]);

  // Mapear parcelas por ID para acceso rápido
  const parcelasMap = new Map();
  parcelas?.forEach((parcela) => {
    parcelasMap.set(parcela.id_parcela, parcela);
  });

  // Cálculos automáticos por parcela - calculo directo sin memo para reactividad
  const calculosPorParcela = fields.map((field, index) => {
    const areaPlanificada =
      watch(`planificacion_siembras.${index}.area_parcela_planificada_ha`) || 0;
    const mani = watch(`planificacion_siembras.${index}.mani_ha`) || 0;
    const maiz = watch(`planificacion_siembras.${index}.maiz_ha`) || 0;
    const papa = watch(`planificacion_siembras.${index}.papa_ha`) || 0;
    const aji = watch(`planificacion_siembras.${index}.aji_ha`) || 0;
    const leguminosas =
      watch(`planificacion_siembras.${index}.leguminosas_ha`) || 0;
    const otros =
      watch(`planificacion_siembras.${index}.otros_cultivos_ha`) || 0;

    const sumaCultivos = mani + maiz + papa + aji + leguminosas + otros;
    const descansoCalculado = Math.max(0, areaPlanificada - sumaCultivos);
    const excede = sumaCultivos > areaPlanificada;
    const porcentajeUso =
      areaPlanificada > 0 ? (sumaCultivos / areaPlanificada) * 100 : 0;

    return {
      sumaCultivos,
      descansoCalculado,
      excede,
      porcentajeUso,
      areaPlanificada,
    };
  });

  // Auto-actualizar descanso cuando cambian los cultivos
  useEffect(() => {
    fields.forEach((field, index) => {
      const calculo = calculosPorParcela[index];
      if (calculo) {
        const descansoActual = watch(
          `planificacion_siembras.${index}.descanso_ha`
        );
        if (descansoActual !== calculo.descansoCalculado) {
          setValue(
            `planificacion_siembras.${index}.descanso_ha`,
            calculo.descansoCalculado,
            {
              shouldDirty: false,
            }
          );
        }
      }
    });
  }, [calculosPorParcela, fields, setValue, watch]);

  if (isLoading) {
    return (
      <Card>
        <div className="py-8 text-center">
          <p className="text-neutral-600">Cargando parcelas...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Alert type="error" message={`Error al cargar parcelas: ${error}`} />
      </Card>
    );
  }

  if (!parcelas || parcelas.length === 0) {
    return (
      <Card>
        <Alert
          type="warning"
          message="El productor no tiene parcelas registradas. Complete primero los datos del productor y sus parcelas."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Por cada parcela */}
      {fields.map((field, index) => {
        const parcela = parcelasMap.get(field.id_parcela);
        const calculo = calculosPorParcela[index];

        if (!parcela || !calculo) return null;

        return (
          <Card key={field.id}>
            {/* Título de parcela */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-neutral-900">
                Parcela {parcela.numero_parcela} - Superficie Actual:{" "}
                {parcela.superficie_ha.toFixed(4)} ha
              </h4>
            </div>

            {/* Área planificada */}
            <div className="mb-4">
              <Input
                label="Área Planificada (ha)"
                inputType="number"
                step="0.0001"
                {...register(
                  `planificacion_siembras.${index}.area_parcela_planificada_ha`,
                  {
                    setValueAs: (v) =>
                      v === "" || v === null || isNaN(parseFloat(v))
                        ? 0
                        : parseFloat(v),
                  }
                )}
                error={
                  errors.planificacion_siembras?.[index]
                    ?.area_parcela_planificada_ha?.message
                }
              />
            </div>

            {/* Cultivos planificados */}
            <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2 lg:grid-cols-3">
              <Input
                label="Maní (ha)"
                inputType="number"
                step="0.0001"
                {...register(`planificacion_siembras.${index}.mani_ha`, {
                  setValueAs: (v) =>
                    v === "" || v === null || isNaN(parseFloat(v))
                      ? 0
                      : parseFloat(v),
                })}
                error={errors.planificacion_siembras?.[index]?.mani_ha?.message}
              />

              <Input
                label="Maíz (ha)"
                inputType="number"
                step="0.0001"
                {...register(`planificacion_siembras.${index}.maiz_ha`, {
                  setValueAs: (v) =>
                    v === "" || v === null || isNaN(parseFloat(v))
                      ? 0
                      : parseFloat(v),
                })}
                error={errors.planificacion_siembras?.[index]?.maiz_ha?.message}
              />

              <Input
                label="Papa (ha)"
                inputType="number"
                step="0.0001"
                {...register(`planificacion_siembras.${index}.papa_ha`, {
                  setValueAs: (v) =>
                    v === "" || v === null || isNaN(parseFloat(v))
                      ? 0
                      : parseFloat(v),
                })}
                error={errors.planificacion_siembras?.[index]?.papa_ha?.message}
              />

              <Input
                label="Ají (ha)"
                inputType="number"
                step="0.0001"
                {...register(`planificacion_siembras.${index}.aji_ha`, {
                  setValueAs: (v) =>
                    v === "" || v === null || isNaN(parseFloat(v))
                      ? 0
                      : parseFloat(v),
                })}
                error={errors.planificacion_siembras?.[index]?.aji_ha?.message}
              />

              <Input
                label="Leguminosas (ha)"
                inputType="number"
                step="0.0001"
                {...register(`planificacion_siembras.${index}.leguminosas_ha`, {
                  setValueAs: (v) =>
                    v === "" || v === null || isNaN(parseFloat(v))
                      ? 0
                      : parseFloat(v),
                })}
                error={
                  errors.planificacion_siembras?.[index]?.leguminosas_ha
                    ?.message
                }
              />

              <Input
                label="Otros (ha)"
                inputType="number"
                step="0.0001"
                {...register(
                  `planificacion_siembras.${index}.otros_cultivos_ha`,
                  {
                    setValueAs: (v) =>
                      v === "" || v === null || isNaN(parseFloat(v))
                        ? 0
                        : parseFloat(v),
                  }
                )}
                error={
                  errors.planificacion_siembras?.[index]?.otros_cultivos_ha
                    ?.message
                }
              />

              <Input
                label="Descanso (ha)"
                inputType="number"
                step="0.0001"
                {...register(`planificacion_siembras.${index}.descanso_ha`, {
                  setValueAs: (v) =>
                    v === "" || v === null || isNaN(parseFloat(v))
                      ? 0
                      : parseFloat(v),
                })}
                disabled
              />

              <Input
                label="Detalle otros cultivos (Opcional)"
                inputType="text"
                {...register(
                  `planificacion_siembras.${index}.otros_cultivos_detalle`
                )}
                error={
                  errors.planificacion_siembras?.[index]?.otros_cultivos_detalle
                    ?.message
                }
              />
            </div>

            {calculo.excede && (
              <Alert
                type="warning"
                message={`Suma cultivos: ${calculo.sumaCultivos.toFixed(
                  2
                )} ha excede área planificada: ${calculo.areaPlanificada.toFixed(
                  2
                )} ha`}
              />
            )}
          </Card>
        );
      })}
    </div>
  );
}
