// Formulario de seguimiento de No Conformidad (COMPONENTE CORE)
// Permite actualizar estado y agregar comentarios
// Diseño compacto basado en research de UX

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { useUpdateSeguimiento } from "../hooks";
import { UpdateSeguimientoNCSchema, ESTADO_SEGUIMIENTO_LABELS } from "../types";
import type { UpdateSeguimientoInput, EstadoSeguimiento } from "../types";

interface SeguimientoFormProps {
  idNoConformidad: string;
  estadoActual: EstadoSeguimiento;
  onSuccess?: () => void;
}

export function SeguimientoForm({
  idNoConformidad,
  estadoActual,
  onSuccess,
}: SeguimientoFormProps) {
  const { mutate: updateSeguimiento, isPending } = useUpdateSeguimiento();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateSeguimientoInput>({
    resolver: zodResolver(UpdateSeguimientoNCSchema),
    defaultValues: {
      estado_seguimiento: estadoActual,
      comentario_seguimiento: "",
    },
  });

  const onSubmit = (data: UpdateSeguimientoInput) => {
    updateSeguimiento(
      {
        id: idNoConformidad,
        data,
      },
      {
        onSuccess: () => {
          reset();
          onSuccess?.();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {/* Selector de estado - Campo principal */}
      <FormField
        label="Estado de Seguimiento"
        required
        error={errors.estado_seguimiento?.message}
      >
        <select
          {...register("estado_seguimiento")}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="pendiente">{ESTADO_SEGUIMIENTO_LABELS.pendiente}</option>
          <option value="seguimiento">{ESTADO_SEGUIMIENTO_LABELS.seguimiento}</option>
          <option value="corregido">{ESTADO_SEGUIMIENTO_LABELS.corregido}</option>
        </select>
      </FormField>

      {/* Comentario de seguimiento */}
      <FormField
        label="Comentario de Seguimiento"
        helperText="Máximo 1000 caracteres. Describe el estado actual o acciones realizadas."
        error={errors.comentario_seguimiento?.message}
      >
        <textarea
          {...register("comentario_seguimiento")}
          rows={4}
          maxLength={1000}
          placeholder="Ej: Se verificó en campo que el productor retiró los fertilizantes convencionales..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </FormField>

      {/* Botón de guardar */}
      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary" size="small" isLoading={isPending}>
          Actualizar Seguimiento
        </Button>
      </div>
    </form>
  );
}
