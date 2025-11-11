// Modal para editar un productor existente

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Modal,
  Button,
  Input,
  Select,
  FormField,
  FormSection,
  Checkbox,
  type SelectOption,
} from "@/shared/components/ui";
import { LocationPicker } from "@/shared/components/maps";
import { ParcelasInput, type ParcelaSuperficie } from "./ParcelasInput";
import { useUpdateProductor } from "../hooks/useUpdateProductor";
import { parcelasService, type Parcela } from "@/features/parcelas";
import { logger } from "@/shared/utils/logger";
import type { Productor } from "../types/productor.types";

// Schema para editar productor
const editProductorSchema = z.object({
  nombre_productor: z.string().min(3, "Mínimo 3 caracteres"),
  ci_documento: z.string().min(5, "CI inválido"),
  categoria_actual: z.enum(["E", "T2", "T1", "T0"]),
  latitud: z.number().optional().or(z.nan().transform(() => undefined)),
  longitud: z.number().optional().or(z.nan().transform(() => undefined)),
  activo: z.boolean(),
});

type EditProductorFormData = z.infer<typeof editProductorSchema>;

interface EditProductorModalProps {
  isOpen: boolean;
  onClose: () => void;
  productor: Productor | null;
  onSuccess?: () => void;
}

export function EditProductorModal({
  isOpen,
  onClose,
  productor,
  onSuccess,
}: EditProductorModalProps) {
  const { updateProductor, isLoading } = useUpdateProductor();
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [parcelas, setParcelas] = useState<ParcelaSuperficie[]>([]);
  const [parcelasOriginales, setParcelasOriginales] = useState<Parcela[]>([]);
  const [parcelasError, setParcelasError] = useState<string>("");
  const [loadingParcelas, setLoadingParcelas] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<EditProductorFormData>({
    resolver: zodResolver(editProductorSchema),
  });

  // Cargar parcelas del productor
  const loadParcelas = useCallback(async (codigo: string) => {
    setLoadingParcelas(true);
    try {
      const response = await parcelasService.getParcelasByProductor(codigo);
      setParcelasOriginales(response.parcelas);

      // Convertir parcelas a formato ParcelaSuperficie
      const parcelasInput: ParcelaSuperficie[] = response.parcelas.map((p) => ({
        numero: p.numero_parcela,
        superficie_ha: p.superficie_ha,
      }));
      setParcelas(parcelasInput);
    } catch (error) {
      logger.error("Error cargando parcelas:", error);
    } finally {
      setLoadingParcelas(false);
    }
  }, []);

  // Cargar datos del productor cuando cambia
  useEffect(() => {
    if (productor && isOpen) {
      setValue("nombre_productor", productor.nombre_productor);
      setValue("ci_documento", productor.ci_documento || "");
      setValue("categoria_actual", productor.categoria_actual);
      setValue("activo", productor.activo);

      // Cargar coordenadas si existen
      if (productor.coordenadas) {
        setValue("latitud", productor.coordenadas.latitude);
        setValue("longitud", productor.coordenadas.longitude);
      }

      // Cargar parcelas del productor
      loadParcelas(productor.codigo_productor);
    }
  }, [productor, isOpen, setValue, loadParcelas]);

  // Handler para cuando se selecciona una ubicación en el mapa
  const handleLocationSelect = useCallback(
    (position: { lat: number; lng: number }) => {
      setValue("latitud", position.lat);
      setValue("longitud", position.lng);
    },
    [setValue]
  );

  // Obtener posición inicial si ya hay coordenadas
  const initialPosition =
    watch("latitud") && watch("longitud")
      ? { lat: watch("latitud")!, lng: watch("longitud")! }
      : null;

  // Calcular superficie total y número de parcelas basado en parcelas
  const superficieTotal = parcelas.reduce((sum, p) => sum + (p.superficie_ha || 0), 0);
  const numeroParcelas = parcelas.length;

  const onSubmit = async (data: EditProductorFormData) => {
    if (!productor) return;

    try {
      // Validar que haya parcelas definidas
      if (parcelas.length === 0) {
        setParcelasError("Debes definir al menos una parcela");
        return;
      }

      // Actualizar datos del productor
      await updateProductor(productor.codigo_productor, {
        nombre_productor: data.nombre_productor,
        ci_documento: data.ci_documento,
        categoria_actual: data.categoria_actual,
        superficie_total_has: superficieTotal,
        numero_parcelas_total: numeroParcelas,
        activo: data.activo,
        ...(data.latitud && data.longitud
          ? {
              coordenadas: {
                latitud: data.latitud,
                longitud: data.longitud,
              },
            }
          : {}),
      });

      // Sincronizar parcelas
      await sincronizarParcelas(productor.codigo_productor);

      reset();
      setParcelas([]);
      setParcelasOriginales([]);
      setParcelasError("");
      onClose();
      onSuccess?.();
    } catch (error) {
      // Error ya manejado por el hook
      logger.error("Error actualizando productor:", error);
    }
  };

  // Sincroniza parcelas: crea nuevas, actualiza existentes, elimina removidas
  const sincronizarParcelas = async (codigoProductor: string) => {
    // Crear mapa de parcelas actuales por número
    const parcelasMap = new Map(parcelas.map((p) => [p.numero, p]));
    const originalesMap = new Map(parcelasOriginales.map((p) => [p.numero_parcela, p]));

    // 1. Actualizar o crear parcelas
    for (const parcela of parcelas) {
      const original = originalesMap.get(parcela.numero);

      if (original) {
        // Actualizar si la superficie cambió
        if (original.superficie_ha !== parcela.superficie_ha) {
          await parcelasService.updateParcela(original.id_parcela, {
            superficie_ha: parcela.superficie_ha,
          });
        }
      } else {
        // Crear nueva parcela
        await parcelasService.createParcela({
          codigo_productor: codigoProductor,
          numero_parcela: parcela.numero,
          superficie_ha: parcela.superficie_ha,
        });
      }
    }

    // 2. Eliminar (soft delete) parcelas que ya no están
    for (const original of parcelasOriginales) {
      if (!parcelasMap.has(original.numero_parcela)) {
        await parcelasService.deleteParcela(original.id_parcela);
      }
    }
  };

  const handleClose = () => {
    reset();
    setParcelas([]);
    setParcelasOriginales([]);
    setParcelasError("");
    setShowLocationPicker(false);
    onClose();
  };

  if (!productor) return null;

  const categorias: SelectOption[] = [
    { value: "E", label: "E - En transición" },
    { value: "T2", label: "T2 - Segundo año de transición" },
    { value: "T1", label: "T1 - Primer año de transición" },
    { value: "T0", label: "T0 - Inicio transición" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Productor"
      size="large"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Información Básica">
          <div className="space-y-2 p-4 bg-neutral-bg rounded-lg border border-neutral-border">
            <p className="text-sm text-text-secondary">
              <strong>Código:</strong> {productor.codigo_productor}
            </p>
            <p className="text-sm text-text-secondary">
              <strong>Comunidad:</strong>{" "}
              {productor.nombre_municipio
                ? `${productor.nombre_comunidad} - ${productor.nombre_municipio}`
                : productor.nombre_comunidad}
            </p>
            <p className="text-xs text-text-tertiary">
              El código y la comunidad no se pueden modificar
            </p>
          </div>

          <FormField
            label="Nombre Completo"
            required
            error={errors.nombre_productor?.message}
          >
            <Input
              {...register("nombre_productor")}
              placeholder="Nombres y Apellidos"
            />
          </FormField>

          <FormField
            label="CI/Documento"
            required
            error={errors.ci_documento?.message}
          >
            <Input {...register("ci_documento")} placeholder="12345678" />
          </FormField>
        </FormSection>

        <FormSection title="Información del Programa">
          <FormField
            label="Categoría Actual"
            required
            error={errors.categoria_actual?.message}
          >
            <Select
              options={categorias}
              value={watch("categoria_actual")}
              onChange={(value) => setValue("categoria_actual", value as any)}
              placeholder="Selecciona categoría"
            />
          </FormField>
        </FormSection>

        <FormSection
          title="Información de Producción"
          description="Edita las parcelas del productor. La superficie total se calcula automáticamente."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Superficie Total (ha)">
              <Input
                value={superficieTotal.toFixed(4)}
                disabled
                className="bg-neutral-bg"
              />
              <p className="mt-1 text-xs text-text-tertiary">
                Se calcula automáticamente según las parcelas
              </p>
            </FormField>

            <FormField label="Número de Parcelas">
              <Input
                value={numeroParcelas}
                disabled
                className="bg-neutral-bg"
              />
              <p className="mt-1 text-xs text-text-tertiary">
                Se calcula automáticamente según las parcelas
              </p>
            </FormField>
          </div>

          {loadingParcelas ? (
            <div className="p-4 text-center text-text-secondary">
              Cargando parcelas...
            </div>
          ) : (
            <ParcelasInput
              superficieTotalProductor={superficieTotal}
              parcelas={parcelas}
              onChange={(nuevasParcelas) => {
                setParcelas(nuevasParcelas);
                setParcelasError("");
              }}
              error={parcelasError}
            />
          )}
        </FormSection>

        <FormSection
          title="Ubicación GPS del Domicilio"
          description="Opcional - Coordenadas del domicilio del productor"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Latitud"
              error={errors.latitud?.message}
            >
              <Input
                {...register("latitud", { valueAsNumber: true })}
                type="number"
                step="any"
                placeholder="-19.081373"
              />
            </FormField>

            <FormField
              label="Longitud"
              error={errors.longitud?.message}
            >
              <Input
                {...register("longitud", { valueAsNumber: true })}
                type="number"
                step="any"
                placeholder="-64.093174"
              />
            </FormField>
          </div>

          {!showLocationPicker ? (
            <div className="space-y-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowLocationPicker(true)}
                fullWidth
              >
                {watch("latitud") && watch("longitud")
                  ? "Cambiar Ubicación en Mapa"
                  : "Capturar Ubicación con Mapa"}
              </Button>

              {watch("latitud") && watch("longitud") && (
                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <p className="text-sm font-medium text-success">
                    Coordenadas guardadas:
                  </p>
                  <p className="mt-1 text-xs font-mono text-text-primary">
                    Lat: {watch("latitud")?.toFixed(6)} | Lng:{" "}
                    {watch("longitud")?.toFixed(6)}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="small"
                    onClick={() => {
                      setValue("latitud", undefined);
                      setValue("longitud", undefined);
                    }}
                    className="mt-2"
                  >
                    Eliminar coordenadas
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <LocationPicker
                initialPosition={initialPosition}
                onLocationSelect={handleLocationSelect}
                height="350px"
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowLocationPicker(false)}
                fullWidth
              >
                Cerrar Mapa
              </Button>
            </div>
          )}
        </FormSection>

        <FormSection title="Estado">
          <FormField label="Estado del productor">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox {...register("activo")} />
              <span className="text-sm text-text-secondary">
                Productor activo
              </span>
            </label>
          </FormField>
        </FormSection>

        <div className="flex flex-col-reverse gap-3 pt-4 border-t sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            fullWidth
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            fullWidth
          >
            Guardar Cambios
          </Button>
        </div>
      </form>
    </Modal>
  );
}
