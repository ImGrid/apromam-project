import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Modal,
  Button,
  FormField,
  FormSection,
  Checkbox,
} from "@/shared/components/ui";
import { useUpdateGestion } from "../hooks/useUpdateGestion";
import type { Gestion } from "../types/gestion.types";

const editGestionSchema = z.object({
  activa: z.boolean(),
});

type EditGestionFormData = z.infer<typeof editGestionSchema>;

interface EditGestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  gestion: Gestion;
  onSuccess?: () => void;
}

export function EditGestionModal({
  isOpen,
  onClose,
  gestion,
  onSuccess,
}: EditGestionModalProps) {
  const { updateGestion, isLoading } = useUpdateGestion();

  const {
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<EditGestionFormData>({
    resolver: zodResolver(editGestionSchema),
    defaultValues: {
      activa: gestion.activa,
    },
  });

  const activa = watch("activa");

  useEffect(() => {
    if (isOpen) {
      reset({
        activa: gestion.activa,
      });
    }
  }, [isOpen, gestion, reset]);

  const onSubmit = async (data: EditGestionFormData) => {
    try {
      await updateGestion(gestion.id_gestion, {
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
