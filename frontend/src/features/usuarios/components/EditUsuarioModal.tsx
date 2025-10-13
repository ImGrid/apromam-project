import { useEffect, useState } from "react";
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
} from "@/shared/components/ui";
import { useUpdateUsuario } from "../hooks/useUpdateUsuario";
import { apiClient, ENDPOINTS } from "@/shared/services/api";
import type { SelectOption } from "@/shared/components/ui";
import type { Usuario } from "../types/usuario.types";
import { useAuth } from "@/shared/hooks/useAuth";

// Schema de validacion (sin username ni password, son inmutables)
const editUsuarioSchema = z.object({
  email: z.string().email("Email inválido"),
  nombre_completo: z.string().min(3, "Mínimo 3 caracteres"),
  id_comunidad: z.string().optional(),
  activo: z.boolean(),
});

type EditUsuarioFormData = z.infer<typeof editUsuarioSchema>;

interface EditUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: Usuario;
  onSuccess?: () => void;
}

export function EditUsuarioModal({
  isOpen,
  onClose,
  usuario,
  onSuccess,
}: EditUsuarioModalProps) {
  const { user } = useAuth();
  const { updateUsuario, isLoading } = useUpdateUsuario();
  const [comunidades, setComunidades] = useState<SelectOption[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<EditUsuarioFormData>({
    resolver: zodResolver(editUsuarioSchema),
    defaultValues: {
      email: usuario.email,
      nombre_completo: usuario.nombre_completo,
      id_comunidad: usuario.id_comunidad || "",
      activo: usuario.activo,
    },
  });

  // Cargar datos del usuario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      reset({
        email: usuario.email,
        nombre_completo: usuario.nombre_completo,
        id_comunidad: usuario.id_comunidad || "",
        activo: usuario.activo,
      });
      loadComunidades();
    }
  }, [isOpen, usuario, reset]);

  const loadComunidades = async () => {
    try {
      const response = await apiClient.get<{
        comunidades: Array<{ id_comunidad: string; nombre_comunidad: string }>;
      }>(ENDPOINTS.COMUNIDADES.BASE);

      setComunidades(
        response.data.comunidades.map((c) => ({
          value: c.id_comunidad,
          label: c.nombre_comunidad,
        }))
      );
    } catch (error) {
      console.error("Error cargando comunidades:", error);
    }
  };

  const onSubmit = async (data: EditUsuarioFormData) => {
    try {
      await updateUsuario(usuario.id_usuario, {
        email: data.email,
        nombre_completo: data.nombre_completo,
        id_comunidad: data.id_comunidad || null,
        activo: data.activo,
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

  const isTecnico = usuario.nombre_rol.toLowerCase() === "técnico";
  const isAdmin = user?.nombre_rol.toLowerCase() === "administrador";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Usuario"
      size="medium"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Info no editable */}
        <div className="p-4 rounded-lg bg-neutral-bg">
          <p className="text-sm text-text-secondary">
            <span className="font-medium">Usuario:</span> {usuario.username}
          </p>
          <p className="text-sm text-text-secondary">
            <span className="font-medium">Rol:</span> {usuario.nombre_rol}
          </p>
          <p className="mt-2 text-xs text-text-secondary">
            El usuario y el rol no se pueden modificar
          </p>
        </div>

        <FormSection title="Información Personal">
          <FormField label="Email" required error={errors.email?.message}>
            <Input {...register("email")} inputType="email" />
          </FormField>

          <FormField
            label="Nombre Completo"
            required
            error={errors.nombre_completo?.message}
          >
            <Input {...register("nombre_completo")} />
          </FormField>

          {isTecnico && (
            <FormField
              label="Comunidad"
              error={errors.id_comunidad?.message}
              helperText="Los técnicos deben tener una comunidad asignada"
            >
              <Select
                options={comunidades}
                value={watch("id_comunidad") || ""}
                onChange={(value) => setValue("id_comunidad", value)}
                placeholder="Selecciona una comunidad"
                searchable
              />
            </FormField>
          )}

          {isAdmin && (
            <FormField label="Estado del usuario">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("activo")}
                  className="w-5 h-5 border rounded cursor-pointer text-primary border-neutral-border focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-text-primary">
                  Usuario activo
                </span>
              </label>
            </FormField>
          )}
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
