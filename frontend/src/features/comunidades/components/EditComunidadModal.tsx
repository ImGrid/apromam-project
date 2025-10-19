import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Modal,
  Button,
  Input,
  FormField,
  FormSection,
  Checkbox,
} from "@/shared/components/ui";
import { useUpdateComunidad } from "../hooks/useUpdateComunidad";
import type { Comunidad } from "../types/comunidad.types";

// Schema de validacion
const editComunidadSchema = z.object({
  nombre_comunidad: z.string().min(3, "Mínimo 3 caracteres"),
  abreviatura_comunidad: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(5, "Máximo 5 caracteres")
    .regex(/^[A-Z]+$/, "Solo letras mayúsculas"),
  activo: z.boolean(),
});

type EditComunidadFormData = z.infer<typeof editComunidadSchema>;

interface EditComunidadModalProps {
  isOpen: boolean;
  onClose: () => void;
  comunidad: Comunidad | null;
  onSuccess?: () => void;
}

export function EditComunidadModal({
  isOpen,
  onClose,
  comunidad,
  onSuccess,
}: EditComunidadModalProps) {
  const { updateComunidad, isLoading } = useUpdateComunidad();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<EditComunidadFormData>({
    resolver: zodResolver(editComunidadSchema),
  });

  // Cargar datos de la comunidad cuando cambia
  useEffect(() => {
    if (comunidad && isOpen) {
      setValue("nombre_comunidad", comunidad.nombre_comunidad);
      setValue("abreviatura_comunidad", comunidad.abreviatura_comunidad);
      setValue("activo", comunidad.activo);
    }
  }, [comunidad, isOpen, setValue]);

  const onSubmit = async (data: EditComunidadFormData) => {
    if (!comunidad) return;

    try {
      await updateComunidad(comunidad.id_comunidad, {
        nombre_comunidad: data.nombre_comunidad,
        abreviatura_comunidad: data.abreviatura_comunidad,
        activo: data.activo,
      });

      reset();
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

  // Transformar input a mayusculas para abreviatura
  const handleAbreviaturaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setValue("abreviatura_comunidad", value);
  };

  if (!comunidad) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Comunidad"
      size="medium"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Información de la Comunidad">
          <FormField
            label="Nombre de la Comunidad"
            required
            error={errors.nombre_comunidad?.message}
          >
            <Input
              {...register("nombre_comunidad")}
              placeholder="Ej: Villa San Pedro"
            />
          </FormField>

          <FormField
            label="Abreviatura"
            required
            error={errors.abreviatura_comunidad?.message}
            helperText="2-5 letras mayúsculas, debe ser única"
          >
            <Input
              {...register("abreviatura_comunidad")}
              onChange={handleAbreviaturaChange}
              maxLength={5}
              placeholder="Ej: VSP"
            />
          </FormField>

          <FormField label="Estado">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox {...register("activo")} />
              <span className="text-sm text-text-secondary">
                Comunidad activa
              </span>
            </label>
          </FormField>
        </FormSection>

        <FormSection title="Ubicación Geográfica">
          <div className="space-y-2 p-4 bg-neutral-bg rounded-lg border border-neutral-border">
            <p className="text-sm text-text-secondary">
              <strong>Municipio:</strong> {comunidad.nombre_municipio}
            </p>
            <p className="text-sm text-text-secondary">
              <strong>Provincia:</strong> {comunidad.nombre_provincia}
            </p>
            <p className="text-xs text-text-tertiary mt-2">
              La ubicación geográfica no se puede modificar
            </p>
          </div>
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
