/**
 * Modal para editar un municipio existente
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Button, Input, FormField } from "@/shared/components/ui";
import { ProvinciasSelect } from "./ProvinciasSelect";
import { useUpdateMunicipio } from "../hooks/useUpdateMunicipio";
import type { Municipio } from "../types/geografica.types";

const municipioSchema = z.object({
  nombre_municipio: z.string().min(3, "Mínimo 3 caracteres"),
  id_provincia: z.string().min(1, "Selecciona una provincia"),
});

type MunicipioFormData = z.infer<typeof municipioSchema>;

interface EditMunicipioModalProps {
  isOpen: boolean;
  onClose: () => void;
  municipio: Municipio | null;
  onSuccess?: () => void;
}

export function EditMunicipioModal({
  isOpen,
  onClose,
  municipio,
  onSuccess,
}: EditMunicipioModalProps) {
  const { updateMunicipio, isLoading } = useUpdateMunicipio();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<MunicipioFormData>({
    resolver: zodResolver(municipioSchema),
  });

  // Cargar datos del municipio cuando se abre el modal
  useEffect(() => {
    if (isOpen && municipio) {
      reset({
        nombre_municipio: municipio.nombre_municipio,
        id_provincia: municipio.id_provincia,
      });
    }
  }, [isOpen, municipio, reset]);

  const onSubmit = async (data: MunicipioFormData) => {
    if (!municipio) return;

    try {
      await updateMunicipio(municipio.id_municipio, data);
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

  if (!municipio) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Municipio"
      size="small"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información del municipio */}
        <div className="p-4 rounded-lg bg-neutral-bg">
          <p className="text-sm font-medium text-text-secondary">
            Editando municipio
          </p>
          <p className="mt-1 text-base font-semibold text-text-primary">
            {municipio.nombre_municipio}
          </p>
          <p className="text-sm text-text-secondary">
            Provincia: {municipio.nombre_provincia}
          </p>
        </div>

        {/* Campo de nombre */}
        <FormField
          label="Nombre de Municipio"
          error={errors.nombre_municipio?.message}
          required
        >
          <Input
            {...register("nombre_municipio")}
            placeholder="Ej: Warnes"
            disabled={isLoading}
          />
        </FormField>

        {/* Selector de provincia */}
        <FormField
          label="Provincia"
          error={errors.id_provincia?.message}
          required
        >
          <ProvinciasSelect
            value={watch("id_provincia")}
            onChange={(value) => setValue("id_provincia", value)}
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
