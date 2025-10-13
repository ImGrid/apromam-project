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
  type SelectOption,
} from "@/shared/components/ui";
import { useCreateUsuario } from "../hooks/useCreateUsuario";
import { useAuth } from "@/shared/hooks/useAuth";
import { apiClient, ENDPOINTS } from "@/shared/services/api";

const usuarioSchema = z
  .object({
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
    id_rol: z.string().min(1, "Selecciona un rol"),
    id_comunidad: z.string().optional(),
  })
  .refine(
    (data) => {
      // La validacion de comunidad se hace en el backend
      return true;
    },
    {
      message: "Técnico debe tener comunidad asignada",
    }
  );

type UsuarioFormData = z.infer<typeof usuarioSchema>;

interface CreateUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateUsuarioModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateUsuarioModalProps) {
  const { user } = useAuth();
  const { createUsuario, isLoading } = useCreateUsuario();
  const [roles, setRoles] = useState<SelectOption[]>([]);
  const [comunidades, setComunidades] = useState<SelectOption[]>([]);
  const [selectedRolNombre, setSelectedRolNombre] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
  });

  const idRolWatched = watch("id_rol");

  // Cargar roles al abrir modal
  useEffect(() => {
    if (isOpen) {
      loadRoles();
      loadComunidades();
    }
  }, [isOpen]);

  // Detectar si rol seleccionado es técnico
  useEffect(() => {
    if (idRolWatched) {
      const rol = roles.find((r) => r.value === idRolWatched);
      setSelectedRolNombre(rol?.label.toLowerCase() || "");
    }
  }, [idRolWatched, roles]);

  const loadRoles = async () => {
    try {
      const response = await apiClient.get<{
        roles: Array<{ id_rol: string; nombre_rol: string }>;
      }>("/api/usuarios/roles");

      const rolesOptions = response.data.roles.map((rol) => ({
        value: rol.id_rol,
        label: rol.nombre_rol,
      }));

      // Si es gerente, NO mostrar administrador ni gerente
      if (user?.nombre_rol.toLowerCase() === "gerente") {
        setRoles(
          rolesOptions.filter(
            (r) =>
              r.label.toLowerCase() !== "administrador" &&
              r.label.toLowerCase() !== "gerente"
          )
        );
      } else {
        setRoles(rolesOptions);
      }
    } catch (error) {
      // Si falla, usar roles hardcodeados
      const defaultRoles = [
        { value: "1", label: "Administrador" },
        { value: "2", label: "Gerente" },
        { value: "3", label: "Técnico" },
        { value: "4", label: "Productor" },
        { value: "5", label: "Invitado" },
      ];

      if (user?.nombre_rol.toLowerCase() === "gerente") {
        setRoles(
          defaultRoles.filter(
            (r) =>
              r.label.toLowerCase() !== "administrador" &&
              r.label.toLowerCase() !== "gerente"
          )
        );
      } else {
        setRoles(defaultRoles);
      }
    }
  };

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

  const onSubmit = async (data: UsuarioFormData) => {
    try {
      await createUsuario({
        ...data,
        id_comunidad: data.id_comunidad || undefined,
      });

      reset();
      onClose();
      onSuccess?.();
    } catch (error) {
      // Error ya manejado por el hook
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isTecnico = selectedRolNombre === "técnico";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nuevo Usuario"
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

          <FormField label="Rol" required error={errors.id_rol?.message}>
            <Select
              options={roles}
              value={idRolWatched || ""}
              onChange={(value) => setValue("id_rol", value)}
              placeholder="Selecciona un rol"
            />
          </FormField>

          {isTecnico && (
            <FormField
              label="Comunidad"
              required
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
            Crear Usuario
          </Button>
        </div>
      </form>
    </Modal>
  );
}
