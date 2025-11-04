// Modal para crear un nuevo técnico
// No pide rol (asume técnico automáticamente)

import { useEffect, useCallback } from "react";
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
  type SelectOption,
} from "@/shared/components/ui";
import { apiClient, ENDPOINTS } from "@/shared/services/api";
import { showToast } from "@/shared/hooks/useToast";
import { useState } from "react";

const tecnicoSchema = z.object({
  username: z
    .string()
    .min(5, "Mínimo 5 caracteres")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_]*$/,
      "Debe empezar con letra y contener solo letras, números y guion bajo"
    ),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  nombre_completo: z.string().min(3, "Mínimo 3 caracteres"),
  id_comunidad: z.string().optional(),
});

type TecnicoFormData = z.infer<typeof tecnicoSchema>;

interface CreateTecnicoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateTecnicoModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTecnicoModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [comunidades, setComunidades] = useState<SelectOption[]>([]);
  const [idRolTecnico, setIdRolTecnico] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<TecnicoFormData>({
    resolver: zodResolver(tecnicoSchema),
  });

  // Cargar comunidades y obtener ID del rol técnico
  const loadData = useCallback(async () => {
    try {
      // Cargar comunidades
      const comunidadesResponse = await apiClient.get<{
        comunidades: Array<{
          id_comunidad: string;
          nombre_comunidad: string;
          nombre_municipio?: string;
        }>;
      }>(ENDPOINTS.COMUNIDADES.BASE);

      setComunidades(
        comunidadesResponse.data.comunidades.map((c) => ({
          value: c.id_comunidad,
          label: c.nombre_municipio
            ? `${c.nombre_comunidad} - ${c.nombre_municipio}`
            : c.nombre_comunidad,
        }))
      );

      // Obtener ID del rol técnico
      const rolesResponse = await apiClient.get<{
        roles: Array<{ id_rol: string; nombre_rol: string }>;
      }>("/api/usuarios/roles");

      const rolTecnico = rolesResponse.data.roles.find(
        (r) => r.nombre_rol.toLowerCase() === "tecnico"
      );

      if (rolTecnico) {
        setIdRolTecnico(rolTecnico.id_rol);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  const onSubmit = async (data: TecnicoFormData) => {
    if (!idRolTecnico) {
      showToast.error("No se pudo obtener el rol de técnico");
      return;
    }

    try {
      setIsLoading(true);

      // Crear usuario con rol de técnico
      await apiClient.post(ENDPOINTS.USUARIOS.BASE, {
        username: data.username,
        email: data.email,
        password: data.password,
        nombre_completo: data.nombre_completo,
        id_rol: idRolTecnico,
        id_comunidad: data.id_comunidad || undefined,
      });

      showToast.success("Técnico creado exitosamente");
      reset();
      onClose();
      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Error al crear técnico";
      showToast.error(errorMessage);
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
      title="Nuevo Técnico"
      size="medium"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Credenciales de Acceso">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Usuario"
              required
              error={errors.username?.message}
            >
              <Input
                {...register("username")}
                placeholder="juanperez (min. 5 caracteres)"
              />
            </FormField>

            <FormField label="Email" required error={errors.email?.message}>
              <Input
                {...register("email")}
                inputType="email"
                placeholder="juan@example.com"
              />
            </FormField>
          </div>

          <FormField
            label="Contraseña"
            required
            error={errors.password?.message}
          >
            <Input
              {...register("password")}
              inputType="password"
              placeholder="Mínimo 8 caracteres (1 mayúscula, 1 minúscula, 1 número)"
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
            label="Comunidad"
            error={errors.id_comunidad?.message}
            helperText="Opcional: La comunidad puede ser asignada después"
          >
            <Select
              options={comunidades}
              value={watch("id_comunidad") || ""}
              onChange={(value) => setValue("id_comunidad", value)}
              placeholder="Selecciona una comunidad (opcional)"
              searchable
            />
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
            Crear Tecnico
          </Button>
        </div>
      </form>
    </Modal>
  );
}
