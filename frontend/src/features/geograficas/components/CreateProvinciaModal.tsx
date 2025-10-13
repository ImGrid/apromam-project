import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Button, Input, FormField } from "@/shared/components/ui";
import { geograficasService } from "../services/geograficas.service";
import { showToast } from "@/shared/components/ui";
import { useState } from "react";

const provinciaSchema = z.object({
  nombre_provincia: z.string().min(3, "Mínimo 3 caracteres"),
});

type ProvinciaFormData = z.infer<typeof provinciaSchema>;

interface CreateProvinciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateProvinciaModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateProvinciaModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProvinciaFormData>({
    resolver: zodResolver(provinciaSchema),
  });

  const onSubmit = async (data: ProvinciaFormData) => {
    setIsLoading(true);
    try {
      await geograficasService.createProvincia(data);
      showToast.success("Provincia creada exitosamente");
      reset();
      onClose();
      onSuccess?.();
    } catch (error) {
      showToast.error(
        error instanceof Error ? error.message : "Error al crear provincia"
      );
    } finally {
      setIsLoading(false);
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
      title="Nueva Provincia"
      size="small"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          label="Nombre de la Provincia"
          required
          error={errors.nombre_provincia?.message}
        >
          <Input
            {...register("nombre_provincia")}
            placeholder="Ej: La Paz"
            autoFocus
          />
        </FormField>

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
            Crear Provincia
          </Button>
        </div>
      </form>
    </Modal>
  );
}
