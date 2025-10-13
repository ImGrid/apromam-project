/**
 * Routes Configuration
 * Definicion centralizada de todas las rutas de la aplicacion
 */

export const ROUTES = {
  // Rutas publicas
  LOGIN: "/login",
  UNAUTHORIZED: "/unauthorized",
  NOT_FOUND: "/404",

  // Ruta raiz
  ROOT: "/",

  // Dashboard
  DASHBOARD: "/dashboard",
  REPORTES: "/reportes",
  PERFIL: "/perfil",

  // Usuarios
  USUARIOS: "/usuarios",
  USUARIOS_CREATE: "/usuarios/crear",
  USUARIOS_EDIT: (id: string) => `/usuarios/${id}/editar`,
  USUARIOS_DETAIL: (id: string) => `/usuarios/${id}`,

  // Comunidades
  COMUNIDADES: "/comunidades",
  COMUNIDADES_CREATE: "/comunidades/crear",
  COMUNIDADES_EDIT: (id: string) => `/comunidades/${id}/editar`,

  // Geograficas
  GEOGRAFICAS: "/geograficas",
  PROVINCIAS: "/geograficas/provincias",
  MUNICIPIOS: "/geograficas/municipios",

  // Catalogos
  CATALOGOS: "/catalogos",
  TIPOS_CULTIVO: "/catalogos/tipos-cultivo",
  GESTIONES: "/catalogos/gestiones",

  // Productores
  PRODUCTORES: "/productores",
  PRODUCTORES_CREATE: "/productores/crear",
  PRODUCTORES_EDIT: (codigo: string) => `/productores/${codigo}/editar`,
  PRODUCTORES_DETAIL: (codigo: string) => `/productores/${codigo}`,

  // Parcelas
  PARCELAS: "/parcelas",
  PARCELAS_BY_PRODUCTOR: (codigo: string) => `/productores/${codigo}/parcelas`,

  // Fichas
  FICHAS: "/fichas",
  FICHAS_CREATE: "/fichas/crear",
  FICHAS_EDIT: (id: string) => `/fichas/${id}/editar`,
  FICHAS_DETAIL: (id: string) => `/fichas/${id}`,
} as const;
