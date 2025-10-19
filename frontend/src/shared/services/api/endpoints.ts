/**
 * Endpoints de la API
 * Constantes con todas las rutas del backend organizadas por modulo
 */

export const ENDPOINTS = {
  // Autenticacion
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    REFRESH: "/api/auth/refresh",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
  },

  // Catalogos
  CATALOGOS: {
    TIPOS_CULTIVO: "/api/catalogos/tipos-cultivo",
    TIPOS_CULTIVO_BY_ID: (id: string) => `/api/catalogos/tipos-cultivo/${id}`,
    GESTIONES: "/api/catalogos/gestiones",
    GESTIONES_ACTUAL: "/api/catalogos/gestiones/actual",
    GESTIONES_BY_ID: (id: string) => `/api/catalogos/gestiones/${id}`,
  },

  // Comunidades
  COMUNIDADES: {
    BASE: "/api/comunidades",
    BY_ID: (id: string) => `/api/comunidades/${id}`,
    SIN_TECNICOS: "/api/comunidades/especiales/sin-tecnicos",
  },

  // Geograficas
  GEOGRAFICAS: {
    DEPARTAMENTOS: "/api/geograficas/departamentos",
    DEPARTAMENTOS_BY_ID: (id: string) => `/api/geograficas/departamentos/${id}`,
    PROVINCIAS: "/api/geograficas/provincias",
    PROVINCIAS_BY_ID: (id: string) => `/api/geograficas/provincias/${id}`,
    MUNICIPIOS: "/api/geograficas/municipios",
    MUNICIPIOS_BY_ID: (id: string) => `/api/geograficas/municipios/${id}`,
  },

  // Productores
  PRODUCTORES: {
    BASE: "/api/productores",
    BY_CODIGO: (codigo: string) => `/api/productores/${codigo}`,
    NEARBY: "/api/productores/nearby",
    ESTADISTICAS: "/api/productores/estadisticas",
  },

  // Parcelas
  PARCELAS: {
    BY_ID: (id: string) => `/api/parcelas/${id}`,
    NEARBY: "/api/parcelas/nearby",
    ESTADISTICAS: "/api/parcelas/estadisticas",
    SIN_COORDENADAS: "/api/parcelas/sin-coordenadas",
    BY_PRODUCTOR: (codigoProductor: string) =>
      `/api/productores/${codigoProductor}/parcelas`,
  },

  // Usuarios
  USUARIOS: {
    BASE: "/api/usuarios",
    BY_ID: (id: string) => `/api/usuarios/${id}`,
    BY_COMUNIDAD: (id: string) => `/api/usuarios/comunidad/${id}`,
  },

  // Fichas
  FICHAS: {
    BASE: "/api/fichas",
    BY_ID: (id: string) => `/api/fichas/${id}`,
    ENVIAR_REVISION: (id: string) => `/api/fichas/${id}/enviar-revision`,
    APROBAR: (id: string) => `/api/fichas/${id}/aprobar`,
    RECHAZAR: (id: string) => `/api/fichas/${id}/rechazar`,
    DEVOLVER_BORRADOR: (id: string) => `/api/fichas/${id}/devolver-borrador`,
    ESTADISTICAS: "/api/fichas/estadisticas",
    ARCHIVOS: (id: string) => `/api/fichas/${id}/archivos`,
  },
} as const;
