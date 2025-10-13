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
import { useUpdateTipoCultivo } from "../hooks/useUpdateTipoCultivo";
import type { TipoCultivo } from "../types/catalogo.types";

const editTipoCultivoSchema = z.object({
  nombre_cultivo: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(100, "Máximo 100 caracteres"),
  descripcion: z.string().optional(),
  es_principal_certificable: z.boolean(),
  rendimiento_promedio_qq_ha: z
    .number()
    .min(0, "Debe ser mayor o igual a 0")
    .optional(),
  activo: z.boolean(),
});

type EditTipoCultivoFormData = z.infer<typeof editTipoCultivoSchema>;

interface EditTipoCultivoModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipoCultivo: TipoCultivo;
  onSuccess?: () => void;
}

export function EditTipoCultivoModal({
  isOpen,
  onClose,
  tipoCultivo,
  onSuccess,
}: EditTipoCultivoModalProps) {
  const { updateTipoCultivo, isLoading } = useUpdateTipoCultivo();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<EditTipoCultivoFormData>({
    resolver: zodResolver(editTipoCultivoSchema),
    defaultValues: {
      nombre_cultivo: tipoCultivo.nombre_cultivo,
      descripcion: tipoCultivo.descripcion || "",
      es_principal_certificable: tipoCultivo.es_principal_certificable,
      rendimiento_promedio_qq_ha: tipoCultivo.rendimiento_promedio_qq_ha || undefined,
      activo: tipoCultivo.activo,
    },
  });

  const esPrincipalCertificable = watch("es_principal_certificable");
  const activo = watch("activo");

  useEffect(() => {
    if (isOpen) {
      reset({
        nombre_cultivo: tipoCultivo.nombre_cultivo,
        descripcion: tipoCultivo.descripcion || "",
        es_principal_certificable: tipoCultivo.es_principal_certificable,
        rendimiento_promedio_qq_ha: tipoCultivo.rendimiento_promedio_qq_ha || undefined,
        activo: tipoCultivo.activo,
      });
    }
  }, [isOpen, tipoCultivo, reset]);

  const onSubmit = async (data: EditTipoCultivoFormData) => {
    try {
      await updateTipoCultivo(tipoCultivo.id_tipo_cultivo, {
        nombre_cultivo: data.nombre_cultivo,
        descripcion: data.descripcion || undefined,
        es_principal_certificable: data.es_principal_certificable,
        rendimiento_promedio_qq_ha: data.rendimiento_promedio_qq_ha,
        activo: data.activo,
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
      title="Editar Tipo de Cultivo"
      size="medium"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Información del Cultivo">
          <FormField
            label="Nombre del Cultivo"
            required
            error={errors.nombre_cultivo?.message}
          >
            <Input
              {...register("nombre_cultivo")}
              placeholder="Ej: Café, Cacao, Quinua"
            />
          </FormField>

          <FormField
            label="Descripción"
            error={errors.descripcion?.message}
            helperText="Descripción opcional del tipo de cultivo"
          >
            <Input
              {...register("descripcion")}
              placeholder="Descripción del cultivo"
            />
          </FormField>

          <FormField
            label="Rendimiento Promedio (qq/ha)"
            error={errors.rendimiento_promedio_qq_ha?.message}
            helperText="Rendimiento promedio en quintales por hectárea"
          >
            <Input
              {...register("rendimiento_promedio_qq_ha", {
                valueAsNumber: true,
              })}
              inputType="number"
              placeholder="0.00"
              step="0.01"
            />
          </FormField>

          <FormField error={errors.es_principal_certificable?.message}>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={esPrincipalCertificable}
                onChange={(e) =>
                  setValue("es_principal_certificable", e.target.checked)
                }
                label="Es un cultivo principal certificable"
              />
            </div>
          </FormField>

          <FormField label="Estado del tipo de cultivo">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={activo}
                onChange={(e) => setValue("activo", e.target.checked)}
                label="Tipo de cultivo activo"
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
