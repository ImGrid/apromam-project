export interface Departamento {
  id_departamento: string;
  nombre_departamento: string;
  activo: boolean;
  created_at: string;
  cantidad_provincias?: number;
  cantidad_municipios?: number;
  cantidad_comunidades?: number;
  cantidad_productores?: number;
}

export interface Provincia {
  id_provincia: string;
  id_departamento: string;
  nombre_provincia: string;
  activo: boolean;
  created_at: string;
  nombre_departamento?: string;
  cantidad_municipios?: number;
  cantidad_comunidades?: number;
  cantidad_productores?: number;
}

export interface Municipio {
  id_municipio: string;
  id_provincia: string;
  nombre_municipio: string;
  nombre_provincia: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  cantidad_comunidades?: number;
  cantidad_productores?: number;
}

export interface CreateDepartamentoInput {
  nombre_departamento: string;
}

export interface UpdateDepartamentoInput {
  nombre_departamento?: string;
  activo?: boolean;
}

export interface CreateProvinciaInput {
  id_departamento: string;
  nombre_provincia: string;
}

export interface UpdateProvinciaInput {
  nombre_provincia?: string;
  activo?: boolean;
}

export interface CreateMunicipioInput {
  nombre_municipio: string;
  id_provincia: string;
}

export interface UpdateMunicipioInput {
  nombre_municipio?: string;
  activo?: boolean;
}
