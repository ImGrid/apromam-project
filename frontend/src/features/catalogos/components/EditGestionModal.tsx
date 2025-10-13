import { useEffect } from "react";
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
import { useUpdateGestion } from "../hooks/useUpdateGestion";
import type { Gestion } from "../types/catalogo.types";

const editGestionSchema = z
  .object({
    descripcion: z.string().optional(),
    fecha_inicio: z.string().optional(),
    fecha_fin: z.string().optional(),
    estado_gestion: z.enum(["planificada", "activa", "finalizada"]),
    activa: z.boolean(),
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

type EditGestionFormData = z.infer<typeof editGestionSchema>;

interface EditGestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  gestion: Gestion;
  onSuccess?: () => void;
}

const estadoOptions = [
  { value: "planificada", label: "Planificada" },
  { value: "activa", label: "Activa" },
  { value: "finalizada", label: "Finalizada" },
];

export function EditGestionModal({
  isOpen,
  onClose,
  gestion,
  onSuccess,
}: EditGestionModalProps) {
  const { updateGestion, isLoading } = useUpdateGestion();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<EditGestionFormData>({
    resolver: zodResolver(editGestionSchema),
    defaultValues: {
      descripcion: gestion.descripcion || "",
      fecha_inicio: gestion.fecha_inicio || "",
      fecha_fin: gestion.fecha_fin || "",
      estado_gestion: gestion.estado_gestion,
      activa: gestion.activa,
    },
  });

  const estadoGestion = watch("estado_gestion");
  const activa = watch("activa");

  useEffect(() => {
    if (isOpen) {
      reset({
        descripcion: gestion.descripcion || "",
        fecha_inicio: gestion.fecha_inicio || "",
        fecha_fin: gestion.fecha_fin || "",
        estado_gestion: gestion.estado_gestion,
        activa: gestion.activa,
      });
    }
  }, [isOpen, gestion, reset]);

  const onSubmit = async (data: EditGestionFormData) => {
    try {
      await updateGestion(gestion.id_gestion, {
        descripcion: data.descripcion || undefined,
        fecha_inicio: data.fecha_inicio || undefined,
        fecha_fin: data.fecha_fin || undefined,
        estado_gestion: data.estado_gestion,
        activa: data.activa,
      });

      onClose();
      onSuccess?.();
    } catch {
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
      title="Editar Gestión"
      size="medium"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="p-4 rounded-lg bg-neutral-bg">
          <p className="text-sm text-text-secondary">
            <span className="font-medium">Año de Gestión:</span> {gestion.anio_gestion}
          </p>
          <p className="mt-2 text-xs text-text-secondary">
            El año de gestión no se puede modificar
          </p>
        </div>

        <FormSection title="Información de la Gestión">
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
            label="Gestión activa"
            helperText="La gestión activa es la que se usa por defecto en el sistema"
          >
            <div className="flex items-center gap-2">
              <Checkbox
                checked={activa}
                onChange={(e) => setValue("activa", e.target.checked)}
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
            Guardar Cambios
          </Button>
        </div>
      </form>
    </Modal>
  );
}
