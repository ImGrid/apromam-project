/**
 * Modal para asignar o cambiar comunidad de un técnico
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Modal,
  Button,
  Select,
  FormField,
  type SelectOption,
} from "@/shared/components/ui";
import { useAsignarComunidad } from "../hooks/useAsignarComunidad";
import { useComunidades } from "@/features/comunidades/hooks/useComunidades";
import type { Tecnico } from "../types/tecnico.types";

// Schema de validación
const asignarComunidadSchema = z.object({
  id_comunidad: z.string().optional(),
});

type AsignarComunidadFormData = z.infer<typeof asignarComunidadSchema>;

interface AsignarComunidadModalProps {
  isOpen: boolean;
  onClose: () => void;
  tecnico: Tecnico | null;
  onSuccess?: () => void;
}

export function AsignarComunidadModal({
  isOpen,
  onClose,
  tecnico,
  onSuccess,
}: AsignarComunidadModalProps) {
  const { asignarComunidad, isLoading } = useAsignarComunidad();
  const { comunidades, isLoading: loadingComunidades } = useComunidades();

  const {
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<AsignarComunidadFormData>({
    resolver: zodResolver(asignarComunidadSchema),
  });

  const idComunidadWatched = watch("id_comunidad");

  // Cargar comunidad actual del técnico cuando se abre el modal
  useEffect(() => {
    if (isOpen && tecnico) {
      reset({
        id_comunidad: tecnico.id_comunidad || "",
      });
    }
  }, [isOpen, tecnico, reset]);

  const onSubmit = async (data: AsignarComunidadFormData) => {
    if (!tecnico) return;

    try {
      await asignarComunidad(
        tecnico.id_usuario,
        data.id_comunidad || null
      );

      if (onSuccess) {
        onSuccess();
      }

      handleClose();
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!tecnico) return null;

  // Opciones de comunidades
  const comunidadesOptions: SelectOption[] = [
    { value: "", label: "Sin comunidad asignada" },
    ...comunidades.map((c) => ({
      value: c.id_comunidad,
      label: c.nombre_comunidad,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Asignar Comunidad"
      size="small"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información del técnico */}
        <div className="p-4 rounded-lg bg-neutral-bg">
          <p className="text-sm font-medium text-text-secondary">Técnico</p>
          <p className="mt-1 text-base font-semibold text-text-primary">
            {tecnico.nombre_completo}
          </p>
          <p className="text-sm text-text-secondary">{tecnico.email}</p>
        </div>

        {/* Selector de comunidad */}
        <FormField
          label="Comunidad"
          error={errors.id_comunidad?.message}
          required
        >
          <Select
            options={comunidadesOptions}
            value={idComunidadWatched || ""}
            onChange={(value) => setValue("id_comunidad", value)}
            placeholder="Selecciona una comunidad"
            disabled={loadingComunidades || isLoading}
          />
        </FormField>

        {/* Info adicional */}
        {tecnico.nombre_comunidad && (
          <div className="text-sm text-text-secondary">
            <p>
              Comunidad actual: <strong>{tecnico.nombre_comunidad}</strong>
            </p>
          </div>
        )}

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
            {idComunidadWatched
              ? "Asignar Comunidad"
              : "Remover Comunidad"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
