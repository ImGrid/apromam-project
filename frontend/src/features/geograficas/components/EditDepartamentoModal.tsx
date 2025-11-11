/**
 * Modal para editar un departamento existente
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Button, Input, FormField, Checkbox } from "@/shared/components/ui";
import { useUpdateDepartamento } from "../hooks/useUpdateDepartamento";
import type { Departamento } from "../types/geografica.types";

const departamentoSchema = z.object({
  nombre_departamento: z.string().min(3, "Mínimo 3 caracteres"),
  activo: z.boolean(),
});

type DepartamentoFormData = z.infer<typeof departamentoSchema>;

interface EditDepartamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  departamento: Departamento | null;
  onSuccess?: () => void;
}

export function EditDepartamentoModal({
  isOpen,
  onClose,
  departamento,
  onSuccess,
}: EditDepartamentoModalProps) {
  const { updateDepartamento, isLoading } = useUpdateDepartamento();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DepartamentoFormData>({
    resolver: zodResolver(departamentoSchema),
  });

  // Cargar datos del departamento cuando se abre el modal
  useEffect(() => {
    if (isOpen && departamento) {
      reset({
        nombre_departamento: departamento.nombre_departamento,
        activo: departamento.activo,
      });
    }
  }, [isOpen, departamento, reset]);

  const onSubmit = async (data: DepartamentoFormData) => {
    if (!departamento) return;

    try {
      await updateDepartamento(departamento.id_departamento, data);
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

  if (!departamento) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Departamento"
      size="small"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información del departamento */}
        <div className="p-4 rounded-lg bg-neutral-bg">
          <p className="text-sm font-medium text-text-secondary">
            Editando departamento
          </p>
          <p className="mt-1 text-base font-semibold text-text-primary">
            {departamento.nombre_departamento}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-4 text-xs text-text-secondary">
            <div>
              <span className="font-medium">Provincias:</span> {departamento.cantidad_provincias || 0}
            </div>
            <div>
              <span className="font-medium">Municipios:</span> {departamento.cantidad_municipios || 0}
            </div>
            <div>
              <span className="font-medium">Comunidades:</span> {departamento.cantidad_comunidades || 0}
            </div>
            <div>
              <span className="font-medium">Productores:</span> {departamento.cantidad_productores || 0}
            </div>
          </div>
        </div>

        {/* Campo de nombre */}
        <FormField label="Nombre de Departamento" error={errors.nombre_departamento?.message} required>
          <Input
            {...register("nombre_departamento")}
            placeholder="Ej: Chuquisaca"
            disabled={isLoading}
          />
        </FormField>

        {/* Estado activo */}
        <FormField label="Estado">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox {...register("activo")} disabled={isLoading} />
            <span className="text-sm text-text-secondary">
              Departamento activo
            </span>
          </label>
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
