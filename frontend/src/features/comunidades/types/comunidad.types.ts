export interface Comunidad {
  id_comunidad: string;
  nombre_comunidad: string;
  abreviatura_comunidad: string;
  id_municipio: string;
  nombre_municipio: string;
  nombre_provincia: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  cantidad_tecnicos?: number;
  cantidad_productores?: number;
}

export interface CreateComunidadInput {
  nombre_comunidad: string;
  abreviatura_comunidad: string;
  id_municipio: string;
}

export interface UpdateComunidadInput {
  nombre_comunidad?: string;
  abreviatura_comunidad?: string;
  activo?: boolean;
}

export interface ComunidadFilters {
  municipio_id?: string;
  provincia_id?: string;
  sin_tecnicos?: boolean;
}
