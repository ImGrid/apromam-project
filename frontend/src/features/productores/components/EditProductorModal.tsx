// Modal para editar un productor existente

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Modal,
  Button,
  Input,
  Select,
  FormField,
  FormSection,
  Checkbox,
  type SelectOption,
} from "@/shared/components/ui";
import { useUpdateProductor } from "../hooks/useUpdateProductor";
import type { Productor } from "../types/productor.types";

// Schema para editar productor
const editProductorSchema = z.object({
  nombre_productor: z.string().min(3, "Mínimo 3 caracteres"),
  ci_documento: z.string().min(5, "CI inválido"),
  categoria_actual: z.enum(["E", "T2", "T1", "T0"]),
  superficie_total_has: z.number().min(0).optional(),
  numero_parcelas_total: z.number().int().min(0).optional(),
  activo: z.boolean(),
});

type EditProductorFormData = z.infer<typeof editProductorSchema>;

interface EditProductorModalProps {
  isOpen: boolean;
  onClose: () => void;
  productor: Productor | null;
  onSuccess?: () => void;
}

export function EditProductorModal({
  isOpen,
  onClose,
  productor,
  onSuccess,
}: EditProductorModalProps) {
  const { updateProductor, isLoading } = useUpdateProductor();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<EditProductorFormData>({
    resolver: zodResolver(editProductorSchema),
  });

  // Cargar datos del productor cuando cambia
  useEffect(() => {
    if (productor && isOpen) {
      setValue("nombre_productor", productor.nombre_productor);
      setValue("ci_documento", productor.ci_documento || "");
      setValue("categoria_actual", productor.categoria_actual);
      setValue("superficie_total_has", productor.superficie_total_has);
      setValue("numero_parcelas_total", productor.numero_parcelas_total);
      setValue("activo", productor.activo);
    }
  }, [productor, isOpen, setValue]);

  const onSubmit = async (data: EditProductorFormData) => {
    if (!productor) return;

    try {
      await updateProductor(productor.codigo_productor, {
        nombre_productor: data.nombre_productor,
        ci_documento: data.ci_documento,
        categoria_actual: data.categoria_actual,
        superficie_total_has: data.superficie_total_has,
        numero_parcelas_total: data.numero_parcelas_total,
        activo: data.activo,
      });

      reset();
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

  if (!productor) return null;

  const categorias: SelectOption[] = [
    { value: "E", label: "E - En transición" },
    { value: "T2", label: "T2 - Segundo año de transición" },
    { value: "T1", label: "T1 - Primer año de transición" },
    { value: "T0", label: "T0 - Inicio transición" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Productor"
      size="medium"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Información Básica">
          <div className="space-y-2 p-4 bg-neutral-bg rounded-lg border border-neutral-border">
            <p className="text-sm text-text-secondary">
              <strong>Código:</strong> {productor.codigo_productor}
            </p>
            <p className="text-sm text-text-secondary">
              <strong>Comunidad:</strong>{" "}
              {productor.nombre_municipio
                ? `${productor.nombre_comunidad} - ${productor.nombre_municipio}`
                : productor.nombre_comunidad}
            </p>
            <p className="text-xs text-text-tertiary">
              El código y la comunidad no se pueden modificar
            </p>
          </div>

          <FormField
            label="Nombre Completo"
            required
            error={errors.nombre_productor?.message}
          >
            <Input
              {...register("nombre_productor")}
              placeholder="Nombres y Apellidos"
            />
          </FormField>

          <FormField
            label="CI/Documento"
            required
            error={errors.ci_documento?.message}
          >
            <Input {...register("ci_documento")} placeholder="12345678" />
          </FormField>
        </FormSection>

        <FormSection title="Información del Programa">
          <FormField
            label="Categoría Actual"
            required
            error={errors.categoria_actual?.message}
          >
            <Select
              options={categorias}
              value={watch("categoria_actual")}
              onChange={(value) => setValue("categoria_actual", value as any)}
              placeholder="Selecciona categoría"
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Superficie Total (ha)"
              error={errors.superficie_total_has?.message}
            >
              <Input
                {...register("superficie_total_has", { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="0.00"
              />
            </FormField>

            <FormField
              label="Número de Parcelas"
              error={errors.numero_parcelas_total?.message}
            >
              <Input
                {...register("numero_parcelas_total", { valueAsNumber: true })}
                type="number"
                placeholder="0"
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Estado">
          <FormField label="Estado del productor">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox {...register("activo")} />
              <span className="text-sm text-text-secondary">
                Productor activo
              </span>
            </label>
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
