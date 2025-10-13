import { FormField } from "@/shared/components/ui";
import { ProvinciasSelect } from "./ProvinciasSelect";
import { MunicipiosSelect } from "./MunicipiosSelect";
import { ComunidadesSelect } from "./ComunidadesSelect";

interface CascadeValues {
  provincia_id?: string;
  municipio_id?: string;
  comunidad_id?: string;
}

interface GeograficasCascadeProps {
  values: CascadeValues;
  onChange: (values: CascadeValues) => void;
  errors?: {
    provincia?: string;
    municipio?: string;
    comunidad?: string;
  };
  labels?: {
    provincia?: string;
    municipio?: string;
    comunidad?: string;
  };
  required?: {
    provincia?: boolean;
    municipio?: boolean;
    comunidad?: boolean;
  };
  showComunidad?: boolean;
}

export function GeograficasCascade({
  values,
  onChange,
  errors = {},
  labels = {
    provincia: "Provincia",
    municipio: "Municipio",
    comunidad: "Comunidad",
  },
  required = {
    provincia: true,
    municipio: true,
    comunidad: false,
  },
  showComunidad = false,
}: GeograficasCascadeProps) {
  const handleProvinciaChange = (provincia_id: string) => {
    onChange({
      provincia_id,
      municipio_id: undefined,
      comunidad_id: undefined,
    });
  };

  const handleMunicipioChange = (municipio_id: string) => {
    onChange({
      ...values,
      municipio_id,
      comunidad_id: undefined,
    });
  };

  const handleComunidadChange = (comunidad_id: string) => {
    onChange({
      ...values,
      comunidad_id,
    });
  };

  return (
    <div className="space-y-4">
      <FormField
        label={labels.provincia}
        required={required.provincia}
        error={errors.provincia}
      >
        <ProvinciasSelect
          value={values.provincia_id}
          onChange={handleProvinciaChange}
          error={errors.provincia}
        />
      </FormField>

      <FormField
        label={labels.municipio}
        required={required.municipio}
        error={errors.municipio}
      >
        <MunicipiosSelect
          provinciaId={values.provincia_id}
          value={values.municipio_id}
          onChange={handleMunicipioChange}
          error={errors.municipio}
        />
      </FormField>

      {showComunidad && (
        <FormField
          label={labels.comunidad}
          required={required.comunidad}
          error={errors.comunidad}
        >
          <ComunidadesSelect
            municipioId={values.municipio_id}
            value={values.comunidad_id}
            onChange={handleComunidadChange}
            error={errors.comunidad}
          />
        </FormField>
      )}
    </div>
  );
}
