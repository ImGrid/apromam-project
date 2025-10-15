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
import { useCreateProductor } from "../hooks/useCreateProductor";
import { useAuth } from "@/shared/hooks/useAuth";
import { apiClient, ENDPOINTS } from "@/shared/services/api";
import type { Productor } from "../types/productor.types";

// Schema de validacion
const productorSchema = z.object({
  nombre_productor: z.string().min(3, "Mínimo 3 caracteres"),
  ci_documento: z.string().min(5, "CI inválido"),
  id_comunidad: z.string().min(1, "Selecciona una comunidad"),
  año_ingreso_programa: z
    .number()
    .min(2000, "Año inválido")
    .max(new Date().getFullYear(), "Año no puede ser futuro"),
  categoria_actual: z.enum(["E", "2T", "1T", "0T"]),
  superficie_total_has: z.number().optional(),
  numero_parcelas_total: z.number().optional(),
  latitud: z.number().optional(),
  longitud: z.number().optional(),
  altitud: z.number().optional(),
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
  const [showLocationPicker, setShowLocationPicker] = useState(false);

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
      categoria_actual: "0T",
    },
  });

  // Cargar comunidades - memoizado
  const loadComunidades = useCallback(async () => {
    try {
      const response = await apiClient.get<{
        comunidades: Array<{ id_comunidad: string; nombre_comunidad: string }>;
      }>(ENDPOINTS.COMUNIDADES.BASE);

      let comunidadesData = response.data.comunidades;

      // Si es tecnico, filtrar solo su comunidad
      if (user?.nombre_rol.toLowerCase() === "técnico" && user.id_comunidad) {
        comunidadesData = comunidadesData.filter(
          (c) => c.id_comunidad === user.id_comunidad
        );
      }

      setComunidades(
        comunidadesData.map((c) => ({
          value: c.id_comunidad,
          label: c.nombre_comunidad,
        }))
      );
    } catch {
      console.error("Error cargando comunidades");
    }
  }, [user]);

  // Cargar comunidades al abrir modal
  useEffect(() => {
    if (isOpen) {
      loadComunidades();
      // Si es tecnico, preseleccionar su comunidad
      if (user?.nombre_rol.toLowerCase() === "técnico" && user.id_comunidad) {
        setValue("id_comunidad", user.id_comunidad);
      }
    }
  }, [isOpen, user, setValue, loadComunidades]);

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
      // Construir payload tipado
      const payload = {
        nombre_productor: data.nombre_productor,
        ci_documento: data.ci_documento,
        id_comunidad: data.id_comunidad,
        año_ingreso_programa: data.año_ingreso_programa,
        categoria_actual: data.categoria_actual,
        superficie_total_has: data.superficie_total_has,
        numero_parcelas_total: data.numero_parcelas_total,
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

      const productor = await createProductor(payload);
      reset();
      onClose();
      onSuccess?.(productor);
    } catch {
      // Error ya manejado por el hook
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const categorias: SelectOption[] = [
    { value: "E", label: "E - En conversión" },
    { value: "2T", label: "2T - Segundo año de transición" },
    { value: "1T", label: "1T - Primer año de transición" },
    { value: "0T", label: "0T - Orgánico" },
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
                  !!user.id_comunidad
                }
              />
            </FormField>

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
                    value as "E" | "2T" | "1T" | "0T"
                  )
                }
                placeholder="Selecciona categoría"
              />
            </FormField>
          </div>

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
        </FormSection>

        <FormSection
          title="Información de Producción"
          description="Opcional - Se puede completar después"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Superficie Total (Has)"
              error={errors.superficie_total_has?.message}
            >
              <Input
                {...register("superficie_total_has", { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="0.00"
              />
            </FormField>

            <FormField
              label="Número de Parcelas"
              error={errors.numero_parcelas_total?.message}
            >
              <Input
                {...register("numero_parcelas_total", {
                  valueAsNumber: true,
                })}
                type="number"
                placeholder="0"
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection
          title="Ubicación GPS del Domicilio"
          description="Opcional - Puedes capturar la ubicación ahora o después"
        >
          {!showLocationPicker ? (
            <div className="space-y-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowLocationPicker(true)}
                fullWidth
              >
                {watch("latitud") && watch("longitud")
                  ? "Cambiar Ubicación GPS"
                  : "Capturar Ubicación GPS"}
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
