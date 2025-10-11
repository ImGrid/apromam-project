import { useState, useEffect, useCallback } from "react";
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
import { useCreateComunidad } from "../hooks/useCreateComunidad";
import { apiClient, ENDPOINTS } from "@/shared/services/api";

// Schema de validacion
const comunidadSchema = z.object({
  nombre_comunidad: z.string().min(3, "Mínimo 3 caracteres"),
  abreviatura_comunidad: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(5, "Máximo 5 caracteres")
    .regex(/^[A-Z]+$/, "Solo letras mayúsculas"),
  id_provincia: z.string().min(1, "Selecciona una provincia"),
  id_municipio: z.string().min(1, "Selecciona un municipio"),
});

type ComunidadFormData = z.infer<typeof comunidadSchema>;

interface CreateComunidadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateComunidadModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateComunidadModalProps) {
  const { createComunidad, isLoading } = useCreateComunidad();
  const [provincias, setProvincias] = useState<SelectOption[]>([]);
  const [municipios, setMunicipios] = useState<SelectOption[]>([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<ComunidadFormData>({
    resolver: zodResolver(comunidadSchema),
  });

  const idProvinciaWatched = watch("id_provincia");

  // Cargar provincias - memoizado para evitar recreacion
  const loadProvincias = useCallback(async () => {
    try {
      const response = await apiClient.get<{
        provincias: Array<{ id_provincia: string; nombre_provincia: string }>;
      }>(ENDPOINTS.GEOGRAFICAS.PROVINCIAS);

      setProvincias(
        response.data.provincias.map((p) => ({
          value: p.id_provincia,
          label: p.nombre_provincia,
        }))
      );
    } catch {
      console.error("Error cargando provincias");
    }
  }, []);

  // Cargar municipios
  const loadMunicipios = useCallback(async (provinciaId: string) => {
    setLoadingMunicipios(true);
    try {
      const response = await apiClient.get<{
        municipios: Array<{ id_municipio: string; nombre_municipio: string }>;
      }>(`${ENDPOINTS.GEOGRAFICAS.MUNICIPIOS}?provincia_id=${provinciaId}`);

      setMunicipios(
        response.data.municipios.map((m) => ({
          value: m.id_municipio,
          label: m.nombre_municipio,
        }))
      );
    } catch {
      console.error("Error cargando municipios");
    } finally {
      setLoadingMunicipios(false);
    }
  }, []);

  // Cargar provincias al abrir modal
  useEffect(() => {
    if (isOpen) {
      loadProvincias();
    }
  }, [isOpen, loadProvincias]);

  // Cargar municipios cuando cambia la provincia
  useEffect(() => {
    if (idProvinciaWatched) {
      loadMunicipios(idProvinciaWatched);
      // Limpiar municipio seleccionado al cambiar provincia
      setValue("id_municipio", "");
    } else {
      setMunicipios([]);
    }
  }, [idProvinciaWatched, setValue, loadMunicipios]);

  const onSubmit = async (data: ComunidadFormData) => {
    try {
      // Solo enviamos id_municipio al backend
      await createComunidad({
        nombre_comunidad: data.nombre_comunidad,
        abreviatura_comunidad: data.abreviatura_comunidad,
        id_municipio: data.id_municipio,
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
    setMunicipios([]);
    onClose();
  };

  // Transformar input a mayusculas para abreviatura
  const handleAbreviaturaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setValue("abreviatura_comunidad", value);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nueva Comunidad"
      size="medium"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Información de la Comunidad">
          <FormField
            label="Nombre de la Comunidad"
            required
            error={errors.nombre_comunidad?.message}
          >
            <Input
              {...register("nombre_comunidad")}
              placeholder="Ej: Villa San Pedro"
            />
          </FormField>

          <FormField
            label="Abreviatura"
            required
            error={errors.abreviatura_comunidad?.message}
            helperText="2-5 letras mayúsculas, debe ser única"
          >
            <Input
              {...register("abreviatura_comunidad")}
              onChange={handleAbreviaturaChange}
              maxLength={5}
              placeholder="Ej: VSP"
            />
          </FormField>
        </FormSection>

        <FormSection title="Ubicación Geográfica">
          <FormField
            label="Provincia"
            required
            error={errors.id_provincia?.message}
          >
            <Select
              options={provincias}
              value={watch("id_provincia") || ""}
              onChange={(value) => setValue("id_provincia", value)}
              placeholder="Selecciona una provincia"
            />
          </FormField>

          <FormField
            label="Municipio"
            required
            error={errors.id_municipio?.message}
          >
            <Select
              options={municipios}
              value={watch("id_municipio") || ""}
              onChange={(value) => setValue("id_municipio", value)}
              placeholder={
                loadingMunicipios
                  ? "Cargando municipios..."
                  : idProvinciaWatched
                  ? "Selecciona un municipio"
                  : "Primero selecciona una provincia"
              }
              disabled={!idProvinciaWatched || loadingMunicipios}
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
            Crear Comunidad
          </Button>
        </div>
      </form>
    </Modal>
  );
}
