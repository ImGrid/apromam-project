import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Button, Input, FormField } from "@/shared/components/ui";
import { ProvinciasSelect } from "./ProvinciasSelect";
import { geograficasService } from "../services/geograficas.service";
import { showToast } from "@/shared/components/ui";
import { useState } from "react";

const municipioSchema = z.object({
  nombre_municipio: z.string().min(3, "Mínimo 3 caracteres"),
  id_provincia: z.string().min(1, "Selecciona una provincia"),
});

type MunicipioFormData = z.infer<typeof municipioSchema>;

interface CreateMunicipioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateMunicipioModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateMunicipioModalProps) {
  const [isLoading, setIsLoading] = useState(false);

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

  const onSubmit = async (data: MunicipioFormData) => {
    setIsLoading(true);
    try {
      await geograficasService.createMunicipio(data);
      showToast.success("Municipio creado exitosamente");
      reset();
      onClose();
      onSuccess?.();
    } catch (error) {
      showToast.error(
        error instanceof Error ? error.message : "Error al crear municipio"
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
      title="Nuevo Municipio"
      size="small"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          label="Provincia"
          required
          error={errors.id_provincia?.message}
        >
          <ProvinciasSelect
            value={watch("id_provincia")}
            onChange={(value) => setValue("id_provincia", value)}
          />
        </FormField>

        <FormField
          label="Nombre del Municipio"
          required
          error={errors.nombre_municipio?.message}
        >
          <Input {...register("nombre_municipio")} placeholder="Ej: Murillo" />
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
            Crear Municipio
          </Button>
        </div>
      </form>
    </Modal>
  );
}
