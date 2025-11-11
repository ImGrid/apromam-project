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
  type SelectOption,
} from "@/shared/components/ui";
import { LocationPicker } from "@/shared/components/maps";
import { ParcelasInput, type ParcelaSuperficie } from "./ParcelasInput";
import { useCreateProductor } from "../hooks/useCreateProductor";
import { useAuth } from "@/shared/hooks/useAuth";
import { apiClient, ENDPOINTS } from "@/shared/services/api";
import { parcelasService } from "@/features/parcelas";
import { logger } from "@/shared/utils/logger";
import type { Productor } from "../types/productor.types";

// Schema de validacion
const productorSchema = z.object({
  nombre_productor: z.string().min(3, "Mínimo 3 caracteres"),
  ci_documento: z.string().min(5, "CI inválido"),
  id_comunidad: z.string().min(1, "Selecciona una comunidad"),
  id_organizacion: z.string().min(1, "Selecciona una organización"),
  año_ingreso_programa: z
    .number()
    .min(2000, "Año inválido")
    .max(new Date().getFullYear(), "Año no puede ser futuro"),
  categoria_actual: z.enum(["E", "T2", "T1", "T0"]),
  superficie_total_has: z.number().min(0.01, "Superficie debe ser mayor a 0"),
  latitud: z.number().optional().or(z.nan().transform(() => undefined)),
  longitud: z.number().optional().or(z.nan().transform(() => undefined)),
  altitud: z.number().optional().or(z.nan().transform(() => undefined)),
});

type ProductorFormData = z.infer<typeof productorSchema>;

interface CreateProductorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (productor: Productor) => void;
}

