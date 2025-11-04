// Modal para editar un técnico existente
// Incluye asignación de comunidad

import { useEffect, useState, useCallback } from "react";
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
import { apiClient, ENDPOINTS } from "@/shared/services/api";
import { showToast } from "@/shared/hooks/useToast";
import type { Tecnico } from "../types/tecnico.types";

const editTecnicoSchema = z.object({
  email: z.string().email("Email inválido"),
  nombre_completo: z.string().min(3, "Mínimo 3 caracteres"),
  id_comunidad: z.string().optional(),
  activo: z.boolean(),
});

type EditTecnicoFormData = z.infer<typeof editTecnicoSchema>;

interface EditTecnicoModalProps {
  isOpen: boolean;
  onClose: () => void;
  tecnico: Tecnico | null;
  onSuccess?: () => void;
}

export function EditTecnicoModal({
  isOpen,
  onClose,
  tecnico,
  onSuccess,
}: EditTecnicoModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [comunidades, setComunidades] = useState<SelectOption[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<EditTecnicoFormData>({
    resolver: zodResolver(editTecnicoSchema),
  });

  // Cargar comunidades
  const loadComunidades = useCallback(async () => {
    try {
      const response = await apiClient.get<{
        comunidades: Array<{
          id_comunidad: string;
          nombre_comunidad: string;
          nombre_municipio?: string;
        }>;
      }>(ENDPOINTS.COMUNIDADES.BASE);

      setComunidades(
        response.data.comunidades.map((c) => ({
          value: c.id_comunidad,
          label: c.nombre_municipio
            ? `${c.nombre_comunidad} - ${c.nombre_municipio}`
            : c.nombre_comunidad,
        }))
      );
    } catch (error) {
      console.error("Error cargando comunidades:", error);
    }
  }, []);

  // Cargar datos del técnico cuando cambia
  useEffect(() => {
    if (tecnico && isOpen) {
      setValue("email", tecnico.email);
      setValue("nombre_completo", tecnico.nombre_completo);
      setValue("id_comunidad", tecnico.id_comunidad || "");
      setValue("activo", tecnico.activo);
      loadComunidades();
    }
  }, [tecnico, isOpen, setValue, loadComunidades]);

  const onSubmit = async (data: EditTecnicoFormData) => {
    if (!tecnico) return;

    try {
      setIsLoading(true);

      await apiClient.put(ENDPOINTS.USUARIOS.BY_ID(tecnico.id_usuario), {
        email: data.email,
        nombre_completo: data.nombre_completo,
        id_comunidad: data.id_comunidad || null,
        activo: data.activo,
      });

      showToast.success("Técnico actualizado exitosamente");
      reset();
      onClose();
      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Error al actualizar técnico";
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!tecnico) return null;

  // Opciones de comunidades con opción vacía
  const comunidadesOptions: SelectOption[] = [
    { value: "", label: "Sin comunidad asignada" },
    ...comunidades,
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Técnico"
      size="medium"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Información de Acceso">
          <div className="space-y-2 p-4 bg-neutral-bg rounded-lg border border-neutral-border">
            <p className="text-sm text-text-secondary">
              <strong>Usuario:</strong> @{tecnico.username}
            </p>
            <p className="text-xs text-text-tertiary">
              El nombre de usuario no se puede modificar
            </p>
          </div>

          <FormField label="Email" required error={errors.email?.message}>
            <Input
              {...register("email")}
              inputType="email"
              placeholder="juan@example.com"
            />
          </FormField>
        </FormSection>

        <FormSection title="Información Personal">
          <FormField
            label="Nombre Completo"
            required
            error={errors.nombre_completo?.message}
          >
            <Input
              {...register("nombre_completo")}
              placeholder="Juan Pérez García"
            />
          </FormField>

          <FormField
            label="Comunidad Asignada"
            error={errors.id_comunidad?.message}
            helperText="Selecciona la comunidad donde trabajará el técnico"
          >
            <Select
              options={comunidadesOptions}
              value={watch("id_comunidad") || ""}
              onChange={(value) => setValue("id_comunidad", value)}
              placeholder="Selecciona una comunidad"
              searchable
            />
          </FormField>

          <FormField label="Estado">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox {...register("activo")} />
              <span className="text-sm text-text-secondary">
                Técnico activo
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
