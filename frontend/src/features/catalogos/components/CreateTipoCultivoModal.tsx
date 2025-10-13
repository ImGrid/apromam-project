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
import { useCreateTipoCultivo } from "../hooks/useCreateTipoCultivo";

const tipoCultivoSchema = z.object({
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
});

type TipoCultivoFormData = z.infer<typeof tipoCultivoSchema>;

interface CreateTipoCultivoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateTipoCultivoModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTipoCultivoModalProps) {
  const { createTipoCultivo, isLoading } = useCreateTipoCultivo();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<TipoCultivoFormData>({
    resolver: zodResolver(tipoCultivoSchema),
    defaultValues: {
      es_principal_certificable: false,
    },
  });

  const esPrincipalCertificable = watch("es_principal_certificable");

  const onSubmit = async (data: TipoCultivoFormData) => {
    try {
      await createTipoCultivo({
        nombre_cultivo: data.nombre_cultivo,
        descripcion: data.descripcion || undefined,
        es_principal_certificable: data.es_principal_certificable,
        rendimiento_promedio_qq_ha: data.rendimiento_promedio_qq_ha,
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
      title="Nuevo Tipo de Cultivo"
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
                checked={esPrincipalCertificable || false}
                onChange={(e) =>
                  setValue("es_principal_certificable", e.target.checked)
                }
                label="Es un cultivo principal certificable"
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
            Crear Tipo de Cultivo
          </Button>
        </div>
      </form>
    </Modal>
  );
}