export function CreateProductorModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateProductorModalProps) {
  const { user } = useAuth();
  const { createProductor, isLoading } = useCreateProductor();
  const [comunidades, setComunidades] = useState<SelectOption[]>([]);
  const [organizaciones, setOrganizaciones] = useState<SelectOption[]>([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [parcelas, setParcelas] = useState<ParcelaSuperficie[]>([]);
  const [parcelasError, setParcelasError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<ProductorFormData>({
    resolver: zodResolver(productorSchema),
    defaultValues: {
      año_ingreso_programa: new Date().getFullYear(),
      categoria_actual: "T0",
    },
  });

  // Cargar comunidades - memoizado
  const loadComunidades = useCallback(async () => {
    try {
      const response = await apiClient.get<{
        comunidades: Array<{
          id_comunidad: string;
          nombre_comunidad: string;
          nombre_municipio?: string;
        }>;
      }>(ENDPOINTS.COMUNIDADES.BASE);

      let comunidadesData = response.data.comunidades;

      // Si es tecnico, filtrar solo sus comunidades asignadas (N:N)
      if (
        user?.nombre_rol.toLowerCase() === "técnico" &&
        user.comunidades_ids &&
        user.comunidades_ids.length > 0
      ) {
        comunidadesData = comunidadesData.filter((c) =>
          user.comunidades_ids?.includes(c.id_comunidad)
        );
      }

      setComunidades(
        comunidadesData.map((c) => ({
          value: c.id_comunidad,
          label: c.nombre_municipio
            ? `${c.nombre_comunidad} - ${c.nombre_municipio}`
            : c.nombre_comunidad,
        }))
      );
    } catch (error) {
      logger.error("Error cargando comunidades", error);
    }
  }, [user]);

  // Cargar organizaciones
  const loadOrganizaciones = useCallback(async () => {
    try {
      const response = await apiClient.get<{
        organizaciones: Array<{
          id_organizacion: string;
          nombre_organizacion: string;
        }>;
      }>(ENDPOINTS.ORGANIZACIONES.BASE);

      setOrganizaciones(
        response.data.organizaciones.map((o) => ({
          value: o.id_organizacion,
          label: o.nombre_organizacion,
        }))
      );
    } catch (error) {
      logger.error("Error cargando organizaciones", error);
    }
  }, []);

  // Cargar comunidades y organizaciones al abrir modal
  useEffect(() => {
    if (isOpen) {
      loadComunidades();
      loadOrganizaciones();
      // Si es tecnico con UNA sola comunidad, preseleccionarla
      if (
        user?.nombre_rol.toLowerCase() === "técnico" &&
        user.comunidades_ids?.length === 1
      ) {
        setValue("id_comunidad", user.comunidades_ids[0]);
      }
    }
  }, [isOpen, user, setValue, loadComunidades, loadOrganizaciones]);

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

  const onSubmit = async (data: ProductorFormData) => {
    try {
      // Validar que haya parcelas definidas
      if (parcelas.length === 0) {
        setParcelasError("Debes definir al menos una parcela");
        return;
      }

      // Validar Nivel 2: suma de parcelas = total productor
      const sumaParcelas = parcelas.reduce((sum, p) => sum + (p.superficie_ha || 0), 0);
      const diferencia = Math.abs(sumaParcelas - data.superficie_total_has);
      const tolerancia = 0.001;

      if (diferencia > tolerancia) {
        setParcelasError(
          `La suma de superficies de parcelas (${sumaParcelas.toFixed(4)} ha) debe ser igual a la superficie total del productor (${data.superficie_total_has.toFixed(4)} ha)`
        );
        return;
      }

      // Construir payload del productor
      const payload = {
        nombre_productor: data.nombre_productor,
        ci_documento: data.ci_documento,
        id_comunidad: data.id_comunidad,
        id_organizacion: data.id_organizacion,
        año_ingreso_programa: data.año_ingreso_programa,
        categoria_actual: data.categoria_actual,
        superficie_total_has: data.superficie_total_has,
        numero_parcelas_total: parcelas.length,
        ...(data.latitud && data.longitud
          ? {
              coordenadas: {
                latitud: data.latitud,
                longitud: data.longitud,
                altitud: data.altitud,
              },
            }
          : {}),
      };

      // Crear productor
      const productor = await createProductor(payload);

      // Crear parcelas para el productor
      for (const parcela of parcelas) {
        await parcelasService.createParcela({
          codigo_productor: productor.codigo_productor,
          numero_parcela: parcela.numero,
          superficie_ha: parcela.superficie_ha,
        });
      }

      reset();
      setParcelas([]);
      setParcelasError("");
      onClose();
      onSuccess?.(productor);
    } catch {
      // Error ya manejado por el hook
    }
  };

  const handleClose = () => {
    reset();
    setParcelas([]);
    setParcelasError("");
    onClose();
  };

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
      title="Nuevo Productor"
      size="large"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Información Personal">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          </div>
        </FormSection>

        <FormSection title="Información del Programa">
          <div className="p-3 mb-4 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-sm font-medium text-warning">
              El código se genera automáticamente y es permanente
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Comunidad"
              required
              error={errors.id_comunidad?.message}
            >
              <Select
                options={comunidades}
                value={watch("id_comunidad") || ""}
                onChange={(value) => setValue("id_comunidad", value)}
                placeholder="Selecciona una comunidad"
                disabled={
                  user?.nombre_rol.toLowerCase() === "técnico" &&
                  user.comunidades_ids?.length === 1
                }
              />
            </FormField>

            <FormField
              label="Organización"
              required
              error={errors.id_organizacion?.message}
            >
              <Select
                options={organizaciones}
                value={watch("id_organizacion") || ""}
                onChange={(value) => setValue("id_organizacion", value)}
                placeholder="Selecciona una organización"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Categoría"
              required
              error={errors.categoria_actual?.message}
            >
              <Select
                options={categorias}
                value={watch("categoria_actual") || ""}
                onChange={(value) =>
                  setValue(
                    "categoria_actual",
                    value as "E" | "T2" | "T1" | "T0"
                  )
                }
                placeholder="Selecciona categoría"
              />
            </FormField>

            <FormField
              label="Año de Ingreso"
              required
              error={errors.año_ingreso_programa?.message}
            >
              <Input
                {...register("año_ingreso_programa", { valueAsNumber: true })}
                type="number"
                min={2000}
                max={new Date().getFullYear()}
                placeholder={new Date().getFullYear().toString()}
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection
          title="Información de Producción"
          description="Define la superficie total y las parcelas del productor"
        >
          <FormField
            label="Superficie Total (Hectáreas)"
            required
            error={errors.superficie_total_has?.message}
          >
            <Input
              {...register("superficie_total_has", { valueAsNumber: true })}
              type="number"
              step="0.0001"
              min="0.01"
              max="10000"
              placeholder="0.0000"
            />
          </FormField>
        </FormSection>

        {watch("superficie_total_has") > 0 && (
          <ParcelasInput
            superficieTotalProductor={watch("superficie_total_has")}
            parcelas={parcelas}
            onChange={(nuevasParcelas) => {
              setParcelas(nuevasParcelas);
              setParcelasError("");
            }}
            error={parcelasError}
          />
        )}

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
                      setValue("altitud", undefined);
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
            Crear Productor
          </Button>
        </div>
      </form>
    </Modal>
  );
}
