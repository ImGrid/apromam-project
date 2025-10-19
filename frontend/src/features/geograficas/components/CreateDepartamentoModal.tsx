import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Button, Input, FormField } from "@/shared/components/ui";
import { useCreateDepartamento } from "../hooks/useCreateDepartamento";

const departamentoSchema = z.object({
  nombre_departamento: z.string().min(3, "Mínimo 3 caracteres"),
});

type DepartamentoFormData = z.infer<typeof departamentoSchema>;

interface CreateDepartamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateDepartamentoModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateDepartamentoModalProps) {
  const { createDepartamento, isLoading } = useCreateDepartamento();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DepartamentoFormData>({
    resolver: zodResolver(departamentoSchema),
  });

  const onSubmit = async (data: DepartamentoFormData) => {
    try {
      await createDepartamento(data);
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nuevo Departamento"
      size="small"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          label="Nombre del Departamento"
          required
          error={errors.nombre_departamento?.message}
        >
          <Input
            {...register("nombre_departamento")}
            placeholder="Ej: Chuquisaca"
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
            Crear Departamento
          </Button>
        </div>
      </form>
    </Modal>
  );
}
