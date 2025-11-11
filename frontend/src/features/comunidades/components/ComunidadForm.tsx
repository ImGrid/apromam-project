import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Input,
  Select,
  FormField,
  FormSection,
  Checkbox,
  type SelectOption,
} from "@/shared/components/ui";
import { apiClient, ENDPOINTS } from "@/shared/services/api";
import type { Comunidad } from "../types/comunidad.types";
import { logger } from "@/shared/utils/logger";

const comunidadSchema = z.object({
  nombre_comunidad: z.string().min(3, "Mínimo 3 caracteres"),
  abreviatura_comunidad: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(5, "Máximo 5 caracteres")
    .regex(/^[A-Z]+$/, "Solo letras mayúsculas"),
  id_provincia: z.string().min(1, "Selecciona una provincia"),
  id_municipio: z.string().min(1, "Selecciona un municipio"),
  activo: z.boolean().optional(),
});

type ComunidadFormData = z.infer<typeof comunidadSchema>;

interface ComunidadFormProps {
  comunidad?: Comunidad;
  onSubmit: (data: {
    nombre_comunidad: string;
    abreviatura_comunidad: string;
    id_municipio: string;
    activo?: boolean;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ComunidadForm({
  comunidad,
  onSubmit,
  onCancel,
  isLoading = false,
}: ComunidadFormProps) {
  const [provincias, setProvincias] = useState<SelectOption[]>([]);
  const [municipios, setMunicipios] = useState<SelectOption[]>([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

  const isEdit = !!comunidad;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ComunidadFormData>({
    resolver: zodResolver(comunidadSchema),
    defaultValues: comunidad
      ? {
          nombre_comunidad: comunidad.nombre_comunidad,
          abreviatura_comunidad: comunidad.abreviatura_comunidad,
          id_provincia: "",
          id_municipio: comunidad.id_municipio,
          activo: comunidad.activo,
        }
      : {
          activo: true,
        },
  });

  const idProvinciaWatched = watch("id_provincia");

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
      logger.error("Error cargando provincias");
    }
  }, []);

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
      logger.error("Error cargando municipios");
    } finally {
      setLoadingMunicipios(false);
    }
  }, []);

  useEffect(() => {
    loadProvincias();
  }, [loadProvincias]);

  useEffect(() => {
    if (idProvinciaWatched) {
      loadMunicipios(idProvinciaWatched);
      setValue("id_municipio", "");
    } else {
      setMunicipios([]);
    }
  }, [idProvinciaWatched, setValue, loadMunicipios]);

  const handleFormSubmit = async (data: ComunidadFormData) => {
    await onSubmit({
      nombre_comunidad: data.nombre_comunidad,
      abreviatura_comunidad: data.abreviatura_comunidad,
      id_municipio: data.id_municipio,
      ...(isEdit && { activo: data.activo }),
    });
  };

  const handleAbreviaturaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setValue("abreviatura_comunidad", value);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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

        {isEdit && (
          <Checkbox {...register("activo")} label="Comunidad activa" />
        )}
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
        <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading} fullWidth>
          {isEdit ? "Actualizar" : "Crear"} Comunidad
        </Button>
      </div>
    </form>
  );
}
