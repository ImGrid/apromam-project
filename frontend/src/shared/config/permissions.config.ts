/**
 * Matriz de permisos por rol
 * Define capacidades granulares para cada rol del sistema
 */

export type Permission =
  | "all"
  | "read"
  | "create"
  | "edit"
  | "delete"
  | "approve"
  | "reject"
  | "report"
  | "createUser"
  | "createTecnico"
  | "createCatalogo"
  | "createProductor"
  | "editOwn"
  | "readOwn"
  | "limitedToComunidad";

export type RoleName =
  | "administrador"
  | "gerente"
  | "tecnico"
  | "invitado";

export type PermissionsMap = {
  [K in RoleName]: Partial<Record<Permission, boolean>>;
};

export const PERMISSIONS: PermissionsMap = {
  administrador: {
    all: true,
    createCatalogo: true,
    createProductor: true,
  },

  gerente: {
    read: true,
    create: true,
    edit: true,
    delete: true,
    approve: true,
    reject: true,
    createProductor: true,
    createTecnico: true,
  },

  tecnico: {
    read: true,
    create: true,
    editOwn: true,
    limitedToComunidad: true,
    createProductor: true,
  },

  invitado: {
    read: true,
    report: true,
  },
} as const;

// Permisos requeridos por recurso
export const RESOURCE_PERMISSIONS = {
  usuarios: {
    create: ["createUser", "all"],
    edit: ["all"],
    delete: ["all"],
    read: ["read", "all"],
  },
  tecnicos: {
    create: ["createTecnico", "all"],
  },
  comunidades: {
    create: ["create", "all"],
    edit: ["edit", "all"],
    delete: ["delete", "all"],
    read: ["read", "all"],
  },
  productores: {
    create: ["create", "createProductor", "all"],
    edit: ["edit", "editOwn", "all"],
    delete: ["delete", "all"],
    read: ["read", "readOwn", "all"],
  },
  parcelas: {
    create: ["create", "all"],
    edit: ["edit", "editOwn", "all"],
    delete: ["all"],
    read: ["read", "readOwn", "all"],
  },
  fichas: {
    create: ["create", "all"],
    edit: ["editOwn", "all"],
    delete: ["all"],
    read: ["read", "readOwn", "all"],
    approve: ["approve", "all"],
    reject: ["reject", "all"],
  },
  catalogos: {
    create: ["all"],
    edit: ["all"],
    delete: ["all"],
    read: ["read", "all"],
  },
  geograficas: {
    create: ["create", "all"],
    edit: ["edit", "all"],
    delete: ["delete", "all"],
    read: ["read", "all"],
  },
} as const;

export type ResourceName = keyof typeof RESOURCE_PERMISSIONS;
