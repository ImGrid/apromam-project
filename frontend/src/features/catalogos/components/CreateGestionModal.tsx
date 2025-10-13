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
} from "@/shared/components/ui";
import { useCreateGestion } from "../hooks/useCreateGestion";

const gestionSchema = z
  .object({
    anio_gestion: z
      .number()
      .int("Debe ser un año entero")
      .min(2000, "Año debe ser mayor a 2000")
      .max(2100, "Año debe ser menor a 2100"),
    descripcion: z.string().optional(),
    fecha_inicio: z.string().optional(),
    fecha_fin: z.string().optional(),
    estado_gestion: z.enum(["planificada", "activa", "finalizada"]),
    marcar_activa: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.fecha_inicio && data.fecha_fin) {
        return new Date(data.fecha_inicio) < new Date(data.fecha_fin);
      }
      return true;
    },
    {
      message: "La fecha de inicio debe ser anterior a la fecha de fin",
      path: ["fecha_fin"],
    }
  );

type GestionFormData = z.infer<typeof gestionSchema>;

interface CreateGestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const estadoOptions = [
  { value: "planificada", label: "Planificada" },
  { value: "activa", label: "Activa" },
  { value: "finalizada", label: "Finalizada" },
];

export function CreateGestionModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateGestionModalProps) {
  const { createGestion, isLoading } = useCreateGestion();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<GestionFormData>({
    resolver: zodResolver(gestionSchema),
    defaultValues: {
      estado_gestion: "planificada",
      marcar_activa: false,
    },
  });

  const estadoGestion = watch("estado_gestion");
  const marcarActiva = watch("marcar_activa");

  const onSubmit = async (data: GestionFormData) => {
    try {
      await createGestion({
        anio_gestion: data.anio_gestion,
        descripcion: data.descripcion || undefined,
        fecha_inicio: data.fecha_inicio || undefined,
        fecha_fin: data.fecha_fin || undefined,
        estado_gestion: data.estado_gestion,
      });

      reset();
      onClose();
      onSuccess?.();
    } catch (error) {
      // Error ya manejado por el hook
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nueva Gestión"
      size="medium"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Información de la Gestión">
          <FormField
            label="Año de Gestión"
            required
            error={errors.anio_gestion?.message}
          >
            <Input
              {...register("anio_gestion", { valueAsNumber: true })}
              inputType="number"
              placeholder="2024"
            />
          </FormField>

          <FormField
            label="Descripción"
            error={errors.descripcion?.message}
            helperText="Descripción opcional de la gestión"
          >
            <Input
              {...register("descripcion")}
              placeholder="Gestión agrícola 2024"
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Fecha de Inicio"
              error={errors.fecha_inicio?.message}
            >
              <Input
                {...register("fecha_inicio")}
                inputType="date"
              />
            </FormField>

            <FormField
              label="Fecha de Fin"
              error={errors.fecha_fin?.message}
            >
              <Input
                {...register("fecha_fin")}
                inputType="date"
              />
            </FormField>
          </div>

          <FormField
            label="Estado de la Gestión"
            error={errors.estado_gestion?.message}
          >
            <Select
              options={estadoOptions}
              value={estadoGestion}
              onChange={(value) =>
                setValue("estado_gestion", value as "planificada" | "activa" | "finalizada")
              }
              placeholder="Selecciona un estado"
            />
          </FormField>

          <FormField
            error={errors.marcar_activa?.message}
            helperText="La gestión activa es la que se usa por defecto en el sistema"
          >
            <div className="flex items-center gap-2">
              <Checkbox
                checked={marcarActiva || false}
                onChange={(e) => setValue("marcar_activa", e.target.checked)}
                label="Marcar como gestión activa"
              />
            </div>
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
            Crear Gestión
          </Button>
        </div>
      </form>
    </Modal>
  );
}
