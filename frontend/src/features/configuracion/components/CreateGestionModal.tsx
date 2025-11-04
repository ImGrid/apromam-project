import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Modal,
  Button,
  Input,
  FormField,
  FormSection,
} from "@/shared/components/ui";
import { useCreateGestion } from "../hooks/useCreateGestion";

const gestionSchema = z.object({
  anio_gestion: z
    .number()
    .int("Debe ser un año entero")
    .min(2000, "Año debe ser mayor a 2000")
    .max(2100, "Año debe ser menor a 2100"),
});

type GestionFormData = z.infer<typeof gestionSchema>;

interface CreateGestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

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
    reset,
  } = useForm<GestionFormData>({
    resolver: zodResolver(gestionSchema),
  });

  const onSubmit = async (data: GestionFormData) => {
    try {
      await createGestion({
        anio_gestion: data.anio_gestion,
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
