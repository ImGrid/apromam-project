/**
 * Modal para editar una provincia existente
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Button, Input, FormField } from "@/shared/components/ui";
import { useUpdateProvincia } from "../hooks/useUpdateProvincia";
import type { Provincia } from "../types/geografica.types";

const provinciaSchema = z.object({
  nombre_provincia: z.string().min(3, "Mínimo 3 caracteres"),
});

type ProvinciaFormData = z.infer<typeof provinciaSchema>;

interface EditProvinciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  provincia: Provincia | null;
  onSuccess?: () => void;
}

export function EditProvinciaModal({
  isOpen,
  onClose,
  provincia,
  onSuccess,
}: EditProvinciaModalProps) {
  const { updateProvincia, isLoading } = useUpdateProvincia();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProvinciaFormData>({
    resolver: zodResolver(provinciaSchema),
  });

  // Cargar datos de la provincia cuando se abre el modal
  useEffect(() => {
    if (isOpen && provincia) {
      reset({
        nombre_provincia: provincia.nombre_provincia,
      });
    }
  }, [isOpen, provincia, reset]);

  const onSubmit = async (data: ProvinciaFormData) => {
    if (!provincia) return;

    try {
      await updateProvincia(provincia.id_provincia, data);
      reset();
      onClose();
      onSuccess?.();
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!provincia) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Provincia"
      size="small"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información de la provincia */}
        <div className="p-4 rounded-lg bg-neutral-bg">
          <p className="text-sm font-medium text-text-secondary">
            Editando provincia
          </p>
          <p className="mt-1 text-base font-semibold text-text-primary">
            {provincia.nombre_provincia}
          </p>
        </div>

        {/* Campo de nombre */}
        <FormField label="Nombre de Provincia" error={errors.nombre_provincia?.message} required>
          <Input
            {...register("nombre_provincia")}
            placeholder="Ej: Santa Cruz"
            disabled={isLoading}
          />
        </FormField>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-border">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Guardar Cambios
          </Button>
        </div>
      </form>
    </Modal>
  );
}
